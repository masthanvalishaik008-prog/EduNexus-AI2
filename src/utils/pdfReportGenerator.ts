import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, SupportAlert } from '../types/student';

export interface PdfExportOptions {
  meetingType?: string;
  meetingDate?: string;
  advisorName?: string;
  customNotes?: string;
  includeActionPlan?: boolean;
  includeBreakdownTable?: boolean;
  includeSignatures?: boolean;
  includeAlerts?: boolean;
  alerts?: SupportAlert[];
}

/**
 * Generates an institutional-grade, publication-ready Student Success PDF report.
 * Tailored specifically for Faculty Advisor meetings, academic review boards,
 * and placement counseling sessions.
 */
export function buildStudentSuccessPdf(
  student: Student,
  options: PdfExportOptions = {}
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const meetingDate = options.meetingDate || new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const advisorName = options.advisorName || student.mentorName || 'Faculty Advisor';
  const meetingType = options.meetingType || 'Faculty Advisory 1-on-1 Review & Placement Audit';
  const customNotes = options.customNotes || student.feedback.advisorObservationNotes || 'No additional mentor notes recorded for this cycle.';

  // --- TOP HEADER BANNER ---
  // Navy background strip
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Accent blue top bar
  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(0, 0, pageWidth, 3, 'F');

  // Institution title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('EDUNEXUS AI  |  STUDENT SUCCESS & PLACEMENT DOSSIER', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(191, 219, 254); // blue-200
  doc.text('INSTITUTIONAL PERFORMANCE RECORD · ACADEMIC & PLACEMENT ADVISORY SYSTEM', margin, 18);

  // Document stamp badge on top right
  doc.setFillColor(30, 58, 138); // blue-900
  doc.roundedRect(pageWidth - margin - 42, 6, 42, 12, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('CONFIDENTIAL', pageWidth - margin - 21, 11, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setTextColor(203, 213, 225);
  doc.text('FERPA PROTECTED', pageWidth - margin - 21, 15.5, { align: 'center' });

  let curY = 30;

  // --- MEETING METADATA BAR ---
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, curY, contentWidth, 12, 1.5, 1.5, 'FD');

  doc.setTextColor(71, 85, 105); // slate-600
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('MEETING CONTEXT:', margin + 3, curY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(meetingType, margin + 35, curY + 5);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('DATE:', margin + 115, curY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(meetingDate, margin + 128, curY + 5);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('ADVISOR:', margin + 3, curY + 9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(advisorName, margin + 20, curY + 9.5);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('STATUS TIER:', margin + 115, curY + 9.5);
  doc.setFont('helvetica', 'bold');
  if (student.riskLevel === 'High Support Needed') {
    doc.setTextColor(225, 29, 72);
  } else if (student.riskLevel === 'Moderate Attention') {
    doc.setTextColor(217, 119, 6);
  } else if (student.riskLevel === 'High Potential') {
    doc.setTextColor(37, 99, 235);
  } else {
    doc.setTextColor(5, 150, 105);
  }
  doc.text(student.riskLevel.toUpperCase(), margin + 138, curY + 9.5);

  curY += 16;

  // --- STUDENT BIO IDENTIFICATION BOX ---
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, curY, contentWidth, 24, 2, 2, 'FD');

  // Left blue decorative accent bar
  doc.setFillColor(37, 99, 235);
  doc.rect(margin, curY, 2.5, 24, 'F');

  // Student Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(student.name, margin + 6, curY + 6.5);

  // Student Roll/ID badge
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  const idBadgeWidth = 28;
  doc.roundedRect(margin + 6 + doc.getTextWidth(student.name) + 4, curY + 2.5, idBadgeWidth, 5.5, 1, 1, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(30, 64, 175);
  doc.text(student.id, margin + 6 + doc.getTextWidth(student.name) + 4 + idBadgeWidth / 2, curY + 6.3, { align: 'center' });

  // Student Details Grid
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  // Column 1
  doc.text(`Department: ${student.department}`, margin + 6, curY + 12);
  doc.text(`Current Term: Semester ${student.semester} (${student.batch})`, margin + 6, curY + 16.5);
  doc.text(`Official Email: ${student.email}`, margin + 6, curY + 21);

  // Column 2
  doc.text(`Assigned Mentor: ${student.mentorName}`, margin + 95, curY + 12);
  doc.text(`Target Industry: ${student.placement.preferredDomain}`, margin + 95, curY + 16.5);
  doc.text(`Placement Status: ${student.placement.readinessLevel}`, margin + 95, curY + 21);

  curY += 28;

  // --- 4 KEY EXECUTIVE KPI METRIC CARDS ---
  const cardWidth = (contentWidth - 9) / 4;
  const cardHeight = 21;

  // Card 1: Composite Success Score
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, curY, cardWidth, cardHeight, 1.5, 1.5, 'FD');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('COMPOSITE SUCCESS SCORE', margin + cardWidth / 2, curY + 5, { align: 'center' });
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`${student.compositeScore} / 100`, margin + cardWidth / 2, curY + 12, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Tier: ${student.riskLevel}`, margin + cardWidth / 2, curY + 17, { align: 'center' });

  // Card 2: Cumulative CGPA & Backlogs
  const c2X = margin + cardWidth + 3;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(c2X, curY, cardWidth, cardHeight, 1.5, 1.5, 'FD');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('CUMULATIVE CGPA', c2X + cardWidth / 2, curY + 5, { align: 'center' });
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`${student.academic.gpa.toFixed(1)} / 10`, c2X + cardWidth / 2, curY + 12, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  if (student.academic.backlogsCount > 0) {
    doc.setTextColor(225, 29, 72);
    doc.text(`${student.academic.backlogsCount} Active Backlog(s)`, c2X + cardWidth / 2, curY + 17, { align: 'center' });
  } else {
    doc.setTextColor(5, 150, 105);
    doc.text('0 Backlogs (Clean Record)', c2X + cardWidth / 2, curY + 17, { align: 'center' });
  }

  // Card 3: Attendance Compliance
  const c3X = c2X + cardWidth + 3;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(c3X, curY, cardWidth, cardHeight, 1.5, 1.5, 'FD');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('ATTENDANCE RATE', c3X + cardWidth / 2, curY + 5, { align: 'center' });
  doc.setFontSize(14);
  if (student.attendance.overallPercentage < 75) {
    doc.setTextColor(225, 29, 72);
  } else {
    doc.setTextColor(5, 150, 105);
  }
  doc.text(`${student.attendance.overallPercentage}%`, c3X + cardWidth / 2, curY + 12, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Absences: ${student.attendance.consecutiveAbsences} days`, c3X + cardWidth / 2, curY + 17, { align: 'center' });

  // Card 4: Technical & Placement Benchmark
  const c4X = c3X + cardWidth + 3;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(c4X, curY, cardWidth, cardHeight, 1.5, 1.5, 'FD');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('CODING BENCHMARK', c4X + cardWidth / 2, curY + 5, { align: 'center' });
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`${student.placement.codingScore} / 100`, c4X + cardWidth / 2, curY + 12, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Mock: ${student.placement.mockInterviewRating}/10.0`, c4X + cardWidth / 2, curY + 17, { align: 'center' });

  curY += cardHeight + 6;

  // --- SECTION: 7-PILLARS SUCCESS SCORE ATTRIBUTION TABLE ---
  if (options.includeBreakdownTable !== false) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('1. Holistic Multi-Pillar Performance & Attribution Analysis', margin, curY);

    const tableRows = [
      [
        'Academic Progression',
        `CGPA: ${student.academic.gpa.toFixed(1)}/10 | Int: ${student.academic.internalAssessmentScore}% | Backlogs: ${student.academic.backlogsCount}`,
        `${student.breakdown.academicScore}`,
        '25%',
        `${(student.breakdown.academicScore * 0.25).toFixed(1)}`,
        student.academic.backlogsCount > 0 ? 'Remedial Flag' : 'Nominal',
      ],
      [
        'Attendance Compliance',
        `Overall: ${student.attendance.overallPercentage}% (Theory ${student.attendance.theoryPercentage}%, Practical ${student.attendance.practicalPercentage}%)`,
        `${student.breakdown.attendanceScore}`,
        '20%',
        `${(student.breakdown.attendanceScore * 0.20).toFixed(1)}`,
        student.attendance.overallPercentage < 75 ? 'Critical Deficit' : 'Compliant',
      ],
      [
        'Digital LMS Activity',
        `Logins: ${student.lms.portalLoginsPerWeek}/wk | On-time: ${student.lms.assignmentOnTimeRate}% | Quiz: ${student.lms.quizAverageScore}%`,
        `${student.breakdown.lmsScore}`,
        '10%',
        `${(student.breakdown.lmsScore * 0.10).toFixed(1)}`,
        student.lms.assignmentOnTimeRate >= 80 ? 'Active' : 'Low Engagement',
      ],
      [
        'Placement Preparation',
        `Coding: ${student.placement.codingScore}/100 | Aptitude: ${student.placement.aptitudeScore}% | Mock: ${student.placement.mockInterviewRating}/10`,
        `${student.breakdown.placementScore}`,
        '15%',
        `${(student.breakdown.placementScore * 0.15).toFixed(1)}`,
        student.placement.readinessLevel,
      ],
      [
        'Domain Skills & Projects',
        `Tech Rating: ${student.skills.technicalSkillRating}/100 | Repos: ${student.skills.gitHubProjectsCount} | Stack: ${(student.skills.primaryTechnologies || []).slice(0, 3).join(', ')}`,
        `${student.breakdown.skillsScore}`,
        '15%',
        `${(student.breakdown.skillsScore * 0.15).toFixed(1)}`,
        student.skills.technicalSkillRating >= 75 ? 'Industry Ready' : 'Needs Practice',
      ],
      [
        'Campus Engagement',
        `Extracurricular: ${student.engagement.extracurricularPoints} pts | Hackathons: ${student.engagement.hackathonsAttended} | Club Leader: ${student.engagement.clubLeadershipRole ? 'Yes' : 'No'}`,
        `${student.breakdown.engagementScore}`,
        '10%',
        `${(student.breakdown.engagementScore * 0.10).toFixed(1)}`,
        student.engagement.clubLeadershipRole ? 'Leader' : 'Participant',
      ],
      [
        'Faculty & Student Sentiment',
        `Faculty Rating: ${student.feedback.facultyRating}/5.0 | Satisfaction: ${student.feedback.satisfactionLevel} | Primary Concern: "${student.feedback.primaryConcernArea}"`,
        `${student.breakdown.feedbackScore}`,
        '5%',
        `${(student.breakdown.feedbackScore * 0.05).toFixed(1)}`,
        student.feedback.satisfactionLevel,
      ],
    ];

    autoTable(doc, {
      startY: curY + 2,
      margin: { left: margin, right: margin },
      head: [['Dimension / Pillar', 'Operational Telemetry', 'Score', 'Weight', 'Contrib.', 'Status']],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59], // slate-800
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'left',
      },
      styles: {
        fontSize: 7,
        cellPadding: 2,
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 38 },
        1: { cellWidth: 76 },
        2: { halign: 'center', cellWidth: 14, fontStyle: 'bold' },
        3: { halign: 'center', cellWidth: 14 },
        4: { halign: 'center', cellWidth: 16, fontStyle: 'bold' },
        5: { halign: 'center', cellWidth: 24, fontStyle: 'bold' },
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          if (data.column.index === 5) {
            const txt = String(data.cell.raw);
            if (txt.includes('Critical') || txt.includes('Remedial')) {
              data.cell.styles.textColor = [225, 29, 72]; // rose-600
            } else if (txt.includes('Job Ready') || txt.includes('Compliant') || txt.includes('Nominal')) {
              data.cell.styles.textColor = [5, 150, 105]; // emerald-600
            } else if (txt.includes('Needs') || txt.includes('Low')) {
              data.cell.styles.textColor = [217, 119, 6]; // amber-600
            }
          }
        }
      },
    });

    // @ts-ignore
    curY = doc.lastAutoTable.finalY + 6;
  }

  // --- SECTION: STRENGTHS & RISK SIGNALS DUAL-BOX ---
  const boxWidth = (contentWidth - 4) / 2;
  const boxHeight = 27;

  // Strengths Box (Left)
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(187, 247, 208); // emerald-200
  doc.roundedRect(margin, curY, boxWidth, boxHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(6, 95, 70); // emerald-800
  doc.text('IDENTIFIED PROTECTIVE STRENGTHS', margin + 3, curY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  const strengthsList = (student.strengths && student.strengths.length > 0)
    ? student.strengths
    : ['Disciplined project engagement and consistent laboratory coursework.'];
  
  strengthsList.slice(0, 3).forEach((str, i) => {
    const cleanStr = doc.splitTextToSize(`• ${str}`, boxWidth - 6);
    doc.text(cleanStr, margin + 3, curY + 9 + i * 5.5);
  });

  // Risk & Growth Areas Box (Right)
  const rightBoxX = margin + boxWidth + 4;
  doc.setFillColor(254, 242, 242); // rose-50
  doc.setDrawColor(254, 202, 202); // rose-200
  doc.roundedRect(rightBoxX, curY, boxWidth, boxHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(153, 27, 27); // rose-800
  doc.text('RISK FACTORS & GROWTH PRIORITIES', rightBoxX + 3, curY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  const growthList = (student.growthAreas && student.growthAreas.length > 0)
    ? student.growthAreas
    : [
        student.attendance.overallPercentage < 75 ? 'Attendance recovery required (< 75%).' : 'Maintain regular coursework review schedule.',
        student.placement.codingScore < 75 ? 'Technical coding screening practice required.' : 'Advance mock interview preparation.'
      ];

  growthList.slice(0, 3).forEach((gr, i) => {
    const cleanGr = doc.splitTextToSize(`• ${gr}`, boxWidth - 6);
    doc.text(cleanGr, rightBoxX + 3, curY + 9 + i * 5.5);
  });

  curY += boxHeight + 6;

  // --- SECTION: PRESCRIPTIVE 4-WEEK ACTION PLAN (PAGE 2 OR FLOW) ---
  // Check if we need to add a page to ensure clean layout
  if (curY > pageHeight - 80) {
    addPageHeaderAndFooter(doc, 1, 2, student);
    doc.addPage();
    curY = 28;
    addPageTopBrandBar(doc, pageWidth, margin);
  }

  if (options.includeActionPlan !== false) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('2. Prescriptive 4-Week Action Plan & Advisory Milestones', margin, curY);

    const actionPlanRows = [
      [
        'Week 1\nDiagnostic & Alignment',
        `• 1-on-1 Faculty Mentor Consultation with ${advisorName} focusing on "${student.feedback.primaryConcernArea}".\n• Complete 45-minute baseline diagnostic screening for ${student.placement.preferredDomain}.`,
        'Faculty Advisor &\nStudent',
        'Within 5 days',
      ],
      [
        'Week 2\nSkill Consolidation',
        `• Dedicated 4 hrs/week coding drill on ${(student.skills.primaryTechnologies || []).slice(0, 2).join(' & ') || 'core tools'}.\n• Achieve 100% on-time submission rate on remaining LMS modules.`,
        'Student &\nLab In-Charge',
        'End of Week 2',
      ],
      [
        'Week 3\nRemedial / Mock Screening',
        `• ${student.academic.backlogsCount > 0 ? `Attend specialized faculty clinic for ${student.academic.backlogsCount} backlog course(s).` : `Push capstone project update to GitHub (currently ${student.skills.gitHubProjectsCount} active repositories).`}\n• Conduct peer mock interview session to lift mock rating (${student.placement.mockInterviewRating}/10).`,
        'Faculty Lead &\nCareer Relations',
        'End of Week 3',
      ],
      [
        'Week 4\nMilestone Clearance',
        `• Review attendance retention compliance target (target: ≥ ${Math.max(85, student.attendance.overallPercentage)}%).\n• Finalize placement profile checklist with Placement Cell.`,
        'Advisor & Placement\nOfficer',
        'End of Week 4',
      ],
    ];

    autoTable(doc, {
      startY: curY + 2,
      margin: { left: margin, right: margin },
      head: [['Roadmap Stage', 'Specific Action Item & Deliverable', 'Responsible Parties', 'Target Timeline']],
      body: actionPlanRows,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 58, 138], // blue-900
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 7,
        cellPadding: 2.5,
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 38 },
        1: { cellWidth: 92 },
        2: { cellWidth: 28, halign: 'center' },
        3: { cellWidth: 24, halign: 'center', fontStyle: 'bold' },
      },
    });

    // @ts-ignore
    curY = doc.lastAutoTable.finalY + 6;
  }

  // --- SECTION: ADVISOR MEETING NOTES & OBSERVATIONS ---
  if (curY > pageHeight - 55) {
    addPageHeaderAndFooter(doc, doc.getNumberOfPages(), doc.getNumberOfPages() + 1, student);
    doc.addPage();
    curY = 28;
    addPageTopBrandBar(doc, pageWidth, margin);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Faculty Advisor Meeting Discussion & Directives', margin, curY);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  const notesHeight = 18;
  doc.roundedRect(margin, curY + 2, contentWidth, notesHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const splitNotes = doc.splitTextToSize(customNotes, contentWidth - 6);
  doc.text(splitNotes, margin + 3, curY + 6.5);

  curY += notesHeight + 8;

  // --- SECTION: OFFICIAL SIGN-OFF & ACKNOWLEDGEMENT ---
  if (options.includeSignatures !== false) {
    if (curY > pageHeight - 38) {
      addPageHeaderAndFooter(doc, doc.getNumberOfPages(), doc.getNumberOfPages() + 1, student);
      doc.addPage();
      curY = 28;
      addPageTopBrandBar(doc, pageWidth, margin);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('4. Official Advisory Meeting Endorsement & Sign-Off', margin, curY);

    const sigBoxWidth = (contentWidth - 6) / 2;
    const sigBoxHeight = 22;

    // Faculty Advisor Sign Box
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, curY + 2, sigBoxWidth, sigBoxHeight, 1.5, 1.5, 'FD');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('FACULTY ADVISOR SIGNATURE & DATE', margin + 3, curY + 6);
    
    // Line for physical signature
    doc.setDrawColor(148, 163, 184);
    doc.line(margin + 3, curY + 16, margin + sigBoxWidth - 3, curY + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${advisorName} · Department of ${student.department}`, margin + 3, curY + 20);

    // Student Sign Box
    const stuSigX = margin + sigBoxWidth + 6;
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(stuSigX, curY + 2, sigBoxWidth, sigBoxHeight, 1.5, 1.5, 'FD');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('STUDENT ACKNOWLEDGEMENT & COMMITMENT', stuSigX + 3, curY + 6);

    // Line for physical signature
    doc.line(stuSigX + 3, curY + 16, stuSigX + sigBoxWidth - 3, curY + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${student.name} (${student.id}) · Semester ${student.semester}`, stuSigX + 3, curY + 20);
  }

  // Finalize all pages with proper page numbers & confidentiality footers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addPageHeaderAndFooter(doc, i, totalPages, student);
  }

  return doc;
}

function addPageTopBrandBar(doc: jsPDF, pageWidth: number, margin: number) {
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 14, 'F');
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('EDUNEXUS AI  |  STUDENT SUCCESS & PLACEMENT DOSSIER', margin, 9);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(191, 219, 254);
  doc.text('FACULTY ADVISORY CONTINUATION RECORD', pageWidth - margin - 60, 9);
}

function addPageHeaderAndFooter(doc: jsPDF, pageNum: number, totalPages: number, student: Student) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Bottom footer line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

  // Footer text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `EduNexus AI · Student: ${student.name} (${student.id}) · Department: ${student.department}`,
    margin,
    pageHeight - 6.5
  );

  doc.text(
    `Page ${pageNum} of ${totalPages}`,
    pageWidth - margin,
    pageHeight - 6.5,
    { align: 'right' }
  );

  doc.text(
    'STRICTLY CONFIDENTIAL · FOR AUTHORIZED FACULTY ADVISORY REVIEW ONLY',
    pageWidth / 2,
    pageHeight - 6.5,
    { align: 'center' }
  );
}

/**
 * Directly downloads the generated Student Success Report PDF in the browser.
 */
export function exportStudentSuccessReportPdf(
  student: Student,
  options: PdfExportOptions = {}
): void {
  const doc = buildStudentSuccessPdf(student, options);
  const cleanName = student.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `EduNexus_Success_Report_${student.id}_${cleanName}.pdf`;
  doc.save(filename);
}

/**
 * Returns a data URL / Blob for in-app preview or printing.
 */
export function getStudentSuccessReportPdfBlob(
  student: Student,
  options: PdfExportOptions = {}
): string {
  const doc = buildStudentSuccessPdf(student, options);
  const out = doc.output('bloburl');
  return typeof out === 'string' ? out : out.toString();
}
