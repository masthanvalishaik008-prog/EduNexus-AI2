import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Student } from '../types/student';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  HeartHandshake,
  ArrowRight,
  UserCheck,
  Award,
  BookOpen,
  CalendarCheck,
  TrendingUp,
  Smile,
  ShieldCheck
} from 'lucide-react';

interface StudentFriendlyFeedbackCardProps {
  student: Student;
  onNavigateToTab?: (tab: string) => void;
}

export function StudentFriendlyFeedbackCard({
  student,
  onNavigateToTab,
}: StudentFriendlyFeedbackCardProps) {
  const [viewMode, setViewMode] = useState<'friendly' | 'detailed'>('friendly');
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const toggleStep = (key: string) => {
    setCompletedSteps((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Generate plain-language, encouraging feedback based on the student's metrics
  const isAttendanceGood = student.attendance.overallPercentage >= 75;
  const isGpaStrong = student.academic.gpa >= 7.5;
  const hasBacklogs = student.academic.backlogsCount > 0;
  const isCodingReady = student.placement.codingScore >= 70;

  // Personalized plain-language synthesis
  const studentFriendlyStrengths = [
    ...(student.strengths && student.strengths.length > 0
      ? student.strengths.slice(0, 2)
      : ['Solid laboratory discipline and regular participation in hands-on sessions.']),
    isAttendanceGood
      ? `Consistent Attendance: You have maintained ${student.attendance.overallPercentage}% attendance, keeping you safely above the university regulatory baseline.`
      : `Laboratory Work: You are active in practical sessions (${student.attendance.practicalPercentage}% lab attendance).`,
    isGpaStrong
      ? `Strong Academic Momentum: Your ${student.academic.gpa.toFixed(1)}/10 GPA places you among the top performers in ${student.department}.`
      : `Continuous Effort: You have logged ${student.lms.portalLoginsPerWeek} portal logins per week and completed ${student.academic.totalCreditsCompleted} credits.`,
  ];

  const studentFriendlyActionSteps = [
    hasBacklogs
      ? {
          id: 'step-backlog',
          title: `Attend the weekly remediation clinic for ${student.academic.backlogsCount} pending subject(s)`,
          explanation: 'Clearing backlogs early protects your campus placement eligibility for Tier-1 companies.',
          timeframe: 'This week',
        }
      : {
          id: 'step-quiz',
          title: 'Complete today\'s 10-Question Daily Subject Quiz in the Knowledge Hub',
          explanation: 'Earn +10 XP per correct question to boost your rank on the department leaderboard.',
          timeframe: 'Daily (5 mins)',
        },
    !isAttendanceGood
      ? {
          id: 'step-attendance',
          title: `Attend the next 3 theory classes to raise attendance from ${student.attendance.overallPercentage}% to 75%+`,
          explanation: 'Statutory compliance requires 75% attendance to sit for final semester examinations without special approval.',
          timeframe: 'Next 5 days',
        }
      : {
          id: 'step-placement',
          title: `Practice 2 coding/technical questions for ${student.placement.preferredDomain}`,
          explanation: `Your target track is '${student.placement.preferredDomain}'. Consistent small practice builds interview confidence.`,
          timeframe: 'By Saturday',
        },
    {
      id: 'step-mentor',
      title: `Schedule a 10-minute catch-up with your mentor ${student.mentorName}`,
      explanation: `Discuss your noted area: "${student.feedback.primaryConcernArea}". Your mentors are here to support you!`,
      timeframe: 'During office hours',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 border border-blue-200/90 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-600 to-emerald-500"></div>

      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-blue-100 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold border border-blue-200">
            <Smile className="w-4 h-4 text-blue-600" />
            <span>Student-Friendly Feedback Guide · Clear & Easy to Understand</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            How You Are Doing & Your Next Steps 🚀
          </h3>
          <p className="text-xs text-slate-600">
            Written in plain, encouraging language so you can easily understand your teachers' feedback and take action.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setViewMode('friendly')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              viewMode === 'friendly'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            😊 Simple Student View
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              viewMode === 'detailed'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📊 Detailed Metrics
          </button>
        </div>
      </div>

      {viewMode === 'friendly' ? (
        <div className="space-y-6">
          {/* 1. Overall Mentor Sentiment in Plain Words */}
          <div className="p-5 rounded-2xl bg-white border border-blue-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20 text-2xl">
                {isGpaStrong && isAttendanceGood ? '🌟' : hasBacklogs ? '🌱' : '⚡'}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Overall Mentor Summary
                </span>
                <h4 className="text-base font-black text-slate-900">
                  {isGpaStrong && isAttendanceGood
                    ? 'You are in an Outstanding Position!'
                    : hasBacklogs
                    ? 'You are Making Progress — Let\'s Focus on Your Remedial Goals!'
                    : 'Good Momentum — You are Steady & Moving Forward!'}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Faculty mentors have rated your progress at{' '}
                  <strong className="text-slate-900 font-mono">{student.feedback.facultyRating} / 5.0</strong>.
                  Your hard work in coursework and labs is recognized!
                </p>
              </div>
            </div>

            <div className="text-right shrink-0 bg-blue-50 px-4 py-2.5 rounded-2xl border border-blue-100 w-full md:w-auto">
              <div className="text-[10px] font-bold text-blue-700 uppercase">Assigned Mentor</div>
              <div className="text-xs font-bold text-slate-900">{student.mentorName}</div>
              <div className="text-[10px] text-slate-500">{student.department}</div>
            </div>
          </div>

          {/* 2. Two Columns: What You Are Doing Great vs Simple Action Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Strengths Noticed by Teachers */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>3 Things You Are Doing Great!</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  {studentFriendlyStrengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-white/90 p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span className="leading-relaxed">{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 text-[11px] text-emerald-700 font-medium">
                Keep up these positive habits! They form your foundation for placements.
              </div>
            </div>

            {/* Simple Next Steps Checklist for the Student */}
            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>Your Easy 3-Step Action Plan</span>
                </div>
                <div className="space-y-2 text-xs text-slate-800">
                  {studentFriendlyActionSteps.map((step) => {
                    const isChecked = Boolean(completedSteps[step.id]);
                    return (
                      <div
                        key={step.id}
                        onClick={() => toggleStep(step.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                          isChecked
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-white border-amber-200/80 hover:border-amber-300 shadow-2xs'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 rounded text-blue-600 cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className={`font-bold ${isChecked ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                            {step.title}
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                            {step.explanation}
                          </div>
                          <span className="inline-block mt-1 text-[9px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                            Target: {step.timeframe}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-1 text-[11px] text-amber-800 font-medium flex items-center justify-between">
                <span>Check off items as you complete them!</span>
                {onNavigateToTab && (
                  <button
                    onClick={() => onNavigateToTab('student-engagement')}
                    className="font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Go to Knowledge Hub</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 3. Personal Mentor Message & Your Confidential Voice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Direct Mentor Note */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <HeartHandshake className="w-4 h-4 text-rose-500" />
                <span>Personal Note from Your Mentor ({student.mentorName})</span>
              </div>
              <p className="text-xs text-slate-700 italic bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                "{student.feedback.advisorObservationNotes ||
                  `${student.name} is making steady progress in ${student.department}. We encourage regular attendance in all theory and practical classes.`}"
              </p>
            </div>

            {/* How your anonymous feedback is used */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Your Voice Matters (Private & Protected)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your stated concern: <strong className="text-slate-800">"{student.feedback.primaryConcernArea}"</strong> is reviewed confidentially by the department head. The college uses your feedback to adjust lab hours and provide extra coaching sessions.
              </p>
              {onNavigateToTab && (
                <div className="pt-2">
                  <button
                    onClick={() => onNavigateToTab('feedback')}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <span>Give College & Staff Feedback / View 360° Guidance</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Detailed Analytical View for Advisors / Advanced Students */
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Faculty Rating</div>
              <div className="text-lg font-black font-mono text-emerald-700">{student.feedback.facultyRating} / 5.0</div>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Student Pulse Score</div>
              <div className="text-lg font-black font-mono text-blue-700">{student.feedback.studentPulseScore} / 5.0</div>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Satisfaction Level</div>
              <div className="text-xs font-bold text-purple-700 mt-1">{student.feedback.satisfactionLevel}</div>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Composite Score</div>
              <div className="text-lg font-black font-mono text-slate-900">{student.compositeScore}/100</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-900">Advisor Diagnostic Observation:</div>
            <p className="text-slate-600 leading-relaxed">{student.feedback.advisorObservationNotes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
