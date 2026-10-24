import React, { useState, useEffect } from 'react';
import { Student, UserType } from '../../types/student';
import { resolveStudentId } from '../../data/collegeDatabase';
import { useAuth } from '../../firebase/AuthContext';
import {
  Compass,
  CheckCircle2,
  Circle,
  BookOpen,
  Code2,
  Brain,
  Video,
  FolderGit2,
  Award,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Target,
  Plus,
  ShieldCheck,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  AlertTriangle,
  RefreshCw,
  Layers,
  FileCheck2,
  GraduationCap
} from 'lucide-react';

interface GrowthNavigatorProps {
  students: Student[];
  currentStudentId: string;
  onSelectStudent: (id: string) => void;
  onNavigateToTab?: (tab: any) => void;
  userType?: UserType;
}

export interface GrowthMilestone {
  id: string;
  phaseId: 'phase-1' | 'phase-2' | 'phase-3' | 'phase-4';
  phaseTitle: string;
  category: 'Subject Revision' | 'Coding Practice' | 'Aptitude Drill' | 'Mock Interview' | 'Capstone Project' | 'Certification' | 'Lab Mastery' | 'Backlog Remediation';
  title: string;
  deadline: string;
  estimatedHours: number;
  completed: boolean;
  completedAt?: string;
  resourceLink: string;
  learningOutcome?: string;
  verifiedByMentor?: boolean;
}

export interface RoadmapPhase {
  id: 'phase-1' | 'phase-2' | 'phase-3' | 'phase-4';
  title: string;
  weeksRange: string;
  focusDescription: string;
  status: 'Completed' | 'In Progress' | 'Upcoming';
}

export interface StudentGrowthRoadmap {
  studentId: string;
  studentName: string;
  department: string;
  mentorName: string;
  targetDomain: string;
  currentPhase: 'phase-1' | 'phase-2' | 'phase-3' | 'phase-4';
  mentorEndorsementNotes?: string;
  mentorEndorsedAt?: string;
  phases: RoadmapPhase[];
  milestones: GrowthMilestone[];
}

