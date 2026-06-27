export function getWeeksBetween(startDateStr: string, endDateStr: string) {
  const weeks: { WEEK_START_DATE: string; WEEK_END_DATE: string }[] = [];
  
  // Parse as UTC to prevent timezone shifts
  const parseUTC = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  };
  
  const start = parseUTC(startDateStr);
  const end = parseUTC(endDateStr);
  
  // Find the Monday on or before start date.
  const current = new Date(start.getTime());
  const day = current.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  current.setUTCDate(current.getUTCDate() + diffToMonday);
  
  while (current <= end) {
    const weekStart = new Date(current.getTime());
    const weekEnd = new Date(current.getTime());
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
    
    const formatDate = (d: Date) => {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${dayStr}`;
    };
    
    weeks.push({
      WEEK_START_DATE: formatDate(weekStart),
      WEEK_END_DATE: formatDate(weekEnd)
    });
    
    current.setUTCDate(current.getUTCDate() + 7);
  }
  return weeks;
}

export function getMonthsBetween(startDateStr: string, endDateStr: string) {
  const months: { MONTH_START_DATE: string; MONTH_END_DATE: string }[] = [];
  
  const parseUTC = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  };
  
  const start = parseUTC(startDateStr);
  const end = parseUTC(endDateStr);
  
  const current = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  
  while (current <= end) {
    const monthStart = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), 1));
    const monthEnd = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + 1, 0));
    
    const formatDate = (d: Date) => {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${dayStr}`;
    };
    
    months.push({
      MONTH_START_DATE: formatDate(monthStart),
      MONTH_END_DATE: formatDate(monthEnd)
    });
    
    current.setUTCMonth(current.getUTCMonth() + 1);
  }
  return months;
}
