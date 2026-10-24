import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaderboard } from '../Leaderboard';
import { Student, StudentActivity, UserType, Department } from '../../types/student';
import { updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../firebase/AuthContext';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Clock,
  Plus,
  Flame,
  Award,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Target,
  Send,
  MessageSquare,
  ShieldCheck,
  Check,
  AlertCircle,
  FileCheck,
  ArrowRight,
  BookMarked,
  Cpu,
  Binary,
  Compass,
  Lightbulb,
  Newspaper,
  Gamepad2,
  Trophy,
  HelpCircle,
  RefreshCcw,
  Eye,
  X
} from 'lucide-react';
import { getDailyDepartmentQuiz, QuizQuestion } from '../../data/quizQuestions';
import { INITIAL_DAILY_NEWS, DailyNewsItem, getTodayDateString } from '../../data/dailyNews';

interface StudentEngagementProps {
  currentStudent: Student;
  allStudents?: Student[];
  userType: UserType;
  activities: StudentActivity[];
  onAddActivity: (activity: StudentActivity) => void;
  onUpdateActivity: (activity: StudentActivity) => void;
  onNavigateToTab?: (tab: any) => void;
  onSelectStudent?: (studentId: string) => void;
}

// Recommended Curated Learning Plans by Department
const DEPARTMENT_LEARNING_PLANS: Record<
  Department,
  {
    title: string;
    focus: string;
    description: string;
    suggestedHours: number;
    category: StudentActivity['category'];
    subject: string;
    milestones: string[];
  }[]
> = {
  'Electronics & Comm (ECE)': [
    {
      title: 'FreeRTOS Task Scheduling & Mutex Synchronization',
      focus: 'Embedded Firmware Mastery',
      description: 'Design non-blocking sensor acquisition loops with queue communication, task priorities, and mutexes.',
      suggestedHours: 10,
      category: 'Hands-on Project',
      subject: 'Embedded Systems & IoT',
      milestones: [
        'Initialize FreeRTOS kernel on ESP32/STM32',
        'Implement producer-consumer sensor queue',
        'Test priority inversion handling with mutex locks',
      ],
    },
    {
      title: 'Digital Signal Processing: Bilinear Transform & Filter Design',
      focus: 'Academic Coursework Booster',
      description: 'Strengthen mathematical foundations for continuous-to-discrete time IIR filter transformation.',
      suggestedHours: 6,
      category: 'Academic Booster',
      subject: 'Digital Signal Processing',
      milestones: [
        'Derive Bilinear Transformation equations and frequency warping',
        'Compute pole-zero placements for 4th-order Butterworth filter',
        'Simulate impulse response in Python/MATLAB',
      ],
    },
    {
      title: 'ARM Cortex-M Memory Architecture & Startup Assembly',
      focus: 'Knowledge Refresher',
      description: 'Examine vector tables, exception entry sequences, and flash memory layouts in Cortex-M4.',
      suggestedHours: 8,
      category: 'Knowledge Refresher',
      subject: 'Microcontrollers & Architecture',
      milestones: [
        'Analyze linker script section allocation (.text, .data, .bss)',
        'Trace reset handler and system clock initialization',
        'Configure NVIC interrupt priority masks',
      ],
    },
  ],
  'Computer Science (CSE)': [
    {
      title: 'Data Structures & Algorithms Placement Sprint',
      focus: 'Coding Interview Readiness',
      description: 'Master advanced graph algorithms, dynamic programming state formulation, and Trie structures.',
      suggestedHours: 16,
      category: 'Skill & Certification',
      subject: 'Design & Analysis of Algorithms',
      milestones: [
        'Solve 15 LeetCode Medium/Hard DP problems',
        'Implement Dijkstra and Topological Sort from scratch',
        'Benchmark time and space complexities',
      ],
    },
    {
      title: 'Relational Database Concurrency & Query Optimization',
      focus: 'Academic Coursework Booster',
      description: 'Deep-dive into ACID isolation levels, B+ Tree index structures, and query execution plans in PostgreSQL.',
      suggestedHours: 8,
      category: 'Academic Booster',
      subject: 'Database Management Systems',
      milestones: [
        'Explain MVCC and phantom read anomalies',
        'Analyze EXPLAIN ANALYZE execution cost trees',
        'Optimize slow nested loop join queries with compound indexes',
      ],
    },
  ],
  'Information Tech (IT)': [
    {
      title: 'Data Engineering ETL Pipeline with Python & SQL',
      focus: 'Hands-on Domain Mastery',
      description: 'Construct automated data ingestion, schema validation, and reporting pipelines for analytics.',
      suggestedHours: 12,
      category: 'Hands-on Project',
      subject: 'Big Data & Cloud Analytics',
      milestones: [
        'Ingest multi-source JSON/CSV datasets',
        'Perform schema validation and null cleansing',
        'Load into PostgreSQL data warehouse table',
      ],
    },
    {
      title: 'Network Protocol Diagnostics & Packet Inspection',
      focus: 'Knowledge Refresher',
      description: 'Trace TCP 3-way handshakes, TLS negotiation, and DNS resolution flows using Wireshark.',
      suggestedHours: 6,
      category: 'Knowledge Refresher',
      subject: 'Computer Networks',
      milestones: [
        'Capture and analyze TCP SYN/ACK sequence numbers',
        'Inspect HTTP/2 multiplexed frame headers',
        'Evaluate packet drop retransmission triggers',
      ],
    },
  ],
  'Electrical & Electronics (EEE)': [
    {
      title: 'Smart Grid Power Electronics & Inverter Control',
      focus: 'Core Electrical Engineering',
      description: 'Analyze PWM modulation indices, harmonic filters, and grid synchronization loops.',
      suggestedHours: 10,
      category: 'Hands-on Project',
      subject: 'Power Electronics',
      milestones: ['Simulate 3-phase SPWM inverter', 'Analyze total harmonic distortion (THD)', 'Test PLL synchronization'],
    },
  ],
  'Mechanical Eng (MECH)': [
    {
      title: 'Finite Element Analysis & Thermal Stress Simulation',
      focus: 'Advanced CAD & CAE',
      description: 'Perform static structural and transient thermal analysis on turbine blade assemblies.',
      suggestedHours: 12,
      category: 'Hands-on Project',
      subject: 'Computer Aided Engineering',
      milestones: ['Mesh convergence study', 'Apply boundary load and thermal flux constraints', 'Evaluate safety factor'],
    },
  ],
};

// Branch Daily News Ticker & Academic Briefs
const DEPARTMENT_DAILY_NEWS: Record<
  Department,
  { id: string; date: string; title: string; category: string; content: string; readTime: string }[]
> = {
  'Electronics & Comm (ECE)': [
    {
      id: 'NEWS-1',
      date: 'Today',
      title: 'IEEE Embedded Systems Bulletin: STM32H7 Dual-Core Efficiency Breakthrough',
      category: 'Hardware & IoT',
      content: 'Researchers demonstrate 45% lower power consumption on Cortex-M7 edge inference loops by utilizing hardware DMA transfer arbitration.',
      readTime: '3 min read',
    },
    {
      id: 'NEWS-2',
      date: 'Yesterday',
      title: 'Department Notice: DSP Filter Design & IIR Lab Practicals Schedule',
      category: 'Academic Notice',
      content: 'All 6th semester ECE students must complete MATLAB/Python frequency response simulations prior to Friday s lab viva.',
      readTime: '2 min read',
    },
  ],
  'Computer Science (CSE)': [
    {
      id: 'NEWS-1',
      date: 'Today',
      title: 'ACM Computing Digest: FlashAttention-3 Solves Transformer Memory Bandwidth Limits',
      category: 'Artificial Intelligence',
      content: 'New GPU tensor core scheduling algorithms optimize KV-cache memory layout, accelerating large language model inference speed by 2.8x.',
      readTime: '4 min read',
    },
    {
      id: 'NEWS-2',
      date: 'Yesterday',
      title: 'Competitive Programming: Annual Inter-College Algorithmic Sprint Announced',
      category: 'Placement & Coding',
      content: 'Registration for the university-wide code hackathon opens today on the LeetCode Campus portal. Prizes sponsored by major tech recruiters.',
      readTime: '2 min read',
    },
  ],
  'Information Tech (IT)': [
    {
      id: 'NEWS-1',
      date: 'Today',
      title: 'Cloud Data Daily: PostgreSQL 17 Query Optimizer Enhancements',
      category: 'Data Engineering',
      content: 'New memory-mapped hash aggregation routines reduce execution time for analytical joins across terabyte-scale tables.',
      readTime: '3 min read',
    },
    {
      id: 'NEWS-2',
      date: 'Yesterday',
      title: 'Data Analytics Workshop: Predictive Modeling with Python & Pandas',
      category: 'Skill Seminar',
      content: 'Departmental seminar on scalable feature engineering scheduled in IT Seminar Hall at 3 PM today.',
      readTime: '2 min read',
    },
  ],
  'Electrical & Electronics (EEE)': [
    {
      id: 'NEWS-1',
      date: 'Today',
      title: 'Smart Grid Tech: SiC Power Semiconductors in EV Fast Chargers',
      category: 'Power Systems',
      content: 'Wide-bandgap silicon carbide modules reduce thermal dissipation in 350kW ultra-fast electric vehicle charging stations.',
      readTime: '3 min read',
    },
  ],
  'Mechanical Eng (MECH)': [
    {
      id: 'NEWS-1',
      date: 'Today',
      title: 'Robotics & Mechatronics: Collaborative Cobots in Automated Manufacturing',
      category: 'Industrial Automation',
      content: 'New force-torque sensor calibration protocols allow industrial robotic arms to perform sub-millimeter precision assembly.',
      readTime: '3 min read',
    },
  ],
};

