// User status
export const USER_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED'
};

// Onboarding status
export const ONBOARDING_STATUS = {
  INVITED: 'INVITED',
  PENDING: 'PENDING',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED'
};

// Leave status
export const LEAVE_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
};

// Ticket status
export const TICKET_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED'
};

// Ticket priority
export const TICKET_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

// Ticket category
export const TICKET_CATEGORY = {
  IT: 'IT',
  HR: 'HR',
  FINANCE: 'FINANCE',
  ADMIN: 'ADMIN',
  OTHER: 'OTHER'
};

// Status display names
export const STATUS_LABELS = {
  // User status
  [USER_STATUS.DRAFT]: 'Draft',
  [USER_STATUS.ACTIVE]: 'Active',
  [USER_STATUS.INACTIVE]: 'Inactive',
  [USER_STATUS.DELETED]: 'Deleted',
  
  // Onboarding status
  [ONBOARDING_STATUS.INVITED]: 'Invited',
  [ONBOARDING_STATUS.PENDING]: 'Pending',
  [ONBOARDING_STATUS.SUBMITTED]: 'Submitted',
  [ONBOARDING_STATUS.APPROVED]: 'Approved',
  [ONBOARDING_STATUS.REJECTED]: 'Rejected',
  [ONBOARDING_STATUS.COMPLETED]: 'Completed',
  
  // Leave status
  [LEAVE_STATUS.PENDING]: 'Pending',
  [LEAVE_STATUS.APPROVED]: 'Approved',
  [LEAVE_STATUS.REJECTED]: 'Rejected',
  [LEAVE_STATUS.CANCELLED]: 'Cancelled',
  
  // Ticket status
  [TICKET_STATUS.OPEN]: 'Open',
  [TICKET_STATUS.IN_PROGRESS]: 'In Progress',
  [TICKET_STATUS.RESOLVED]: 'Resolved',
  [TICKET_STATUS.CLOSED]: 'Closed',
  [TICKET_STATUS.CANCELLED]: 'Cancelled'
};

// Status colors for badges
export const STATUS_COLORS = {
  // User status
  [USER_STATUS.DRAFT]: 'gray',
  [USER_STATUS.ACTIVE]: 'green',
  [USER_STATUS.INACTIVE]: 'red',
  [USER_STATUS.DELETED]: 'gray',
  
  // Onboarding status
  [ONBOARDING_STATUS.INVITED]: 'blue',
  [ONBOARDING_STATUS.PENDING]: 'yellow',
  [ONBOARDING_STATUS.SUBMITTED]: 'blue',
  [ONBOARDING_STATUS.APPROVED]: 'green',
  [ONBOARDING_STATUS.REJECTED]: 'red',
  [ONBOARDING_STATUS.COMPLETED]: 'green',
  
  // Leave status
  [LEAVE_STATUS.PENDING]: 'yellow',
  [LEAVE_STATUS.APPROVED]: 'green',
  [LEAVE_STATUS.REJECTED]: 'red',
  [LEAVE_STATUS.CANCELLED]: 'gray',
  
  // Ticket status
  [TICKET_STATUS.OPEN]: 'blue',
  [TICKET_STATUS.IN_PROGRESS]: 'yellow',
  [TICKET_STATUS.RESOLVED]: 'green',
  [TICKET_STATUS.CLOSED]: 'gray',
  [TICKET_STATUS.CANCELLED]: 'red'
};

// Get status options for select fields
export const getStatusOptions = (statusType) => {
  let statuses = [];
  
  switch (statusType) {
    case 'user':
      statuses = Object.values(USER_STATUS);
      break;
    case 'onboarding':
      statuses = Object.values(ONBOARDING_STATUS);
      break;
    case 'leave':
      statuses = Object.values(LEAVE_STATUS);
      break;
    case 'ticket':
      statuses = Object.values(TICKET_STATUS);
      break;
    default:
      statuses = Object.values(USER_STATUS);
  }
  
  return statuses.map(status => ({
    value: status,
    label: STATUS_LABELS[status] || status
  }));
};
