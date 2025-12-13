/**
 * Data Translation Maps
 * Maps raw English data values to Hindi equivalents
 */

export const SUBJECT_TRANSLATIONS: Record<string, { en: string; hi: string }> = {
  'English': { en: 'English', hi: 'अंग्रेज़ी' },
  'Mathematics': { en: 'Mathematics', hi: 'गणित' },
  'Science': { en: 'Science', hi: 'विज्ञान' },
  'Social Science': { en: 'Social Science', hi: 'सामाजिक विज्ञान' }
};

export const PRIORITY_TRANSLATIONS: Record<string, { en: string; hi: string }> = {
  'High': { en: 'High', hi: 'उच्च' },
  'Medium': { en: 'Medium', hi: 'मध्यम' },
  'Low': { en: 'Low', hi: 'निम्न' }
};

export const COMPETENCY_TRANSLATIONS: Record<string, { en: string; hi: string }> = {
  // Grade 6 - English
  'Building Correct Sentences and Using Proper Grammar': { en: 'Building Correct Sentences and Using Proper Grammar', hi: 'सही वाक्य बनाना और उचित व्याकरण का उपयोग' },
  'Reading Comprehension': { en: 'Reading Comprehension', hi: 'पठन बोध' },
  'Understanding Stories and Poems': { en: 'Understanding Stories and Poems', hi: 'कहानियों और कविताओं को समझना' },
  'Vocabulary': { en: 'Vocabulary', hi: 'शब्दावली' },
  'Writing Clear and Organized Ideas': { en: 'Writing Clear and Organized Ideas', hi: 'स्पष्ट और व्यवस्थित विचार लिखना' },
  
  // Grade 6 - Mathematics
  'Lines and Angles': { en: 'Lines and Angles', hi: 'रेखाएँ और कोण' },
  'Perimeter and Area': { en: 'Perimeter and Area', hi: 'परिमाप और क्षेत्रफल' },
  'Solving Problems with Numbers': { en: 'Solving Problems with Numbers', hi: 'संख्याओं के साथ समस्याओं को हल करना' },
  'Understanding Shapes and Measurement': { en: 'Understanding Shapes and Measurement', hi: 'आकार और माप को समझना' },
  'Understanding and Ordering Numbers': { en: 'Understanding and Ordering Numbers', hi: 'संख्याओं को समझना और क्रमबद्ध करना' },
  'Understanding and Using Number Properties': { en: 'Understanding and Using Number Properties', hi: 'संख्या गुणों को समझना और उपयोग करना' },
  
  // Grade 6 - Science
  'Applying Science to Everyday Life': { en: 'Applying Science to Everyday Life', hi: 'रोजमर्रा की जिंदगी में विज्ञान का प्रयोग' },
  'Making Healthy Food Choices and Identifying Food Components': { en: 'Making Healthy Food Choices and Identifying Food Components', hi: 'स्वस्थ भोजन विकल्प बनाना और खाद्य घटकों की पहचान करना' },
  'Understanding Living Organisms and Life Processes': { en: 'Understanding Living Organisms and Life Processes', hi: 'जीवित जीवों और जीवन प्रक्रियाओं को समझना' },
  'Understanding Properties and Changes of Materials': { en: 'Understanding Properties and Changes of Materials', hi: 'पदार्थों के गुण और परिवर्तन को समझना' },
  'Understanding how magnets work': { en: 'Understanding how magnets work', hi: 'चुंबक कैसे काम करते हैं यह समझना' },
  
  // Grade 6 - Social Science
  'Appreciating India\'s Cultural and Historical Heritage': { en: 'Appreciating India\'s Cultural and Historical Heritage', hi: 'भारत की सांस्कृतिक और ऐतिहासिक विरासत की सराहना' },
  'Appreciating Rajasthan\'s Culture and History': { en: 'Appreciating Rajasthan\'s Culture and History', hi: 'राजस्थान की संस्कृति और इतिहास की सराहना' },
  'Exploring Historical Places and Events': { en: 'Exploring Historical Places and Events', hi: 'ऐतिहासिक स्थानों और घटनाओं की खोज' },
  'Understanding Community Rules and Rights': { en: 'Understanding Community Rules and Rights', hi: 'समुदाय के नियम और अधिकार को समझना' },
  'Understanding Early Civilizations': { en: 'Understanding Early Civilizations', hi: 'प्रारंभिक सभ्यताओं को समझना' },
  'Understanding Natural Environment & Resources': { en: 'Understanding Natural Environment & Resources', hi: 'प्राकृतिक पर्यावरण और संसाधनों को समझना' },
  
  // Grade 7 - Mathematics
  'Representing and Interpreting Data': { en: 'Representing and Interpreting Data', hi: 'डेटा का प्रतिनिधित्व और व्याख्या' },
  'Solving Problems with Algebra (Unknowns)': { en: 'Solving Problems with Algebra (Unknowns)', hi: 'बीजगणित से समस्याओं को हल करना (अज्ञात)' },
  'Working with Fractions and Decimals': { en: 'Working with Fractions and Decimals', hi: 'भिन्न और दशमलव के साथ काम करना' },
  
  // Grade 7 - Science
  'Ensuring Healthy Plant Growth and Food Safety': { en: 'Ensuring Healthy Plant Growth and Food Safety', hi: 'स्वस्थ पौधों की वृद्धि और खाद्य सुरक्षा सुनिश्चित करना' },
  'Measuring Physical Properties': { en: 'Measuring Physical Properties', hi: 'भौतिक गुणों को मापना' },
  'Understanding Heat and Its Transfer': { en: 'Understanding Heat and Its Transfer', hi: 'गर्मी और इसके स्थानांतरण को समझना' },
  'Understanding how materials and weather affect us': { en: 'Understanding how materials and weather affect us', hi: 'पदार्थ और मौसम हमें कैसे प्रभावित करते हैं यह समझना' },
  
  // Grade 7 - Social Science
  'Analyzing Social Change & Justice': { en: 'Analyzing Social Change & Justice', hi: 'सामाजिक परिवर्तन और न्याय का विश्लेषण' },
  'Exploring Livelihoods in Our Region': { en: 'Exploring Livelihoods in Our Region', hi: 'हमारे क्षेत्र में आजीविका की खोज' },
  'Understanding Constitutional Rights & Duties': { en: 'Understanding Constitutional Rights & Duties', hi: 'संवैधानिक अधिकार और कर्तव्यों को समझना' },
  'Understanding Economic Development': { en: 'Understanding Economic Development', hi: 'आर्थिक विकास को समझना' },
  'Understanding Local governance': { en: 'Understanding Local governance', hi: 'स्थानीय शासन को समझना' },
  
  // Grade 8 competencies (if any)
  // Add more as needed
};

/**
 * Translate subject name
 */
export function translateSubject(subject: string, lang: 'en' | 'hi'): string {
  return SUBJECT_TRANSLATIONS[subject]?.[lang] || subject;
}

/**
 * Translate competency name
 */
export function translateCompetency(competency: string, lang: 'en' | 'hi'): string {
  return COMPETENCY_TRANSLATIONS[competency]?.[lang] || competency;
}

/**
 * Translate priority band
 */
export function translatePriority(priority: string, lang: 'en' | 'hi'): string {
  return PRIORITY_TRANSLATIONS[priority]?.[lang] || priority;
}

/**
 * Get priority color based on numeric score
 * DO NOT use string comparison
 */
export function getPriorityColor(score: number | null | undefined): string {
  if (score === null || score === undefined) return '';
  
  if (score < 5) return 'high'; // Red
  if (score < 7) return 'medium'; // Amber/Yellow
  return 'low'; // Green
}

/**
 * Get priority CSS class based on numeric score
 */
export function getPriorityClass(score: number | null | undefined): string {
  const color = getPriorityColor(score);
  if (!color) return '';
  return `priority-${color}`;
}

