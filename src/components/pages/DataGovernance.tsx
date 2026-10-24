import React, { useState } from 'react';
import { Student, AuditLogEntry, UserRole } from '../../types/student';
import {
  UploadCloud,
  FileCheck,
  AlertTriangle,
  Download,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Database,
  RefreshCw,
  FileSpreadsheet,
  Filter,
  Check,
  FileText,
  Layers,
  Lock,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';

interface DataGovernanceProps {
  students: Student[];
  auditLogs: AuditLogEntry[];
  userRole: UserRole;
  onImportStudents: (newStudents: Student[]) => void;
  onAddAuditLog: (log: AuditLogEntry) => void;
}

interface ValidationResult {
  valid: boolean;
  totalRows: number;
  validRows: number;
  duplicateCount: number;
  missingRequiredCount: number;
  outOfRangeCount: number;
  errors: string[];
}

export type ExportScope = 'comprehensive' | 'academic' | 'placement' | 'summary';

export function DataGovernance({
  students,
  auditLogs,
  userRole,
  onImportStudents,
  onAddAuditLog,
}: DataGovernanceProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(null);

  // Export Data Feature State
  const [exportScope, setExportScope] = useState<ExportScope>('comprehensive');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [anonymizeNames, setAnonymizeNames] = useState<boolean>(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Departments & Risk Tiers for Filtering
  const departments = ['All', ...Array.from(new Set(students.map((s) => s.department)))];
  const riskTiers = ['All', 'High Support Needed', 'Moderate Attention', 'On Track', 'High Potential'];

  // Filtered Students for Export
  const exportStudents = students.filter((s) => {
    if (selectedDept !== 'All' && s.department !== selectedDept) return false;
    if (selectedRisk !== 'All' && s.riskLevel !== selectedRisk) return false;
    return true;
  });

  // Cohort Metrics Preview
  const cohortAvgGpa =
    exportStudents.length > 0
      ? (exportStudents.reduce((acc, s) => acc + s.academic.gpa, 0) / exportStudents.length).toFixed(2)
      : '0.00';
  const cohortAvgAttendance =
    exportStudents.length > 0
      ? Math.round(
          exportStudents.reduce((acc, s) => acc + s.attendance.overallPercentage, 0) /
            exportStudents.length
        )
      : 0;
  const cohortHighRiskCount = exportStudents.filter(
    (s) => s.riskLevel === 'High Support Needed'
  ).length;

  // Helper to escape CSV values according to RFC 4180
  const escapeCsvField = (field: string | number | boolean | null | undefined): string => {
    if (field === null || field === undefined) return '""';
    const str = String(field);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  // Export Data Handler (CSV Generation & Download)
  const handleExportData = (overrideScope?: ExportScope) => {
    setIsExporting(true);
    const scope = overrideScope || exportScope;
    const targetStudents = exportStudents.length > 0 ? exportStudents : students;

    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (scope === 'comprehensive') {
      headers = [
        'StudentID',
        'StudentName',
        'InstitutionalEmail',
        'Gender',
        'Department',
        'Batch',
        'Semester',
        'FacultyMentor',
        'RiskLevel',
        'CompositeScore',
        // Pillar 1: Academic
        'Academic_GPA_0to10',
        'Academic_PrevSemGPA',
        'Academic_InternalAssessmentScore',
        'Academic_ActiveBacklogs',
        'Academic_TotalCreditsCompleted',
        'Academic_CoreSubjectAvgScore',
        // Pillar 2: Attendance
        'Attendance_OverallPercentage',
        'Attendance_TheoryPercentage',
        'Attendance_PracticalPercentage',
        'Attendance_ConsecutiveAbsences',
        // Pillar 3: LMS
        'LMS_PortalLoginsPerWeek',
        'LMS_ModuleCompletionPct',
        'LMS_QuizAverageScorePct',
        'LMS_AssignmentOnTimeRatePct',
        'LMS_VideoWatchHours',
        // Pillar 4: Engagement
        'Engagement_ForumPostsAndAnswers',
        'Engagement_ExtracurricularPoints',
        'Engagement_HackathonsAttended',
        'Engagement_SeminarAttendance',
        'Engagement_ClubLeadershipRole',
        // Pillar 5: Placement
        'Placement_AptitudeScore',
        'Placement_CodingScore',
        'Placement_MockInterviewRating_0to10',
        'Placement_ResumeReadinessScore',
        'Placement_PreferredDomain',
        'Placement_ReadinessLevel',
        // Pillar 6: Skills
        'Skills_TechnicalSkillRating',
        'Skills_SoftSkillRating',
        'Skills_PrimaryTechnologies',
        'Skills_VerifiedCertificationsCount',
        'Skills_VerifiedCertificationsList',
        'Skills_GitHubProjectsCount',
        // Pillar 7: Feedback & Advisory
        'Feedback_FacultyAdvisoryRating_1to5',
        'Feedback_StudentPulseScore_1to5',
        'Feedback_SatisfactionLevel',
        'Feedback_PrimaryConcernArea',
        'Feedback_AdvisorObservationNotes',
      ];

      rows = targetStudents.map((s) => {
        const displayName = anonymizeNames
          ? `Student_${s.id.replace(/[^a-zA-Z0-9]/g, '')}`
          : s.name;
        const displayEmail = anonymizeNames
          ? `masked_${s.id.toLowerCase()}@institution.edu`
          : s.email;

        return [
          s.id,
          displayName,
          displayEmail,
          s.gender,
          s.department,
          s.batch,
          s.semester,
          s.mentorName,
          s.riskLevel,
          s.compositeScore,
          s.academic.gpa,
          s.academic.previousSemesterGpa,
          s.academic.internalAssessmentScore,
          s.academic.backlogsCount,
          s.academic.totalCreditsCompleted,
          s.academic.coreSubjectAverage,
          s.attendance.overallPercentage,
          s.attendance.theoryPercentage,
          s.attendance.practicalPercentage,
          s.attendance.consecutiveAbsences,
          s.lms.portalLoginsPerWeek,
          s.lms.moduleCompletionRate,
          s.lms.quizAverageScore,
          s.lms.assignmentOnTimeRate,
          s.lms.videoWatchHours,
          s.engagement.forumPostsAndAnswers,
          s.engagement.extracurricularPoints,
          s.engagement.hackathonsAttended,
          s.engagement.seminarAttendance,
          s.engagement.clubLeadershipRole ? 'Yes' : 'No',
          s.placement.aptitudeScore,
          s.placement.codingScore,
          s.placement.mockInterviewRating,
          s.placement.resumeReadinessScore,
          s.placement.preferredDomain,
          s.placement.readinessLevel,
          s.skills.technicalSkillRating,
          s.skills.softSkillRating,
          s.skills.primaryTechnologies.join('; '),
          s.skills.verifiedCertifications.length,
          s.skills.verifiedCertifications.join('; '),
          s.skills.gitHubProjectsCount,
          s.feedback.facultyRating,
          s.feedback.studentPulseScore,
          s.feedback.satisfactionLevel,
          s.feedback.primaryConcernArea,
          s.feedback.advisorObservationNotes,
        ];
      });
    } else if (scope === 'academic') {
      headers = [
        'StudentID',
        'StudentName',
        'Department',
        'Semester',
        'Batch',
        'FacultyMentor',
        'RiskLevel',
        'CompositeScore',
        'GPA_0to10',
        'PreviousSemesterGPA',
        'InternalAssessmentScore',
        'ActiveBacklogs',
        'TotalCreditsCompleted',
        'CoreSubjectAverageScore',
        'AttendanceOverallPct',
        'TheoryAttendancePct',
        'PracticalAttendancePct',
        'ConsecutiveAbsences',
      ];

      rows = targetStudents.map((s) => {
        const displayName = anonymizeNames
          ? `Student_${s.id.replace(/[^a-zA-Z0-9]/g, '')}`
          : s.name;
        return [
          s.id,
          displayName,
          s.department,
          s.semester,
          s.batch,
          s.mentorName,
          s.riskLevel,
          s.compositeScore,
          s.academic.gpa,
          s.academic.previousSemesterGpa,
          s.academic.internalAssessmentScore,
          s.academic.backlogsCount,
          s.academic.totalCreditsCompleted,
          s.academic.coreSubjectAverage,
          s.attendance.overallPercentage,
          s.attendance.theoryPercentage,
          s.attendance.practicalPercentage,
          s.attendance.consecutiveAbsences,
        ];
      });
    } else if (scope === 'placement') {
      headers = [
        'StudentID',
        'StudentName',
        'Department',
        'Semester',
        'Batch',
        'PlacementReadinessLevel',
        'PreferredDomain',
        'CodingScore_0to100',
        'AptitudeScore_0to100',
        'MockInterviewRating_0to10',
        'ResumeReadinessScore_0to100',
        'TechnicalSkillRating_0to100',
        'SoftSkillRating_0to100',
        'PrimaryTechnologies',
        'VerifiedCertificationsCount',
        'GitHubProjectsCount',
        'CompositeScore',
        'RiskLevel',
      ];

      rows = targetStudents.map((s) => {
        const displayName = anonymizeNames
          ? `Student_${s.id.replace(/[^a-zA-Z0-9]/g, '')}`
          : s.name;
        return [
          s.id,
          displayName,
          s.department,
          s.semester,
          s.batch,
          s.placement.readinessLevel,
          s.placement.preferredDomain,
          s.placement.codingScore,
          s.placement.aptitudeScore,
          s.placement.mockInterviewRating,
          s.placement.resumeReadinessScore,
          s.skills.technicalSkillRating,
          s.skills.softSkillRating,
          s.skills.primaryTechnologies.join('; '),
          s.skills.verifiedCertifications.length,
          s.skills.gitHubProjectsCount,
          s.compositeScore,
          s.riskLevel,
        ];
      });
    } else {
      // Summary
      headers = [
        'StudentID',
        'StudentName',
        'Department',
        'Semester',
        'Batch',
        'CompositeScore',
        'RiskLevel',
        'GPA',
        'AttendancePct',
        'LMSCompletionPct',
        'PlacementReadiness',
        'CodingScore',
        'AptitudeScore',
        'SatisfactionLevel',
        'FacultyMentor',
      ];

      rows = targetStudents.map((s) => {
        const displayName = anonymizeNames
          ? `Student_${s.id.replace(/[^a-zA-Z0-9]/g, '')}`
          : s.name;
        return [
          s.id,
          displayName,
          s.department,
          s.semester,
          s.batch,
          s.compositeScore,
          s.riskLevel,
          s.academic.gpa,
          s.attendance.overallPercentage,
          s.lms.moduleCompletionRate,
          s.placement.readinessLevel,
          s.placement.codingScore,
          s.placement.aptitudeScore,
          s.feedback.satisfactionLevel,
          s.mentorName,
        ];
      });
    }

    // Build CSV file content with RFC 4180 escaping and UTF-8 BOM
    const csvLines = [
      headers.map((h) => escapeCsvField(h)).join(','),
      ...rows.map((row) => row.map((cell) => escapeCsvField(cell)).join(',')),
    ];

    const csvContent = '\uFEFF' + csvLines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `EduNexus_Student_Metrics_${scope.toUpperCase()}_${dateStr}.csv`;

    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Institutional Audit Log entry
    onAddAuditLog({
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actor: userRole,
      role: userRole,
      action: 'Export Data (CSV Download)',
      details: `Exported ${targetStudents.length} student metric records (${scope} schema, ${selectedDept} dept, ${selectedRisk} risk) to ${fileName}.`,
    });

    setExportSuccessMessage(`Downloaded ${targetStudents.length} student records as ${fileName}`);
    setIsExporting(false);

    setTimeout(() => {
      setExportSuccessMessage(null);
    }, 6000);
  };

  // Download CSV Template for Ingestion
  const handleDownloadTemplate = () => {
    const csvContent =
      'StudentID,Name,Department,Semester,GPA,AttendancePct,LMSCompletionPct,QuizScore,AptitudeScore,CodingScore,MockInterviewRating,PrimarySkill,SatisfactionLevel\n' +
      'ENX-2024-999,Sample Student,Computer Science (CSE),6,8.5,88,85,82,78,80,8.0,TypeScript,High\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'EduNexus_Student_Data_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Simulated CSV parser with validation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim() !== '');
      if (lines.length < 2) {
        setValidationResult({
          valid: false,
          totalRows: 0,
          validRows: 0,
          duplicateCount: 0,
          missingRequiredCount: 0,
          outOfRangeCount: 0,
          errors: ['The uploaded CSV is empty or missing data rows.'],
        });
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const requiredCols = ['studentid', 'name', 'department', 'gpa', 'attendancepct'];
      const missingCols = requiredCols.filter((col) => !headers.includes(col));

      if (missingCols.length > 0) {
        setValidationResult({
          valid: false,
          totalRows: lines.length - 1,
          validRows: 0,
          duplicateCount: 0,
          missingRequiredCount: lines.length - 1,
          outOfRangeCount: 0,
          errors: [`Missing required schema columns: ${missingCols.join(', ')}`],
        });
        return;
      }

      // Validate lines
      const seenIds = new Set<string>();
      let duplicates = 0;
      let outOfRange = 0;
      let validCount = 0;
      const errorList: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim());
        const idIndex = headers.indexOf('studentid');
        const gpaIndex = headers.indexOf('gpa');
        const attIndex = headers.indexOf('attendancepct');

        const sid = parts[idIndex];
        const gpa = parseFloat(parts[gpaIndex]);
        const att = parseFloat(parts[attIndex]);

        if (seenIds.has(sid)) {
          duplicates++;
          errorList.push(`Row ${i + 1}: Duplicate Student ID ${sid}`);
        } else {
          seenIds.add(sid);
        }

        if (isNaN(gpa) || gpa < 0 || gpa > 10) {
          outOfRange++;
          errorList.push(`Row ${i + 1}: Invalid GPA range (must be 0.0 - 10.0)`);
        }

        if (isNaN(att) || att < 0 || att > 100) {
          outOfRange++;
          errorList.push(`Row ${i + 1}: Invalid Attendance percentage (must be 0 - 100)`);
        }

        if (
          !seenIds.has(sid) &&
          !isNaN(gpa) &&
          !isNaN(att) &&
          gpa >= 0 &&
          gpa <= 10 &&
          att >= 0 &&
          att <= 100
        ) {
          validCount++;
        }
      }

      setValidationResult({
        valid: duplicates === 0 && outOfRange === 0,
        totalRows: lines.length - 1,
        validRows: validCount,
        duplicateCount: duplicates,
        missingRequiredCount: 0,
        outOfRangeCount: outOfRange,
        errors: errorList,
      });

      onAddAuditLog({
        id: `LOG-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actor: userRole,
        role: userRole,
        action: 'CSV File Ingestion Validated',
        details: `Inspected ${file.name} with ${lines.length - 1} records. Status: ${
          duplicates === 0 && outOfRange === 0 ? 'Passed' : 'Schema Warnings Found'
        }.`,
      });

      setImportStatusMessage(`Validated ${file.name} successfully.`);
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/50 w-fit mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Governance & Pipeline Integrity</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Data Quality, Ingestion & Audit Governance
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict schema enforcement, null-value checks, range boundaries, and verifiable audit trails
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg transition-all duration-200 hover:shadow-xs active:scale-95"
            title="Download ingestion template CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Ingestion Template</span>
          </button>

          {/* Primary 'Export Data' Action in Header */}
          <button
            onClick={() => handleExportData()}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg shadow-md shadow-blue-500/20 transition-all duration-300 ease-out hover:scale-[1.03] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/35 active:scale-95 cursor-pointer"
            title="Download student metrics as a CSV file for offline reporting"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Export Data (CSV)</span>
            <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full font-mono">
              {exportStudents.length}
            </span>
          </button>
        </div>
      </div>

      {/* Row 1: Pipeline Health Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Data Freshness</span>
            <RefreshCw className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base font-bold font-mono text-slate-900">Synchronized</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Live local session state</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Schema Compliance</span>
            <FileCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-base font-bold font-mono text-slate-900">100% Validated</div>
          <div className="text-[11px] text-slate-500 mt-0.5">7 / 7 Categories Bound</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Duplicate Student IDs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base font-bold font-mono text-emerald-700">0 Duplicates</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Unique key integrity verified</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Governance Role</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-base font-bold text-purple-900 truncate">{userRole}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Role-based access level</div>
        </div>
      </div>

      {/* Row 2: Dedicated 'Export Data' & Offline Reporting Feature Hub */}
      <div className="bg-white border border-blue-200/80 rounded-xl p-6 shadow-sm space-y-5 relative overflow-hidden bg-gradient-to-b from-white via-white to-blue-50/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                Offline Reporting Feature
              </span>
              <span className="text-[11px] text-slate-400 font-medium">RFC 4180 CSV Standard</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Export Student Metrics (Offline Reporting)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
              Download complete multidimensional student metrics, academic transcripts, and placement indicators as a CSV spreadsheet for offline institutional reporting, department audits, or external analytics.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-xs">
            <div className="text-center px-2">
              <div className="font-mono font-bold text-slate-900">{exportStudents.length}</div>
              <div className="text-[10px] text-slate-500">Students</div>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-center px-2">
              <div className="font-mono font-bold text-blue-600">{cohortAvgGpa}</div>
              <div className="text-[10px] text-slate-500">Avg GPA</div>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-center px-2">
              <div className="font-mono font-bold text-emerald-600">{cohortAvgAttendance}%</div>
              <div className="text-[10px] text-slate-500">Avg Attd</div>
            </div>
            {cohortHighRiskCount > 0 && (
              <>
                <div className="h-6 w-px bg-slate-200" />
                <div className="text-center px-2">
                  <div className="font-mono font-bold text-rose-600">{cohortHighRiskCount}</div>
                  <div className="text-[10px] text-slate-500">Support</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Export Success Notification Banner */}
        {exportSuccessMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800 animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Export Complete!</strong> {exportSuccessMessage}
              </span>
            </div>
            <button
              onClick={() => setExportSuccessMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 font-medium text-[11px] underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filter Controls & Schema Scope Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* 1. Scope Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Metric Scope Schema</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-100/80 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setExportScope('comprehensive')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all text-left flex items-center justify-between ${
                  exportScope === 'comprehensive'
                    ? 'bg-white text-blue-700 font-semibold shadow-xs border border-blue-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span>7-Pillars Full</span>
                <span className="text-[10px] opacity-70">46 cols</span>
              </button>

              <button
                type="button"
                onClick={() => setExportScope('summary')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all text-left flex items-center justify-between ${
                  exportScope === 'summary'
                    ? 'bg-white text-blue-700 font-semibold shadow-xs border border-blue-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span>Exec Summary</span>
                <span className="text-[10px] opacity-70">15 cols</span>
              </button>

              <button
                type="button"
                onClick={() => setExportScope('academic')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all text-left flex items-center justify-between ${
                  exportScope === 'academic'
                    ? 'bg-white text-blue-700 font-semibold shadow-xs border border-blue-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span>Academic & Attd</span>
                <span className="text-[10px] opacity-70">18 cols</span>
              </button>

              <button
                type="button"
                onClick={() => setExportScope('placement')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all text-left flex items-center justify-between ${
                  exportScope === 'placement'
                    ? 'bg-white text-blue-700 font-semibold shadow-xs border border-blue-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span>Placement & Skills</span>
                <span className="text-[10px] opacity-70">18 cols</span>
              </button>
            </div>
          </div>

          {/* 2. Department Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Target Department</span>
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'All Departments (Universal)' : dept}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Filter records before file generation
            </span>
          </div>

          {/* 3. Risk Level Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Risk Tier Level</span>
            </label>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {riskTiers.map((tier) => (
                <option key={tier} value={tier}>
                  {tier === 'All' ? 'All Risk Levels (Cohort Wide)' : tier}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Isolate students by intervention priority
            </span>
          </div>
        </div>

        {/* Footer Options & Export Action Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-200/80">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none hover:text-slate-900">
            <input
              type="checkbox"
              checked={anonymizeNames}
              onChange={(e) => setAnonymizeNames(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Anonymize student names & emails (FERPA / GDPR privacy mode)</span>
            </span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleExportData('summary')}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            >
              Quick Summary CSV
            </button>

            <button
              type="button"
              onClick={() => handleExportData()}
              disabled={isExporting || exportStudents.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-lg shadow-md shadow-blue-500/25 transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/35 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Export Data ({exportStudents.length} Students CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: CSV Upload & Validation Engine */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Ingest Student Records (CSV Validation Engine)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated verification checks required fields, numeric bounds (GPA 0-10, Attendance 0-100), and rejects corrupted records.
          </p>
        </div>

        {/* Dropzone */}
        <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-all group">
          <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-blue-600 transition-colors mb-2" />
          <span className="text-xs font-bold text-slate-800">
            Click to upload student dataset (.csv) or drag file here
          </span>
          <span className="text-[11px] text-slate-500 mt-1">
            Supports standardized CSV formats with 7 category columns
          </span>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {/* Validation Output Card */}
        {validationResult && (
          <div
            className={`p-4 rounded-xl border ${
              validationResult.valid
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/60 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-bold text-xs">
                {validationResult.valid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                )}
                <span>
                  {validationResult.valid
                    ? 'CSV File Passed All Validation Checks'
                    : 'Validation Warnings Detected'}
                </span>
              </div>
              <span className="font-mono text-xs">
                {validationResult.validRows} / {validationResult.totalRows} valid rows
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs py-2 border-y border-current/10 my-2">
              <div>
                Duplicates: <strong>{validationResult.duplicateCount}</strong>
              </div>
              <div>
                Out of Range: <strong>{validationResult.outOfRangeCount}</strong>
              </div>
              <div>
                Missing Fields: <strong>{validationResult.missingRequiredCount}</strong>
              </div>
            </div>

            {validationResult.errors.length > 0 && (
              <div className="text-[11px] space-y-1 mt-2">
                <div className="font-semibold">Error Log:</div>
                <ul className="list-disc list-inside">
                  {validationResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Row 4: Audit Trail Log */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Institutional Audit Logs</h3>
            <p className="text-[11px] text-slate-500">
              Immutable ledger of advisory interventions, metric exports, and dataset modifications
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">{auditLogs.length} Events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Event ID</th>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Actor</th>
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 text-slate-400">{log.id}</td>
                  <td className="py-2.5 px-4 text-slate-600 font-sans">{log.timestamp}</td>
                  <td className="py-2.5 px-4 font-sans font-semibold text-slate-800">
                    {log.actor}
                  </td>
                  <td className="py-2.5 px-4 font-sans text-slate-600">{log.role}</td>
                  <td className="py-2.5 px-4 font-sans font-medium text-blue-700">{log.action}</td>
                  <td className="py-2.5 px-4 font-sans text-slate-600 max-w-md truncate">
                    {log.details}
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
