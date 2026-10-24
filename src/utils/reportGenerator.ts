import { Student } from '../types/student';

/**
 * Deterministic diagnostic synthesis report generator for EduNexus AI.
 * Produces structured, rigorous, and explainable multi-pillar analysis reports
 * matching the 7 pillars and 4-week action plan.
 */
export function generateOfflineStudentInsight(student: Student): string {
  const { academic, attendance, lms, placement, skills, engagement, feedback } = student;

  const attendanceRisk =
    attendance.overallPercentage < 75
      ? 'CRITICAL (Below 75% regulatory mandate)'
      : attendance.overallPercentage < 82
      ? 'MODERATE (Approaching review margin)'
      : 'HEALTHY (Compliant with institutional norms)';

  const academicVerdict =
    academic.backlogsCount > 0
      ? `${academic.backlogsCount} active course backlog(s) requiring remediation timetable.`
      : 'Clean academic slate with no active backlogs.';

  const placementReadinessVerdict =
    placement.codingScore >= 80 && placement.aptitudeScore >= 80
      ? `High Competitive Readiness (${placement.readinessLevel}) for elite product & core engineering campus interviews.`
      : placement.codingScore < 70
      ? `Technical Coding Screening Gap (${placement.codingScore}/100) — targeted DSA algorithms drill recommended.`
      : `Moderate Readiness (${placement.readinessLevel}) — focus on quantitative aptitude and mock interview rounds.`;

  return `### Executive Diagnostic Summary
${student.name} (${student.id}) in the Department of ${student.department} (Semester ${student.semester}) maintains an overall institutional Composite Success Score of **${student.compositeScore}/100** categorized under the **${student.riskLevel}** tier. Academic performance is currently at **${academic.gpa.toFixed(1)} / 10.0 CGPA** with ${academicVerdict} Attendance telemetry registers at **${attendance.overallPercentage}%** overall (${attendanceRisk}), providing strong operational visibility across lectures and laboratories.

---

### Multi-Pillar Correlation Analysis
1. **Academic Standing & Progression**:
   - Internal Assessment Average: **${academic.internalAssessmentScore}%** | Core Subject Average: **${academic.coreSubjectAverage}%**
   - Previous Semester CGPA: **${academic.previousSemesterGpa.toFixed(1)}** vs Current CGPA: **${academic.gpa.toFixed(1)}** (${academic.gpa >= academic.previousSemesterGpa ? 'Positive growth vector' : 'Needs corrective review'}).
   - Total Earned Academic Credits: **${academic.totalCreditsCompleted} credits**.

2. **Attendance & Engagement Telemetry**:
   - Theory Lectures: **${attendance.theoryPercentage}%** | Laboratory Practicals: **${attendance.practicalPercentage}%**
   - Consecutive Absences Recorded: **${attendance.consecutiveAbsences} days** ${attendance.consecutiveAbsences >= 3 ? '(Flagged for proactive mentor touchpoint)' : '(Normal lecture continuity)'}.
   - Digital LMS Activity: **${lms.portalLoginsPerWeek} logins/week** with an assignment on-time submission index of **${lms.assignmentOnTimeRate}%** and quiz average score of **${lms.quizAverageScore}%**.

3. **Inter-Pillar Root-Cause Synthesis**:
   - The primary driver of the current success score (${student.compositeScore}/100) is the correlation between consistent lab presence (${attendance.practicalPercentage}%) and technical domain competency (${skills.technicalSkillRating}/100).
   ${academic.backlogsCount > 0 ? `- **Alert**: The presence of ${academic.backlogsCount} pending backlog(s) depresses the composite academic component; prioritised remedial clinic required before end-semester examinations.` : `- **Strength**: Zero backlogs and regular LMS submissions (${lms.assignmentOnTimeRate}%) reinforce baseline exam resilience.`}

---

### Placement & Career Track Competitiveness
- **Targeted Industry Track**: **${placement.preferredDomain}**
- **Coding Benchmark Rating**: **${placement.codingScore}/100**
- **Quantitative & Logical Aptitude**: **${placement.aptitudeScore}%**
- **Mock Interview Performance**: **${placement.mockInterviewRating}/10.0**
- **Assessment Verdict**: ${placementReadinessVerdict}
- **Primary Technical Stack**: ${(skills.primaryTechnologies || []).join(', ') || 'Core Engineering Fundamentals'}
- **Active GitHub Repositories**: **${skills.gitHubProjectsCount} repos** | Verified Certifications: ${(skills.verifiedCertifications || []).join(', ') || 'In progress'}

---

### Identified Strengths & Protective Anchors
${(student.strengths || []).map((s) => `- **Anchor**: ${s}`).join('\n') || '- Demonstrates disciplined project engagement and positive attendance metrics.'}
- **Faculty Evaluation**: Rated at **${feedback.facultyRating} / 5.0** by departmental faculty advisors.
- **Student Sentiment**: Reported satisfaction level is **${feedback.satisfactionLevel}**, with primary focus recorded: *"${feedback.primaryConcernArea}"*.

---

### Prescriptive 4-Week Action Plan
- **Week 1 (Diagnostic & Benchmark)**:
  - Faculty Mentor (${student.mentorName}) conducts a 20-minute 1-on-1 check-in focusing on *"${feedback.primaryConcernArea}"*.
  - Student completes a 45-minute timed diagnostic screening for ${placement.preferredDomain}.
- **Week 2 (Targeted Skill Consolidation)**:
  - Allocate 4 hours/week for specialized coding practice in ${(skills.primaryTechnologies || []).slice(0, 2).join(' and ') || 'domain tools'}.
  - Target 100% on-time submission rate on remaining LMS modules (currently at ${lms.moduleCompletionRate}% completion).
- **Week 3 (Remedial & Mock Evaluation)**:
  - Schedule a peer mock interview simulation to improve interview rating from ${placement.mockInterviewRating}/10 to > 8.5/10.
  ${academic.backlogsCount > 0 ? `- Attend dedicated faculty remediation clinic for ${academic.backlogsCount} subject backlog(s).` : `- Advance capstone project milestone on GitHub (currently ${skills.gitHubProjectsCount} active repositories).`}
- **Week 4 (Review & Milestone Clearance)**:
  - Verify attendance retention target (sustain at ≥ ${Math.max(85, attendance.overallPercentage)}%).
  - Finalize placement portfolio checklist with Career Relations officer.

---

### Ethical Safeguard & Human Next Step
- **Advisor Mentoring Note**: *"${feedback.advisorObservationNotes}"*
- **FERPA & Algorithmic Guardrail**: This diagnostic insight serves as a decision-support guide for faculty mentors and students. No academic decisions or grade penalties are automated. All intervention proposals require collaborative human review.`;
}
