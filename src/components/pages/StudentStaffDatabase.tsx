import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../firebase/AuthContext';
import {
  Users,
  Search,
  GraduationCap,
  Briefcase,
  ShieldAlert,
  Server,
  RefreshCw,
  Plus,
  Download,
  Filter,
  Eye,
  X,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  Layers,
  ArrowUpDown,
  Clock,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Gamepad2,
  FileCheck,
  Check,
  ChevronRight,
  Flame,
  Activity,
  HeartPulse,
  Code2,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { evaluateStudentStreak } from '../../utils/speedometerUtils';
import { isSameBranch, normalizeBranch, COLLEGE_STAFF_50, COLLEGE_BRANCHES } from '../../data/collegeDatabase';

interface BackendStudent {
  id: string;
  name: string;
  email: string;
  gender: string;
  department: string;
  batch: string;
  semester: number;
  mentorName: string;
  compositeScore: number;
  riskLevel: string;
  gpa: number;
  attendance: number;
  backlogs: number;
  preferredDomain: string;
  placementReadiness: string;
  codingScore: number;
  phone: string;
  primaryTechnologies: string[];
  loginStreak?: number;
  lastLoginDate?: string;
  telemetry?: {
    academic?: { gpa: number; backlogsCount: number; internalAssessmentScore: number; totalCreditsCompleted: number };
    attendance?: { overallPercentage: number; theoryPercentage: number; practicalPercentage: number };
    lms?: { portalLoginsPerWeek: number; quizAverageScore: number; assignmentOnTimeRate: number };
    behavioral?: { conductRating: string; hackathonsAttended: number; seminarAttendance: number };
    skills?: { technicalSkillRating: number; softSkillRating: number; certificationsCount: number };
    placement?: { aptitudeScore: number; codingScore: number; mockInterviewRating: number; readinessLevel: string };
    feedback?: { satisfactionLevel: string; sentimentScore: number; primaryConcernArea: string };
  };
}

export interface BackendStaffActivity {
  id: string;
  staffId: string;
  staffName: string;
  department: string;
  activityType: 'Mentoring Review' | 'Activity Verification' | 'Remediation Scheduled' | 'Early Alert Review' | 'Student Advisory Note';
  studentId?: string;
  studentName?: string;
  notes: string;
  timestamp: string;
}

interface BackendStaff {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  role: string;
  cabin: string;
  phone: string;
  officeHours: string;
  coursesTaught: string[];
  specialization: string;
  assignedStudentsCount: number;
  experienceYears: number;
}

interface BackendActivity {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  title: string;
  category: 'Academic Booster' | 'Knowledge Refresher' | 'Hands-on Project' | 'Skill & Certification' | 'Peer Study & Seminar' | 'Interactive Quiz';
  description: string;
  status: 'Planned' | 'In Progress' | 'Completed';
  progressPct: number;
  hoursSpent: number;
  dateLogged: string;
  dateCompleted?: string;
  verifiedByStaff: boolean;
  staffFeedback?: string;
  verifiedByStaffName?: string;
  verifiedAt?: string;
  learningOutcomes?: string;
  semesterSubject?: string;
  mentorName?: string;
  score?: number;
}

interface DatabaseStats {
  totalStudents: number;
  totalStaff: number;
  avgGpa: string;
  avgAttendance: number;
  backlogsTotal: number;
  departmentCount: number;
}

export function StudentStaffDatabase() {
  const { userType, role, department } = useAuth();

  const isBranchLocked = userType === 'staff' && role !== 'Dean of Academics';
  const staffBranch = department || 'Electronics & Comm (ECE)';

  const [activeTab, setActiveTab] = useState<'students' | 'staff' | 'engagement' | 'staff-actions'>('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('All');

  // Engagement filters
  const [activityCategoryFilter, setActivityCategoryFilter] = useState('All');
  const [activityStatusFilter, setActivityStatusFilter] = useState('All');
  const [activityVerifiedFilter, setActivityVerifiedFilter] = useState('All');

  // Backend state
  const [students, setStudents] = useState<BackendStudent[]>([]);
  const [staffList, setStaffList] = useState<BackendStaff[]>([]);
  const [activities, setActivities] = useState<BackendActivity[]>([]);
  const [staffActivities, setStaffActivities] = useState<BackendStaffActivity[]>([]);
  const [isAddStaffActivityOpen, setIsAddStaffActivityOpen] = useState(false);
  const [newStaffActivityData, setNewStaffActivityData] = useState({
    staffId: 'STF-ECE-01',
    staffName: 'Dr. Ramesh Sundaram',
    department: 'Electronics & Comm (ECE)',
    activityType: 'Mentoring Review' as const,
    studentId: 'ENX-2024-101',
    studentName: 'Aarav Patel',
    notes: '',
  });

  const [activityStats, setActivityStats] = useState<{
    totalActivities: number;
    completed: number;
    inProgress: number;
    planned: number;
    verifiedCount: number;
    pendingVerification: number;
    totalHours: number;
  } | null>(null);

  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'error' | 'loading'>('loading');

  // Modals state
  const [selectedStudent, setSelectedStudent] = useState<BackendStudent | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<BackendStaff | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<BackendActivity | null>(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

  // Review modal / Inline feedback state
  const [reviewNote, setReviewNote] = useState('');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // New record forms state
  const [newStudentData, setNewStudentData] = useState({
    name: '',
    email: '',
    department: isBranchLocked ? staffBranch : 'Electronics & Comm (ECE)',
    semester: 6,
    batch: '2022-2026',
    mentorName: 'Dr. Ramesh Sundaram',
    gpa: 8.0,
    attendance: 88,
    preferredDomain: 'Embedded Systems & IoT',
  });

  const [newStaffData, setNewStaffData] = useState({
    name: '',
    email: '',
    department: 'Computer Science (CSE)',
    designation: 'Assistant Professor',
    cabin: 'Room C-201',
    phone: '+91 98401 99999',
    specialization: 'Software Systems',
  });

  // Fetch data from backend API with strict Branch Isolation for Staff
  const fetchStudents = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('q', searchTerm);
      
      // MAIN SECURITY RULE:
      // Staff members only see students belonging to their branch.
      if (isBranchLocked) {
        params.set('staffBranch', staffBranch);
        params.set('staffRole', role || 'Faculty Advisor');
      } else if (departmentFilter !== 'All') {
        params.set('department', departmentFilter);
      }

      if (riskFilter !== 'All') params.set('riskLevel', riskFilter);
      if (semesterFilter !== 'All') params.set('semester', semesterFilter);

      const res = await fetch(`/api/database/students?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load students from backend API');
      const data = await res.json();
      setStudents(data.students || []);
      setBackendStatus('connected');
    } catch (err: any) {
      console.error('Error fetching students:', err);
      setError(err.message);
      setBackendStatus('error');
    }
  }, [searchTerm, departmentFilter, riskFilter, semesterFilter, isBranchLocked, staffBranch, role]);

  const fetchStaff = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('q', searchTerm);
      if (departmentFilter !== 'All') params.set('department', departmentFilter);

      const res = await fetch(`/api/database/staff?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load staff from backend API');
      const data = await res.json();
      setStaffList(data.staff || []);
      setBackendStatus('connected');
    } catch (err: any) {
      console.error('Error fetching staff:', err);
      setError(err.message);
      setBackendStatus('error');
    }
  }, [searchTerm, departmentFilter]);

  const fetchActivities = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('q', searchTerm);
      
      if (isBranchLocked) {
        params.set('department', staffBranch);
      } else if (departmentFilter !== 'All') {
        params.set('department', departmentFilter);
      }

      if (activityCategoryFilter !== 'All') params.set('category', activityCategoryFilter);
      if (activityStatusFilter !== 'All') params.set('status', activityStatusFilter);
      if (activityVerifiedFilter === 'Verified') params.set('verified', 'true');
      if (activityVerifiedFilter === 'Pending') params.set('verified', 'false');

      const res = await fetch(`/api/student-engagement/activities?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load student engagement from backend API');
      const data = await res.json();
      setActivities(data.activities || []);
      if (data.stats) setActivityStats(data.stats);
      setBackendStatus('connected');
    } catch (err: any) {
      console.error('Error fetching activities:', err);
      setError(err.message);
      setBackendStatus('error');
    }
  }, [searchTerm, departmentFilter, activityCategoryFilter, activityStatusFilter, activityVerifiedFilter, isBranchLocked, staffBranch]);

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams();
      if (isBranchLocked) {
        params.set('staffBranch', staffBranch);
        params.set('staffRole', role || 'Faculty Advisor');
      }
      const res = await fetch(`/api/database/stats?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.warn('Could not load database stats:', err);
    }
  };

  const fetchStaffActivities = useCallback(async () => {
    try {
      const res = await fetch('/api/database/staff-activities');
      if (res.ok) {
        const data = await res.json();
        setStaffActivities(data.activities || []);
      }
    } catch (err) {
      console.warn('Could not load staff activities:', err);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchStudents(), fetchStaff(), fetchActivities(), fetchStaffActivities(), fetchStats()]);
    setLoading(false);
  }, [fetchStudents, fetchStaff, fetchActivities, fetchStaffActivities]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleCreateStaffActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffActivityData.notes.trim()) return;
    try {
      const res = await fetch('/api/database/staff-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaffActivityData),
      });
      if (!res.ok) throw new Error('Failed to record staff activity on backend');
      setIsAddStaffActivityOpen(false);
      setNewStaffActivityData((prev) => ({ ...prev, notes: '' }));
      showToast('Staff advisory/verification milestone saved to backend institutional database.');
      fetchStaffActivities();
    } catch (err: any) {
      alert(err.message || 'Error saving staff activity');
    }
  };

  // Handle Add Student
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/database/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudentData),
      });
      if (!res.ok) throw new Error('Failed to create student on backend');
      setIsAddStudentOpen(false);
      showToast('New student record created in backend database.');
      fetchStudents();
      fetchStats();
    } catch (err: any) {
      alert(err.message || 'Error saving student');
    }
  };

  // Handle Add Staff
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/database/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaffData),
      });
      if (!res.ok) throw new Error('Failed to register staff on backend');
      setIsAddStaffOpen(false);
      showToast('Staff profile registered in backend database.');
      fetchStaff();
      fetchStats();
    } catch (err: any) {
      alert(err.message || 'Error saving staff');
    }
  };

  // Handle Staff Verification of Activity
  const handleVerifyActivity = async (activityId: string, customFeedback?: string) => {
    try {
      const res = await fetch(`/api/student-engagement/activities/${activityId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffFeedback: customFeedback || 'Verified and approved by faculty advisor. High academic diligence commended.',
          verifiedByStaffName: role || 'Faculty Advisor',
        }),
      });
      if (!res.ok) throw new Error('Failed to verify activity on backend');
      const data = await res.json();
      setActivities((prev) => prev.map((a) => (a.id === activityId ? data.activity : a)));
      showToast(`Activity ${activityId} successfully verified! Advisor review saved.`);
      setVerifyingId(null);
      setReviewNote('');
      fetchActivities();
    } catch (err: any) {
      alert(err.message || 'Error verifying activity');
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (activeTab === 'students') {
      const headers = ['ID', 'Name', 'Email', 'Department', 'Semester', 'GPA', 'Attendance', 'Risk Level', 'Mentor'];
      const rows = students.map((s) => [s.id, s.name, s.email, s.department, s.semester, s.gpa, `${s.attendance}%`, s.riskLevel, s.mentorName]);
      const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
      downloadFile(csv, `edunexus_students_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
    } else if (activeTab === 'staff') {
      const headers = ['ID', 'Name', 'Email', 'Department', 'Designation', 'Cabin', 'Assigned Students'];
      const rows = staffList.map((st) => [st.id, st.name, st.email, st.department, st.designation, st.cabin, st.assignedStudentsCount]);
      const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
      downloadFile(csv, `edunexus_staff_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
    } else {
      const headers = ['ID', 'StudentID', 'StudentName', 'Department', 'Title', 'Category', 'Subject', 'Hours', 'Status', 'Verified', 'Advisor'];
      const rows = activities.map((a) => [a.id, a.studentId, a.studentName, a.department, a.title, a.category, a.semesterSubject || '', a.hoursSpent, a.status, a.verifiedByStaff ? 'Yes' : 'No', a.mentorName || '']);
      const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
      downloadFile(csv, `edunexus_engagement_telemetry_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
    }
  };

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // Staff Security Guard: If not staff, show access denied
  if (userType !== 'staff') {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Staff-Only Institutional Database</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Access to the centralized student and staff backend repository is restricted to authorized faculty members, academic advisors, and institutional deans.
          </p>
          <div className="text-xs font-mono text-slate-500">Security Policy: ROLE_STAFF_DATABASE_PRIVILEGE_REQUIRED</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl border border-blue-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom duration-300 max-w-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium leading-relaxed">{toastMessage}</span>
        </div>
      )}

      {/* Database Header & Server Status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50">
                <Server className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                Backend Institutional Database Store (Staff Authorized)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Location: Node.js Express REST Backend</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Student, Staff & Engagement Database Hub
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Authoritative repository storing student dossiers, faculty advisor rosters, and real-time student engagement activity logs submitted from coursework, quizzes, and learning plans.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono">
              <div
                className={`w-2 h-2 rounded-full ${
                  backendStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span className="text-slate-600 dark:text-slate-300 font-semibold">
                {backendStatus === 'connected' ? 'REST API: Online (200 OK)' : 'API: Reconnecting...'}
              </span>
            </div>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={loadAllData}
              disabled={loading}
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Refresh database records"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Live Backend Telemetry Strip */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Students Enrolled</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.totalStudents}</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Faculty & Advisors</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.totalStaff}</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Engagement Activities</span>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">{activities.length}</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Average GPA</span>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{stats.avgGpa} / 10</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Avg Attendance</span>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.avgAttendance}%</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Pending Verifications</span>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                {activities.filter((a) => !a.verifiedByStaff).length}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs & Search Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Segmented View Switcher */}
          <div className="flex flex-wrap bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 gap-1">
            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Students Directory ({students.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'staff'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Faculty & Staff Directory ({staffList.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('engagement')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'engagement'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Award className="w-4 h-4 text-purple-500" />
              <span>Student Activities ({activities.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('staff-actions')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'staff-actions'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-indigo-500" />
              <span>Staff Actions & Mentoring ({staffActivities.length})</span>
            </button>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Department:</span>
            {isBranchLocked && activeTab === 'students' ? (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300"
                title="Branch access is locked to your faculty department"
              >
                <span>🔒 {staffBranch} (Branch Isolated)</span>
              </div>
            ) : (
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <option value="All">All Departments (1000 Students / 50 Staff)</option>
                <option value="Electronics & Comm (ECE)">Electronics & Comm (ECE)</option>
                <option value="Computer Science (CSE)">Computer Science (CSE)</option>
                <option value="Information Tech (IT)">Information Tech (IT)</option>
                <option value="Electrical & Electronics (EEE)">Electrical & Electronics (EEE)</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
              </select>
            )}
          </div>
        </div>

        {/* Search Bar & Secondary Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={
                activeTab === 'students'
                  ? 'Search by student name, ID, roll number, or domain...'
                  : activeTab === 'staff'
                  ? 'Search staff name, cabin, designation, courses...'
                  : 'Search activities by title, student name, subject, or outcomes...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
            />
          </div>

          {activeTab === 'students' && (
            <>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <option value="All">All Risk Tiers</option>
                <option value="Low Support Need">Low Support Need (Stable)</option>
                <option value="Moderate Attention">Moderate Attention</option>
                <option value="High Risk">High Risk / Flagged</option>
              </select>

              <button
                onClick={() => setIsAddStudentOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Student Record</span>
              </button>
            </>
          )}

          {activeTab === 'staff' && (
            <button
              onClick={() => setIsAddStaffOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff Profile</span>
            </button>
          )}

          {activeTab === 'engagement' && (
            <>
              <select
                value={activityCategoryFilter}
                onChange={(e) => setActivityCategoryFilter(e.target.value)}
                className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <option value="All">All Categories</option>
                <option value="Interactive Quiz">Interactive Quizzes</option>
                <option value="Hands-on Project">Hands-on Projects</option>
                <option value="Academic Booster">Academic Boosters</option>
                <option value="Skill & Certification">Skill & Certification</option>
                <option value="Knowledge Refresher">Knowledge Refreshers</option>
              </select>

              <select
                value={activityVerifiedFilter}
                onChange={(e) => setActivityVerifiedFilter(e.target.value)}
                className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <option value="All">All Review Statuses</option>
                <option value="Pending">Pending Staff Review</option>
                <option value="Verified">Verified by Advisor</option>
              </select>

              <select
                value={activityStatusFilter}
                onChange={(e) => setActivityStatusFilter(e.target.value)}
                className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <option value="All">All Progress</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Planned">Planned</option>
              </select>
            </>
          )}

          {activeTab === 'staff-actions' && (
            <button
              onClick={() => setIsAddStaffActivityOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Staff Advisory Action</span>
            </button>
          )}
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl flex items-center justify-between text-xs text-red-700 dark:text-red-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span>{error}</span>
          </div>
          <button onClick={loadAllData} className="font-bold underline cursor-pointer">
            Retry Connection
          </button>
        </div>
      )}

      {/* VIEW 1: STUDENTS DIRECTORY */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Branch Privacy & Access Governance Banner for Staff */}
          {isBranchLocked && (
            <div className="p-4 bg-gradient-to-r from-blue-50/95 via-indigo-50/90 to-blue-50/95 dark:from-blue-950/50 dark:via-indigo-950/40 dark:to-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-950 dark:text-blue-100 shadow-xs">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl shrink-0 mt-0.5 sm:mt-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-blue-900 dark:text-blue-200 flex items-center gap-2">
                    <span>Departmental Access Isolation Active</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-blue-200 dark:bg-blue-900/80 rounded-md font-bold text-blue-800 dark:text-blue-200">
                      RBAC Enforced
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed text-[11px]">
                    Logged in as faculty in <strong className="text-blue-700 dark:text-blue-300">{staffBranch}</strong>.
                    You have access exclusively to students in <strong>{staffBranch}</strong> ({students.length} students).
                    Profiles of students in other branches are strictly hidden from your account to maintain institutional data isolation.
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-2 self-end sm:self-auto">
                <span className="px-3 py-1.5 bg-white/80 dark:bg-slate-900/80 border border-blue-300 dark:border-blue-700 rounded-xl font-mono text-xs font-bold text-blue-700 dark:text-blue-300">
                  🔒 {staffBranch} Only
                </span>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
          {students.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-semibold">No student records match the active criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Student Dossier</th>
                    <th className="p-4">Department & Batch</th>
                    <th className="p-4">Academic CGPA</th>
                    <th className="p-4">Attendance</th>
                    <th className="p-4">Daily Speedometer</th>
                    <th className="p-4">Risk Category</th>
                    <th className="p-4">Advisor</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{student.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">{student.id} · {student.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{student.department}</div>
                        <div className="text-[11px] text-slate-400">Semester {student.semester} · Batch {student.batch}</div>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                        <span className={student.gpa >= 8.5 ? 'text-emerald-600' : student.gpa < 7.0 ? 'text-amber-600' : 'text-blue-600'}>
                          {student.gpa.toFixed(1)} / 10
                        </span>
                        <div className="text-[10px] text-slate-400 font-normal">{student.backlogs} backlogs</div>
                      </td>
                      <td className="p-4 font-mono font-bold">
                        <span className={student.attendance >= 85 ? 'text-emerald-600' : 'text-rose-500'}>
                          {student.attendance}%
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 border ${
                              (student.loginStreak || 0) > 0
                                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                                : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            <Flame className={`w-3.5 h-3.5 ${(student.loginStreak || 0) > 0 ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                            <span>Day {student.loginStreak ?? 0}</span>
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {(student.loginStreak || 0) > 0 ? 'Active 24h streak' : 'Reset (Missed login)'}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            student.riskLevel.includes('High')
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : student.riskLevel.includes('Moderate')
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {student.riskLevel}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                        {student.mentorName}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudent(student);
                          }}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          View Dossier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      )}

      {/* VIEW 2: FACULTY & STAFF DIRECTORY */}
      {activeTab === 'staff' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffList.map((st) => (
            <div
              key={st.id}
              onClick={() => setSelectedStaff(st)}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer shadow-xs flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50">
                    {st.role}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{st.id}</span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 transition-colors">
                    {st.name}
                  </h3>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">{st.designation}</div>
                  <div className="text-xs text-slate-400">{st.department}</div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{st.cabin}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{st.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{st.phone}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Assigned: <strong className="text-slate-800 dark:text-slate-200">{st.assignedStudentsCount} students</strong></span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform">Details →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 3: STUDENT ENGAGEMENT TELEMETRY (Staff View) */}
      {activeTab === 'engagement' && (
        <div className="space-y-4">
          {/* Telemetry Summary Cards */}
          {activityStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Logged Activities</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{activityStats.totalActivities}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Across all branches</div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Completed Milestones</span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{activityStats.completed}</div>
                <div className="text-[10px] text-emerald-500/80 mt-0.5">100% progress verified</div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Dedicated Study Hours</span>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{activityStats.totalHours} hrs</div>
                <div className="text-[10px] text-blue-500/80 mt-0.5">Coursework & lab practice</div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Pending Advisor Reviews</span>
                <div className="text-2xl font-black text-amber-500 mt-1">{activityStats.pendingVerification}</div>
                <div className="text-[10px] text-amber-600/80 mt-0.5">Awaiting staff endorsement</div>
              </div>
            </div>
          )}

          {/* Activities List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            {activities.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Student Activities Found</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  No engagement records match the selected filter. Students log activities when completing coursework plans, project milestones, or interactive quizzes.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {activities.map((act, index) => (
                  <div
                    key={act.id}
                    style={{ animationDelay: `${index * 60}ms` }}
                    className="p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-all duration-300 space-y-3 animate-in fade-in slide-in-from-bottom-2 transform hover:scale-[1.002] border-l-4 border-transparent hover:border-blue-500"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            {act.studentName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {act.studentId}
                          </span>
                          <span className="text-[10px] text-slate-500">· {act.department}</span>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              act.category === 'Interactive Quiz'
                                ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300'
                                : act.category === 'Hands-on Project'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300'
                                : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
                            }`}
                          >
                            {act.category}
                          </span>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              act.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : act.status === 'In Progress'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {act.status} ({act.progressPct}%)
                          </span>

                          {act.verifiedByStaff ? (
                            <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Verified by Advisor</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                              Pending Advisor Review
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight pt-0.5">
                          {act.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span>Subject: <strong className="text-slate-700 dark:text-slate-300">{act.semesterSubject || 'General Core'}</strong></span>
                          <span>·</span>
                          <span>Time Spent: <strong className="text-slate-700 dark:text-slate-300">{act.hoursSpent} hrs</strong></span>
                          <span>·</span>
                          <span>Logged: <strong className="text-slate-700 dark:text-slate-300">{act.dateLogged}</strong></span>
                          {act.mentorName && (
                            <>
                              <span>·</span>
                              <span>Advisor: <strong className="text-slate-700 dark:text-slate-300">{act.mentorName}</strong></span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Staff Verification Button */}
                      <div className="shrink-0 flex items-center gap-2">
                        {!act.verifiedByStaff && (
                          <button
                            onClick={() => {
                              setVerifyingId(act.id);
                              setReviewNote('');
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verify & Endorse</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedActivity(act)}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Inspect Log
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                      {act.description}
                    </p>

                    {act.learningOutcomes && (
                      <div className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                        <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0">Student Reflection & Learnings:</span>
                        <span className="italic">{act.learningOutcomes}</span>
                      </div>
                    )}

                    {act.verifiedByStaff && act.staffFeedback && (
                      <div className="p-3 bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-2xl text-xs text-purple-900 dark:text-purple-200 flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Faculty Advisor Endorsement ({act.verifiedByStaffName || act.mentorName || 'Advisor'}):</span>{' '}
                          <span>{act.staffFeedback}</span>
                          {act.verifiedAt && (
                            <span className="block text-[10px] text-purple-600/70 dark:text-purple-400/70 mt-0.5">
                              Verified on: {new Date(act.verifiedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Inline Verification Form */}
                    {verifyingId === act.id && (
                      <div className="p-4 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800 rounded-2xl space-y-3 animate-in fade-in">
                        <div className="font-bold text-xs text-purple-900 dark:text-purple-200 flex items-center justify-between">
                          <span>Submit Advisor Verification for {act.studentName}</span>
                          <button
                            onClick={() => setVerifyingId(null)}
                            className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                          >
                            ✕
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          placeholder="Provide commendation, feedback, or advisory guidance on this coursework milestone..."
                          value={reviewNote}
                          onChange={(e) => setReviewNote(e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setVerifyingId(null)}
                            className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleVerifyActivity(act.id, reviewNote)}
                            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow-sm"
                          >
                            Save Verification & Award Endorsement
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 4: STAFF INSTITUTIONAL ACTIONS & MENTORING */}
      {activeTab === 'staff-actions' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-1">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Institutional Staff & Advisor Governance Records</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Staff Mentoring, Remediation & Verification Logs
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Authoritative record of faculty advisory notes, coursework verification endorsements, and scheduled remediation clinics.
              </p>
            </div>

            <button
              onClick={() => setIsAddStaffActivityOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Staff Advisory Action</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            {staffActivities.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Staff Activities Recorded</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Click 'Record Staff Advisory Action' to document a mentoring milestone, remediation clinic, or advisory review.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {staffActivities.map((act) => (
                  <div key={act.id} className="p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                          {act.staffName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {act.staffId}
                        </span>
                        <span className="text-[10px] text-slate-500">· {act.department}</span>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800">
                          {act.activityType}
                        </span>

                        {act.studentName && (
                          <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span>Scholar:</span>
                            <strong className="text-slate-900 dark:text-white">{act.studentName}</strong>
                            <span className="font-mono text-slate-400">({act.studentId})</span>
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(act.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                      {act.notes}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STUDENT DOSSIER MODAL WITH 7 TELEMETRY CATEGORIES & DAILY LOGIN SPEEDOMETER */}
      {selectedStudent && (() => {
        const streakInfo = evaluateStudentStreak(selectedStudent.lastLoginDate, selectedStudent.loginStreak);
        const telem = selectedStudent.telemetry || {};
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 lg:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-xl">{selectedStudent.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        Semester {selectedStudent.semester}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-slate-400 mt-0.5">
                      ID: {selectedStudent.id} · {selectedStudent.department} · Mentor: {selectedStudent.mentorName}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xl font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* 1. DAILY LOGIN SPEEDOMETER CARD */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/15 border border-amber-300 dark:border-amber-700/60 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
                      <Flame className="w-5 h-5 fill-white" />
                    </span>
                    <div>
                      <div className="text-xs font-extrabold text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                        <span>Daily Login Speedometer</span>
                        <span className="text-[10px] font-mono px-2 py-0.2 bg-amber-200 dark:bg-amber-900/60 rounded-full text-amber-900 dark:text-amber-200">
                          Automated 24h Cycle
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Current Streak Gauge: <strong className="text-amber-600 dark:text-amber-400 font-mono text-base">{streakInfo.effectiveStreak} Consecutive Days</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      streakInfo.effectiveStreak > 0
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300'
                    }`}>
                      {streakInfo.effectiveStreak > 0 ? `Active: Day ${streakInfo.effectiveStreak}` : 'Streak Reset: 0 Days'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <div className="font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Speedometer Logic Rule:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                    If student logs in today = <strong>1</strong>. If he/she logs in tomorrow = <strong>2</strong>. If he/she does not log in for 24h = <strong>speedometer automatically resets to 0</strong>. Operates strictly automatically on session auth with no manual buttons to prevent misuse.
                  </p>
                  <div className="pt-1 flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-500">
                    <span>Last Login Recorded: <strong>{selectedStudent.lastLoginDate || 'Never'}</strong></span>
                    <span>·</span>
                    <span>Status: <span className="text-amber-600 dark:text-amber-400 font-bold">{streakInfo.statusText}</span></span>
                  </div>
                </div>
              </div>

              {/* 2. STUDENT 360 PROFILE: THE 7 TELEMETRY CATEGORIES */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                      Student 360 Profile: The 7 Telemetry Categories
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Composite Health: {selectedStudent.compositeScore}% ({selectedStudent.riskLevel})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Category 1: Academic Telemetry */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>1. Academic Mastery</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-blue-600">{selectedStudent.gpa.toFixed(1)}/10</span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                      <div className="flex justify-between"><span>Internal Assessment:</span><strong>{telem.academic?.internalAssessmentScore || 80}%</strong></div>
                      <div className="flex justify-between"><span>Pending Backlogs:</span><strong className={selectedStudent.backlogs > 0 ? 'text-amber-600 font-bold' : 'text-emerald-600'}>{selectedStudent.backlogs} courses</strong></div>
                      <div className="flex justify-between"><span>Credits Completed:</span><strong>{telem.academic?.totalCreditsCompleted || 130} credits</strong></div>
                    </div>
                  </div>

                  {/* Category 2: Attendance Telemetry */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>2. Attendance & Regularity</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-600">{selectedStudent.attendance}%</span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                      <div className="flex justify-between"><span>Theory Attendance:</span><strong>{telem.attendance?.theoryPercentage || selectedStudent.attendance}%</strong></div>
                      <div className="flex justify-between"><span>Lab Practicals:</span><strong>{telem.attendance?.practicalPercentage || 92}%</strong></div>
                      <div className="flex justify-between"><span>Biometric Tracking:</span><strong className="text-emerald-600">Active Verified</strong></div>
                    </div>
                  </div>

                  {/* Category 3: LMS & Digital Telemetry */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        <span>3. LMS & Labs Telemetry</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-purple-600">{telem.lms?.portalLoginsPerWeek || 14}/wk</span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                      <div className="flex justify-between"><span>Weekly Logins:</span><strong>{telem.lms?.portalLoginsPerWeek || 14} sessions</strong></div>
                      <div className="flex justify-between"><span>Quiz Benchmark:</span><strong>{telem.lms?.quizAverageScore || 82}%</strong></div>
                      <div className="flex justify-between"><span>On-Time Assignments:</span><strong>{telem.lms?.assignmentOnTimeRate || 90}%</strong></div>
                    </div>
                  </div>

                  {/* Category 4: Behavioral & Soft Skills */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>4. Behavioral & Soft Skills</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-teal-600">{telem.behavioral?.conductRating || 'Exemplary'}</span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                      <div className="flex justify-between"><span>Conduct Record:</span><strong>{telem.behavioral?.conductRating || 'Exemplary'}</strong></div>
                      <div className="flex justify-between"><span>Hackathons Participated:</span><strong>{telem.behavioral?.hackathonsAttended || 2}</strong></div>
                      <div className="flex justify-between"><span>Seminars Attended:</span><strong>{telem.behavioral?.seminarAttendance || 5}</strong></div>
                    </div>
                  </div>

                  {/* Category 5: Technical Skills & Coding */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5" />
                        <span>5. Technical & Coding Skills</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-indigo-600">{selectedStudent.codingScore}/100</span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                      <div className="flex justify-between"><span>Technical Index:</span><strong>{telem.skills?.technicalSkillRating || 82}%</strong></div>
                      <div className="flex justify-between"><span>Certifications:</span><strong>{telem.skills?.certificationsCount || 2} verified</strong></div>
                      <div className="flex justify-between"><span>Primary Tech:</span><strong className="truncate max-w-[130px]">{selectedStudent.primaryTechnologies.slice(0, 2).join(', ')}</strong></div>
                    </div>
                  </div>

                  {/* Category 6: Placement & Career Readiness */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>6. Placement Readiness</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-600">{selectedStudent.placementReadiness}</span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                      <div className="flex justify-between"><span>Target Domain:</span><strong className="truncate max-w-[130px]">{selectedStudent.preferredDomain}</strong></div>
                      <div className="flex justify-between"><span>Aptitude Benchmark:</span><strong>{telem.placement?.aptitudeScore || 80}%</strong></div>
                      <div className="flex justify-between"><span>Mock Interview:</span><strong>{telem.placement?.mockInterviewRating || 8.0} / 10</strong></div>
                    </div>
                  </div>

                  {/* Category 7: Student Feedback & Wellness */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2 md:col-span-2 lg:col-span-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                        <HeartPulse className="w-3.5 h-3.5" />
                        <span>7. Student Feedback, Sentiment & Wellness Pulse</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-rose-600">{telem.feedback?.satisfactionLevel || 'High Satisfaction'}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                      <div>Satisfaction Tier: <strong className="text-slate-900 dark:text-white">{telem.feedback?.satisfactionLevel || 'High'}</strong></div>
                      <div>Sentiment Index: <strong className="text-slate-900 dark:text-white">{telem.feedback?.sentimentScore || 85}% Positive</strong></div>
                      <div>Focus Area: <strong className="text-slate-900 dark:text-white">{telem.feedback?.primaryConcernArea || 'Continuous lab facility access'}</strong></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. LOGGED ACTIVITIES FROM BACKEND DATABASE */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-between">
                  <span>Logged Activities & Quizzes in Backend Database:</span>
                  <span className="text-[11px] font-mono text-purple-600 font-semibold">
                    {activities.filter((a) => a.studentId === selectedStudent.id).length} recorded
                  </span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {activities.filter((a) => a.studentId === selectedStudent.id).length === 0 ? (
                    <div className="text-slate-400 text-xs italic p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                      No activities logged yet for this student.
                    </div>
                  ) : (
                    activities
                      .filter((a) => a.studentId === selectedStudent.id)
                      .map((act) => (
                        <div key={act.id} className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white">{act.title}</span>
                            <span className="text-[10px] font-semibold text-slate-500">{act.status} ({act.progressPct}%)</span>
                          </div>
                          <div className="text-slate-500 text-[11px]">Category: {act.category} · {act.hoursSpent} hrs · Logged: {act.dateLogged}</div>
                          {act.verifiedByStaff && (
                            <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Verified by Advisor ({act.verifiedByStaffName || act.mentorName || 'Advisor'})
                            </div>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* RECORD STAFF ACTIVITY MODAL */}
      {isAddStaffActivityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleCreateStaffActivity}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Record Staff Advisory Milestone</h3>
              <button
                type="button"
                onClick={() => setIsAddStaffActivityOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Faculty / Staff Member:</label>
                <select
                  value={newStaffActivityData.staffId}
                  onChange={(e) => {
                    const stf = staffList.find((s) => s.id === e.target.value);
                    setNewStaffActivityData((prev) => ({
                      ...prev,
                      staffId: e.target.value,
                      staffName: stf ? stf.name : 'Faculty Advisor',
                      department: stf ? stf.department : prev.department,
                    }));
                  }}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  {staffList.map((stf) => (
                    <option key={stf.id} value={stf.id}>
                      {stf.name} ({stf.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Activity Type:</label>
                <select
                  value={newStaffActivityData.activityType}
                  onChange={(e) => setNewStaffActivityData((prev) => ({ ...prev, activityType: e.target.value as any }))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Mentoring Review">Mentoring Review</option>
                  <option value="Activity Verification">Activity Verification</option>
                  <option value="Remediation Scheduled">Remediation Scheduled</option>
                  <option value="Early Alert Review">Early Alert Review</option>
                  <option value="Student Advisory Note">Student Advisory Note</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Associated Scholar:</label>
                <select
                  value={newStaffActivityData.studentId}
                  onChange={(e) => {
                    const st = students.find((s) => s.id === e.target.value);
                    setNewStaffActivityData((prev) => ({
                      ...prev,
                      studentId: e.target.value,
                      studentName: st ? st.name : 'Student Scholar',
                    }));
                  }}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.id}) · {st.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Advisory Notes & Remarks:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Document specific advice, milestone verification, or remediation details..."
                  value={newStaffActivityData.notes}
                  onChange={(e) => setNewStaffActivityData((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddStaffActivityOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
              >
                Save Record in Database
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STAFF DETAIL MODAL */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{selectedStaff.name}</h3>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{selectedStaff.designation}</div>
              </div>
              <button onClick={() => setSelectedStaff(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <div>Department: <strong className="text-slate-900 dark:text-white">{selectedStaff.department}</strong></div>
                <div>Cabin Location: <strong className="text-slate-900 dark:text-white">{selectedStaff.cabin}</strong></div>
                <div>Email: <strong className="text-slate-900 dark:text-white">{selectedStaff.email}</strong></div>
                <div>Office Hours: <strong className="text-slate-900 dark:text-white">{selectedStaff.officeHours}</strong></div>
                <div>Experience: <strong className="text-slate-900 dark:text-white">{selectedStaff.experienceYears} years</strong></div>
              </div>

              <div>
                <div className="font-bold text-slate-700 dark:text-slate-300 mb-1">Courses Taught:</div>
                <div className="flex flex-wrap gap-1">
                  {selectedStaff.coursesTaught.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-700 dark:text-slate-300 mb-0.5">Specialization:</div>
                <p className="text-slate-500 leading-relaxed">{selectedStaff.specialization}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedStaff(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVITY INSPECTION MODAL */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{selectedActivity.title}</h3>
                <div className="text-xs text-slate-400">
                  Logged by {selectedActivity.studentName} ({selectedActivity.studentId})
                </div>
              </div>
              <button onClick={() => setSelectedActivity(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div>Category: <strong className="text-slate-900 dark:text-white">{selectedActivity.category}</strong></div>
                <div>Status: <strong className="text-slate-900 dark:text-white">{selectedActivity.status}</strong></div>
                <div>Hours: <strong className="text-slate-900 dark:text-white">{selectedActivity.hoursSpent} hrs</strong></div>
                <div>Subject: <strong className="text-slate-900 dark:text-white">{selectedActivity.semesterSubject || 'Core'}</strong></div>
              </div>

              <div>
                <div className="font-bold text-slate-700 dark:text-slate-300 mb-1">Description:</div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {selectedActivity.description}
                </p>
              </div>

              {selectedActivity.learningOutcomes && (
                <div>
                  <div className="font-bold text-slate-700 dark:text-slate-300 mb-1">Key Outcomes & Reflections:</div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/40">
                    {selectedActivity.learningOutcomes}
                  </p>
                </div>
              )}

              {selectedActivity.staffFeedback && (
                <div>
                  <div className="font-bold text-purple-700 dark:text-purple-300 mb-1">Advisor Review Remarks:</div>
                  <p className="text-purple-900 dark:text-purple-200 bg-purple-50/70 dark:bg-purple-950/40 p-3 rounded-xl border border-purple-200 dark:border-purple-800">
                    {selectedActivity.staffFeedback}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedActivity(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleCreateStudent}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Add Student to Backend Database</h3>
              <button type="button" onClick={() => setIsAddStudentOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newStudentData.name}
                  onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })}
                  placeholder="e.g. Vikramaditya Sen"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Department</label>
                <select
                  value={newStudentData.department}
                  onChange={(e) => setNewStudentData({ ...newStudentData, department: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  <option value="Electronics & Comm (ECE)">Electronics & Comm (ECE)</option>
                  <option value="Computer Science (CSE)">Computer Science (CSE)</option>
                  <option value="Information Tech (IT)">Information Tech (IT)</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">GPA (0-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={newStudentData.gpa}
                    onChange={(e) => setNewStudentData({ ...newStudentData, gpa: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Attendance %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newStudentData.attendance}
                    onChange={(e) => setNewStudentData({ ...newStudentData, attendance: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Assigned Faculty Mentor</label>
                <input
                  type="text"
                  value={newStudentData.mentorName}
                  onChange={(e) => setNewStudentData({ ...newStudentData, mentorName: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddStudentOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
              >
                Save Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD STAFF MODAL */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleCreateStaff}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Add Staff to Backend Database</h3>
              <button type="button" onClick={() => setIsAddStaffOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name & Title</label>
                <input
                  type="text"
                  required
                  value={newStaffData.name}
                  onChange={(e) => setNewStaffData({ ...newStaffData, name: e.target.value })}
                  placeholder="e.g. Dr. Kavita Sharma"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Designation</label>
                <input
                  type="text"
                  required
                  value={newStaffData.designation}
                  onChange={(e) => setNewStaffData({ ...newStaffData, designation: e.target.value })}
                  placeholder="e.g. Associate Professor & Lab Head"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Department</label>
                <select
                  value={newStaffData.department}
                  onChange={(e) => setNewStaffData({ ...newStaffData, department: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  <option value="Computer Science (CSE)">Computer Science (CSE)</option>
                  <option value="Electronics & Comm (ECE)">Electronics & Comm (ECE)</option>
                  <option value="Information Tech (IT)">Information Tech (IT)</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Cabin Location</label>
                <input
                  type="text"
                  value={newStaffData.cabin}
                  onChange={(e) => setNewStaffData({ ...newStaffData, cabin: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddStaffOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
              >
                Register Staff
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
