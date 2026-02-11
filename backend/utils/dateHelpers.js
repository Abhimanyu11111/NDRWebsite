/**
 * Calculate working days between two dates (excluding weekends)
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns {number} Number of working days
 */
const calculateWorkingDays = (startDate, endDate) => {
  let count = 0;
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    const day = current.getDay();
    // 0 = Sunday, 6 = Saturday
    if (day !== 0 && day !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
};

/**
 * Check if date range includes weekend
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns {boolean}
 */
const hasWeekend = (startDate, endDate) => {
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    const day = current.getDay();
    if (day === 0 || day === 6) {
      return true;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return false;
};

/**
 * Check if two date ranges overlap
 * @param {Date} start1 
 * @param {Date} end1 
 * @param {Date} start2 
 * @param {Date} end2 
 * @returns {boolean}
 */
const datesOverlap = (start1, end1, start2, end2) => {
  return start1 <= end2 && end1 >= start2;
};

/**
 * Generate unique booking ID
 * @returns {string}
 */
const generateBookingId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `VDR-${timestamp}-${random}`;
};

/**
 * Calculate discount based on working days
 * @param {number} workingDays 
 * @param {number} totalAmount 
 * @returns {number} Discount amount
 */
const calculateDiscount = (workingDays, totalAmount) => {
  if (workingDays >= 3) {
    // 10% discount for 3+ working days
    return Math.floor(totalAmount * 0.10);
  }
  return 0;
};

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date 
 * @returns {string}
 */
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export {
  calculateWorkingDays,
  hasWeekend,
  datesOverlap,
  generateBookingId,
  calculateDiscount,
  formatDate
};
