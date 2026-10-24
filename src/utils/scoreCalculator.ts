import { AcademicMetrics, AttendanceMetrics, LmsMetrics, EngagementMetrics, PlacementMetrics, SkillsMetrics, FeedbackMetrics, StudentScoreBreakdown, CategoryWeights, RiskLevel } from '../types/student';

export const DEFAULT_WEIGHTS: CategoryWeights = {
  academic: 0.25,
  attendance: 0.20,
  lms: 0.15,
  engagement: 0.10,
  placement: 0.15,
  skills: 0.10,
  feedback: 0.05,
};

export function calculateAcademicScore(m: AcademicMetrics): number {
  // GPA on 10 pt scale (weight 60%), internal marks (weight 30%), backlog penalty (up to 10%)
  const gpaNormalized = (m.gpa / 10) * 100;
  const backlogsPenalty = Math.min(10, m.backlogsCount * 5);
  const score = (gpaNormalized * 0.6) + (m.internalAssessmentScore * 0.3) + (10 - backlogsPenalty);
  return Math.min(100, Math.max(0, Math.round(score)));
}

export function calculateAttendanceScore(m: AttendanceMetrics): number {
  // Weighted theory & practical, minus consecutive absences penalty
  const consecutivePenalty = Math.min(15, m.consecutiveAbsences * 3);
  const base = (m.theoryPercentage * 0.5) + (m.practicalPercentage * 0.5);
  return Math.min(100, Math.max(0, Math.round(base - consecutivePenalty)));
}

export function calculateLmsScore(m: LmsMetrics): number {
  const score = (m.moduleCompletionRate * 0.4) + (m.quizAverageScore * 0.35) + (m.assignmentOnTimeRate * 0.25);
  return Math.min(100, Math.max(0, Math.round(score)));
}

export function calculateEngagementScore(m: EngagementMetrics): number {
  const forumNorm = Math.min(100, m.forumPostsAndAnswers * 5);
  const hackathonBonus = Math.min(100, m.hackathonsAttended * 25);
  const score = (m.extracurricularPoints * 0.4) + (forumNorm * 0.3) + (hackathonBonus * 0.2) + (m.clubLeadershipRole ? 10 : 0);
  return Math.min(100, Math.max(0, Math.round(score)));
}

export function calculatePlacementScore(m: PlacementMetrics): number {
  const mockNorm = (m.mockInterviewRating / 10) * 100;
  const score = (m.aptitudeScore * 0.30) + (m.codingScore * 0.35) + (mockNorm * 0.20) + (m.resumeReadinessScore * 0.15);
  return Math.min(100, Math.max(0, Math.round(score)));
}

export function calculateSkillsScore(m: SkillsMetrics): number {
  const certBonus = Math.min(100, m.verifiedCertifications.length * 20);
  const score = (m.technicalSkillRating * 0.55) + (m.softSkillRating * 0.25) + (certBonus * 0.20);
  return Math.min(100, Math.max(0, Math.round(score)));
}

export function calculateFeedbackScore(m: FeedbackMetrics): number {
  const facultyNorm = (m.facultyRating / 5) * 100;
  const pulseNorm = (m.studentPulseScore / 5) * 100;
  const score = (facultyNorm * 0.6) + (pulseNorm * 0.4);
  return Math.min(100, Math.max(0, Math.round(score)));
}

export function calculateCompositeBreakdown(
  academic: AcademicMetrics,
  attendance: AttendanceMetrics,
  lms: LmsMetrics,
  engagement: EngagementMetrics,
  placement: PlacementMetrics,
  skills: SkillsMetrics,
  feedback: FeedbackMetrics,
  weights: CategoryWeights = DEFAULT_WEIGHTS
): StudentScoreBreakdown {
  const academicScore = calculateAcademicScore(academic);
  const attendanceScore = calculateAttendanceScore(attendance);
  const lmsScore = calculateLmsScore(lms);
  const engagementScore = calculateEngagementScore(engagement);
  const placementScore = calculatePlacementScore(placement);
  const skillsScore = calculateSkillsScore(skills);
  const feedbackScore = calculateFeedbackScore(feedback);

  const compositeScore = Math.round(
    (academicScore * weights.academic) +
    (attendanceScore * weights.attendance) +
    (lmsScore * weights.lms) +
    (engagementScore * weights.engagement) +
    (placementScore * weights.placement) +
    (skillsScore * weights.skills) +
    (feedbackScore * weights.feedback)
  );

  return {
    academicScore,
    attendanceScore,
    lmsScore,
    engagementScore,
    placementScore,
    skillsScore,
    feedbackScore,
    compositeScore: Math.min(100, Math.max(0, compositeScore)),
  };
}

export function determineRiskLevel(score: number): RiskLevel {
  if (score >= 82) return 'High Potential';
  if (score >= 68) return 'On Track';
  if (score >= 52) return 'Moderate Attention';
  return 'High Support Needed';
}

export function runWhatIfSimulation(
  currentBreakdown: StudentScoreBreakdown,
  deltas: {
    attendanceChange: number; // e.g. +10%
    lmsChange: number;        // e.g. +15%
    codingPracticeChange: number; // e.g. +20%
    backlogsCleared: number; // e.g. 1
  },
  weights: CategoryWeights = DEFAULT_WEIGHTS
): {
  projectedBreakdown: StudentScoreBreakdown;
  netScoreGain: number;
  projectedRiskLevel: RiskLevel;
} {
  const simAcademic = Math.min(100, currentBreakdown.academicScore + (deltas.backlogsCleared * 8));
  const simAttendance = Math.min(100, Math.max(0, currentBreakdown.attendanceScore + deltas.attendanceChange));
  const simLms = Math.min(100, Math.max(0, currentBreakdown.lmsScore + deltas.lmsChange));
  const simPlacement = Math.min(100, Math.max(0, currentBreakdown.placementScore + (deltas.codingPracticeChange * 0.35)));

  const projectedComposite = Math.round(
    (simAcademic * weights.academic) +
    (simAttendance * weights.attendance) +
    (simLms * weights.lms) +
    (currentBreakdown.engagementScore * weights.engagement) +
    (simPlacement * weights.placement) +
    (currentBreakdown.skillsScore * weights.skills) +
    (currentBreakdown.feedbackScore * weights.feedback)
  );

  const projectedBreakdown: StudentScoreBreakdown = {
    academicScore: simAcademic,
    attendanceScore: simAttendance,
    lmsScore: simLms,
    engagementScore: currentBreakdown.engagementScore,
    placementScore: simPlacement,
    skillsScore: currentBreakdown.skillsScore,
    feedbackScore: currentBreakdown.feedbackScore,
    compositeScore: projectedComposite,
  };

  return {
    projectedBreakdown,
    netScoreGain: projectedComposite - currentBreakdown.compositeScore,
    projectedRiskLevel: determineRiskLevel(projectedComposite),
  };
}
