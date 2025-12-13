/**
 * Translation labels for English and Hindi
 * Only UI labels are translated - data values remain unchanged
 */

export type Language = 'en' | 'hi'

export const labels = {
  en: {
    // Dashboard
    dashboardTitle: 'Jodhpur School Assessment Dashboard',
    searchPlaceholder: 'Search by school name or code...',
    showingResults: 'Showing',
    of: 'of',
    schools: 'schools',
    
    // Table headers
    schoolName: 'School Name',
    schoolCode: 'School Code',
    overallAverage: 'Overall School Average',
    grade6Average: 'Grade 6 Average',
    grade7Average: 'Grade 7 Average',
    grade8Average: 'Grade 8 Average',
    
    // Subjects
    overall: 'Overall',
    english: 'English',
    mathematics: 'Mathematics',
    science: 'Science',
    socialScience: 'Social Science',
    
    // Actions
    viewReport: 'View Report',
    downloadPdf: 'Open PDF',
    generating: 'Opening...',
    backToDashboard: 'Back to Dashboard',
    downloadPdfReport: 'Open PDF Report',
    
    // Data
    noData: 'No data',
    
    // School Report
    reportTitle: 'School Assessment Report Card',
    subjectwiseAverages: 'Subject-wise Average Scores',
    priorityDistribution: 'Competency Priority Distribution by Grade',
    subject: 'Subject',
    averageScore: 'Average Score',
    
    // Priority legend
    highPriority: 'High Priority (0-4.9)',
    mediumPriority: 'Medium Priority (5.0-6.9)',
    lowPriority: 'Low Priority (7.0+)',
    
    // Priority bands
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    
    // Grades
    grade: 'Grade',
    grade6: 'Grade 6',
    grade7: 'Grade 7',
    grade8: 'Grade 8',
    
    // Detailed report
    detailedReport: 'Detailed Competency Report',
    competency: 'Competency',
    score: 'Score',
    priority: 'Priority',
  },
  hi: {
    // Dashboard
    dashboardTitle: 'जोधपुर स्कूल मूल्यांकन डैशबोर्ड',
    searchPlaceholder: 'स्कूल के नाम या कोड से खोजें...',
    showingResults: 'दिखाया जा रहा है',
    of: 'में से',
    schools: 'स्कूल',
    
    // Table headers
    schoolName: 'स्कूल का नाम',
    schoolCode: 'स्कूल कोड',
    overallAverage: 'समग्र स्कूल औसत',
    grade6Average: 'कक्षा 6 औसत',
    grade7Average: 'कक्षा 7 औसत',
    grade8Average: 'कक्षा 8 औसत',
    
    // Subjects
    overall: 'समग्र',
    english: 'अंग्रेज़ी',
    mathematics: 'गणित',
    science: 'विज्ञान',
    socialScience: 'सामाजिक विज्ञान',
    
    // Actions
    viewReport: 'रिपोर्ट देखें',
    downloadPdf: 'पीडीएफ खोलें',
    generating: 'खोला जा रहा है...',
    backToDashboard: 'डैशबोर्ड पर वापस जाएं',
    downloadPdfReport: 'पीडीएफ रिपोर्ट खोलें',
    
    // Data
    noData: 'कोई डेटा नहीं',
    
    // School Report
    reportTitle: 'स्कूल मूल्यांकन रिपोर्ट कार्ड',
    subjectwiseAverages: 'विषयवार औसत अंक',
    priorityDistribution: 'ग्रेड के अनुसार दक्षता प्राथमिकता वितरण',
    subject: 'विषय',
    averageScore: 'औसत अंक',
    
    // Priority legend
    highPriority: 'उच्च प्राथमिकता (0-4.9)',
    mediumPriority: 'मध्यम प्राथमिकता (5.0-6.9)',
    lowPriority: 'निम्न प्राथमिकता (7.0+)',
    
    // Priority bands
    high: 'उच्च',
    medium: 'मध्यम',
    low: 'निम्न',
    
    // Grades
    grade: 'कक्षा',
    grade6: 'कक्षा 6',
    grade7: 'कक्षा 7',
    grade8: 'कक्षा 8',
    
    // Detailed report
    detailedReport: 'विस्तृत दक्षता रिपोर्ट',
    competency: 'दक्षता',
    score: 'अंक',
    priority: 'प्राथमिकता',
  },
}

export function getLabel(lang: Language, key: keyof typeof labels.en): string {
  return labels[lang][key]
}

