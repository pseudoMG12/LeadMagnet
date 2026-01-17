import { format, isValid } from 'date-fns';

export const safeFormat = (dateStr, formatStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (!isValid(date)) return 'N/A';
  return format(date, formatStr);
};
