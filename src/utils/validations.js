// Validation utilities for the delivery management app

/**
 * Validates Tunisian phone number format
 * Expected format: 8 digits (without +216)
 * @param {string} phone - Phone number to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateTunisianPhone = (phone) => {
  // Remove spaces and any non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (!cleanPhone) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  if (cleanPhone.length !== 8) {
    return { isValid: false, error: 'Phone number must be exactly 8 digits' };
  }
  
  // Check if it starts with valid Tunisian mobile prefixes (2, 5, 9) or landline (7, 3)
  const validPrefixes = ['2', '3', '5', '7', '9'];
  if (!validPrefixes.includes(cleanPhone[0])) {
    return { isValid: false, error: 'Invalid phone number prefix' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Formats phone number for display with +216 prefix
 * @param {string} phone - 8-digit phone number
 * @returns {string} - Formatted phone number
 */
export const formatTunisianPhone = (phone) => {
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 8) {
    return `+216 ${cleanPhone.slice(0, 2)} ${cleanPhone.slice(2, 5)} ${cleanPhone.slice(5)}`;
  }
  return phone;
};

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format (must contain @ and .)' };
  }
  
  // Additional checks
  if (email.length > 254) {
    return { isValid: false, error: 'Email is too long' };
  }
  
  const parts = email.split('@');
  if (parts[0].length > 64) {
    return { isValid: false, error: 'Email username is too long' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Generates a unique delivery reference number
 * Format: DLV-YYYYMMDD-XXXX (where XXXX is a random 4-digit number)
 * @returns {string} - Unique reference number
 */
export const generateDeliveryReference = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  
  return `DLV-${year}${month}${day}-${random}`;
};

/**
 * Validates if a string is not empty
 * @param {string} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateRequired = (value, fieldName) => {
  if (!value || value.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true, error: null };
};

/**
 * Validates price/number format
 * @param {string|number} value - Value to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validatePrice = (value) => {
  if (value === '' || value === null || value === undefined) {
    return { isValid: false, error: 'Price is required' };
  }
  
  const numValue = Number(value);
  
  if (isNaN(numValue)) {
    return { isValid: false, error: 'Price must be a valid number' };
  }
  
  if (numValue < 0) {
    return { isValid: false, error: 'Price cannot be negative' };
  }
  
  return { isValid: true, error: null };
};
