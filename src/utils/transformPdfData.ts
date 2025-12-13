/**
 * Transform PDF payload data to target language
 * Translates subjects, competencies, and priority bands
 */

import { translateSubject, translatePriority } from '../i18n/dataTranslations';
import { COMPETENCY_HI_MAP } from '../i18n/competencyHi';

interface Aggregates {
  school_code: string;
  overall_avg: number | null;
  subject_avg_map: Record<string, number | null>;
  grade_avg_map?: Record<string, number | null>;
  grade_subject_avg_map?: Record<string, Record<string, number | null>>;
}

interface Competency {
  school_code: string;
  grade_level: number;
  subject: string;
  competency_name: string;
  score_10: number | null;
  priority_band: string;
}

/**
 * Transform aggregates subject keys to target language
 */
function transformAggregates(aggregates: Aggregates | null, lang: 'en' | 'hi'): Aggregates | null {
  if (!aggregates) return null;
  
  const transformed: Aggregates = {
    school_code: aggregates.school_code,
    overall_avg: aggregates.overall_avg,
    subject_avg_map: {},
    grade_avg_map: aggregates.grade_avg_map
  };
  
  // Transform subject_avg_map keys
  for (const [subject, avg] of Object.entries(aggregates.subject_avg_map)) {
    const translatedSubject = translateSubject(subject, lang);
    transformed.subject_avg_map[translatedSubject] = avg;
  }
  
  // Transform grade_subject_avg_map keys
  if (aggregates.grade_subject_avg_map) {
    transformed.grade_subject_avg_map = {};
    for (const [grade, subjectMap] of Object.entries(aggregates.grade_subject_avg_map)) {
      transformed.grade_subject_avg_map[grade] = {};
      for (const [subject, avg] of Object.entries(subjectMap)) {
        const translatedSubject = translateSubject(subject, lang);
        transformed.grade_subject_avg_map[grade][translatedSubject] = avg;
      }
    }
  }
  
  return transformed;
}

/**
 * Transform competencies array to target language
 */
function transformCompetencies(competencies: Competency[], lang: 'en' | 'hi'): Competency[] {
  if (lang === 'en') return competencies;
  
  // For Hindi, use simple map lookup
  return competencies.map(comp => ({
    ...comp,
    subject: translateSubject(comp.subject, lang),
    competency_name: COMPETENCY_HI_MAP[comp.competency_name] ?? comp.competency_name,
    priority_band: translatePriority(comp.priority_band, lang)
  }));
}

/**
 * Transform entire PDF payload to target language
 * This is the SINGLE CENTRAL transformation point
 */
export function transformPdfPayload(payload: {
  school: {
    school_code: string;
    school_name: string;
  };
  aggregates: Aggregates | null;
  competencies: Competency[];
  lang: 'en' | 'hi';
}) {
  // If English, no transformation needed (data is already in English)
  if (payload.lang === 'en') {
    return payload;
  }
  
  // Transform to Hindi
  return {
    school: payload.school, // School name stays as-is
    aggregates: transformAggregates(payload.aggregates, payload.lang),
    competencies: transformCompetencies(payload.competencies, payload.lang),
    lang: payload.lang
  };
}

