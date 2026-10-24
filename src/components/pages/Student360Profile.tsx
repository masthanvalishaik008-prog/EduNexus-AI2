import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Student, CategoryWeights, SupportAlert, StudentActivity, UserType } from '../../types/student';
import { resolveStudentId, COLLEGE_STAFF_50, COLLEGE_OFFICIALS, isSameBranch, CollegeStaff } from '../../data/collegeDatabase';
import { useAuth } from '../../firebase/AuthContext';
import { RadarChart } from '../charts/RadarChart';
import { ScoreGauge } from '../charts/ScoreGauge';
import { LineTrendChart } from '../charts/LineTrendChart';
import { DEFAULT_WEIGHTS } from '../../utils/scoreCalculator';
import avatarImg from '../../assets/images/avatar_student_lead_1791794142095.jpg';
import { StudentReportExportModal } from '../modals/StudentReportExportModal';
import { exportStudentSuccessReportPdf } from '../../utils/pdfReportGenerator';
import { SpeedometerGauge } from '../charts/SpeedometerGauge';
import { StudentFriendlyFeedbackCard } from '../StudentFriendlyFeedbackCard';
import {
  Search,
  BookOpen,
  CalendarCheck,
  Laptop,
  Users2,
  Briefcase,
  Wrench,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
  Compass,
  ArrowRight,
  Sparkles,
  MessageSquareCode,
  Award,
  Filter,
  Check,
  ShieldCheck,
  Activity,
  Layers,
  ChevronRight,
  ExternalLink,
  Lock,
  UserCheck,
  FileDown,
  Download,
  Printer,
  Building,
  Phone,
  Mail,
  Clock,
  GraduationCap,
  BadgeAlert
} from 'lucide-react';

interface Student360ProfileProps {
  students: Student[];
  currentStudentId: string;
  currentStudent?: Student;
  currentStaffMember?: CollegeStaff;
  onSelectStudent: (id: string) => void;
  onNavigateToTab: (tab: any) => void;
  userType?: UserType;
  alerts?: SupportAlert[];
  studentActivities?: StudentActivity[];
  onAddStudentActivity?: (activity: StudentActivity) => void;
  onUpdateStudentActivity?: (activity: StudentActivity) => void;
}