// Interactive Branch & Science Knowledge Quiz / Mini-Game
const DEPARTMENT_QUIZZES: Record<
  Department,
  { id: number; question: string; options: string[]; correctIndex: number; explanation: string; subject: string }[]
> = {
  'Electronics & Comm (ECE)': [
    {
      id: 1,
      subject: 'Embedded Systems',
      question: 'What is the primary purpose of a Mutex in Real-Time Operating Systems (FreeRTOS)?',
      options: [
        'To allocate heap memory dynamically',
        'To protect shared critical resources from simultaneous multi-task race conditions',
        'To generate PWM clock signals for servo motors',
        'To speed up floating point multiplication'
      ],
      correctIndex: 1,
      explanation: 'A Mutex (Mutual Exclusion) ensures that only one task accesses a shared resource at a time, preventing race conditions.'
    },
    {
      id: 2,
      subject: 'Digital Signal Processing',
      question: 'What type of filter has a strictly linear phase frequency response?',
      options: [
        'IIR Butterworth filter',
        'Chebyshev Type II filter',
        'FIR (Finite Impulse Response) filter with symmetric coefficients',
        'Analog RC low-pass filter'
      ],
      correctIndex: 2,
      explanation: 'FIR filters with symmetric impulse response coefficients inherently possess exact linear phase across all frequencies.'
    },
  ],
  'Computer Science (CSE)': [
    {
      id: 1,
      subject: 'Algorithms',
      question: 'What is the worst-case time complexity of randomized Quicksort when choosing suboptimal pivots?',
      options: ['O(N log N)', 'O(N)', 'O(N^2)', 'O(log N)'],
      correctIndex: 2,
      explanation: 'In the worst-case scenario where consistently poor pivots are chosen, Quicksort degrades to O(N^2).'
    },
    {
      id: 2,
      subject: 'Database Systems',
      question: 'Which ACID property ensures that transactions are committed or fully rolled back as an atomic unit?',
      options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
      correctIndex: 0,
      explanation: 'Atomicity guarantees that all operations within a transaction complete successfully; if any fails, the transaction is rolled back.'
    },
  ],
  'Information Tech (IT)': [
    {
      id: 1,
      subject: 'Data Analytics & SQL',
      question: 'Which SQL clause is executed after grouping rows to filter aggregated results?',
      options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'],
      correctIndex: 1,
      explanation: 'The HAVING clause filters aggregated groups (e.g., HAVING COUNT(*) > 5), whereas WHERE filters rows prior to grouping.'
    },
  ],
  'Electrical & Electronics (EEE)': [
    {
      id: 1,
      subject: 'Power Systems',
      question: 'What is the main advantage of High Voltage Direct Current (HVDC) transmission over AC?',
      options: ['Zero reactive power losses and no skin effect over long distances', 'Easier voltage step-up using transformers', 'Lower insulation cost', 'No need for rectifiers'],
      correctIndex: 0,
      explanation: 'HVDC transmission eliminates reactive power charging currents and skin effect, making it highly efficient for submarine and long-distance bulk power transfer.'
    },
  ],
  'Mechanical Eng (MECH)': [
    {
      id: 1,
      subject: 'Mechatronics',
      question: 'Which sensor is commonly used to measure angular velocity in robotics?',
      options: ['Thermocouple', 'Gyroscope', 'Strain gauge', 'Pitot tube'],
      correctIndex: 1,
      explanation: 'A gyroscope measures rate of rotation around an axis (angular velocity in degrees or radians per second).'
    },
  ],
};

