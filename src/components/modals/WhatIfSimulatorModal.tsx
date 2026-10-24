import React, { useState } from 'react';
import { Student } from '../../types/student';
import { runWhatIfSimulation, DEFAULT_WEIGHTS } from '../../utils/scoreCalculator';
import { ScoreGauge } from '../charts/ScoreGauge';
import {
  X,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  AlertCircle,
  RotateCcw,
  Info
} from 'lucide-react';

interface WhatIfSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  currentStudentId: string;
  onSelectStudent: (id: string) => void;
}

export function WhatIfSimulatorModal({
  isOpen,
  onClose,
  students,
  currentStudentId,
  onSelectStudent,
}: WhatIfSimulatorModalProps) {
  if (!isOpen) return null;

  const student = students.find(s => s.id === currentStudentId) || students[0];

  // Simulation Sliders State
  const [attendanceDelta, setAttendanceDelta] = useState<number>(10); // +10%
  const [lmsDelta, setLmsDelta] = useState<number>(15); // +15%
  const [codingDelta, setCodingDelta] = useState<number>(25); // +25 points
  const [backlogsCleared, setBacklogsCleared] = useState<number>(student.academic.backlogsCount > 0 ? 1 : 0);

  const resetSliders = () => {
    setAttendanceDelta(0);
    setLmsDelta(0);
    setCodingDelta(0);
    setBacklogsCleared(0);
  };

  const simResult = runWhatIfSimulation(
    student.breakdown,
    {
      attendanceChange: attendanceDelta,
      lmsChange: lmsDelta,
      codingPracticeChange: codingDelta,
      backlogsCleared: backlogsCleared,
    },
    DEFAULT_WEIGHTS
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">What-If Intervention Simulator</h2>
              <p className="text-xs text-slate-500">
                Model hypothetical remediation scenarios and forecast score shifts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Selector */}
        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
          <span className="font-semibold text-slate-700">Simulate For Scholar:</span>
          <select
            value={student.id}
            onChange={(e) => onSelectStudent(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1 font-semibold text-slate-800 focus:outline-none"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.id}) — Current: {s.compositeScore} pts</option>
            ))}
          </select>
        </div>

        {/* Prominent Mandatory Simulation Disclaimer */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">Mathematical Simulation Disclaimer:</strong> Values are derived from deterministic demonstration formula assumptions, not guaranteed or statistically deterministic outcomes. For planning and guidance only.
          </div>
        </div>

        {/* Two Column Layout: Sliders Left, Result Right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Sliders Left */}
          <div className="md:col-span-7 space-y-4 text-xs">
            {/* Slider 1: Attendance */}
            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">Attendance Gain (% points):</span>
                <span className="font-mono font-bold text-blue-600">
                  {attendanceDelta >= 0 ? `+${attendanceDelta}%` : `${attendanceDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min="-15"
                max="30"
                step="1"
                value={attendanceDelta}
                onChange={(e) => setAttendanceDelta(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>-15%</span>
                <span>Current: {student.attendance.overallPercentage}%</span>
                <span>+30%</span>
              </div>
            </div>

            {/* Slider 2: LMS Completion */}
            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">LMS Module Completion Gain:</span>
                <span className="font-mono font-bold text-indigo-600">
                  {lmsDelta >= 0 ? `+${lmsDelta}%` : `${lmsDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="40"
                step="1"
                value={lmsDelta}
                onChange={(e) => setLmsDelta(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>-20%</span>
                <span>Current: {student.lms.moduleCompletionRate}%</span>
                <span>+40%</span>
              </div>
            </div>

            {/* Slider 3: Coding Practice */}
            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">Placement Coding Boost (pts):</span>
                <span className="font-mono font-bold text-emerald-600">
                  +{codingDelta} pts
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={codingDelta}
                onChange={(e) => setCodingDelta(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0 pts</span>
                <span>Current: {student.placement.codingScore}/100</span>
                <span>+50 pts</span>
              </div>
            </div>

            {/* Selector 4: Backlogs Cleared */}
            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">Backlogs Remediated / Cleared:</span>
                <span className="font-mono font-bold text-purple-600">
                  {backlogsCleared} {backlogsCleared === 1 ? 'subject' : 'subjects'}
                </span>
              </div>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setBacklogsCleared(val)}
                    className={`flex-1 py-1 text-xs font-mono rounded border transition-colors ${
                      backlogsCleared === val
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={resetSliders}
                className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Simulation Sliders</span>
              </button>
            </div>
          </div>

          {/* Results Comparison Right */}
          <div className="md:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Projected Outcome
            </div>

            <ScoreGauge score={simResult.projectedBreakdown.compositeScore} size={110} strokeWidth={9} showSubtitle={false} />

            <div className="mt-3">
              <div className="text-xs font-bold text-slate-800">
                Projected Success Score: {simResult.projectedBreakdown.compositeScore}/100
              </div>
              <div className={`text-xs font-semibold mt-1 flex items-center justify-center gap-1 ${
                simResult.netScoreGain >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                <TrendingUp className="w-3.5 h-3.5" />
                <span>
                  {simResult.netScoreGain >= 0 ? `+${simResult.netScoreGain}` : simResult.netScoreGain} pts from baseline ({student.compositeScore})
                </span>
              </div>
              <div className="mt-2 text-[11px] font-medium text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                New Tier: <strong>{simResult.projectedRiskLevel}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-lg shadow-xs"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
}
