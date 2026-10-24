import React, { useState } from 'react';
import { Student, SupportAlert } from '../../types/student';
import { exportStudentSuccessReportPdf, getStudentSuccessReportPdfBlob } from '../../utils/pdfReportGenerator';
import {
  X,
  FileDown,
  Printer,
  Calendar,
  User,
  CheckCircle2,
  FileText,
  Sliders,
  Sparkles,
  ShieldCheck,
  Award,
  AlertTriangle,
  Download
} from 'lucide-react';

interface StudentReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  alerts?: SupportAlert[];
}

export function StudentReportExportModal({
  isOpen,
  onClose,
  student,
  alerts = [],
}: StudentReportExportModalProps) {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const [meetingType, setMeetingType] = useState<string>('Faculty Advisory 1-on-1 Review & Placement Audit');
  const [meetingDate, setMeetingDate] = useState<string>(todayStr);
  const [advisorName, setAdvisorName] = useState<string>(student.mentorName || 'Faculty Advisor');
  const [customNotes, setCustomNotes] = useState<string>(
    student.feedback.advisorObservationNotes ||
      `Student reviewed during mid-semester consultation. Attendance at ${student.attendance.overallPercentage}%, CGPA ${student.academic.gpa.toFixed(1)}/10. Recommended technical coding reinforcement in ${student.placement.preferredDomain}.`
  );

  const [includeActionPlan, setIncludeActionPlan] = useState<boolean>(true);
  const [includeBreakdownTable, setIncludeBreakdownTable] = useState<boolean>(true);
  const [includeSignatures, setIncludeSignatures] = useState<boolean>(true);

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportedSuccess, setExportedSuccess] = useState<boolean>(false);

  const formattedDate = new Date(meetingDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleDownload = () => {
    setIsExporting(true);
    try {
      exportStudentSuccessReportPdf(student, {
        meetingType,
        meetingDate: formattedDate,
        advisorName,
        customNotes,
        includeActionPlan,
        includeBreakdownTable,
        includeSignatures,
        alerts,
      });
      setExportedSuccess(true);
      setTimeout(() => setExportedSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintOrPreview = () => {
    try {
      const blobUrl = getStudentSuccessReportPdfBlob(student, {
        meetingType,
        meetingDate: formattedDate,
        advisorName,
        customNotes,
        includeActionPlan,
        includeBreakdownTable,
        includeSignatures,
        alerts,
      });
      const printWindow = window.open(blobUrl);
      if (printWindow) {
        printWindow.focus();
      }
    } catch (err) {
      console.error('Failed to open PDF preview:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Export Student Success Report
                </h3>
                <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">
                  PDF Format
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate an institutional dossier for faculty advisory reviews, placement meetings, and academic boards.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Quick Bio Card */}
        <div className="bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50 rounded-2xl p-3.5 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-sm">{student.name}</span>
              <span className="font-mono text-slate-500 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                {student.id}
              </span>
            </div>
            <div className="text-slate-600 mt-0.5">
              {student.department} · Semester {student.semester} ({student.batch})
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Success Score</div>
              <div className="font-mono font-black text-slate-900 text-sm">
                {student.compositeScore}/100
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Attendance</div>
              <div
                className={`font-mono font-black text-sm ${
                  student.attendance.overallPercentage < 75 ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {student.attendance.overallPercentage}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-bold uppercase">CGPA</div>
              <div className="font-mono font-black text-slate-900 text-sm">
                {student.academic.gpa.toFixed(1)}/10
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Configuration Form */}
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Meeting Type / Purpose</span>
              </label>
              <select
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="Faculty Advisory 1-on-1 Review & Placement Audit">
                  Faculty Advisory 1-on-1 Review & Placement Audit
                </option>
                <option value="Remedial Coursework & Attendance Review Board">
                  Remedial Coursework & Attendance Review Board
                </option>
                <option value="Placement Readiness & Industry Track Evaluation">
                  Placement Readiness & Industry Track Evaluation
                </option>
                <option value="Mid-Semester Academic Progress Assessment">
                  Mid-Semester Academic Progress Assessment
                </option>
                <option value="Parent-Faculty Advisory Consultation">
                  Parent-Faculty Advisory Consultation
                </option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Meeting Date</span>
              </label>
              <input
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Faculty Mentor / Advisor Name</span>
              </label>
              <input
                type="text"
                value={advisorName}
                onChange={(e) => setAdvisorName(e.target.value)}
                placeholder="Dr. S. Ramanujan"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Student Risk Category</span>
              </label>
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold flex items-center justify-between">
                <span>{student.riskLevel}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {student.academic.backlogsCount > 0 ? `${student.academic.backlogsCount} backlog(s)` : 'Zero backlogs'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span>Faculty Advisor Meeting Directives & Notes</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Appears on printed document
              </span>
            </label>
            <textarea
              rows={3}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Enter specific advisory discussion points, student commitments, or action items discussed during the meeting..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Report Sections Customizer */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <div className="font-bold text-slate-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Included Report Sections</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer p-2 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
                <input
                  type="checkbox"
                  checked={includeBreakdownTable}
                  onChange={(e) => setIncludeBreakdownTable(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px]">7-Pillars Table</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer p-2 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
                <input
                  type="checkbox"
                  checked={includeActionPlan}
                  onChange={(e) => setIncludeActionPlan(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px]">4-Week Action Plan</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer p-2 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
                <input
                  type="checkbox"
                  checked={includeSignatures}
                  onChange={(e) => setIncludeSignatures(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px]">Signature Blocks</span>
              </label>
            </div>
          </div>
        </div>

        {/* Success Banner if exported */}
        {exportedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">
              PDF report successfully generated and downloaded! Ready for faculty review meeting.
            </span>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>FERPA Compliant · Generated via EduNexus Engine</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={handlePrintOrPreview}
              type="button"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors border border-slate-200 cursor-pointer"
              title="Open print preview dialog"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Preview / Print</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Download className="w-3.5 h-3.5 animate-bounce" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download PDF Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
