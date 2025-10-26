// Consistent table styling utilities
export const tableStyles = {
  // Table wrapper
  table: "border border-border rounded-lg",
  
  // Header row
  headerRow: "border-b-2 border-border bg-muted/50",
  
  // Header cells
  headerCell: "whitespace-nowrap py-2 px-2 border-r border-border font-semibold",
  
  // Body rows
  bodyRow: "hover:bg-accent/50 border-b border-border",
  
  // Body cells
  bodyCell: "py-1 px-2 border-r border-border whitespace-nowrap",
  
  // Last cell (no right border)
  lastCell: "py-1 px-2 whitespace-nowrap",
  
  // Action buttons
  actionButton: "h-8 w-8",
  
  // Status badges
  statusBadge: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
  
  // Currency cells
  currencyCell: "text-right font-medium py-1 px-2 border-r border-border whitespace-nowrap",
  
  // Center cells
  centerCell: "text-center py-1 px-2 border-r border-border whitespace-nowrap",
  
  // Last center cell
  lastCenterCell: "text-center py-1 px-2 whitespace-nowrap",
} as const;

// Helper function to get cell class based on position
export const getCellClass = (isLast: boolean = false, alignment: 'left' | 'center' | 'right' = 'left') => {
  const baseClass = isLast ? tableStyles.lastCell : tableStyles.bodyCell;
  
  if (alignment === 'center') {
    return isLast ? tableStyles.lastCenterCell : tableStyles.centerCell;
  }
  
  if (alignment === 'right') {
    return tableStyles.currencyCell;
  }
  
  return baseClass;
};
