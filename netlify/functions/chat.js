require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { message, history, documentContext } = JSON.parse(event.body);

    if (!process.env.GEMINI_API_KEY) {
      return {
        statusCode: 200,
        body: JSON.stringify({ reply: 'Add GEMINI_API_KEY to your Netlify environment variables to enable AI chat.' })
      };
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

    const context = documentContext || 'No document context available.';
    const historyString = (history || []).map(h => `${h.role}: ${h.content}`).join('\n');

    const prompt = `You are a helpful AI legal assistant. Answer the user's question based ONLY on the following document context. If the answer is not in the document, state that clearly. Do not provide binding legal advice.

Document Context:
${context}

Chat History:
${historyString}

User: ${message}
Assistant:`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply })
    };

  } catch (error) {
    console.error('Error in chat:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process chat message' })
    };
  }
};
