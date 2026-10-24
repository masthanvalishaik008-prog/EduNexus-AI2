/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, SupportAlert, InterventionRecord, AuditLogEntry, UserRole, StudentActivity, UserType } from './types/student';
import { INITIAL_STUDENTS, INITIAL_ALERTS, INITIAL_INTERVENTIONS, INITIAL_AUDIT_LOGS, INITIAL_STUDENT_ACTIVITIES } from './data/mockData';
import { isSameBranch, normalizeBranch, resolveStudentId } from './data/collegeDatabase';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { HomePage } from './components/pages/HomePage';
import { ExecutiveDashboard } from './components/pages/ExecutiveDashboard';
import { Student360Profile } from './components/pages/Student360Profile';
import { StudentEngagement } from './components/pages/StudentEngagement';
import { EarlySupportRadar } from './components/pages/EarlySupportRadar';
import { GrowthNavigator } from './components/pages/GrowthNavigator';
import { PlacementIntelligence } from './components/pages/PlacementIntelligence';
import { InterventionTracker } from './components/pages/InterventionTracker';
import { FeedbackInsights } from './components/pages/FeedbackInsights';
import { DataGovernance } from './components/pages/DataGovernance';

import { AiAssistantPage } from './components/pages/AiAssistantPage';
import { AiChatbotPage } from './components/pages/AiChatbotPage';
import { LoginPage } from './components/pages/LoginPage';
import { StudentStaffDatabase } from './components/pages/StudentStaffDatabase';
import { useAuth } from './firebase/AuthContext';
import { db } from './firebase/config';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';

interface ProtectedRouteProps {
  userType: UserType;
  currentTab: NavTab;
  activeStudentId: string | null;
  userDepartment: string;
  isCrossBranchAdmin: boolean;
  children: React.ReactNode;
}

function ProtectedRoute({
  userType,
  currentTab,
  activeStudentId,
  userDepartment,
  isCrossBranchAdmin,
  children,
}: ProtectedRouteProps) {
  if (userType === 'student') {
    const studentAllowedTabs: NavTab[] = [
      'profile',
      'student-engagement',
      'placement',
      'navigator',
      'chatbot',
      'ai-assistant',
      'feedback',
    ];
    if (!studentAllowedTabs.includes(currentTab)) {
      return (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm m-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto font-bold text-lg">
            🔒
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Protected Student Route</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Access to "{currentTab}" is restricted to faculty advisors and college officials. As an authenticated student, you have secured access to your personal 360° analytics, engagement hub, and AI mentorship.
          </p>
        </div>
      );
    }
  }

  return <>{children}</>;
}

