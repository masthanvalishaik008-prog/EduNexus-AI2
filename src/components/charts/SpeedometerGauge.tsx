import React from 'react';
import { motion } from 'motion/react';
import { Flame, Award, Zap, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { evaluateStudentStreak } from '../../utils/speedometerUtils';

interface SpeedometerGaugeProps {
  streakDays: number;
  lastLoginDate?: string;
  maxDays?: number;
  studentName?: string;
}

export function SpeedometerGauge({
  streakDays,
  lastLoginDate,
  maxDays = 30,
  studentName = 'Student',
}: SpeedometerGaugeProps) {
  // Evaluate the real streak based on 24h calendar logic
  const evaluation = evaluateStudentStreak(lastLoginDate, streakDays);
  const currentStreak = Math.max(0, Math.min(maxDays, evaluation.effectiveStreak));
  const percentage = currentStreak / maxDays;

  // Gauge angle calculation (Speedometer arc from -135deg to +135deg = 270 total degrees)
  const angle = -135 + percentage * 270;

  // Color tier based on effective streak
  const tierColor =
    currentStreak >= 21
      ? 'from-emerald-500 to-teal-600 text-emerald-700 bg-emerald-50 border-emerald-200'
      : currentStreak >= 10
      ? 'from-blue-600 to-indigo-600 text-blue-700 bg-blue-50 border-blue-200'
      : currentStreak >= 1
      ? 'from-amber-500 to-orange-600 text-amber-700 bg-amber-50 border-amber-200'
      : 'from-slate-400 to-slate-500 text-slate-600 bg-slate-100 border-slate-300';

  const tierLabel =
    currentStreak >= 21
      ? '🔥 Elite Consistency (21+ Days)'
      : currentStreak >= 10
      ? '⚡ Regular Momentum (10+ Days)'
      : currentStreak >= 1
      ? `🌱 Building Streak (Day ${currentStreak})`
      : '⚠️ Speedometer at 0 (Missed Day)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-gradient-to-br from-white via-slate-50 to-blue-50/40 border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col items-center justify-between relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-blue-600 to-emerald-500"></div>

      {/* Header */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Flame className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-slate-900 tracking-tight">Daily Login Speedometer</h4>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-full border border-slate-200 font-bold">
                Automated 24h Tracker
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Measures consecutive portal logins: login today = 1, tomorrow = 2. If you miss a day, dial resets to 0.
            </p>
          </div>
        </div>

        <span className={`text-xs font-black px-3 py-1 rounded-full border shadow-2xs ${tierColor}`}>
          {tierLabel}
        </span>
      </div>

      {/* Speedometer SVG Dial */}
      <div className="relative w-64 h-36 flex items-center justify-center my-2">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 200 120">
          {/* Background Arc */}
          <path
            d="M 25 105 A 75 75 0 1 1 175 105"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Colored Progress Arc */}
          <path
            d="M 25 105 A 75 75 0 1 1 175 105"
            fill="none"
            stroke="url(#speedometerGradient)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray="235.6"
            strokeDashoffset={235.6 * (1 - percentage)}
            className="transition-all duration-700 ease-out"
          />

          <defs>
            <linearGradient id="speedometerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" /> {/* Amber */}
              <stop offset="50%" stopColor="#2563eb" /> {/* Blue */}
              <stop offset="100%" stopColor="#059669" /> {/* Emerald */}
            </linearGradient>
          </defs>

          {/* Ticks and numeric marks */}
          {[
            { pt: 0, label: '0' },
            { pt: 0.25, label: '7d' },
            { pt: 0.5, label: '15d' },
            { pt: 0.75, label: '21d' },
            { pt: 1.0, label: '30d' },
          ].map((mark, idx) => {
            const tickAngle = -135 + mark.pt * 270;
            const rad = (tickAngle * Math.PI) / 180;
            const x1 = 100 + 62 * Math.cos(rad);
            const y1 = 105 + 62 * Math.sin(rad);
            const x2 = 100 + 72 * Math.cos(rad);
            const y2 = 105 + 72 * Math.sin(rad);
            const textX = 100 + 82 * Math.cos(rad);
            const textY = 105 + 82 * Math.sin(rad);

            return (
              <g key={idx}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#64748b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <text
                  x={textX}
                  y={textY}
                  fontSize="7"
                  fill="#94a3b8"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontWeight="bold"
                >
                  {mark.label}
                </text>
              </g>
            );
          })}

          {/* Needle Pivot & Needle */}
          <g transform={`rotate(${angle} 100 105)`} className="transition-transform duration-700 ease-out">
            <polygon points="100,24 95,110 105,110" fill="#0f172a" />
            <circle cx="100" cy="105" r="5" fill="#2563eb" />
          </g>

          {/* Center Pin Hub */}
          <circle cx="100" cy="105" r="3" fill="#ffffff" />
        </svg>

        {/* Digital Readout in center of speedometer */}
        <div className="absolute bottom-2 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-3xl font-black font-mono text-slate-900 tracking-tight flex items-baseline">
            {currentStreak}
            <span className="text-xs font-bold text-slate-500 ml-1.5 uppercase tracking-wider">Days</span>
          </div>
          <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500 inline" />
            Daily Streak
          </div>
        </div>
      </div>

      {/* Explanatory 24h Status Banner */}
      <div className="w-full mt-2 p-3 rounded-2xl bg-white/90 border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2 text-xs text-slate-700">
          {evaluation.effectiveStreak > 0 ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span className="font-semibold">{evaluation.statusText}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span>Last logged: <strong>{evaluation.lastLoginFormatted}</strong></span>
        </div>
      </div>
    </motion.div>
  );
}
