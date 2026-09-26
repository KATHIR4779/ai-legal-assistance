# LexAssist AI - Your AI Legal Assistant

## 🎯 Chosen Vertical
**Legal Document Simplification and Risk Assessment**
LexAssist AI focuses on making complex legal documents (like employment agreements, terms of service, and contracts) accessible to the average person. It acts as an intelligent assistant that not only summarizes the document but actively highlights potential risks and extracts key clauses for quick review.

## 🧠 Approach and Logic
The solution is built with a user-centric design approach, simulating a dynamic AI assistant. The logic is divided into three core capabilities:
1. **Document Upload & Processing:** A secure pipeline to ingest legal documents (PDF, DOCX).
2. **Automated Analysis Pipeline:**
   - **Summarization:** Condenses the document into a plain-language summary.
   - **Risk Identification:** Scans for unusual or high-risk clauses (e.g., broad non-competes, aggressive IP assignment).
   - **Clause Extraction:** Extracts standard clauses (Compensation, Termination, Confidentiality) into easy-to-read cards.
3. **Interactive Q&A:** A chat interface allowing users to ask specific questions about the document and receive contextual answers.

## 🚀 How the Solution Works
1. **Dashboard:** Users are greeted with an intuitive dashboard explaining the core features.
2. **Upload:** Users upload their legal document securely (.pdf or .txt).
3. **Backend Processing:** The Node.js/Express server receives the file, extracts the text using `pdf-parse`, and sends a structured prompt to the **Google Gemini API**.
4. **Analysis View:** The AI returns a structured JSON response which the frontend renders as:
   - A general plain-english summary.
   - Categorized and prioritized risk factors (High/Medium/Low).
   - Key clauses extracted and simplified.
5. **Chat Interface:** Users can switch to the "Ask Questions" tab to interact conversationally with the AI. The document context and chat history are passed to Gemini for accurate, context-aware answers.

## 💡 Assumptions Made
- The AI model providing the backend logic is capable of processing long-context legal documents and maintaining accuracy (Gemini 1.5 Pro is used for this).
- Users are seeking **general understanding and guidance**, not binding legal counsel. (A disclaimer is prominently displayed in the application).
- The solution assumes standard document formats and text-extractable files (no heavy OCR requirements for the initial MVP).

## 🛠️ Technology Stack
- **Frontend:** React (Vite), TypeScript, Vanilla CSS, Lucide React
- **Backend:** Node.js, Express, Multer (file uploads), PDF-Parse
- **AI Integration:** Google Gemini API (`@google/generative-ai`)

## 🏃‍♂️ How to Run Locally

### 1. Setup Backend
1. Open a terminal and navigate to the `server` directory: `cd server`
2. Install dependencies: `npm install`
3. Add your Gemini API key: Open `server/.env` and replace `your_gemini_api_key_here` with your actual key.
4. Start the server: `node index.js` (Runs on port 3001)

### 2. Setup Frontend
1. Open a new terminal and navigate to the root directory.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open your browser to the local URL provided in the terminal.
