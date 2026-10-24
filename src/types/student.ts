export type Department = 'Electronics & Comm (ECE)' | 'Computer Science (CSE)' | 'Information Tech (IT)' | 'Electrical & Electronics (EEE)' | 'Mechanical Eng (MECH)';

export type RiskLevel = 'High Support Needed' | 'Moderate Attention' | 'On Track' | 'High Potential';

export type AlertPriority = 'Urgent' | 'High' | 'Medium' | 'Low';

export type InterventionStatus = 'New' | 'In Review' | 'Session Scheduled' | 'Action Plan Active' | 'Resolved';

export type UserRole = 'Faculty Advisor' | 'Dean of Academics' | 'Placement Officer' | 'Department Head' | 'Student';

export type UserType = 'staff' | 'student';

export interface StudentActivity {
  id: string;
  studentId: string;
  studentName: string;
  department: Department;
  title: string;
  category: 'Academic Booster' | 'Knowledge Refresher' | 'Hands-on Project' | 'Skill & Certification' | 'Peer Study & Seminar' | 'Interactive Quiz' | 'Knowledge Challenge' | 'Flashcard Mastery';
  description: string;
  status: 'Planned' | 'In Progress' | 'Completed';
  progressPct: number; // 0 - 100
  hoursSpent: number;
  dateLogged: string;
  dateCompleted?: string;
  verifiedByStaff?: boolean;
  staffFeedback?: string;
  verifiedByStaffName?: string;
  verifiedAt?: string;
  learningOutcomes?: string;
  semesterSubject?: string;
  mentorName?: string;
  score?: number;
}

export interface AcademicMetrics {
  gpa: number; // 0 - 10 scale
  previousSemesterGpa: number;
  internalAssessmentScore: number; // 0 - 100
  backlogsCount: number;
  totalCreditsCompleted: number;
  coreSubjectAverage: number; // 0 - 100
}

export interface AttendanceMetrics {
  overallPercentage: number; // 0 - 100
  theoryPercentage: number;
  practicalPercentage: number;
  consecutiveAbsences: number;
  monthlyTrend: { month: string; percentage: number }[];
}

export interface LmsMetrics {
  portalLoginsPerWeek: number;
  moduleCompletionRate: number; // 0 - 100
  quizAverageScore: number; // 0 - 100
  assignmentOnTimeRate: number; // 0 - 100
  videoWatchHours: number;
}

export interface EngagementMetrics {
  forumPostsAndAnswers: number;
  extracurricularPoints: number; // 0 - 100
  hackathonsAttended: number;
  seminarAttendance: number;
  clubLeadershipRole: boolean;
}

export type PreferredDomain = 'Embedded Systems & IoT' | 'Electronics Testing' | 'Software Development' | 'Data Analytics';

export interface PlacementMetrics {
  aptitudeScore: number; // 0 - 100
  codingScore: number; // 0 - 100 (LeetCode / HackerRank benchmark)
  mockInterviewRating: number; // 0 - 10
  resumeReadinessScore: number; // 0 - 100
  preferredDomain: PreferredDomain;
  readinessLevel: 'Job Ready' | 'Needs Target Practice' | 'Foundational Stage';
}

export interface SkillsMetrics {
  technicalSkillRating: number; // 0 - 100
  softSkillRating: number; // 0 - 100
  verifiedCertifications: string[];
  primaryTechnologies: string[];
  gitHubProjectsCount: number;
}

export interface FeedbackMetrics {
  facultyRating: number; // 1 - 5
  studentPulseScore: number; // 1 - 5
  satisfactionLevel: 'Very High' | 'High' | 'Moderate' | 'Low';
  primaryConcernArea: string;
  advisorObservationNotes: string;
  isAnonymized: boolean;
}

export interface StudentScoreBreakdown {
  academicScore: number; // 0 - 100
  attendanceScore: number;
  lmsScore: number;
  engagementScore: number;
  placementScore: number;
  skillsScore: number;
  feedbackScore: number;
  compositeScore: number; // Weighted composite 0 - 100
}

export interface Student {
  id: string; // e.g., 'ENX-2024-101'
  name: string;
  email: string;
  gender: string;
  department: Department;
  batch: string; // e.g. '2022-2026'
  semester: number; // 1 - 8
  mentorName: string;
  avatarUrl?: string;

  // 7 Pillars of Data
  academic: AcademicMetrics;
  attendance: AttendanceMetrics;
  lms: LmsMetrics;
  engagement: EngagementMetrics;
  placement: PlacementMetrics;
  skills: SkillsMetrics;
  feedback: FeedbackMetrics;

  // Calculated Analytics
  compositeScore: number;
  riskLevel: RiskLevel;
  breakdown: StudentScoreBreakdown;
  strengths: string[];
  growthAreas: string[];
  loginStreak?: number;
  lastLoginDate?: string;
}

