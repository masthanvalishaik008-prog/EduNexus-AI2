import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavTab } from '../Sidebar';
import { useAuth } from '../../firebase/AuthContext';
import {
  ArrowRight,
  Database,
  Search,
  Sparkles,
  HeartHandshake,
  TrendingUp,
  GraduationCap,
  Layers,
  Activity,
  Award,
  Users,
  Compass,
  Radar,
  Briefcase,
  CheckCircle2,
  Newspaper,
  X,
  ChevronRight,
  Building2,
  Calendar,
  Bell
} from 'lucide-react';
import heroImg from '../../assets/images/edunexus_hero_analytics_1791794129538.jpg';
import { NewsSection } from '../NewsSection';

interface HomePageProps {
  onNavigate: (tab: NavTab) => void;
  totalStudents: number;
  activeInterventionsCount: number;
  openAlertsCount: number;
}

export function HomePage({
  onNavigate,
  totalStudents,
  activeInterventionsCount,
  openAlertsCount,
}: HomePageProps) {
  const { department } = useAuth();
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<any>(null);

  const branchNewsData = [
    {
      id: 'news-1',
      title: `${department} Departmental Hackathon & Cloud Lab Launch`,
      category: 'Branch',
      department: department,
      date: 'Today, 9:30 AM',
      summary: 'State-of-the-art cloud computing workstations and Kubernetes testbeds are now live for all senior students.',
      fullContent: `The ${department} department in collaboration with industry partners has officially inaugurated the Advanced Cloud & Containerization Testbed. All students enrolled in final year projects and core labs can now provision dedicated isolated Kubernetes namespaces, GPU-accelerated Jupyter notebooks, and microservices architecture sandboxes. Mentorship sessions with AWS and Google Cloud certified architects will take place every Tuesday and Thursday at 4 PM in Lab Block 3.`
    },
    {
      id: 'news-2',
      title: 'Annual College Tech Fest "Praxis 2026" Registrations Open',
      category: 'College',
      department: 'All Departments',
      date: 'Yesterday',
      summary: 'Register your teams for hackathons, paper presentations, robotics challenges, and coding marathons with ₹5,00,000 in prizes.',
      fullContent: `Praxis 2026, our institution's flagship technical symposium, is back with 24 distinct competitive tracks ranging from Generative AI Hackathons and Autonomous Robotics to VLSI Circuit Design and Cyber Security CTF battles. Early bird registrations close on Friday. All participating students will receive verified digital certificates and direct fast-track interview referrals with our premium placement partners.`
    },
    {
      id: 'news-3',
      title: 'Mid-Semester Examination Timetable & Syllabus Guidelines',
      category: 'Academics',
      department: 'All Departments',
      date: 'Oct 12, 2026',
      summary: 'Mid-term evaluations begin next Monday. Check your personalized seating allocation and syllabus coverage on your student portal.',
      fullContent: `The Office of the Controller of Examinations has released the mid-semester evaluation timetable. Examinations will be conducted in computer-based testing (CBT) mode for theory courses and practical viva voce for laboratory credits. Students are advised to clear any library dues and verify their attendance percentage (minimum 75% required) before downloading their admit cards from the student portal.`
    },
    {
      id: 'news-4',
      title: 'Exclusive Placement Prep Bootcamp & Mock Interviews',
      category: 'Placement',
      department: 'Placement Cell',
      date: 'Oct 10, 2026',
      summary: 'Top product companies campus recruitment drive scheduled for next month. Mandatory coding and aptitude training commences.',
      fullContent: `The University Career & Placement Cell announces the launch of the Intensive Aptitude & Data Structures Bootcamp. Sessions will focus on advanced dynamic programming, system design fundamentals, and HR behavioural interview strategies. Attendance is mandatory for all registered final year students. Mock interviews will be conducted by alumni currently working at FAANG and top-tier MNCs.`
    }
  ];
  const pillars = [
    {
      title: 'Academic',
      desc: 'GPA, semester trends, internal assessments, and backlog recovery status',
      iconBg: 'bg-blue-100 text-blue-700 border-blue-200',
      cardStyle: 'bg-gradient-to-br from-white to-blue-50/60 border-blue-200/80 hover:border-blue-400',
      badge: 'text-blue-700 bg-blue-100/80',
    },
    {
      title: 'Attendance',
      desc: 'Real-time lecture & lab presence, consecutive absence patterns, and compliance',
      iconBg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      cardStyle: 'bg-gradient-to-br from-white to-emerald-50/60 border-emerald-200/80 hover:border-emerald-400',
      badge: 'text-emerald-700 bg-emerald-100/80',
    },
    {
      title: 'LMS Platform',
      desc: 'Portal logins, module completion rates, quiz assessments, and video engagement',
      iconBg: 'bg-purple-100 text-purple-700 border-purple-200',
      cardStyle: 'bg-gradient-to-br from-white to-purple-50/60 border-purple-200/80 hover:border-purple-400',
      badge: 'text-purple-700 bg-purple-100/80',
    },
    {
      title: 'Engagement',
      desc: 'Hackathons attended, tech club leadership, peer forum posts, and extracurriculars',
      iconBg: 'bg-amber-100 text-amber-700 border-amber-200',
      cardStyle: 'bg-gradient-to-br from-white to-amber-50/60 border-amber-200/80 hover:border-amber-400',
      badge: 'text-amber-700 bg-amber-100/80',
    },
    {
      title: 'Placement',
      desc: 'Aptitude benchmarks, competitive coding scores, and mock interview performance',
      iconBg: 'bg-rose-100 text-rose-700 border-rose-200',
      cardStyle: 'bg-gradient-to-br from-white to-rose-50/60 border-rose-200/80 hover:border-rose-400',
      badge: 'text-rose-700 bg-rose-100/80',
    },
    {
      title: 'Skills & Tech',
      desc: 'Verified certifications, industry tech stacks, GitHub projects, and specialized labs',
      iconBg: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      cardStyle: 'bg-gradient-to-br from-white to-cyan-50/60 border-cyan-200/80 hover:border-cyan-400',
      badge: 'text-cyan-700 bg-cyan-100/80',
    },
    {
      title: 'Feedback Pulse',
      desc: 'Faculty mentor observations, sentiment trends, and student pulse satisfaction',
      iconBg: 'bg-teal-100 text-teal-700 border-teal-200',
      cardStyle: 'bg-gradient-to-br from-white to-teal-50/60 border-teal-200/80 hover:border-teal-400',
      badge: 'text-teal-700 bg-teal-100/80',
    },
  ];

  const actionLoopSteps = [
    {
      step: '01',
      title: 'Integrate Data',
      icon: Database,
      desc: 'Aggregate 7 disparate campus streams into a unified Student 360° record with validated schemas.',
      color: 'from-blue-600 to-indigo-600',
      textColor: 'text-blue-400',
    },
    {
      step: '02',
      title: 'Analyze Patterns',
      icon: Search,
      desc: 'Detect compound risk triggers such as attendance slip preceding assignment backlog.',
      color: 'from-indigo-600 to-purple-600',
      textColor: 'text-indigo-400',
    },
    {
      step: '03',
      title: 'Explain Findings',
      icon: Sparkles,
      desc: 'Break down transparent weight attributions so faculty understand the exact "why" behind alerts.',
      color: 'from-purple-600 to-pink-600',
      textColor: 'text-purple-400',
    },
    {
      step: '04',
      title: 'Recommend Support',
      icon: HeartHandshake,
      desc: 'Generate tailored remedial roadmaps, peer study groups, and domain mock interview labs.',
      color: 'from-amber-500 to-rose-600',
      textColor: 'text-amber-400',
    },
    {
      step: '05',
      title: 'Track Intervention',
      icon: Layers,
      desc: 'Log mentoring notes, scheduled remedial sessions, and track adherence in real-time.',
      color: 'from-rose-500 to-pink-600',
      textColor: 'text-rose-400',
    },
    {
      step: '06',
      title: 'Measure Progress',
      icon: TrendingUp,
      desc: 'Quantify before-and-after score recovery to validate institutional impact and outcomes.',
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-400',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <NewsSection />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/30 border border-slate-200/90 rounded-3xl p-6 lg:p-8 relative overflow-hidden shadow-xs">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-100/70 px-3.5 py-1.5 rounded-full border border-blue-200 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>KPMG Case Challenge · Student Success Framework</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight text-balance leading-tight">
              EduNexus AI: Student Success Analytics & Placement Intelligence
            </h1>

            <p className="text-slate-600 text-sm lg:text-base leading-relaxed max-w-2xl">
              An enterprise intelligence platform uniting seven categories of student telemetry to illuminate learning trajectories, deliver explainable early-warning signals, recommend personalized interventions, and accelerate campus placement outcomes.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer active:scale-98"
              >
                <span>Explore Executive Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('radar')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors border border-slate-300 shadow-xs cursor-pointer"
              >
                <Radar className="w-4 h-4 text-amber-500" />
                <span>Review Active Radar Alerts ({openAlertsCount})</span>
              </button>

              <button
                onClick={() => onNavigate('chatbot')}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs rounded-xl transition-colors border border-purple-200 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Launch Gemini AI Chatbot</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div
              onClick={() => setIsNewsModalOpen(true)}
              className="relative rounded-2xl overflow-hidden border-2 border-blue-200/60 shadow-xl bg-slate-950 aspect-16/10 group cursor-pointer hover:border-blue-400 transition-all"
            >
              <img
                src={heroImg}
                alt="EduNexus AI Digital Campus Analytics Console"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-between p-5">
                <div className="flex justify-between items-start">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-600/90 text-white backdrop-blur-md shadow-lg animate-pulse border border-blue-400/50">
                    <Newspaper className="w-3.5 h-3.5" />
                    <span>Live Branch & College News Pop-Up</span>
                  </span>
                  <span className="text-[10px] bg-slate-900/85 text-blue-300 px-2.5 py-1 rounded-lg backdrop-blur-md font-mono border border-slate-700 shadow-sm">
                    Click to Open
                  </span>
                </div>
                <div className="text-white text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-blue-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Real-Time Institutional Action Loop</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Integrating Academic, Attendance, LMS, Engagement, Placement, Skills & Feedback
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Summary KPI Cards with Vibrant Color Palette */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-gradient-to-br from-white via-white to-blue-50/50 dark:from-[#0d1b33] dark:via-[#0c1830] dark:to-[#0a152b] border border-blue-200/90 dark:border-blue-900/60 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300" title="Total active students enrolled and monitored across all engineering branches">
              Total Enrolled Students
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black font-mono tabular-nums text-slate-900 dark:text-white">
            {totalStudents} <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Scholars</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">Across 5 Engineering Branches</div>
        </div>

        {/* Data Integration Coverage */}
        <div className="bg-gradient-to-br from-white via-white to-emerald-50/50 dark:from-[#09221b] dark:via-[#081f18] dark:to-[#071914] border border-emerald-200/90 dark:border-emerald-900/60 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Data Coverage</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
            7 / 7 <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">Pillars</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">100% Comprehensive Telemetry</div>
        </div>

        {/* Support Radar Warnings */}
        <div className="bg-gradient-to-br from-white via-white to-amber-50/50 dark:from-[#241a0b] dark:via-[#20170a] dark:to-[#171007] border border-amber-200/90 dark:border-amber-900/60 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Support Radar</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black font-mono tabular-nums text-amber-700 dark:text-amber-400">
            {openAlertsCount} <span className="text-xs font-semibold text-amber-600 dark:text-amber-300">Active Alerts</span>
          </div>
          <div className="mt-1 text-[11px] text-amber-700 dark:text-amber-400 font-medium">Proactive Remedial Triage · {openAlertsCount} Flagged Scholars</div>
        </div>

        {/* Active Interventions */}
        <div className="bg-gradient-to-br from-white via-white to-purple-50/50 dark:from-[#1d132e] dark:via-[#191028] dark:to-[#130b20] border border-purple-200/90 dark:border-purple-900/60 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Interventions Logged</span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black font-mono tabular-nums text-purple-700 dark:text-purple-400">
            {activeInterventionsCount} <span className="text-xs font-semibold text-purple-600 dark:text-purple-300">Sessions</span>
          </div>
          <div className="mt-1 text-[11px] text-purple-700 dark:text-purple-400 font-medium">Measurable Before-After Progress</div>
        </div>
      </section>

      {/* The 7 Pillars Grid with Distinctive Thematic Color Cards */}
      <section className="bg-white dark:bg-[#0c1830] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 lg:p-8 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800 mb-1">
            <span>Modular Data Fusion</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Integrated Campus Telemetry: The Seven Pillars
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Breaking down academic data silos into actionable insights across performance, behavior, and industry readiness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map((p, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border ${p.cardStyle} shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${p.badge}`}>
                    Pillar 0{idx + 1}
                  </span>
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold ${p.iconBg}`}>
                    {idx + 1}
                  </div>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{p.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Weight: Demonstrator</span>
                <span className="font-semibold text-slate-800">100% Tracked</span>
              </div>
            </div>
          ))}

          {/* Quick Action Tile */}
          <div
            onClick={() => onNavigate('governance')}
            className="p-5 rounded-2xl border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50/50 to-indigo-50/60 hover:from-blue-100/60 hover:to-indigo-100/70 cursor-pointer flex flex-col justify-center items-center text-center transition-all group shadow-xs hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 mb-2 group-hover:scale-110 transition-transform">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-blue-900">Upload Campus CSV Data</span>
            <span className="text-[11px] text-blue-600 mt-0.5">Validate Schema & Health Logs</span>
          </div>
        </div>
      </section>

      {/* The Unique Innovation: Student Success Action Loop */}
      <section className="bg-gradient-to-br from-[#0a192f] via-[#0b1d3a] to-[#071322] text-white rounded-3xl p-6 lg:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl mb-8 relative z-10">
          <div className="text-xs font-mono text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
            <span>Methodological Innovation</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
            The Continuous Student Success Action Loop
          </h2>
          <p className="text-xs lg:text-sm text-slate-300 mt-2 leading-relaxed">
            Unlike static dashboards that merely present retrospective charts, EduNexus AI establishes an end-to-end operational cycle connecting data capture directly to measurable intervention outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {actionLoopSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 hover:border-blue-500/60 hover:shadow-lg transition-all group backdrop-blur-xs"
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${step.color} flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono text-slate-500 font-bold">STAGE {step.step}</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-blue-300 transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
            <span>Ethical Safeguard: Zero automated punitive actions; mandatory human advisor sign-off.</span>
          </div>
          <button
            onClick={() => onNavigate('profile')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Inspect Individual Student 360° Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Branch & College News Modal Popup */}
      <AnimatePresence>
        {isNewsModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsNewsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Newspaper className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">College & Branch Newsroom</h3>
                    <p className="text-xs text-blue-100">Live updates for {department}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNewsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
                <div className="text-xs text-slate-500 font-medium px-1">
                  Showing latest announcements curated for your branch and university campus. Click any item for complete briefing.
                </div>

                {branchNewsData.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedNews(item)}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/50 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-100 text-blue-700">
                        <Building2 className="w-3 h-3" />
                        <span>{item.category}</span>
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {item.date}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                      {item.summary}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="font-medium text-slate-500">{item.department}</span>
                      <span className="text-blue-600 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Read Full Brief <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                <span>Updated in real-time via EduNexus Institutional Feed</span>
                <button
                  onClick={() => setIsNewsModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Read More Detailed Article Modal */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedNews(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-100 text-blue-700">
                    {selectedNews.category} · {selectedNews.department}
                  </span>
                  <button
                    onClick={() => setSelectedNews(null)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {selectedNews.title}
                </h3>

                <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Published {selectedNews.date}</span>
                </div>

                <div className="text-xs text-slate-700 leading-relaxed space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                  <p>{selectedNews.fullContent}</p>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedNews(null)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Got It
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
