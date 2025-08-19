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

exports.sendOnboardingInvitation = async (email, temporaryPassword, personalEmail) => {
  const subject = 'Welcome to HRMS - Complete Your Onboarding';
  const text = `
    Welcome to our company!
    
    Your HR team has initiated your onboarding process.
    
    Please use the following credentials to log in and complete your onboarding:
    
    Login URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/login
    Official Email: ${email}
    Temporary Password: ${temporaryPassword}
    
    This invitation will expire in 7 days.
    
    Please log in and complete your profile information.
    
    Best regards,
    HR Team
  `;
  
  return await exports.sendEmail({
    to: personalEmail,
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
