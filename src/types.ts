export interface MovementRecord {
  id: string;
  timestamp: number; // Date.now()
  count: number;
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
