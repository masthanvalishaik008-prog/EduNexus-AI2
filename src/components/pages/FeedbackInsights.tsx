import React, { useState, useEffect } from 'react';
import { Student, UserRole, UserType } from '../../types/student';
import {
  CollegeFeedbackRecord,
  StaffFeedbackRecord,
  Student360FeedbackRecord,
  StaffReflectionRecord,
  CollegeFeedbackCategory,
  FeedbackPriority,
} from '../../types/feedback';
import { useAuth } from '../../firebase/AuthContext';
import {
  Building2,
  GraduationCap,
  Sparkles,
  Send,
  Star,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  ThumbsUp,
  MessageSquareQuote,
  Lightbulb,
  Award,
  Compass,
  Laptop,
  Wifi,
  Wrench,
  BookOpen,
  Filter,
  Check,
  ChevronRight,
  RefreshCw,
  Users,
  Search,
  Eye,
  EyeOff,
  Smile,
  Zap,
  UserCheck,
  Calendar,
  FileText,
  ListTodo,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  HelpCircle,
  Lock,
} from 'lucide-react';

interface FeedbackInsightsProps {
  students: Student[];
  userRole: UserRole;
  onSelectStudent: (id: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

type ActiveFeedbackTab = 'college' | 'staff' | 'insights' | 'student360';

export function FeedbackInsights({
  students,
  userRole,
  onSelectStudent,
  onNavigateToTab,
}: FeedbackInsightsProps) {
  const { userType, role, guestUserName, activeStudentId } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveFeedbackTab>('college');

  // Identify student context
  const currentStudent =
    students.find((s) => s.id === activeStudentId) ||
    students[0] || {
      id: 'ENX-2024-101',
      name: 'Aarav Patel',
      department: 'Electronics & Comm (ECE)',
      semester: 6,
    };

  // Staff context: which faculty member is logged in?
  const loggedInStaffName = guestUserName || (userType === 'staff' ? userRole : 'Dr. Ramesh Sundaram');

  // Selected student for staff 360 evaluation
  const [selectedStudentForStaff, setSelectedStudentForStaff] = useState<string>(
    students[0]?.id || 'ENX-2024-101'
  );
  const targetStudentForEvaluation =
    students.find((s) => s.id === selectedStudentForStaff) || students[0];

  // Feedback State from Backend
  const [collegeFeedbacks, setCollegeFeedbacks] = useState<CollegeFeedbackRecord[]>([]);
  const [staffFeedbacks, setStaffFeedbacks] = useState<StaffFeedbackRecord[]>([]);
  const [student360Feedbacks, setStudent360Feedbacks] = useState<Student360FeedbackRecord[]>([]);
  const [staffReflections, setStaffReflections] = useState<StaffReflectionRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);

  // --- FORM STATE: STUDENT -> COLLEGE FEEDBACK ---
  const [collegeCategory, setCollegeCategory] = useState<CollegeFeedbackCategory>('Laboratories & Equipment');
  const [facilityName, setFacilityName] = useState<string>('');
  const [requestedFeature, setRequestedFeature] = useState<string>('');
  const [collegeDetailedFeedback, setCollegeDetailedFeedback] = useState<string>('');
  const [collegeCleanlinessRating, setCollegeCleanlinessRating] = useState<number>(4);
  const [collegeEquipmentRating, setCollegeEquipmentRating] = useState<number>(4);
  const [collegeMaintenanceRating, setCollegeMaintenanceRating] = useState<number>(4);
  const [collegePriority, setCollegePriority] = useState<FeedbackPriority>('Normal');
  const [collegeAnonymize, setCollegeAnonymize] = useState<boolean>(false);
  const [isSubmittingCollege, setIsSubmittingCollege] = useState<boolean>(false);
  const [collegeTabFilter, setCollegeTabFilter] = useState<'all' | 'mine'>('all');

  // --- FORM STATE: STUDENT -> STAFF FEEDBACK ---
  // Faculty teaching list (Teachers of student)
  const teacherListForStudent = [
    {
      id: 'STF-ECE-01',
      name: 'Dr. Ramesh Sundaram',
      dept: 'Electronics & Comm (ECE)',
      subject: 'Embedded Systems & Real-Time Operating Systems (RTOS)',
      timing: 'Mon & Wed 10:00 AM',
    },
    {
      id: 'STF-CSE-02',
      name: 'Prof. Ananya Iyer',
      dept: 'Computer Science (CSE)',
      subject: 'Design & Analysis of Algorithms',
      timing: 'Tue & Thu 11:30 AM',
    },
    {
      id: 'STF-PLC-03',
      name: 'Dr. Rajesh Khanna',
      dept: 'Career & Placement Cell',
      subject: 'Campus Recruitment & System Design Benchmarking',
      timing: 'Friday 2:00 PM',
    },
    {
      id: 'STF-IT-04',
      name: 'Dr. Shalini Mukherjee',
      dept: 'Information Tech (IT)',
      subject: 'Database Systems & Cloud DevOps',
      timing: 'Wed & Fri 9:00 AM',
    },
  ];

  const [studentChosenStaffId, setStudentChosenStaffId] = useState<string>('STF-ECE-01');
  const [studentChosenSubject, setStudentChosenSubject] = useState<string>(
    'Embedded Systems & Real-Time Operating Systems (RTOS)'
  );
  const [teachingPedagogyRating, setTeachingPedagogyRating] = useState<number>(5);
  const [conceptExplanationRating, setConceptExplanationRating] = useState<number>(5);
  const [problemSolvingRating, setProblemSolvingRating] = useState<number>(5);
  const [approachabilityRating, setApproachabilityRating] = useState<number>(5);
  const [evaluationFairnessRating, setEvaluationFairnessRating] = useState<number>(5);
  const [staffStrengths, setStaffStrengths] = useState<string>('');
  const [staffSuggestions, setStaffSuggestions] = useState<string>('');
  const [selectedStrengthsTags, setSelectedStrengthsTags] = useState<string[]>([
    'Clear Real-World Examples',
    'Patient Doubt Solving',
  ]);
  const [isSubmittingStaff, setIsSubmittingStaff] = useState<boolean>(false);

  // --- FORM STATE: STAFF REFLECTION (Staff Tab 2) ---
  const [reflectionNotes, setReflectionNotes] = useState<string>('');
  const [reflectionImprovements, setReflectionImprovements] = useState<string>('');
  const [isSubmittingReflection, setIsSubmittingReflection] = useState<boolean>(false);

  // --- FORM STATE: STAFF -> STUDENT 360 FEEDBACK (Staff Tab 4) ---
  const [evalAcademicRigor, setEvalAcademicRigor] = useState<number>(4);
  const [evalLabPractical, setEvalLabPractical] = useState<number>(4);
  const [evalRemainingActivities, setEvalRemainingActivities] = useState<number>(4);
  const [evalProblemSolving, setEvalProblemSolving] = useState<number>(4);
  const [evalConsistency, setEvalConsistency] = useState<number>(4);
  const [evalTeamwork, setEvalTeamwork] = useState<number>(4);
  const [summary360, setSummary360] = useState<string>('');
  const [remainingActivitiesNote, setRemainingActivitiesNote] = useState<string>('');
  const [recAction1, setRecAction1] = useState<string>('');
  const [recAction2, setRecAction2] = useState<string>('');
  const [recAction3, setRecAction3] = useState<string>('');
  const [endorsementBadge, setEndorsementBadge] = useState<
    'Exemplary Innovator' | 'Consistent Improver' | 'Core Competency Achiever' | 'Rising Star'
  >('Consistent Improver');
  const [isSubmitting360, setIsSubmitting360] = useState<boolean>(false);

  // Admin response state for College Feedback Board (Staff Tab 1)
  const [adminResponseDrafts, setAdminResponseDrafts] = useState<Record<string, string>>({});
  const [actioningTicketId, setActioningTicketId] = useState<string | null>(null);

  // Fetch all live feedback records from backend
  const fetchAllFeedback = async () => {
    setIsLoading(true);
    try {
      const [resCol, resStf, res360, resRefl] = await Promise.all([
        fetch('/api/feedback/college'),
        fetch('/api/feedback/staff'),
        fetch('/api/feedback/student-360'),
        fetch('/api/feedback/staff/reflections/STF-ECE-01'),
      ]);

      if (resCol.ok) {
        const d = await resCol.json();
        if (d.feedback) setCollegeFeedbacks(d.feedback);
      }
      if (resStf.ok) {
        const d = await resStf.json();
        if (d.feedback) setStaffFeedbacks(d.feedback);
      }
      if (res360.ok) {
        const d = await res360.json();
        if (d.feedback) setStudent360Feedbacks(d.feedback);
      }
      if (resRefl.ok) {
        const d = await resRefl.json();
        if (d.reflections) setStaffReflections(d.reflections);
      }
    } catch (err) {
      console.warn('Backend feedback fetch note:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllFeedback();
  }, []);

  // Update chosen subject when student selects a teacher
  useEffect(() => {
    const t = teacherListForStudent.find((x) => x.id === studentChosenStaffId);
    if (t) setStudentChosenSubject(t.subject);
  }, [studentChosenStaffId]);

  // Pre-fill staff 360 evaluation fields when selecting a student
  useEffect(() => {
    if (targetStudentForEvaluation) {
      const gpa = targetStudentForEvaluation.academic?.gpa || 7.5;
      const att = targetStudentForEvaluation.attendance?.overallPercentage || 85;
      const backlogs = targetStudentForEvaluation.academic?.backlogsCount || 0;

      setSummary360(
        `${targetStudentForEvaluation.name} has demonstrated consistent dedication with a ${gpa.toFixed(
          1
        )}/10 GPA and ${att}% attendance. ${
          backlogs > 0
            ? `Special remediation priority: Focus on clearing ${backlogs} pending subject(s).`
            : 'Academic track is clear with 0 backlogs.'
        }`
      );

      setRemainingActivitiesNote(
        `Priority Remaining Activities: 1) Complete the scheduled quantitative placement speed sprint. 2) Finalize laboratory milestone report for ${targetStudentForEvaluation.department.split(
          ' '
        )[0]}. 3) Maintain weekly Knowledge Challenge participation.`
      );

      setRecAction1(`Attend weekly practice session for ${targetStudentForEvaluation.placement.preferredDomain}`);
      setRecAction2(`Maintain laboratory and lecture attendance above 75% regulatory requirement`);
      setRecAction3(`Submit Milestone 2 capstone documentation on GitHub`);
    }
  }, [selectedStudentForStaff]);

  // Handle student upvoting a requested campus feature
  const handleUpvoteCollegeFeature = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/feedback/college/${id}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: currentStudent.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setCollegeFeedbacks((prev) =>
          prev.map((f) => (f.id === id ? { ...f, upvotes: data.upvotes, upvotedBy: data.feedback?.upvotedBy } : f))
        );
      }
    } catch (err) {
      console.error('Error upvoting feature:', err);
    }
  };

  // Handle student submitting feedback to college
  const handleSubmitCollegeFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityName.trim() || !collegeDetailedFeedback.trim()) return;

    setIsSubmittingCollege(true);
    const overall = Number(
      ((collegeCleanlinessRating + collegeEquipmentRating + collegeMaintenanceRating) / 3).toFixed(1)
    );

    const payload = {
      studentId: currentStudent.id,
      studentName: collegeAnonymize ? 'Scholar (Protected View)' : currentStudent.name,
      department: currentStudent.department,
      yearSemester: `Year ${Math.ceil((currentStudent.semester || 6) / 2)} / Sem ${currentStudent.semester || 6}`,
      category: collegeCategory,
      facilityName: facilityName.trim(),
      ratings: {
        cleanlinessAndEnvironment: collegeCleanlinessRating,
        equipmentAndResources: collegeEquipmentRating,
        maintenanceAndAcoustics: collegeMaintenanceRating,
        overallRating: overall,
      },
      requestedFeature: requestedFeature.trim(),
      detailedFeedback: collegeDetailedFeedback.trim(),
      isAnonymized: collegeAnonymize,
      priority: collegePriority,
    };

    try {
      const res = await fetch('/api/feedback/college', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const resData = await res.json();
        setCollegeFeedbacks((prev) => [resData.feedback, ...prev]);
        setSubmitSuccessMsg(
          'Your feedback and requested features have been officially routed to the College Administration Council!'
        );
        setFacilityName('');
        setRequestedFeature('');
        setCollegeDetailedFeedback('');
        setTimeout(() => setSubmitSuccessMsg(null), 6000);
      }
    } catch (err) {
      console.error('Error submitting college feedback:', err);
    } finally {
      setIsSubmittingCollege(false);
    }
  };

  // Handle student submitting feedback on staff
  const handleSubmitStaffFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffStrengths.trim()) return;

    setIsSubmittingStaff(true);
    const teacher = teacherListForStudent.find((t) => t.id === studentChosenStaffId);
    const overall = Number(
      (
        (teachingPedagogyRating +
          conceptExplanationRating +
          problemSolvingRating +
          approachabilityRating +
          evaluationFairnessRating) /
        5
      ).toFixed(1)
    );

    const payload = {
      staffId: studentChosenStaffId,
      staffName: teacher?.name || 'Faculty Member',
      department: teacher?.dept || currentStudent.department,
      subjectName: studentChosenSubject.trim() || 'Core Engineering Course',
      studentId: currentStudent.id,
      studentName: 'Scholar (Anonymous Protected)',
      studentDepartment: currentStudent.department,
      ratings: {
        teachingPedagogy: teachingPedagogyRating,
        conceptExplanation: conceptExplanationRating,
        problemSolvingSupport: problemSolvingRating,
        approachability: approachabilityRating,
        evaluationFairness: evaluationFairnessRating,
        overallRating: overall,
      },
      strengthsObserved: staffStrengths.trim(),
      constructiveSuggestions: staffSuggestions.trim(),
      usefulTakeawayTags: selectedStrengthsTags,
      isAnonymized: true,
    };

    try {
      const res = await fetch('/api/feedback/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const resData = await res.json();
        setStaffFeedbacks((prev) => [resData.feedback, ...prev]);
        setSubmitSuccessMsg(
          `Your feedback on ${teacher?.name} has been securely recorded! Identity is completely anonymized.`
        );
        setStaffStrengths('');
        setStaffSuggestions('');
        setTimeout(() => setSubmitSuccessMsg(null), 6000);
      }
    } catch (err) {
      console.error('Error submitting staff feedback:', err);
    } finally {
      setIsSubmittingStaff(false);
    }
  };

  // Handle Staff Submitting 360 Feedback for Student
  const handleSubmit360Feedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary360.trim()) return;

    setIsSubmitting360(true);
    const overall = Number(
      (
        (evalAcademicRigor +
          evalLabPractical +
          evalRemainingActivities +
          evalProblemSolving +
          evalConsistency +
          evalTeamwork) /
        6
      ).toFixed(1)
    );

    const recs = [
      recAction1.trim() && {
        id: `act-${Date.now()}-1`,
        action: recAction1.trim(),
        timeframe: 'Next 7 days',
        category: 'Placement' as const,
        completed: false,
      },
      recAction2.trim() && {
        id: `act-${Date.now()}-2`,
        action: recAction2.trim(),
        timeframe: 'Next 2 weeks',
        category: 'Academic' as const,
        completed: false,
      },
      recAction3.trim() && {
        id: `act-${Date.now()}-3`,
        action: recAction3.trim(),
        timeframe: 'End of Month',
        category: 'Remaining Activities' as const,
        completed: false,
      },
    ].filter(Boolean) as any[];

    const payload = {
      studentId: targetStudentForEvaluation.id,
      studentName: targetStudentForEvaluation.name,
      studentDepartment: targetStudentForEvaluation.department,
      staffId: 'STF-ECE-01',
      staffName: loggedInStaffName,
      staffRole: userRole,
      evaluationDimensions: {
        academicRigor: evalAcademicRigor,
        laboratoryPractical: evalLabPractical,
        remainingActivitiesProgress: evalRemainingActivities,
        problemSolvingAptitude: evalProblemSolving,
        consistencyAndAttendance: evalConsistency,
        teamworkAndCommunication: evalTeamwork,
      },
      overallScore360: overall,
      performanceSummary: summary360.trim(),
      remainingActivitiesFeedback: remainingActivitiesNote.trim(),
      actionRecommendations: recs,
      endorsementBadge,
    };

    try {
      const res = await fetch('/api/feedback/student-360', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const resData = await res.json();
        setStudent360Feedbacks((prev) => [resData.feedback, ...prev]);
        setSubmitSuccessMsg(
          `360° Guidance & Remaining Activities roadmap for ${targetStudentForEvaluation.name} successfully published to their student portal!`
        );
        setTimeout(() => setSubmitSuccessMsg(null), 6000);
      }
    } catch (err) {
      console.error('Error submitting 360 feedback:', err);
    } finally {
      setIsSubmitting360(false);
    }
  };

  // Handle Student Toggling an Assigned Action Item
  const handleToggleActionStep = async (feedbackId: string, actionId: string) => {
    try {
      const res = await fetch(`/api/feedback/student-360/${feedbackId}/toggle-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId }),
      });
      if (res.ok) {
        const data = await res.json();
        setStudent360Feedbacks((prev) =>
          prev.map((fb) => (fb.id === feedbackId ? data.feedback : fb))
        );
        setSubmitSuccessMsg(data.message);
        setTimeout(() => setSubmitSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error('Error toggling action step:', err);
    }
  };

  // Handle Admin Action on College Feedback
  const handleAdminUpdateCollegeTicket = async (fbId: string, newStatus: string) => {
    setActioningTicketId(fbId);
    const customNote =
      adminResponseDrafts[fbId] ||
      (newStatus === 'Action Plan Approved'
        ? 'Requisition approved by Academic Council. Procurement work order initiated.'
        : 'Facility maintenance team inspected and verified the upgrade.');

    try {
      const res = await fetch(`/api/feedback/college/${fbId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          adminResponse: customNote,
          adminReviewedBy: `${userRole} (${loggedInStaffName})`,
        }),
      });

      if (res.ok) {
        const resData = await res.json();
        setCollegeFeedbacks((prev) =>
          prev.map((f) => (f.id === fbId ? resData.feedback : f))
        );
        setSubmitSuccessMsg(`Ticket ${fbId} updated to: ${newStatus}`);
        setTimeout(() => setSubmitSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error('Error updating ticket status:', err);
    } finally {
      setActioningTicketId(null);
    }
  };

  // Handle Staff Submitting Course Reflection
  const handleSubmitStaffReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionNotes.trim()) return;

    setIsSubmittingReflection(true);
    const improvements = reflectionImprovements
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/feedback/staff/reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: 'STF-ECE-01',
          staffName: loggedInStaffName,
          department: 'Electronics & Comm (ECE)',
          subjectName: 'Embedded Systems & RTOS',
          semester: 'Spring 2026',
          reflectionNotes: reflectionNotes.trim(),
          pedagogicalImprovements: improvements,
        }),
      });

      if (res.ok) {
        const resData = await res.json();
        setStaffReflections((prev) => [resData.reflection, ...prev]);
        setSubmitSuccessMsg('Course pedagogical reflection saved to your faculty portfolio!');
        setReflectionNotes('');
        setReflectionImprovements('');
        setTimeout(() => setSubmitSuccessMsg(null), 5000);
      }
    } catch (err) {
      console.error('Error saving reflection:', err);
    } finally {
      setIsSubmittingReflection(false);
    }
  };

  // Filter college feedbacks for student vs staff view
  const displayedCollegeFeedbacks = collegeFeedbacks.filter((f) => {
    if (userType === 'student' && collegeTabFilter === 'mine') {
      return f.studentId === currentStudent.id;
    }
    return true;
  });

  // 360 Feedbacks for current student
  const studentPersonal360Feedbacks = student360Feedbacks.filter(
    (fb) => fb.studentId === currentStudent.id
  );

  // Helper star rating renderer
  const renderStarSelector = (value: number, onChange: (val: number) => void) => (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`p-1 rounded-lg transition-transform hover:scale-110 cursor-pointer ${
            star <= value ? 'text-amber-500 fill-amber-400' : 'text-slate-300 hover:text-amber-300'
          }`}
        >
          <Star className={`w-4 h-4 ${star <= value ? 'fill-current' : ''}`} />
        </button>
      ))}
      <span className="ml-2 text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
        {value}.0 / 5.0
      </span>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner Header with Real-World Role Segregation */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 lg:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/20 to-transparent pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold mb-2">
              <MessageSquareQuote className="w-3.5 h-3.5 text-blue-300" />
              <span>
                {userType === 'student'
                  ? 'Student Voice & Mentorship Portal'
                  : 'Faculty & Department Advisory Console'}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
              {userType === 'student'
                ? 'Student Feedback & 360° Guidance Hub'
                : 'Faculty Feedback & 360° Student Guidance'}
            </h1>
            <p className="text-xs text-blue-200/80 mt-1 max-w-2xl leading-relaxed">
              {userType === 'student'
                ? 'Review college facilities, evaluate your course professors with strict privacy, and track your personalized 360° mentor report & remaining activities.'
                : 'Review student facility requests, inspect anonymous student feedback on your courses, and deliver personalized 360° guidance & remaining activities to your scholars.'}
            </p>
          </div>

          {/* Active Persona Badge */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
              {userType === 'student' ? 'ST' : 'FA'}
            </div>
            <div className="text-left text-xs">
              <div className="text-blue-200 font-medium text-[11px]">Logged in as</div>
              <div className="font-extrabold text-white">
                {userType === 'student'
                  ? `${currentStudent.name} (${currentStudent.id})`
                  : `${loggedInStaffName} · ${userRole}`}
              </div>
            </div>
          </div>
        </div>

        {/* Global Feedback Tab Navigation (Customized per Role) */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-white/10">
          {/* Tab 1 */}
          <button
            onClick={() => setActiveTab('college')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'college'
                ? 'bg-white text-blue-950 shadow-md font-extrabold'
                : 'bg-white/10 text-white/90 hover:bg-white/15'
            }`}
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>
              {userType === 'student'
                ? '1. College Facilities & Feature Requests'
                : '1. Campus Requisitions & Action Board'}
            </span>
            <span className="text-[10px] bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded-full font-mono">
              {collegeFeedbacks.length}
            </span>
          </button>

          {/* Tab 2 */}
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-white text-blue-950 shadow-md font-extrabold'
                : 'bg-white/10 text-white/90 hover:bg-white/15'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>
              {userType === 'student'
                ? '2. Evaluate My Course Professors'
                : '2. Student Feedback on My Teaching'}
            </span>
            <span className="text-[10px] bg-indigo-100 text-indigo-900 px-1.5 py-0.5 rounded-full font-mono">
              {userType === 'student' ? teacherListForStudent.length : staffFeedbacks.length}
            </span>
          </button>

          {/* Tab 3 */}
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'insights'
                ? 'bg-white text-blue-950 shadow-md font-extrabold'
                : 'bg-white/10 text-white/90 hover:bg-white/15'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>
              {userType === 'student'
                ? '3. Useful Student Ideas & Wishlist'
                : '3. Institutional Value & Pulse Insights'}
            </span>
          </button>

          {/* Tab 4 */}
          <button
            onClick={() => setActiveTab('student360')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'student360'
                ? 'bg-white text-blue-950 shadow-md font-extrabold'
                : 'bg-white/10 text-white/90 hover:bg-white/15'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {userType === 'student'
                ? '4. My 360° Mentor Report & Remaining Activities'
                : '4. Deliver 360° Guidance & Remaining Activities'}
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded-full font-mono">
              {userType === 'student' ? studentPersonal360Feedbacks.length : students.length}
            </span>
          </button>

          <button
            onClick={fetchAllFeedback}
            title="Refresh backend database records"
            className="ml-auto p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer text-xs flex items-center gap-1.5 font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Global Toast Success Message */}
      {submitSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs font-bold">{submitSuccessMsg}</div>
          </div>
          <button
            onClick={() => setSubmitSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: COLLEGE FACILITIES & REQUESTED FEATURES (Enhanced Information)     */}
      {/* ========================================================================= */}
      {activeTab === 'college' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Feedback Submission Form (Prominent for Student, Admin Quick Requisition for Staff) */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        {userType === 'student'
                          ? 'Request College Facilities / Features'
                          : 'Submit Campus Infrastructure Notice'}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Classrooms, laboratories & requested student amenities
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    Direct to Admin
                  </span>
                </div>

                <form onSubmit={handleSubmitCollegeFeedback} className="space-y-4">
                  {/* Category Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Campus Area Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={collegeCategory}
                      onChange={(e) => setCollegeCategory(e.target.value as CollegeFeedbackCategory)}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    >
                      <option value="Classroom & Infrastructure">🏫 Classroom & Lecture Hall (Seating, Acoustics, Power Sockets)</option>
                      <option value="Laboratories & Equipment">🔬 Laboratories & Hardware Bench Equipment</option>
                      <option value="Requested Campus Features & Facilities">💡 Requested Campus Features & Amenities (24/7 Labs, GPU servers)</option>
                      <option value="Digital Portals & Wi-Fi">📶 Campus High-Speed Wi-Fi & LMS Portals</option>
                      <option value="Library & Learning Spaces">📚 Library, Reading Cubicles & Digital Journals</option>
                      <option value="Campus Canteen & Transport">🚌 Campus Transport & Cafeteria</option>
                    </select>
                  </div>

                  {/* Facility / Room Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Facility / Room / Lab Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., ECE Smart Lecture Theater 204 or IoT Embedded Hardware Lab"
                      value={facilityName}
                      onChange={(e) => setFacilityName(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  {/* 3 Dimension Ratings */}
                  <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                    <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                      Rate Facility Quality:
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600">Cleanliness & Environment:</span>
                      {renderStarSelector(collegeCleanlinessRating, setCollegeCleanlinessRating)}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600">Equipment & Working Condition:</span>
                      {renderStarSelector(collegeEquipmentRating, setCollegeEquipmentRating)}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600">Acoustics & Power Outlets:</span>
                      {renderStarSelector(collegeMaintenanceRating, setCollegeMaintenanceRating)}
                    </div>
                  </div>

                  {/* Feature Student Required from College */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Feature / Resource You Require From College: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Extended lab hours till 8:30 PM, dedicated SLURM GPU queue for AI capstone..."
                      value={requestedFeature}
                      onChange={(e) => setRequestedFeature(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Detailed Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Detailed Justification & Student Need <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Explain how this feature will help your coursework, capstone engineering projects, or campus placements..."
                      value={collegeDetailedFeedback}
                      onChange={(e) => setCollegeDetailedFeedback(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Priority & Anonymity */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-700">Urgency:</label>
                      <select
                        value={collegePriority}
                        onChange={(e) => setCollegePriority(e.target.value as FeedbackPriority)}
                        className="text-xs font-semibold bg-slate-100 border border-slate-300 rounded-lg px-2 py-1 text-slate-800 cursor-pointer"
                      >
                        <option value="Normal">Normal</option>
                        <option value="High">High Urgency</option>
                        <option value="Critical Suggestion">Critical Need</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={collegeAnonymize}
                        onChange={(e) => setCollegeAnonymize(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Anonymize Name</span>
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingCollege}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {isSubmittingCollege ? 'Routing to College...' : 'Submit Requisition to College Council'}
                    </span>
                  </button>
                </form>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Every submission generates a tracked ticket inspected by the College Infrastructure Committee.</span>
              </div>
            </div>

            {/* Right: College Facilities & Action Board */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      College Facilities & Requisitions Board
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Real-time status of student requests sent to the college administration
                    </p>
                  </div>

                  {/* Filter Pills */}
                  {userType === 'student' && (
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                      <button
                        onClick={() => setCollegeTabFilter('all')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          collegeTabFilter === 'all'
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        All Campus Requests ({collegeFeedbacks.length})
                      </button>
                      <button
                        onClick={() => setCollegeTabFilter('mine')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          collegeTabFilter === 'mine'
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        My Submissions ({collegeFeedbacks.filter((f) => f.studentId === currentStudent.id).length})
                      </button>
                    </div>
                  )}
                </div>

                {/* List of Feedback Cards */}
                <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
                  {displayedCollegeFeedbacks.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      No facility requisitions found under this filter.
                    </div>
                  ) : (
                    displayedCollegeFeedbacks.map((fb) => (
                      <div
                        key={fb.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all shadow-2xs space-y-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                              {fb.id}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{fb.facilityName}</span>
                            <span className="text-slate-400">·</span>
                            <span className="text-[11px] text-blue-700 font-medium">{fb.category}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                fb.status === 'Resolved & Implemented'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : fb.status === 'Action Plan Approved'
                                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                                  : fb.status === 'Under Review by Administration'
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : 'bg-slate-200 text-slate-800 border-slate-300'
                              }`}
                            >
                              {fb.status}
                            </span>

                            {/* Upvote Button for Students */}
                            <button
                              onClick={(e) => handleUpvoteCollegeFeature(fb.id, e)}
                              title="Upvote this feature request"
                              className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                                fb.upvotedBy?.includes(currentStudent.id)
                                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                                  : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-300'
                              }`}
                            >
                              <ThumbsUp className="w-3 h-3 text-amber-600" />
                              <span>{fb.upvotes || 0} Upvotes</span>
                            </button>
                          </div>
                        </div>

                        {/* Requested Feature Highlight */}
                        {fb.requestedFeature && (
                          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-extrabold text-amber-900">Requested Feature from College:</span>{' '}
                              <span>{fb.requestedFeature}</span>
                            </div>
                          </div>
                        )}

                        <p className="text-xs text-slate-700 leading-relaxed">{fb.detailedFeedback}</p>

                        {/* Administrative Response if any */}
                        {fb.adminResponse && (
                          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-bold text-blue-900">
                              <span className="flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-blue-700" />
                                <span>College Administration Action Response:</span>
                              </span>
                              <span className="font-mono text-blue-600">{fb.adminReviewedBy}</span>
                            </div>
                            <p className="text-xs text-blue-900 leading-snug">{fb.adminResponse}</p>
                          </div>
                        )}

                        {/* Footer & Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                          <div>
                            <span>Logged by: <strong>{fb.studentName}</strong> ({fb.department}) · {new Date(fb.createdAt).toLocaleDateString()}</span>
                          </div>

                          {/* Quick Admin Actions (Staff role only) */}
                          {userType === 'staff' && (
                            <div className="flex items-center gap-1.5">
                              {fb.status !== 'Action Plan Approved' && fb.status !== 'Resolved & Implemented' && (
                                <button
                                  onClick={() => handleAdminUpdateCollegeTicket(fb.id, 'Action Plan Approved')}
                                  disabled={actioningTicketId === fb.id}
                                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] transition-all cursor-pointer"
                                >
                                  Approve Action Plan
                                </button>
                              )}
                              {fb.status !== 'Resolved & Implemented' && (
                                <button
                                  onClick={() => handleAdminUpdateCollegeTicket(fb.id, 'Resolved & Implemented')}
                                  disabled={actioningTicketId === fb.id}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-all cursor-pointer"
                                >
                                  Mark Resolved
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STAFF & TEACHING FEEDBACK (REAL WORLD SEPARATION)                   */}
      {/* Student evaluates their professors; Staff reviews their teaching ratings   */}
      {/* ========================================================================= */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          {userType === 'student' ? (
            /* --- STUDENT VIEW: Evaluate Enrolled Course Professors --- */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Evaluate Enrolled Course Professor Form */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">
                          Evaluate Course Professor
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Strictly confidential teaching & explanation review
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>100% Anonymous</span>
                    </span>
                  </div>

                  <form onSubmit={handleSubmitStaffFeedback} className="space-y-4">
                    {/* Select from enrolled teachers */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Select Enrolled Faculty Member <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={studentChosenStaffId}
                        onChange={(e) => setStudentChosenStaffId(e.target.value)}
                        className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                      >
                        {teacherListForStudent.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.dept}) · {t.subject}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Competency Star Sliders */}
                    <div className="bg-indigo-50/40 p-3.5 rounded-2xl border border-indigo-100 space-y-2.5">
                      <div className="text-[11px] font-bold text-indigo-950 uppercase tracking-wider">
                        Rate Teaching Competencies:
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-slate-800">1. Teaching & Pacing:</div>
                          <div className="text-[10px] text-slate-500">Appropriate speed and structured coverage</div>
                        </div>
                        {renderStarSelector(teachingPedagogyRating, setTeachingPedagogyRating)}
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-slate-800">2. Concept Explanation:</div>
                          <div className="text-[10px] text-slate-500">Clarity, intuition & real-world examples</div>
                        </div>
                        {renderStarSelector(conceptExplanationRating, setConceptExplanationRating)}
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-slate-800">3. Problem Solving Drills:</div>
                          <div className="text-[10px] text-slate-500">Numerical examples & doubt clearing</div>
                        </div>
                        {renderStarSelector(problemSolvingRating, setProblemSolvingRating)}
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-slate-800">4. Approachability & Mentoring:</div>
                          <div className="text-[10px] text-slate-500">Accessible for doubts & office hours</div>
                        </div>
                        {renderStarSelector(approachabilityRating, setApproachabilityRating)}
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-slate-800">5. Evaluation Fairness:</div>
                          <div className="text-[10px] text-slate-500">Transparent grading & constructive remarks</div>
                        </div>
                        {renderStarSelector(evaluationFairnessRating, setEvaluationFairnessRating)}
                      </div>
                    </div>

                    {/* Positive highlights */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Teaching Strengths & Positive Highlights <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="e.g., Explains RTOS priority inversions step-by-step; very approachable in laboratory sessions..."
                        value={staffStrengths}
                        onChange={(e) => setStaffStrengths(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    {/* Constructive Suggestions */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Suggestions for the Professor (Optional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g., Would appreciate 2-3 extra numerical examples before internal midterm exams..."
                        value={staffSuggestions}
                        onChange={(e) => setStaffSuggestions(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Confidentiality Guaranteed: Your name and student ID are never revealed to the faculty member.</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingStaff}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingStaff ? 'Submitting...' : 'Submit Faculty Review'}</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Right: Your Enrolled Professors & Course Ratings Overview */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Your Semester Instructors & Courses
                  </h3>
                  <p className="text-xs text-slate-500">
                    Faculty members assigned to your course modules this term:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {teacherListForStudent.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setStudentChosenStaffId(t.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          studentChosenStaffId === t.id
                            ? 'bg-indigo-50/70 border-indigo-400 shadow-xs'
                            : 'bg-slate-50/70 border-slate-200 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                            {t.name.split(' ')[1]?.[0] || 'P'}
                          </div>
                          <div>
                            <div className="text-xs font-extrabold text-slate-900">{t.name}</div>
                            <div className="text-[10px] text-slate-500">{t.dept}</div>
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-indigo-900 mb-1">{t.subject}</div>
                        <div className="text-[10px] text-slate-400 flex items-center justify-between">
                          <span>{t.timing}</span>
                          <span className="text-indigo-600 font-bold">Tap to review →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Helpful Evaluation Guidelines for Students */}
                <div className="bg-gradient-to-br from-indigo-50/60 to-white border border-indigo-200 rounded-3xl p-6 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-sm">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>How Your Feedback Improves Academic Quality</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Student feedback is reviewed at mid-semester and end-semester department faculty meetings. It directly leads to:
                  </p>
                  <ul className="text-xs text-slate-700 space-y-1.5 pl-4 list-disc">
                    <li>Scheduling additional problem-solving clinics before tough internal exams.</li>
                    <li>Adjusting theoretical lecture pacing and adding practical hardware lab demos.</li>
                    <li>Providing standardized, transparent marking rubrics for laboratory project reports.</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* --- STAFF VIEW: Student Feedback on My Teaching & Self-Reflection --- */
            <div className="space-y-6">
              {/* Staff Teaching Summary Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                      {loggedInStaffName.split(' ')[1]?.[0] || 'D'}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{loggedInStaffName}</h3>
                      <p className="text-xs text-slate-500">
                        Faculty Performance & Student Teaching Evaluations · Spring 2026 Term
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black font-mono text-indigo-700 flex items-center justify-end gap-1">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                      <span>4.8</span>
                      <span className="text-xs font-normal text-slate-400">/ 5.0</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Student Satisfaction Score across 42 scholars
                    </div>
                  </div>
                </div>

                {/* 5 Teaching Competencies Received from Students */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-center">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Teaching Pedagogy</div>
                    <div className="text-lg font-black text-indigo-700 font-mono mt-0.5">4.8 / 5.0</div>
                  </div>
                  <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-center">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Concept Clarity</div>
                    <div className="text-lg font-black text-emerald-700 font-mono mt-0.5">4.9 / 5.0</div>
                  </div>
                  <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 text-center">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Problem Solving</div>
                    <div className="text-lg font-black text-blue-700 font-mono mt-0.5">4.7 / 5.0</div>
                  </div>
                  <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100 text-center">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Approachability</div>
                    <div className="text-lg font-black text-purple-700 font-mono mt-0.5">5.0 / 5.0</div>
                  </div>
                  <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-100 text-center">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Evaluation Fairness</div>
                    <div className="text-lg font-black text-amber-700 font-mono mt-0.5">4.8 / 5.0</div>
                  </div>
                </div>
              </div>

              {/* Student Comments Received & Faculty Self-Reflection */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Feed of Anonymous Student Feedback on Teaching */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Student Reviews on Your Courses</h4>
                      <p className="text-[11px] text-slate-500">Candid, anonymous remarks submitted by enrolled students</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {staffFeedbacks.length} Total Reviews
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {staffFeedbacks.map((fb) => (
                      <div
                        key={fb.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 text-xs space-y-2 hover:bg-white transition-all shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{fb.subjectName}</span>
                          <div className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[11px]">
                            <Star className="w-3 h-3 fill-current" />
                            <span>{fb.ratings.overallRating.toFixed(1)} / 5.0</span>
                          </div>
                        </div>

                        <p className="text-slate-700 leading-relaxed">
                          <strong className="text-slate-900 font-bold">Observed Strength:</strong> {fb.strengthsObserved}
                        </p>

                        {fb.constructiveSuggestions && (
                          <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-950">
                            <strong className="text-indigo-900 font-bold">Student Suggestion:</strong> {fb.constructiveSuggestions}
                          </div>
                        )}

                        <div className="text-[10px] text-slate-400 pt-1">
                          Anonymous Student Submission ({fb.studentDepartment}) · {new Date(fb.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Faculty Course Reflection & Improvement Plan */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">Faculty Course Reflection</h4>
                          <p className="text-[11px] text-slate-500">Record pedagogical adjustments based on student pulse</p>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleSubmitStaffReflection} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Pedagogical Reflection Note:
                        </label>
                        <textarea
                          required
                          rows={3}
                          placeholder="e.g. Based on student requests for more numerical examples in RTOS, I am scheduling 2 extra Saturday problem-solving clinics..."
                          value={reflectionNotes}
                          onChange={(e) => setReflectionNotes(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Key Course Improvements (one per line):
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Added 5 step-by-step logic analyzer timing traces&#10;Scheduled weekly peer TA problem-solving clinics&#10;Introduced interactive quiz checks at end of module"
                          value={reflectionImprovements}
                          onChange={(e) => setReflectionImprovements(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingReflection}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold py-2 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isSubmittingReflection ? 'Saving...' : 'Save Course Reflection Note'}</span>
                      </button>
                    </form>
                  </div>

                  {/* Previous Reflection Feed */}
                  {staffReflections.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1.5">
                      <div className="font-bold text-slate-700 text-[11px]">Latest Recorded Reflection:</div>
                      <p className="text-slate-600 italic text-[11px]">{staffReflections[0].reflectionNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: USEFUL STUDENT IDEAS & INSTITUTIONAL INSIGHTS                       */}
      {/* ========================================================================= */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Institutional Top Pulse Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
                <span>Infrastructure Requests</span>
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">{collegeFeedbacks.length}</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                {collegeFeedbacks.filter((f) => f.status.includes('Approved') || f.status.includes('Resolved')).length} approved by administration
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
                <span>Faculty Teaching Rating</span>
                <GraduationCap className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">4.8 / 5.0</div>
              <div className="text-[11px] text-indigo-600 font-semibold mt-1">
                Across {teacherListForStudent.length} core subject modules
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
                <span>Lab Equipment Satisfaction</span>
                <Wrench className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">86%</div>
              <div className="text-[11px] text-amber-600 font-semibold mt-1">
                Evening hours extended till 8:30 PM
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
                <span>360° Guidance Roadmaps</span>
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">{student360Feedbacks.length}</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                Active remaining activities checklists
              </div>
            </div>
          </div>

          {/* Useful Feedback Insights for College & Faculty */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Student Feature Wishlist */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Top Features Required from the College
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ranked by collective student demand and academic importance
                  </p>
                </div>
                <Lightbulb className="w-5 h-5 text-amber-500" />
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/60 to-white border border-blue-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-blue-950">
                      1. Extended Laboratory Operating Hours (Until 8:30 PM)
                    </span>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      Approved & Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Scholars in IoT and Robotics require evening bench access before project reviews. 10 logic analyzers procured.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50/60 to-white border border-purple-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-purple-950">
                      2. Dedicated GPU Cluster Server for AI/ML Capstones
                    </span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      Under Review
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Students requested dedicated SLURM GPU queues to train vision models without relying on free Google Colab limits.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/60 to-white border border-emerald-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-emerald-950">
                      3. Digital Library Single Sign-On (IEEE / ACM Access)
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Implemented
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Configured single sign-on research proxy credentials accessible from off-campus dormitories.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/60 to-white border border-amber-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-amber-950">
                      4. High-Density Wi-Fi 6 Access Points in Study Pavilions
                    </span>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      In Progress
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Network Operations Center deploying 4 additional enterprise access points to support peak 3-6 PM study traffic.
                  </p>
                </div>
              </div>
            </div>

            {/* Useful Pedagogical Insights for Faculty */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Faculty Pedagogy & Teaching Pulse
                  </h3>
                  <p className="text-xs text-slate-500">
                    Actionable teaching adjustments highlighted by students across departments
                  </p>
                </div>
                <GraduationCap className="w-5 h-5 text-indigo-600" />
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">More Solved Numerical Examples Before Midterms</span>
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">High Demand</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Students highly value derivation clarity, but request 2-3 extra numerical problem walkthroughs for DSP and Heat Transfer exams.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Recorded Micro-Lectures for Complex Proofs</span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Faculty Commended</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    10-minute recap videos for RTOS scheduling and distributed consensus proofs significantly reduced student exam anxiety.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Transparent Rubrics for Internal Lab Submissions</span>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Standardized</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Standardized rubrics for code comments, breadboard wiring neatness, and timing waveforms improved student satisfaction to 92%.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: 360° GUIDANCE & REMAINING ACTIVITIES (CLEAN, EASY TO UNDERSTAND)   */}
      {/* Student sees their clean report & checklist; Staff evaluates students!   */}
      {/* ========================================================================= */}
      {activeTab === 'student360' && (
        <div className="space-y-6">
          {userType === 'student' ? (
            /* --- STUDENT VIEW: Clean, Simple, Encouraging 360 Report & Remaining Activities Checklist --- */
            <div className="space-y-6">
              {/* Header Hero Card */}
              <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 lg:p-8 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-200 bg-white/10 px-3 py-1 rounded-full w-fit mb-2">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>Official Faculty 360° Mentorship Evaluation</span>
                    </div>
                    <h2 className="text-xl lg:text-2xl font-black text-white">
                      Your 360° Performance Report & Action Roadmap 🚀
                    </h2>
                    <p className="text-xs text-blue-200/80 mt-1 max-w-2xl leading-relaxed">
                      Written in clear, encouraging language by your faculty mentor so you know exactly where you stand and what remaining activities to finish next.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigateToTab?.('navigator')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Open Growth Navigator</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Display Personal 360 Reviews */}
              {studentPersonal360Feedbacks.length === 0 ? (
                <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl text-slate-500 space-y-3">
                  <Award className="w-10 h-10 text-slate-300 mx-auto" />
                  <div className="text-base font-bold text-slate-800">Your First 360° Evaluation is being compiled</div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Your assigned faculty mentor is reviewing your mid-term academic scores and laboratory activities. Once submitted, your personalized 360 report will appear right here!
                  </p>
                </div>
              ) : (
                studentPersonal360Feedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-xs space-y-6 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500" />

                    {/* Mentor Summary Banner */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                          {fb.staffName.split(' ')[1]?.[0] || 'M'}
                        </div>
                        <div>
                          <div className="text-base font-black text-slate-900">{fb.staffName}</div>
                          <div className="text-xs text-slate-500">
                            {fb.staffRole} · Evaluated on {new Date(fb.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {fb.endorsementBadge && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 px-3 py-1 rounded-full shadow-2xs">
                            <Award className="w-4 h-4 text-amber-600" />
                            <span>{fb.endorsementBadge}</span>
                          </span>
                        )}
                        <span className="text-base font-black font-mono text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                          {fb.overallScore360.toFixed(1)} / 5.0 ⭐
                        </span>
                      </div>
                    </div>

                    {/* 6 Clean Visual Dimension Cards */}
                    <div>
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                        Your 6 Core Performance Dimensions:
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-500">📚 Academic Rigor</div>
                          <div className="text-base font-black text-slate-900 font-mono">
                            {fb.evaluationDimensions.academicRigor} / 5.0
                          </div>
                          <div className="text-[9px] text-emerald-600 font-bold">Good Momentum</div>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-500">🔬 Lab Benchwork</div>
                          <div className="text-base font-black text-slate-900 font-mono">
                            {fb.evaluationDimensions.laboratoryPractical} / 5.0
                          </div>
                          <div className="text-[9px] text-emerald-600 font-bold">Top Practical Skill</div>
                        </div>

                        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-0.5">
                          <div className="text-[10px] font-bold text-emerald-800">📋 Remaining Tasks</div>
                          <div className="text-base font-black text-emerald-900 font-mono">
                            {fb.evaluationDimensions.remainingActivitiesProgress} / 5.0
                          </div>
                          <div className="text-[9px] text-emerald-700 font-bold">In Progress</div>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-500">💡 Problem Solving</div>
                          <div className="text-base font-black text-slate-900 font-mono">
                            {fb.evaluationDimensions.problemSolvingAptitude} / 5.0
                          </div>
                          <div className="text-[9px] text-blue-600 font-bold">Strong Logic</div>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-500">⏰ Attendance</div>
                          <div className="text-base font-black text-slate-900 font-mono">
                            {fb.evaluationDimensions.consistencyAndAttendance} / 5.0
                          </div>
                          <div className="text-[9px] text-emerald-600 font-bold">Compliant &gt;75%</div>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-500">🤝 Teamwork</div>
                          <div className="text-base font-black text-slate-900 font-mono">
                            {fb.evaluationDimensions.teamworkAndCommunication} / 5.0
                          </div>
                          <div className="text-[9px] text-purple-600 font-bold">Active Peer Help</div>
                        </div>
                      </div>
                    </div>

                    {/* Mentor's Clear Encouraging Words */}
                    <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs text-blue-950 space-y-1.5">
                      <div className="font-extrabold text-blue-900 flex items-center gap-2">
                        <Smile className="w-4 h-4 text-blue-600" />
                        <span>Advisor Diagnostic Note for {currentStudent.name}:</span>
                      </div>
                      <p className="leading-relaxed text-blue-900 text-xs">{fb.performanceSummary}</p>
                    </div>

                    {/* Specific Guidance for Remaining Activities */}
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
                      <div className="font-extrabold text-emerald-900 flex items-center gap-2">
                        <Compass className="w-4 h-4 text-emerald-600" />
                        <span>Mentor Advice on Your Remaining Activities:</span>
                      </div>
                      <p className="leading-relaxed text-emerald-900 text-xs">{fb.remainingActivitiesFeedback}</p>
                    </div>

                    {/* Interactive Checklist for Remaining Action Steps */}
                    {fb.actionRecommendations && fb.actionRecommendations.length > 0 && (
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            <ListTodo className="w-4 h-4 text-blue-600" />
                            <span>Your Remaining Activities Checklist (Tap to Mark Completed):</span>
                          </div>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {fb.actionRecommendations.filter((a: any) => a.completed).length} /{' '}
                            {fb.actionRecommendations.length} Done
                          </span>
                        </div>

                        <div className="space-y-2">
                          {fb.actionRecommendations.map((rec: any) => {
                            const isDone = Boolean(rec.completed);
                            return (
                              <div
                                key={rec.id}
                                onClick={() => handleToggleActionStep(fb.id, rec.id)}
                                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                                  isDone
                                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 opacity-80'
                                    : 'bg-white border-slate-200 hover:border-blue-400 text-slate-900 shadow-2xs'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                                      isDone
                                        ? 'bg-emerald-600 border-emerald-600 text-white'
                                        : 'border-slate-300 bg-slate-50'
                                    }`}
                                  >
                                    {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </div>
                                  <div>
                                    <span className={`font-semibold ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                      {rec.action}
                                    </span>
                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                      Track: {rec.category} · Assigned by mentor
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                    {rec.timeframe}
                                  </span>
                                  {isDone && (
                                    <span className="block text-[10px] text-emerald-600 font-bold mt-0.5">
                                      +25 XP Earned
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            /* --- STAFF VIEW: Evaluate Students across 360 Dimensions & Assign Remaining Activities --- */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Staff Evaluation Form */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">
                          Deliver 360° Guidance to Scholar
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Multi-pillar evaluation & assign remaining activities
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Staff Portal
                    </span>
                  </div>

                  <form onSubmit={handleSubmit360Feedback} className="space-y-4">
                    {/* Scholar Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Select Scholar to Evaluate <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={selectedStudentForStaff}
                        onChange={(e) => {
                          setSelectedStudentForStaff(e.target.value);
                          if (onSelectStudent) onSelectStudent(e.target.value);
                        }}
                        className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
                      >
                        {students.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name} ({st.id}) · {st.department}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quick Student Standing Snapshot */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-slate-500">GPA:</span>{' '}
                        <strong className="text-slate-900">{targetStudentForEvaluation.academic.gpa.toFixed(1)}/10</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Attendance:</span>{' '}
                        <strong className="text-slate-900">{targetStudentForEvaluation.attendance.overallPercentage}%</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Backlogs:</span>{' '}
                        <strong className={targetStudentForEvaluation.academic.backlogsCount > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                          {targetStudentForEvaluation.academic.backlogsCount}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Domain:</span>{' '}
                        <strong className="text-blue-700">{targetStudentForEvaluation.placement.preferredDomain}</strong>
                      </div>
                    </div>

                    {/* 6 Dimension Ratings */}
                    <div className="bg-emerald-50/40 p-3.5 rounded-2xl border border-emerald-100 space-y-2.5">
                      <div className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider">
                        Rate 360° Profile Dimensions:
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">1. Academic Rigor:</span>
                        {renderStarSelector(evalAcademicRigor, setEvalAcademicRigor)}
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">2. Lab & Practical Benchwork:</span>
                        {renderStarSelector(evalLabPractical, setEvalLabPractical)}
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="font-medium text-slate-700">3. Remaining Activities:</span>
                          <span className="block text-[10px] text-emerald-700">Progress on roadmap tasks</span>
                        </div>
                        {renderStarSelector(evalRemainingActivities, setEvalRemainingActivities)}
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">4. Problem Solving Aptitude:</span>
                        {renderStarSelector(evalProblemSolving, setEvalProblemSolving)}
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">5. Attendance & Consistency:</span>
                        {renderStarSelector(evalConsistency, setEvalConsistency)}
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">6. Teamwork & Forum Help:</span>
                        {renderStarSelector(evalTeamwork, setEvalTeamwork)}
                      </div>
                    </div>

                    {/* Mentor Summary */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mentor Assessment (Clean, Encouraging & Clear) <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={summary360}
                        onChange={(e) => setSummary360(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    {/* Specific Guidance for Remaining Activities */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Guidance for Remaining Activities <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={remainingActivitiesNote}
                        onChange={(e) => setRemainingActivitiesNote(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    {/* 3 Concrete Action Steps */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700">
                        3 Concrete Next Action Steps for the Scholar:
                      </label>
                      <input
                        type="text"
                        placeholder="Action 1: e.g. Complete quantitative placement speed drill"
                        value={recAction1}
                        onChange={(e) => setRecAction1(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800"
                      />
                      <input
                        type="text"
                        placeholder="Action 2: e.g. Maintain continuous lecture attendance above 75%"
                        value={recAction2}
                        onChange={(e) => setRecAction2(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800"
                      />
                      <input
                        type="text"
                        placeholder="Action 3: e.g. Submit Milestone 2 capstone documentation"
                        value={recAction3}
                        onChange={(e) => setRecAction3(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800"
                      />
                    </div>

                    {/* Recognition Badge */}
                    <div className="flex items-center justify-between pt-1">
                      <label className="text-xs font-bold text-slate-700">Award Recognition Badge:</label>
                      <select
                        value={endorsementBadge}
                        onChange={(e) => setEndorsementBadge(e.target.value as any)}
                        className="text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-lg px-2.5 py-1 cursor-pointer"
                      >
                        <option value="Exemplary Innovator">⭐ Exemplary Innovator</option>
                        <option value="Consistent Improver">📈 Consistent Improver</option>
                        <option value="Core Competency Achiever">🎯 Core Competency Achiever</option>
                        <option value="Rising Star">🚀 Rising Star</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting360}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting360 ? 'Publishing...' : 'Publish 360° Guidance to Scholar Portal'}</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Right: Published 360 Reviews Stream */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        Published 360° Guidance Stream
                      </h3>
                      <p className="text-xs text-slate-500">
                        Active evaluations delivered to scholars across all departments
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {student360Feedbacks.length} Reviews Delivered
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                    {student360Feedbacks.map((fb) => (
                      <div
                        key={fb.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all shadow-2xs space-y-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{fb.studentName}</span>
                            <span className="text-slate-400">·</span>
                            <span className="text-[11px] text-blue-700">{fb.studentDepartment}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {fb.endorsementBadge && (
                              <span className="text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full">
                                {fb.endorsementBadge}
                              </span>
                            )}
                            <span className="text-xs font-black font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              {fb.overallScore360.toFixed(1)} / 5.0
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed">{fb.performanceSummary}</p>

                        <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-100 text-xs text-blue-950">
                          <strong className="text-blue-900 font-bold">Remaining Activities Guidance:</strong>{' '}
                          {fb.remainingActivitiesFeedback}
                        </div>

                        {/* Action items summary */}
                        {fb.actionRecommendations && fb.actionRecommendations.length > 0 && (
                          <div className="pt-1">
                            <div className="text-[11px] font-bold text-slate-700 mb-1">Assigned Action Items:</div>
                            <div className="space-y-1">
                              {fb.actionRecommendations.map((act: any) => (
                                <div
                                  key={act.id}
                                  className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between"
                                >
                                  <span>{act.completed ? '✅' : '⏳'} {act.action}</span>
                                  <span className="font-mono text-[10px] text-slate-400">{act.timeframe}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200 flex justify-between">
                          <span>Evaluated by {fb.staffName} ({fb.staffRole})</span>
                          <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
