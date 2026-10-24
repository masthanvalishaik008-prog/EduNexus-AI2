import React, { useState, useMemo } from 'react';
import { Student, SupportAlert, InterventionRecord, Department } from '../../types/student';
import { BarChart } from '../charts/BarChart';
import { LineTrendChart } from '../charts/LineTrendChart';
import { ScoreGauge } from '../charts/ScoreGauge';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Filter,
  Eye,
  Sparkles,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';

interface ExecutiveDashboardProps {
  students: Student[];
  alerts: SupportAlert[];
  interventions: InterventionRecord[];
  onSelectStudent: (id: string) => void;
  onNavigateToTab: (tab: any) => void;
}

export function ExecutiveDashboard({
  students,
  alerts,
  interventions,
  onSelectStudent,
  onNavigateToTab,
}: ExecutiveDashboardProps) {
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('All');

  // Filtered dataset
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchDept = selectedDept === 'All' || s.department === selectedDept;
      const matchRisk = selectedRiskFilter === 'All' || s.riskLevel === selectedRiskFilter;
      return matchDept && matchRisk;
    });
  }, [students, selectedDept, selectedRiskFilter]);

  // Aggregate Metrics
  const totalCount = filteredStudents.length;
  const avgScore = totalCount > 0
    ? Math.round(filteredStudents.reduce((acc, s) => acc + s.compositeScore, 0) / totalCount)
    : 0;
  const avgAttendance = totalCount > 0
    ? Math.round(filteredStudents.reduce((acc, s) => acc + s.attendance.overallPercentage, 0) / totalCount)
    : 0;
  const openAlertsCount = alerts.filter(a => a.status !== 'Resolved').length;

  // Department Comparison Data with vibrant custom colors
  const depts: Department[] = [
    'Electronics & Comm (ECE)',
    'Computer Science (CSE)',
    'Information Tech (IT)',
    'Electrical & Electronics (EEE)',
    'Mechanical Eng (MECH)',
  ];

  const deptChartData = depts.map((d) => {
    const dStudents = students.filter(s => s.department === d);
    const dAvg = dStudents.length > 0
      ? Math.round(dStudents.reduce((acc, s) => acc + s.compositeScore, 0) / dStudents.length)
      : 70;
    const shortLabel = d.split(' ')[0]; // ECE, CSE, etc.
    return {
      label: shortLabel,
      value: dAvg,
      highlight: selectedDept === d,
      color: dAvg >= 82 ? 'bg-purple-600' : dAvg >= 75 ? 'bg-blue-600' : dAvg >= 70 ? 'bg-teal-500' : 'bg-amber-500',
    };
  });

  // Risk Distribution counts
  const highPotentialCount = filteredStudents.filter(s => s.riskLevel === 'High Potential').length;
  const onTrackCount = filteredStudents.filter(s => s.riskLevel === 'On Track').length;
  const moderateRiskCount = filteredStudents.filter(s => s.riskLevel === 'Moderate Attention').length;
  const highSupportCount = filteredStudents.filter(s => s.riskLevel === 'High Support Needed').length;

  // Monthly Attendance Cohort Aggregate Trend
  const cohortAttendanceTrend = [
    { label: 'Week 1-4 (Aug)', value: 92 },
    { label: 'Week 5-8 (Sep)', value: 88 },
    { label: 'Week 9-12 (Oct)', value: 84 },
    { label: 'Week 13-16 (Nov)', value: 87 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Filter Bar with Attractive Indigo Glow */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800">Executive Cohort Filter</span>
            <p className="text-[11px] text-slate-500">Slice by engineering discipline and risk status tier</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Branch:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Departments ({students.length})</option>
              {depts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Status Tier:</span>
            <select
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Performance Tiers</option>
              <option value="High Potential">High Potential (&ge;82)</option>
              <option value="On Track">On Track (68-81)</option>
              <option value="Moderate Attention">Moderate Attention (52-67)</option>
              <option value="High Support Needed">High Support Needed (&lt;52)</option>
            </select>
          </div>

          {(selectedDept !== 'All' || selectedRiskFilter !== 'All') && (
            <button
              onClick={() => { setSelectedDept('All'); setSelectedRiskFilter('All'); }}
              className="px-2.5 py-1 text-xs text-blue-600 hover:text-white hover:bg-blue-600 font-semibold rounded-md border border-blue-200 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 4 Primary KPI Summary Cards with Rich Thematic Color Identity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-gradient-to-br from-white via-white to-blue-50/60 border border-blue-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider" title="Total active students enrolled and monitored across departments">
              Total Enrolled Students
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono tabular-nums text-slate-900">
            {totalCount}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-blue-700 font-medium">
            <span>Active registered undergraduate scholars</span>
          </div>
        </div>

        {/* Average Success Score */}
        <div className="bg-gradient-to-br from-white via-white to-emerald-50/60 border border-emerald-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Success Score</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono tabular-nums text-emerald-700">
            {avgScore} <span className="text-xs font-semibold text-slate-500">/ 100</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+3.2 pts gain post-midterm interventions</span>
          </div>
        </div>

        {/* Overall Attendance Rate */}
        <div className="bg-gradient-to-br from-white via-white to-cyan-50/60 border border-cyan-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-sky-600"></div>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Attendance Rate</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center shadow-xs">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono tabular-nums text-cyan-800">
            {avgAttendance}%
          </div>
          <div className="mt-1 text-[11px] text-cyan-700 font-medium">
            <span>Institutional regulatory baseline: 75%</span>
          </div>
        </div>

        {/* Support Review Count */}
        <div className="bg-gradient-to-br from-white via-white to-amber-50/60 border border-amber-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Support Reviews</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono tabular-nums text-amber-700">
            {openAlertsCount} <span className="text-xs font-semibold text-amber-600">Active Alerts</span>
          </div>
          <div className="mt-1 text-[11px] text-amber-700 font-medium">
            <span>Across {openAlertsCount} flagged scholars requiring faculty review</span>
          </div>
        </div>
      </div>

      {/* Row 2: Department Performance & Distribution Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department-wise Performance Chart */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 mb-1">
                <Award className="w-3 h-3 text-purple-600" />
                <span>Disciplinary Benchmarks</span>
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Department Performance (Average Success Score)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Aggregated composite performance across 5 engineering disciplines
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">Scale: 0 - 100</span>
          </div>

          <BarChart data={deptChartData} unit=" pts" height={200} />

          <div className="grid grid-cols-5 gap-2 mt-4 pt-4 border-t border-slate-100 text-center text-xs">
            {deptChartData.map((d, i) => (
              <div key={i} className="bg-slate-50/80 p-2 rounded-xl border border-slate-200/60">
                <div className="font-bold text-slate-800">{d.label}</div>
                <div className="font-mono tabular-nums text-blue-700 font-extrabold text-sm">{d.value} pts</div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Performance Distribution with Vibrant Progress Bars */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 mb-1">
                  <Activity className="w-3 h-3 text-indigo-600" />
                  <span>Risk Tiers</span>
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Cohort Performance Distribution
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Categorized by composite risk & potential thresholds
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* High Potential */}
              <div className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-bold text-purple-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span>High Potential (&ge;82)</span>
                  </span>
                  <span className="font-mono tabular-nums text-purple-700 font-bold">
                    {highPotentialCount} students ({Math.round((highPotentialCount / totalCount) * 100 || 0)}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-purple-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
                    style={{ width: `${(highPotentialCount / totalCount) * 100}%` }}
                  />
                </div>
              </div>

              {/* On Track */}
              <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>On Track (68 - 81)</span>
                  </span>
                  <span className="font-mono tabular-nums text-emerald-700 font-bold">
                    {onTrackCount} students ({Math.round((onTrackCount / totalCount) * 100 || 0)}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-emerald-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    style={{ width: `${(onTrackCount / totalCount) * 100}%` }}
                  />
                </div>
              </div>

              {/* Moderate Attention */}
              <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-100">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Moderate Attention (52 - 67)</span>
                  </span>
                  <span className="font-mono tabular-nums text-amber-700 font-bold">
                    {moderateRiskCount} students ({Math.round((moderateRiskCount / totalCount) * 100 || 0)}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-amber-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                    style={{ width: `${(moderateRiskCount / totalCount) * 100}%` }}
                  />
                </div>
              </div>

              {/* High Support Needed */}
              <div className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-100">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-bold text-rose-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>High Support Needed (&lt;52)</span>
                  </span>
                  <span className="font-mono tabular-nums text-rose-700 font-bold">
                    {highSupportCount} students ({Math.round((highSupportCount / totalCount) * 100 || 0)}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-rose-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-red-600 rounded-full"
                    style={{ width: `${(highSupportCount / totalCount) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Early Intervention Required:</span>
            <button
              onClick={() => onNavigateToTab('radar')}
              className="text-blue-600 hover:text-blue-700 font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View Support Radar</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Attendance Trends & Recent Intervention Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attendance Trends */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200 mb-1">
                <CalendarCheck className="w-3 h-3 text-cyan-600" />
                <span>Attendance Telemetry</span>
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Semester Cohort Attendance Trajectory
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Weekly attendance trendline against 75% regulatory compliance cutoff
              </p>
            </div>
          </div>

          <LineTrendChart
            data={cohortAttendanceTrend}
            threshold={75}
            thresholdLabel="Mandatory 75% Cutoff"
            height={200}
            color="#0284c7"
          />
        </div>

        {/* Recent Intervention Activities */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mb-1">
                  <Layers className="w-3 h-3 text-emerald-600" />
                  <span>Action Logs</span>
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Recent Intervention Activities
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Logged mentoring sessions and remedial milestone updates
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('interventions')}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
              >
                View All →
              </button>
            </div>

            <div className="space-y-3">
              {interventions.slice(0, 3).map((record) => (
                <div
                  key={record.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-sm">{record.studentName}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      record.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : record.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {record.status}
                    </span>
                  </div>
                  <div className="text-slate-600 text-xs line-clamp-1">
                    {record.type} · Lead: <span className="font-medium text-slate-800">{record.facultyLead}</span>
                  </div>
                  {record.measuredOutcomeNote && (
                    <div className="mt-2 text-xs text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-start gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Outcome: {record.measuredOutcomeNote}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-3">
            <span>Intervention Efficacy Rate: <strong className="text-emerald-700 font-bold">84.2%</strong></span>
            <button
              onClick={() => onNavigateToTab('interventions')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              + Log New Mentoring Session
            </button>
          </div>
        </div>
      </div>

      {/* Cohort Quick Table with High-Contrast Color Badges */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h3 className="text-base font-bold text-slate-900">Student Directory & Multi-Category Telemetry</h3>
            <p className="text-xs text-slate-500">Click any student to view their explainable 360° Profile</p>
          </div>
          <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
            {filteredStudents.length} Students Listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Name & Department</th>
                <th className="py-3 px-4 text-right">GPA</th>
                <th className="py-3 px-4 text-right">Attendance</th>
                <th className="py-3 px-4 text-right">LMS Completion</th>
                <th className="py-3 px-4 text-right">Coding Prep</th>
                <th className="py-3 px-4 text-center">Success Score</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((st) => (
                <tr
                  key={st.id}
                  onClick={() => {
                    onSelectStudent(st.id);
                    onNavigateToTab('profile');
                  }}
                  className="hover:bg-blue-50/60 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">{st.id}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{st.name}</div>
                    <div className="text-[11px] text-slate-500">{st.department}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-slate-800">{st.academic.gpa.toFixed(1)} / 10</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      st.attendance.overallPercentage < 75 ? 'bg-rose-100 text-rose-700' : 'text-slate-800'
                    }`}>
                      {st.attendance.overallPercentage}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 font-medium">{st.lms.moduleCompletionRate}%</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 font-medium">{st.placement.codingScore} / 100</td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-mono font-extrabold text-slate-900 text-sm">{st.compositeScore}</span>
                    <span className="text-[10px] text-slate-400">/100</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      st.riskLevel === 'High Potential'
                        ? 'bg-purple-100 text-purple-700 border-purple-200'
                        : st.riskLevel === 'On Track'
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : st.riskLevel === 'Moderate Attention'
                        ? 'bg-amber-100 text-amber-700 border-amber-200'
                        : 'bg-rose-100 text-rose-700 border-rose-200'
                    }`}>
                      {st.riskLevel}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStudent(st.id);
                        onNavigateToTab('profile');
                      }}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-bold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>360° View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
