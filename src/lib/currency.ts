
// Currency conversion rates (you may want to fetch these from an API for real-time rates)
const USD_TO_INR = 83.0; // Approximate rate, should be updated regularly

export const convertToINR = (amountInUSD: number): number => {
  return Math.round(amountInUSD * USD_TO_INR);
};

export const formatINR = (amount: number | null | undefined): string => {
  // Handle null, undefined, or invalid numbers
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  
  // Ensure amount is a valid number
  const validAmount = Number(amount);
  if (isNaN(validAmount)) {
    return '₹0';
  }
  
  return `₹${validAmount.toLocaleString('en-IN')}`;
};

export const parseBudgetRange = (budgetRange: string): { min: number; max: number } => {
  switch (budgetRange) {
    case 'budget':
      return { min: 25000, max: 75000 }; // ₹25k-75k
    case 'mid-range':
      return { min: 75000, max: 200000 }; // ₹75k-2L
    case 'luxury':
      return { min: 200000, max: 500000 }; // ₹2L-5L+
    default:
      // For custom budgets, try to parse the range
      const match = budgetRange.match(/₹(\d+(?:,\d+)*)-₹(\d+(?:,\d+)*)/);
      if (match) {
        return {
          min: parseInt(match[1].replace(/,/g, '')),
          max: parseInt(match[2].replace(/,/g, ''))
        };
      }
      return { min: 25000, max: 75000 };
  }
};
