import React, { useState } from 'react';
import { InterventionRecord, Student, Department } from '../../types/student';
import { DetailModal } from '../modals/DetailModal';
import {
  ClipboardList,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  User,
  Calendar,
  X,
  Filter,
  Sparkles,
  Award
} from 'lucide-react';

interface InterventionTrackerProps {
  interventions: InterventionRecord[];
  students: Student[];
  onAddIntervention: (record: InterventionRecord) => void;
  onUpdateIntervention: (record: InterventionRecord) => void;
  onSelectStudent: (studentId: string) => void;
  initialSelectedStudentId?: string;
}

export function InterventionTracker({
  interventions,
  students,
  onAddIntervention,
  onUpdateIntervention,
  onSelectStudent,
  initialSelectedStudentId,
}: InterventionTrackerProps) {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailInterventionId, setDetailInterventionId] = useState<string>('');

  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState(initialSelectedStudentId || students[0]?.id || '');
  const [sessionType, setSessionType] = useState<InterventionRecord['type']>('1-on-1 Mentoring');
  const [facultyLead, setFacultyLead] = useState('Dr. Ramesh Sundaram');
  const [dateScheduled, setDateScheduled] = useState('2026-10-15');
  const [initialMetricNote, setInitialMetricNote] = useState('');
  const [initialScore, setInitialScore] = useState(60);

  const filteredList = interventions.filter((item) => {
    return statusFilter === 'All' || item.status === statusFilter;
  });

  const handleOpenModal = () => {
    const student = students.find((s) => s.id === selectedStudentId) || students[0];
    if (student) {
      setInitialScore(student.compositeScore);
      setFacultyLead(student.mentorName || 'Faculty Advisor');
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) return;

    const newRecord: InterventionRecord = {
      id: `INT-${Date.now().toString().slice(-4)}`,
      studentId: student.id,
      studentName: student.name,
      department: student.department,
      type: sessionType,
      facultyLead: facultyLead,
      dateScheduled: dateScheduled,
      status: 'Scheduled',
      initialScore: initialScore,
      initialMetricNote: initialMetricNote || 'Identified through Early Support Radar trigger.',
    };

    onAddIntervention(newRecord);
    setIsModalOpen(false);
    setInitialMetricNote('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & New Record Trigger */}
      <div className="bg-gradient-to-r from-emerald-900/10 via-teal-900/5 to-blue-900/10 border border-emerald-200/90 rounded-3xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 w-fit mb-2 shadow-xs">
            <ClipboardList className="w-3.5 h-3.5 text-emerald-600" />
            <span>Support Operations & Measurable Progress</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Intervention Tracker & Outcome Measurement
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Documenting faculty mentoring sessions, remedial classes, and verifying before-after progress
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white rounded-xl px-3 py-2 border border-slate-300 shadow-xs">
            <span className="font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses ({interventions.length})</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Follow-up Required">Follow-up Required</option>
            </select>
          </div>

          <button
            onClick={handleOpenModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Mentoring Session</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip with Attractive Pastel Themes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-white via-white to-blue-50/50 border border-blue-200/90 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          <div className="text-xs text-slate-700 font-bold uppercase tracking-wider">Total Sessions Logged</div>
          <div className="text-3xl font-black font-mono text-slate-900 mt-1">{interventions.length}</div>
          <div className="text-[11px] text-blue-700 font-semibold mt-0.5">Formal interventions recorded</div>
        </div>

        <div className="bg-gradient-to-br from-white via-white to-emerald-50/50 border border-emerald-200/90 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
          <div className="text-xs text-slate-700 font-bold uppercase tracking-wider">Completed Outcomewise</div>
          <div className="text-3xl font-black font-mono text-emerald-700 mt-1">
            {interventions.filter((i) => i.status === 'Completed').length}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Verified outcome gains</div>
        </div>

        <div className="bg-gradient-to-br from-white via-white to-amber-50/50 border border-amber-200/90 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
          <div className="text-xs text-slate-700 font-bold uppercase tracking-wider">In Active Progress</div>
          <div className="text-3xl font-black font-mono text-amber-700 mt-1">
            {interventions.filter((i) => i.status === 'In Progress').length}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-0.5">Action plans ongoing</div>
        </div>

        <div className="bg-gradient-to-br from-white via-white to-purple-50/50 border border-purple-200/90 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          <div className="text-xs text-slate-700 font-bold uppercase tracking-wider">Average Score Gain</div>
          <div className="text-3xl font-black font-mono text-purple-700 mt-1">+5.3 pts</div>
          <div className="text-[11px] text-purple-700 font-semibold mt-0.5">Measured across cohorts</div>
        </div>
      </div>

      {/* Intervention Feed */}
      <div className="space-y-4">
        {filteredList.map((item) => {
          const scoreDelta =
            item.postInterventionScore ? item.postInterventionScore - item.initialScore : null;

          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">{item.id}</span>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {item.type}
                    </span>
                    <span className="text-xs text-slate-600 font-medium">{item.department}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-1.5 flex items-center gap-2">
                    <button
                      onClick={() => onSelectStudent(item.studentId)}
                      className="hover:text-blue-600 hover:underline cursor-pointer"
                    >
                      {item.studentName} ({item.studentId})
                    </button>
                    <span className="text-slate-400 font-normal">· Lead Mentor: <strong className="text-slate-700">{item.facultyLead}</strong></span>
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      item.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : item.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                    }`}
                  >
                    {item.status}
                  </span>

                  <div className="text-xs font-mono text-slate-500 font-semibold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    {item.dateScheduled}
                  </div>
                </div>
              </div>

              {/* Progress Measurement Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-50/70 rounded-xl border border-slate-200 text-xs mt-3">
                <div>
                  <span className="text-slate-500 font-semibold">Baseline Telemetry Note:</span>
                  <div className="font-medium text-slate-800 mt-0.5">{item.initialMetricNote}</div>
                </div>

                <div>
                  <span className="text-slate-500 font-semibold">Baseline Score:</span>
                  <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                    {item.initialScore} / 100
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-semibold">Post-Intervention Outcome:</span>
                  {item.postInterventionScore ? (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-bold text-emerald-700 text-sm">
                        {item.postInterventionScore} / 100
                      </span>
                      {scoreDelta !== null && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                          +{scoreDelta} pts gain
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-slate-400 italic mt-0.5">Pending completion review</div>
                  )}
                </div>
              </div>

              {item.measuredOutcomeNote && (
                <div className="mt-3 text-xs bg-emerald-50/80 border border-emerald-200 p-3 rounded-xl text-emerald-950 font-medium flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Measured Institutional Outcome:</strong> {item.measuredOutcomeNote}
                  </span>
                </div>
              )}

              {item.studentFeedback && (
                <div className="mt-2 text-xs bg-blue-50/60 border border-blue-200 p-3 rounded-xl text-blue-950 font-medium">
                  <strong>Student Qualitative Feedback:</strong> "{item.studentFeedback}"
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    setDetailInterventionId(item.id);
                    setDetailModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>More Information & Action History</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Log New Mentoring Session */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">Log Remedial / Mentoring Session</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Student:</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    const st = students.find((s) => s.id === e.target.value);
                    if (st) setInitialScore(st.compositeScore);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.department}, Score: {s.compositeScore})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Intervention Type:</label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="1-on-1 Mentoring">1-on-1 Mentoring</option>
                    <option value="Remedial Class">Remedial Class</option>
                    <option value="Career Counseling">Career Counseling</option>
                    <option value="Study Group Assignment">Study Group Assignment</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date Scheduled:</label>
                  <input
                    type="date"
                    value={dateScheduled}
                    onChange={(e) => setDateScheduled(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Faculty Lead Name:</label>
                <input
                  type="text"
                  value={facultyLead}
                  onChange={(e) => setFacultyLead(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Context / Identified Diagnostic Notes:
                </label>
                <textarea
                  rows={3}
                  value={initialMetricNote}
                  onChange={(e) => setInitialMetricNote(e.target.value)}
                  placeholder="Outline syllabus backlog topics, attendance targets, or coding practice sets assigned..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  Schedule Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal for Intervention Details */}
      <DetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        modalType="intervention"
        targetId={detailInterventionId}
      />
    </div>
  );
}
