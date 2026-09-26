require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdf = require('pdf-parse');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { fileData, fileType } = JSON.parse(event.body);

    if (!fileData) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No file data provided' }) };
    }

    const buffer = Buffer.from(fileData, 'base64');

    let textContext = '';
    if (fileType === 'application/pdf') {
      const data = await pdf(buffer);
      textContext = data.text;
    } else {
      textContext = buffer.toString('utf-8');
    }

    const maxChars = 20000;
    if (textContext.length > maxChars) {
      textContext = textContext.substring(0, maxChars) + '... [TRUNCATED]';
    }

    if (!process.env.GEMINI_API_KEY) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          documentContext: textContext,
          analysis: {
            summary: 'This is a simulated analysis. Add GEMINI_API_KEY to your Netlify environment variables.',
            risks: [{ title: 'Missing API Key', description: 'Add GEMINI_API_KEY in Netlify site settings → Environment variables.', level: 'High' }],
            clauses: [{ title: 'Demo Clause', description: 'This is a placeholder clause.' }]
          }
        })
      };
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

    const prompt = `
You are a highly skilled legal AI assistant. Analyze the legal document below and respond with a JSON object only.
DO NOT include any markdown formatting like \`\`\`json — just raw JSON.

{
  "summary": "A clear, plain-english 2-3 sentence summary of the document's purpose and key terms.",
  "risks": [
    { "title": "Risk Name", "description": "Explanation of the risk", "level": "High" | "Medium" | "Low" }
  ],
  "clauses": [
    { "title": "Clause Name (Section X)", "description": "Simplified explanation of the clause" }
  ]
}

Document Text:
${textContext}
`;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const analysis = JSON.parse(responseText);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysis, documentContext: textContext })
    };

  } catch (error) {
    console.error('Error analyzing document:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to analyze document' })
    };
  }
};
