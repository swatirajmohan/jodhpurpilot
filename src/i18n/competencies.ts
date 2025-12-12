/**
 * Competency name translations
 * Keys MUST exactly match the English competency names from data
 */

import { Language } from './labels'

export const competencyLabels: Record<Language, Record<string, string>> = {
  en: {
    // English competencies
    "Building Correct Sentences and Using Proper Grammar": "Building Correct Sentences and Using Proper Grammar",
    "Reading Comprehension": "Reading Comprehension",
    "Understanding Stories and Poems": "Understanding Stories and Poems",
    "Vocabulary": "Vocabulary",
    "Writing Clear and Organized Ideas": "Writing Clear and Organized Ideas",
    
    // Mathematics competencies
    "Lines and Angles": "Lines and Angles",
    "Perimeter and Area": "Perimeter and Area",
    "Representing and Interpreting Data": "Representing and Interpreting Data",
    "Solving Problems with Algebra (Unknowns)": "Solving Problems with Algebra (Unknowns)",
    "Solving Problems with Numbers": "Solving Problems with Numbers",
    "Understanding Shapes and Measurement": "Understanding Shapes and Measurement",
    "Understanding and Ordering Numbers": "Understanding and Ordering Numbers",
    "Understanding and Using Number Properties": "Understanding and Using Number Properties",
    "Working with Fractions and Decimals": "Working with Fractions and Decimals",
    
    // Science competencies
    "Applying Science to Everyday Life": "Applying Science to Everyday Life",
    "Ensuring Healthy Plant Growth and Food Safety": "Ensuring Healthy Plant Growth and Food Safety",
    "Making Healthy Food Choices and Identifying Food Components": "Making Healthy Food Choices and Identifying Food Components",
    "Measuring Physical Properties": "Measuring Physical Properties",
    "Understanding Heat and Its Transfer": "Understanding Heat and Its Transfer",
    "Understanding Living Organisms and Life Processes": "Understanding Living Organisms and Life Processes",
    "Understanding Properties and Changes of Materials": "Understanding Properties and Changes of Materials",
    "Understanding how magnets work": "Understanding how magnets work",
    "Understanding how materials and weather affect us": "Understanding how materials and weather affect us",
    
    // Social Science competencies
    "Analyzing Social Change & Justice": "Analyzing Social Change & Justice",
    "Appreciating India's Cultural and Historical Heritage": "Appreciating India's Cultural and Historical Heritage",
    "Appreciating Rajasthan's Culture and History": "Appreciating Rajasthan's Culture and History",
    "Exploring Historical Places and Events": "Exploring Historical Places and Events",
    "Exploring Livelihoods in Our Region": "Exploring Livelihoods in Our Region",
    "Understanding Community Rules and Rights": "Understanding Community Rules and Rights",
    "Understanding Constitutional Rights & Duties": "Understanding Constitutional Rights & Duties",
    "Understanding Democratic Governance": "Understanding Democratic Governance",
    "Understanding Early Civilizations": "Understanding Early Civilizations",
    "Understanding Economic Development": "Understanding Economic Development",
    "Understanding Local governance": "Understanding Local governance",
    "Understanding Natural Environment & Resources": "Understanding Natural Environment & Resources",
  },
  hi: {
    // English competencies
    "Building Correct Sentences and Using Proper Grammar": "सही वाक्य बनाना और उचित व्याकरण का उपयोग",
    "Reading Comprehension": "पठन समझ",
    "Understanding Stories and Poems": "कहानियों और कविताओं को समझना",
    "Vocabulary": "शब्दावली",
    "Writing Clear and Organized Ideas": "स्पष्ट और संगठित विचार लिखना",
    
    // Mathematics competencies
    "Lines and Angles": "रेखाएँ और कोण",
    "Perimeter and Area": "परिमाप और क्षेत्रफल",
    "Representing and Interpreting Data": "डेटा का प्रतिनिधित्व और व्याख्या",
    "Solving Problems with Algebra (Unknowns)": "बीजगणित से समस्याओं का समाधान (अज्ञात)",
    "Solving Problems with Numbers": "संख्याओं से समस्याओं का समाधान",
    "Understanding Shapes and Measurement": "आकृतियों और माप को समझना",
    "Understanding and Ordering Numbers": "संख्याओं को समझना और क्रम में लगाना",
    "Understanding and Using Number Properties": "संख्या गुणों को समझना और उपयोग करना",
    "Working with Fractions and Decimals": "भिन्न और दशमलव के साथ कार्य करना",
    
    // Science competencies
    "Applying Science to Everyday Life": "दैनिक जीवन में विज्ञान का अनुप्रयोग",
    "Ensuring Healthy Plant Growth and Food Safety": "स्वस्थ पौधे की वृद्धि और खाद्य सुरक्षा सुनिश्चित करना",
    "Making Healthy Food Choices and Identifying Food Components": "स्वस्थ भोजन विकल्प बनाना और खाद्य घटकों की पहचान",
    "Measuring Physical Properties": "भौतिक गुणों को मापना",
    "Understanding Heat and Its Transfer": "ऊष्मा और उसके स्थानांतरण को समझना",
    "Understanding Living Organisms and Life Processes": "जीवित जीवों और जीवन प्रक्रियाओं को समझना",
    "Understanding Properties and Changes of Materials": "सामग्री के गुणों और परिवर्तनों को समझना",
    "Understanding how magnets work": "चुंबक कैसे काम करते हैं यह समझना",
    "Understanding how materials and weather affect us": "सामग्री और मौसम हमें कैसे प्रभावित करते हैं यह समझना",
    
    // Social Science competencies
    "Analyzing Social Change & Justice": "सामाजिक परिवर्तन और न्याय का विश्लेषण",
    "Appreciating India's Cultural and Historical Heritage": "भारत की सांस्कृतिक और ऐतिहासिक विरासत की सराहना",
    "Appreciating Rajasthan's Culture and History": "राजस्थान की संस्कृति और इतिहास की सराहना",
    "Exploring Historical Places and Events": "ऐतिहासिक स्थानों और घटनाओं की खोज",
    "Exploring Livelihoods in Our Region": "हमारे क्षेत्र में आजीविका की खोज",
    "Understanding Community Rules and Rights": "समुदाय के नियम और अधिकार को समझना",
    "Understanding Constitutional Rights & Duties": "संवैधानिक अधिकार और कर्तव्य को समझना",
    "Understanding Democratic Governance": "लोकतांत्रिक शासन को समझना",
    "Understanding Early Civilizations": "प्रारंभिक सभ्यताओं को समझना",
    "Understanding Economic Development": "आर्थिक विकास को समझना",
    "Understanding Local governance": "स्थानीय शासन को समझना",
    "Understanding Natural Environment & Resources": "प्राकृतिक पर्यावरण और संसाधनों को समझना",
  }
}

/**
 * Get translated competency name with fallback to original
 */
export function getCompetencyLabel(language: Language, competencyName: string): string {
  return competencyLabels[language][competencyName] || competencyName
}

