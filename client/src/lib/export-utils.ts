import { Survey, Response } from "@shared/schema";

interface ExportOptions {
  format: 'csv' | 'json';
  filename: string;
}

// Helper function to sanitize text for CSV
const sanitizeForCSV = (text: string) => `"${String(text).replace(/"/g, '""')}"`;

// Helper function to download file
const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

// Export survey details
export const exportSurveyData = (survey: Survey, options: ExportOptions) => {
  const { format, filename } = options;

  if (format === 'csv') {
    const headers = ['Title', 'Description', 'Status', 'Created At'];
    const data = [
      survey.title,
      survey.description,
      survey.isActive ? 'Active' : 'Closed',
      new Date(survey.createdAt).toLocaleDateString()
    ];

    const csvContent = [
      headers.join(','),
      data.map(sanitizeForCSV).join(',')
    ].join('\n');

    downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
  } else if (format === 'json') {
    const jsonContent = JSON.stringify(survey, null, 2);
    downloadFile(jsonContent, `${filename}.json`, 'application/json');
  }
};

// Export survey responses
export const exportResponsesData = (responses: Response[], survey: Survey, options: ExportOptions) => {
  const { format, filename } = options;

  if (format === 'csv') {
    const questionHeaders = survey.questions.map(q => q.text);
    const headers = ['Submitted At', 'Sentiment Rating', 'Sentiment Confidence', ...questionHeaders];

    const rows = responses.map(response => {
      const submittedAt = new Date(response.submittedAt).toLocaleDateString();
      const sentimentRating = response.sentiment?.rating || 'N/A';
      const sentimentConfidence = response.sentiment 
        ? `${(response.sentiment.confidence * 100).toFixed(0)}%`
        : 'N/A';

      const answers = survey.questions.map(q => 
        response.answers[q.id] ? sanitizeForCSV(response.answers[q.id]) : ''
      );

      return [submittedAt, sentimentRating, sentimentConfidence, ...answers];
    });

    const csvContent = [
      headers.map(sanitizeForCSV).join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
  } else if (format === 'json') {
    const jsonContent = JSON.stringify({ survey, responses }, null, 2);
    downloadFile(jsonContent, `${filename}.json`, 'application/json');
  }
};
