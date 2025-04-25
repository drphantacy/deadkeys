import { useState } from 'react';

// Define leaderboard entry type
export interface LeaderboardEntry {
  name: string;
  points: number;
}

// Default dummy leaderboard data
const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { name: 'Alice', points: 1500 },
  { name: 'Bob', points: 1400 },
  { name: 'Carol', points: 1300 },
  { name: 'Dave', points: 1200 },
  { name: 'Eve', points: 1100 },
  { name: 'Frank', points: 1000 },
  { name: 'Grace', points: 900 },
  { name: 'Heidi', points: 800 },
  { name: 'Ivan', points: 700 },
  { name: 'Judy', points: 600 },
];

// Hook to manage leaderboard state
export function useLeaderboard() {
  return useState<LeaderboardEntry[]>(DEFAULT_LEADERBOARD);
}
