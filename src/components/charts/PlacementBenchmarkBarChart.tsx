import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { PlacementBenchmarkDataPoint } from '../../types/student';
import { Target, TrendingUp, CheckCircle2, AlertCircle, BarChart3, Info } from 'lucide-react';

interface PlacementBenchmarkBarChartProps {
  data: PlacementBenchmarkDataPoint[];
  studentName?: string;
  branchName?: string;
  height?: number;
}

export function PlacementBenchmarkBarChart({
  data,
  studentName = 'Candidate',
  branchName = 'Branch',
  height = 340,
}: PlacementBenchmarkBarChartProps) {
  const [comparisonMode, setComparisonMode] = useState<'all' | 'vsBenchmark' | 'vsAverage'>('all');

  // Custom sleek tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: PlacementBenchmarkDataPoint | undefined = payload[0]?.payload;
      const studentVal = dataPoint?.studentScore ?? 0;
      const benchVal = dataPoint?.industryBenchmark ?? 0;
      const avgVal = dataPoint?.branchAverage ?? 0;
      const gap = studentVal - benchVal;
      const isQualified = studentVal >= benchVal;

      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl border border-slate-700 shadow-2xl text-xs space-y-2 min-w-[210px] animate-in fade-in duration-200">
          <div className="font-extrabold text-white text-sm border-b border-slate-800 pb-1.5 flex items-center justify-between">
            <span>{label}</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isQualified
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {isQualified ? 'Qualified' : `${gap}% Deficit`}
            </span>
          </div>

          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-500 inline-block" />
                <span>{studentName}&apos;s Score:</span>
              </span>
              <strong className="font-mono text-purple-300 font-bold">{studentVal}%</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
                <span>Industry Benchmark:</span>
              </span>
              <strong className="font-mono text-amber-300 font-bold">{benchVal}%</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-500 inline-block" />
                <span>{branchName.split(' ')[0]} Batch Avg:</span>
              </span>
              <strong className="font-mono text-slate-300 font-bold">{avgVal}%</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center gap-1">
            <Info className="w-3 h-3 text-purple-400 shrink-0" />
            <span>
              {gap >= 0
                ? `Exceeds corporate hiring cutoff by +${gap}%.`
                : `Requires ${Math.abs(gap)}% target recovery to clear campus screening.`}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const qualifiedCount = data.filter((d) => d.studentScore >= d.industryBenchmark).length;
  const bestCompetency = [...data].sort((a, b) => b.gap - a.gap)[0];
  const focusCompetency = [...data].sort((a, b) => a.gap - b.gap)[0];

  return (
    <div className="space-y-4">
      {/* Chart Toolbar: Mode Toggle & Qualified Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <span>Comparison View:</span>
          </span>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setComparisonMode('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                comparisonMode === 'all'
                  ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Full 3-Way Triangulation
            </button>
            <button
              onClick={() => setComparisonMode('vsBenchmark')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                comparisonMode === 'vsBenchmark'
                  ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Vs. Industry Cutoff
            </button>
            <button
              onClick={() => setComparisonMode('vsAverage')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                comparisonMode === 'vsAverage'
                  ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Vs. Branch Batch Avg
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
            {qualifiedCount} / {data.length} Qualified
          </span>
        </div>
      </div>

      {/* RECHARTS RESPONSIVE CONTAINER */}
      <div className="w-full bg-slate-50/50 dark:bg-slate-800/40 p-3 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 15, left: -15, bottom: 25 }}
            barCategoryGap="22%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} vertical={false} />
            <XAxis
              dataKey="competency"
              tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
              interval={0}
              angle={-15}
              textAnchor="end"
              height={45}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: 12, fontSize: 11, fontWeight: 700 }}
            />
            <ReferenceLine y={75} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Campus Cutoff 75%', fill: '#d97706', fontSize: 10, position: 'insideTopLeft' }} />

            {/* Candidate Bar */}
            <Bar
              dataKey="studentScore"
              name={`${studentName} (Candidate)`}
              fill="#7c3aed"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />

            {/* Industry Benchmark Bar */}
            {(comparisonMode === 'all' || comparisonMode === 'vsBenchmark') && (
              <Bar
                dataKey="industryBenchmark"
                name="Top Recruiter Benchmark"
                fill="#f59e0b"
                radius={[6, 6, 0, 0]}
                maxBarSize={28}
              />
            )}

            {/* Branch Batch Average Bar */}
            {(comparisonMode === 'all' || comparisonMode === 'vsAverage') && (
              <Bar
                dataKey="branchAverage"
                name={`${branchName.split(' ')[0]} Batch Average`}
                fill="#94a3b8"
                radius={[6, 6, 0, 0]}
                maxBarSize={28}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Strategic Competency Diagnostic Footnotes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {bestCompetency && (
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/90 text-emerald-950 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Prime Competitive Advantage:</div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                <strong className="text-slate-900">{bestCompetency.competency}</strong> ({bestCompetency.studentScore}%) exceeds industry cutoff by{' '}
                <strong className="text-emerald-700">+{bestCompetency.gap}%</strong>. Prominently showcase in corporate interviews.
              </div>
            </div>
          </div>
        )}

        {focusCompetency && focusCompetency.gap < 0 && (
          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/90 text-rose-950 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Priority Remedial Objective:</div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                <strong className="text-slate-900">{focusCompetency.competency}</strong> ({focusCompetency.studentScore}%) is{' '}
                <strong className="text-rose-700">{Math.abs(focusCompetency.gap)}% below cutoff</strong>. Complete recommended branch Skill-Up drills.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