export interface SupportAlert {
  id: string;
  studentId: string;
  studentName: string;
  department: Department;
  title: string;
  triggerCategory: 'Academic' | 'Attendance' | 'LMS' | 'Placement' | 'Compound';
  priority: AlertPriority;
  status: InterventionStatus;
  detectedDate: string;
  evidence: string;
  suggestedAction: string;
  assignedFaculty: string;
  facultyNotes?: string;
  outcomeMetric?: string;
}

export interface InterventionRecord {
  id: string;
  studentId: string;
  studentName: string;
  department: Department;
  type: '1-on-1 Mentoring' | 'Remedial Class' | 'Placement Mock Lab' | 'Peer Study Group' | 'Attendance Counseling';
  facultyLead: string;
  dateScheduled: string;
  dateCompleted?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Follow-up Required';
  initialScore: number;
  postInterventionScore?: number;
  initialMetricNote: string;
  measuredOutcomeNote?: string;
  studentFeedback?: string;
}

export interface CategoryWeights {
  academic: number;
  attendance: number;
  lms: number;
  engagement: number;
  placement: number;
  skills: number;
  feedback: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  details: string;
}

export type PlacementActivityType =
  | 'Training & Bootcamp'
  | 'Drive Application'
  | 'Mock Interview'
  | 'Technical Contest'
  | 'Certification'
  | 'Project Submission';

export interface PlacementActivity {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  type: PlacementActivityType;
  title: string;
  companyOrPlatform?: string;
  roleOrSubject?: string;
  status: 'Pending Review' | 'Verified' | 'Needs Improvement' | 'Applied' | 'In Progress';
  date: string;
  scoreOrRating?: string | number;
  hoursSpent?: number;
  notes?: string;
  proofUrl?: string;
  verifiedBy?: string;
  staffFeedback?: string;
  verifiedAt?: string;
  badge?: string;
}

export interface RecruitmentDrive {
  id: string;
  company: string;
  logoText?: string;
  role: string;
  type: 'Full-Time Placement' | 'Summer Internship' | 'PPO Trainee';
  package: string;
  location: string;
  eligibleBranches: string[];
  minGpa: number;
  minCodingScore: number;
  deadline: string;
  driveDate: string;
  rounds: string[];
  openPositions: number;
  appliedCount: number;
  description: string;
  skillsRequired: string[];
  isApplied?: boolean;
}

export interface PlacementTrainingTrack {
  id: string;
  title: string;
  branch: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Industry Bootcamp';
  durationWeeks: number;
  instructor: string;
  skills: string[];
  modules: { title: string; hours: number; completed?: boolean }[];
  enrolledCount: number;
  batchStartDate: string;
  completionRate: number;
  description: string;
  isEnrolled?: boolean;
}

export interface SkillUpTrainingVideo {
  id: string;
  title: string;
  channel: string;
  duration: string;
  url: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  topicsCovered: string[];
}

export interface SkillUpCertification {
  id: string;
  name: string;
  issuingBody: string;
  examCode: string;
  credentialUrl: string;
  recognizedBy: string[];
  preparationWeeks: number;
  badgeUrl?: string;
  verificationDifficulty: 'Foundational' | 'Industry Standard' | 'Expert Elite';
}

export interface SkillUpModule {
  id: string;
  branch: string;
  skillName: string;
  tagline: string;
  category: 'Core Engineering' | 'High-CTC Industry Demand' | 'Competitive Advantage' | 'Foundational Requirement';
  iconKey: string;
  readinessBoostPct: number;
  level: 'Foundational' | 'Intermediate' | 'Advanced' | 'Industry Elite';
  estimatedHours: number;
  popularJobRoles: string[];
  description: string;
  keyConcepts: string[];
  trainingVideos: SkillUpTrainingVideo[];
  certifications: SkillUpCertification[];
  isCompleted?: boolean;
  completionDate?: string;
  enrolledStudentsCount?: number;
}

export interface PlacementBenchmarkDataPoint {
  competency: string;
  studentScore: number;
  industryBenchmark: number;
  branchAverage: number;
  gap: number;
  status: 'Qualified' | 'Needs Practice' | 'Critical Gap';
}

export interface PlacementBenchmarkResponse {
  branch: string;
  studentName: string;
  studentId: string;
  overallReadinessPct: number;
  dataPoints: PlacementBenchmarkDataPoint[];
  topStrengths: string[];
  criticalGaps: string[];
  prescriptiveRecommendations: string[];
}

export interface StudentPlacementTelemetryItem {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  actionType: 'Applied to Drive' | 'Mastered Skill-Up' | 'Enrolled in Bootcamp' | 'Mock Test Completed' | 'Certification Logged';
  headline: string;
  timestamp: string;
  details: string;
  urgency: 'High' | 'Normal' | 'Commendation';
  badge?: string;
}


