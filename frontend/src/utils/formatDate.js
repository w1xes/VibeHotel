import { format, formatDistanceToNow, isAfter, isBefore, parseISO } from 'date-fns';

export function formatDate(date) {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateRange(start, end) {
  return `${format(new Date(start), 'MMM d')} — ${format(new Date(end), 'MMM d, yyyy')}`;
}

export function formatRelative(date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isDateInRange(date, start, end) {
  const d = new Date(date);
  return !isBefore(d, new Date(start)) && !isAfter(d, new Date(end));
}

export function nightsBetween(start, end) {
  const ms = new Date(end) - new Date(start);
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}
