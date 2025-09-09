// User roles
export const ROLES = {
  ADMIN: 'ADMIN',
  HR: 'HR',
  EMPLOYEE: 'EMPLOYEE'
};

// Role display names
export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.HR]: 'Human Resources',
  [ROLES.EMPLOYEE]: 'Employee'
};

// Role colors for badges
export const ROLE_COLORS = {
  [ROLES.ADMIN]: 'purple',
  [ROLES.HR]: 'blue',
  [ROLES.EMPLOYEE]: 'green'
};

// Check if user has admin role
export const isAdmin = (role) => role === ROLES.ADMIN;

// Check if user has HR role
export const isHR = (role) => role === ROLES.HR;

// Check if user has employee role
export const isEmployee = (role) => role === ROLES.EMPLOYEE;

// Check if user has any of the specified roles
export const hasRole = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};

// Get all roles
export const getAllRoles = () => Object.values(ROLES);

// Get role options for select fields
export const getRoleOptions = () => {
  return Object.entries(ROLE_LABELS).map(([value, label]) => ({
    value,
    label
  }));
};
