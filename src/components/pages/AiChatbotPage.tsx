import React, { useState, useRef, useEffect } from 'react';
import { Student } from '../../types/student';
import { resolveStudentId } from '../../data/collegeDatabase';
import { useAuth } from '../../firebase/AuthContext';
import { db } from '../../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import {
  MessageSquareCode,
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Download,
  BookOpen,
  Briefcase,
  HeartHandshake,
  Cpu,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  GraduationCap
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export type AdvisorPersona = 'academic-remediation' | 'placement-mentor' | 'wellbeing-coach' | 'general-advisor';

interface AiChatbotPageProps {
  students: Student[];
  currentStudentId: string;
  onSelectStudent: (id: string) => void;
}

export function AiChatbotPage({
  students,
  currentStudentId,
  onSelectStudent,
}: AiChatbotPageProps) {
  const { user, userType, role } = useAuth();
  const student = resolveStudentId(currentStudentId, students) || students[0];

  const [persona, setPersona] = useState<AdvisorPersona>('placement-mentor');
  const [modelName, setModelName] = useState<string>('gemini-3.8-flash');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Multi-turn conversation state with default welcome message
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-init-1',
        role: 'model',
        content: `👋 Hello! I am **EduNexus Advisor**, the AI Advisory Chatbot for our educational institution.

I assist **students** and **staff** with:
- 💻 **Academics & Coding**: Coursework, homework guidance, web development/programming requirements, study tips, exam schedules, and technical definitions (e.g., ECE, CSE, GPA, ID).
- 🏛️ **Campus Life & Policies**: University events, administrative guidelines, and student support policies.
- 🚀 **Career & Placements**: Internships, campus placements, and resume reviews.
- 🧑‍🏫 **Staff & Faculty**: Teaching resources, curriculum guidelines, and administrative policies.

*Active Context: **${student.name}** (${student.department}, Semester ${student.semester}, GPA: ${student.academic.gpa.toFixed(1)}, Target: ${student.placement.preferredDomain})*.

How may I assist you with your academic, programming, or campus inquiries today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.8-flash',
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const personaConfig = {
    'placement-mentor': {
      title: 'Career & Placement Mentor',
      badge: 'Internships, Resumes & Drives',
      icon: Briefcase,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      description: 'Campus placement preparation, internships, resume reviews, DSA technical interviews, and graduation readiness.',
      suggestions: [
        `How do I tailor my resume for on-campus ${student.placement.preferredDomain} placement drives?`,
        `What are the eligibility criteria and graduation requirements for semester 6 campus internships?`,
        `Ask 3 technical interview questions for ${student.placement.preferredDomain}`,
      ],
    },
    'academic-remediation': {
      title: 'Academic Remediation Strategist',
      badge: 'Curriculum & Backlogs',
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      description: 'Backlog recovery calendars, core subject prerequisites, and internal exam scoring improvement.',
      suggestions: [
        `Draft a 4-week recovery timetable for ${student.name}'s ${student.academic.backlogsCount} backlog(s)`,
        `What foundational topics are prerequisites before attempting semester 6 core exams?`,
        `How to balance daily attendance (${student.attendance.overallPercentage}%) while clearing assignments?`,
      ],
    },
    'wellbeing-coach': {
      title: 'Student Wellbeing Counselor',
      badge: 'Wellness & Motivation',
      icon: HeartHandshake,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      description: 'Empathetic guidance, stress management during exam crunch periods, and study habits.',
      suggestions: [
        `How should an advisor address ${student.name}'s concern: "${student.feedback.primaryConcernArea}"?`,
        `Provide an encouraging talk track for an upcoming 1-on-1 mentoring meeting`,
        `Techniques to overcome exam anxiety and procrastination under time pressure`,
      ],
    },
    'general-advisor': {
      title: 'Institutional & Academic Advisor',
      badge: 'Policies & Staff Duties',
      icon: Cpu,
      color: 'text-slate-700 bg-slate-100 border-slate-200',
      description: 'Holistic institutional guidance, academic calendar events, administrative guidelines, and staff role duties.',
      suggestions: [
        `What are the institutional attendance policies for semester exam eligibility?`,
        `What teaching resources and support frameworks are available for faculty mentors?`,
        `Summarize ${student.name}'s biggest risk factors and strengths`,
      ],
    },
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputMessage('');
    setLoading(true);

    // Only include actual conversation messages (strip initial model greeting from API payload to ensure first turn is user)
    const validHistoryForApi = newHistory
      .filter((m) => m.id !== 'msg-init-1' && m.content.trim().length > 0)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: validHistoryForApi.length > 0 ? validHistoryForApi : [{ role: 'user', content: text }],
          rolePersona: persona,
          studentContext: student,
          modelName: modelName,
          userRole: role || (userType === 'staff' ? 'Faculty Advisor' : 'Student'),
          userType: userType || 'student',
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Chatbot request failed');
      }

      const data = await response.json();
      const botMessage: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        role: 'model',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || modelName,
      };

      setMessages([...newHistory, botMessage]);

      // If user is authenticated, save chat session log to Firestore
      if (user) {
        try {
          await addDoc(collection(db, 'ai_chats'), {
            studentId: student.id,
            studentName: student.name,
            userQuery: text,
            modelResponse: data.reply,
            persona,
            modelUsed: data.modelUsed || modelName,
            facultyUid: user.uid,
            facultyEmail: user.email || '',
            timestamp: new Date().toISOString(),
          });
        } catch (dbErr) {
          console.warn('Chat log save note:', dbErr);
        }
      }
    } catch (err: any) {
      const errMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'model',
        content: `⚠️ **Error communicating with Gemini:** ${err?.message || 'Please check network connection and try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...newHistory, errMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `msg-init-${Date.now()}`,
        role: 'model',
        content: `Conversation reset. Ready to analyze **${student.name}** with the **${personaConfig[persona].title}** persona.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: modelName,
      },
    ]);
  };

  const handleExportTranscript = () => {
    const transcript = messages
      .map((m) => `[${m.timestamp}] ${m.role === 'user' ? 'User' : 'EduNexus AI (' + (m.modelUsed || modelName) + ')'}:\n${m.content}\n`)
      .join('\n------------------------\n\n');

    const blob = new Blob([transcript], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `EduNexus_Chat_Transcript_${student.id}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentPersonaInfo = personaConfig[persona];

  return (
    <div className="space-y-4 pb-10 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/50 w-fit mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Multi-Turn Reasoning Chatbot</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            EduNexus AI Advisory Chatbot
          </h2>
          <p className="text-xs text-slate-500">
            Context-grounded reasoning with custom system instructions, conversational memory, and role personas
          </p>
        </div>

        {/* Model & Student Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Target Student Selector */}
          {userType === 'student' ? (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1 text-xs text-blue-900 font-semibold shadow-2xs">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{student.name} ({student.id})</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700">
              <span className="text-[11px] text-slate-400">Context Student:</span>
              <select
                value={student.id}
                onChange={(e) => onSelectStudent(e.target.value)}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id.split('-').pop()})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Model Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700">
            <span className="text-[11px] text-slate-400">Gemini Model:</span>
            <select
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="bg-transparent font-semibold text-blue-700 focus:outline-none cursor-pointer"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (General Tasks)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fastest)</option>
              <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex STEM)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Role Persona Segmented Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {(Object.keys(personaConfig) as AdvisorPersona[]).map((key) => {
          const cfg = personaConfig[key];
          const Icon = cfg.icon;
          const isSelected = persona === key;
          return (
            <button
              key={key}
              onClick={() => setPersona(key)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                <span className="text-xs font-bold truncate">{cfg.title}</span>
              </div>
              <p className={`text-[11px] line-clamp-1 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                {cfg.badge}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Student Context Chip Strip */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600">
          <span className="font-semibold text-slate-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Active Context: {student.name}
          </span>
          <span>·</span>
          <span>GPA: <strong>{student.academic.gpa.toFixed(1)}</strong></span>
          <span>·</span>
          <span>Attendance: <strong className={student.attendance.overallPercentage < 75 ? 'text-red-600' : 'text-slate-800'}>{student.attendance.overallPercentage}%</strong></span>
          <span>·</span>
          <span>Backlogs: <strong>{student.academic.backlogsCount}</strong></span>
          <span>·</span>
          <span>Domain: <strong>{student.placement.preferredDomain}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 transition-colors"
            title="Clear Chat History"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Chat</span>
          </button>
          <span>·</span>
          <button
            onClick={handleExportTranscript}
            className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold transition-colors"
            title="Download conversation as markdown"
          >
            <Download className="w-3 h-3" />
            <span>Export Transcript</span>
          </button>
        </div>
      </div>

      {/* Main Chat Thread Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[520px]">
        {/* Messages Thread (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs leading-relaxed ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 space-y-1.5 relative group ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-xs'
                      : 'bg-slate-50 text-slate-900 border border-slate-200/80 rounded-tl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] opacity-70 mb-1">
                    <span className="font-semibold">
                      {isUser ? 'You' : `EduNexus Advisor (${msg.modelUsed || modelName})`}
                    </span>
                    <span className="font-mono">{msg.timestamp}</span>
                  </div>

                  {/* Message Markdown Body */}
                  {msg.content.toLowerCase().includes('out of academics') ||
                  msg.content.toLowerCase().includes('out off acadamics') ||
                  msg.content.toLowerCase().includes('not relate to subject') ||
                  msg.modelUsed === 'domain-policy-guardrail' ? (
                    <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded-xl text-amber-950 text-xs space-y-2 shadow-xs">
                      <div className="flex items-center gap-2 font-bold text-amber-900 border-b border-amber-200/80 pb-2">
                        <span className="p-1 rounded-md bg-amber-200/80 text-amber-800">
                          <AlertCircle className="w-4 h-4" />
                        </span>
                        <div>
                          <div className="text-xs">Out of Domain Policy Enforced</div>
                          <div className="text-[10px] text-amber-700 font-normal">Only academic, university curriculum & educational queries permitted</div>
                        </div>
                      </div>
                      <p className="font-semibold text-amber-950 text-xs leading-relaxed bg-white/70 p-2.5 rounded-lg border border-amber-200">
                        {msg.content}
                      </p>
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[11px] font-bold text-amber-900">
                          💡 Recommended Academic & Subject Questions:
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {[
                            'Explain Quicksort vs Mergesort time complexities',
                            'How to prepare for semester exams and avoid backlogs?',
                            'What is the difference between ARM Cortex-M and Cortex-A?',
                            'Explain the B+ Tree index structure in PostgreSQL',
                            'Derive Nyquist-Shannon sampling theorem',
                          ].map((chip, cIdx) => (
                            <button
                              key={cIdx}
                              onClick={() => handleSendMessage(chip)}
                              className="text-[10px] font-medium bg-white hover:bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md border border-amber-300 transition-colors cursor-pointer text-left"
                            >
                              + {chip}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 whitespace-pre-wrap">
                      {msg.content.split('\n\n').map((block, idx) => {
                        if (block.startsWith('### ')) {
                          return (
                            <div key={idx} className="font-bold text-sm tracking-tight text-blue-900 pt-1">
                              {block.replace('### ', '')}
                            </div>
                          );
                        }
                        return <p key={idx}>{block}</p>;
                      })}
                    </div>
                  )}

                  {/* Copy Button */}
                  {!isUser && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="text-[10px] text-slate-400 hover:text-slate-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copy message text"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-3 text-xs justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-500 text-xs flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Gemini is reasoning through multi-pillar telemetry...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 overflow-x-auto flex items-center gap-2">
          <span className="text-[10px] font-semibold text-slate-400 shrink-0">Prompts:</span>
          {currentPersonaInfo.suggestions.map((promptText, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(promptText)}
              disabled={loading}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Input Field Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={`Ask ${currentPersonaInfo.title} about ${student.name}'s progress or roadmaps...`}
            disabled={loading}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={loading || !inputMessage.trim()}
            className="flex items-center justify-center p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl transition-colors cursor-pointer shadow-xs shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
