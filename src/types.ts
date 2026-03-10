export type UserRole = 'wife' | 'husband';

export interface MovementRecord {
  id: string;
  timestamp: number; // Date.now()
  count: number;
  recordedBy: UserRole;
}

export interface UserSettings {
  refDate: number; // timestamp when GA was set
  refWeeks: number;
  refDays: number;
}

export interface DailySummary {
  date: string; // YYYY-MM-DD
  totalCount: number;
  records: MovementRecord[];
}
