/**
 * Format a numeric value into a standard Tanzanian Shilling currency string (TSh).
 * Example: 125000 -> TSh 125,000
 * Example: 1250.5 -> TSh 1,250.50
 */
export const formatCurrency = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return 'TSh 0';
    
    // Check if it has decimals
    const hasDecimals = num % 1 !== 0;
    
    const formattedNum = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: hasDecimals ? 2 : 0,
        maximumFractionDigits: 2,
    }).format(num);

    return `TSh ${formattedNum}`;
};

/**
 * Format an ISO date string into a clean, localized date format.
 * Example: 2026-09-12T... -> Sep 12, 2026
 */
export const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
};

/**
 * Format an ISO date string into a clean date and time format.
 */
export const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};