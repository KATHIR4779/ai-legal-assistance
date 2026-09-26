require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

// Store document context per session (in-memory for prototype)
const sessionContext = new Map();

app.post('/api/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let textContext = '';
    
    // Simple text extraction
    if (req.file.mimetype === 'application/pdf') {
      const data = await pdf(req.file.buffer);
      textContext = data.text;
    } else {
      textContext = req.file.buffer.toString('utf-8');
    }

    // Limit text context to avoid token limits on large docs
    const maxChars = 20000;
    if (textContext.length > maxChars) {
      textContext = textContext.substring(0, maxChars) + '... [TRUNCATED]';
    }
    
    const sessionId = Date.now().toString();
    sessionContext.set(sessionId, textContext);

    // Call Gemini API for analysis
    const prompt = `
You are a highly skilled legal AI assistant. I am providing you with the text of a legal document. 
Please analyze it and provide a structured JSON response with the following format. 
DO NOT INCLUDE ANY MARKDOWN formatting like \`\`\`json, just pure JSON text.

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

    if (!process.env.GEMINI_API_KEY) {
       console.log("No GEMINI_API_KEY found. Returning mock analysis data.");
       return res.json({
         sessionId,
         analysis: {
           summary: "This is a simulated analysis because no GEMINI_API_KEY was provided in the .env file. The document has been received and processed by the backend.",
           risks: [
             { title: "Missing API Key", description: "You need to add a GEMINI_API_KEY to server/.env for real AI analysis.", level: "High" }
           ],
           clauses: [
             { title: "Demo Clause", description: "This is a placeholder clause extracted from the document." }
           ]
         }
       });
    }

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    
    // Clean up potential markdown from the model response
    responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const analysis = JSON.parse(responseText);

    res.json({
      sessionId,
      analysis
    });

  } catch (error) {
    console.error('Error analyzing document:', error);
    res.status(500).json({ error: 'Failed to analyze document' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { sessionId, message, history } = req.body;
    
    const context = sessionContext.get(sessionId) || "No document context available.";

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        reply: "This is a simulated reply. Please add your GEMINI_API_KEY to server/.env to enable real AI chat."
      });
    }

    const systemInstruction = `You are a helpful AI legal assistant. Answer the user's question based ONLY on the following document context. If the answer is not in the document, state that clearly. Do not provide binding legal advice.
    
    Document Context:
    ${context}`;

    let historyString = history.map(h => `${h.role}: ${h.content}`).join('\n');
    
    const prompt = `${systemInstruction}\n\nChat History:\n${historyString}\n\nUser: ${message}\nAssistant:`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    res.json({ reply });

  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
