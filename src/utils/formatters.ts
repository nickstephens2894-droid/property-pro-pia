export const formatCurrency = (amount: number, currency: string = 'AUD') => {
  // Add safety checks for invalid inputs
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0';
  }
  // Round to nearest dollar for display
  const roundedAmount = Math.round(amount);
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(roundedAmount);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const formatPercentage = (value: number) => {
  // Add safety checks for invalid inputs
  if (value === null || value === undefined || isNaN(value)) {
    return '0.0%';
  }
  return `${value.toFixed(1)}%`;
}; 