const { supabase } = require('../config/supabase');

/**
 * @desc    Submit KYC documents
 * @route   POST /api/kyc/submit
 * @access  Private
 */
exports.submitKYC = async (req, res) => {
  try {
    const { document_type, document_number, document_url, selfie_url } = req.body;

    // Validate required fields
    if (!document_type || !document_number || !document_url) {
      return res.status(400).json({
        success: false,
        message: 'Document type, number, and document URL are required'
      });
    }

    // Check if user already has pending/approved KYC
    const { data: existing } = await supabase
      .from('kyc_documents')
      .select('*')
      .eq('user_id', req.user.id)
      .in('status', ['pending', 'approved'])
      .single();

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `You already have a ${existing.status} KYC submission`
      });
    }

    // Create KYC submission
    const { data: kyc, error } = await supabase
      .from('kyc_documents')
      .insert([{
        user_id: req.user.id,
        document_type,
        document_number,
        document_url,
        selfie_url: selfie_url || null,
        status: 'pending'
      }])
      .select('*')
      .single();

    if (error) {
      console.error('Submit KYC error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit KYC documents',
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'KYC documents submitted successfully. Verification usually takes 24-48 hours.',
      data: kyc
    });
  } catch (error) {
    console.error('Submit KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting KYC documents',
      error: error.message
    });
  }
};

/**
 * @desc    Get KYC status
 * @route   GET /api/kyc/status
 * @access  Private
 */
exports.getKYCStatus = async (req, res) => {
  try {
    const { data: kyc, error } = await supabase
      .from('kyc_documents')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // Not "no rows returned" error
      console.error('Get KYC status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch KYC status',
        error: error.message
      });
    }

    if (!kyc) {
      return res.status(200).json({
        success: true,
        message: 'No KYC submission found',
        data: {
          status: 'not_submitted',
          kyc_verified: false
        }
      });
    }

    res.status(200).json({
      success: true,
      data: kyc
    });
  } catch (error) {
    console.error('Get KYC status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching KYC status',
      error: error.message
    });
  }
};

/**
 * @desc    Update KYC status (Admin only)
 * @route   PUT /api/kyc/:id/status
 * @access  Private/Admin
 */
exports.updateKYCStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either approved or rejected'
      });
    }

    if (status === 'rejected' && !rejection_reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required when rejecting KYC'
      });
    }

    // Get KYC document
    const { data: kyc, error: fetchError } = await supabase
      .from('kyc_documents')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !kyc) {
      return res.status(404).json({
        success: false,
        message: 'KYC document not found'
      });
    }

    // Update KYC status
    const updateData = {
      status,
      verified_at: status === 'approved' ? new Date().toISOString() : null,
      verified_by: req.user.id,
      rejection_reason: status === 'rejected' ? rejection_reason : null
    };

    const { data: updated, error } = await supabase
      .from('kyc_documents')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Update KYC status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update KYC status',
        error: error.message
      });
    }

    // Update user's kyc_verified flag
    if (status === 'approved') {
      await supabase
        .from('users')
        .update({ kyc_verified: true })
        .eq('id', kyc.user_id);
    }

    res.status(200).json({
      success: true,
      message: `KYC ${status} successfully`,
      data: updated
    });
  } catch (error) {
    console.error('Update KYC status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating KYC status',
      error: error.message
    });
  }
};

/**
 * @desc    Get all KYC submissions (Admin only)
 * @route   GET /api/kyc/submissions
 * @access  Private/Admin
 */
exports.getKYCSubmissions = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('kyc_documents')
      .select(`
        *,
        user:users(id, name, email, phone, role)
      `, { count: 'exact' });

    // Filter by status if provided
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query
      .range(offset, offset + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get KYC submissions error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch KYC submissions',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      count: data.length,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data
    });
  } catch (error) {
    console.error('Get KYC submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching KYC submissions',
      error: error.message
    });
  }
};

/**
 * @desc    Delete KYC submission
 * @route   DELETE /api/kyc/:id
 * @access  Private
 */
exports.deleteKYC = async (req, res) => {
  try {
    const { id } = req.params;

    // Get KYC document
    const { data: kyc, error: fetchError } = await supabase
      .from('kyc_documents')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !kyc) {
      return res.status(404).json({
        success: false,
        message: 'KYC document not found'
      });
    }

    // Verify ownership (or admin)
    if (kyc.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this KYC submission'
      });
    }

    // Can only delete rejected or pending submissions
    if (kyc.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete approved KYC submission'
      });
    }

    // Delete KYC
    const { error } = await supabase
      .from('kyc_documents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete KYC error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete KYC submission',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'KYC submission deleted successfully'
    });
  } catch (error) {
    console.error('Delete KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting KYC submission',
      error: error.message
    });
  }
};
