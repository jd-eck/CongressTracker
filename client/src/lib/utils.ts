import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format a date to a readable string
export function formatDate(date: string | Date): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Convert party code to full name
export function getPartyName(partyCode: string): string {
  switch (partyCode) {
    case 'D':
      return 'Democrat';
    case 'R':
      return 'Republican';
    case 'I':
      return 'Independent';
    default:
      return partyCode;
  }
}

// Get color for party
export function getPartyColor(partyCode: string): string {
  switch (partyCode) {
    case 'D':
      return 'blue';
    case 'R':
      return 'red';
    case 'I':
      return 'purple';
    default:
      return 'gray';
  }
}

// Format importance level to readable text
export function formatImportanceLevel(level: number): string {
  switch (level) {
    case 1:
      return 'Not important';
    case 2:
      return 'Low importance';
    case 3:
      return 'Somewhat important';
    case 4:
      return 'High importance';
    case 5:
      return 'Very important';
    default:
      return 'Unknown';
  }
}

// Calculate alignment percentage
export function calculateAlignment(
  agreed: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round((agreed / total) * 100);
}

// Helper function for unique by key
export function uniqueBy<T>(arr: T[], key: keyof T): T[] {
  const seen = new Set();
  return arr.filter(item => {
    const k = item[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// Truncate text with ellipsis if it exceeds max length
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
