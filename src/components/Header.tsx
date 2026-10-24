import React, { useState, useRef, useEffect } from 'react';
import { Student, UserRole } from '../types/student';
import { NavTab } from './Sidebar';
import { useAuth } from '../firebase/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { LiveSyncBadge } from './LiveSyncBadge';
import {
  Search,
  SlidersHorizontal,
  Download,
  Menu,
  LogIn,
  LogOut,
  UserCheck,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  User,
  GraduationCap,
  Building,
  Lock,
} from 'lucide-react';

interface HeaderProps {
  currentTab: NavTab;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  students: Student[];
  selectedStudentId: string;
  onSelectStudent: (id: string) => void;
  onToggleMobileMenu?: () => void;
}

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  home: { title: 'Project Overview', subtitle: 'KPMG Case Challenge · Student Success & Placement Intelligence' },
  dashboard: { title: 'Executive Dashboard', subtitle: 'Institutional Cohort Analytics & Real-Time Performance Matrix' },
  profile: { title: 'Student 360° Profile', subtitle: 'Holistic 7-Pillar Evidence & Explainable Success Attribution' },
  chatbot: { title: 'AI Advisory Chatbot', subtitle: 'Interactive Multi-Turn Reasoning with Gemini · Academic & Placement Counselor' },
  'ai-assistant': { title: 'AI Insight Report', subtitle: 'Gemini 3.8 Flash · Summarized Multi-Pillar Student Insight Report' },
  radar: { title: 'Early Support Radar', subtitle: 'Proactive Alert Detection & Ethical Human-in-the-Loop Safeguards' },
  navigator: { title: 'Growth Navigator', subtitle: 'Personalized Remedial Roadmaps & Skill Milestone Tracking' },
  placement: { title: 'Placement Intelligence', subtitle: 'Domain Readiness Pathways & Industry Project Recommendations' },
  interventions: { title: 'Intervention Tracker', subtitle: 'Mentoring Outcomes, Remedial Logs & Before-After Progress' },
  feedback: { title: 'Feedback Insights', subtitle: 'Student Sentiment Analysis & Privacy-Preserved Observations' },
  'student-engagement': { title: 'Student Engagement & Knowledge Hub', subtitle: 'Academic Action Plans, Activities Log & Direct Advisor Reporting' },
  governance: { title: 'Data Quality & Governance', subtitle: 'CSV Schema Validation, Multi-Category Health & Audit Logs' },
  database: { title: 'Staff & Student Backend Database', subtitle: 'Restricted Institutional Directory & Server-Side Telemetry Storage' },
};

export function Header({
  currentTab,
  userRole,
  onRoleChange,
  students,
  selectedStudentId,
  onSelectStudent,
  onToggleMobileMenu,
}: HeaderProps) {
  const { user, isGuestSession, guestUserName, signInWithGoogle, signOut, userType, department } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const currentInfo = TAB_TITLES[currentTab] || { title: 'EduNexus AI', subtitle: 'Analytics' };
  const displayName = user?.displayName || guestUserName || 'Faculty Advisor';

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white/95 dark:bg-[#0b162c]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs transition-colors duration-200">
      {/* Left: Mobile hamburger & breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="truncate">
          <h1 className="text-sm md:text-base font-bold text-slate-900 dark:text-white truncate tracking-tight">
            {currentInfo.title}
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden sm:block">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Quick Student Selector */}
        {userType === 'student' ? (
          <div className="hidden lg:flex items-center gap-2 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-lg px-2.5 py-1.5 text-xs text-blue-900 dark:text-blue-300 font-semibold">
            <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="truncate max-w-[180px]">
              {students.find((s) => s.id === selectedStudentId)?.name || 'Student'} ({selectedStudentId})
            </span>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedStudentId}
              onChange={(e) => onSelectStudent(e.target.value)}
              className="text-xs bg-transparent border-none text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[170px] truncate font-medium"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id} className="dark:bg-slate-900 dark:text-slate-100">
                  {st.name} ({st.id.split('-').pop()})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Verified Institutional Role & Branch Badge (Locked - No mid-session spoofing) */}
        {userType === 'student' ? (
          <div className="flex items-center gap-1.5 text-xs bg-emerald-50 dark:bg-emerald-950/60 rounded-lg px-2.5 py-1.5 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold shadow-2xs">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Student Portal</span>
          </div>
        ) : (
          <div
            className="flex items-center gap-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 shadow-2xs"
            title={`Authenticated as ${userRole}${department ? ` · ${department}` : ''} (Official Position)`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="font-bold text-slate-900 dark:text-white">{userRole}</span>
            {department && (
              <span className="hidden xl:inline text-[11px] text-slate-500 dark:text-slate-400 font-medium border-l border-slate-200 dark:border-slate-700 pl-1.5 ml-0.5 max-w-[140px] truncate">
                {department}
              </span>
            )}
            <Lock className="w-3 h-3 text-slate-400 shrink-0 ml-0.5" />
          </div>
        )}



        {/* Real-Time Live Telemetry Badge */}
        <LiveSyncBadge />

        {/* Global Website Theme Switcher */}
        <ThemeToggle />

        {/* Interactive User Account Dropdown */}
        <div className="relative pl-1 border-l border-slate-200 dark:border-slate-800" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-left"
            aria-expanded={profileOpen}
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={displayName}
                className="w-7 h-7 rounded-full border border-slate-200 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-700 to-blue-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {displayName.replace(/Dr\.|Prof\./g, '').trim()[0] || 'U'}
              </div>
            )}
            <div className="hidden xl:block text-left text-[11px] leading-tight">
              <div className="font-semibold text-slate-800 truncate max-w-[100px]">
                {displayName}
              </div>
              <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{user ? 'Google SSO' : 'Active Session'}</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0e1a34] rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 text-xs text-slate-900 dark:text-slate-100">
              <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white text-sm truncate">{displayName}</div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] truncate mt-0.5">
                  {user?.email || `${displayName.toLowerCase().replace(/[^a-z]/g, '')}@edunexus.edu`}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                    <span>{userRole}</span>
                  </div>
                  {department && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <Building className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[130px]">{department}</span>
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-850 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                  <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>Verified Institutional Position (Locked)</span>
                </div>
              </div>

              {/* Connect Google SSO option if in guest mode */}
              {!user && (
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      signInWithGoogle();
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-1.5 px-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium text-xs transition-colors cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Link Google Account</span>
                  </button>
                </div>
              )}

              {/* Sign Out / Switch to Login Page */}
              <div className="px-2 pt-1">
                <button
                  onClick={async () => {
                    setProfileOpen(false);
                    await signOut();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Switch Account / Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
