// Email utility - placeholder for email functionality
// In production, integrate with services like SendGrid, AWS SES, etc.

exports.sendEmail = async (options) => {
  // For development, just log the email
  console.log('Email would be sent:', {
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  });

  return true;
};

exports.sendOnboardingInvitation = async (user, personalEmail, invitationUrl) => {
  console.log('Invitation URL:', invitationUrl);
  const subject = 'Welcome to HRMS - Complete Your Onboarding';
  const text = `
    Welcome to our company!
    
    Your HR team has initiated your onboarding process.
    
    Please click the link below to complete your onboarding:
    
    ${invitationUrl}
    
    Mobile Number: ${user.mobileNumber}
    
    ${user.inviteExpiryTime ? `This invitation will expire on: ${new Date(user.inviteExpiryTime).toLocaleDateString()}` : 'This invitation will expire in 7 days.'}
    
    Please complete your profile information and upload required documents.
    
    Best regards,
    HR Team
  `;

  return await exports.sendEmail({
    to: personalEmail,
    subject,
    text
  });
};

exports.sendOnboardingSubmittedNotification = async (user) => {
  const subject = 'New Onboarding Submission - Action Required';
  const text = `
    A new employee has submitted their onboarding documents for review.
    
    Employee Details:
    Name: ${user.fullName.first} ${user.fullName.last}
    Mobile: ${user.mobileNumber}
    Personal Email: ${user.personalEmail}
    
    Please review the submission in the HRMS portal.
    
    Best regards,
    HRMS System
  `;

  // Send to HR/Admin users (you might want to implement this differently)
  return await exports.sendEmail({
    to: process.env.HR_EMAIL || 'hr@company.com',
    subject,
    text
  });
};

exports.sendOnboardingApprovedNotification = async (user) => {
  const subject = 'Onboarding Approved - Set Your Password';
  const text = `
    Congratulations! Your onboarding has been approved.
    
    You can now log in with your official email and set your password.
    
    ${user.email ? `
    Official Email: ${user.email}
    Login URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/login
    ` : 'Please contact HR to get your official email credentials.'}
    
    Best regards,
    HR Team
  `;

  return await exports.sendEmail({
    to: user.personalEmail,
    subject,
    text
  });
};

exports.sendOnboardingRejectedNotification = async (user, comments) => {
  const subject = 'Onboarding Documents Need Revision';
  const text = `
    Your onboarding documents have been reviewed and require some revisions.
    
    Feedback: ${comments || 'Please review and resubmit your documents.'}
    
    Please log in again and update your documents accordingly.
    
    Best regards,
    HR Team
  `;

  return await exports.sendEmail({
    to: user.personalEmail,
    subject,
    text
  });
};

exports.sendLeaveStatusUpdate = async (email, leaveDetails, status) => {
  const subject = `Leave Request ${status}`;
  const text = `
    Your leave request has been ${status}.
    
    Leave Details:
    Type: ${leaveDetails.leaveType}
    From: ${new Date(leaveDetails.startDate).toLocaleDateString()}
    To: ${new Date(leaveDetails.endDate).toLocaleDateString()}
    Number of days: ${leaveDetails.numberOfDays}
    
    ${status === 'rejected' ? `Reason: ${leaveDetails.rejectionReason}` : ''}
    
    Best regards,
    HR Team
  `;

  return await exports.sendEmail({
    to: email,
    subject,
    text
  });
};

exports.sendTicketUpdate = async (email, ticket, update) => {
  const subject = `Ticket #${ticket.ticketNumber} - ${update}`;
  const text = `
    Your ticket has been updated.
    
    Ticket Details:
    Ticket Number: ${ticket.ticketNumber}
    Subject: ${ticket.subject}
    Status: ${ticket.status}
    
    Update: ${update}
    
    You can view your ticket details in the HRMS portal.
    
    Best regards,
    Support Team
  `;

  return await exports.sendEmail({
    to: email,
    subject,
    text
  });
};
