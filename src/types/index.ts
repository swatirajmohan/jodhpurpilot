/**
 * TypeScript interfaces matching FRS.md data model exactly
 */

// School entity (FRS section 6.1)
export interface School {
  school_code: string;
  school_name: string;
}

// ScoreRow entity (FRS section 6.1)
export interface ScoreRow {
  school_code: string;
  grade_level: number; // 6, 7, or 8 only
  subject: string; // English, Mathematics, Science, or Social Science only
  competency_name: string;
  score_10: number; // 10 point score (0-10)
  priority_band: 'High' | 'Medium' | 'Low'; // High: 0-4, Medium: 5-6, Low: 7-10
}

// Aggregates entity (FRS section 6.1)
export interface Aggregates {
  school_code: string;
  overall_avg: number | null; // Mean of all 10 point scores across grades 6-8 and all subjects
  subject_avg_map: {
    English: number | null;
    Mathematics: number | null;
    Science: number | null;
    'Social Science': number | null;
  };
  grade_avg_map?: {
    6: number | null;
    7: number | null;
    8: number | null;
  };
  grade_subject_avg_map?: {
    6?: {
      English?: number | null;
      Mathematics?: number | null;
      Science?: number | null;
      'Social Science'?: number | null;
    };
    7?: {
      English?: number | null;
      Mathematics?: number | null;
      Science?: number | null;
      'Social Science'?: number | null;
    };
    8?: {
      English?: number | null;
      Mathematics?: number | null;
      Science?: number | null;
      'Social Science'?: number | null;
    };
  };
}

