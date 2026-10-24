import React, { useState, useEffect, useMemo } from 'react';
import {
  Student,
  PlacementActivity,
  RecruitmentDrive,
  PlacementTrainingTrack,
  SkillUpModule,
  SkillUpTrainingVideo,
  SkillUpCertification,
} from '../../types/student';
import { CAREER_PATHWAYS_DATA } from '../../data/mockData';
import { isSameBranch, resolveStudentId } from '../../data/collegeDatabase';
import { useAuth } from '../../firebase/AuthContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  Briefcase,
  Building2,
  GraduationCap,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Filter,
  Search,
  Award,
  BookOpen,
  ChevronRight,
  Plus,
  ExternalLink,
  FileText,
  Check,
  X,
  Flame,
  Target,
  TrendingUp,
  Users,
  Layers,
  Send,
  ShieldCheck,
  BarChart3,
  ArrowRight,
  Compass,
  Code,
  Cpu,
  Zap,
  FolderGit2,
  Lock,
  ThumbsUp,
  RefreshCw,
  Calendar,
  DollarSign,
  MapPin,
  HelpCircle,
  Play,
  Video,
  Bookmark,
  CheckSquare,
  BadgeCheck,
  Activity,
  Radio,
  Eye,
} from 'lucide-react';

export interface BenchmarkDataPoint {
  competency: string;
  studentScore: number;
  industryBenchmark: number;
  branchAverage: number;
  gap: number;
  status: string;
}

export interface BenchmarksResponse {
  branch: string;
  studentName: string;
  studentId: string;
  overallReadinessPct: number;
  dataPoints: BenchmarkDataPoint[];
  topStrengths: string[];
  criticalGaps: string[];
  prescriptiveRecommendations: string[];
}

export interface StudentTelemetryItem {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  actionType: string;
  headline: string;
  timestamp: string;
  details: string;
  urgency: 'Normal' | 'High' | 'Commendation';
  badge?: string;
}

interface PlacementIntelligenceProps {
  students: Student[];
  currentStudentId: string;
  onSelectStudent: (id: string) => void;
  onNavigateToTab: (tab: any) => void;
}

