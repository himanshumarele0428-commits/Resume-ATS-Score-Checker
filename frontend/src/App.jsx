import React, { useState } from 'react';
import axios from 'axios';
import {
  FileText,
  Upload,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Key,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Target,
  Layout,
  FileCheck,
  Sparkles,
  Zap,
  Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'http://localhost:8001';

const SCORE_ICONS = {
  overall: Target,
  effectivity: Zap,
  layout_design: Layout,
  content_relevance: FileCheck,
  grammar_syntax: Sparkles,
  impact: Eye,
};

function getScoreColor(score) {
  if (score >= 7) return 'score-green';
  if (score >= 4) return 'score-yellow';
  return 'score-red';
}

function GaugeColor(score) {
  if (score >= 70) return 'gauge-green';
  if (score >= 40) return 'gauge-yellow';
  return 'gauge-red';
}

function ScoreCard({ id, label, score, delay }) {
  const Icon = SCORE_ICONS[id] || Target;
  const colorClass = getScoreColor(score);

  return (
    <motion.div
      className={`score-card`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Icon size={22} style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
      <div className="score-label">{label}</div>
      <div className={`score-value ${colorClass}`}>
        {score.toFixed(1)}
        <span className="out-of">/10</span>
      </div>
    </motion.div>
  );
}

function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [jdText, setJdText] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('groq');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFile(file);
    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await axios.post(`${API_URL}/upload-resume`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResumeText(res.data.resume_text);
      setFileName(res.data.filename);
      setCharCount(res.data.characters);
      setShowPreview(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload resume.');
      setResumeFile(null);
      setResumeText('');
      setFileName('');
      setCharCount(0);
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText || !jdText || !apiKey) return;

    setAnalyzing(true);
    setError('');
    setAnalysis(null);

    try {
      const res = await axios.post(`${API_URL}/analyze`, {
        resume_text: resumeText,
        jd_text: jdText,
        api_key: apiKey,
        provider: provider,
      });

      setAnalysis(res.data.analysis);
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Please check your inputs and try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const canAnalyze = resumeText && jdText.trim() && apiKey.trim() && !uploading && !analyzing;

  return (
    <div className="app-main">
      <div className="bg-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>

      <div className="app-container">
        <header className="header">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1>Resume ATS Score Checker</h1>
            <p>
              Upload your resume and a job description to get an instant ATS
              compatibility analysis powered by AI.
            </p>
          </motion.div>
        </header>

        {/* Step 1: Upload Resume */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
        >
          <div className="card-header">
            <FileText size={20} color="#8b5cf6" />
            <h3>Step 1: Upload Your Resume (PDF)</h3>
          </div>

          <label
            className={`file-upload-zone ${fileName ? 'has-file' : ''}`}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            {uploading ? (
              <>
                <Loader2 size={32} className="animate-spin upload-icon" />
                <p className="upload-text">Extracting text from PDF...</p>
              </>
            ) : fileName ? (
              <>
                <CheckCircle2 size={32} color="#10b981" />
                <p className="upload-filename">{fileName}</p>
                <p className="char-count">
                  {charCount.toLocaleString()} characters extracted
                </p>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1.25rem',
                    fontSize: '0.85rem',
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPreview(!showPreview);
                  }}
                >
                  {showPreview ? (
                    <>
                      <ChevronUp size={16} /> Hide Preview
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} /> Show Preview
                    </>
                  )}
                </button>
                {showPreview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="preview-text"
                  >
                    {resumeText.slice(0, 1000)}
                    {resumeText.length > 1000 && '...'}
                  </motion.div>
                )}
              </>
            ) : (
              <>
                <Upload size={32} className="upload-icon" />
                <p className="upload-text">
                  Click to upload your resume PDF
                </p>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.25rem',
                  }}
                >
                  Max 20MB
                </p>
              </>
            )}
          </label>
        </motion.section>

        {/* Step 2: Job Description */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card"
        >
          <div className="card-header">
            <Briefcase size={20} color="#ec4899" />
            <h3>Step 2: Paste Job Description</h3>
          </div>
          <textarea
            rows={8}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the full job description here...&#10;&#10;Include all requirements, qualifications, responsibilities, and keywords from the job posting."
            disabled={analyzing}
          />
        </motion.section>

        {/* Step 3: API Key & Analyze */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
        >
          <div className="card-header">
            <Key size={20} color="#f59e0b" />
            <h3>Step 3: Enter API Key & Analyze</h3>
          </div>

          <div className="input-group">
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className={`btn ${provider === 'groq' ? '' : 'btn-ghost'}`}
                style={{
                  flex: 1,
                  background:
                    provider === 'groq'
                      ? ''
                      : 'rgba(255,255,255,0.05)',
                }}
                onClick={() => setProvider('groq')}
              >
                Groq (Fast)
              </button>
              <button
                type="button"
                className={`btn ${provider === 'gemini' ? '' : 'btn-ghost'}`}
                style={{
                  flex: 1,
                  background:
                    provider === 'gemini'
                      ? ''
                      : 'rgba(255,255,255,0.05)',
                }}
                onClick={() => setProvider('gemini')}
              >
                Gemini (Creative)
              </button>
            </div>

            <div className="field">
              <label>{provider === 'groq' ? 'Groq API Key' : 'Gemini API Key'}</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={provider === 'groq' ? 'gsk_...' : 'AIza...'}
                disabled={analyzing}
              />
            </div>

            <button
              type="button"
              className="btn"
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              style={{ marginTop: '1rem' }}
            >
              {analyzing ? (
                <>
                  <Loader2 className="animate-spin" /> Analyzing Resume...
                </>
              ) : (
                <>
                  <Send size={20} /> Analyze Resume
                </>
              )}
            </button>
          </div>
        </motion.section>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="alert alert-error"
            >
              <AlertCircle size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="loader-container"
          >
            <div className="pulse"></div>
            <p>Analyzing your resume against the job description...</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              This may take a few moments while the AI evaluates your resume.
            </p>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {analysis && !analyzing && (
            <>
              {/* Scores Grid */}
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card"
              >
                <div className="card-header">
                  <BarChart3 size={20} color="#8b5cf6" />
                  <h3>ATS Score Breakdown</h3>
                </div>

                <div className="scores-grid">
                  {analysis.scores &&
                    Object.entries(analysis.scores).map(
                      ([key, val], idx) => (
                        <ScoreCard
                          key={key}
                          id={key}
                          label={val.label}
                          score={val.score}
                          delay={idx * 0.08}
                        />
                      )
                    )}
                </div>

                {analysis.keyword_analysis && (
                  <>
                    <div className="match-bar-container">
                      <div className="match-label">
                        <span>Keyword Match</span>
                        <span
                          className={getScoreColor(
                            analysis.keyword_analysis.match_percentage / 10
                          )}
                          style={{ fontWeight: 700 }}
                        >
                          {analysis.keyword_analysis.match_percentage}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <motion.div
                          className="progress-fill"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${analysis.keyword_analysis.match_percentage}%`,
                          }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        />
                      </div>
                    </div>

                    <div className="keywords-section">
                      <div className="keywords-title">
                        ✅ Matched Keywords ({analysis.keyword_analysis.matched_keywords.length})
                      </div>
                      <div className="keyword-badges">
                        {analysis.keyword_analysis.matched_keywords.map(
                          (kw, i) => (
                            <span key={i} className="keyword-badge matched">
                              {kw}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    <div className="keywords-section">
                      <div className="keywords-title" style={{ color: 'var(--error)' }}>
                        🔍 Missing Keywords ({analysis.keyword_analysis.missing_keywords.length})
                      </div>
                      <div className="keyword-badges">
                        {analysis.keyword_analysis.missing_keywords.map(
                          (kw, i) => (
                            <span key={i} className="keyword-badge missing">
                              {kw}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </>
                )}
              </motion.section>

              {/* Detailed Feedback */}
              {analysis.detailed_feedback && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card"
                >
                  <div className="card-header">
                    <FileCheck size={20} color="#10b981" />
                    <h3>Detailed Feedback</h3>
                  </div>

                  <div className="feedback-columns">
                    <div className="feedback-col">
                      <h4 style={{ color: 'var(--success)' }}>✅ Strengths</h4>
                      {analysis.detailed_feedback.strengths.map(
                        (item, idx) => (
                          <div key={idx} className="feedback-item">
                            {item}
                          </div>
                        )
                      )}
                    </div>
                    <div className="feedback-col">
                      <h4 style={{ color: 'var(--error)' }}>
                        🙈 Areas for Improvement
                      </h4>
                      {analysis.detailed_feedback.improvements.map(
                        (item, idx) => (
                          <div key={idx} className="feedback-item">
                            {item}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Summary */}
              {analysis.summary && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass-card"
                >
                  <div className="card-header">
                    <Sparkles size={20} color="#f59e0b" />
                    <h3>Overall Assessment</h3>
                  </div>
                  <p className="summary-text">{analysis.summary}</p>

                  {analysis.ats_readability_score != null && (
                    <div className="readability-gauge">
                      <div className="gauge-label">ATS Readability Score</div>
                      <div
                        className={`gauge-value ${GaugeColor(
                          analysis.ats_readability_score
                        )}`}
                      >
                        {analysis.ats_readability_score}/100
                      </div>
                    </div>
                  )}
                </motion.section>
              )}
            </>
          )}
        </AnimatePresence>

        <footer>
          Built with ❤️ using Groq AI &amp; FastAPI
        </footer>
      </div>
    </div>
  );
}

export default App;