export function GrowthNavigator({
  students,
  currentStudentId,
  onSelectStudent,
  onNavigateToTab,
  userType = 'student',
}: GrowthNavigatorProps) {
  const { userType: authUserType, activeStudentId } = useAuth();
  const effectiveUserType = userType || authUserType;

  // Strict verification: if student, block access to other students' data and enforce own record
  const targetStudentId = effectiveUserType === 'student' && activeStudentId ? activeStudentId : currentStudentId;
  const student = resolveStudentId(targetStudentId, students) || students[0];

  const [roadmap, setRoadmap] = useState<StudentGrowthRoadmap | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<'all' | 'phase-1' | 'phase-2' | 'phase-3' | 'phase-4'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom milestone modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPhaseId, setNewPhaseId] = useState<'phase-1' | 'phase-2' | 'phase-3' | 'phase-4'>('phase-2');
  const [newCategory, setNewCategory] = useState<GrowthMilestone['category']>('Subject Revision');
  const [newHours, setNewHours] = useState('6');
  const [newDeadline, setNewDeadline] = useState('Next 2 Weeks');
  const [newResource, setNewResource] = useState('');
  const [newOutcome, setNewOutcome] = useState('');

  // Mentor endorsement modal state
  const [isEndorseModalOpen, setIsEndorseModalOpen] = useState<boolean>(false);
  const [endorsementInput, setEndorsementInput] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch structured roadmap from backend
  const fetchRoadmap = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/growth-roadmap/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.roadmap) {
          setRoadmap(data.roadmap);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch growth roadmap from backend:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (student?.id) {
      fetchRoadmap(student.id);
    }
  }, [student?.id]);

  // Toggle milestone completion
  const handleToggleMilestone = async (milestoneId: string) => {
    if (!roadmap) return;

    // Optimistic UI update
    const updatedMilestones = roadmap.milestones.map((m) =>
      m.id === milestoneId
        ? {
            ...m,
            completed: !m.completed,
            completedAt: !m.completed ? new Date().toISOString().split('T')[0] : undefined,
          }
        : m
    );

    setRoadmap({
      ...roadmap,
      milestones: updatedMilestones,
    });

    try {
      const res = await fetch(`/api/growth-roadmap/${student.id}/milestone/${milestoneId}/toggle`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.roadmap) {
          setRoadmap(data.roadmap);
        }
        showToast(data.message || 'Milestone updated in backend database.');
      }
    } catch (err) {
      console.warn('Backend milestone toggle error:', err);
    }
  };

  // Add custom milestone
  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !roadmap) return;

    try {
      const res = await fetch(`/api/growth-roadmap/${student.id}/custom-milestone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          phaseId: newPhaseId,
          category: newCategory,
          estimatedHours: parseInt(newHours) || 4,
          deadline: newDeadline,
          resourceLink: newResource.trim() || 'Department Course Syllabus',
          learningOutcome: newOutcome.trim() || 'Reinforced academic and technical problem solving.',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.roadmap) {
          setRoadmap(data.roadmap);
        }
        showToast('New structured milestone saved to backend roadmap!');
        setIsAddModalOpen(false);
        setNewTitle('');
        setNewResource('');
        setNewOutcome('');
      }
    } catch (err) {
      console.warn('Failed to add custom milestone:', err);
    }
  };

  // Submit mentor endorsement
  const handleSubmitEndorsement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadmap) return;

    try {
      const res = await fetch(`/api/growth-roadmap/${student.id}/mentor-endorsement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: endorsementInput.trim() || 'Progress verified by faculty advisor. Good academic vector.',
          mentorName: student.mentorName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.roadmap) {
          setRoadmap(data.roadmap);
        }
        showToast('Faculty mentor endorsement saved to backend database!');
        setIsEndorseModalOpen(false);
        setEndorsementInput('');
      }
    } catch (err) {
      console.warn('Endorsement submission failed:', err);
    }
  };

  const milestones = roadmap?.milestones || [];
  const phases = roadmap?.phases || [];

  const completedCount = milestones.filter((m) => m.completed).length;
  const totalCount = milestones.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalHours = milestones.reduce((sum, m) => sum + (m.estimatedHours || 0), 0);
  const completedHours = milestones
    .filter((m) => m.completed)
    .reduce((sum, m) => sum + (m.estimatedHours || 0), 0);

  // Filtered milestones
  const filteredMilestones = milestones.filter((m) => {
    if (selectedPhaseFilter !== 'all' && m.phaseId !== selectedPhaseFilter) {
      return false;
    }
    if (categoryFilter !== 'all' && m.category !== categoryFilter) {
      return false;
    }
    return true;
  });

  const categoryThemes: Record<
    string,
    { icon: any; color: string; bg: string; border: string }
  > = {
    'Subject Revision': {
      icon: BookOpen,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
    'Coding Practice': {
      icon: Code2,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
    'Aptitude Drill': {
      icon: Brain,
      color: 'text-purple-700',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
    },
    'Mock Interview': {
      icon: Video,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    'Capstone Project': {
      icon: FolderGit2,
      color: 'text-cyan-700',
      bg: 'bg-cyan-50',
      border: 'border-cyan-200',
    },
    'Certification': {
      icon: Award,
      color: 'text-teal-700',
      bg: 'bg-teal-50',
      border: 'border-teal-200',
    },
    'Lab Mastery': {
      icon: Target,
      color: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
    },
    'Backlog Remediation': {
      icon: AlertTriangle,
      color: 'text-orange-700',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
    },
  };

  const gpaGrowth = student.academic.gpa - student.academic.previousSemesterGpa;

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl border border-blue-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom duration-300 max-w-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium leading-relaxed">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-700/50 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-200 border border-blue-400/40 backdrop-blur-xs">
                <Compass className="w-3.5 h-3.5 text-blue-300 animate-pulse" />
                Structured Academic & Career Growth Navigator
              </span>
              <span className="text-[11px] text-blue-200/80 font-mono">
                {student.department} · Sem {student.semester}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Personalized Growth Journey: {student.name}
            </h1>

            <p className="text-xs md:text-sm text-blue-100/90 leading-relaxed">
              A 4-phase structured pathway engineered with university faculty to transition from prerequisite foundation to core engineering mastery, industry certifications, and career placement launch.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-blue-200/80">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Mentor: <strong className="text-white">{student.mentorName}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-blue-300" />
                <span>Domain Track: <strong className="text-white">{student.placement.preferredDomain}</strong></span>
              </div>
            </div>
          </div>

          {/* Student Selector & Action Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {effectiveUserType === 'student' ? (
              <div className="flex items-center gap-2 bg-blue-950/80 border border-blue-400/40 rounded-2xl px-4 py-2 text-xs text-blue-200 font-bold shadow-2xs">
                <GraduationCap className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Student Session: {student.name} ({student.id})</span>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 flex items-center gap-2">
                <span className="text-xs text-blue-200 font-semibold px-2">Student:</span>
                <select
                  value={student.id}
                  onChange={(e) => onSelectStudent(e.target.value)}
                  className="bg-slate-900/90 text-white font-bold text-xs p-2 rounded-xl border border-blue-400/40 focus:outline-none cursor-pointer"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id} · {s.department.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.03] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Goal</span>
            </button>
          </div>
        </div>

        {/* Growth Trajectory Vector Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-center">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
            <div className="text-[11px] text-blue-200/80 font-semibold uppercase tracking-wider">Overall Progress</div>
            <div className="text-xl md:text-2xl font-black font-mono text-emerald-400 mt-0.5">
              {progressPercent}%
            </div>
            <div className="text-[10px] text-blue-300/70">{completedCount} of {totalCount} Milestones Done</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
            <div className="text-[11px] text-blue-200/80 font-semibold uppercase tracking-wider">CGPA Growth Vector</div>
            <div className="text-xl md:text-2xl font-black font-mono text-white mt-0.5 flex items-center justify-center gap-1">
              <span>{student.academic.gpa.toFixed(1)}</span>
              <span className={`text-xs font-bold ${gpaGrowth >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                ({gpaGrowth >= 0 ? `+${gpaGrowth.toFixed(1)}` : gpaGrowth.toFixed(1)})
              </span>
            </div>
            <div className="text-[10px] text-blue-300/70">Prev: {student.academic.previousSemesterGpa.toFixed(1)}</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
            <div className="text-[11px] text-blue-200/80 font-semibold uppercase tracking-wider">Attendance Health</div>
            <div className={`text-xl md:text-2xl font-black font-mono mt-0.5 ${student.attendance.overallPercentage < 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {student.attendance.overallPercentage}%
            </div>
            <div className="text-[10px] text-blue-300/70">{student.attendance.overallPercentage >= 75 ? 'Statutory Compliant' : 'Remedial Warning'}</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
            <div className="text-[11px] text-blue-200/80 font-semibold uppercase tracking-wider">Effort Invested</div>
            <div className="text-xl md:text-2xl font-black font-mono text-white mt-0.5">
              {completedHours} / {totalHours} hrs
            </div>
            <div className="text-[10px] text-blue-300/70">Dedicated Practice Hours</div>
          </div>
        </div>
      </div>

      {/* 4-PHASE STRUCTURED PROGRESSION PATHWAY CARDS */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-700 text-xs font-bold mb-1">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Multi-Stage Progressive Roadmap Architecture</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Sequential 4-Phase Growth Pathway
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Students advance through verified academic milestones to ensure comprehensive career and subject readiness.
            </p>
          </div>

          <button
            onClick={() => fetchRoadmap(student.id)}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 font-semibold px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Sync Backend</span>
          </button>
        </div>

        {/* Phase Timeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          {phases.map((phase, idx) => {
            const phaseMilestones = milestones.filter((m) => m.phaseId === phase.id);
            const pDone = phaseMilestones.filter((m) => m.completed).length;
            const pTotal = phaseMilestones.length;
            const pPct = pTotal > 0 ? Math.round((pDone / pTotal) * 100) : 0;
            const isSelected = selectedPhaseFilter === phase.id;

            let badgeBg = 'bg-slate-100 text-slate-700 border-slate-200';
            if (phase.status === 'Completed') {
              badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
            } else if (phase.status === 'In Progress') {
              badgeBg = 'bg-blue-100 text-blue-800 border-blue-300';
            }

            return (
              <div
                key={phase.id}
                onClick={() => setSelectedPhaseFilter(isSelected ? 'all' : phase.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400">STAGE {idx + 1}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeBg}`}>
                      {phase.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 leading-snug">
                    {phase.title.replace(/Phase \d+: /, '')}
                  </h3>

                  <div className="text-[11px] font-mono text-blue-700 font-medium">
                    {phase.weeksRange}
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">
                    {phase.focusDescription}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600">
                    <span>{pDone}/{pTotal} Done</span>
                    <span>{pPct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${pPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Faculty Advisor Endorsement Panel */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-3xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Faculty Mentor Observation & Roadmap Endorsement</span>
          </div>
          <p className="text-xs text-emerald-950 font-medium leading-relaxed">
            {roadmap?.mentorEndorsementNotes ||
              `Assigned advisor (${student.mentorName}) actively reviews ${student.name}'s weekly milestones. Progress recorded here syncs directly to institutional academic dossiers.`}
          </p>
          {roadmap?.mentorEndorsedAt && (
            <div className="text-[10px] text-emerald-700 font-mono">
              Last Signed Off: {new Date(roadmap.mentorEndorsedAt).toLocaleDateString()} by {student.mentorName}
            </div>
          )}
        </div>

        <button
          onClick={() => setIsEndorseModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-emerald-600 hover:text-white text-emerald-800 font-bold text-xs rounded-xl border border-emerald-300 shadow-2xs transition-all cursor-pointer"
        >
          <FileCheck2 className="w-4 h-4" />
          <span>{roadmap?.mentorEndorsedAt ? 'Update Endorsement' : 'Endorse Stage'}</span>
        </button>
      </div>

      {/* FILTER CONTROLS & ROADMAP MILESTONES CHECKLIST */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {selectedPhaseFilter === 'all' ? 'All Roadmap Action Items & Sprints' : phases.find((p) => p.id === selectedPhaseFilter)?.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click checkbox to toggle completion · Updates immediately persist in backend database
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setSelectedPhaseFilter('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedPhaseFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Stages ({milestones.length})
              </button>
              {phases.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPhaseFilter(p.id)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedPhaseFilter === p.id ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Phase {idx + 1}
                </button>
              ))}
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-700 cursor-pointer focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Subject Revision">Subject Revision</option>
              <option value="Coding Practice">Coding Practice</option>
              <option value="Aptitude Drill">Aptitude Drill</option>
              <option value="Lab Mastery">Lab Mastery</option>
              <option value="Mock Interview">Mock Interview</option>
              <option value="Capstone Project">Capstone Project</option>
              <option value="Certification">Certification</option>
            </select>
          </div>
        </div>

        {/* Milestones List */}
        <div className="space-y-3">
          {filteredMilestones.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs font-medium">No milestones match the selected filter criteria.</p>
              <button
                onClick={() => {
                  setSelectedPhaseFilter('all');
                  setCategoryFilter('all');
                }}
                className="mt-2 text-xs text-blue-600 hover:underline font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredMilestones.map((m) => {
              const theme = categoryThemes[m.category] || categoryThemes['Subject Revision'];
              const Icon = theme.icon;

              return (
                <div
                  key={m.id}
                  onClick={() => handleToggleMilestone(m.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                    m.completed
                      ? 'bg-emerald-50/40 border-emerald-200 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50/60 shadow-2xs'
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 shrink-0 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    {m.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0 text-xs space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${theme.bg} ${theme.color} ${theme.border}`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{m.category}</span>
                      </span>
                      <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {m.phaseTitle}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">Due: {m.deadline}</span>
                      <span className="text-[11px] text-slate-400">·</span>
                      <span className="text-[11px] text-slate-600 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {m.estimatedHours} hrs study
                      </span>
                      {m.completed && m.completedAt && (
                        <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                          Completed on {m.completedAt}
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-sm font-bold ${
                        m.completed ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {m.title}
                    </h4>

                    {m.learningOutcome && (
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        🎯 <strong className="text-slate-700">Outcome:</strong> {m.learningOutcome}
                      </p>
                    )}

                    <div className="pt-1 text-[11px] text-blue-700 font-medium flex items-center gap-1">
                      <span>Curricular Resource:</span>
                      <span className="underline truncate max-w-md">{m.resourceLink}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL: ADD PERSONALIZED MILESTONE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Add Growth Roadmap Goal</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMilestone} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Goal / Milestone Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Graph BFS/DFS implementations or Complete FPGA Laboratory Assignment"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Roadmap Stage</label>
                  <select
                    value={newPhaseId}
                    onChange={(e) => setNewPhaseId(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="phase-1">Phase 1: Foundation & Remediation</option>
                    <option value="phase-2">Phase 2: Core Engineering</option>
                    <option value="phase-3">Phase 3: Industry Skills</option>
                    <option value="phase-4">Phase 4: Placement & Capstone</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="Subject Revision">Subject Revision</option>
                    <option value="Coding Practice">Coding Practice</option>
                    <option value="Aptitude Drill">Aptitude Drill</option>
                    <option value="Lab Mastery">Lab Mastery</option>
                    <option value="Mock Interview">Mock Interview</option>
                    <option value="Capstone Project">Capstone Project</option>
                    <option value="Certification">Certification</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newHours}
                    onChange={(e) => setNewHours(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Deadline</label>
                  <input
                    type="text"
                    placeholder="e.g. Week 7 · Wednesday"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Resource / Course Link</label>
                <input
                  type="text"
                  placeholder="e.g. Department LMS Lecture Notes & Solved Problem Sets"
                  value={newResource}
                  onChange={(e) => setNewResource(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Expected Learning Outcome</label>
                <input
                  type="text"
                  placeholder="e.g. Solidify mathematical derivation and achieve 100% test case pass rate"
                  value={newOutcome}
                  onChange={(e) => setNewOutcome(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-md"
                >
                  Save to Backend Roadmap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MENTOR ENDORSEMENT */}
      {isEndorseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Faculty Mentor Endorsement</h3>
              </div>
              <button
                onClick={() => setIsEndorseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitEndorsement} className="space-y-3 text-xs">
              <p className="text-slate-600">
                Provide advisory sign-off and qualitative growth recommendations for <strong>{student.name}</strong>.
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mentor Observation Note</label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Student has cleared prerequisite doubts in circuit analysis. Recommended to participate in the upcoming campus algorithm sprint."
                  value={endorsementInput}
                  onChange={(e) => setEndorsementInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEndorseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-md"
                >
                  Save Endorsement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
