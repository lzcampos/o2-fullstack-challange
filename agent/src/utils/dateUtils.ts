/**
 * Date utility functions for handling various date operations
 */

/**
 * Gets today's date in YYYY-MM-DD format
 */
export function getToday(): string {
  const date = new Date();
  return formatDate(date);
}

/**
 * Gets the first day of the current week in YYYY-MM-DD format
 */
export function getCurrentWeekStart(): string {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  
  const weekStart = new Date(date.setDate(diff));
  return formatDate(weekStart);
}

/**
 * Gets the first day of the current month in YYYY-MM-DD format
 */
export function getCurrentMonthStart(): string {
  const date = new Date();
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  return formatDate(monthStart);
}

/**
 * Gets the first day of the previous month in YYYY-MM-DD format
 */
export function getPreviousMonthStart(): string {
  const date = new Date();
  const previousMonthStart = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return formatDate(previousMonthStart);
}

/**
 * Gets the last day of the previous month in YYYY-MM-DD format
 */
export function getPreviousMonthEnd(): string {
  const date = new Date();
  const previousMonthEnd = new Date(date.getFullYear(), date.getMonth(), 0);
  return formatDate(previousMonthEnd);
}

/**
 * Gets the first day of the current year in YYYY-MM-DD format
 */
export function getCurrentYearStart(): string {
  const date = new Date();
  const yearStart = new Date(date.getFullYear(), 0, 1);
  return formatDate(yearStart);
}

/**
 * Converts a date from DD/MM/YYYY format to YYYY-MM-DD format
 */
export function convertDateFormat(dateStr: string): string {
  // Check if the date is already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Convert from DD/MM/YYYY to YYYY-MM-DD
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  
  // If format is not recognized, return as is
  return dateStr;
}

/**
 * Formats a Date object to YYYY-MM-DD string
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Check if a string is a valid date in DD/MM/YYYY format
 */
export function isValidDateString(dateStr: string): boolean {
  if (!dateStr) return false;
  
  // DD/MM/YYYY pattern
  const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  if (!datePattern.test(dateStr)) return false;
  
  const [, day, month, year] = dateStr.match(datePattern) || [];
  
  // Check if date is valid
  const dateObj = new Date(`${year}-${month}-${day}`);
  return !isNaN(dateObj.getTime());
} 