export function StudentEngagement({
  currentStudent,
  allStudents,
  userType,
  activities,
  onAddActivity,
  onUpdateActivity,
  onSelectStudent,
}: StudentEngagementProps) {
  const { guestUserName } = useAuth();
  const [engagementTab, setEngagementTab] = useState<'badges' | 'knowledge' | 'minigame' | 'news' | 'plans'>(
    userType === 'student' ? 'badges' : 'knowledge'
  );
  const [selectedCuratedPlan, setSelectedCuratedPlan] = useState<any>(null);
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

  // 10 Daily Quiz Questions & News State (Updated Daily)
  const [dailyQuizzes, setDailyQuizzes] = useState<QuizQuestion[]>(() =>
    getDailyDepartmentQuiz(currentStudent.department)
  );
  const [dailyNewsList, setDailyNewsList] = useState<DailyNewsItem[]>(() =>
    INITIAL_DAILY_NEWS[currentStudent.department] || INITIAL_DAILY_NEWS['Electronics & Comm (ECE)']
  );
  const [isGeneratingNews, setIsGeneratingNews] = useState<boolean>(false);
  const [newNewsTitle, setNewNewsTitle] = useState<string>('');
  const [newNewsContent, setNewNewsContent] = useState<string>('');
  const [newNewsCategory, setNewNewsCategory] = useState<string>('Department Innovation');
  const [isPublishNewsOpen, setIsPublishNewsOpen] = useState<boolean>(false);

  // Synchronize on department change
  useEffect(() => {
    setDailyQuizzes(getDailyDepartmentQuiz(currentStudent.department));
    setDailyNewsList(INITIAL_DAILY_NEWS[currentStudent.department] || []);
    setCurrentQuestionIndex(0);
    setQuizAnswers({});
  }, [currentStudent.department]);

  // Backend Knowledge Activities state
  const [knowledgeSubTab, setKnowledgeSubTab] = useState<'quizzes' | 'flashcards' | 'challenges'>('quizzes');
  const [backendQuizzes, setBackendQuizzes] = useState<any[]>([]);
  const [backendFlashcards, setBackendFlashcards] = useState<any[]>([]);
  const [backendChallenges, setBackendChallenges] = useState<any[]>([]);
  const [masteredFlashcardIds, setMasteredFlashcardIds] = useState<string[]>([]);
  const [currentFlashcardIdx, setCurrentFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [challengeSolutions, setChallengeSolutions] = useState<Record<string, string>>({});
  const [submittingChallengeId, setSubmittingChallengeId] = useState<string | null>(null);

  // Load knowledge modules & student profile from backend
  useEffect(() => {
    fetch(`/api/student-engagement/knowledge-modules?department=${encodeURIComponent(currentStudent.department)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          if (data.quizzes && data.quizzes.length >= 10) setBackendQuizzes(data.quizzes);
          if (data.flashcards) setBackendFlashcards(data.flashcards);
          if (data.challenges) setBackendChallenges(data.challenges);
        }
      })
      .catch((err) => console.warn('Failed to load knowledge modules from backend:', err));

    fetch(`/api/student-engagement/daily-news?department=${encodeURIComponent(currentStudent.department)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.news) && data.news.length > 0) {
          setDailyNewsList((prev) => {
            const map = new Map<string, DailyNewsItem>();
            prev.forEach((n) => map.set(n.id, n));
            data.news.forEach((n: any) => map.set(n.id, n));
            return Array.from(map.values());
          });
        }
      })
      .catch((err) => console.warn('Failed to load daily news from backend:', err));

    fetch(`/api/student-engagement/student/${currentStudent.id}/knowledge-profile`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.masteredCardIds) {
          setMasteredFlashcardIds(data.masteredCardIds);
        }
      })
      .catch((err) => console.warn('Failed to load student knowledge profile:', err));
  }, [currentStudent.id, currentStudent.department]);

  const handleToggleFlashcardMastery = async (flashcardId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setMasteredFlashcardIds((prev) =>
      newStatus ? [...prev, flashcardId] : prev.filter((id) => id !== flashcardId)
    );

    try {
      const res = await fetch('/api/student-engagement/flashcard-mastery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentStudent.id,
          flashcardId,
          mastered: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(newStatus ? 'Concept marked as Mastered in backend! (+15 XP)' : 'Card marked for Review.');
      }
    } catch (e) {
      console.warn('Flashcard mastery sync warning:', e);
    }
  };

  const handleSubmitChallenge = async (challenge: any) => {
    const notes = challengeSolutions[challenge.id] || 'Completed architectural tasks and verified test scenarios.';
    setSubmittingChallengeId(challenge.id);
    try {
      const res = await fetch('/api/student-engagement/submit-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentStudent.id,
          studentName: currentStudent.name,
          department: currentStudent.department,
          challengeId: challenge.id,
          solutionNotes: notes,
          hoursSpent: 3,
        }),
      });
      const data = await res.json();
      if (data.success && data.activity) {
        onAddActivity(data.activity);
        showToast(`Challenge '${challenge.title}' verified & saved to backend database! (+${data.xpEarned} XP)`);
      }
    } catch (err) {
      console.warn('Challenge submission error:', err);
    } finally {
      setSubmittingChallengeId(null);
    }
  };

  // Staff View State
  const [staffScope, setStaffScope] = useState<'selected' | 'all'>('selected');
  const [staffStatusFilter, setStaffStatusFilter] = useState<'all' | 'pending' | 'verified' | 'quiz'>('all');

  // Gamification State
  const [xp, setXp] = useState(() => parseInt(localStorage.getItem(`xp_${currentStudent.id}`) || '150'));
  const [level, setLevel] = useState(() => parseInt(localStorage.getItem(`level_${currentStudent.id}`) || '1'));
  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem(`streak_${currentStudent.id}`) || '3'));
  const [levelUpModal, setLevelUpModal] = useState<{ newLevel: number } | null>(null);

  const addXp = (amount: number) => {
    const nextXp = xp + amount;
    setXp(nextXp);
    localStorage.setItem(`xp_${currentStudent.id}`, nextXp.toString());

    const requiredForNext = level * 250;
    if (nextXp >= requiredForNext) {
      const nextLevel = level + 1;
      setLevel(nextLevel);
      localStorage.setItem(`level_${currentStudent.id}`, nextLevel.toString());
      setLevelUpModal({ newLevel: nextLevel });
    }
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Modal State for New Activity
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<StudentActivity['category']>('Academic Booster');
  const [newHours, setNewHours] = useState<string>('6');
  const [newSubject, setNewSubject] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newLearnings, setNewLearnings] = useState<string>('');
  const [feedbackInput, setFeedbackInput] = useState<Record<string, string>>({});

  // Auto-save draft activity log to localStorage every 5 seconds while typing
  useEffect(() => {
    const draftKey = `edunexus_activity_draft_${currentStudent.id}`;

    // Load draft on mount
    try {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.newTitle) setNewTitle(parsed.newTitle);
        if (parsed.newCategory) setNewCategory(parsed.newCategory);
        if (parsed.newHours) setNewHours(parsed.newHours);
        if (parsed.newSubject) setNewSubject(parsed.newSubject);
        if (parsed.newDescription) setNewDescription(parsed.newDescription);
        if (parsed.newLearnings) setNewLearnings(parsed.newLearnings);
      }
    } catch {
      // ignore
    }

    const timer = setTimeout(() => {
      try {
        const draftData = {
          newTitle,
          newCategory,
          newHours,
          newSubject,
          newDescription,
          newLearnings,
          updatedAt: new Date().toLocaleTimeString(),
        };
        localStorage.setItem(draftKey, JSON.stringify(draftData));
      } catch {
        // ignore
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [newTitle, newCategory, newHours, newSubject, newDescription, newLearnings, currentStudent.id]);

  // Mini-Game Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // Compute activities visible based on user role and staff filter
  const visibleActivities = activities.filter((a) => {
    if (userType === 'student') {
      return a.studentId === currentStudent.id;
    }
    // Staff view:
    if (staffScope === 'selected' && a.studentId !== currentStudent.id) {
      return false;
    }
    if (staffStatusFilter === 'pending') return !a.verifiedByStaff;
    if (staffStatusFilter === 'verified') return a.verifiedByStaff;
    if (staffStatusFilter === 'quiz') return a.category === 'Interactive Quiz';
    return true;
  });

  const studentActivities = visibleActivities;
  const curatedPlans = DEPARTMENT_LEARNING_PLANS[currentStudent.department] || DEPARTMENT_LEARNING_PLANS['Computer Science (CSE)'];
  const departmentNews = dailyNewsList;
  const departmentQuizzes = dailyQuizzes;

  const completedCount = studentActivities.filter((a) => a.status === 'Completed').length;
  const inProgressCount = studentActivities.filter((a) => a.status === 'In Progress').length;
  const plannedCount = studentActivities.filter((a) => a.status === 'Planned').length;
  const totalHoursLogged = studentActivities.reduce((acc, curr) => acc + (curr.hoursSpent || 0), 0);

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const activity: StudentActivity = {
      id: `ACT-${Date.now().toString().slice(-4)}`,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      department: currentStudent.department,
      title: newTitle.trim(),
      category: newCategory,
      description: newDescription.trim() || 'Custom academic activity logged by student.',
      status: 'In Progress',
      progressPct: 30,
      hoursSpent: parseInt(newHours) || 6,
      dateLogged: new Date().toISOString().split('T')[0],
      learningOutcomes: newLearnings.trim() || 'Mastery of core concepts and problem solving.',
      semesterSubject: newSubject.trim() || 'Engineering Core',
      mentorName: currentStudent.mentorName,
      verifiedByStaff: false,
    };

    onAddActivity(activity);
    addXp(25);

    // Save to Backend REST Database
    fetch('/api/student-engagement/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity),
    }).catch((err) => console.warn('Backend activity sync failed:', err));

    setIsModalOpen(false);
    setNewTitle('');
    setNewSubject('');
    setNewDescription('');
    setNewLearnings('');
    showToast(`Activity saved to backend database! (+25 XP) Notified ${currentStudent.mentorName}.`);
  };

  const handleAdoptPlan = (plan: typeof curatedPlans[0]) => {
    const existing = activities.some((a) => a.studentId === currentStudent.id && a.title === plan.title);
    if (existing) {
      showToast('This learning plan is already in your activities list!');
      return;
    }

    const activity: StudentActivity = {
      id: `ACT-${Date.now().toString().slice(-4)}`,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      department: currentStudent.department,
      title: plan.title,
      category: plan.category,
      description: plan.description,
      status: 'In Progress',
      progressPct: 25,
      hoursSpent: plan.suggestedHours,
      dateLogged: new Date().toISOString().split('T')[0],
      learningOutcomes: `Working through milestones: ${plan.milestones.join('; ')}`,
      semesterSubject: plan.subject,
      mentorName: currentStudent.mentorName,
      verifiedByStaff: false,
    };

    onAddActivity(activity);
    addXp(40);

    // Save to Backend REST Database
    fetch('/api/student-engagement/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity),
    }).catch((err) => console.warn('Backend activity sync failed:', err));

    showToast(`Adopted '${plan.title}'! (+40 XP) Saved to backend database & synced with advisor.`);
  };

  const handleCompleteActivity = (act: StudentActivity) => {
    const updated: StudentActivity = {
      ...act,
      status: 'Completed',
      progressPct: 100,
      dateCompleted: new Date().toISOString().split('T')[0],
    };
    onUpdateActivity(updated);
    addXp(75);

    // Update in Backend REST Database
    fetch('/api/student-engagement/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch((err) => console.warn('Backend activity completion sync failed:', err));

    showToast(`Congratulations! '${act.title}' marked as Completed in backend database (+75 XP).`);
  };

  const handleStaffVerify = async (act: StudentActivity) => {
    const customNote = feedbackInput[act.id] || 'Verified and approved by faculty advisor. High academic diligence commended.';
    const updated: StudentActivity = {
      ...act,
      verifiedByStaff: true,
      staffFeedback: customNote,
      verifiedByStaffName: 'Faculty Advisor',
      verifiedAt: new Date().toISOString(),
    };
    onUpdateActivity(updated);

    // Update Backend REST Database
    try {
      await fetch(`/api/student-engagement/activities/${act.id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffFeedback: customNote,
          verifiedByStaffName: 'Faculty Advisor',
        }),
      });
    } catch (e) {
      console.warn('Backend activity verification failed:', e);
    }

    showToast(`Verified '${act.title}' for ${act.studentName}! Stored in backend database.`);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl border border-blue-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom duration-300 max-w-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium leading-relaxed">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-700/50 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-200 border border-blue-400/40 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-300 animate-pulse" />
                Student Engagement & Academic Hub
              </span>
              <span className="text-[11px] text-blue-200/80 font-mono">
                {currentStudent.department} · Sem {currentStudent.semester}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {userType === 'student' ? (
                <>Welcome, {currentStudent.name} 👋</>
              ) : (
                <>Faculty Workspace: {guestUserName || 'Faculty Advisor'}</>
              )}
            </h1>

            <p className="text-xs md:text-sm text-blue-100/90 leading-relaxed">
              {userType === 'student'
                ? `Plan academic activities, read daily departmental news briefings, and play interactive branch knowledge mini-games while keeping your assigned advisor (${currentStudent.mentorName}) updated.`
                : `Review and verify learning activities for ${currentStudent.name} (${currentStudent.id}). Activities logged by department students update here in real time.`}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-blue-200/80">
              {userType === 'student' ? (
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Assigned Faculty Advisor: <strong className="text-white">{currentStudent.mentorName}</strong></span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span>Inspecting Student: <strong className="text-white">{currentStudent.name} ({currentStudent.id})</strong></span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-blue-300" />
                <span>Student Risk Status: <strong className="text-white">{currentStudent.riskLevel}</strong></span>
              </div>
            </div>

            {/* Staff Advisor Controls & Student Roster Selector */}
            {userType === 'staff' && (
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20">
                  <span className="text-xs font-semibold text-blue-200">Advisor View:</span>
                  <select
                    value={staffScope === 'all' ? 'ALL' : currentStudent.id}
                    onChange={(e) => {
                      if (e.target.value === 'ALL') {
                        setStaffScope('all');
                      } else {
                        setStaffScope('selected');
                        onSelectStudent?.(e.target.value);
                      }
                    }}
                    className="bg-slate-900/90 text-white font-bold text-xs p-1.5 rounded-xl border border-blue-400/40 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Advisees & Students (Campus-wide)</option>
                    {allStudents?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.id} · {s.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/20 text-xs">
                  <button
                    onClick={() => setStaffStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                      staffStatusFilter === 'all' ? 'bg-white text-slate-900' : 'text-blue-100 hover:text-white'
                    }`}
                  >
                    All ({activities.length})
                  </button>
                  <button
                    onClick={() => setStaffStatusFilter('pending')}
                    className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                      staffStatusFilter === 'pending' ? 'bg-amber-400 text-slate-900' : 'text-blue-100 hover:text-white'
                    }`}
                  >
                    Pending Review ({activities.filter((a) => !a.verifiedByStaff).length})
                  </button>
                  <button
                    onClick={() => setStaffStatusFilter('verified')}
                    className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                      staffStatusFilter === 'verified' ? 'bg-emerald-400 text-slate-900' : 'text-blue-100 hover:text-white'
                    }`}
                  >
                    Verified ({activities.filter((a) => a.verifiedByStaff).length})
                  </button>
                  <button
                    onClick={() => setStaffStatusFilter('quiz')}
                    className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                      staffStatusFilter === 'quiz' ? 'bg-purple-400 text-slate-900' : 'text-blue-100 hover:text-white'
                    }`}
                  >
                    Quizzes ({activities.filter((a) => a.category === 'Interactive Quiz').length})
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Trigger */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Plan New Activity</span>
            </button>
          </div>
        </div>

        {/* Metrics Counter Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-center">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
            <div className="text-[11px] text-blue-200/80 font-semibold uppercase tracking-wider">Completed</div>
            <div className="text-xl md:text-2xl font-black font-mono text-emerald-400 mt-0.5">
              {completedCount}
            </div>
            <div className="text-[10px] text-blue-300/70">Verified Activities</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
            <div className="text-[11px] text-blue-200/80 font-semibold uppercase tracking-wider">In Progress</div>
            <div className="text-xl md:text-2xl font-black font-mono text-amber-300 mt-0.5">
              {inProgressCount}
            </div>
            <div className="text-[10px] text-blue-300/70">Active Plans</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
            <div className="text-[11px] text-blue-200/80 font-semibold uppercase tracking-wider">Planned</div>
            <div className="text-xl md:text-2xl font-black font-mono text-blue-300 mt-0.5">
              {plannedCount}
            </div>
            <div className="text-[10px] text-blue-300/70">Upcoming Sprints</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
            <div className="text-[11px] text-blue-200/80 font-semibold uppercase tracking-wider">Hours Logged</div>
            <div className="text-xl md:text-2xl font-black font-mono text-white mt-0.5">
              {totalHoursLogged} hrs
            </div>
            <div className="text-[10px] text-blue-300/70">Dedicated Learning</div>
          </div>
        </div>

        {/* Dynamic Visual Progress Bar & Level-Up Tracker */}
        <div className="mt-5 pt-5 border-t border-white/15 bg-white/5 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-xs shadow-md shadow-orange-500/30">
                Lv.{level}
              </span>
              <div>
                <div className="text-xs font-bold text-white">Academic Journey & Level Progress</div>
                <div className="text-[10px] text-blue-200">Earn XP by completing learning plans, lab challenges & quizzes</div>
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold bg-white/10 px-3 py-1 rounded-xl text-amber-300 border border-white/20">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>{xp} XP Total ({xp % 250}/250 to Lv.{level + 1})</span>
            </div>
          </div>

          <div className="relative w-full h-3.5 bg-slate-900/80 rounded-full overflow-hidden p-0.5 border border-white/20">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-400 rounded-full shadow-lg relative"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.round(((xp % 250) / 250) * 100))}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
            </motion.div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-blue-200/90 mt-1.5 font-medium">
            <span>Level {level} Scholar</span>
            <span className="text-emerald-300 font-bold">{Math.min(100, Math.round(((xp % 250) / 250) * 100))}% Progress to Level {level + 1}</span>
            <span>Level {level + 1} Elite</span>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-1.5 shadow-xs flex flex-wrap items-center gap-2">
        <button
          onClick={() => setEngagementTab('badges')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            engagementTab === 'badges'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Trophy className="w-4 h-4 text-blue-200" />
          <span>🏆 Student Achievements & Rewards</span>
        </button>



        <button
          onClick={() => setEngagementTab('minigame')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            engagementTab === 'minigame'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Gamepad2 className="w-4 h-4 text-purple-300" />
          <span>🎯 10-Question Daily Quiz ({departmentQuizzes.length} Questions)</span>
        </button>

        <button
          onClick={() => setEngagementTab('news')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            engagementTab === 'news'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Newspaper className="w-4 h-4 text-blue-200" />
          <span>📰 Daily News Briefings (Updated Daily)</span>
        </button>

        <button
          onClick={() => setEngagementTab('plans')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            engagementTab === 'plans'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4 text-slate-400" />
          <span>Curated Plans & Logged Activities ({studentActivities.length})</span>
        </button>
      </div>

      {/* TAB 1: CURATED PLANS & ACTIVITIES LOG */}
      {engagementTab === 'plans' && (
        <div className="space-y-6">
          {/* Curated Pathways */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-blue-700 text-xs font-bold mb-1">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  <span>Recommended Curated Pathways for {currentStudent.department}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Knowledge Improvement & Academic Enrichment Plans
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Structured action plans engineered by department faculty to boost conceptual understanding, exam performance, and hands-on laboratory mastery.
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                {curatedPlans.length} Curated Tracks
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {curatedPlans.map((plan, idx) => {
                const isAlreadyAdopted = studentActivities.some((a) => a.title === plan.title);
                return (
                  <div
                    key={idx}
                    className="border border-slate-200/90 rounded-2xl p-5 bg-gradient-to-br from-white to-slate-50/60 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {plan.category}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {plan.suggestedHours} hrs
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm tracking-tight group-hover:text-blue-600 transition-colors">
                        {plan.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {plan.description}
                      </p>

                      <div className="space-y-1 pt-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Milestones:</div>
                        {plan.milestones.map((m, i) => (
                          <div key={i} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                            <span className="truncate">{m}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedCuratedPlan(plan)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        Learn More <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      {userType !== 'staff' && (
                        <button
                          onClick={() => handleAdoptPlan(plan)}
                          disabled={isAlreadyAdopted}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isAlreadyAdopted
                              ? 'bg-emerald-100 text-emerald-800 cursor-default border border-emerald-200'
                              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                          }`}
                        >
                          {isAlreadyAdopted ? '✓ Adopted' : '+ Adopt Plan'}
                        </button>
                      )}
                      {userType === 'staff' && (
                        <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-xl">
                          Faculty Observation Mode
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Student Logged Activities List */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Active Activities & Learning Progress Log
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track hours spent, completion status, and advisor feedback for {currentStudent.name}.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                  Total: {studentActivities.length} items
                </span>
              </div>
            </div>

            {studentActivities.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-700 text-sm">No activities logged yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Adopt a curated learning plan above or click 'Plan New Activity' to record your coursework progress.
                </p>
                {userType !== 'staff' && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    Plan First Activity
                  </button>
                )}
                {userType === 'staff' && (
                  <p className="mt-2 text-xs text-slate-400 font-medium">
                    Faculty Observation Mode: Students log and manage their own activity logs. You can review, verify, and add faculty remarks.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3.5">
                {studentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="border border-slate-200/90 rounded-2xl p-5 bg-white hover:border-blue-300 transition-all space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {userType === 'staff' && (
                            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                              {act.studentName} ({act.studentId})
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              act.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : act.status === 'In Progress'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {act.status}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            {act.category}
                          </span>
                          {act.verifiedByStaff && (
                            <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-purple-600" />
                              <span>Verified by Advisor</span>
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-slate-900 text-sm">{act.title}</h4>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                          <span>Subject: <strong className="text-slate-700">{act.semesterSubject || 'Engineering Core'}</strong></span>
                          <span>·</span>
                          <span>Hours: <strong className="text-slate-700">{act.hoursSpent} hrs</strong></span>
                          <span>·</span>
                          <span>Logged: <strong className="text-slate-700">{act.dateLogged}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {act.status !== 'Completed' && (
                          <button
                            onClick={() => handleCompleteActivity(act)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark as Completed</span>
                          </button>
                        )}

                        {userType === 'staff' && !act.verifiedByStaff && (
                          <button
                            onClick={() => handleStaffVerify(act)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verify & Commend</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {act.description}
                    </p>

                    {userType === 'staff' && !act.verifiedByStaff && (
                      <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl flex flex-wrap items-center gap-2 text-xs">
                        <MessageSquare className="w-4 h-4 text-purple-600 shrink-0" />
                        <input
                          type="text"
                          placeholder="Advisor remark: e.g. Outstanding work, coursework milestone approved..."
                          value={feedbackInput[act.id] || ''}
                          onChange={(e) => setFeedbackInput((prev) => ({ ...prev, [act.id]: e.target.value }))}
                          className="flex-1 min-w-[220px] bg-white border border-purple-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <button
                          onClick={() => handleStaffVerify(act)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verify & Save</span>
                        </button>
                      </div>
                    )}

                    {act.learningOutcomes && (
                      <div className="text-xs text-slate-700 flex items-start gap-1.5">
                        <span className="font-bold text-blue-700 shrink-0">Key Learnings:</span>
                        <span className="italic">{act.learningOutcomes}</span>
                      </div>
                    )}

                    {act.staffFeedback && (
                      <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Faculty Advisor Note ({act.mentorName}):</span>{' '}
                          <span>{act.staffFeedback}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: KNOWLEDGE BOOSTER & ACADEMIC DRILLS */}
      {engagementTab === 'knowledge' && (
        <div className="space-y-6">
          {/* Knowledge Header Card */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 border border-emerald-700/50 rounded-3xl p-6 text-white shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold mb-1">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Curricular Knowledge Enhancement & Conceptual Drills</span>
                </div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Academic Knowledge Hub: {currentStudent.department}
                </h2>
                <p className="text-xs text-emerald-100/80 mt-0.5 max-w-2xl leading-relaxed">
                  Deepen conceptual grasp across core subjects, test your knowledge with verified branch flashcards, and submit hands-on engineering challenges directly to the backend database for advisor review.
                </p>
              </div>

              {/* Metrics Badge */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
                  <div className="text-[10px] text-emerald-200 uppercase font-bold">Concepts Mastered</div>
                  <div className="text-lg font-black font-mono text-emerald-400">
                    {masteredFlashcardIds.length} / {backendFlashcards.length || 6}
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
                  <div className="text-[10px] text-teal-200 uppercase font-bold">Lab Challenges</div>
                  <div className="text-lg font-black font-mono text-white">
                    {backendChallenges.length || 2} Available
                  </div>
                </div>
              </div>
            </div>

            {/* Knowledge Mode Switcher */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setKnowledgeSubTab('flashcards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  knowledgeSubTab === 'flashcards'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-emerald-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Concept Mastery Flashcards ({backendFlashcards.length})</span>
              </button>

              <button
                onClick={() => setKnowledgeSubTab('challenges')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  knowledgeSubTab === 'challenges'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-emerald-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Hands-on Lab Challenges ({backendChallenges.length})</span>
              </button>

              <button
                onClick={() => setKnowledgeSubTab('quizzes')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  knowledgeSubTab === 'quizzes'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-emerald-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Subject Quizzes ({backendQuizzes.length})</span>
              </button>
            </div>
          </div>

          {/* SUBTAB 1: CONCEPT FLASHCARDS */}
          {knowledgeSubTab === 'flashcards' && (
            <div className="space-y-6">
              {backendFlashcards.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-xs space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        CARD {currentFlashcardIdx + 1} OF {backendFlashcards.length} · {backendFlashcards[currentFlashcardIdx].subject}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        Interactive Conceptual Flashcard Drill
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsFlipped(false);
                          setCurrentFlashcardIdx((prev) => (prev > 0 ? prev - 1 : backendFlashcards.length - 1));
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                      >
                        ← Prev
                      </button>
                      <button
                        onClick={() => {
                          setIsFlipped(false);
                          setCurrentFlashcardIdx((prev) => (prev < backendFlashcards.length - 1 ? prev + 1 : 0));
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                      >
                        Next →
                      </button>
                    </div>
                  </div>

                  {/* The Interactive Flip Card */}
                  {(() => {
                    const card = backendFlashcards[currentFlashcardIdx];
                    const isMastered = masteredFlashcardIds.includes(card.id);

                    return (
                      <div className="space-y-4">
                        <div
                          onClick={() => setIsFlipped(!isFlipped)}
                          className={`min-h-[220px] p-6 lg:p-8 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-xs select-none ${
                            isFlipped
                              ? 'bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-indigo-700'
                              : 'bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 text-slate-900 border-emerald-200 hover:border-emerald-400'
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isFlipped ? 'bg-indigo-500/30 text-indigo-200' : 'bg-emerald-100 text-emerald-800'}`}>
                                {isFlipped ? 'REVERSE · DEFINITION & APPLICATION' : 'FRONT · CONCEPT TERM'}
                              </span>
                              <span className="text-[11px] font-mono opacity-60">Click card to flip ↺</span>
                            </div>

                            {!isFlipped ? (
                              <div className="py-4 space-y-2">
                                <h4 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                                  {card.term}
                                </h4>
                                <p className="text-xs text-slate-500 font-medium">
                                  Department: {card.department} · Subject: {card.subject}
                                </p>
                              </div>
                            ) : (
                              <div className="py-2 space-y-3 text-xs leading-relaxed animate-in fade-in">
                                <div>
                                  <span className="font-bold text-emerald-400 text-sm">{card.term}</span>
                                  <p className="text-slate-200 mt-1">{card.definition}</p>
                                </div>

                                {card.formulaOrSyntax && (
                                  <div className="p-2.5 bg-white/10 rounded-xl font-mono text-[11px] text-amber-300 border border-white/10">
                                    💡 <strong>Formula / Bounds:</strong> {card.formulaOrSyntax}
                                  </div>
                                )}

                                <div className="text-[11px] text-emerald-300 pt-1">
                                  🏭 <strong>Industry Application:</strong> {card.realWorldApplication}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="pt-3 border-t border-current/10 flex items-center justify-between text-[11px]">
                            <span className="font-medium opacity-75">
                              {isMastered ? '✓ Mastered in your backend profile' : 'Pending review'}
                            </span>
                            <span className="font-bold underline">
                              {isFlipped ? 'Flip to Term' : 'Show In-Depth Explanation →'}
                            </span>
                          </div>
                        </div>

                        {/* Mastery Action Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                          {userType !== 'staff' ? (
                            <button
                              onClick={() => handleToggleFlashcardMastery(card.id, isMastered)}
                              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                                isMastered
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{isMastered ? '✓ Concept Mastered (+15 XP Recorded)' : 'Mark as Mastered (+15 XP)'}</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              <Eye className="w-4 h-4 text-slate-500" />
                              <span>Faculty Observation Mode (Student Concept Review)</span>
                            </div>
                          )}

                          <span className="text-xs text-slate-500 font-medium">
                            {isMastered ? 'Stored in backend knowledge database' : 'Self-assessment synced with faculty'}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Grid of all branch flashcards for direct selection */}
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <div className="text-xs font-bold text-slate-800">
                      Jump to Concept ({backendFlashcards.length} Core Curriculum Flashcards):
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {backendFlashcards.map((f, idx) => {
                        const isDone = masteredFlashcardIds.includes(f.id);
                        return (
                          <button
                            key={f.id}
                            onClick={() => {
                              setIsFlipped(false);
                              setCurrentFlashcardIdx(idx);
                            }}
                            className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                              currentFlashcardIdx === idx
                                ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-950 shadow-2xs'
                                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span className="truncate pr-1">{f.term}</span>
                            {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUBTAB 2: HANDS-ON LAB MISSIONS & CHALLENGES */}
          {knowledgeSubTab === 'challenges' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Hands-on Engineering Missions & Debugging Challenges
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Resolve real engineering scenarios, test software/hardware fixes, and submit deliverables directly to faculty advisors in the backend database.
                  </p>
                </div>

                <div className="space-y-5">
                  {backendChallenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                              {challenge.subject}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              +{challenge.xpReward} XP Reward
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-slate-900">{challenge.title}</h4>
                        </div>
                      </div>

                      {/* Scenario Box */}
                      <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                          <span>Engineering Scenario & Problem Statement:</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{challenge.scenario}</p>
                      </div>

                      {/* Tasks Checklist */}
                      <div className="space-y-1.5 text-xs">
                        <div className="font-bold text-slate-800">Verification Steps & Checklist:</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {challenge.tasks.map((task: string, tIdx: number) => (
                            <div key={tIdx} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                                {tIdx + 1}
                              </span>
                              <span className="text-[11px] leading-tight">{task}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Solution Input & Submission (Student Only) or Observation Rubric (Staff) */}
                      {userType !== 'staff' ? (
                        <div className="space-y-2 text-xs pt-2">
                          <label className="font-bold text-slate-800 block">
                            Your Solution Notes / Code Artifact:
                          </label>
                          <textarea
                            rows={2}
                            placeholder={`Enter solution implementation details for: ${challenge.deliverable}...`}
                            value={challengeSolutions[challenge.id] || ''}
                            onChange={(e) =>
                              setChallengeSolutions((prev) => ({ ...prev, [challenge.id]: e.target.value }))
                            }
                            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-[11px]"
                          />

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] text-slate-500">
                              Deliverable: <strong className="text-slate-700">{challenge.deliverable}</strong>
                            </span>
                            <button
                              onClick={() => handleSubmitChallenge(challenge)}
                              disabled={submittingChallengeId === challenge.id}
                              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{submittingChallengeId === challenge.id ? 'Submitting to Backend...' : 'Submit Challenge to Backend'}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-2 text-xs text-blue-950">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-blue-800">
                              <ShieldCheck className="w-4 h-4 text-blue-600" />
                              <span>Faculty Mission Rubric & Observation (Read-Only)</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                              Expected Deliverable: {challenge.deliverable}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            Staff and officials evaluate student code artifacts through the live Activity Feed below. Students submit their implementation notes and test results directly to faculty mentors.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 3: SUBJECT QUIZZES */}
          {knowledgeSubTab === 'quizzes' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Subject Knowledge Assessment & Multi-Choice Drills
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Curricular questions spanning {currentStudent.department} core subjects with instant automated evaluation.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {(backendQuizzes.length > 0 ? backendQuizzes : departmentQuizzes).map((q: any, qIdx: number) => (
                    <div
                      key={q.id || qIdx}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-300 transition-all space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {q.subject || currentStudent.department} · {q.difficulty || 'Core'}
                        </span>
                        <span className="font-mono text-emerald-700 font-bold">+{q.points || 10} XP</span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm leading-snug">{q.question}</h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt: string, optIdx: number) => (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                              optIdx === q.correctIndex
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="font-bold text-slate-400">({String.fromCharCode(65 + optIdx)})</span>
                            <span>{opt}</span>
                            {optIdx === q.correctIndex && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto" />
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                        <span className="font-bold text-slate-800">Conceptual Explanation:</span> {q.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DAILY BRANCH NEWS & ACADEMIC BRIEFS */}
      {engagementTab === 'news' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 text-blue-700 text-xs font-bold mb-1">
                <Newspaper className="w-4 h-4 text-blue-600" />
                <span>Departmental Newsroom · {currentStudent.department}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Daily News Briefs & Branch Information Ticker
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Curated technical bulletins, research highlights, and institutional notices for {currentStudent.name}'s branch.
              </p>
            </div>

            <span className="text-xs font-bold bg-blue-50 text-blue-800 px-3 py-1 rounded-xl border border-blue-200">
              Live Updates
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {departmentNews.map((news) => (
              <div
                key={news.id}
                className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {news.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {news.date} · {news.readTime}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm md:text-base leading-snug">
                    {news.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {news.content}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium">Source: University Academic Bulletin</span>
                  <span className="text-blue-600 font-bold flex items-center gap-1 cursor-pointer hover:underline">
                    <span>Read Full Brief</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: INTERACTIVE SUBJECT QUIZ & MINI-GAME */}
      {engagementTab === 'minigame' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Leaderboard students={allStudents} />
          </div>
          <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 border border-indigo-700/50 rounded-3xl p-6 text-white shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 text-purple-300 text-xs font-bold mb-1">
                  {userType === 'staff' ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300 font-bold">Faculty Observation & Question Bank Review</span>
                    </>
                  ) : (
                    <>
                      <Gamepad2 className="w-4 h-4 text-purple-400 animate-bounce" />
                      <span>Gamified Academic Challenge & STEM Trivia</span>
                    </>
                  )}
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {userType === 'staff'
                    ? 'Curriculum Question Bank & Assessment Audit 📋'
                    : 'Subject Quiz & Engineering Mini-Game 🎮'}
                </h2>
                <p className="text-xs text-purple-200/80 mt-0.5">
                  {userType === 'staff'
                    ? `Faculty review mode for ${currentStudent.department} questions, official keys, and learning rationale. Student answers and attempts are observed without faculty write access.`
                    : `Test your knowledge in ${currentStudent.department} coursework, earn XP points, and strengthen your conceptual mastery.`}
                </p>
              </div>

              {userType === 'staff' ? (
                <div className="flex items-center gap-3 bg-emerald-950/40 px-4 py-2 rounded-2xl border border-emerald-400/30 backdrop-blur-xs">
                  <Eye className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-[10px] text-emerald-200 uppercase font-bold">Faculty Audit Mode</div>
                    <div className="text-sm font-black font-mono text-emerald-300">
                      10 Questions · Read-Only
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl border border-white/20 backdrop-blur-xs">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-[10px] text-purple-200 uppercase font-bold">Today's Daily Score</div>
                    <div className="text-lg font-black font-mono text-emerald-400">
                      {departmentQuizzes.filter((q) => quizAnswers[q.id] === q.correctIndex).length} / {departmentQuizzes.length} ({departmentQuizzes.filter((q) => quizAnswers[q.id] === q.correctIndex).length * 10} XP)
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Faculty Observation Notice Banner */}
            {userType === 'staff' && (
              <div className="p-4 bg-emerald-950/50 border border-emerald-500/40 rounded-2xl flex items-start gap-3 text-xs text-emerald-100">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-white text-sm">Official Observer Mode Active (Writing & Answering Disabled)</div>
                  <p className="text-emerald-200/90 leading-relaxed text-[11px]">
                    Faculty and university leadership inspect curriculum assessment items without answering. The verified answer keys and conceptual explanations are presented below for pedagogical audit. Only students can submit responses.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* 10-Question Navigation Stepper Ribbon */}
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-purple-200">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-300" />
                    <span>Daily 10-Question Set ({getTodayDateString()} · Updated Daily):</span>
                  </span>
                  <span className="text-emerald-300 font-mono font-bold text-xs">
                    {userType === 'staff'
                      ? `Viewing Question ${currentQuestionIndex + 1} of ${departmentQuizzes.length}`
                      : `${Object.keys(quizAnswers).length} / ${departmentQuizzes.length} Completed`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {departmentQuizzes.map((q, idx) => {
                    const isAnswered = quizAnswers[q.id] !== undefined;
                    const isCorrect = isAnswered && quizAnswers[q.id] === q.correctIndex;
                    const isCurrent = idx === currentQuestionIndex;
                    
                    let stepperClass = 'bg-white/10 text-purple-200 hover:bg-white/20';
                    if (userType === 'staff') {
                      stepperClass = isCurrent
                        ? 'ring-2 ring-emerald-400 bg-emerald-600 text-white shadow-md font-bold'
                        : 'bg-white/10 text-purple-200 hover:bg-white/20';
                    } else {
                      stepperClass = isCurrent
                        ? 'ring-2 ring-amber-400 bg-purple-600 text-white shadow-md'
                        : isAnswered
                        ? isCorrect
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-rose-600 text-white'
                        : 'bg-white/10 text-purple-200 hover:bg-white/20';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center cursor-pointer ${stepperClass}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-700/50 h-2 rounded-full mb-4">
                <motion.div
                  className={userType === 'staff' ? 'bg-emerald-500 h-full rounded-full' : 'bg-purple-500 h-full rounded-full'}
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestionIndex + 1) / departmentQuizzes.length) * 100}%` }}
                />
              </div>

              <AnimatePresence mode="wait">
                {departmentQuizzes[currentQuestionIndex] && (
                  <motion.div
                    key={departmentQuizzes[currentQuestionIndex].id}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xs space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                        Question {currentQuestionIndex + 1} of {departmentQuizzes.length} · {departmentQuizzes[currentQuestionIndex].subject}
                      </span>
                      {userType === 'staff' && (
                        <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                          Observer View
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-white text-sm md:text-base leading-relaxed">
                      {departmentQuizzes[currentQuestionIndex].question}
                    </h3>

                    {/* STAFF VIEW: READ-ONLY OPTIONS WITH VERIFIED KEY HIGHLIGHT */}
                    {userType === 'staff' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {departmentQuizzes[currentQuestionIndex].options.map((opt, optIdx) => {
                          const q = departmentQuizzes[currentQuestionIndex];
                          const isOfficialKey = optIdx === q.correctIndex;
                          return (
                            <div
                              key={optIdx}
                              className={`p-3 rounded-xl border text-left text-xs font-medium flex items-center justify-between select-none ${
                                isOfficialKey
                                  ? 'bg-emerald-600/30 border-2 border-emerald-400 text-emerald-100 font-bold shadow-xs'
                                  : 'bg-white/5 border-white/10 text-slate-300 opacity-70'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`font-bold mr-1 ${isOfficialKey ? 'text-emerald-300' : 'text-purple-300'}`}>
                                  ({String.fromCharCode(65 + optIdx)})
                                </span>
                                <span>{opt}</span>
                              </div>
                              {isOfficialKey && (
                                <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-md shrink-0">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Official Key</span>
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* STUDENT INTERACTIVE VIEW: CLICKABLE OPTIONS TO ANSWER & SUBMIT */
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {departmentQuizzes[currentQuestionIndex].options.map((opt, optIdx) => {
                          const q = departmentQuizzes[currentQuestionIndex];
                          const isSelected = quizAnswers[q.id] === optIdx;
                          const isAnswered = quizAnswers[q.id] !== undefined;
                          const isCorrect = quizAnswers[q.id] === q.correctIndex;
                          
                          let btnStyle = 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200';
                          if (isAnswered) {
                            if (optIdx === q.correctIndex) {
                              btnStyle = 'bg-emerald-600/30 border-emerald-500 text-emerald-100 font-bold';
                            } else if (isSelected && !isCorrect) {
                              btnStyle = 'bg-rose-600/30 border-rose-500 text-rose-100';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={isAnswered}
                              onClick={async () => {
                                setQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                                const isCorrect = optIdx === q.correctIndex;
                                if (isCorrect) {
                                  showToast('Correct answer! +10 XP earned.');
                                  try {
                                    await updateDoc(doc(db, 'students', currentStudent.id), {
                                      points: increment(10)
                                    });
                                  } catch (e) {
                                    console.warn('Firestore points increment warning:', e);
                                  }
                                } else {
                                  showToast('Incorrect. Review the conceptual explanation below.');
                                }

                                if (isCorrect) {
                                  addXp(10);
                                }

                                // Persist quiz activity in backend database store for staff review
                                fetch('/api/student-engagement/quiz-attempt', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Cache-Control': 'no-store',
                                    'x-user-id': currentStudent.id,
                                    'x-user-role': userType,
                                  },
                                  body: JSON.stringify({
                                    studentId: currentStudent.id,
                                    studentName: currentStudent.name,
                                    department: currentStudent.department,
                                    subject: departmentQuizzes[currentQuestionIndex].subject || currentStudent.department,
                                    questionText: q.question,
                                    isCorrect,
                                    explanation: q.explanation,
                                    pointsEarned: isCorrect ? 10 : 0,
                                  }),
                                })
                                  .then((r) => r.json())
                                  .then((data) => {
                                    if (data.success && data.activity) {
                                      onAddActivity(data.activity);
                                    }
                                  })
                                  .catch((err) => console.warn('Backend quiz attempt sync warning:', err));
                              }}
                              className={`p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${btnStyle}`}
                            >
                              <span className="font-bold mr-2 text-purple-300">({String.fromCharCode(65 + optIdx)})</span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* EXPLANATION: ALWAYS SHOWN FOR FACULTY AUDIT, OR SHOWN AFTER STUDENT ATTEMPTS */}
                    {(userType === 'staff' || quizAnswers[departmentQuizzes[currentQuestionIndex].id] !== undefined) && (
                      <div className={`p-3.5 rounded-xl text-xs space-y-1 animate-in fade-in ${
                        userType === 'staff'
                          ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-100'
                          : 'bg-white/10 text-purple-100'
                      }`}>
                        <div className={`font-bold flex items-center gap-1.5 ${userType === 'staff' ? 'text-emerald-300' : 'text-amber-300'}`}>
                          <HelpCircle className="w-4 h-4" />
                          <span>{userType === 'staff' ? 'Curricular Concept & Official Pedagogical Explanation:' : 'Explanation:'}</span>
                        </div>
                        <p className="leading-relaxed">{departmentQuizzes[currentQuestionIndex].explanation}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="text-xs text-purple-200 disabled:opacity-50"
                >
                  Previous
                </button>

                {userType === 'staff' && (
                  <span className="text-[11px] text-emerald-300 font-mono font-semibold">
                    🔒 Response submission locked in Faculty Observation Mode
                  </span>
                )}
                
                <button
                  onClick={() => {
                    if (currentQuestionIndex < departmentQuizzes.length - 1) {
                      setCurrentQuestionIndex((prev) => prev + 1);
                    } else {
                      setCurrentQuestionIndex(0); // Restart review
                    }
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 font-bold text-xs rounded-xl transition-colors cursor-pointer ${
                    userType === 'staff'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {currentQuestionIndex < departmentQuizzes.length - 1 ? (
                    <>
                      <span>Next Question</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <span>{userType === 'staff' ? 'Review From Question 1' : 'Restart Quiz'}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STUDENT ACHIEVEMENT BADGES */}
      {engagementTab === 'badges' && (() => {
        const achievementBadges = [
          {
            id: 'badge-1',
            title: 'First Step Pioneer',
            category: 'Engagement',
            rarity: 'Common',
            icon: '🚀',
            xp: 50,
            description: 'Logged your very first academic activity or adopted a curated learning plan.',
            unlocked: studentActivities.length >= 1,
            progress: studentActivities.length >= 1 ? '1/1 Completed' : '0/1 Activity Logged',
          },
          {
            id: 'badge-2',
            title: 'Algorithm & Code Sprint Pro',
            category: 'Hands-on Lab',
            rarity: 'Epic',
            icon: '⚡',
            xp: 150,
            description: 'Completed 2 or more hands-on coding or lab challenges in the Knowledge Hub.',
            unlocked: studentActivities.filter(a => a.category === 'Hands-on Project' || a.category === 'Skill & Certification').length >= 1,
            progress: `${Math.min(2, studentActivities.filter(a => a.category === 'Hands-on Project' || a.category === 'Skill & Certification').length)}/2 Completed`,
          },
          {
            id: 'badge-3',
            title: 'Dedicated Scholar',
            category: 'Academics',
            rarity: 'Rare',
            icon: '📚',
            xp: 100,
            description: 'Logged 10+ hours of dedicated learning and coursework revision across semesters.',
            unlocked: totalHoursLogged >= 10,
            progress: `${totalHoursLogged}/10 Hours Logged`,
          },
          {
            id: 'badge-4',
            title: 'Quiz & Trivia Master',
            category: 'Knowledge Hub',
            rarity: 'Epic',
            icon: '🎯',
            xp: 200,
            description: 'Scored high on subject quiz challenges or mastered multiple flashcard concepts.',
            unlocked: masteredFlashcardIds.length >= 1 || studentActivities.some(a => a.status === 'Completed'),
            progress: `${masteredFlashcardIds.length}/2 Concepts Mastered`,
          },
          {
            id: 'badge-5',
            title: 'Branch Ambassador',
            category: 'Campus Community',
            rarity: 'Legendary',
            icon: '🌟',
            xp: 300,
            description: 'Actively tracked department announcements, campus events, and news briefings.',
            unlocked: departmentNews.length > 0,
            progress: `${departmentNews.length} News Briefs Explored`,
          },
          {
            id: 'badge-6',
            title: 'Placement Readiness Titan',
            category: 'Career & Placement',
            rarity: 'Legendary',
            icon: '🏆',
            xp: 500,
            description: 'Achieved top-tier benchmark scores across aptitude, coding, and mock interview modules.',
            unlocked: currentStudent.academic.gpa >= 7.5 && totalHoursLogged >= 5,
            progress: currentStudent.academic.gpa >= 7.5 ? 'GPA Criteria Met' : 'Requires GPA >= 7.5',
          },
        ];

        return (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 rounded-3xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md">
                  <Trophy className="w-3.5 h-3.5 text-blue-300" />
                  <span>Gamified Milestone System · {currentStudent.name}</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight">Student Achievement Badges & Trophies</h2>
                <p className="text-xs lg:text-sm text-blue-100 max-w-2xl leading-relaxed">
                  Unlock prestigious digital badges as you complete curated learning plans, log dedicated study hours, score high in knowledge quizzes, and explore department news briefings!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {achievementBadges.map((badge) => (
                <div
                  key={badge.id}
                  onClick={() => setSelectedBadge(badge)}
                  className={`border rounded-3xl p-6 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                    badge.unlocked
                      ? 'bg-gradient-to-br from-white via-blue-50/30 to-white border-blue-200 shadow-lg hover:border-blue-400 hover:shadow-xl'
                      : 'bg-slate-50/80 border-slate-200 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="absolute top-3 right-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase font-mono ${
                      badge.rarity === 'Legendary' ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' :
                      badge.rarity === 'Epic' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                      badge.rarity === 'Rare' ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {badge.rarity}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                      {badge.icon}
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">{badge.category}</span>
                      <h3 className="font-extrabold text-slate-900 text-base tracking-tight mt-0.5 group-hover:text-blue-600 transition-colors">
                        {badge.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">
                        {badge.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold font-mono text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100">
                      <Award className="w-3.5 h-3.5 text-blue-600" />
                      <span>+{badge.xp} XP</span>
                    </div>

                    <span className={`font-semibold font-mono text-xs ${badge.unlocked ? 'text-emerald-700 flex items-center gap-1' : 'text-slate-400'}`}>
                      {badge.unlocked ? '✓ Unlocked' : badge.progress}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })()}

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 text-center p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-4xl shadow-xl shadow-blue-500/30 animate-pulse">
                {selectedBadge.icon}
              </div>

              <div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider font-mono">
                  {selectedBadge.rarity} · {selectedBadge.category}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">{selectedBadge.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-2 px-2">
                  {selectedBadge.description}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200/80 p-3.5 rounded-2xl flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-900">Reward Bonus:</span>
                <span className="font-mono font-bold text-blue-800">+{selectedBadge.xp} XP Points</span>
              </div>

              <div className="text-xs font-semibold font-mono text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                Status: <strong className={selectedBadge.unlocked ? 'text-emerald-700' : 'text-slate-600'}>
                  {selectedBadge.unlocked ? 'Unlocked & Verified 🏆' : `Locked (${selectedBadge.progress})`}
                </strong>
              </div>

              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close Badge Showcase
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Plan / Log New Academic Activity */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-w-xl w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Plan / Log New Academic Activity</h3>
                <p className="text-xs text-slate-500">
                  Record your coursework or project milestone. This updates to {currentStudent.mentorName}.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Activity Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FreeRTOS Sensor Interface Lab or LeetCode Dynamic Programming Sprint"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Academic Booster">Academic Booster</option>
                    <option value="Knowledge Refresher">Knowledge Refresher</option>
                    <option value="Hands-on Project">Hands-on Project</option>
                    <option value="Skill & Certification">Skill & Certification</option>
                    <option value="Peer Study & Seminar">Peer Study & Seminar</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hours Dedicated</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newHours}
                    onChange={(e) => setNewHours(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Semester Subject / Coursework</label>
                <input
                  type="text"
                  placeholder="e.g. Embedded Systems, Digital Signal Processing, DBMS"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Activity Scope & Description</label>
                <textarea
                  rows={2}
                  placeholder="Summarize the core topics revised, exercises solved, or hardware verified..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Key Learnings & Takeaways</label>
                <input
                  type="text"
                  placeholder="What new concepts or practical skills did you master?"
                  value={newLearnings}
                  onChange={(e) => setNewLearnings(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Save & Notify Advisor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Curated Plan Learn More Detail Modal */}
      <AnimatePresence>
        {selectedCuratedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCuratedPlan(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white uppercase tracking-wider">
                    {selectedCuratedPlan.category}
                  </span>
                  <h3 className="text-lg font-bold mt-1">{selectedCuratedPlan.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedCuratedPlan(null)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <span>Subject: <strong className="text-slate-800">{selectedCuratedPlan.subject}</strong></span>
                  <span>Estimated Time: <strong className="text-slate-800">{selectedCuratedPlan.suggestedHours} hours</strong></span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Overview & Objectives</h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-blue-50/50 p-3.5 rounded-xl border border-blue-100">
                    {selectedCuratedPlan.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Step-by-Step Milestones & Roadmap</h4>
                  <div className="space-y-2">
                    {selectedCuratedPlan.milestones.map((m: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-xs text-slate-700">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed font-medium">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 bg-amber-50 border border-amber-200/80 p-3 rounded-xl">
                  💡 <strong>Backend Support Note:</strong> Adopting this plan automatically logs it in your active student telemetry. Faculty mentors receive progress updates as you complete milestones.
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedCuratedPlan(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                {userType !== 'staff' && (
                  <button
                    onClick={() => {
                      handleAdoptPlan(selectedCuratedPlan);
                      setSelectedCuratedPlan(null);
                    }}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    + Adopt Plan Now
                  </button>
                )}
                {userType === 'staff' && (
                  <span className="text-xs text-slate-400 font-medium italic">
                    Faculty Observation View (Read-Only)
                  </span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level-Up Celebration Animation Modal */}
      <AnimatePresence>
        {levelUpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setLevelUpModal(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 30, rotate: -2 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-400/80 rounded-3xl p-8 max-w-md w-full text-center text-white shadow-2xl relative overflow-hidden space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center text-5xl shadow-2xl shadow-amber-500/50 animate-bounce">
                🎉
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase tracking-widest font-mono">
                  LEVEL UP UNLOCKED!
                </span>
                <h3 className="text-2xl font-black text-white">Congratulations, {currentStudent.name}!</h3>
                <p className="text-sm text-blue-200 leading-relaxed">
                  You have advanced to <strong className="text-amber-300 text-base">Level {levelUpModal.newLevel}</strong> through your continuous academic diligence and activity completion!
                </p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 font-mono text-xs text-amber-300">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Bonus XP Reward +150 XP Credited</span>
              </div>

              <button
                onClick={() => setLevelUpModal(null)}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-orange-500/30 transition-all cursor-pointer"
              >
                Continue Learning Journey 🚀
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
