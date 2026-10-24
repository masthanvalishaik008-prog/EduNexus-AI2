export type CollegeFeedbackCategory =
  | 'Classroom & Infrastructure'
  | 'Laboratories & Equipment'
  | 'Requested Campus Features & Facilities'
  | 'Digital Portals & Wi-Fi'
  | 'Library & Learning Spaces'
  | 'Campus Canteen & Transport';

export type FeedbackPriority = 'Normal' | 'High' | 'Critical Suggestion';

export type CollegeFeedbackStatus =
  | 'Submitted to College'
  | 'Under Review by Administration'
  | 'Action Plan Approved'
  | 'Resolved & Implemented';

export interface CollegeFeedbackRecord {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  yearSemester: string;
  category: CollegeFeedbackCategory;
  facilityName: string; // e.g., 'Smart Classroom 302', 'Microelectronics Lab', 'Campus Wi-Fi Zone 4'
  ratings: {
    cleanlinessAndEnvironment: number; // 1 - 5
    equipmentAndResources: number; // 1 - 5
    maintenanceAndAcoustics: number; // 1 - 5
    overallRating: number; // 1 - 5
  };
  requestedFeature: string; // The feature or facility a student required from the college
  detailedFeedback: string;
  status: CollegeFeedbackStatus;
  adminResponse?: string;
  adminReviewedBy?: string;
  adminReviewedAt?: string;
  isAnonymized: boolean;
  priority: FeedbackPriority;
  upvotes?: number;
  upvotedBy?: string[];
  createdAt: string;
}

export interface StaffFeedbackRecord {
  id: string;
  staffId: string;
  staffName: string;
  department: string;
  subjectName: string;
  studentId: string;
  studentName: string;
  studentDepartment: string;
  ratings: {
    teachingPedagogy: number; // 1 - 5 (teaching structure, syllabus pacing)
    conceptExplanation: number; // 1 - 5 (clarity, real-world examples)
    problemSolvingSupport: number; // 1 - 5 (doubt resolution, numerical drills)
    approachability: number; // 1 - 5 (mentoring, office hours availability)
    evaluationFairness: number; // 1 - 5 (transparent grading, feedback on tests)
    overallRating: number; // 1 - 5
  };
  strengthsObserved: string;
  constructiveSuggestions: string;
  usefulTakeawayTags: string[]; // e.g. ['Clear Real-World Examples', 'Needs More Numerical Practice', 'Approachable in Labs']
  isAnonymized: boolean;
  createdAt: string;
}

export interface Student360FeedbackRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentDepartment: string;
  staffId: string;
  staffName: string;
  staffRole: string; // e.g. 'Faculty Advisor', 'Lab In-Charge', 'HOD'
  evaluationDimensions: {
    academicRigor: number; // 1 - 5
    laboratoryPractical: number; // 1 - 5
    remainingActivitiesProgress: number; // 1 - 5 (progress on planned boosters, projects, quizzes)
    problemSolvingAptitude: number; // 1 - 5
    consistencyAndAttendance: number; // 1 - 5
    teamworkAndCommunication: number; // 1 - 5
  };
  overallScore360: number; // Calculated or 1 - 5 scale
  performanceSummary: string; // Clear, easy to understand synthesis
  remainingActivitiesFeedback: string; // Specific feedback on their planned/remaining activities
  actionRecommendations: {
    id: string;
    action: string;
    timeframe: string;
    category: 'Academic' | 'Lab Skills' | 'Placement' | 'Remaining Activities';
    completed?: boolean;
  }[];
  endorsementBadge?: 'Exemplary Innovator' | 'Consistent Improver' | 'Core Competency Achiever' | 'Rising Star';
  createdAt: string;
}

export interface StaffReflectionRecord {
  id: string;
  staffId: string;
  staffName: string;
  department: string;
  subjectName: string;
  semester: string;
  reflectionNotes: string;
  pedagogicalImprovements: string[];
  createdAt: string;
}

