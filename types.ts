
export interface TimetableEntry {
  day: string;
  period: number;
  subject: string;
}

export interface LessonPlan {
  subject: string;
  lessonTitle: string;
  materials: string;
  adjustments: string;
}

export interface FinalReportRow {
  day: string;
  subject: string;
  lessonTitle: string;
  materials: string;
  adjustments: string;
}

export interface TimetableState {
  data: TimetableEntry[];
  fileName: string;
  updatedAt: string;
}