export function PlacementIntelligence({
  students,
  currentStudentId,
  onSelectStudent,
  onNavigateToTab,
}: PlacementIntelligenceProps) {
  const { userType, role, department: authDepartment, activeStudentId } = useAuth();

  // Active student context
  const activeId = userType === 'student' ? (activeStudentId || currentStudentId) : currentStudentId;
  const currentStudent = resolveStudentId(activeId, students) || students[0];

  // Branch context
  const studentBranch = currentStudent?.department || 'Electronics & Comm (ECE)';
  const staffBranch = authDepartment || 'Electronics & Comm (ECE)';
  const isDean = role === 'Dean of Academics';

  // Navigation tab states
  // Student tabs: 'drives' | 'skill-up' | 'training' | 'activities' | 'pathways' | 'mock-assessment'
  // Staff tabs: 'verification' | 'telemetry' | 'benchmarks' | 'skillup-matrix' | 'directory' | 'drives-overview' | 'trainings-overview'
  const [studentTab, setStudentTab] = useState<'drives' | 'skill-up' | 'training' | 'activities' | 'pathways' | 'mock-assessment'>('drives');
  const [staffTab, setStaffTab] = useState<'verification' | 'telemetry' | 'benchmarks' | 'skillup-matrix' | 'directory' | 'drives-overview' | 'trainings-overview'>('verification');

  // Branch Exploration Filter (For student exploring remaining branches)
  const [exploredBranch, setExploredBranch] = useState<string>(studentBranch);

  // Sync explored branch when current student changes
  useEffect(() => {
    if (userType === 'student') {
      setExploredBranch(studentBranch);
    }
  }, [studentBranch, userType]);

  // Backend Data States
  const [activities, setActivities] = useState<PlacementActivity[]>([]);
  const [drives, setDrives] = useState<RecruitmentDrive[]>([]);
  const [trainings, setTrainings] = useState<PlacementTrainingTrack[]>([]);
  const [skillUpModules, setSkillUpModules] = useState<SkillUpModule[]>([]);
  const [placementStats, setPlacementStats] = useState<any>(null);
  const [benchmarksData, setBenchmarksData] = useState<BenchmarksResponse | null>(null);
  const [telemetry, setTelemetry] = useState<StudentTelemetryItem[]>([]);
  const [telemetryFilter, setTelemetryFilter] = useState<string>('All');
  const [selectedStaffBenchmarkStudentId, setSelectedStaffBenchmarkStudentId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Video Player Modal State
  const [activeVideoModal, setActiveVideoModal] = useState<SkillUpTrainingVideo | null>(null);

  // Filter States
  const [activityFilterType, setActivityFilterType] = useState<string>('All');
  const [activityFilterStatus, setActivityFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals State
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState<boolean>(false);
  const [selectedActivityForReview, setSelectedActivityForReview] = useState<PlacementActivity | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState<string>('');
  const [reviewStatus, setReviewStatus] = useState<'Verified' | 'Needs Improvement'>('Verified');
  const [reviewBadge, setReviewBadge] = useState<string>('Faculty Verified');

  // New Activity Form State
  const [newActivityType, setNewActivityType] = useState<any>('Mock Interview');
  const [newActivityTitle, setNewActivityTitle] = useState<string>('');
  const [newActivityCompany, setNewActivityCompany] = useState<string>('');
  const [newActivityRole, setNewActivityRole] = useState<string>('');
  const [newActivityHours, setNewActivityHours] = useState<number>(3);
  const [newActivityScore, setNewActivityScore] = useState<string>('');
  const [newActivityProof, setNewActivityProof] = useState<string>('');
  const [newActivityNotes, setNewActivityNotes] = useState<string>('');

  // Selected Pathway for Benchmark Tab
  const [selectedPathwayId, setSelectedPathwayId] = useState<string>('embedded-iot');

  // Mock quiz interactive state
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Fetch all backend placement data including Skill-Up modules, Recharts benchmarks & live telemetry
  const fetchData = async () => {
    try {
      setLoading(true);

      const targetBranch = userType === 'student' ? exploredBranch : staffBranch;
      const targetStudentId = (userType === 'staff' && selectedStaffBenchmarkStudentId)
        ? selectedStaffBenchmarkStudentId
        : (currentStudent?.id || activeId);

      // Build activities query params
      const actParams = new URLSearchParams();
      if (userType === 'student') {
        actParams.append('studentId', targetStudentId);
      } else {
        actParams.append('staffBranch', staffBranch);
        actParams.append('staffRole', role || 'Faculty Advisor');
      }

      // Fetch in parallel from live backend
      const [actRes, drvRes, trnRes, skillRes, statsRes, benchRes, telemRes] = await Promise.all([
        fetch(`/api/placement/activities?${actParams.toString()}`).then((r) => r.json()),
        fetch(`/api/placement/drives?branch=${encodeURIComponent(targetBranch)}&studentId=${targetStudentId}`).then((r) => r.json()),
        fetch(`/api/placement/trainings?branch=${encodeURIComponent(targetBranch)}&studentId=${targetStudentId}`).then((r) => r.json()),
        fetch(`/api/placement/skill-up?branch=${encodeURIComponent(targetBranch)}&studentId=${targetStudentId}`).then((r) => r.json()),
        fetch(`/api/placement/stats?branch=${encodeURIComponent(staffBranch)}&role=${encodeURIComponent(role || '')}`).then((r) => r.json()),
        fetch(`/api/placement/benchmarks?branch=${encodeURIComponent(targetBranch)}&studentId=${targetStudentId}`).then((r) => r.json()),
        fetch(`/api/placement/live-student-telemetry?staffBranch=${encodeURIComponent(staffBranch)}&staffRole=${encodeURIComponent(role || '')}`).then((r) => r.json()),
      ]);

      if (actRes.success) setActivities(actRes.activities);
      if (drvRes.success) setDrives(drvRes.drives);
      if (trnRes.success) setTrainings(trnRes.trainings);
      if (skillRes.success) setSkillUpModules(skillRes.modules);
      if (statsRes.success) setPlacementStats(statsRes);
      if (benchRes.success) setBenchmarksData(benchRes);
      if (telemRes.success) setTelemetry(telemRes.telemetry);
    } catch (err) {
      console.error('Error fetching placement data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentStudent?.id, userType, staffBranch, exploredBranch, role]);

  // Handle Drive Application with Backend Telemetry
  const handleApplyDrive = async (driveId: string) => {
    try {
      const driveItem = drives.find((d) => d.id === driveId);
      const res = await fetch('/api/placement/drives/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driveId,
          studentId: currentStudent.id,
          studentName: currentStudent.name,
          department: currentStudent.department,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        setTimeout(() => setActionMessage(null), 5000);

        // Broadcast Live Telemetry for Staff Dashboard
        await fetch('/api/placement/telemetry/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: currentStudent.id,
            studentName: currentStudent.name,
            department: currentStudent.department,
            actionType: 'Applied to Drive',
            headline: `Applied for ${driveItem?.company || 'Corporate'} Campus Drive (${driveItem?.role || 'Engineer'})`,
            details: `Candidate registered profile and submitted hall ticket prerequisites for package ${driveItem?.package || 'Tier-1'}.`,
            urgency: 'High',
            badge: 'Campus Drive',
          }),
        }).catch(() => {});

        fetchData();
      }
    } catch (err) {
      console.error('Apply error:', err);
    }
  };

  // Handle Training Bootcamp Enrollment with Backend Telemetry
  const handleEnrollTraining = async (trainingId: string) => {
    try {
      const trainingItem = trainings.find((t) => t.id === trainingId);
      const res = await fetch('/api/placement/trainings/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainingId,
          studentId: currentStudent.id,
          studentName: currentStudent.name,
          department: currentStudent.department,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        setTimeout(() => setActionMessage(null), 5000);

        // Broadcast Live Telemetry for Staff Dashboard
        await fetch('/api/placement/telemetry/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: currentStudent.id,
            studentName: currentStudent.name,
            department: currentStudent.department,
            actionType: 'Enrolled in Bootcamp',
            headline: `Enrolled in ${trainingItem?.title || 'Bootcamp Track'}`,
            details: `Under guidance of ${trainingItem?.instructor || 'Faculty Lead'} for ${trainingItem?.durationWeeks || 6} weeks.`,
            urgency: 'Normal',
            badge: 'Bootcamp Active',
          }),
        }).catch(() => {});

        fetchData();
      }
    } catch (err) {
      console.error('Enroll error:', err);
    }
  };

  // Handle Skill-Up Module Completion / Logging with Backend Telemetry
  const handleCompleteSkill = async (moduleId: string) => {
    try {
      const mod = skillUpModules.find((m) => m.id === moduleId);
      const res = await fetch('/api/placement/skill-up/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId,
          studentId: currentStudent.id,
          studentName: currentStudent.name,
          department: currentStudent.department,
          action: 'complete',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        setTimeout(() => setActionMessage(null), 5000);

        // Broadcast Live Telemetry for Staff Dashboard
        await fetch('/api/placement/telemetry/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: currentStudent.id,
            studentName: currentStudent.name,
            department: currentStudent.department,
            actionType: 'Mastered Skill-Up',
            headline: `Mastered ${mod?.skillName || 'Engineering Skill Track'}`,
            details: `Completed curated masterclasses & credentials. Placement readiness boosted by +${mod?.readinessBoostPct || 18}%.`,
            urgency: 'Commendation',
            badge: 'Skill-Up Master',
          }),
        }).catch(() => {});

        fetchData();
      }
    } catch (err) {
      console.error('Skill-Up progress error:', err);
    }
  };

  // Handle Logging New Placement Activity with Backend Telemetry
  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityTitle.trim()) return;

    try {
      const payload: Partial<PlacementActivity> = {
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        department: currentStudent.department,
        type: newActivityType,
        title: newActivityTitle.trim(),
        companyOrPlatform: newActivityCompany.trim() || undefined,
        roleOrSubject: newActivityRole.trim() || undefined,
        hoursSpent: Number(newActivityHours) || 2,
        scoreOrRating: newActivityScore.trim() || undefined,
        proofUrl: newActivityProof.trim() || undefined,
        notes: newActivityNotes.trim() || 'Logged from Student Career Hub.',
        status: 'Pending Review',
        date: new Date().toISOString().split('T')[0],
      };

      const res = await fetch('/api/placement/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage('Placement activity successfully logged and forwarded to faculty advisors!');
        setTimeout(() => setActionMessage(null), 5000);

        // Broadcast Live Telemetry for Staff Dashboard
        await fetch('/api/placement/telemetry/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: currentStudent.id,
            studentName: currentStudent.name,
            department: currentStudent.department,
            actionType: 'Activity Submitted',
            headline: `Submitted ${newActivityType}: ${newActivityTitle.trim()}`,
            details: `Logged ${newActivityHours} hrs dedicated with score/proof for advisor endorsement.`,
            urgency: 'Normal',
            badge: 'Under Review',
          }),
        }).catch(() => {});

        setIsLogModalOpen(false);
        setNewActivityTitle('');
        setNewActivityCompany('');
        setNewActivityRole('');
        setNewActivityScore('');
        setNewActivityProof('');
        setNewActivityNotes('');
        fetchData();
      }
    } catch (err) {
      console.error('Log activity error:', err);
    }
  };

  // Handle Staff Verification
  const handleVerifyActivity = async () => {
    if (!selectedActivityForReview) return;

    try {
      const res = await fetch(`/api/placement/activities/${selectedActivityForReview.id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: reviewStatus,
          staffFeedback: reviewFeedback || 'Activity approved and verified. High technical caliber commended.',
          verifiedBy: role === 'Dean of Academics' ? 'Dean of Academics' : `Faculty Mentor (${staffBranch.split(' ')[0]})`,
          badge: reviewBadge,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Activity ${selectedActivityForReview.id} successfully updated with faculty endorsement.`);
        setTimeout(() => setActionMessage(null), 5000);
        setIsVerifyModalOpen(false);
        setSelectedActivityForReview(null);
        fetchData();
      }
    } catch (err) {
      console.error('Verify error:', err);
    }
  };

  // Open Review Modal
  const openReviewModal = (act: PlacementActivity) => {
    setSelectedActivityForReview(act);
    setReviewFeedback(act.staffFeedback || 'Activity verified. Demonstrated strong problem-solving and domain aptitude.');
    setReviewStatus(act.status === 'Needs Improvement' ? 'Needs Improvement' : 'Verified');
    setReviewBadge(act.badge || 'Faculty Verified');
    setIsVerifyModalOpen(true);
  };

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchType = activityFilterType === 'All' || act.type === activityFilterType;
      const matchStatus = activityFilterStatus === 'All' || act.status === activityFilterStatus;
      const matchQuery =
        !searchQuery.trim() ||
        act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (act.companyOrPlatform && act.companyOrPlatform.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchType && matchStatus && matchQuery;
    });
  }, [activities, activityFilterType, activityFilterStatus, searchQuery]);

  // Pathway Benchmark Data
  const activePathway =
    CAREER_PATHWAYS_DATA.find((p) => p.id === selectedPathwayId) || CAREER_PATHWAYS_DATA[0];
  const codingGap = Math.max(0, activePathway.benchmarkCodingScore - (currentStudent?.placement?.codingScore || 70));
  const aptitudeGap = Math.max(0, activePathway.benchmarkAptitudeScore - (currentStudent?.placement?.aptitudeScore || 72));

  const pathwaySkillBars = [
    {
      label: 'Coding Score',
      value: currentStudent?.placement?.codingScore || 75,
      highlight: (currentStudent?.placement?.codingScore || 75) >= activePathway.benchmarkCodingScore,
      color: 'bg-blue-600',
    },
    {
      label: 'Aptitude Test',
      value: currentStudent?.placement?.aptitudeScore || 78,
      highlight: (currentStudent?.placement?.aptitudeScore || 78) >= activePathway.benchmarkAptitudeScore,
      color: 'bg-emerald-600',
    },
    {
      label: 'Technical Rating',
      value: currentStudent?.skills?.technicalSkillRating || 80,
      highlight: true,
      color: 'bg-purple-600',
    },
    {
      label: 'Mock Interview (x10)',
      value: Math.round((currentStudent?.placement?.mockInterviewRating || 8.0) * 10),
      highlight: true,
      color: 'bg-cyan-600',
    },
  ];

  // Recharts Custom Tooltip for Placement Readiness vs Industry Benchmarks
  const CustomBenchmarkTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const studentVal = payload.find((p: any) => p.dataKey === 'studentScore')?.value ?? 0;
      const benchmarkVal = payload.find((p: any) => p.dataKey === 'industryBenchmark')?.value ?? 0;
      const branchAvgVal = payload.find((p: any) => p.dataKey === 'branchAverage')?.value ?? 0;
      const gap = studentVal - benchmarkVal;
      const isQualified = gap >= 0;

      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs space-y-2 min-w-[240px] z-50">
          <div className="font-extrabold border-b border-slate-800 pb-1.5 flex items-center justify-between">
            <span className="text-white text-xs">{label}</span>
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                isQualified
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {isQualified ? '✓ Qualified' : `${gap}% Gap`}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-purple-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block shadow-xs" />
                Candidate Score:
              </span>
              <span className="font-mono font-bold text-white text-xs">{studentVal}%</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-xs" />
                Industry Cutoff:
              </span>
              <span className="font-mono font-bold text-amber-200 text-xs">{benchmarkVal}%</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sky-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block shadow-xs" />
                Branch Average:
              </span>
              <span className="font-mono font-bold text-sky-200 text-xs">{branchAvgVal}%</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-300 pt-1.5 border-t border-slate-800/80 leading-relaxed">
            {isQualified
              ? 'Meets or exceeds corporate placement cutoff for Tier-1 companies.'
              : `Requires +${Math.abs(gap)}% improvement to satisfy campus interview shortlisting threshold.`}
          </div>
        </div>
      );
    }
    return null;
  };

  // Quick Branch Options
  const branchOptions = [
    { key: 'Electronics & Comm (ECE)', label: 'Electronics & Comm (ECE)', icon: Cpu },
    { key: 'Computer Science (CSE)', label: 'Computer Science (CSE)', icon: Code },
    { key: 'Information Tech (IT)', label: 'Information Tech (IT)', icon: Layers },
    { key: 'Electrical & Electronics (EEE)', label: 'Electrical & Electronics (EEE)', icon: Zap },
    { key: 'Mechanical Engineering', label: 'Mechanical & Civil (CAD)', icon: FolderGit2 },
  ];

  // Primary Recommended Skill-Up Module for the active branch
  const primarySkillUp = skillUpModules[0];

  return (
    <div className="space-y-6 pb-16">
      {/* Toast / Notification Banner */}
      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center justify-between shadow-xs animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* TOP HEADER: Clean, Eye-Catching Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white p-6 md:p-8 shadow-xl border border-indigo-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-200 border border-purple-400/30 backdrop-blur-md">
                <Briefcase className="w-3.5 h-3.5 text-purple-300" />
                {userType === 'student' ? 'Student Career & Placement Acceleration' : 'Faculty Placement Intelligence & Verification'}
              </span>

              {/* Branch Scope Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                Branch: {userType === 'student' ? studentBranch : `${staffBranch} ${isDean ? '(Institutional)' : ''}`}
              </span>

              {/* Dynamic Skill-Up Pill */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-400/40">
                <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                Skill-Up Active: {primarySkillUp?.skillName.split(' ')[0] || 'Technical Mastery'}
              </span>
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
                <span>Campus Placement Intelligence & Career Hub</span>
                <Sparkles className="w-5 h-5 text-amber-300" />
              </h1>
              <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {userType === 'student'
                  ? `Tailored placement tracks, company drives, technical bootcamps, and real-time activity submissions directly verified by your ${studentBranch.split(' ')[0]} faculty advisors.`
                  : `Comprehensive candidate analytics, corporate drive pipelines, and real-time student placement activities verification console for ${staffBranch}.`}
              </p>
            </div>
          </div>

          {/* Quick Context & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {userType === 'student' ? (
              <>
                <button
                  onClick={() => setIsLogModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg hover:from-purple-500 hover:to-indigo-500 transition-all cursor-pointer border border-purple-400/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Placement Activity</span>
                </button>
                <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-left">
                  <div className="text-[10px] text-slate-300 font-medium">Logged-in Candidate:</div>
                  <div className="font-bold text-white">{currentStudent?.name} ({currentStudent?.id})</div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs">
                  <div className="text-[10px] text-slate-300 font-medium">Active Staff Scope:</div>
                  <div className="font-bold text-white">{role} • {staffBranch}</div>
                </div>
                {/* Candidate selector for staff */}
                <select
                  value={currentStudent?.id}
                  onChange={(e) => onSelectStudent(e.target.value)}
                  className="text-xs bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2.5 font-bold cursor-pointer focus:outline-none"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.department})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* STATS STRIP: Immediate Visual Impact */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 mt-6 border-t border-white/10">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="text-[10px] text-purple-200 font-semibold uppercase tracking-wider">Placement Rate</div>
            <div className="text-xl font-black text-white mt-0.5">{placementStats?.placementRate || '88.4%'}</div>
            <div className="text-[10px] text-emerald-300 font-medium mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +4.2% YoY
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="text-[10px] text-blue-200 font-semibold uppercase tracking-wider">Highest Package</div>
            <div className="text-xl font-black text-amber-300 mt-0.5">{placementStats?.highestPackage || '₹34.0 LPA'}</div>
            <div className="text-[10px] text-slate-300 font-medium mt-0.5">Google India</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="text-[10px] text-indigo-200 font-semibold uppercase tracking-wider">Average Package</div>
            <div className="text-xl font-black text-white mt-0.5">{placementStats?.averagePackage || '₹14.8 LPA'}</div>
            <div className="text-[10px] text-slate-300 font-medium mt-0.5">Batch 2026</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="text-[10px] text-teal-200 font-semibold uppercase tracking-wider">Active Drives</div>
            <div className="text-xl font-black text-white mt-0.5">{drives.length} Drives</div>
            <div className="text-[10px] text-teal-300 font-medium mt-0.5">Campus Openings</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="text-[10px] text-pink-200 font-semibold uppercase tracking-wider">Skill-Up Tracks</div>
            <div className="text-xl font-black text-amber-300 mt-0.5">{skillUpModules.length} Modules</div>
            <div className="text-[10px] text-slate-300 font-medium mt-0.5">Videos & Certs</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="text-[10px] text-amber-200 font-semibold uppercase tracking-wider">Verified Activities</div>
            <div className="text-xl font-black text-emerald-300 mt-0.5">
              {activities.filter((a) => a.status === 'Verified').length} / {activities.length}
            </div>
            <div className="text-[10px] text-slate-300 font-medium mt-0.5">Faculty Reviewed</div>
          </div>
        </div>
      </div>

      {/* DYNAMIC 'SKILL-UP' HERO WIDGET (ATTRACTS EYE IMMEDIATELY) */}
      {primarySkillUp && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border-2 border-amber-300/80 dark:border-amber-500/40 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 shadow-xs flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-current" />
                  Recommended Branch Skill-Up
                </span>
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-2.5 py-0.5 rounded-full border border-purple-200">
                  Target: {exploredBranch}
                </span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  +{primarySkillUp.readinessBoostPct}% Placement Score Boost
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{primarySkillUp.skillName}</span>
                  {primarySkillUp.isCompleted && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" /> Mastered
                    </span>
                  )}
                </h3>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  {primarySkillUp.tagline}
                </p>
              </div>

              {/* Target Job Roles */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Target Corporate Roles:</span>
                {primarySkillUp.popularJobRoles.map((role, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700 shadow-xs text-[11px]"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Action CTA Box */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 min-w-[240px]">
              <button
                onClick={() => setStudentTab('skill-up')}
                className="w-full px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4 text-amber-300" />
                <span>Open Skill-Up Learning Suite</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {userType === 'student' && !primarySkillUp.isCompleted && (
                <button
                  onClick={() => handleCompleteSkill(primarySkillUp.id)}
                  className="w-full px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Mastered & Log Activity</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STUDENT VIEW NAVIGATION & CONTENT */}
      {userType === 'student' && (
        <div className="space-y-6">
          {/* Branch Explorer Toolbar: Allows student to view their own branch or explore remaining branches */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Explore Placement Track:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {branchOptions.map((b) => {
                const isSelected = isSameBranch(exploredBranch, b.key);
                const isStudentOwn = isSameBranch(studentBranch, b.key);
                const IconComponent = b.icon;

                return (
                  <button
                    key={b.key}
                    onClick={() => setExploredBranch(b.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-purple-300'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{b.label}</span>
                    {isStudentOwn && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-purple-800 text-white' : 'bg-purple-100 text-purple-800'}`}>
                        My Branch
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Student Tabs Navigation */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setStudentTab('drives')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                studentTab === 'drives'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Campus Recruitment Drives & Working ({drives.length})</span>
            </button>

            {/* DEDICATED SKILL-UP TAB */}
            <button
              onClick={() => setStudentTab('skill-up')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                studentTab === 'skill-up'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md ring-2 ring-purple-400'
                  : 'text-purple-700 bg-purple-50 hover:bg-purple-100 dark:text-purple-300 dark:bg-purple-950/40 border border-purple-200'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Skill-Up Hub (Videos & Certs)</span>
              <span className="text-[10px] bg-amber-400 text-slate-900 font-extrabold px-1.5 py-0.2 rounded-full">
                New
              </span>
            </button>

            <button
              onClick={() => setStudentTab('training')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                studentTab === 'training'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Placement Training & Bootcamps ({trainings.length})</span>
            </button>

            <button
              onClick={() => setStudentTab('activities')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                studentTab === 'activities'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>My Placement Activities & Submissions ({activities.length})</span>
            </button>

            <button
              onClick={() => setStudentTab('pathways')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                studentTab === 'pathways'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Career Trajectories & Benchmarks</span>
            </button>

            <button
              onClick={() => setStudentTab('mock-assessment')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                studentTab === 'mock-assessment'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Mock Readiness & Branch Quiz</span>
            </button>
          </div>

          {/* TAB: SKILL-UP HUB (DYNAMIC BASED ON BRANCH WITH VIDEOS & CERTS) */}
          {studentTab === 'skill-up' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Industry Skill-Up Suite: {exploredBranch}</span>
                    <BadgeCheck className="w-5 h-5 text-purple-600" />
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Curated technical masterclasses, verified video tutorials, and industry-accredited certifications designed to elevate your campus placement readiness.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl">
                    {skillUpModules.length} Modules Tailored for {exploredBranch.split(' ')[0]}
                  </span>
                </div>
              </div>

              {/* Skill-Up Modules Grid */}
              <div className="space-y-6">
                {skillUpModules.map((skill) => (
                  <div
                    key={skill.id}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
                  >
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                            {skill.category}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            Level: {skill.level}
                          </span>
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                            +{skill.readinessBoostPct}% Readiness Boost
                          </span>
                        </div>

                        <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                          {skill.skillName}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                          {skill.description}
                        </p>
                      </div>

                      {/* Action & Status */}
                      <div className="shrink-0 flex items-center gap-3">
                        {skill.isCompleted ? (
                          <div className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Mastered & Verified (+{skill.readinessBoostPct}%)</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCompleteSkill(skill.id)}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                          >
                            <CheckSquare className="w-4 h-4" />
                            <span>Mark Mastered & Log Placement Activity</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* SECTION 1: INDUSTRY TRAINING VIDEOS */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <Video className="w-4 h-4 text-rose-600" />
                          <span>Curated Industry Training Video Tutorials ({skill.trainingVideos.length}):</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">Click to Play or Watch Online</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {skill.trainingVideos.map((vid) => (
                          <div
                            key={vid.id}
                            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex flex-col justify-between space-y-3 hover:border-purple-300 transition-all"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500 mb-1.5">
                                <span className="font-bold text-rose-600 flex items-center gap-1">
                                  <Play className="w-3 h-3 fill-current" /> {vid.channel}
                                </span>
                                <span className="font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                  {vid.duration}
                                </span>
                              </div>

                              <h5 className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                                {vid.title}
                              </h5>

                              {/* Topics */}
                              <div className="flex flex-wrap gap-1 mt-2.5">
                                {vid.topicsCovered.map((t, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[9px] font-semibold bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
                              {vid.embedUrl ? (
                                <button
                                  onClick={() => setActiveVideoModal(vid)}
                                  className="w-full py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                  <span>Watch Video Player</span>
                                </button>
                              ) : (
                                <a
                                  href={vid.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                                >
                                  <span>Watch on YouTube</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SECTION 2: ACCREDITED INDUSTRY CERTIFICATIONS */}
                    <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-600" />
                        <span>Recognized Corporate Credentials & Certifications ({skill.certifications.length}):</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {skill.certifications.map((cert) => (
                          <div
                            key={cert.id}
                            className="p-4 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/30 dark:bg-amber-950/20 flex flex-col justify-between space-y-3"
                          >
                            <div>
                              <div className="flex items-center justify-between text-[10px] text-amber-800 dark:text-amber-400 font-bold mb-1">
                                <span>Issuing Body: {cert.issuingBody}</span>
                                <span className="font-mono bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded border border-amber-300">
                                  Code: {cert.examCode}
                                </span>
                              </div>

                              <h5 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                {cert.name}
                              </h5>

                              {/* Recognized By */}
                              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                                <span className="text-[10px] text-slate-500 font-semibold">Recognized by:</span>
                                {cert.recognizedBy.map((org, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs"
                                  >
                                    {org}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between text-xs">
                              <span className="text-slate-500 text-[11px]">
                                Prep Timeline: <strong className="text-slate-800 dark:text-slate-200">{cert.preparationWeeks} Weeks</strong>
                              </span>

                              <a
                                href={cert.credentialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-purple-700 dark:text-purple-300 hover:text-purple-900 font-bold text-xs"
                              >
                                <span>Official Exam & Syllabus</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 1: CAMPUS RECRUITMENT DRIVES & WORKING */}
          {studentTab === 'drives' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Corporate Recruitment & Internship Openings
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live campus placement drives eligible for <span className="font-bold text-purple-700 dark:text-purple-400">{exploredBranch}</span>. Click Apply to submit your application.
                  </p>
                </div>
                <div className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                  Showing {drives.length} Active Opportunities
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {drives.map((drive) => {
                  const isEligibleGpa = (currentStudent?.academic?.gpa || 7.5) >= drive.minGpa;
                  const isEligibleCoding = (currentStudent?.placement?.codingScore || 70) >= drive.minCodingScore;

                  return (
                    <div
                      key={drive.id}
                      className={`p-6 rounded-3xl border transition-all bg-white dark:bg-slate-900 shadow-xs hover:shadow-md flex flex-col justify-between space-y-4 ${
                        drive.isApplied
                          ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div>
                        {/* Top Bar with Company & Type */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center font-black text-sm shadow-md">
                              {drive.logoText}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                {drive.company}
                              </div>
                              <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                                {drive.role}
                              </h4>
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                            drive.type.includes('Internship')
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-purple-50 text-purple-800 border-purple-200'
                          }`}>
                            {drive.type}
                          </span>
                        </div>

                        {/* Package & Location */}
                        <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                              <DollarSign className="w-3 h-3 text-emerald-600" /> Package / Stipend
                            </div>
                            <div className="font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5">
                              {drive.package}
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                              <MapPin className="w-3 h-3 text-blue-600" /> Location
                            </div>
                            <div className="font-bold text-slate-700 dark:text-slate-300 mt-0.5 truncate">
                              {drive.location}
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                          {drive.description}
                        </p>

                        {/* Required Skills */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {drive.skillsRequired.map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        {/* Rounds & Cutoffs */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Eligibility Cutoff:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              Min GPA {drive.minGpa} • Min Coding {drive.minCodingScore}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Selection Rounds:</span>
                            <span className="font-mono text-purple-700 dark:text-purple-300 font-bold">
                              {drive.rounds.length} Assessment Stages
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Drive Date:</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" /> {drive.driveDate}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2">
                        {drive.isApplied ? (
                          <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Application Registered & Logged for Staff</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApplyDrive(drive.id)}
                            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Apply for Campus Drive ({drive.appliedCount} registered)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: PLACEMENT TRAINING & BOOTCAMPS */}
          {studentTab === 'training' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Branch Placement Bootcamps & Specialized Training
                  </h3>
                  <p className="text-xs text-slate-500">
                    Faculty-led, corporate-aligned intensive modules for <span className="font-bold text-purple-700 dark:text-purple-400">{exploredBranch}</span> students.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {trainings.map((trn) => (
                  <div
                    key={trn.id}
                    className={`p-6 rounded-3xl border transition-all bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-4 ${
                      trn.isEnrolled
                        ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/20'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 border border-purple-200">
                          {trn.level}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {trn.durationWeeks} Weeks Duration
                        </span>
                      </div>

                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-2 leading-tight">
                        {trn.title}
                      </h4>
                      <div className="text-xs text-purple-700 dark:text-purple-300 font-semibold mt-1">
                        Mentor: {trn.instructor}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                        {trn.description}
                      </p>

                      {/* Modules Breakdown */}
                      <div className="mt-4 space-y-2">
                        <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                          <span>Curriculum Syllabus Modules:</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {trn.modules.map((mod, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-xs flex items-center justify-between"
                            >
                              <span className="font-medium text-slate-700 dark:text-slate-300 text-[11px] truncate">
                                {mod.title}
                              </span>
                              <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0 ml-1">
                                {mod.hours}h
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Skills Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {trn.skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-800"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Enrollment Button & Metrics */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                      <div className="text-xs text-slate-500">
                        <span className="font-bold text-slate-900 dark:text-white">{trn.enrolledCount}</span> Students Enrolled
                      </div>

                      {trn.isEnrolled ? (
                        <div className="py-2 px-4 rounded-xl bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Enrolled (Active Sprint)</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEnrollTraining(trn.id)}
                          className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Enroll Now</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MY PLACEMENT ACTIVITIES & SUBMISSIONS */}
          {studentTab === 'activities' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Logged Placement Activities & Faculty Endorsements
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time activities submitted by you. Verified and endorsed by your branch faculty advisors.
                  </p>
                </div>

                <button
                  onClick={() => setIsLogModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log New Activity</span>
                </button>
              </div>

              {/* Activities Filter Toolbar */}
              <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Filters:</span>
                </div>

                <select
                  value={activityFilterType}
                  onChange={(e) => setActivityFilterType(e.target.value)}
                  className="text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
                >
                  <option value="All">All Activity Types</option>
                  <option value="Mock Interview">Mock Interview</option>
                  <option value="Drive Application">Drive Application</option>
                  <option value="Training & Bootcamp">Training & Bootcamp</option>
                  <option value="Technical Contest">Technical Contest</option>
                  <option value="Certification">Certification</option>
                  <option value="Project Submission">Project Submission</option>
                </select>

                <select
                  value={activityFilterStatus}
                  onChange={(e) => setActivityFilterStatus(e.target.value)}
                  className="text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Verified">Verified</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                  <option value="Applied">Applied</option>
                  <option value="In Progress">In Progress</option>
                </select>

                <div className="ml-auto text-xs font-mono text-slate-500">
                  {filteredActivities.length} Records Found
                </div>
              </div>

              {/* Activities List */}
              <div className="space-y-3">
                {filteredActivities.length === 0 ? (
                  <div className="p-8 text-center rounded-3xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-500">
                    No placement activities found matching your filters. Click &quot;Log New Activity&quot; to record your preparation!
                  </div>
                ) : (
                  filteredActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3 hover:border-purple-300 transition-all"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300">
                              {act.type}
                            </span>
                            <span className="text-xs font-mono text-slate-400">ID: {act.id}</span>
                            <span className="text-xs text-slate-400">• {act.date}</span>
                          </div>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {act.title}
                          </h4>
                          {act.companyOrPlatform && (
                            <div className="text-xs font-semibold text-purple-700 dark:text-purple-400">
                              Platform / Company: {act.companyOrPlatform} {act.roleOrSubject ? `• ${act.roleOrSubject}` : ''}
                            </div>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full border ${
                              act.status === 'Verified'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : act.status === 'Needs Improvement'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-blue-50 text-blue-800 border-blue-300'
                            }`}
                          >
                            {act.status}
                          </span>
                        </div>
                      </div>

                      {/* Notes / Details */}
                      {act.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                          {act.notes}
                        </p>
                      )}

                      {/* Metrics & Proof */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <div className="flex items-center gap-4 text-slate-500">
                          {act.hoursSpent && (
                            <span className="flex items-center gap-1 font-medium">
                              <Clock className="w-3.5 h-3.5 text-purple-600" /> {act.hoursSpent} Hours Dedicated
                            </span>
                          )}
                          {act.scoreOrRating && (
                            <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                              <Award className="w-3.5 h-3.5 text-amber-600" /> {act.scoreOrRating}
                            </span>
                          )}
                        </div>

                        {act.proofUrl && (
                          <a
                            href={act.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-purple-600 hover:text-purple-800 font-bold text-xs"
                          >
                            <span>View Proof Artifact</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      {/* Faculty Feedback Section if verified */}
                      {act.staffFeedback && (
                        <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              <span>Faculty Mentor Endorsement:</span>
                            </span>
                            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
                              Verified by: {act.verifiedBy || 'Department Advisor'}
                            </span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                            &quot;{act.staffFeedback}&quot;
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CAREER TRAJECTORIES & BENCHMARKS */}
          {studentTab === 'pathways' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {CAREER_PATHWAYS_DATA.map((p) => {
                  const isSelected = p.id === selectedPathwayId;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPathwayId(p.id)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                        isSelected
                          ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-500 shadow-md'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                        {p.badge}
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-2">
                        {p.name}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                        {p.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Pathway Deep Dive */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{activePathway.name}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{activePathway.description}</p>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-purple-600" />
                      <span>Target Corporate Job Roles:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activePathway.targetRoles.map((role, idx) => (
                        <span key={idx} className="text-xs bg-purple-50 text-purple-900 px-3 py-1 rounded-lg font-semibold border border-purple-200">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span>Prerequisite Technical Competencies:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {activePathway.coreSubjects.map((subj, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-slate-800">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="font-medium">{subj}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                      <FolderGit2 className="w-4 h-4 text-emerald-600" />
                      <span>Recommended Capstone Projects:</span>
                    </div>
                    <div className="space-y-2">
                      {activePathway.recommendedProjects.map((proj, idx) => (
                        <div key={idx} className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl text-xs flex items-start gap-2.5">
                          <FolderGit2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-bold text-slate-900">{proj}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">Production architecture, testbench coverage, and documentation.</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-700 bg-purple-100 dark:bg-purple-900/60 dark:text-purple-300 px-3 py-1 rounded-full border border-purple-200 w-fit">
                        <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
                        <span>Interactive Recharts Placement Diagnostic</span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white mt-2 flex items-center gap-2">
                        <span>Placement Readiness vs. Industry Benchmarks: {exploredBranch}</span>
                        <Sparkles className="w-4 h-4 text-amber-500" />
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                        Comparative multi-skill bar chart visualizing <span className="font-bold text-slate-800 dark:text-slate-200">{currentStudent?.name}&apos;s</span> preparedness against real-world Tier-1 corporate hiring cutoffs and department batch averages.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 border border-purple-200 dark:border-purple-800 shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Readiness Index</div>
                        <div className="text-2xl font-black text-purple-700 dark:text-purple-300">
                          {benchmarksData?.overallReadinessPct || 86}%
                        </div>
                      </div>
                      <div className="h-10 w-px bg-purple-200 dark:bg-purple-800" />
                      <div>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Corporate Ready
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                          {benchmarksData?.dataPoints.filter(d => d.status === 'Qualified').length || 6} / {benchmarksData?.dataPoints.length || 7} Cutoffs Cleared
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RECHARTS DUAL / TRIPLE BAR CHART */}
                  <div className="w-full h-[320px] pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={benchmarksData?.dataPoints || []}
                        margin={{ top: 20, right: 30, left: 0, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="competency"
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          interval={0}
                          angle={-10}
                          textAnchor="end"
                          height={50}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          unit="%"
                        />
                        <RechartsTooltip content={<CustomBenchmarkTooltip />} />
                        <Legend
                          verticalAlign="top"
                          align="right"
                          wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingBottom: '12px' }}
                        />
                        <ReferenceLine
                          y={75}
                          stroke="#ef4444"
                          strokeDasharray="4 4"
                          label={{ value: 'Recruitment Cutoff 75%', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }}
                        />
                        <Bar
                          dataKey="studentScore"
                          name="Candidate Score"
                          fill="#8b5cf6"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={36}
                        />
                        <Bar
                          dataKey="industryBenchmark"
                          name="Industry Cutoff Benchmark"
                          fill="#f59e0b"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={36}
                        />
                        <Bar
                          dataKey="branchAverage"
                          name="Branch Cohort Average"
                          fill="#38bdf8"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={36}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Competency Gap Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                    {(benchmarksData?.dataPoints || []).map((pt, idx) => {
                      const isQualified = pt.gap >= 0;
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-2xl border text-center transition-all ${
                            isQualified
                              ? 'bg-emerald-50/40 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
                              : 'bg-rose-50/40 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800'
                          }`}
                        >
                          <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate" title={pt.competency}>
                            {pt.competency}
                          </div>
                          <div className="text-base font-black text-slate-900 dark:text-white mt-1">
                            {pt.studentScore}%
                          </div>
                          <div className="text-[10px] font-mono mt-0.5">
                            <span className={isQualified ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                              {isQualified ? `+${pt.gap}%` : `${pt.gap}%`}
                            </span>
                            <span className="text-slate-400 text-[9px]"> / Cutoff {pt.industryBenchmark}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Prescriptive Insights from Backend */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1.5">
                      <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Corporate Recruiter Standouts (Above Cutoff):</span>
                      </div>
                      <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                        {(benchmarksData?.topStrengths || ['Branch Core Technical (+5% over cutoff)', 'ATS Resume Compliance (+3% over cutoff)']).map((s, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200 dark:border-amber-800 text-xs space-y-1.5">
                      <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-amber-600" />
                        <span>Prescriptive Placement Recommendation:</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {benchmarksData?.prescriptiveRecommendations?.[0] || 'Maintain daily LeetCode and hardware design lab workouts to surpass all Tier-1 parameters.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MOCK READINESS & BRANCH QUIZ */}
          {studentTab === 'mock-assessment' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-300 w-fit">
                  <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                  <span>Interactive Daily Placement Technical Q&A Drill</span>
                </div>

                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Technical Screening Challenge: {exploredBranch}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Daily technical drill question designed by campus recruiters. Select an answer to evaluate your reasoning. The detailed conceptual explanation is displayed after submission.
                </p>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-4">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {exploredBranch.includes('Electronics')
                      ? 'In FreeRTOS running on an ARM Cortex-M processor, what is the primary purpose of Priority Inversion mitigation using Priority Inheritance in Mutexes?'
                      : exploredBranch.includes('Computer')
                      ? 'What is the tightest time complexity for detecting a cycle in a directed graph with V vertices and E edges?'
                      : exploredBranch.includes('Mechanical') || exploredBranch.includes('Civil')
                      ? 'In structural drafting and BIM modeling, what does the Level of Development (LOD 300) represent according to BIM standards?'
                      : 'Under dynamic operating conditions, which parameter determines the thermal runaway onset in a lithium-ion cell?'}
                  </div>

                  <div className="space-y-2">
                    {[
                      exploredBranch.includes('Electronics')
                        ? 'Temporarily elevating the priority of a low-priority task holding a mutex required by a high-priority task.'
                        : exploredBranch.includes('Computer')
                        ? 'O(V + E) using Depth First Search (DFS) with three-color recursion tracking.'
                        : exploredBranch.includes('Mechanical') || exploredBranch.includes('Civil')
                        ? 'Model elements graphically represented as specific systems with accurate quantity, size, shape, location, and orientation.'
                        : 'Exothermic breakdown of the Solid Electrolyte Interphase (SEI) layer above critical temperature.',
                      exploredBranch.includes('Electronics')
                        ? 'Permanently disabling hardware interrupts during all task context switches.'
                        : exploredBranch.includes('Computer')
                        ? 'O(V^2) using Floyd-Warshall all-pairs shortest path matrix relaxation.'
                        : exploredBranch.includes('Mechanical') || exploredBranch.includes('Civil')
                        ? 'Schematic diagram with only 2D line sketches and no engineering dimensions.'
                        : 'Discharge current falling below nominal 0.5C threshold.',
                      exploredBranch.includes('Electronics')
                        ? 'Allocating heap memory dynamically from the kernel stack without fragmentation.'
                        : exploredBranch.includes('Computer')
                        ? 'O(E log V) by running Dijkstra algorithm from all vertices.'
                        : exploredBranch.includes('Mechanical') || exploredBranch.includes('Civil')
                        ? 'As-built facility management asset without any geometric boundary representation.'
                        : 'Voltage remaining constant across all parallel cell bricks.',
                    ].map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedAnswer(idx);
                          setShowExplanation(true);
                        }}
                        className={`w-full p-3.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                          selectedAnswer === idx
                            ? idx === 0
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                              : 'bg-rose-50 border-rose-400 text-rose-950 font-bold'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                        }`}
                      >
                        <span>{opt}</span>
                        {showExplanation && (
                          <span>
                            {idx === 0 ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <X className="w-4 h-4 text-rose-500 shrink-0" />
                            )}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {showExplanation && (
                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs space-y-1.5 animate-in fade-in duration-300">
                      <div className="font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span>Corporate Recruiter Diagnostic Explanation:</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                        {selectedAnswer === 0
                          ? 'Correct! Option 1 is the standard textbook definition tested across engineering screening rounds. Clear demonstration of this fundamental concept separates top placement candidates.'
                          : 'Incorrect. Option 1 is the mathematically accurate principle. In corporate interviews, explain the exact engineering parameters and practical industry applications to stand out.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STAFF VIEW: VERIFICATION CONSOLE & PLACEMENT INTELLIGENCE */}
      {userType === 'staff' && (
        <div className="space-y-6">
          {/* Staff Tabs Navigation */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setStaffTab('verification')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                staffTab === 'verification'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Student Placement Submissions ({activities.length})</span>
            </button>

            {/* LIVE STUDENT TELEMETRY RADAR TAB */}
            <button
              onClick={() => setStaffTab('telemetry')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                staffTab === 'telemetry'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm ring-2 ring-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>Live Student Activity Radar ({telemetry.length})</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </button>

            {/* RECHARTS BENCHMARKS TAB */}
            <button
              onClick={() => setStaffTab('benchmarks')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                staffTab === 'benchmarks'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>Branch Readiness Benchmarks (Recharts)</span>
            </button>

            {/* STAFF SKILL-UP TRACKER TAB */}
            <button
              onClick={() => setStaffTab('skillup-matrix')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                staffTab === 'skillup-matrix'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Branch Skill-Up Matrix ({skillUpModules.length})</span>
            </button>

            <button
              onClick={() => setStaffTab('directory')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                staffTab === 'directory'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Branch Candidate Readiness Roster ({students.length})</span>
            </button>

            <button
              onClick={() => setStaffTab('drives-overview')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                staffTab === 'drives-overview'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Corporate Recruitment Pipelines ({drives.length})</span>
            </button>

            <button
              onClick={() => setStaffTab('trainings-overview')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                staffTab === 'trainings-overview'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Department Training Bootcamps ({trainings.length})</span>
            </button>
          </div>

          {/* STAFF TAB 1: VERIFICATION CONSOLE (MOST IMPORTANT FOR USER) */}
          {staffTab === 'verification' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Branch Student Placement Submissions & Review Queue
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live placement activities, training modules, certifications, and drive applications logged by students of <span className="font-bold text-purple-700">{staffBranch}</span>.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                    {activities.filter((a) => a.status === 'Verified').length} Verified
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                    {activities.filter((a) => a.status !== 'Verified').length} Pending Action
                  </span>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search candidate name, ID, or activity title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none"
                  />
                </div>

                <select
                  value={activityFilterType}
                  onChange={(e) => setActivityFilterType(e.target.value)}
                  className="text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-semibold cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Mock Interview">Mock Interview</option>
                  <option value="Drive Application">Drive Application</option>
                  <option value="Training & Bootcamp">Training & Bootcamp</option>
                  <option value="Technical Contest">Technical Contest</option>
                  <option value="Certification">Certification</option>
                  <option value="Project Submission">Project Submission</option>
                </select>

                <select
                  value={activityFilterStatus}
                  onChange={(e) => setActivityFilterStatus(e.target.value)}
                  className="text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-semibold cursor-pointer"
                >
                  <option value="All">All Verification Statuses</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Verified">Verified & Endorsed</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                  <option value="Applied">Drive Registered</option>
                </select>
              </div>

              {/* Table / Cards of Student Placement Activities */}
              <div className="space-y-3">
                {filteredActivities.length === 0 ? (
                  <div className="p-8 text-center rounded-3xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-500">
                    No student placement activities found matching current criteria.
                  </div>
                ) : (
                  filteredActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3 hover:border-purple-300 transition-all"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300">
                              {act.type}
                            </span>
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                              {act.studentName}
                            </span>
                            <span className="text-xs font-mono text-purple-700 dark:text-purple-400 font-bold">
                              ({act.studentId})
                            </span>
                            <span className="text-xs text-slate-400">• {act.department}</span>
                          </div>

                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {act.title}
                          </h4>

                          {act.companyOrPlatform && (
                            <div className="text-xs font-medium text-slate-500">
                              Target Entity: <span className="font-bold text-slate-800 dark:text-slate-200">{act.companyOrPlatform}</span>
                              {act.roleOrSubject && ` • Track: ${act.roleOrSubject}`}
                            </div>
                          )}
                        </div>

                        {/* Status & Review Action */}
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full border ${
                              act.status === 'Verified'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : act.status === 'Needs Improvement'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-blue-50 text-blue-800 border-blue-300'
                            }`}
                          >
                            {act.status}
                          </span>

                          <button
                            onClick={() => openReviewModal(act)}
                            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Review & Endorse</span>
                          </button>
                        </div>
                      </div>

                      {/* Notes / Description */}
                      {act.notes && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
                          {act.notes}
                        </div>
                      )}

                      {/* Metrics Strip */}
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4 text-slate-500">
                          <span>Date Logged: <strong className="text-slate-700 dark:text-slate-300">{act.date}</strong></span>
                          {act.hoursSpent && <span>Time Dedicated: <strong className="text-slate-700 dark:text-slate-300">{act.hoursSpent} hrs</strong></span>}
                          {act.scoreOrRating && <span>Metric / Score: <strong className="text-purple-700 dark:text-purple-400">{act.scoreOrRating}</strong></span>}
                        </div>

                        {act.proofUrl && (
                          <a
                            href={act.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-purple-600 hover:text-purple-800 font-bold text-xs"
                          >
                            <span>Verify Student Proof</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      {/* Staff Endorsement Note */}
                      {act.staffFeedback && (
                        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Faculty Feedback ({act.verifiedBy || 'Advisor'}):</span> {act.staffFeedback}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* STAFF TAB: LIVE STUDENT ACTIVITY RADAR & TELEMETRY STREAM */}
          {staffTab === 'telemetry' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-900 text-white shadow-lg border border-indigo-700/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-rose-300">
                      Live Placement Telemetry Radar
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>Real-Time Student Activity Stream: {staffBranch}</span>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </h3>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Faculty oversight console displaying exactly what your branch students are doing in real time: corporate drive registrations, mastered skill tracks, bootcamps, and certification uploads.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={fetchData}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer backdrop-blur-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync Live Stream</span>
                  </button>
                  <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-2 rounded-xl">
                    {telemetry.length} Events Captured
                  </span>
                </div>
              </div>

              {/* Telemetry Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5 text-purple-600" /> Filter Telemetry:
                  </span>
                  {['All', 'Applied to Drive', 'Mastered Skill-Up', 'Activity Submitted', 'Enrolled in Bootcamp', 'Certification Logged'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setTelemetryFilter(f)}
                      className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                        telemetryFilter === f
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-purple-300'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div className="text-[11px] font-mono text-slate-500">
                  Showing {telemetry.filter(t => telemetryFilter === 'All' || t.actionType.includes(telemetryFilter) || telemetryFilter.includes(t.actionType)).length} actions
                </div>
              </div>

              {/* Live Telemetry Cards */}
              <div className="space-y-3">
                {telemetry
                  .filter((item) => telemetryFilter === 'All' || item.actionType.includes(telemetryFilter) || telemetryFilter.includes(item.actionType))
                  .map((item) => {
                    const isHigh = item.urgency === 'High' || item.urgency === 'Commendation';
                    return (
                      <div
                        key={item.id}
                        className={`p-5 rounded-2xl border transition-all shadow-xs ${
                          item.urgency === 'Commendation'
                            ? 'bg-gradient-to-r from-amber-50/50 via-white to-purple-50/50 dark:from-slate-900 dark:to-purple-950/20 border-amber-200 dark:border-amber-800'
                            : item.urgency === 'High'
                            ? 'bg-gradient-to-r from-indigo-50/50 via-white to-blue-50/50 dark:from-slate-900 dark:to-indigo-950/20 border-indigo-200 dark:border-indigo-800'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                  item.actionType.includes('Mastered')
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : item.actionType.includes('Drive')
                                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                    : item.actionType.includes('Bootcamp')
                                    ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                    : 'bg-blue-100 text-blue-800 border border-blue-300'
                                }`}
                              >
                                {item.actionType}
                              </span>

                              <span className="text-xs font-black text-slate-900 dark:text-white">
                                {item.studentName}
                              </span>
                              <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400">
                                ({item.studentId})
                              </span>
                              <span className="text-xs text-slate-400">• {item.department}</span>

                              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 ml-auto sm:ml-0">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {item.timestamp}
                              </span>
                            </div>

                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                              {item.headline}
                            </h4>

                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              {item.details}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            {item.badge && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {item.badge}
                              </span>
                            )}
                            <button
                              onClick={() => {
                                onSelectStudent(item.studentId);
                                setStaffTab('verification');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Inspect & Review</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* STAFF TAB: BRANCH COMPETENCY READINESS BENCHMARKS (RECHARTS) */}
          {staffTab === 'benchmarks' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-700 bg-purple-100 dark:bg-purple-900/60 dark:text-purple-300 px-3 py-1 rounded-full border border-purple-200 w-fit">
                    <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
                    <span>Recharts Placement Diagnostic Engine</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-2 flex items-center gap-2">
                    <span>Branch Placement Readiness vs. Corporate Benchmarks: {staffBranch}</span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                    Detailed multi-dimensional competency analysis. Staff can evaluate individual student readiness or department batch averages versus Tier-1 campus hiring cutoffs.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-xs">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Target Candidate:
                    </label>
                    <select
                      value={selectedStaffBenchmarkStudentId || currentStudent?.id}
                      onChange={(e) => {
                        setSelectedStaffBenchmarkStudentId(e.target.value);
                        onSelectStudent(e.target.value);
                      }}
                      className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-bold cursor-pointer focus:outline-none"
                    >
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.department}) - {s.placement?.readinessLevel || 'Ready'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Readiness Score</div>
                    <div className="text-xl font-black text-purple-700 dark:text-purple-300">
                      {benchmarksData?.overallReadinessPct || 86}%
                    </div>
                  </div>
                </div>
              </div>

              {/* RECHARTS BAR CHART */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="w-full h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={benchmarksData?.dataPoints || []}
                      margin={{ top: 20, right: 30, left: 0, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="competency"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        interval={0}
                        angle={-10}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        unit="%"
                      />
                      <RechartsTooltip content={<CustomBenchmarkTooltip />} />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingBottom: '12px' }}
                      />
                      <ReferenceLine
                        y={75}
                        stroke="#ef4444"
                        strokeDasharray="4 4"
                        label={{ value: 'Recruitment Cutoff 75%', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }}
                      />
                      <Bar
                        dataKey="studentScore"
                        name="Candidate Score"
                        fill="#8b5cf6"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                      />
                      <Bar
                        dataKey="industryBenchmark"
                        name="Industry Cutoff Benchmark"
                        fill="#f59e0b"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                      />
                      <Bar
                        dataKey="branchAverage"
                        name="Branch Cohort Average"
                        fill="#38bdf8"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Competency Gap Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {(benchmarksData?.dataPoints || []).map((pt, idx) => {
                    const isQualified = pt.gap >= 0;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          isQualified
                            ? 'bg-emerald-50/40 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
                            : 'bg-rose-50/40 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800'
                        }`}
                      >
                        <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate" title={pt.competency}>
                          {pt.competency}
                        </div>
                        <div className="text-base font-black text-slate-900 dark:text-white mt-1">
                          {pt.studentScore}%
                        </div>
                        <div className="text-[10px] font-mono mt-0.5">
                          <span className={isQualified ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                            {isQualified ? `+${pt.gap}%` : `${pt.gap}%`}
                          </span>
                          <span className="text-slate-400 text-[9px]"> / Cutoff {pt.industryBenchmark}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Staff Prescriptive Action Plan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1.5">
                    <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Cohort Strengths (Above Benchmark):</span>
                    </div>
                    <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                      {(benchmarksData?.topStrengths || ['Branch Core Technical (+5% over cutoff)', 'ATS Resume Compliance (+3% over cutoff)']).map((s, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 border border-purple-200 dark:border-purple-800 text-xs space-y-1.5">
                    <div className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-purple-600" />
                      <span>Faculty Placement Interventions:</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {benchmarksData?.prescriptiveRecommendations?.[0] || 'Conduct dedicated coding workshops and assign targeted practice tasks to bridge gaps.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STAFF TAB 2: SKILL-UP & CERTIFICATIONS MATRIX */}
          {staffTab === 'skillup-matrix' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Branch Technical Skill-Up & Certification Progression
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tracks candidate completion across video tutorials and industry-recognized certifications for <span className="font-bold text-purple-700">{staffBranch}</span>.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skillUpModules.map((s) => (
                  <div key={s.id} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          {s.category}
                        </span>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1.5">
                          {s.skillName}
                        </h4>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        +{s.readinessBoostPct}% Boost
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {s.description}
                    </p>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Training Videos Included:</span>
                        <strong className="text-slate-900 dark:text-white">{s.trainingVideos.length} Masterclasses</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Industry Certifications:</span>
                        <strong className="text-purple-700 dark:text-purple-300">{s.certifications.length} Credentials</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Enrolled / Completing Students:</span>
                        <strong className="text-emerald-700">{s.enrolledStudentsCount || 24} Candidates</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* STAFF TAB 3: CANDIDATE ROSTER */}
          {staffTab === 'directory' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Candidate Placement Readiness & Competency Roster
                  </h3>
                  <p className="text-xs text-slate-500">
                    Students enrolled in <span className="font-bold text-purple-700">{staffBranch}</span> categorized by industry readiness.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Candidate</th>
                      <th className="p-3.5">Readiness Tier</th>
                      <th className="p-3.5">GPA</th>
                      <th className="p-3.5">Coding Score</th>
                      <th className="p-3.5">Aptitude Score</th>
                      <th className="p-3.5">Target Domain</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 font-medium">
                    {students.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{s.id}</div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                              s.placement?.readinessLevel === 'Job Ready'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : s.placement?.readinessLevel === 'Needs Target Practice'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-rose-50 text-rose-800 border-rose-300'
                            }`}
                          >
                            {s.placement?.readinessLevel || 'Job Ready'}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                          {s.academic?.gpa} / 10.0
                        </td>
                        <td className="p-3.5">
                          <span className={`font-bold ${s.placement?.codingScore >= 75 ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {s.placement?.codingScore}%
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`font-bold ${s.placement?.aptitudeScore >= 75 ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {s.placement?.aptitudeScore}%
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300 font-semibold">
                          {s.placement?.preferredDomain}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              onSelectStudent(s.id);
                              onNavigateToTab('profile');
                            }}
                            className="text-xs font-bold text-purple-600 hover:text-purple-800 cursor-pointer"
                          >
                            View 360° Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STAFF TAB 4: RECRUITMENT PIPELINES */}
          {staffTab === 'drives-overview' && (
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Campus Placement Drives & Corporate Recruitment Matrix
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {drives.map((d) => (
                  <div key={d.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-slate-900 dark:text-white text-base">{d.company}</div>
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md">
                        {d.package}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{d.role}</div>
                    <p className="text-xs text-slate-500">{d.description}</p>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Registered from Branch: <strong className="text-slate-900 dark:text-white">{d.appliedCount} Candidates</strong></span>
                      <span className="font-mono text-purple-700 font-bold">{d.driveDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STAFF TAB 5: TRAINING BOOTCAMPS */}
          {staffTab === 'trainings-overview' && (
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Department Placement Training Bootcamps & Progress
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trainings.map((t) => (
                  <div key={t.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-slate-900 dark:text-white text-base">{t.title}</div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                        {t.durationWeeks} Weeks
                      </span>
                    </div>
                    <div className="text-xs text-purple-700 font-semibold">Faculty Lead: {t.instructor}</div>
                    <p className="text-xs text-slate-500">{t.description}</p>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Enrolled Students: <strong className="text-slate-900 dark:text-white">{t.enrolledCount}</strong></span>
                      <span className="text-slate-500">Completion: <strong className="text-emerald-700">{t.completionRate}%</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIDEO PLAYER MODAL: Embedded Video Tutorial Experience */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                  {activeVideoModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
              <iframe
                src={activeVideoModal.embedUrl || activeVideoModal.url}
                title={activeVideoModal.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Details & Covered Topics */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">
                  Instructor / Channel: <span className="text-rose-600 font-extrabold">{activeVideoModal.channel}</span> ({activeVideoModal.duration})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeVideoModal.topicsCovered.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[10px]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <a
                href={activeVideoModal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>Open in Official YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: STUDENT LOG PLACEMENT ACTIVITY */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Log Placement Activity
                </h3>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogActivity} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Activity Type
                </label>
                <select
                  value={newActivityType}
                  onChange={(e) => setNewActivityType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none"
                >
                  <option value="Mock Interview">Mock Interview</option>
                  <option value="Technical Contest">Technical Coding Contest / LeetCode Sprint</option>
                  <option value="Certification">Industry Certification</option>
                  <option value="Training & Bootcamp">Training & Bootcamp</option>
                  <option value="Project Submission">Capstone / Industry Project</option>
                  <option value="Drive Application">External Drive Application</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Activity Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FreeRTOS Task Synchronization Mock Interview"
                  value={newActivityTitle}
                  onChange={(e) => setNewActivityTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Company / Organization / Platform
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Qualcomm, LeetCode, AWS"
                    value={newActivityCompany}
                    onChange={(e) => setNewActivityCompany(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Role / Technical Domain
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Embedded Firmware Engineer"
                    value={newActivityRole}
                    onChange={(e) => setNewActivityRole(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hours Spent
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newActivityHours}
                    onChange={(e) => setNewActivityHours(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Score / Rating / Result
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8.5/10, Rank #4, Passed"
                    value={newActivityScore}
                    onChange={(e) => setNewActivityScore(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Proof URL (GitHub Repo, Certificate Link, Contest Profile)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/... or https://credentials.arm.com/..."
                  value={newActivityProof}
                  onChange={(e) => setNewActivityProof(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Key Learnings & Summary Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your technical preparation, algorithms solved, or project deliverables..."
                  value={newActivityNotes}
                  onChange={(e) => setNewActivityNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit for Faculty Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: STAFF VERIFY / ENDORSE ACTIVITY */}
      {isVerifyModalOpen && selectedActivityForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Review & Endorse Placement Activity
                </h3>
              </div>
              <button
                onClick={() => setIsVerifyModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                {selectedActivityForReview.title}
              </div>
              <div className="text-slate-500">
                Submitted by: <strong className="text-purple-700">{selectedActivityForReview.studentName} ({selectedActivityForReview.studentId})</strong> • {selectedActivityForReview.department}
              </div>
              {selectedActivityForReview.notes && (
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  {selectedActivityForReview.notes}
                </div>
              )}
              {selectedActivityForReview.proofUrl && (
                <a
                  href={selectedActivityForReview.proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 font-bold"
                >
                  <span>Open Verification Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Verification Verdict
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewStatus('Verified')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      reviewStatus === 'Verified'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-500'
                        : 'bg-white dark:bg-slate-800 border-slate-200 text-slate-600'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Approve & Verify</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewStatus('Needs Improvement')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      reviewStatus === 'Needs Improvement'
                        ? 'bg-amber-50 border-amber-400 text-amber-800 ring-2 ring-amber-500'
                        : 'bg-white dark:bg-slate-800 border-slate-200 text-slate-600'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Needs Improvement</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Faculty Endorsement Notes & Actionable Advice
                </label>
                <textarea
                  rows={3}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Provide constructive placement feedback for the candidate..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Faculty Endorsement Badge
                </label>
                <select
                  value={reviewBadge}
                  onChange={(e) => setReviewBadge(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none"
                >
                  <option value="Faculty Verified">Faculty Verified</option>
                  <option value="Tier-1 Qualified">Tier-1 Qualified (Top Recruiter Ready)</option>
                  <option value="High Distinction">High Distinction</option>
                  <option value="Action Plan Assigned">Action Plan Assigned</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsVerifyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleVerifyActivity}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Faculty Endorsement</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