export default function App() {
  const { user, role: authRole, setRole: setAuthRole, isAuthenticated, loading: authLoading, userType, activeStudentId, department: userDepartment, staffId, guestUserName, updateLoginStreak } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [userRole, setUserRole] = useState<UserRole>('Faculty Advisor');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Sync authRole and userType
  useEffect(() => {
    if (authRole) {
      setUserRole(authRole);
    }
  }, [authRole]);

  useEffect(() => {
    if (isAuthenticated && userType === 'student' && activeStudentId) {
      updateLoginStreak(activeStudentId);
    }
  }, [isAuthenticated, userType, activeStudentId]);

  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    setAuthRole(newRole);
  };

  // Authoritative student roster (25 students per branch = 125 total across 5 branches)
  const [students, setStudents] = useState<Student[]>(() => {
    localStorage.removeItem('edunexus_students'); // Purge any stale cache
    return INITIAL_STUDENTS;
  });

  const [alerts, setAlerts] = useState<SupportAlert[]>(() => {
    localStorage.removeItem('edunexus_alerts'); // Purge any stale cache to ensure 100% matched data
    return INITIAL_ALERTS;
  });

  const [interventions, setInterventions] = useState<InterventionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('edunexus_interventions');
      return saved ? JSON.parse(saved) : INITIAL_INTERVENTIONS;
    } catch {
      return INITIAL_INTERVENTIONS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('edunexus_audit_logs');
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [studentActivities, setStudentActivities] = useState<StudentActivity[]>(() => {
    try {
      const saved = localStorage.getItem('edunexus_student_activities');
      if (saved) {
        const parsed: StudentActivity[] = JSON.parse(saved);
        return parsed.map((a) => {
          if (a.studentId === 'ENX-2024-102') {
            return { ...a, studentName: 'Sneha Reddy' };
          }
          return a;
        });
      }
      return INITIAL_STUDENT_ACTIVITIES;
    } catch {
      return INITIAL_STUDENT_ACTIVITIES;
    }
  });

  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    const cachedActive = localStorage.getItem('edunexus_active_student_id');
    const cachedType = localStorage.getItem('edunexus_user_type');
    if (cachedType === 'student' && cachedActive) {
      return cachedActive;
    }
    return 'ENX-2024-0001';
  });

  const isCrossBranchAdmin = userRole === 'Dean of Academics' || authRole === 'Dean of Academics';

  // --- BRANCH ISOLATION SECURITY ENFORCEMENT ---
  // When a staff member logs in from a particular branch, they can only see students of the same branch!
  // Staff cannot see other branch student profiles (unless Dean with institutional cross-branch scope).
  const accessibleStudents = useMemo(() => {
    if (userType === 'staff' && !isCrossBranchAdmin) {
      return students.filter((s) => isSameBranch(s.department, userDepartment));
    }
    return students;
  }, [students, userType, isCrossBranchAdmin, userDepartment]);

  const accessibleAlerts = useMemo(() => {
    if (userType === 'staff' && !isCrossBranchAdmin) {
      return alerts.filter((a) => isSameBranch(a.department, userDepartment));
    }
    return alerts;
  }, [alerts, userType, isCrossBranchAdmin, userDepartment]);

  const accessibleInterventions = useMemo(() => {
    if (userType === 'staff' && !isCrossBranchAdmin) {
      return interventions.filter((i) => isSameBranch(i.department, userDepartment));
    }
    return interventions;
  }, [interventions, userType, isCrossBranchAdmin, userDepartment]);

  // Compute strictly resolved student for all active views
  // Guarantees that when a student logs in, their OWN profile is loaded without mismatching
  const currentStudentForViews = useMemo(() => {
    if (userType === 'student') {
      const found =
        (activeStudentId ? resolveStudentId(activeStudentId, students) : undefined) ||
        (guestUserName ? resolveStudentId(guestUserName, students) : undefined) ||
        resolveStudentId(selectedStudentId, students) ||
        students[0];
      return found;
    }
    return (
      resolveStudentId(selectedStudentId, accessibleStudents) ||
      accessibleStudents[0]
    );
  }, [userType, activeStudentId, selectedStudentId, accessibleStudents, guestUserName, students]);

  // STRICT ROLE-BASED ACTIVITY ISOLATION & ZERO LEAKAGE:
  // - Students can ONLY view, track, and manage their own personal activities (zero data cross-contamination)
  // - Staff can ONLY view activities from students within their assigned branch/department
  const accessibleActivities = useMemo(() => {
    if (userType === 'student') {
      return studentActivities.filter((act) => act.studentId === currentStudentForViews.id);
    }
    if (userType === 'staff' && !isCrossBranchAdmin) {
      return studentActivities.filter((act) => isSameBranch(act.department, userDepartment));
    }
    return studentActivities;
  }, [studentActivities, userType, isCrossBranchAdmin, userDepartment, currentStudentForViews.id]);

  // Ensure selectedStudentId is strictly confined to the staff's branch
  useEffect(() => {
    if (userType === 'staff' && !isCrossBranchAdmin && accessibleStudents.length > 0) {
      const belongsToBranch = accessibleStudents.some((s) => s.id === selectedStudentId);
      if (!belongsToBranch) {
        setSelectedStudentId(accessibleStudents[0].id);
      }
    }
  }, [userType, isCrossBranchAdmin, userDepartment, accessibleStudents, selectedStudentId]);

  // Enforce student profile isolation or staff redirection to student engagement
  useEffect(() => {
    if (userType === 'student') {
      const studentIdToLock = activeStudentId || selectedStudentId;
      const matched =
        resolveStudentId(studentIdToLock, students) ||
        (guestUserName ? resolveStudentId(guestUserName, students) : undefined);
      const targetId = matched ? matched.id : (activeStudentId || 'ENX-2024-0001');

      if (selectedStudentId !== targetId) {
        setSelectedStudentId(targetId);
      }
      setUserRole('Student');

      const allowedTabs: NavTab[] = [
        'profile',
        'student-engagement',
        'placement',
        'navigator',
        'chatbot',
        'ai-assistant',
        'feedback',
      ];
      if (!allowedTabs.includes(currentTab)) {
        setCurrentTab('profile');
      }
    } else if (userType === 'staff' && currentTab === 'home') {
      setCurrentTab('student-engagement');
    }
  }, [userType, activeStudentId, students, guestUserName]);


  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('edunexus_students', JSON.stringify(students));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem('edunexus_alerts', JSON.stringify(alerts));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [alerts]);

  useEffect(() => {
    try {
      localStorage.setItem('edunexus_interventions', JSON.stringify(interventions));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [interventions]);

  useEffect(() => {
    try {
      localStorage.setItem('edunexus_audit_logs', JSON.stringify(auditLogs));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('edunexus_student_activities', JSON.stringify(studentActivities));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [studentActivities]);

  // Load activities from Backend Database on mount & context change with strict Cache-Control: no-store
  useEffect(() => {
    const queryUrl =
      userType === 'student'
        ? `/api/student/activities?studentId=${encodeURIComponent(currentStudentForViews.id)}`
        : !isCrossBranchAdmin && userDepartment
        ? `/api/student-engagement/activities?department=${encodeURIComponent(userDepartment)}`
        : '/api/student-engagement/activities';

    fetch(queryUrl, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'x-user-id': currentStudentForViews.id,
        'x-user-role': userType,
        'x-staff-branch': userDepartment,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.activities)) {
          setStudentActivities((prev) => {
            const map = new Map<string, StudentActivity>();
            // Seed from backend first
            data.activities.forEach((act: StudentActivity) => map.set(act.id, act));
            // Preserve any un-synced local state
            prev.forEach((p) => map.set(p.id, p));
            return Array.from(map.values());
          });
        }
      })
      .catch((err) => console.warn('Failed to load initial backend activities:', err));
  }, [userType, currentStudentForViews.id, userDepartment, isCrossBranchAdmin]);

  // Firestore Sync when user is authenticated
  useEffect(() => {
    if (!user) return;

    // Listen to interventions
    const unsubInterventions = onSnapshot(collection(db, 'interventions'), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreRecords: InterventionRecord[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          firestoreRecords.push({
            id: d.id || docSnap.id,
            studentId: d.studentId,
            studentName: d.studentName,
            department: d.department,
            type: d.type,
            facultyLead: d.facultyLead,
            dateScheduled: d.dateScheduled,
            dateCompleted: d.dateCompleted,
            status: d.status,
            initialScore: d.initialScore,
            postInterventionScore: d.postInterventionScore,
            initialMetricNote: d.initialMetricNote,
            measuredOutcomeNote: d.measuredOutcomeNote,
            studentFeedback: d.studentFeedback,
          });
        });

        setInterventions((prev) => {
          const map = new Map<string, InterventionRecord>();
          prev.forEach((p) => map.set(p.id, p));
          firestoreRecords.forEach((f) => map.set(f.id, f));
          return Array.from(map.values());
        });
      }
    }, (err) => {
      console.warn('Interventions snapshot warning:', err);
    });

    // Listen to alerts
    const unsubAlerts = onSnapshot(collection(db, 'alerts'), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreAlerts: SupportAlert[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          firestoreAlerts.push({
            id: d.id || docSnap.id,
            studentId: d.studentId,
            studentName: d.studentName,
            department: d.department,
            title: d.title,
            triggerCategory: d.triggerCategory,
            priority: d.priority,
            status: d.status,
            detectedDate: d.detectedDate,
            evidence: d.evidence,
            suggestedAction: d.suggestedAction,
            assignedFaculty: d.assignedFaculty,
            facultyNotes: d.facultyNotes,
            outcomeMetric: d.outcomeMetric,
          });
        });

        setAlerts((prev) => {
          const map = new Map<string, SupportAlert>();
          prev.forEach((p) => map.set(p.id, p));
          firestoreAlerts.forEach((f) => map.set(f.id, f));
          return Array.from(map.values());
        });
      }
    }, (err) => {
      console.warn('Alerts snapshot warning:', err);
    });

    // Listen to student_activities
    const unsubActivities = onSnapshot(collection(db, 'student_activities'), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreActs: StudentActivity[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          firestoreActs.push({
            id: d.id || docSnap.id,
            studentId: d.studentId,
            studentName: d.studentName,
            department: d.department,
            title: d.title,
            category: d.category,
            description: d.description,
            status: d.status,
            progressPct: d.progressPct,
            hoursSpent: d.hoursSpent,
            dateLogged: d.dateLogged,
            dateCompleted: d.dateCompleted,
            verifiedByStaff: d.verifiedByStaff,
            staffFeedback: d.staffFeedback,
            learningOutcomes: d.learningOutcomes,
            semesterSubject: d.semesterSubject,
            mentorName: d.mentorName,
          });
        });

        setStudentActivities((prev) => {
          const map = new Map<string, StudentActivity>();
          prev.forEach((p) => map.set(p.id, p));
          firestoreActs.forEach((f) => map.set(f.id, f));
          return Array.from(map.values());
        });
      }
    }, (err) => {
      console.warn('Student activities snapshot warning:', err);
    });

    return () => {
      unsubInterventions();
      unsubAlerts();
      unsubActivities();
    };
  }, [user]);

  // Data update handlers
  const handleUpdateAlert = async (updated: SupportAlert) => {
    setAlerts(prev => prev.map(a => a.id === updated.id ? updated : a));
    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actor: userRole,
      role: userRole,
      action: 'Alert Status Transitioned',
      details: `Alert ${updated.id} (${updated.studentName}) marked as '${updated.status}'.`,
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Persist to Firestore if signed in
    if (user) {
      try {
        await setDoc(doc(db, 'alerts', updated.id), {
          ...updated,
          updatedAt: new Date().toISOString(),
          updatedByUid: user.uid,
        }, { merge: true });
      } catch (err) {
        console.warn('Could not sync alert to Firestore:', err);
      }
    }
  };

  const handleAddIntervention = async (record: InterventionRecord) => {
    setInterventions(prev => [record, ...prev]);
    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actor: userRole,
      role: userRole,
      action: 'Intervention Session Logged',
      details: `${record.type} scheduled for ${record.studentName} (${record.studentId}). Lead: ${record.facultyLead}.`,
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Persist to Firestore if signed in
    if (user) {
      try {
        await setDoc(doc(db, 'interventions', record.id), {
          ...record,
          createdById: user.uid,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Could not sync intervention to Firestore:', err);
      }
    }
  };

  const handleUpdateIntervention = (record: InterventionRecord) => {
    setInterventions(prev => prev.map(i => i.id === record.id ? record : i));
  };

  const handleAddAuditLog = (log: AuditLogEntry) => {
    setAuditLogs(prev => [log, ...prev]);
  };

  const handleImportStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
  };

  // 3-Second Auto-Save Buffer for Student Activity Logs to Firebase (reduces unnecessary write operations)
  const activitySaveTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    const timersMap = activitySaveTimersRef.current;
    return () => {
      timersMap.forEach((timer) => clearTimeout(timer));
      timersMap.clear();
    };
  }, []);

  // Student Activity Handlers
  const handleAddStudentActivity = async (activity: StudentActivity) => {
    setStudentActivities((prev) => [activity, ...prev]);
    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actor: activity.studentName,
      role: 'Student',
      action: 'Academic Activity Planned / Logged',
      details: `${activity.studentName} (${activity.studentId}) logged: "${activity.title}" (${activity.category}) - ${activity.hoursSpent} hrs. Mentor notified: ${activity.mentorName}.`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    // Persist to Backend REST Database
    fetch('/api/student-engagement/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity),
    }).catch((err) => console.warn('Could not sync student activity to backend database:', err));

    // Auto-Save Buffer: 3-second delay before persisting to Firebase to reduce write operations
    if (user) {
      const timersMap = activitySaveTimersRef.current;
      if (timersMap.has(activity.id)) {
        clearTimeout(timersMap.get(activity.id)!);
      }

      const timer = setTimeout(async () => {
        timersMap.delete(activity.id);
        try {
          await setDoc(doc(db, 'student_activities', activity.id), {
            ...activity,
            createdAt: new Date().toISOString(),
            createdById: user.uid,
          });
        } catch (err) {
          console.warn('Could not sync student activity to Firestore after 3s buffer:', err);
        }
      }, 3000); // 3 seconds buffer

      timersMap.set(activity.id, timer);
    }
  };

  const handleUpdateStudentActivity = async (updated: StudentActivity) => {
    setStudentActivities((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actor: userType === 'student' ? updated.studentName : userRole,
      role: userType === 'student' ? 'Student' : userRole,
      action: userType === 'student' ? 'Activity Progress Updated' : 'Staff Feedback Recorded',
      details: userType === 'student'
        ? `${updated.studentName} updated "${updated.title}" status to '${updated.status}' (${updated.progressPct}% complete). Notified staff.`
        : `Advisor recorded review for ${updated.studentName}'s "${updated.title}". Verified: ${updated.verifiedByStaff ? 'Yes' : 'Pending'}.`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    // Persist to Backend REST Database
    fetch('/api/student-engagement/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch((err) => console.warn('Could not sync student activity update to backend database:', err));

    // Auto-Save Buffer: 3-second delay before persisting to Firebase to reduce write operations
    if (user) {
      const timersMap = activitySaveTimersRef.current;
      if (timersMap.has(updated.id)) {
        clearTimeout(timersMap.get(updated.id)!);
      }

      const timer = setTimeout(async () => {
        timersMap.delete(updated.id);
        try {
          await setDoc(doc(db, 'student_activities', updated.id), {
            ...updated,
            updatedAt: new Date().toISOString(),
            updatedByUid: user.uid,
          }, { merge: true });
        } catch (err) {
          console.warn('Could not sync student activity update to Firestore after 3s buffer:', err);
        }
      }, 3000); // 3 seconds buffer

      timersMap.set(updated.id, timer);
    }
  };


  const openAlertsCount = accessibleAlerts.filter(a => a.status !== 'Resolved').length;
  const activeInterventionsCount = accessibleInterventions.filter(i => i.status === 'Scheduled' || i.status === 'In Progress').length;

  if (!isAuthenticated && !authLoading) {
    return (
      <LoginPage
        onLoginSuccess={(studentId, type, department, _staffIdParam, loggedInName) => {
          if (type === 'student' || studentId) {
            const matched = studentId
              ? resolveStudentId(studentId, students)
              : loggedInName
              ? resolveStudentId(loggedInName, students)
              : undefined;
            const sid = matched ? matched.id : (studentId || 'ENX-2024-0001');
            setSelectedStudentId(sid);
            setUserRole('Student');
            setCurrentTab('profile');
          } else {
            // Staff login: Direct to Profile view where their own Faculty details are displayed
            const branchStudents = students.filter(s => isSameBranch(s.department, department || userDepartment));
            if (branchStudents.length > 0) {
              setSelectedStudentId(branchStudents[0].id);
            }
            setCurrentTab('profile');
          }
        }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-[#070e1e] overflow-hidden text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-200">
      {/* Desktop Navy Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
          }}
          alertCount={openAlertsCount}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50 flex flex-col w-64 bg-[#0a192f] text-slate-300">
            <Sidebar
              currentTab={currentTab}
              onSelectTab={(tab) => {
                setCurrentTab(tab);
                setMobileMenuOpen(false);
              }}
              alertCount={openAlertsCount}
            />
          </div>
        </div>
      )}

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#f8fafc] dark:bg-[#091122] transition-colors duration-200">
        <Header
          currentTab={currentTab}
          userRole={userRole}
          onRoleChange={handleRoleChange}
          students={accessibleStudents}
          selectedStudentId={currentStudentForViews.id}
          onSelectStudent={(id) => {
            if (userType === 'staff') {
              setSelectedStudentId(id);
            }
          }}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          <div className="max-w-7xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 16, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.99 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                <ProtectedRoute
                  userType={userType}
                  currentTab={currentTab}
                  activeStudentId={activeStudentId}
                  userDepartment={userDepartment}
                  isCrossBranchAdmin={isCrossBranchAdmin}
                >
            {currentTab === 'home' && (
              <HomePage
                onNavigate={setCurrentTab}
                totalStudents={accessibleStudents.length}
                activeInterventionsCount={activeInterventionsCount}
                openAlertsCount={openAlertsCount}
              />
            )}

            {currentTab === 'dashboard' && (
              <ExecutiveDashboard
                students={isCrossBranchAdmin ? students : accessibleStudents}
                alerts={isCrossBranchAdmin ? alerts : accessibleAlerts}
                interventions={isCrossBranchAdmin ? interventions : accessibleInterventions}
                onSelectStudent={(id) => {
                  if (userType === 'staff') {
                    setSelectedStudentId(id);
                  }
                }}
                onNavigateToTab={setCurrentTab}
              />
            )}

            {currentTab === 'profile' && (
              <Student360Profile
                students={accessibleStudents}
                currentStudentId={currentStudentForViews.id}
                onSelectStudent={(id) => {
                  if (userType === 'staff') {
                    setSelectedStudentId(id);
                  }
                }}
                onNavigateToTab={setCurrentTab}
                userType={userType}
                alerts={accessibleAlerts}
                studentActivities={accessibleActivities}
                onAddStudentActivity={handleAddStudentActivity}
                onUpdateStudentActivity={handleUpdateStudentActivity}
              />
            )}

            {currentTab === 'student-engagement' && (
              <StudentEngagement
                currentStudent={currentStudentForViews}
                allStudents={accessibleStudents}
                userType={userType}
                activities={accessibleActivities}
                onAddActivity={handleAddStudentActivity}
                onUpdateActivity={handleUpdateStudentActivity}
                onNavigateToTab={setCurrentTab}
                onSelectStudent={(id) => {
                  if (userType === 'staff') {
                    setSelectedStudentId(id);
                  }
                }}
              />
            )}

            {currentTab === 'chatbot' && (
              <AiChatbotPage
                students={accessibleStudents}
                currentStudentId={currentStudentForViews.id}
                onSelectStudent={(id) => {
                  if (userType === 'staff') {
                    setSelectedStudentId(id);
                  }
                }}
              />
            )}

            {currentTab === 'ai-assistant' && (
              <AiAssistantPage
                students={accessibleStudents}
                currentStudentId={currentStudentForViews.id}
                onSelectStudent={(id) => {
                  if (userType === 'staff') {
                    setSelectedStudentId(id);
                  }
                }}
                onNavigateToTab={setCurrentTab}
              />
            )}

            {currentTab === 'radar' && (
              <EarlySupportRadar
                alerts={alerts}
                students={students}
                userRole={userRole}
                userDepartment={userDepartment}
                isCrossBranchAdmin={isCrossBranchAdmin}
                onUpdateAlert={handleUpdateAlert}
                onSelectStudent={(id) => {
                  setSelectedStudentId(id);
                  setCurrentTab('profile');
                }}
                onNavigateToInterventionWithStudent={(id) => {
                  setSelectedStudentId(id);
                  setCurrentTab('interventions');
                }}
              />
            )}

            {currentTab === 'navigator' && (
              <GrowthNavigator
                students={accessibleStudents}
                currentStudentId={currentStudentForViews.id}
                onSelectStudent={(id) => {
                  if (userType === 'staff') {
                    setSelectedStudentId(id);
                  }
                }}
                onNavigateToTab={setCurrentTab}
                userType={userType}
              />
            )}

            {currentTab === 'placement' && (
              <PlacementIntelligence
                students={accessibleStudents}
                currentStudentId={currentStudentForViews.id}
                onSelectStudent={(id) => {
                  if (userType === 'staff') {
                    setSelectedStudentId(id);
                  }
                }}
                onNavigateToTab={setCurrentTab}
              />
            )}

            {currentTab === 'interventions' && (
              <InterventionTracker
                interventions={accessibleInterventions}
                students={accessibleStudents}
                onAddIntervention={handleAddIntervention}
                onUpdateIntervention={handleUpdateIntervention}
                onSelectStudent={(id) => {
                  setSelectedStudentId(id);
                  setCurrentTab('profile');
                }}
                initialSelectedStudentId={selectedStudentId}
              />
            )}

            {currentTab === 'feedback' && (
              <FeedbackInsights
                students={accessibleStudents}
                userRole={userRole}
                onSelectStudent={(id) => {
                  if (userType === 'staff') {
                    setSelectedStudentId(id);
                  }
                }}
                onNavigateToTab={(tab) => setCurrentTab(tab as NavTab)}
              />
            )}

            {currentTab === 'governance' && (
              <DataGovernance
                students={isCrossBranchAdmin ? students : accessibleStudents}
                auditLogs={auditLogs}
                userRole={userRole}
                onImportStudents={handleImportStudents}
                onAddAuditLog={handleAddAuditLog}
              />
            )}
            {currentTab === 'database' && (
              <StudentStaffDatabase />
            )}
                </ProtectedRoute>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>


    </div>
  );
}