export function Student360Profile({
  students,
  currentStudentId,
  currentStudent,
  currentStaffMember,
  onSelectStudent,
  onNavigateToTab,
  userType = 'staff',
  alerts = [],
  studentActivities = [],
  onAddStudentActivity,
  onUpdateStudentActivity,
}: Student360ProfileProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [tableDeptFilter, setTableDeptFilter] = useState<string>('All');
  const [tableRiskFilter, setTableRiskFilter] = useState<string>('All');
  const [acknowledgedActivities, setAcknowledgedActivities] = useState<Record<string, boolean>>({});

  // PDF Export State
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportTargetStudent, setExportTargetStudent] = useState<Student | null>(null);
  const [quickDownloadingId, setQuickDownloadingId] = useState<string | null>(null);

  const {
    userType: authUserType,
    activeStudentId,
    staffId: authStaffId,
    guestUserName,
    department: authDept,
    role: authRole,
  } = useAuth();
  // Strict session type: If either prop or AuthContext indicates student, enforce student mode!
  const effectiveUserType: UserType = (userType === 'student' || authUserType === 'student')
    ? 'student'
    : (userType || authUserType || 'staff');

  // Strict verification: if student, block access to other students' data and enforce own record
  const targetStudentId = effectiveUserType === 'student'
    ? (activeStudentId || (guestUserName ? guestUserName : currentStudentId))
    : currentStudentId;

  // Priority 1: Direct passed currentStudent object (guarantees exact profile for logged in user)
  // Priority 2: Lookup by student ID or name in full roster
  const student = (effectiveUserType === 'student' && currentStudent)
    ? currentStudent
    : (resolveStudentId(targetStudentId, students) || currentStudent || students[0]);

  // Resolve official staff profile when a faculty member or college official is logged in
  const staffMember = useMemo(() => {
    if (effectiveUserType !== 'staff') return null;
    if (currentStaffMember) return currentStaffMember;
    const allStaff = [...COLLEGE_STAFF_50, ...COLLEGE_OFFICIALS.map(o => ({
      ...o,
      officeHours: 'Mon - Fri 10:00 AM - 1:00 PM',
      coursesTaught: ['Institutional Leadership & Academic Policy'],
      specialization: 'University Administration & Educational Quality',
      assignedStudentsCount: 200,
      experienceYears: 22,
      phone: '+91 98401 00001',
      cabin: 'Academic Senate Block Suite 101'
    }))];

    return (
      (authStaffId ? allStaff.find(s => s.id.toLowerCase() === authStaffId.toLowerCase()) : undefined) ||
      (guestUserName ? allStaff.find(s => s.name.toLowerCase() === guestUserName.toLowerCase() || s.name.toLowerCase().replace(/[\s._-]+/g, '') === guestUserName.toLowerCase().replace(/[\s._-]+/g, '')) : undefined) ||
      (authDept ? allStaff.find(s => isSameBranch(s.department, authDept)) : undefined) ||
      COLLEGE_STAFF_50[0]
    );
  }, [effectiveUserType, currentStaffMember, authStaffId, guestUserName, authDept]);

  const currentStudentStreak = student.loginStreak || 0;


  const handleQuickDownloadPdf = (targetStudent: Student, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setQuickDownloadingId(targetStudent.id);
    try {
      exportStudentSuccessReportPdf(targetStudent, { alerts });
    } catch (err) {
      console.error('Quick PDF export error:', err);
    } finally {
      setTimeout(() => setQuickDownloadingId(null), 1200);
    }
  };

  const handleOpenExportModal = (targetStudent?: Student, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExportTargetStudent(targetStudent || student);
    setIsExportModalOpen(true);
  };

  const filteredSearchList = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Radar data points across the 7 categories
  const radarData = [
    { label: 'Academic', value: student.breakdown.academicScore, benchmark: 75 },
    { label: 'Attendance', value: student.breakdown.attendanceScore, benchmark: 75 },
    { label: 'LMS Activity', value: student.breakdown.lmsScore, benchmark: 70 },
    { label: 'Engagement', value: student.breakdown.engagementScore, benchmark: 65 },
    { label: 'Placement Prep', value: student.breakdown.placementScore, benchmark: 70 },
    { label: 'Domain Skills', value: student.breakdown.skillsScore, benchmark: 70 },
    { label: 'Feedback Sentiment', value: student.breakdown.feedbackScore, benchmark: 80 },
  ];

  const weights = DEFAULT_WEIGHTS;

  // Helper to compute visual support alert status indicators (High, Medium, Low risk)
  const getStudentSupportAlertStatus = (st: Student) => {
    const activeAlert = alerts.find(
      (a) =>
        a.studentId === st.id &&
        (a.status === 'New' || a.status === 'In Review' || a.status === 'Session Scheduled' || a.status === 'Action Plan Active')
    );

    if (activeAlert) {
      if (activeAlert.priority === 'Urgent' || activeAlert.priority === 'High' || st.riskLevel === 'High Support Needed') {
        return {
          riskCategory: 'High' as const,
          label: 'High Risk Alert',
          dotColor: 'bg-rose-500 ring-rose-400/30',
          textColor: 'text-rose-700',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
          alertTitle: activeAlert.title,
          evidence: activeAlert.evidence,
        };
      } else if (activeAlert.priority === 'Medium' || st.riskLevel === 'Moderate Attention') {
        return {
          riskCategory: 'Medium' as const,
          label: 'Medium Risk Alert',
          dotColor: 'bg-amber-500 ring-amber-400/30',
          textColor: 'text-amber-700',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
          alertTitle: activeAlert.title,
          evidence: activeAlert.evidence,
        };
      } else {
        return {
          riskCategory: 'Low' as const,
          label: 'Low Risk Alert',
          dotColor: 'bg-emerald-500 ring-emerald-400/30',
          textColor: 'text-emerald-700',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          alertTitle: activeAlert.title,
          evidence: activeAlert.evidence,
        };
      }
    }

    // Default based on student's intrinsic risk level
    if (st.riskLevel === 'High Support Needed') {
      return {
        riskCategory: 'High' as const,
        label: 'High Risk',
        dotColor: 'bg-rose-500 ring-rose-400/30',
        textColor: 'text-rose-700',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        alertTitle: 'Remedial Attendance / GPA Flag',
        evidence: `Attendance at ${st.attendance.overallPercentage}%, ${st.academic.backlogsCount} active backlogs`,
      };
    } else if (st.riskLevel === 'Moderate Attention') {
      return {
        riskCategory: 'Medium' as const,
        label: 'Medium Risk',
        dotColor: 'bg-amber-500 ring-amber-400/30',
        textColor: 'text-amber-700',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        alertTitle: 'Advisory Watchlist',
        evidence: `Placement score at ${st.placement.codingScore}/100`,
      };
    } else if (st.riskLevel === 'High Potential') {
      return {
        riskCategory: 'Low' as const,
        label: 'High Potential',
        dotColor: 'bg-blue-500 ring-blue-400/30',
        textColor: 'text-blue-700',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        alertTitle: 'Honor Standing',
        evidence: `GPA ${st.academic.gpa.toFixed(1)} · Nominal telemetry`,
      };
    } else {
      return {
        riskCategory: 'Low' as const,
        label: 'Low Risk',
        dotColor: 'bg-emerald-500 ring-emerald-400/30',
        textColor: 'text-emerald-700',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        alertTitle: 'On Track (Healthy)',
        evidence: `Attendance ${st.attendance.overallPercentage}% · All milestones nominal`,
      };
    }
  };

  // Filtered students for Directory Table
  const tableStudents = students.filter((st) => {
    if (tableDeptFilter !== 'All' && st.department !== tableDeptFilter) return false;
    const meta = getStudentSupportAlertStatus(st);
    if (tableRiskFilter !== 'All' && meta.riskCategory !== tableRiskFilter) return false;
    if (
      searchQuery &&
      !st.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !st.id.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Current student activities
  const currentStudentActivities = studentActivities.filter((a) => a.studentId === student.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-16 px-6 md:px-12 py-8 bg-white/50 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-100"
    >
      {/* Staff Faculty Profile Card: Shown when a faculty member or college official is authenticated */}
      {effectiveUserType === 'staff' && staffMember && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-[#0c1f38] text-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-700/80 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400"></div>
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Official Faculty / Staff Profile · Authenticated Session</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Faculty Staff ID:</span>
              <span className="text-xs font-mono font-bold bg-slate-800 text-cyan-300 px-2.5 py-1 rounded-lg border border-slate-700">
                {staffMember.id}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-6">
            <div className="md:col-span-5 flex items-center gap-5">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/25 border-2 border-blue-400/30 shrink-0">
                {staffMember.name.replace(/Dr\.|Prof\./g, '').trim().split(' ').map(n => n[0]).join('') || 'FAC'}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight truncate">
                  {staffMember.name}
                </h1>
                <p className="text-sm font-semibold text-blue-300 mt-0.5">
                  {staffMember.designation} · {staffMember.role}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{staffMember.department}</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Office Cabin</div>
                <div className="text-xs font-bold text-slate-200 mt-1 truncate" title={staffMember.cabin}>
                  {staffMember.cabin.split(',')[0]}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{staffMember.cabin.split(',')[1] || 'Main Block'}</div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Official Email</div>
                <div className="text-xs font-mono font-bold text-cyan-300 mt-1 truncate" title={staffMember.email}>
                  {staffMember.email}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Phone: {staffMember.phone}</div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assigned Mentees</div>
                <div className="text-lg font-black font-mono text-emerald-400 mt-0.5">
                  {staffMember.assignedStudentsCount} Scholars
                </div>
                <div className="text-[10px] text-slate-400">{staffMember.experienceYears}y Academic Experience</div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-semibold">Academic Specialization:</span>
              <p className="text-slate-200 font-medium mt-1">{staffMember.specialization}</p>
              <div className="flex items-center gap-2 text-slate-400 mt-2 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Office Hours: <strong>{staffMember.officeHours}</strong></span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 font-semibold">Courses & Modules Taught:</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {staffMember.coursesTaught.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-blue-950/80 border border-blue-800 text-blue-200 text-[11px] font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Student Switcher Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {effectiveUserType === 'student' ? (
          /* Student Protected Mode: Only sees their own identity */
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-bold text-xs">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span>Student Personal Session: {student.name} ({student.id})</span>
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Private 360° telemetry profile · Dept: {student.department}
            </span>
          </div>
        ) : (
          /* Staff Mode: Search & Select from all students */
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student by name or ID (e.g. ENX-2024-0001)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>

            {searchQuery && filteredSearchList.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-semibold">Quick match:</span>
                <div className="flex gap-1 overflow-x-auto">
                  {filteredSearchList.slice(0, 3).map((st) => (
                    <button
                      key={st.id}
                      onClick={() => {
                        onSelectStudent(st.id);
                        setSearchQuery('');
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      {st.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          {effectiveUserType !== 'student' && (
            <select
              value={student.id}
              onChange={(e) => onSelectStudent(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.department}
                </option>
              ))}
            </select>
          )}

          {/* Quick Nav to Student Engagement Module */}
          <button
            onClick={() => onNavigateToTab('student-engagement')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            title="Open Student Engagement & Activities Hub"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Engagement Hub</span>
          </button>



          <button
            onClick={() => onNavigateToTab('chatbot')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors cursor-pointer"
          >
            <MessageSquareCode className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Coach</span>
          </button>

          {/* Export PDF Dossier button */}
          <button
            onClick={() => handleOpenExportModal(student)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl transition-all shadow-md shadow-rose-500/20 cursor-pointer"
            title="Export Student Success PDF Dossier for Faculty Meetings"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={() => onNavigateToTab('ai-assistant')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Insight Report</span>
          </button>
        </div>
      </div>

      {/* Student Profile Header Card with Rich Gradient Accent */}
      <div className="bg-gradient-to-br from-white via-blue-50/40 to-slate-50 border border-slate-200/90 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500"></div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Avatar & Core Bio */}
          <div className="md:col-span-4 flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-blue-400 shadow-md shrink-0 bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-blue-500/20">
              {student.name.split(' ').map((n) => n[0]).join('') || 'ST'}
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{effectiveUserType === 'student' ? 'My Student Profile' : 'Student Scholar'}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">{student.name}</h2>
                <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                  {student.id}
                </span>
              </div>
              <p className="text-xs text-blue-800 font-semibold mt-0.5">{student.department}</p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 mt-1 font-medium">
                <span>Semester {student.semester}</span>
                <span>·</span>
                <span>Batch {student.batch}</span>
              </div>
              {/* Clearly separated, designated Faculty Advisor badge */}
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Assigned Faculty Advisor: <strong className="text-slate-900 font-bold">{student.mentorName}</strong></span>
              </div>
            </div>
          </div>

          {/* Key Stat Strips */}
          <div className="md:col-span-5 grid grid-cols-3 gap-3 border-y md:border-y-0 md:border-x border-slate-200 py-3 md:py-0 md:px-5">
            <div className="text-center p-3 rounded-xl bg-white/80 border border-blue-100 shadow-xs">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cumulative GPA</div>
              <div className="text-lg font-black font-mono text-slate-900 mt-0.5">{student.academic.gpa.toFixed(1)} / 10</div>
              <div className="text-[10px] text-slate-500 font-medium">Backlogs: {student.academic.backlogsCount}</div>
            </div>

            <div className="text-center p-3 rounded-xl bg-white/80 border border-emerald-100 shadow-xs">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Attendance</div>
              <div
                className={`text-lg font-black font-mono mt-0.5 ${
                  student.attendance.overallPercentage < 75 ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {student.attendance.overallPercentage}%
              </div>
              <div className="text-[10px] text-slate-500 font-medium">Absences: {student.attendance.consecutiveAbsences} days</div>
            </div>

            <div className="text-center p-3 rounded-xl bg-white/80 border border-purple-100 shadow-xs">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Career Track</div>
              <div className="text-xs font-black text-purple-700 mt-1 truncate" title={student.placement.preferredDomain}>
                {student.placement.preferredDomain.split(' ')[0]}
              </div>
              <div className="text-[10px] font-bold text-purple-600">{student.placement.readinessLevel}</div>
            </div>
          </div>

          {/* Explainable Success Score Gauge & Meeting Export Actions */}
          <div className="md:col-span-3 flex flex-col items-center justify-center bg-white/80 rounded-2xl p-3 border border-slate-200 shadow-xs">
            <ScoreGauge score={student.compositeScore} size={105} strokeWidth={9} />
            <div className="w-full mt-2.5 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
              <button
                onClick={() => handleOpenExportModal(student)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-all cursor-pointer"
                title="Export custom PDF meeting report with agenda & signatures"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Export Meeting PDF</span>
              </button>
              <button
                onClick={(e) => handleQuickDownloadPdf(student, e)}
                disabled={quickDownloadingId === student.id}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all cursor-pointer"
                title="Instant one-click PDF download"
              >
                <Download className="w-3 h-3 text-slate-500" />
                <span>{quickDownloadingId === student.id ? 'Generating...' : 'Quick Download'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Early Support Radar Condition Match Banner */}
      {(() => {
        const matchingAlert = alerts.find((a) => a.studentId === student.id);
        const gpaDrop = Number((student.academic.previousSemesterGpa - student.academic.gpa).toFixed(2));
        const meetsCondition = student.academic.backlogsCount > 0 || gpaDrop >= 0.40;

        if (!matchingAlert && !meetsCondition) return null;

        const isUrgent = matchingAlert?.priority === 'Urgent' || student.academic.backlogsCount >= 2 || (student.academic.backlogsCount >= 1 && gpaDrop >= 0.50);
        const isHigh = matchingAlert?.priority === 'High' || student.academic.backlogsCount >= 1;

        return (
          <div className={`rounded-2xl p-4.5 border shadow-xs relative overflow-hidden ${
            isUrgent 
              ? 'bg-rose-50/70 border-rose-200 text-rose-950' 
              : isHigh 
              ? 'bg-amber-50/70 border-amber-200 text-amber-950'
              : 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
          }`}>
            <div className={`absolute top-0 left-0 right-0 h-1 ${isUrgent ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-indigo-500'}`} />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shadow-xs ${
                  isUrgent 
                    ? 'bg-rose-100 text-rose-800 border-rose-300' 
                    : isHigh 
                    ? 'bg-amber-100 text-amber-800 border-amber-300' 
                    : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                }`}>
                  {matchingAlert?.priority || (isUrgent ? 'Urgent' : isHigh ? 'High' : 'Medium')} Priority Alert
                </span>
                <span className="text-xs font-bold text-slate-900">
                  Early Support Radar: {matchingAlert?.title || 'Academic Backlog & Semester GPA Drop Condition Breached'}
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                  100% 360° Profile Matched
                </span>
              </div>

              <button
                onClick={() => onNavigateToTab('radar')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer shadow-xs ml-auto"
              >
                <span>View Early Support Radar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200/70 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500">Active Course Backlogs:</span>{' '}
                <strong className={`font-mono ${student.academic.backlogsCount > 0 ? 'text-rose-600 font-black' : 'text-slate-800'}`}>
                  {student.academic.backlogsCount} {student.academic.backlogsCount === 1 ? 'Course' : 'Courses'}
                </strong>
              </div>

              <div>
                <span className="text-slate-500">Semester GPA Trajectory:</span>{' '}
                <strong className="font-mono text-slate-900">
                  {student.academic.gpa.toFixed(2)}
                </strong>{' '}
                <span className="text-slate-400 font-mono">(Prev {student.academic.previousSemesterGpa.toFixed(2)})</span>{' '}
                <span className="font-mono font-bold text-rose-600 bg-rose-100/90 px-1.5 py-0.5 rounded text-[11px] border border-rose-200">
                  -{gpaDrop.toFixed(2)} drop
                </span>
              </div>

              <div>
                <span className="text-slate-500">Assigned Faculty Mentor:</span>{' '}
                <strong className="text-slate-800">{student.mentorName}</strong>
              </div>
            </div>

            {matchingAlert?.evidence && (
              <div className="mt-2.5 text-xs text-slate-700 bg-white/90 p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="font-bold text-slate-900">Radar Diagnostic Evidence:</span> {matchingAlert.evidence}
              </div>
            )}
          </div>
        );
      })()}

      {/* Row 2: Explainable Score Breakdown & Radar Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Transparent Score Component Contributions */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-slate-900">
              Explainable Success Score Attribution
            </h3>
            <span className="text-[10px] text-blue-700 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              Deterministic Weights
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Composite score (<strong className="text-slate-800">{student.compositeScore}/100</strong>) is mathematically weighted across the 7 categories. Initial weights represent demonstration assumptions.
          </p>

          <div className="space-y-2.5">
            {[
              {
                label: 'Academic Performance',
                score: student.breakdown.academicScore,
                weight: weights.academic,
                formula: 'GPA (60%) + Internal (30%) - Backlog Penalty',
                color: 'text-blue-700 bg-blue-50 border-blue-100',
              },
              {
                label: 'Attendance Compliance',
                score: student.breakdown.attendanceScore,
                weight: weights.attendance,
                formula: 'Theory (50%) + Practical (50%) - Consec Penalty',
                color: 'text-emerald-700 bg-emerald-50 border-emerald-100',
              },
              {
                label: 'LMS Platform Activity',
                score: student.breakdown.lmsScore,
                weight: weights.lms,
                formula: 'Module Completion (40%) + Quiz Avg (35%) + On-time (25%)',
                color: 'text-purple-700 bg-purple-50 border-purple-100',
              },
              {
                label: 'Placement Readiness',
                score: student.breakdown.placementScore,
                weight: weights.placement,
                formula: 'Coding (40%) + Aptitude (30%) + Mock (30%)',
                color: 'text-rose-700 bg-rose-50 border-rose-100',
              },
              {
                label: 'Domain Skills & Projects',
                score: student.breakdown.skillsScore,
                weight: weights.skills,
                formula: 'Technical Skill (50%) + Soft Skill (25%) + Certs/GitHub (25%)',
                color: 'text-cyan-700 bg-cyan-50 border-cyan-100',
              },
              {
                label: 'Engagement & Extracurriculars',
                score: student.breakdown.engagementScore,
                weight: weights.engagement,
                formula: 'Hackathons + Forums + Club Leadership bonus',
                color: 'text-amber-700 bg-amber-50 border-amber-100',
              },
              {
                label: 'Faculty Feedback & Sentiment',
                score: student.breakdown.feedbackScore,
                weight: weights.feedback,
                formula: 'Faculty Rating (50%) + Pulse Score (30%) + Satisfaction (20%)',
                color: 'text-slate-700 bg-slate-50 border-slate-200',
              },
            ].map((pillar) => (
              <div
                key={pillar.label}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50/80 transition-colors text-xs"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 truncate">{pillar.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({(pillar.weight * 100).toFixed(0)}% weight)</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{pillar.formula}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden hidden sm:block">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, pillar.score)}%` }}
                    />
                  </div>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded-md border text-[11px] ${pillar.color}`}>
                    {pillar.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Pillar Multi-Axis Radar Chart */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900">
                7-Pillar Holistic Radar Profile
              </h3>
              <span className="text-[10px] text-slate-500 font-medium">
                Benchmark: 70 - 75 pts
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Visualizes cross-dimensional equilibrium. Imbalances (e.g. high coding vs low attendance) trigger targeted early support actions.
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-[320px]">
            <RadarChart data={radarData} size={300} />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Student Performance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <span>Cohort Target Benchmark</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bike Speedometer Daily Login Streak Scale */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12">
          <SpeedometerGauge
            streakDays={student.loginStreak || 0}
            lastLoginDate={student.lastLoginDate}
            maxDays={30}
            studentName={student.name}
          />
        </div>
      </div>

      {/* Row 3: 7 Pillars Detailed Telemetry Cards */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          In-Depth Telemetry by Category
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Academic Card */}
          <div className="border border-blue-200/90 rounded-2xl p-5 bg-gradient-to-br from-white to-blue-50/60 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-blue-800 font-bold text-xs">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>1. Academic Performance</span>
              </div>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {student.breakdown.academicScore} pts
              </span>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Current Semester GPA:</span>
                <span className="font-mono font-bold text-slate-900">{student.academic.gpa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Previous Semester GPA:</span>
                <span className="font-mono text-slate-700">{student.academic.previousSemesterGpa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Semester GPA Drop:</span>
                <span className={`font-mono font-bold ${(student.academic.previousSemesterGpa - student.academic.gpa) >= 0.4 ? 'text-rose-600' : 'text-slate-700'}`}>
                  {(student.academic.previousSemesterGpa - student.academic.gpa) > 0 ? `-${(student.academic.previousSemesterGpa - student.academic.gpa).toFixed(2)} drop` : 'Steady / Improved'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Active Course Backlogs:</span>
                <span className={`font-mono font-bold ${student.academic.backlogsCount > 0 ? 'text-rose-600 font-black' : 'text-slate-700'}`}>
                  {student.academic.backlogsCount} {student.academic.backlogsCount === 1 ? 'course' : 'courses'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Internal Assessment Avg:</span>
                <span className="font-mono text-slate-700">{student.academic.internalAssessmentScore}%</span>
              </div>
              <div className="flex justify-between">
                <span>Credits Completed:</span>
                <span className="font-mono text-slate-700">{student.academic.totalCreditsCompleted} credits</span>
              </div>
            </div>
          </div>

          {/* 2. Attendance Card */}
          <div className="border border-emerald-200/90 rounded-2xl p-5 bg-gradient-to-br from-white to-emerald-50/60 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                <span>2. Attendance Telemetry</span>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                {student.breakdown.attendanceScore} pts
              </span>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Overall Compliance:</span>
                <span className="font-mono font-bold text-emerald-700">{student.attendance.overallPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span>Theory Classes:</span>
                <span className="font-mono text-slate-700">{student.attendance.theoryPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span>Practical / Laboratory:</span>
                <span className="font-mono text-slate-700">{student.attendance.practicalPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span>Consecutive Absences:</span>
                <span className="font-mono text-slate-700">{student.attendance.consecutiveAbsences} days</span>
              </div>
            </div>
          </div>

          {/* 3. LMS Platform Card */}
          <div className="border border-purple-200/90 rounded-2xl p-5 bg-gradient-to-br from-white to-purple-50/60 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-purple-800 font-bold text-xs">
                <Laptop className="w-4 h-4 text-purple-600" />
                <span>3. LMS Digital Engagement</span>
              </div>
              <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                {student.breakdown.lmsScore} pts
              </span>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Portal Logins / Week:</span>
                <span className="font-mono font-bold text-slate-900">{student.lms.portalLoginsPerWeek} logins</span>
              </div>
              <div className="flex justify-between">
                <span>Module Completion:</span>
                <span className="font-mono text-slate-700">{student.lms.moduleCompletionRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Quiz Average Score:</span>
                <span className="font-mono text-slate-700">{student.lms.quizAverageScore}%</span>
              </div>
              <div className="flex justify-between">
                <span>Assignment On-Time Rate:</span>
                <span className="font-mono text-slate-700">{student.lms.assignmentOnTimeRate}%</span>
              </div>
            </div>
          </div>

          {/* 4. Placement Readiness Card */}
          <div className="border border-rose-200/90 rounded-2xl p-5 bg-gradient-to-br from-white to-rose-50/60 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                <Briefcase className="w-4 h-4 text-rose-600" />
                <span>4. Placement Intelligence</span>
              </div>
              <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                {student.breakdown.placementScore} pts
              </span>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Target Career Track:</span>
                <span className="font-bold text-rose-900 truncate max-w-[140px]">
                  {student.placement.preferredDomain}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Coding Platform Rating:</span>
                <span className="font-mono font-bold text-slate-900">{student.placement.codingScore} / 100</span>
              </div>
              <div className="flex justify-between">
                <span>Quantitative Aptitude:</span>
                <span className="font-mono text-slate-700">{student.placement.aptitudeScore}%</span>
              </div>
              <div className="flex justify-between">
                <span>Mock Interview Score:</span>
                <span className="font-mono text-slate-700">{student.placement.mockInterviewRating} / 10</span>
              </div>
            </div>
          </div>

          {/* 5. Skills & Projects Card */}
          <div className="border border-cyan-200/90 rounded-2xl p-5 bg-gradient-to-br from-white to-cyan-50/60 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-cyan-800 font-bold text-xs">
                <Wrench className="w-4 h-4 text-cyan-600" />
                <span>5. Skills & Tech Stack</span>
              </div>
              <span className="text-[10px] font-bold bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">
                {student.breakdown.skillsScore} pts
              </span>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Technical Skill Rating:</span>
                <span className="font-mono font-bold text-slate-900">{student.skills.technicalSkillRating} / 100</span>
              </div>
              <div className="flex justify-between">
                <span>GitHub Repositories:</span>
                <span className="font-mono text-slate-700">{student.skills.gitHubProjectsCount} repos</span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1">
                <span className="font-bold text-slate-800">Technologies:</span>{' '}
                {student.skills.primaryTechnologies.join(', ')}
              </div>
              <div className="text-[11px] text-slate-500">
                <span className="font-bold text-slate-800">Certifications:</span>{' '}
                {student.skills.verifiedCertifications.length > 0
                  ? student.skills.verifiedCertifications.join(', ')
                  : 'None logged yet'}
              </div>
            </div>
          </div>

          {/* 6 & 7. Engagement & Feedback Card */}
          <div className="border border-amber-200/90 rounded-2xl p-5 bg-gradient-to-br from-white to-amber-50/60 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <span>6 & 7. Engagement & Pulse</span>
              </div>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                {student.breakdown.feedbackScore} pts
              </span>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Hackathons Attended:</span>
                <span className="font-mono font-bold text-slate-900">{student.engagement.hackathonsAttended}</span>
              </div>
              <div className="flex justify-between">
                <span>Faculty Rating:</span>
                <span className="font-mono text-slate-700">{student.feedback.facultyRating} / 5.0</span>
              </div>
              <div className="flex justify-between">
                <span>Pulse Satisfaction:</span>
                <span className="font-bold text-slate-800">{student.feedback.satisfactionLevel}</span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1">
                <span className="font-bold text-slate-800">Primary Concern:</span>{' '}
                <span className="italic">{student.feedback.primaryConcernArea}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student-Friendly Feedback Guide (Clear and easy to understand) */}
      <StudentFriendlyFeedbackCard student={student} onNavigateToTab={onNavigateToTab} />

      {/* Row 4: Activities Done by Student & Updates to Faculty */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold mb-1">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Activities Done by {student.name}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Logged Student Activities & Academic Enrichment Work
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Activities performed by the student are updated in this log so faculty advisor{' '}
              <strong className="text-slate-700">{student.mentorName}</strong> can acknowledge and review progress.
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('student-engagement')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
          >
            <span>Open Student Engagement Hub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {currentStudentActivities.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 animate-in fade-in duration-500">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-1.5 animate-pulse" />
            <p className="text-xs font-semibold text-slate-700">No activities logged yet by {student.name}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              The student can log learning tasks, labs, and projects in the Student Engagement module.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentStudentActivities.map((act, index) => {
              const isAcked = acknowledgedActivities[act.id] || act.verifiedByStaff;
              return (
                <div
                  key={act.id}
                  style={{ animationDelay: `${index * 100}ms` }}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-400 hover:shadow-lg transition-all duration-300 space-y-2 text-xs animate-in fade-in slide-in-from-bottom-3 transform hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-600 opacity-75"></div>
                  <div className="flex items-start justify-between gap-2 pl-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{act.title}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all duration-300 ${
                            act.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {act.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                        {act.category} · {act.semesterSubject || student.department} · {act.hoursSpent} hrs logged
                      </div>
                    </div>

                    {userType === 'staff' && (
                      <button
                        onClick={() => {
                          setAcknowledgedActivities((prev) => ({ ...prev, [act.id]: true }));
                          if (onUpdateStudentActivity) {
                            onUpdateStudentActivity({
                              ...act,
                              verifiedByStaff: true,
                              staffFeedback: 'Reviewed and acknowledged by faculty lead.',
                            });
                          }
                        }}
                        disabled={isAcked}
                        className={`text-[11px] px-3 py-1.5 rounded-xl font-bold transition-all duration-300 transform active:scale-95 ${
                          isAcked
                            ? 'bg-purple-100 text-purple-800 border border-purple-200 cursor-default shadow-xs'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 cursor-pointer shadow-md shadow-blue-500/20 animate-pulse'
                        }`}
                      >
                        {isAcked ? '✓ Acknowledged' : 'Acknowledge Activity'}
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2 pl-2">{act.description}</p>

                  {act.learningOutcomes && (
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 pl-2 pt-1 border-t border-slate-100">
                      <strong className="text-slate-700">Outcome:</strong>
                      <span className="italic truncate">{act.learningOutcomes}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Row 5: STUDENT COHORT DIRECTORY TABLE WITH COLOR-CODED VISUAL STATUS INDICATORS */}
      {userType !== 'student' ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-700 text-xs font-bold mb-1">
                <Users2 className="w-4 h-4 text-blue-600" />
                <span>Student Directory & Visual Alert Indicator Table</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Student Cohort List & Support Alert Status Indicators
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time risk status indicators: <span className="inline-flex items-center gap-1 text-rose-700 font-semibold"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span> High Risk</span>, <span className="inline-flex items-center gap-1 text-amber-700 font-semibold"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> Medium Risk</span>, and <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Low Risk / On Track</span>.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={tableDeptFilter}
                onChange={(e) => setTableDeptFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-700 focus:outline-none"
              >
                <option value="All">All Departments</option>
                <option value="Electronics & Comm (ECE)">ECE</option>
                <option value="Computer Science (CSE)">CSE</option>
                <option value="Information Tech (IT)">IT</option>
                <option value="Electrical & Electronics (EEE)">EEE</option>
                <option value="Mechanical Eng (MECH)">MECH</option>
              </select>

              <select
                value={tableRiskFilter}
                onChange={(e) => setTableRiskFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-700 focus:outline-none"
              >
                <option value="All">All Risk Indicators</option>
                <option value="High">🔴 High Risk</option>
                <option value="Medium">🟡 Medium Risk</option>
                <option value="Low">🟢 Low Risk / On Track</option>
              </select>
            </div>
          </div>

          {/* Student List Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Department & Sem</th>
                  <th className="py-3 px-4">Success Score</th>
                  <th className="py-3 px-4">Support Alert Status</th>
                  <th className="py-3 px-4">Attendance & GPA</th>
                  <th className="py-3 px-4">Activities</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tableStudents.map((st) => {
                  const isSelected = st.id === student.id;
                  const alertMeta = getStudentSupportAlertStatus(st);
                  const stActivitiesCount = studentActivities.filter((a) => a.studentId === st.id).length;

                  return (
                    <tr
                      key={st.id}
                      onClick={() => onSelectStudent(st.id)}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/70 hover:bg-blue-50'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* 1. Student Identity */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                            {st.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{st.name}</span>
                              {isSelected && (
                                <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-medium">
                                  Viewing
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500">{st.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Department & Semester */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{st.department}</div>
                        <div className="text-[10px] text-slate-500">Semester {st.semester} · {st.batch}</div>
                      </td>

                      {/* 3. Composite Success Score */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-900">
                            {st.compositeScore}
                          </span>
                          <span className="text-[10px] text-slate-400">/100</span>
                        </div>
                      </td>

                      {/* 4. Support Alert Status with Visual Status Indicators (Small color-coded circles) */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {/* Visual Indicator: Small color-coded circle */}
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${alertMeta.dotColor} ring-4 shrink-0 inline-block shadow-xs animate-pulse`}
                              title={`Status: ${alertMeta.label}`}
                            />
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${alertMeta.badgeClass}`}
                            >
                              {alertMeta.label}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-600 font-medium truncate max-w-[200px]" title={alertMeta.evidence}>
                            {alertMeta.alertTitle}
                          </div>
                        </div>
                      </td>

                      {/* 5. Attendance & GPA */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-xs">
                          <span className={st.attendance.overallPercentage < 75 ? 'text-rose-600 font-bold' : 'text-emerald-700 font-semibold'}>
                            {st.attendance.overallPercentage}% Attd
                          </span>
                          <span className="text-slate-400 mx-1">·</span>
                          <span className="text-slate-800 font-semibold">
                            {st.academic.gpa.toFixed(1)} GPA
                          </span>
                        </div>
                      </td>

                      {/* 6. Activities Done */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          <Activity className="w-3 h-3 text-emerald-600" />
                          <span>{stActivitiesCount} logged</span>
                        </span>
                      </td>

                      {/* 7. Action Button */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleOpenExportModal(st, e)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                            title={`Export Meeting PDF for ${st.name}`}
                          >
                            <FileDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectStudent(st.id);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Inspect 360°'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* If student is logged in, show their personal Support Standing Card */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">My Support Alert & Academic Health Standing</h3>
            </div>
            {(() => {
              const meta = getStudentSupportAlertStatus(student);
              return (
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${meta.dotColor} ring-4 shrink-0 inline-block`} />
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${meta.badgeClass}`}>
                    {meta.label}
                  </span>
                </div>
              );
            })()}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your telemetry profile is continuously evaluated against attendance compliance, coursework completion, and placement targets. Your faculty mentor <strong className="text-slate-800">{student.mentorName}</strong> receives real-time updates whenever you complete learning tasks in the Student Engagement module.
          </p>
        </div>
      )}

      {/* PDF Meeting Report Export Modal */}
      <StudentReportExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        student={exportTargetStudent || student}
        alerts={alerts}
      />
    </motion.div>
  );
}
