import React, { useState, useRef } from 'react';
import { 
  Scale, 
  FileText, 
  Search, 
  MessageSquare, 
  AlertTriangle, 
  Upload, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import './index.css';

type ViewState = 'dashboard' | 'upload' | 'analyze' | 'chat';

interface AnalysisResult {
  summary: string;
  risks: Array<{ title: string; description: string; level: string }>;
  clauses: Array<{ title: string; description: string }>;
}

function App() {
  const [view, setView] = useState<ViewState>('dashboard');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI Legal Assistant. I can help you understand legal documents, summarize key points, or answer specific questions. How can I help you today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsAnalyzing(true);
    setView('analyze');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      if (data.analysis) {
        setAnalysisData(data.analysis);
        setSessionId(data.sessionId);
      } else {
        console.error("Failed to analyze:", data.error);
        alert("Failed to analyze document.");
        setView('upload');
      }
    } catch (err) {
      console.error("Error connecting to backend:", err);
      alert("Error connecting to backend server. Make sure it is running on port 3001.");
      setView('upload');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMessage = { role: 'user', content: inputText };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: sessionId || "no-session",
          message: userMessage.content,
          history: messages
        })
      });
      
      const data = await response.json();
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
         setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error processing your request.' }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error connecting to backend server.' }]);
    }
  };

  const getRiskColor = (level: string) => {
    if (level === 'High') return { color: '#dc2626', badgeClass: 'badge-risk', iconColor: '#dc2626' };
    if (level === 'Medium') return { color: '#d97706', badgeClass: 'badge', badgeStyle: { backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }, iconColor: '#d97706' };
    return { color: '#2563eb', badgeClass: 'badge-info', iconColor: '#2563eb' };
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Scale size={28} />
          <span>LexAssist AI</span>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${view === 'dashboard' ? 'active' : ''}`}
            onClick={() => setView('dashboard')}
          >
            <FileText size={20} />
            Dashboard
          </button>
          <button 
            className={`nav-item ${view === 'upload' ? 'active' : ''}`}
            onClick={() => setView('upload')}
          >
            <Upload size={20} />
            Upload Document
          </button>
          <button 
            className={`nav-item ${view === 'chat' ? 'active' : ''}`}
            onClick={() => setView('chat')}
            disabled={!sessionId}
            style={{ opacity: !sessionId ? 0.5 : 1, cursor: !sessionId ? 'not-allowed' : 'pointer' }}
          >
            <MessageSquare size={20} />
            Ask Questions
          </button>
        </nav>
        
        <div style={{ padding: '1rem', marginTop: 'auto' }}>
          <div style={{ 
            padding: '1rem', 
            backgroundColor: 'var(--muted)', 
            borderRadius: 'var(--radius)',
            fontSize: '0.75rem',
            color: 'var(--muted-foreground)'
          }}>
            <p><strong>Disclaimer:</strong> This tool provides general information and does not constitute legal advice. Always consult a qualified professional.</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <h2>
            {view === 'dashboard' && 'Welcome to LexAssist AI'}
            {view === 'upload' && 'Upload a Document'}
            {view === 'analyze' && 'Document Analysis'}
            {view === 'chat' && 'Legal Q&A Assistant'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Pro Plan</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              U
            </div>
          </div>
        </header>

        <div className="content-area">
          {view === 'dashboard' && (
            <>
              <div className="hero">
                <h1>Simplify Legal Information with AI</h1>
                <p>Upload contracts, policies, or terms of service. Get plain-language summaries, risk highlights, and answers to your questions instantly.</p>
                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button className="button button-primary" onClick={() => setView('upload')}>
                    Start New Analysis <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <h3 style={{ marginBottom: '0.5rem' }}>Core Capabilities</h3>
              <div className="grid">
                <div className="feature-card card" onClick={() => setView('upload')}>
                  <div className="feature-icon">
                    <Search size={24} />
                  </div>
                  <div className="feature-title">Clause Extraction</div>
                  <div className="feature-desc">Automatically identify and extract important clauses, obligations, and rights from complex agreements.</div>
                </div>
                
                <div className="feature-card card" onClick={() => setView('upload')}>
                  <div className="feature-icon" style={{ color: 'var(--destructive)' }}>
                    <AlertTriangle size={24} />
                  </div>
                  <div className="feature-title">Risk Assessment</div>
                  <div className="feature-desc">Highlight potential risks, unusual terms, or inconsistencies that require closer review.</div>
                </div>

                <div className="feature-card card" onClick={() => setView('upload')}>
                  <div className="feature-icon" style={{ color: 'var(--accent)' }}>
                    <MessageSquare size={24} />
                  </div>
                  <div className="feature-title">Interactive Q&A</div>
                  <div className="feature-desc">Ask natural language questions about your document and get cited answers instantly.</div>
                </div>
              </div>
            </>
          )}

          {view === 'upload' && (
            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Upload Document for Analysis</h3>
              <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem' }}>
                Supported formats: PDF, TXT. Maximum file size: 10MB.
              </p>
              
              <div className="upload-area" onClick={handleUploadClick}>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept=".pdf,.txt"
                  onChange={handleFileChange}
                />
                <Upload size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                <h3>Click to upload a file</h3>
                <p style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
                  Your documents are processed securely by our AI backend.
                </p>
              </div>
            </div>
          )}

          {view === 'analyze' && (
            <div className="card">
              {isAnalyzing ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    border: '3px solid var(--border)', 
                    borderTopColor: 'var(--primary)', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 1.5rem auto' 
                  }}></div>
                  <h3>Analyzing Document with AI...</h3>
                  <p style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
                    Extracting text, identifying clauses, and generating summary.
                  </p>
                  <style>{`
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                  `}</style>
                </div>
              ) : analysisData ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={20} /> {fileName}
                      </h3>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Processed successfully</p>
                    </div>
                    <button className="button button-primary" onClick={() => setView('chat')}>
                      Ask Questions <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="grid">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div className="card" style={{ backgroundColor: 'var(--muted)', border: 'none' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                          <CheckCircle2 size={18} style={{ color: '#16a34a' }} /> Document Summary
                        </h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--secondary-foreground)' }}>
                          {analysisData.summary}
                        </p>
                      </div>

                      <div className="card" style={{ backgroundColor: 'var(--muted)', border: 'none' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                          <AlertTriangle size={18} style={{ color: '#dc2626' }} /> Identified Risks ({analysisData.risks.length})
                        </h4>
                        <ul style={{ fontSize: '0.9rem', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {analysisData.risks.map((risk, i) => {
                            const riskStyle = getRiskColor(risk.level);
                            return (
                              <li key={i}>
                                <strong style={{ color: riskStyle.color }}>{risk.title}:</strong> {risk.description}
                                <br/><span className={`badge ${riskStyle.badgeClass}`} style={{ marginTop: '0.25rem', ...riskStyle.badgeStyle }}>{risk.level} Risk</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>

                    <div className="card" style={{ backgroundColor: 'var(--muted)', border: 'none' }}>
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <ShieldCheck size={18} style={{ color: 'var(--primary)' }} /> Key Clauses
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {analysisData.clauses.map((clause, i) => (
                           <div key={i} style={{ backgroundColor: 'var(--background)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                             <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>{clause.title}</div>
                             <p style={{ fontSize: '0.875rem' }}>{clause.description}</p>
                           </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {view === 'chat' && (
            <div className="chat-container">
              <div className="chat-messages">
                {messages.map((msg, i) => (
                  <div key={i} className={`message ${msg.role}`}>
                    {msg.role === 'assistant' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                        <Scale size={16} /> LexAssist AI
                      </div>
                    )}
                    {msg.content}
                  </div>
                ))}
              </div>
              <div className="chat-input-area">
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Ask a question about your document..." 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                />
                <button className="button button-primary" onClick={handleSendMessage}>
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
