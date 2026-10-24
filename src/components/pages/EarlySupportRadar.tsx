import React, { useState, useMemo } from 'react';
import { SupportAlert, AlertPriority, InterventionStatus, Student } from '../../types/student';
import { isSameBranch } from '../../data/collegeDatabase';
import { verifyAlertConsistency } from '../../utils/radarConditions';
import { DetailModal } from '../modals/DetailModal';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
  Search,
  Filter,
  Info,
  Calendar,
  Sparkles,
  ArrowRight,
  X,
  FileText,
  Flame,
  Activity,
  Layers,
  GraduationCap,
  Building,
  Check
} from 'lucide-react';

interface EarlySupportRadarProps {
  alerts: SupportAlert[];
  onUpdateAlert: (updated: SupportAlert) => void;
  onSelectStudent: (studentId: string) => void;
  onNavigateToInterventionWithStudent?: (studentId: string) => void;
  students?: Student[];
  userRole?: string;
  userDepartment?: string;
  isCrossBranchAdmin?: boolean;
}

const ALL_BRANCHES = [
  'All',
  'Computer Science (CSE)',
  'Electronics & Comm (ECE)',
  'Information Tech (IT)',
  'Electrical & Electronics (EEE)',
  'Mechanical Eng (MECH)',
];

export function EarlySupportRadar({
  alerts,
  onUpdateAlert,
  onSelectStudent,
  onNavigateToInterventionWithStudent,
  students = [],
  userRole,
  userDepartment,
  isCrossBranchAdmin = false,
}: EarlySupportRadarProps) {
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [branchFilter, setBranchFilter] = useState<string>(() => {
    if (userDepartment && !isCrossBranchAdmin) {
      return userDepartment;
    }
    return 'All';
  });
  const [activeReviewAlert, setActiveReviewAlert] = useState<SupportAlert | null>(null);
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [reviewStatus, setReviewStatus] = useState<InterventionStatus>('In Review');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailStudentId, setDetailStudentId] = useState<string>('');

  const openReviewModal = (alert: SupportAlert) => {
    setActiveReviewAlert(alert);
    setReviewNotes(alert.facultyNotes || '');
    setReviewStatus(alert.status);
  };

  const handleSaveReview = () => {
    if (!activeReviewAlert) return;
    const updated: SupportAlert = {
      ...activeReviewAlert,
      facultyNotes: reviewNotes,
      status: reviewStatus,
    };
    onUpdateAlert(updated);
    setActiveReviewAlert(null);
  };

  // Branch and condition filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const matchBranch = branchFilter === 'All' || isSameBranch(a.department, branchFilter);
      const matchPriority = 
        priorityFilter === 'All' || 
        a.priority === priorityFilter || 
        (priorityFilter === 'Medium' && (a.priority === 'Medium' || a.priority === 'Low'));
      const matchCategory = categoryFilter === 'All' || a.triggerCategory === categoryFilter;
      return matchBranch && matchPriority && matchCategory;
    });
  }, [alerts, branchFilter, priorityFilter, categoryFilter]);

  // Branch statistics summary across all 5 branches
  const branchSummaries = useMemo(() => {
    return ALL_BRANCHES.filter((b) => b !== 'All').map((branch) => {
      const branchAlerts = alerts.filter((a) => isSameBranch(a.department, branch));
      const urgentCount = branchAlerts.filter((a) => a.priority === 'Urgent').length;
      const highCount = branchAlerts.filter((a) => a.priority === 'High').length;
      return {
        branch,
        total: branchAlerts.length,
        urgent: urgentCount,
        high: highCount,
      };
    });
  }, [alerts]);

  return (
    <div className="space-y-6 pb-12">
      {/* Ethical Safeguard Banner with Strict Academic Protocol */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50/30 border border-blue-200/90 rounded-2xl p-5 flex items-start gap-3.5 shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-blue-500/25">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="text-xs text-blue-900 leading-relaxed flex-1">
          <div className="font-extrabold flex flex-wrap items-center gap-2 text-sm text-blue-950">
            <span>Early Support Radar · Strict Academic Condition Verification</span>
            <span className="text-[10px] font-mono font-bold bg-blue-200/80 text-blue-900 px-2.5 py-0.5 rounded-full border border-blue-300">
              100% 360° Profile Matched
            </span>
            <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
              Backlogs & Semester GPA Drop Engine
            </span>
          </div>
          <p className="mt-1 text-blue-800 text-xs leading-relaxed">
            All radar flags are strictly derived from verified student 360° academic records: active backlogs count and semester GPA drop trajectory. Formative diagnostic indicators initiate immediate 1-on-1 faculty mentorship and remedial clinics.
          </p>
        </div>
      </div>

      {/* Branch Selector Filter Strip for Staff & Higher Officials */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Department Branch Radar Scope:
            </span>
            <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
              {branchFilter === 'All' ? 'Institutional Overview (All 5 Branches)' : branchFilter}
            </span>
          </div>

          <div className="text-xs text-slate-500">
            {isCrossBranchAdmin ? 'Higher Official Multi-Branch Access' : `Assigned Department: ${userDepartment || 'Staff Scope'}`}
          </div>
        </div>

        {/* Branch Quick Switch Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {ALL_BRANCHES.map((branch) => {
            const isSelected = branchFilter === branch;
            const count = branch === 'All'
              ? alerts.length
              : alerts.filter((a) => isSameBranch(a.department, branch)).length;

            return (
              <button
                key={branch}
                onClick={() => setBranchFilter(branch)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/25'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <span>{branch === 'All' ? 'All Branches' : branch.replace(/\s*\(.*\)/, '')}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Early Support Radar Summary KPI Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div 
          onClick={() => { setPriorityFilter('All'); }}
          className={`bg-white border rounded-2xl p-4 shadow-xs relative overflow-hidden cursor-pointer transition-all ${priorityFilter === 'All' ? 'ring-2 ring-blue-500 border-blue-400' : 'border-slate-200/90 hover:border-blue-400'}`}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600"></div>
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Total Flagged Members</span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {filteredAlerts.length} <span className="text-xs font-semibold text-slate-500">Members</span>
          </div>
          <div className="text-[11px] text-blue-700 font-medium mt-0.5">Click to view all</div>
        </div>

        <div 
          onClick={() => { setPriorityFilter('Urgent'); }}
          className={`bg-white border rounded-2xl p-4 shadow-xs relative overflow-hidden bg-gradient-to-br from-white to-rose-50/20 cursor-pointer transition-all ${priorityFilter === 'Urgent' ? 'ring-2 ring-rose-500 border-rose-400' : 'border-rose-200/90 hover:border-rose-400'}`}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500"></div>
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">Urgent Priority</span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-rose-700">
            {filteredAlerts.filter(a => a.priority === 'Urgent').length} <span className="text-xs font-semibold text-rose-600">{filteredAlerts.filter(a => a.priority === 'Urgent').length === 1 ? 'Member' : 'Members'}</span>
          </div>
          <div className="text-[11px] text-rose-700 font-medium mt-0.5">Backlogs & Severe GPA Drop</div>
        </div>

        <div 
          onClick={() => { setPriorityFilter('High'); }}
          className={`bg-white border rounded-2xl p-4 shadow-xs relative overflow-hidden bg-gradient-to-br from-white to-amber-50/20 cursor-pointer transition-all ${priorityFilter === 'High' ? 'ring-2 ring-amber-500 border-amber-400' : 'border-amber-200/90 hover:border-amber-400'}`}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">High Priority</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-amber-700">
            {filteredAlerts.filter(a => a.priority === 'High').length} <span className="text-xs font-semibold text-amber-600">{filteredAlerts.filter(a => a.priority === 'High').length === 1 ? 'Member' : 'Members'}</span>
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-0.5">Active Backlog Pending</div>
        </div>

        <div 
          onClick={() => { setPriorityFilter('Medium'); }}
          className={`bg-white border rounded-2xl p-4 shadow-xs relative overflow-hidden bg-gradient-to-br from-white to-indigo-50/20 cursor-pointer transition-all ${priorityFilter === 'Medium' ? 'ring-2 ring-indigo-500 border-indigo-400' : 'border-indigo-200/90 hover:border-indigo-400'}`}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500"></div>
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800">Medium Priority</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-indigo-700">
            {filteredAlerts.filter(a => a.priority === 'Medium' || a.priority === 'Low').length} <span className="text-xs font-semibold text-indigo-600">Members</span>
          </div>
          <div className="text-[11px] text-indigo-700 font-medium mt-0.5">Semester GPA Trajectory Drop</div>
        </div>
      </div>

      {/* Filter and Control Strip */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">Filter Active Radar Signals:</span>
              <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                Showing {filteredAlerts.length} Flagged Members
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Strict academic conditions: active backlogs and semester GPA decline</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Priorities ({alerts.length})</option>
              <option value="Urgent">Urgent ({alerts.filter(a => a.priority === 'Urgent').length})</option>
              <option value="High">High ({alerts.filter(a => a.priority === 'High').length})</option>
              <option value="Medium">Medium ({alerts.filter(a => a.priority === 'Medium').length})</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Domain:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Compound">Compound (Backlog & Severe Drop)</option>
              <option value="Academic">Academic Backlog / Drop</option>
            </select>
          </div>

          {(priorityFilter !== 'All' || categoryFilter !== 'All' || branchFilter !== 'All') && (
            <button
              onClick={() => {
                setPriorityFilter('All');
                setCategoryFilter('All');
                setBranchFilter('All');
              }}
              className="px-2.5 py-1 text-xs text-blue-600 hover:text-white hover:bg-blue-600 font-bold rounded-lg border border-blue-200 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs shadow-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <div className="font-bold text-slate-900 text-base">No Active Alerts In This View</div>
            <p className="mt-1 text-slate-500">All flagged students under this criteria have been addressed or cleared the academic condition.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isUrgent = alert.priority === 'Urgent';
            const isHigh = alert.priority === 'High';
            const cardBorder = isUrgent
              ? 'border-rose-200 bg-white hover:border-rose-400'
              : isHigh
              ? 'border-amber-200 bg-white hover:border-amber-400'
              : 'border-slate-200 bg-white hover:border-blue-400';

            const topBar = isUrgent
              ? 'bg-rose-500'
              : isHigh
              ? 'bg-amber-500'
              : 'bg-blue-600';

            // Match with authoritative student record
            const studentRecord = students.find((s) => s.id === alert.studentId);
            const conditionCheck = verifyAlertConsistency(alert, studentRecord);

            return (
              <div
                key={alert.id}
                className={`border rounded-2xl p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden ${cardBorder}`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${topBar}`} />
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shadow-xs ${
                          isUrgent
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : isHigh
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-blue-100 text-blue-800 border-blue-300'
                        }`}
                      >
                        {alert.priority} Priority
                      </span>
                      <span className="text-xs font-mono text-slate-500 font-semibold">{alert.id}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded">
                        {alert.triggerCategory} Signal
                      </span>
                      {conditionCheck.isConsistent && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>100% 360° Profile Matched</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-1.5 flex flex-wrap items-center gap-2">
                      <span>{alert.title}</span>
                      <span className="text-slate-400 font-normal">—</span>
                      <button
                        onClick={() => onSelectStudent(alert.studentId)}
                        className="text-blue-600 hover:text-blue-800 font-extrabold hover:underline cursor-pointer"
                        title="Click to open this student's 360° Profile"
                      >
                        {alert.studentName} ({alert.studentId})
                      </button>
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {alert.department} · Lead Advisor: <strong className="text-slate-700">{alert.assignedFaculty}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        alert.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : alert.status === 'Session Scheduled' || alert.status === 'Action Plan Active'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {alert.status}
                    </span>

                    <button
                      onClick={() => {
                        setDetailStudentId(alert.studentId);
                        setDetailModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Deep-Dive Risk Breakdown</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => openReviewModal(alert)}
                      className="px-3.5 py-1.5 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      Review & Take Action
                    </button>
                  </div>
                </div>

                {/* Strict Academic Condition Verified Badge Strip */}
                {studentRecord && (
                  <div className="mb-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-slate-600" />
                        <span className="text-slate-600 font-medium">Active Backlogs:</span>
                        <span className={`font-mono font-bold ${studentRecord.academic.backlogsCount > 0 ? 'text-rose-600 font-black' : 'text-slate-800'}`}>
                          {studentRecord.academic.backlogsCount} {studentRecord.academic.backlogsCount === 1 ? 'Course' : 'Courses'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-600 font-medium">Semester GPA:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {studentRecord.academic.gpa.toFixed(2)}
                        </span>
                        <span className="text-slate-400">vs</span>
                        <span className="text-slate-600">Prev {studentRecord.academic.previousSemesterGpa.toFixed(2)}</span>
                        <span className="font-mono font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          -{(studentRecord.academic.previousSemesterGpa - studentRecord.academic.gpa).toFixed(2)} drop
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectStudent(alert.studentId)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer ml-auto"
                    >
                      <span>Open 360° Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Evidence & Suggested Action Strips */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 p-3.5 bg-white/90 rounded-xl text-xs border border-slate-200/80 shadow-xs">
                  <div>
                    <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                      <Info className="w-4 h-4 text-blue-600" />
                      <span>Underlying Evidence (Strict Academic Check)</span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">{alert.evidence}</p>
                  </div>

                  <div>
                    <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Suggested Support Recommendation</span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">{alert.suggestedAction}</p>
                  </div>
                </div>

                {alert.facultyNotes && (
                  <div className="mt-3 text-xs bg-amber-50/80 border border-amber-200 p-3 rounded-xl text-amber-900 font-medium">
                    <span className="font-bold">Faculty Review Notes:</span> {alert.facultyNotes}
                  </div>
                )}

                {alert.outcomeMetric && (
                  <div className="mt-2 text-[11px] font-mono text-slate-500 font-medium">
                    Target Recovery Metric: <strong className="text-slate-700">{alert.outcomeMetric}</strong>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Faculty Review Modal */}
      {activeReviewAlert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">Faculty Support Alert Review</h3>
                <p className="text-xs text-slate-500">
                  {activeReviewAlert.studentName} ({activeReviewAlert.studentId}) · {activeReviewAlert.department}
                </p>
              </div>
              <button
                onClick={() => setActiveReviewAlert(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800">Alert Title:</span> {activeReviewAlert.title}
                <div className="text-slate-600 mt-1">{activeReviewAlert.evidence}</div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Update Follow-up Status:</label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value as InterventionStatus)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="New">New (Pending Review)</option>
                  <option value="In Review">In Review (Discussing with Mentor)</option>
                  <option value="Session Scheduled">Session Scheduled (Meeting Booked)</option>
                  <option value="Action Plan Active">Action Plan Active (Remedial in Progress)</option>
                  <option value="Resolved">Resolved (Milestone Cleared)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Faculty Confidential Observations & Remedial Plan:
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Enter mentor discussion notes, remedial topics assigned, or parental communication logs..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {onNavigateToInterventionWithStudent && (
                <button
                  type="button"
                  onClick={() => {
                    const sid = activeReviewAlert.studentId;
                    setActiveReviewAlert(null);
                    onNavigateToInterventionWithStudent(sid);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  Schedule Formal Mentoring Log →
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setActiveReviewAlert(null)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveReview}
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Save Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal for Deep-Dive Risk Breakdown */}
      <DetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        modalType="risk_breakdown"
        targetId={detailStudentId}
      />
    </div>
  );
}
