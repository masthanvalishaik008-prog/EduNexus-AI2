import React from 'react';
import { useAuth } from '../firebase/AuthContext';
import {
  LayoutDashboard,
  UserCheck,
  Radar,
  Compass,
  Briefcase,
  ClipboardList,
  MessageSquareQuote,
  ShieldCheck,
  Home,
  SlidersHorizontal,
  Code2,
  GraduationCap,
  Sparkles,
  LogOut,
  MessageSquareCode,
  Activity,
  Users
} from 'lucide-react';

export type NavTab =
  | 'home'
  | 'dashboard'
  | 'profile'
  | 'student-engagement'
  | 'ai-assistant'
  | 'chatbot'
  | 'radar'
  | 'navigator'
  | 'placement'
  | 'interventions'
  | 'feedback'
  | 'governance'
  | 'database';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  alertCount: number;
}

export function Sidebar({
  currentTab,
  onSelectTab,
  alertCount,
}: SidebarProps) {
  const { signOut, user, isGuestSession, guestUserName, userType, department, role } = useAuth();

  // Navigation items customized for Student vs Staff
  const staffNavItems = [
    { id: 'home' as NavTab, label: 'Home Page', icon: Home, badge: null },
    { id: 'dashboard' as NavTab, label: 'Executive Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'profile' as NavTab, label: 'Student 360° Profile', icon: UserCheck, badge: null },
    { id: 'student-engagement' as NavTab, label: 'Student Engagement', icon: Activity, badge: 'New' },
    { id: 'chatbot' as NavTab, label: 'Gemini Chatbot', icon: MessageSquareCode, badge: 'Live AI' },
    { id: 'ai-assistant' as NavTab, label: 'AI Insight Report', icon: Sparkles, badge: 'Gemini' },
    { id: 'radar' as NavTab, label: 'Early Support Radar', icon: Radar, badge: alertCount > 0 ? `${alertCount}` : null },
    { id: 'navigator' as NavTab, label: 'Growth Navigator', icon: Compass, badge: null },
    { id: 'placement' as NavTab, label: 'Placement Intelligence', icon: Briefcase, badge: 'Verify' },
    { id: 'interventions' as NavTab, label: 'Intervention Tracker', icon: ClipboardList, badge: null },
    { id: 'feedback' as NavTab, label: 'Feedback & 360° Hub', icon: MessageSquareQuote, badge: 'Live' },
    { id: 'governance' as NavTab, label: 'Data Quality & Gov', icon: ShieldCheck, badge: null },
    { id: 'database' as NavTab, label: 'Staff & Student DB', icon: Users, badge: 'Staff Only' },
  ];

  const studentNavItems = [
    { id: 'profile' as NavTab, label: 'My 360° Profile', icon: UserCheck, badge: 'Self' },
    { id: 'student-engagement' as NavTab, label: 'Student Engagement Hub', icon: Activity, badge: 'Core' },
    { id: 'placement' as NavTab, label: 'Placement & Career Hub', icon: Briefcase, badge: 'Drives & Prep' },
    { id: 'navigator' as NavTab, label: 'My Growth Roadmap', icon: Compass, badge: null },
    { id: 'chatbot' as NavTab, label: 'Gemini Academic Coach', icon: MessageSquareCode, badge: 'Live AI' },
    { id: 'ai-assistant' as NavTab, label: 'My Insight Report', icon: Sparkles, badge: 'Gemini' },
    { id: 'feedback' as NavTab, label: 'College & Staff Feedback', icon: MessageSquareQuote, badge: 'Live' },
  ];

  const navItems = userType === 'student' ? studentNavItems : staffNavItems;

  return (
    <aside className="w-64 bg-[#0a192f] text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-white text-base tracking-tight leading-tight">EduNexus AI</div>
            <div className="text-[11px] text-blue-400 font-medium">Student Success Analytics</div>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Core Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`ml-2 px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                  item.badge === 'Live AI'
                    ? 'bg-purple-500/30 text-purple-300 border border-purple-400/50 animate-pulse'
                    : item.badge === 'Gemini'
                    ? 'bg-blue-500/30 text-blue-300 border border-blue-400/50'
                    : item.badge === 'Staff Only'
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/50'
                    : 'bg-amber-500/30 text-amber-300 border border-amber-400/50'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 border-t border-slate-800/60 mt-3">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4 text-slate-500 hover:text-red-400 shrink-0" />
            <span className="truncate">Sign Out / Switch Account</span>
          </button>
        </div>
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-[#081426] text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <span className="truncate max-w-[130px] font-semibold text-slate-200">
            {user?.displayName || (isGuestSession ? guestUserName : 'Academic Advisor')}
          </span>
          <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Online
          </span>
        </div>
        <div className="mt-1 text-[10px] text-blue-300 truncate font-mono">
          {userType === 'student' ? 'Student Portal' : `${role}${department ? ` · ${department}` : ''}`}
        </div>
        <p className="mt-0.5 text-[10px] text-slate-500">
          7 Categories Integrated · Explainable AI
        </p>
      </div>
    </aside>
  );
}
