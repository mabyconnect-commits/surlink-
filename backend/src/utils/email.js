const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

// Send email
exports.sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      html: options.html || options.message
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email
exports.sendWelcomeEmail = async (user) => {
  const html = `
    <h1>Welcome to Surlink!</h1>
    <p>Hi ${user.name},</p>
    <p>Thank you for joining Surlink, Nigeria's trusted service marketplace.</p>
    <p>Your referral code: <strong>${user.referralCode}</strong></p>
    <p>Share this code with friends and earn rewards!</p>
    <br>
    <p>Get started by ${user.role === 'provider' ? 'completing your KYC verification' : 'browsing services'} on our platform.</p>
    <p>Best regards,<br>The Surlink Team</p>
  `;

  return await this.sendEmail({
    email: user.email,
    subject: 'Welcome to Surlink!',
    html
  });
};

// Send booking notification
exports.sendBookingNotification = async (booking, type) => {
  // type: 'new', 'accepted', 'completed', 'cancelled'
  const { customer, provider } = booking;

  let subject, html;

  switch (type) {
    case 'new':
      subject = 'New Booking Request';
      html = `<h2>New Booking Request</h2><p>You have a new booking request from ${customer.name}.</p>`;
      await this.sendEmail({ email: provider.email, subject, html });
      break;

    case 'accepted':
      subject = 'Booking Confirmed';
      html = `<h2>Booking Confirmed!</h2><p>${provider.name} has accepted your booking request.</p>`;
      await this.sendEmail({ email: customer.email, subject, html });
      break;

    case 'completed':
      subject = 'Booking Completed';
      html = `<h2>Booking Completed</h2><p>Your booking has been completed. Please leave a review!</p>`;
      await this.sendEmail({ email: customer.email, subject, html });
      break;

    case 'cancelled':
      subject = 'Booking Cancelled';
      html = `<h2>Booking Cancelled</h2><p>Your booking has been cancelled.</p>`;
      await this.sendEmail({ email: customer.email, subject, html });
      await this.sendEmail({ email: provider.email, subject, html });
      break;
  }
};

// Send KYC status update
exports.sendKYCStatusEmail = async (user, status, reason = null) => {
  let subject, html;

  if (status === 'verified') {
    subject = 'KYC Verification Approved';
    html = `
      <h2>Congratulations!</h2>
      <p>Your KYC verification has been approved. You can now start offering services on Surlink.</p>
    `;
  } else if (status === 'rejected') {
    subject = 'KYC Verification Rejected';
    html = `
      <h2>KYC Verification Rejected</h2>
      <p>Unfortunately, your KYC verification was rejected.</p>
      <p>Reason: ${reason || 'Please contact support for more information.'}</p>
    `;
  }

  return await this.sendEmail({
    email: user.email,
    subject,
    html
  });
};

// Send withdrawal notification
exports.sendWithdrawalEmail = async (user, withdrawal) => {
  const html = `
    <h2>Withdrawal Request Received</h2>
    <p>Hi ${user.name},</p>
    <p>Your withdrawal request of NGN ${withdrawal.amount.toLocaleString()} has been received.</p>
    <p>Reference: ${withdrawal.reference}</p>
    <p>It will be processed within 24 hours.</p>
  `;

  return await this.sendEmail({
    email: user.email,
    subject: 'Withdrawal Request Received',
    html
  });
};

// Send password reset email
exports.sendPasswordResetEmail = async (user, resetUrl) => {
  const html = `
    <h2>Password Reset Request</h2>
    <p>Hi ${user.name},</p>
    <p>You requested to reset your password. Click the link below:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>This link expires in 10 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  return await this.sendEmail({
    email: user.email,
    subject: 'Password Reset Request',
    html
  });
};
