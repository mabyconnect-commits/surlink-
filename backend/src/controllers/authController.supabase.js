const { supabaseAdmin } = require('../config/supabase');
const bcrypt = require('bcryptjs');
const { sendTokenResponse } = require('../utils/jwt');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/email');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, referralCode } = req.body;

    // Check if user exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .or(`email.eq.${email},phone.eq.${phone}`)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert([{
        name,
        email,
        phone,
        password_hash,
        role: role || 'customer'
      }])
      .select()
      .single();

    if (userError) throw userError;

    // Handle referral
    if (referralCode) {
      const { data: referrer } = await supabaseAdmin
        .from('users')
        .select('id, referred_by_id')
        .eq('referral_code', referralCode.toUpperCase())
        .single();

      if (referrer) {
        // Create level 1 referral
        await supabaseAdmin
          .from('referrals')
          .insert([{
            referrer_id: referrer.id,
            referred_id: user.id,
            level: 1
          }]);

        // Update user's referredBy
        await supabaseAdmin
          .from('users')
          .update({
            referred_by_id: referrer.id,
            referral_level: 1
          })
          .eq('id', user.id);

        // Create level 2 referral if referrer was also referred
        if (referrer.referred_by_id) {
          await supabaseAdmin
            .from('referrals')
            .insert([{
              referrer_id: referrer.referred_by_id,
              referred_id: user.id,
              level: 2
            }]);

          // Create level 3 referral
          const { data: level2Referrer } = await supabaseAdmin
            .from('users')
            .select('referred_by_id')
            .eq('id', referrer.referred_by_id)
            .single();

          if (level2Referrer && level2Referrer.referred_by_id) {
            await supabaseAdmin
              .from('referrals')
              .insert([{
                referrer_id: level2Referrer.referred_by_id,
                referred_id: user.id,
                level: 3
              }]);
          }
        }
      }
    }

    // Remove password_hash from response
    delete user.password_hash;

    // Send welcome email
    await sendWelcomeEmail(user);

    // Send token response
    sendTokenResponse(user, 201, res, 'Registration successful');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during registration',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await supabaseAdmin
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Remove password_hash from response
    delete user.password_hash;

    // Send token response
    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    // Remove password_hash
    delete user.password_hash;

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      bio: req.body.bio,
      address: req.body.address,
      state: req.body.state,
      lga: req.body.lga
    };

    // Provider-specific fields
    if (req.user.role === 'provider') {
      if (req.body.services) fieldsToUpdate.services = req.body.services;
      if (req.body.experience) fieldsToUpdate.experience = req.body.experience;
      if (req.body.availability) {
        fieldsToUpdate.working_days = req.body.availability.workingDays;
        fieldsToUpdate.working_hours_start = req.body.availability.workingHours?.start;
        fieldsToUpdate.working_hours_end = req.body.availability.workingHours?.end;
      }
    }

    // Remove undefined values
    Object.keys(fieldsToUpdate).forEach(key => {
      if (fieldsToUpdate[key] === undefined) {
        delete fieldsToUpdate[key];
      }
    });

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update(fieldsToUpdate)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    delete user.password_hash;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide old and new password'
      });
    }

    // Get user with password
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('password_hash')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Old password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    // Update password
    await supabaseAdmin
      .from('users')
      .update({ password_hash })
      .eq('id', req.user.id);

    // Get updated user
    const { data: updatedUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    delete updatedUser.password_hash;

    sendTokenResponse(updatedUser, 200, res, 'Password updated successfully');
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating password',
      error: error.message
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', req.body.email)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token
    const reset_password_token = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire (10 minutes)
    const reset_password_expire = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await supabaseAdmin
      .from('users')
      .update({
        reset_password_token,
        reset_password_expire
      })
      .eq('id', user.id);

    // Create reset url
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendPasswordResetEmail(user, resetUrl);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);

    res.status(500).json({
      success: false,
      message: 'Email could not be sent',
      error: error.message
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const reset_password_token = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('reset_password_token', reset_password_token)
      .gt('reset_password_expire', new Date().toISOString())
      .single();

    if (error || !user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(req.body.password, salt);

    // Update password and clear reset fields
    await supabaseAdmin
      .from('users')
      .update({
        password_hash,
        reset_password_token: null,
        reset_password_expire: null
      })
      .eq('id', user.id);

    // Get updated user
    const { data: updatedUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    delete updatedUser.password_hash;

    sendTokenResponse(updatedUser, 200, res, 'Password reset successful');
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
};

// @desc    Update settings
// @route   PUT /api/auth/settings
// @access  Private
exports.updateSettings = async (req, res, next) => {
  try {
    const { notifications, theme, language } = req.body;

    const updateFields = {};

    if (notifications) {
      if (notifications.email !== undefined) updateFields.settings_notifications_email = notifications.email;
      if (notifications.push !== undefined) updateFields.settings_notifications_push = notifications.push;
      if (notifications.sms !== undefined) updateFields.settings_notifications_sms = notifications.sms;
      if (notifications.bookingUpdates !== undefined) updateFields.settings_notifications_booking_updates = notifications.bookingUpdates;
      if (notifications.messages !== undefined) updateFields.settings_notifications_messages = notifications.messages;
      if (notifications.promotions !== undefined) updateFields.settings_notifications_promotions = notifications.promotions;
    }

    if (theme) updateFields.settings_theme = theme;
    if (language) updateFields.settings_language = language;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update(updateFields)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    delete user.password_hash;

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message
    });
  }
};
