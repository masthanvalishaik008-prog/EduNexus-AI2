import { Department, Student, RiskLevel, PreferredDomain, UserRole } from '../types/student';
import { calculateCompositeBreakdown, determineRiskLevel } from '../utils/scoreCalculator';

export interface CollegeStaff {
  id: string;
  name: string;
  email: string;
  department: Department;
  designation: string;
  role: 'Faculty Advisor' | 'Department Head' | 'Dean of Academics' | 'Placement Officer';
  cabin: string;
  phone: string;
  officeHours: string;
  coursesTaught: string[];
  specialization: string;
  assignedStudentsCount: number;
  experienceYears: number;
  avatarUrl?: string;
}

export const COLLEGE_BRANCHES: Department[] = [
  'Computer Science (CSE)',
  'Electronics & Comm (ECE)',
  'Information Tech (IT)',
  'Electrical & Electronics (EEE)',
  'Mechanical Eng (MECH)',
];

export function normalizeBranch(dept: string): Department {
  const d = (dept || '').toLowerCase();
  if (d.includes('electrical') || d.includes('eee')) return 'Electrical & Electronics (EEE)';
  if (d.includes('comm') || d.includes('ece') || d.includes('telecom')) return 'Electronics & Comm (ECE)';
  if (d.includes('computer') || d.includes('cse')) return 'Computer Science (CSE)';
  if (d.includes('information') || d.includes('it')) return 'Information Tech (IT)';
  if (d.includes('mechanical') || d.includes('mech')) return 'Mechanical Eng (MECH)';
  if (d.includes('electronic')) return 'Electronics & Comm (ECE)';
  return 'Computer Science (CSE)';
}

export function isSameBranch(dept1: string, dept2: string): boolean {
  return normalizeBranch(dept1) === normalizeBranch(dept2);
}

// -------------------------------------------------------------
// 50 REALISTIC STAFF MEMBERS (10 PER BRANCH)
// -------------------------------------------------------------
export const COLLEGE_STAFF_50: CollegeStaff[] = [
  // --- COMPUTER SCIENCE (CSE) - 10 Staff ---
  {
    id: 'STF-CSE-01',
    name: 'Dr. Arisudan Bose',
    email: 'arisudan.bose@edunexus.edu',
    department: 'Computer Science (CSE)',
    designation: 'Professor & Department Head (HOD)',
    role: 'Department Head',
    cabin: 'Room C-301, Turing Innovation Block',
    phone: '+91 98401 10001',
    officeHours: 'Mon, Wed 10:00 AM - 12:00 PM',
    coursesTaught: ['Advanced Distributed Systems', 'Cloud Architecture', 'System Design'],
    specialization: 'Distributed Systems & Cloud Infrastructure',
    assignedStudentsCount: 22,
    experienceYears: 21,
  },
  {
    id: 'STF-CSE-02',
    name: 'Prof. Ananya Iyer',
    email: 'ananya.iyer@edunexus.edu',
    department: 'Computer Science (CSE)',
    designation: 'Associate Professor & AI Lab Director',
    role: 'Faculty Advisor',
    cabin: 'Room C-212, Turing Innovation Block',
    phone: '+91 98401 10002',
    officeHours: 'Tue, Thu 10:30 AM - 12:30 PM',
    coursesTaught: ['Design & Analysis of Algorithms', 'Artificial Intelligence', 'Operating Systems'],
    specialization: 'Deep Learning, Graph Algorithms, Explainable AI',
    assignedStudentsCount: 20,
    experienceYears: 14,
  },
  {
    id: 'STF-CSE-03',
    name: 'Dr. Rajesh Khanna',
    email: 'rajesh.khanna@edunexus.edu',
    department: 'Computer Science (CSE)',
    designation: 'Professor & Placement Director',
    role: 'Placement Officer',
    cabin: 'Room P-101, Corporate Placement Wing',
    phone: '+91 98401 10003',
    officeHours: 'Daily 3:00 PM - 5:00 PM',
    coursesTaught: ['Campus Recruitment Training', 'Competitive Coding Benchmarks', 'System Design'],
    specialization: 'Algorithmic Complexity & Tech Placement Strategy',
    assignedStudentsCount: 24,
    experienceYears: 19,
  },
  {
    id: 'STF-CSE-04',
    name: 'Dr. Siddharth Verma',
    email: 'siddharth.verma@edunexus.edu',
    department: 'Computer Science (CSE)',
    designation: 'Associate Professor',
    role: 'Faculty Advisor',
    cabin: 'Room C-205, Turing Innovation Block',
    phone: '+91 98401 10004',
    officeHours: 'Mon, Thu 2:00 PM - 4:00 PM',
    coursesTaught: ['Database Management Systems', 'Advanced SQL & NoSQL', 'Data Warehousing'],
    specialization: 'Relational & Vector Database Internals',
    assignedStudentsCount: 19,
    experienceYears: 13,
  },
  {
    id: 'STF-CSE-05',
    name: 'Prof. Meera Sen',
    email: 'meera.sen@edunexus.edu',
    department: 'Computer Science (CSE)',
    designation: 'Assistant Professor & Hackathon Mentor',
    role: 'Faculty Advisor',
    cabin: 'Room C-118, Turing Innovation Block',
    phone: '+91 98401 10005',
    officeHours: 'Wed, Fri 11:00 AM - 1:00 PM',
    coursesTaught: ['Full-Stack Web Development', 'DevOps & CI/CD', 'Mobile Application Dev'],
    specialization: 'Modern Web Architecture & Microservices',
    assignedStudentsCount: 18,
    experienceYears: 8,
  },
  {
    id: 'STF-CSE-06',
    name: 'Dr. Rohan Kulkarni',
    email: 'rohan.kulkarni@edunexus.edu',
    department: 'Computer Science (CSE)',
    designation: 'Associate Professor',
    role: 'Faculty Advisor',
    cabin: 'Room C-220, Turing Innovation Block',
    phone: '+91 98401 10006',
    officeHours: 'Tue, Fri 2:00 PM - 3:30 PM',
    coursesTaught: ['Computer Networks & Protocols', 'Network Security', 'Cryptography'],
    specialization: 'Cybersecurity, Zero-Trust Architecture, Protocol Design',
    assignedStudentsCount: 21,
    experienceYears: 15,
  },
  {
    id: 'STF-CSE-07',
    name: 'Prof. Kavita Nair',
    email: 'kavita.nair@edunexus.edu',
    department: 'Computer Science (CSE)',
    designation: 'Assistant Professor',
    role: 'Faculty Advisor',
    cabin: 'Room C-114, Turing Innovation Block',
    phone: '+91 98401 10007',
    officeHours: 'Mon, Thu 11:30 AM - 1:00 PM',
    coursesTaught: ['Compiler Design', 'Theory of Computation', 'Automata & Formal Languages'],
    specialization: 'Language Compilers & Static Code Analysis',
    assignedStudentsCount: 18,
    experienceYears: 9,
  },
  {
    id: 'STF-CSE-08',
    name: 'Dr. Alok Nath Mukherjee',
    email: 'alok.mukherjee@edunexus.edu',
    department: 'Computer Science (CSE)',
    designation: 'Senior Professor & Research Dean',
    role: 'Dean of Academics',
    cabin: 'Room A-102, Central Academic Senate',
    phone: '+91 98401 10008',
    officeHours: 'Tue, Thu 3:30 PM - 5:00 PM',
    coursesTaught: ['High Performance Computing', 'Parallel Programming (CUDA)', 'Quantum Computing'],
    specialization: 'GPU Accelerated Computing & Quantum Algorithms',
    assignedStudentsCount: 20,
    experienceYears: 24,
  },
  {
    id: 'STF-CSE-09',
    name: 'Prof. Tanvi Deshmukh',
    email: 'tanvi.deshmukh@edunexus.edu',
    department: 'Computer Science (CSE)',
    designation: 'Assistant Professor',
    role: 'Faculty Advisor',
    cabin: 'Room C-109, Turing Innovation Block',
    phone: '+91 98401 10009',
    officeHours: 'Wed, Fri 9:30 AM - 11:00 AM',
    coursesTaught: ['Human-Computer Interaction (HCI)', 'Frontend Engineering', 'User Research'],
    specialization: 'UI/UX Systems, Design Systems, Accessible Interfaces',
    assignedStudentsCount: 19,
    experienceYears: 7,
  },
  {
    id: 'STF-CSE-10',
    name: 'Dr. Nikhil Bansal',
    email: 'nikhil.bansal@edunexus.edu',
    department: 'Computer Science (CSE)',
    designation: 'Associate Professor',
    role: 'Faculty Advisor',
    cabin: 'Room C-215, Turing Innovation Block',
    phone: '+91 98401 10010',
    officeHours: 'Mon, Wed 3:00 PM - 4:30 PM',
    coursesTaught: ['Natural Language Processing (NLP)', 'Generative AI Engineering', 'Information Retrieval'],
    specialization: 'LLM Fine-Tuning & Vector Embeddings',
    assignedStudentsCount: 19,
    experienceYears: 12,
  },

  // --- ELECTRONICS & COMM (ECE) - 10 Staff ---
  {
    id: 'STF-ECE-01',
    name: 'Dr. Ramesh Sundaram',
    email: 'ramesh.sundaram@edunexus.edu',
    department: 'Electronics & Comm (ECE)',
    designation: 'Professor & Department Head (HOD)',
    role: 'Department Head',
    cabin: 'Room E-301, Vikram Sarabhai Block',
    phone: '+91 98401 20001',
    officeHours: 'Mon, Wed 9:30 AM - 11:30 AM',
    coursesTaught: ['Embedded Systems & RTOS', 'Microcontrollers & ARM Architecture', 'IoT Systems'],
    specialization: 'Real-Time Operating Systems, ARM Cortex, Edge AI',
    assignedStudentsCount: 22,
    experienceYears: 20,
  },
  {
    id: 'STF-ECE-02',
    name: 'Prof. Sunita Krishnan',
    email: 'sunita.krishnan@edunexus.edu',
    department: 'Electronics & Comm (ECE)',
    designation: 'Associate Professor & VLSI Lead',
    role: 'Faculty Advisor',
    cabin: 'Room E-210, Vikram Sarabhai Block',
    phone: '+91 98401 20002',
    officeHours: 'Tue, Thu 11:00 AM - 1:00 PM',
    coursesTaught: ['VLSI Circuit Design', 'Digital CMOS IC Design', 'Verilog / VHDL Modeling'],
    specialization: 'ASIC Design, FPGA Synthesis, Cadence EDA Tools',
    assignedStudentsCount: 20,
    experienceYears: 16,
  },
  {
    id: 'STF-ECE-03',
    name: 'Dr. Jayant Nambiar',
    email: 'jayant.nambiar@edunexus.edu',
    department: 'Electronics & Comm (ECE)',
    designation: 'Professor & Signals Lab Director',
    role: 'Faculty Advisor',
    cabin: 'Room E-304, Vikram Sarabhai Block',
    phone: '+91 98401 20003',
    officeHours: 'Mon, Thu 2:00 PM - 4:00 PM',
    coursesTaught: ['Digital Signal Processing (DSP)', 'Signals & Systems', 'Image & Audio Processing'],
    specialization: 'Adaptive DSP Filters, Wavelet Transforms, Radar Signals',
    assignedStudentsCount: 21,
    experienceYears: 18,
  },
  {
    id: 'STF-ECE-04',
    name: 'Prof. Malini Bhattacharya',
    email: 'malini.bhatt@edunexus.edu',
    department: 'Electronics & Comm (ECE)',
    designation: 'Associate Professor',
    role: 'Faculty Advisor',
    cabin: 'Room E-215, Vikram Sarabhai Block',
    phone: '+91 98401 20004',
    officeHours: 'Wed, Fri 10:00 AM - 12:00 PM',
    coursesTaught: ['Analog Circuits & Op-Amps', 'Electronic Devices & Circuits', 'Linear ICs'],
    specialization: 'Mixed-Signal IC Design, Analog Filters, Sensor Interfacing',
    assignedStudentsCount: 19,
    experienceYears: 14,
  },
  {
    id: 'STF-ECE-05',
    name: 'Dr. Hariprasad Rao',
    email: 'hariprasad.rao@edunexus.edu',
    department: 'Electronics & Comm (ECE)',
    designation: 'Associate Professor & RF Lead',
    role: 'Faculty Advisor',
    cabin: 'Room E-208, Vikram Sarabhai Block',
    phone: '+91 98401 20005',
    officeHours: 'Tue, Thu 2:30 PM - 4:30 PM',
    coursesTaught: ['Electromagnetic Fields & Waves', 'RF & Microwave Engineering', 'Antenna Design'],
    specialization: '5G/6G Phased Array Antennas, Microwave Passive Circuits',
    assignedStudentsCount: 20,
    experienceYears: 15,
  },
  {
    id: 'STF-ECE-06',
    name: 'Prof. Deepa Swaminathan',
    email: 'deepa.swami@edunexus.edu',
    department: 'Electronics & Comm (ECE)',
    designation: 'Assistant Professor & IoT Lab Mentor',
    role: 'Faculty Advisor',
    cabin: 'Room E-112, Vikram Sarabhai Block',
    phone: '+91 98401 20006',
    officeHours: 'Mon, Fri 11:00 AM - 12:30 PM',
    coursesTaught: ['Wireless Sensor Networks (WSN)', 'Internet of Things (IoT)', 'Embedded C Programming'],
    specialization: 'LoRaWAN, Zigbee, ESP32 Microcontrollers, Smart Agriculture',
    assignedStudentsCount: 19,
    experienceYears: 8,
  },
  {
    id: 'STF-ECE-07',
    name: 'Dr. Vivek Seshadri',
    email: 'vivek.seshadri@edunexus.edu',
    department: 'Electronics & Comm (ECE)',
    designation: 'Assistant Professor',
    role: 'Faculty Advisor',
    cabin: 'Room E-116, Vikram Sarabhai Block',
    phone: '+91 98401 20007',
    officeHours: 'Wed, Thu 1:30 PM - 3:00 PM',
    coursesTaught: ['Optical Fiber Communication', 'Digital Communication Systems', 'Information Theory & Coding'],
    specialization: 'Dense Wavelength Division Multiplexing (DWDM), Photonic Circuits',
    assignedStudentsCount: 19,
    experienceYears: 10,
  },
  {
    id: 'STF-ECE-08',
    name: 'Prof. Rashmi Hegde',
    email: 'rashmi.hegde@edunexus.edu',
    department: 'Electronics & Comm (ECE)',
    designation: 'Assistant Professor',
    role: 'Faculty Advisor',
    cabin: 'Room E-119, Vikram Sarabhai Block',
    phone: '+91 98401 20008',
    officeHours: 'Tue, Fri 9:00 AM - 10:30 AM',
    coursesTaught: ['Microprocessors & Interfacing (8086/ARM)', 'Logic Design', 'PCB Design & Prototyping'],
    specialization: 'Altium Designer PCB Layouts, Hardware In The Loop (HIL)',
    assignedStudentsCount: 20,
    experienceYears: 9,
  },
  {
    id: 'STF-ECE-09',
    name: 'Dr. Giridhar Kulkarni',
    email: 'giridhar.kulkarni@edunexus.edu',
    department: 'Electronics & Comm (ECE)',
    designation: 'Professor',
    role: 'Faculty Advisor',
    cabin: 'Room E-306, Vikram Sarabhai Block',
    phone: '+91 98401 20009',
    officeHours: 'Mon, Thu 3:00 PM - 5:00 PM',
    coursesTaught: ['Satellite Communications', 'Mobile Cellular Communications', 'Spread Spectrum Systems'],
    specialization: 'Orbital Communication Links, GPS/NavIC Receivers',
    assignedStudentsCount: 21,
    experienceYears: 22,
  },
  {
    id: 'STF-ECE-10',
    name: 'Prof. Pooja Nair',
    email: 'pooja.nair@edunexus.edu',
    department: 'Electronics & Comm (ECE)',
    designation: 'Assistant Professor & Remedial Mentor',
    role: 'Faculty Advisor',
    cabin: 'Room E-108, Vikram Sarabhai Block',
    phone: '+91 98401 20010',
    officeHours: 'Wed, Fri 3:00 PM - 4:30 PM',
    coursesTaught: ['Circuit Theory & Network Analysis', 'Basic Electrical & Electronics', 'Virtual Instrumentation'],
    specialization: 'Network Theorems, SPICE Simulation, Student Remedial Coaching',
    assignedStudentsCount: 18,
    experienceYears: 7,
  },

  // --- INFORMATION TECH (IT) - 10 Staff ---
  {
    id: 'STF-IT-01',
    name: 'Dr. Shalini Mukherjee',
    email: 'shalini.mukherjee@edunexus.edu',
    department: 'Information Tech (IT)',
    designation: 'Professor & Department Head (HOD)',
    role: 'Department Head',
    cabin: 'Room I-301, Ada Lovelace IT Wing',
    phone: '+91 98401 30001',
    officeHours: 'Mon, Wed 11:00 AM - 1:00 PM',
    coursesTaught: ['Cloud Computing & Virtualization', 'Enterprise Database Systems', 'Software Engineering'],
    specialization: 'Kubernetes, AWS Cloud Solutions, Multi-Tenant Databases',
    assignedStudentsCount: 22,
    experienceYears: 18,
  },
  {
    id: 'STF-IT-02',
    name: 'Prof. Vivek Mehra',
    email: 'vivek.mehra@edunexus.edu',
    department: 'Information Tech (IT)',
    designation: 'Associate Professor & Big Data Lead',
    role: 'Faculty Advisor',
    cabin: 'Room I-214, Ada Lovelace IT Wing',
    phone: '+91 98401 30002',
    officeHours: 'Tue, Thu 10:00 AM - 12:00 PM',
    coursesTaught: ['Big Data Analytics (Spark & Hadoop)', 'Data Warehousing & Mining', 'Business Intelligence'],
    specialization: 'Distributed Data Pipelines, Apache Spark, Snowflake Data Warehouse',
    assignedStudentsCount: 20,
    experienceYears: 15,
  },
  {
    id: 'STF-IT-03',
    name: 'Dr. Archana Sen',
    email: 'archana.sen@edunexus.edu',
    department: 'Information Tech (IT)',
    designation: 'Associate Professor',
    role: 'Faculty Advisor',
    cabin: 'Room I-208, Ada Lovelace IT Wing',
    phone: '+91 98401 30003',
    officeHours: 'Mon, Thu 2:30 PM - 4:00 PM',
    coursesTaught: ['Cyber Forensics & Incident Response', 'Information Security', 'Ethical Hacking'],
    specialization: 'Digital Forensics, Threat Hunting, NIST Compliance',
    assignedStudentsCount: 20,
    experienceYears: 13,
  },
  {
    id: 'STF-IT-04',
    name: 'Prof. Sandeep Joshi',
    email: 'sandeep.joshi@edunexus.edu',
    department: 'Information Tech (IT)',
    designation: 'Assistant Professor & Placement Mentor',
    role: 'Placement Officer',
    cabin: 'Room I-115, Ada Lovelace IT Wing',
    phone: '+91 98401 30004',
    officeHours: 'Daily 2:00 PM - 4:00 PM',
    coursesTaught: ['Python for Data Engineering', 'Agile & DevOps Automation', 'Full-Stack JavaScript'],
    specialization: 'CI/CD Pipelines, GitHub Actions, Docker Swarm',
    assignedStudentsCount: 21,
    experienceYears: 9,
  },
  {
    id: 'STF-IT-05',
    name: 'Dr. Monika Aggarwal',
    email: 'monika.aggarwal@edunexus.edu',
    department: 'Information Tech (IT)',
    designation: 'Associate Professor',
    role: 'Faculty Advisor',
    cabin: 'Room I-210, Ada Lovelace IT Wing',
    phone: '+91 98401 30005',
    officeHours: 'Wed, Fri 10:30 AM - 12:30 PM',
    coursesTaught: ['Machine Learning for Business', 'Statistical Data Analysis (R)', 'Predictive Modeling'],
    specialization: 'Predictive Analytics, Customer Lifetime Value Models, Time Series',
    assignedStudentsCount: 19,
    experienceYears: 14,
  },
  {
    id: 'STF-IT-06',
    name: 'Prof. Gaurav Chawla',
    email: 'gaurav.chawla@edunexus.edu',
    department: 'Information Tech (IT)',
    designation: 'Assistant Professor',
    role: 'Faculty Advisor',
    cabin: 'Room I-112, Ada Lovelace IT Wing',
    phone: '+91 98401 30006',
    officeHours: 'Tue, Fri 11:30 AM - 1:00 PM',
    coursesTaught: ['Mobile Application Development (React Native / Flutter)', 'API Design & GraphQL', 'Web Security'],
    specialization: 'Cross-Platform Mobile Apps, RESTful API Standards, JWT Auth',
    assignedStudentsCount: 18,
    experienceYears: 8,
  },
  {
    id: 'STF-IT-07',
    name: 'Dr. Swati Ghosh',
    email: 'swati.ghosh@edunexus.edu',
    department: 'Information Tech (IT)',
    designation: 'Assistant Professor',
    role: 'Faculty Advisor',
    cabin: 'Room I-118, Ada Lovelace IT Wing',
    phone: '+91 98401 30007',
    officeHours: 'Mon, Wed 3:00 PM - 4:30 PM',
    coursesTaught: ['Object Oriented Software Engineering', 'Design Patterns in Java', 'Software Testing & QA'],
    specialization: 'Automated QA Testing, Selenium, Test-Driven Development',
    assignedStudentsCount: 19,
    experienceYears: 10,
  },
  {
    id: 'STF-IT-08',
    name: 'Prof. Nimesh Patel',
    email: 'nimesh.patel@edunexus.edu',
    department: 'Information Tech (IT)',
    designation: 'Assistant Professor',
    role: 'Faculty Advisor',
    cabin: 'Room I-106, Ada Lovelace IT Wing',
    phone: '+91 98401 30008',
    officeHours: 'Thu, Fri 2:00 PM - 3:30 PM',
    coursesTaught: ['Data Visualization (Power BI & Tableau)', 'Information Architecture', 'Business Systems'],
    specialization: 'Executive Dashboards, Power Query, DAX Data Modeling',
    assignedStudentsCount: 20,
    experienceYears: 7,
  },
  {
    id: 'STF-IT-09',
    name: 'Dr. Reena Mathews',
    email: 'reena.mathews@edunexus.edu',
    department: 'Information Tech (IT)',
    designation: 'Professor',
    role: 'Faculty Advisor',
    cabin: 'Room I-305, Ada Lovelace IT Wing',
    phone: '+91 98401 30009',
    officeHours: 'Tue, Thu 9:30 AM - 11:00 AM',
    coursesTaught: ['Blockchain & Distributed Ledgers', 'Smart Contracts (Solidity)', 'FinTech Systems'],
    specialization: 'Decentralized Finance, Cryptographic Hashing, Ethereum Virtual Machine',
    assignedStudentsCount: 21,
    experienceYears: 19,
  },
  {
    id: 'STF-IT-10',
    name: 'Prof. Tarun Varma',
    email: 'tarun.varma@edunexus.edu',
    department: 'Information Tech (IT)',
    designation: 'Assistant Professor',
    role: 'Faculty Advisor',
    cabin: 'Room I-102, Ada Lovelace IT Wing',
    phone: '+91 98401 30010',
    officeHours: 'Mon, Fri 9:00 AM - 10:30 AM',
    coursesTaught: ['Linux System Administration & Shell Scripting', 'Virtual Machine Setup', 'IT Automation'],
    specialization: 'Bash Scripting, Linux Kernel Tuning, Ansible Automation',
    assignedStudentsCount: 18,
    experienceYears: 6,
  },

  // --- ELECTRICAL & ELECTRONICS (EEE) - 10 Staff ---
  {
    id: 'STF-EEE-01',
    name: 'Prof. S. Padmanabhan',
    email: 's.padmanabhan@edunexus.edu',
    department: 'Electrical & Electronics (EEE)',
    designation: 'Professor & Department Head (HOD)',
    role: 'Department Head',
    cabin: 'Room P-301, Nikola Tesla Power Block',
    phone: '+91 98401 40001',
    officeHours: 'Mon, Wed 10:00 AM - 12:00 PM',
    coursesTaught: ['Power System Analysis', 'Power Transmission & Distribution', 'High Voltage Engineering'],
    specialization: 'Smart Grid Protection, Power Flow Algorithms, Substation Automation',
    assignedStudentsCount: 22,
    experienceYears: 23,
  },
  {
    id: 'STF-EEE-02',
    name: 'Dr. Chandrashekhar Rao',
    email: 'chandrashekhar.rao@edunexus.edu',
    department: 'Electrical & Electronics (EEE)',
    designation: 'Associate Professor & Drives Lab Director',
    role: 'Faculty Advisor',
    cabin: 'Room P-210, Nikola Tesla Power Block',
    phone: '+91 98401 40002',
    officeHours: 'Tue, Thu 10:30 AM - 12:30 PM',
    coursesTaught: ['Power Electronics & Inverters', 'Electrical Drives & Control', 'Industrial Automation'],
    specialization: 'PWM Inverter Control, Brushless DC Motors, Silicon Carbide Devices',
    assignedStudentsCount: 21,
    experienceYears: 17,
  },
  {
    id: 'STF-EEE-03',
    name: 'Prof. Geetha Narayanan',
    email: 'geetha.narayanan@edunexus.edu',
    department: 'Electrical & Electronics (EEE)',
    designation: 'Associate Professor & Renewables Mentor',
    role: 'Faculty Advisor',
    cabin: 'Room P-215, Nikola Tesla Power Block',
    phone: '+91 98401 40003',
    officeHours: 'Mon, Thu 2:00 PM - 3:30 PM',
    coursesTaught: ['Renewable Energy Systems (Solar & Wind)', 'Microgrid Management', 'Energy Storage & Batteries'],
    specialization: 'Solar PV MPPT Algorithms, Lithium-Ion Battery Management Systems (BMS)',
    assignedStudentsCount: 19,
    experienceYears: 15,
  },
  {
    id: 'STF-EEE-04',
    name: 'Dr. Balaram Das',
    email: 'balaram.das@edunexus.edu',
    department: 'Electrical & Electronics (EEE)',
    designation: 'Associate Professor',
    role: 'Faculty Advisor',
    cabin: 'Room P-206, Nikola Tesla Power Block',
    phone: '+91 98401 40004',
    officeHours: 'Wed, Fri 11:00 AM - 1:00 PM',
    coursesTaught: ['Control Systems Engineering', 'State Space Analysis', 'Digital Control Systems'],
    specialization: 'PID Tuning, Modern State Observers, Nonlinear Control Theory',
    assignedStudentsCount: 20,
    experienceYears: 16,
  },
  {
    id: 'STF-EEE-05',
    name: 'Prof. Sumathi Balan',
    email: 'sumathi.balan@edunexus.edu',
    department: 'Electrical & Electronics (EEE)',
    designation: 'Assistant Professor & EV Lab In-Charge',
    role: 'Faculty Advisor',
    cabin: 'Room P-114, Nikola Tesla Power Block',
    phone: '+91 98401 40005',
    officeHours: 'Tue, Fri 2:30 PM - 4:00 PM',
    coursesTaught: ['Electric Vehicle (EV) Powertrain Systems', 'Battery Charging Infrastructure', 'Automotive Electronics'],
    specialization: 'EV Motor Controllers, Regenerative Braking, Fast DC Chargers',
    assignedStudentsCount: 20,
    experienceYears: 9,
  },
  {
    id: 'STF-EEE-06',
    name: 'Dr. Madhavan Pillai',
    email: 'madhavan.pillai@edunexus.edu',
    department: 'Electrical & Electronics (EEE)',
    designation: 'Professor',
    role: 'Faculty Advisor',
    cabin: 'Room P-304, Nikola Tesla Power Block',
    phone: '+91 98401 40006',
    officeHours: 'Mon, Thu 11:30 AM - 1:00 PM',
    coursesTaught: ['Electrical Machines I & II (Transformers & Alternators)', 'Electromagnetic Field Theory'],
    specialization: 'Induction Generators, Finite Element Magnetic Analysis, Transformer Losses',
    assignedStudentsCount: 21,
    experienceYears: 22,
  },
  {
    id: 'STF-EEE-07',
    name: 'Prof. Latha Venkatesh',
    email: 'latha.venkatesh@edunexus.edu',
    department: 'Electrical & Electronics (EEE)',
    designation: 'Assistant Professor',
    role: 'Faculty Advisor',
    cabin: 'Room P-118, Nikola Tesla Power Block',
    phone: '+91 98401 40007',
    officeHours: 'Wed, Fri 9:30 AM - 11:00 AM',
    coursesTaught: ['Electrical Measurements & Instrumentation', 'Sensors & Transducers', 'SCADA & PLC Programming'],
    specialization: 'Industrial PLC Ladder Logic, Siemens S7 Automation, Smart Metering',
    assignedStudentsCount: 18,
    experienceYears: 8,
  },
  {
    id: 'STF-EEE-08',
    name: 'Dr. Karthik Sundaresan',
    email: 'karthik.sundaresan@edunexus.edu',
    department: 'Electrical & Electronics (EEE)',
    designation: 'Assistant Professor',
    role: 'Faculty Advisor',
    cabin: 'Room P-109, Nikola Tesla Power Block',
    phone: '+91 98401 40008',
    officeHours: 'Tue, Thu 3:30 PM - 5:00 PM',
    coursesTaught: ['Power Quality & FACTs Devices', 'Harmonic Mitigation', 'Power System Deregulation'],
    specialization: 'Active Power Filters, STATCOM, Dynamic Voltage Restorers',
    assignedStudentsCount: 19,
    experienceYears: 11,
  },
  {
    id: 'STF-EEE-09',
    name: 'Prof. Divya Bharathi',
    email: 'divya.bharathi@edunexus.edu',
    department: 'Electrical & Electronics (EEE)',
    designation: 'Assistant Professor',
    role: 'Faculty Advisor',
    cabin: 'Room P-105, Nikola Tesla Power Block',
    phone: '+91 98401 40009',
    officeHours: 'Mon, Fri 3:00 PM - 4:30 PM',
    coursesTaught: ['Signals & Systems for Electrical Eng', 'Digital Logic Design', 'MATLAB/Simulink Modeling'],
    specialization: 'Simulink Power Blocksets, System Identification, Simulation Testing',
    assignedStudentsCount: 18,
    experienceYears: 7,
  },
  {
    id: 'STF-EEE-10',
    name: 'Dr. Subramanian Natarajan',
    email: 'subramanian.natarajan@edunexus.edu',
    department: 'Electrical & Electronics (EEE)',
    designation: 'Associate Professor',
    role: 'Faculty Advisor',
    cabin: 'Room P-208, Nikola Tesla Power Block',
    phone: '+91 98401 40010',
    officeHours: 'Wed, Thu 10:00 AM - 11:30 AM',
    coursesTaught: ['Power Plant Engineering', 'Substation Design & Earthing', 'Industrial Electrical Safety'],
    specialization: 'Arc Flash Analysis, Grounding Grid Design, National Electrical Code',
    assignedStudentsCount: 20,
    experienceYears: 14,
  },

  // --- MECHANICAL ENG (MECH) - 10 Staff ---
  {
    id: 'STF-MEC-01',
    name: 'Prof. Harish Chandra',
    email: 'harish.chandra@edunexus.edu',
    department: 'Mechanical Eng (MECH)',
    designation: 'Professor & Department Head (HOD)',
    role: 'Department Head',
    cabin: 'Room M-301, Sir M. Visvesvaraya Block',
    phone: '+91 98401 50001',
    officeHours: 'Mon, Wed 9:30 AM - 11:30 AM',
    coursesTaught: ['Design of Machine Elements', 'Kinematics & Dynamics of Machinery', 'Mechanical Vibrations'],
    specialization: 'Gearbox Dynamics, Rotor Vibration Analysis, Fatigue Life Estimation',
    assignedStudentsCount: 22,
    experienceYears: 24,
  },
  {
    id: 'STF-MEC-02',
    name: 'Prof. Vikramaditya Rao',
    email: 'vikram.rao@edunexus.edu',
    department: 'Mechanical Eng (MECH)',
    designation: 'Associate Professor & Robotics Lead',
    role: 'Faculty Advisor',
    cabin: 'Room M-205, Sir M. Visvesvaraya Block',
    phone: '+91 98401 50002',
    officeHours: 'Tue, Thu 1:30 PM - 3:30 PM',
    coursesTaught: ['Robotics & Industrial Automation', 'CAD/CAM SolidWorks', 'Mechatronic Systems'],
    specialization: 'Manipulator Kinematics, ROS (Robot Operating System), CNC Machining',
    assignedStudentsCount: 21,
    experienceYears: 14,
  },
  {
    id: 'STF-MEC-03',
    name: 'Dr. Anand Joshi',
    email: 'anand.joshi@edunexus.edu',
    department: 'Mechanical Eng (MECH)',
    designation: 'Associate Professor & Thermal Lab Director',
    role: 'Faculty Advisor',
    cabin: 'Room M-212, Sir M. Visvesvaraya Block',
    phone: '+91 98401 50003',
    officeHours: 'Mon, Thu 10:30 AM - 12:30 PM',
    coursesTaught: ['Thermodynamics & Heat Transfer', 'Internal Combustion Engines', 'Refrigeration & Air Conditioning'],
    specialization: 'Computational Fluid Dynamics (CFD), Heat Exchangers, EV Thermal Management',
    assignedStudentsCount: 20,
    experienceYears: 16,
  },
  {
    id: 'STF-MEC-04',
    name: 'Prof. Shalini Trivedi',
    email: 'shalini.trivedi@edunexus.edu',
    department: 'Mechanical Eng (MECH)',
    designation: 'Associate Professor',
    role: 'Faculty Advisor',
    cabin: 'Room M-208, Sir M. Visvesvaraya Block',
    phone: '+91 98401 50004',
    officeHours: 'Wed, Fri 11:00 AM - 1:00 PM',
    coursesTaught: ['Fluid Mechanics & Hydraulic Machinery', 'Pumps & Turbines', 'Aerodynamics Fundamentals'],
    specialization: 'Turbomachinery Blade Design, OpenFOAM CFD Modeling, Boundary Layer Theory',
    assignedStudentsCount: 19,
    experienceYears: 13,
  },
  {
    id: 'STF-MEC-05',
    name: 'Dr. Manoj Kumar Nair',
    email: 'manoj.nair@edunexus.edu',
    department: 'Mechanical Eng (MECH)',
    designation: 'Associate Professor & Materials Lead',
    role: 'Faculty Advisor',
    cabin: 'Room M-216, Sir M. Visvesvaraya Block',
    phone: '+91 98401 50005',
    officeHours: 'Tue, Fri 2:00 PM - 3:30 PM',
    coursesTaught: ['Strength of Materials & Solid Mechanics', 'Material Science & Metallurgy', 'Composite Materials'],
    specialization: 'Carbon-Fiber Reinforced Polymers, SEM Material Characterization, Tensile Testing',
    assignedStudentsCount: 20,
    experienceYears: 15,
  },
  {
    id: 'STF-MEC-06',
    name: 'Prof. Rajeshwari Patil',
    email: 'rajeshwari.patil@edunexus.edu',
    department: 'Mechanical Eng (MECH)',
    designation: 'Assistant Professor & FEA In-Charge',
    role: 'Faculty Advisor',
    cabin: 'Room M-114, Sir M. Visvesvaraya Block',
    phone: '+91 98401 50006',
    officeHours: 'Mon, Wed 2:30 PM - 4:00 PM',
    coursesTaught: ['Finite Element Analysis (ANSYS FEA)', 'Structural Mechanics', 'Computer Aided Drafting (CAD)'],
    specialization: 'Nonlinear Crash Simulation, Modal Analysis, Topology Optimization',
    assignedStudentsCount: 19,
    experienceYears: 9,
  },
  {
    id: 'STF-MEC-07',
    name: 'Dr. Pradeep Shenoy',
    email: 'pradeep.shenoy@edunexus.edu',
    department: 'Mechanical Eng (MECH)',
    designation: 'Assistant Professor',
    role: 'Faculty Advisor',
    cabin: 'Room M-118, Sir M. Visvesvaraya Block',
    phone: '+91 98401 50007',
    officeHours: 'Thu, Fri 10:00 AM - 11:30 AM',
    coursesTaught: ['Manufacturing Technology & Casting', 'Welding & Forming Processes', 'Additive Manufacturing (3D Printing)'],
    specialization: 'Selective Laser Sintering (SLS), Fused Deposition Modeling (FDM), Rapid Tooling',
    assignedStudentsCount: 18,
    experienceYears: 8,
  },
  {
    id: 'STF-MEC-08',
    name: 'Prof. Sandhya Hegde',
    email: 'sandhya.hegde@edunexus.edu',
    department: 'Mechanical Eng (MECH)',
    designation: 'Assistant Professor',
    role: 'Faculty Advisor',
    cabin: 'Room M-109, Sir M. Visvesvaraya Block',
    phone: '+91 98401 50008',
    officeHours: 'Tue, Thu 9:30 AM - 11:00 AM',
    coursesTaught: ['Industrial Engineering & Operations Research', 'Supply Chain Management', 'Total Quality Management (TQM)'],
    specialization: 'Six Sigma Lean Principles, Facility Layout Planning, Inventory Optimization',
    assignedStudentsCount: 19,
    experienceYears: 10,
  },
  {
    id: 'STF-MEC-09',
    name: 'Dr. Arunachalam Pillai',
    email: 'arunachalam.pillai@edunexus.edu',
    department: 'Mechanical Eng (MECH)',
    designation: 'Professor & Dean of Student Affairs',
    role: 'Dean of Academics',
    cabin: 'Room A-104, Central Academic Senate',
    phone: '+91 98401 50009',
    officeHours: 'Daily 4:00 PM - 5:30 PM',
    coursesTaught: ['Automobile Engineering', 'Vehicle Dynamics & Handling', 'Braking Systems'],
    specialization: 'Suspension Kinematics, Anti-Lock Braking Systems (ABS), Crashworthiness',
    assignedStudentsCount: 22,
    experienceYears: 23,
  },
  {
    id: 'STF-MEC-10',
    name: 'Prof. Rohit Kulkarni',
    email: 'rohit.kulkarni@edunexus.edu',
    department: 'Mechanical Eng (MECH)',
    designation: 'Assistant Professor & Hydraulics Mentor',
    role: 'Faculty Advisor',
    cabin: 'Room M-104, Sir M. Visvesvaraya Block',
    phone: '+91 98401 50010',
    officeHours: 'Wed, Fri 3:30 PM - 5:00 PM',
    coursesTaught: ['Hydraulics & Pneumatics Systems', 'Fluid Power Control', 'Instrumentation & Control Lab'],
    specialization: 'Electro-Hydraulic Proportional Valves, Pneumatic Actuators, PLC Interfacing',
    assignedStudentsCount: 19,
    experienceYears: 7,
  },
];

// -------------------------------------------------------------
// 1000 REALISTIC STUDENTS GENERATOR (200 PER BRANCH)
// -------------------------------------------------------------
const FIRST_NAMES_MALE = [
  'Aarav', 'Rohan', 'Karan', 'Aditya', 'Devendra', 'Nikhil', 'Rahul', 'Varun', 'Siddharth', 'Arjun',
  'Pranav', 'Harish', 'Manish', 'Kunal', 'Gaurav', 'Abhishek', 'Akash', 'Ayush', 'Karthik', 'Saurabh',
  'Vivek', 'Yash', 'Ankit', 'Rishi', 'Mayank', 'Tanmay', 'Chirag', 'Tushar', 'Neeraj', 'Deepak',
  'Praveen', 'Sanjay', 'Mukesh', 'Hemant', 'Sunil', 'Ashwin', 'Lokesh', 'Tarun', 'Shubham', 'Rajat',
];

const FIRST_NAMES_FEMALE = [
  'Sneha', 'Ananya', 'Pooja', 'Divya', 'Priya', 'Kavita', 'Ritu', 'Meera', 'Swati', 'Tanvi',
  'Shreya', 'Isha', 'Aishwarya', 'Neha', 'Sunita', 'Nandini', 'Rashmi', 'Malini', 'Smriti', 'Geetha',
  'Simran', 'Akanksha', 'Roshni', 'Bhavna', 'Sonali', 'Pallavi', 'Deepika', 'Aarti', 'Payal', 'Mansi',
  'Anjali', 'Komal', 'Prachi', 'Vidya', 'Shalini', 'Vandana', 'Preeti', 'Jyoti', 'Madhu', 'Suman',
];

const LAST_NAMES = [
  'Patel', 'Reddy', 'Verma', 'Kulkarni', 'Rao', 'Iyer', 'Sharma', 'Gupta', 'Sen', 'Mukherjee',
  'Nair', 'Bose', 'Chandra', 'Deshmukh', 'Bhattacharya', 'Nambiar', 'Joshi', 'Aggarwal', 'Chawla', 'Ghosh',
  'Padmanabhan', 'Narayanan', 'Das', 'Balan', 'Pillai', 'Venkatesh', 'Sundaresan', 'Bharathi', 'Trivedi', 'Patil',
  'Shenoy', 'Hegde', 'Mehra', 'Seshadri', 'Krishnan', 'Bansal', 'Vaidya', 'Mishra', 'Choudhary', 'Tripathi',
];

// Branch-specific skill & domain libraries
const BRANCH_CONFIG: Record<
  Department,
  {
    prefix: string;
    preferredDomains: PreferredDomain[];
    skills: string[];
    certs: string[];
    strengthsPool: string[];
    growthAreasPool: string[];
    concernAreasPool: string[];
  }
> = {
  'Computer Science (CSE)': {
    prefix: 'ENX',
    preferredDomains: ['Software Development', 'Data Analytics', 'Embedded Systems & IoT'],
    skills: ['Python', 'TypeScript', 'React.js', 'FastAPI', 'Docker', 'PostgreSQL', 'DSA', 'PyTorch', 'AWS', 'Git'],
    certs: ['AWS Certified Cloud Practitioner', 'Google Cloud Associate Engineer', 'LeetCode Knight 1800+', 'TensorFlow Developer'],
    strengthsPool: [
      'Exceptional algorithmic problem-solving speed',
      'Production-grade full-stack architecture design',
      'Clean Git branching and CI/CD discipline',
      'Strong relational schema normalization intuition',
      'Active peer code review and open source contributions',
    ],
    growthAreasPool: [
      'System design trade-offs under high concurrency',
      'Quantitative aptitude speed in campus recruitment screening',
      'Distributed caching strategies with Redis',
      'Timed behavioral mock interview articulation',
    ],
    concernAreasPool: [
      'Seeking high-compute GPU access for deep learning capstone',
      'Balancing competitive coding practice with lab assignments',
      'Requesting mock interview slots with Tier-1 alumni',
      'Seeking guidance on microservice container orchestration',
    ],
  },
  'Electronics & Comm (ECE)': {
    prefix: 'ENX',
    preferredDomains: ['Embedded Systems & IoT', 'Electronics Testing', 'Software Development'],
    skills: ['Embedded C', 'FreeRTOS', 'ARM Cortex-M4', 'ESP32', 'I2C/SPI', 'Verilog', 'MATLAB', 'Altium PCB', 'Oscilloscopes', 'Multisim'],
    certs: ['ARM Accredited Engineer', 'Cadence VLSI Certification', 'Texas Instruments Microcontrollers', 'IPC-A-610 PCB Soldering'],
    strengthsPool: [
      'Hands-on logic analyzer and oscilloscope hardware debugging',
      'Flawless FreeRTOS preemptive task scheduling comprehension',
      'Solid intuition for analog op-amp signal conditioning',
      'High practical laboratory attendance and rigorous documentation',
      'Strong PCB routing and noise immunity design',
    ],
    growthAreasPool: [
      'Fast Fourier Transform numerical calculations without formula sheet',
      'Timed 60-second quantitative aptitude problem solving',
      'Verilog testbench corner-case verification coverage',
      'Object-oriented C++ software patterns for firmware',
    ],
    concernAreasPool: [
      'Lab hardware availability during peak final-year project weeks',
      'More high-bandwidth digital storage oscilloscopes in Lab 3',
      'Clarification on priority ceiling protocol for RTOS midterm',
      'Guidance on VLSI front-end semiconductor campus drives',
    ],
  },
  'Information Tech (IT)': {
    prefix: 'ENX',
    preferredDomains: ['Data Analytics', 'Software Development', 'Embedded Systems & IoT'],
    skills: ['Python', 'SQL', 'Snowflake', 'Power BI', 'Apache Spark', 'Docker', 'Linux Shell', 'MongoDB', 'Node.js', 'Kubernetes'],
    certs: ['Google Professional Data Engineer', 'Microsoft Power BI Data Analyst Associate', 'Databricks Certified Associate', 'CompTIA Security+'],
    strengthsPool: [
      'Rapid data wrangling and ETL pipeline automation',
      'Structured SQL complex queries and window analytics',
      'Intuitive executive dashboard storytelling with Power BI',
      'Strong adherence to data privacy and schema governance',
      'Consistent weekly LMS quiz and video completion rate',
    ],
    growthAreasPool: [
      'Real-time streaming architectures with Apache Kafka',
      'Advanced graph traversal algorithms in competitive programming',
      'Mock interview communication for technical consulting roles',
      'Container networking and ingress controller configuration',
    ],
    concernAreasPool: [
      'Requesting cloud credits for multi-node Big Data cluster testing',
      'Need practice on live PostgreSQL enterprise connection pools',
      'Clarification on data warehousing star vs snowflake schema design',
      'Preparation for FinTech business intelligence hiring drives',
    ],
  },
  'Electrical & Electronics (EEE)': {
    prefix: 'ENX',
    preferredDomains: ['Embedded Systems & IoT', 'Electronics Testing', 'Software Development'],
    skills: ['MATLAB/Simulink', 'Power World', 'PLC Ladder Logic', 'Inverter Control', 'Battery BMS', 'Autodesk Eagle', 'Sensors', 'SCADA', 'LabVIEW'],
    certs: ['IEEE Power & Energy Society Certified', 'Siemens TIA Portal PLC Automation', 'MATLAB Associate Certified', 'National Electrical Safety Code'],
    strengthsPool: [
      'Thorough electrical substation single-line diagram analysis',
      'Precise MATLAB/Simulink motor drive controller tuning',
      'Excellent industrial safety compliance in high-voltage practicals',
      'Deep conceptual understanding of power factor correction',
      'Active leadership in university renewable energy club',
    ],
    growthAreasPool: [
      'State-space matrix transformation derivations',
      'Microcontroller PWM firmware coding in C',
      'Quantitative aptitude speed in placement screening rounds',
      'Electric vehicle regenerative braking torque algorithms',
    ],
    concernAreasPool: [
      'Requesting updated EV powertrain test bench fixtures in lab',
      'Guidance on GATE electrical engineering exam strategy',
      'Extended hours for power electronics simulation workstations',
      'Clarification on smart grid protection relay coordination',
    ],
  },
  'Mechanical Eng (MECH)': {
    prefix: 'ENX',
    preferredDomains: ['Electronics Testing', 'Software Development', 'Embedded Systems & IoT'],
    skills: ['SolidWorks CAD', 'ANSYS FEA', 'OpenFOAM CFD', 'Robotics (ROS)', 'GD&T', 'MATLAB', 'CNC G-Code', '3D Printing', 'Thermal Analysis'],
    certs: ['Certified SOLIDWORKS Professional (CSWP)', 'ANSYS Mechanical Structural Simulation', 'Autodesk Fusion 360 Certified', 'Six Sigma Green Belt'],
    strengthsPool: [
      'High-precision 3D CAD parametric modeling and assemblies',
      'Rigorous finite element mesh convergence validation',
      'Creative mechatronic linkage and actuator integration',
      'Punctual manufacturing workshop project milestones',
      'Effective interdisciplinary teamwork during formula student competitions',
    ],
    growthAreasPool: [
      'Navier-Stokes differential boundary conditions for turbulent flows',
      'Python scripting for automated ANSYS parametric runs',
      'Core technical interview verbal explanations of fatigue failure',
      'Aptitude math speed under 60-second pressure',
    ],
    concernAreasPool: [
      'Access to high-spec workstations for 3D ANSYS crash simulations',
      'Additional filament supplies for FDM rapid prototyping lab',
      'Clarification on gear tooth bending stress Lewis equation',
      'Industry placement pathways in automotive and robotics companies',
    ],
  },
};

// Deterministic Pseudo-Random Number Generator (PRNG) to ensure repeatable identical 1000 students
function createPRNG(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generate1000CollegeStudents(): Student[] {
  const students: Student[] = [];
  const rng = createPRNG(42893); // Deterministic fixed seed

  // Exactly 25 students for each of the 5 branches = 125 total (strictly scoped as requested)
  let globalIndex = 1;

  for (const branch of COLLEGE_BRANCHES) {
    const config = BRANCH_CONFIG[branch];
    const branchStaff = COLLEGE_STAFF_50.filter((s) => s.department === branch);

    for (let i = 1; i <= 25; i++) {
      let isMale: boolean;
      let firstName: string;
      let lastName: string;
      let fullName: string;

      let customMentor: string | undefined;

      if (branch === 'Computer Science (CSE)' && i === 1) {
        fullName = 'Sneha Reddy';
        firstName = 'Sneha';
        lastName = 'Reddy';
        isMale = false;
        customMentor = 'Dr. Arisudan Bose';
      } else if (branch === 'Computer Science (CSE)' && i === 2) {
        fullName = 'Deepika Nair';
        firstName = 'Deepika';
        lastName = 'Nair';
        isMale = false;
        customMentor = 'Prof. Ananya Iyer';
      } else if (branch === 'Computer Science (CSE)' && i === 3) {
        fullName = 'Rishi Choudhary';
        firstName = 'Rishi';
        lastName = 'Choudhary';
        isMale = true;
        customMentor = 'Dr. Vikramaditya Sen';
      } else if (branch === 'Computer Science (CSE)' && i === 4) {
        fullName = 'Pooja Kulkarni';
        firstName = 'Pooja';
        lastName = 'Kulkarni';
        isMale = false;
        customMentor = 'Dr. Arisudan Bose';
      } else if (branch === 'Electronics & Comm (ECE)' && i === 1) {
        fullName = 'Aarav Patel';
        firstName = 'Aarav';
        lastName = 'Patel';
        isMale = true;
        customMentor = 'Dr. Ramesh Sundaram';
      } else if (branch === 'Electronics & Comm (ECE)' && i === 2) {
        fullName = 'Karan Verma';
        firstName = 'Karan';
        lastName = 'Verma';
        isMale = true;
        customMentor = 'Dr. Ramesh Sundaram';
      } else if (branch === 'Electronics & Comm (ECE)' && i === 3) {
        fullName = 'Aditya Rao';
        firstName = 'Aditya';
        lastName = 'Rao';
        isMale = true;
        customMentor = 'Prof. Sunita Krishnan';
      } else if (branch === 'Electronics & Comm (ECE)' && i === 4) {
        fullName = 'Divya Sharma';
        firstName = 'Divya';
        lastName = 'Sharma';
        isMale = false;
        customMentor = 'Dr. Ramesh Sundaram';
      } else if (branch === 'Information Tech (IT)' && i === 1) {
        fullName = 'Sneha Kulkarni';
        firstName = 'Sneha';
        lastName = 'Kulkarni';
        isMale = false;
        customMentor = 'Dr. Vivek Mehra';
      } else if (branch === 'Information Tech (IT)' && i === 2) {
        fullName = 'Varun Nair';
        firstName = 'Varun';
        lastName = 'Nair';
        isMale = true;
        customMentor = 'Dr. Vivek Mehra';
      } else if (branch === 'Information Tech (IT)' && i === 3) {
        fullName = 'Nikhil Gupta';
        firstName = 'Nikhil';
        lastName = 'Gupta';
        isMale = true;
        customMentor = 'Prof. Rajeshwari Venkat';
      } else if (branch === 'Information Tech (IT)' && i === 4) {
        fullName = 'Priya Sen';
        firstName = 'Priya';
        lastName = 'Sen';
        isMale = false;
        customMentor = 'Dr. Vivek Mehra';
      } else if (branch === 'Electrical & Electronics (EEE)' && i === 1) {
        fullName = 'Vikramaditya Iyer';
        firstName = 'Vikramaditya';
        lastName = 'Iyer';
        isMale = true;
        customMentor = 'Prof. S. Padmanabhan';
      } else if (branch === 'Electrical & Electronics (EEE)' && i === 2) {
        fullName = 'Devendra Rao';
        firstName = 'Devendra';
        lastName = 'Rao';
        isMale = true;
        customMentor = 'Prof. S. Padmanabhan';
      } else if (branch === 'Electrical & Electronics (EEE)' && i === 3) {
        fullName = 'Siddharth Iyer';
        firstName = 'Siddharth';
        lastName = 'Iyer';
        isMale = true;
        customMentor = 'Dr. Chandrashekhar Rao';
      } else if (branch === 'Electrical & Electronics (EEE)' && i === 4) {
        fullName = 'Kavita Balan';
        firstName = 'Kavita';
        lastName = 'Balan';
        isMale = false;
        customMentor = 'Prof. S. Padmanabhan';
      } else if (branch === 'Mechanical Eng (MECH)' && i === 1) {
        fullName = 'Rohan Sharma';
        firstName = 'Rohan';
        lastName = 'Sharma';
        isMale = true;
        customMentor = 'Prof. Harish Chandra';
      } else if (branch === 'Mechanical Eng (MECH)' && i === 2) {
        fullName = 'Rohan Deshmukh';
        firstName = 'Rohan';
        lastName = 'Deshmukh';
        isMale = true;
        customMentor = 'Prof. Harish Chandra';
      } else if (branch === 'Mechanical Eng (MECH)' && i === 3) {
        fullName = 'Manish Kumar';
        firstName = 'Manish';
        lastName = 'Kumar';
        isMale = true;
        customMentor = 'Dr. K. S. Raman';
      } else if (branch === 'Mechanical Eng (MECH)' && i === 4) {
        fullName = 'Meera Bhattacharya';
        firstName = 'Meera';
        lastName = 'Bhattacharya';
        isMale = false;
        customMentor = 'Prof. Harish Chandra';
      } else {
        isMale = rng() > 0.45;
        firstName = isMale
          ? FIRST_NAMES_MALE[Math.floor(rng() * FIRST_NAMES_MALE.length)]
          : FIRST_NAMES_FEMALE[Math.floor(rng() * FIRST_NAMES_FEMALE.length)];
        lastName = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
        fullName = `${firstName} ${lastName}`;
      }

      const studentIdNum = String(globalIndex).padStart(4, '0');
      const studentId = `ENX-2024-${studentIdNum}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${studentIdNum.slice(-2)}@edunexus.edu`;

      // Semester: 2, 4, 6, 8 (evenly spread across 4 college years)
      const semester = i === 3 ? 4 : [2, 4, 6, 8][Math.floor(rng() * 4)];
      const batch = semester === 8 ? '2021-2025' : semester === 6 ? '2022-2026' : semester === 4 ? '2023-2027' : '2024-2028';

      // Mentor assigned strictly from this student's branch staff
      const mentor = branchStaff[i % branchStaff.length];
      const mentorName = customMentor || (mentor ? mentor.name : 'Dr. Ramesh Sundaram');

      let gpa: number;
      let prevGpa: number;
      let attendancePct: number;
      let backlogs: number;
      let codingScore: number;
      let aptitudeScore: number;
      let lmsCompletion: number;
      let satisfaction: 'Very High' | 'High' | 'Moderate' | 'Low';
      const roll = rng();

      // STRICT ACADEMIC RADAR PRESET FOR FLAGGED STUDENTS (i=1, 2, 3, 4 for each branch)
      if (i === 1) {
        // Urgent Priority: Multiple backlogs (2) + severe GPA drop (>1.5)
        const baseGpa = branch === 'Computer Science (CSE)' ? 6.20 : branch === 'Electronics & Comm (ECE)' ? 6.10 : branch === 'Information Tech (IT)' ? 6.00 : 5.90;
        const basePrev = branch === 'Computer Science (CSE)' ? 7.90 : branch === 'Electronics & Comm (ECE)' ? 7.80 : branch === 'Information Tech (IT)' ? 7.70 : branch === 'Electrical & Electronics (EEE)' ? 7.60 : 7.50;
        gpa = baseGpa;
        prevGpa = basePrev;
        backlogs = 2;
        attendancePct = 68;
        codingScore = 55;
        aptitudeScore = 60;
        lmsCompletion = 63;
        satisfaction = 'Low';
      } else if (i === 2) {
        // High Priority: 1 active backlog + significant drop (-0.8 to -0.9)
        const baseGpa = branch === 'Computer Science (CSE)' ? 6.70 : branch === 'Electronics & Comm (ECE)' ? 6.60 : branch === 'Information Tech (IT)' ? 6.50 : branch === 'Electrical & Electronics (EEE)' ? 6.60 : 6.50;
        const basePrev = branch === 'Computer Science (CSE)' ? 7.60 : branch === 'Electronics & Comm (ECE)' ? 7.50 : branch === 'Information Tech (IT)' ? 7.40 : branch === 'Electrical & Electronics (EEE)' ? 7.50 : 7.30;
        gpa = baseGpa;
        prevGpa = basePrev;
        backlogs = 1;
        attendancePct = 74;
        codingScore = 64;
        aptitudeScore = 68;
        lmsCompletion = 72;
        satisfaction = 'Moderate';
      } else if (i === 3) {
        // Medium Priority: 0 backlogs, but noticeable semester GPA drop (-0.70)
        const baseGpa = branch === 'Computer Science (CSE)' ? 7.50 : branch === 'Electronics & Comm (ECE)' ? 7.40 : branch === 'Information Tech (IT)' ? 7.30 : branch === 'Electrical & Electronics (EEE)' ? 7.20 : 7.10;
        const basePrev = branch === 'Computer Science (CSE)' ? 8.20 : branch === 'Electronics & Comm (ECE)' ? 8.10 : branch === 'Information Tech (IT)' ? 8.00 : branch === 'Electrical & Electronics (EEE)' ? 7.90 : 7.80;
        gpa = baseGpa;
        prevGpa = basePrev;
        backlogs = 0;
        attendancePct = 81;
        codingScore = 71;
        aptitudeScore = 73;
        lmsCompletion = 79;
        satisfaction = 'Moderate';
      } else if (i === 4) {
        // Urgent Priority: Multiple backlogs (2) + low GPA (<6.0)
        const baseGpa = branch === 'Computer Science (CSE)' ? 5.80 : branch === 'Electronics & Comm (ECE)' ? 5.90 : branch === 'Information Tech (IT)' ? 5.70 : branch === 'Electrical & Electronics (EEE)' ? 5.80 : 5.80;
        const basePrev = branch === 'Computer Science (CSE)' ? 7.40 : branch === 'Electronics & Comm (ECE)' ? 7.30 : branch === 'Information Tech (IT)' ? 7.20 : branch === 'Electrical & Electronics (EEE)' ? 7.40 : 7.40;
        gpa = baseGpa;
        prevGpa = basePrev;
        backlogs = 2;
        attendancePct = 63;
        codingScore = 48;
        aptitudeScore = 53;
        lmsCompletion = 58;
        satisfaction = 'Low';
      } else {
        // Normal distribution for remaining 21 students in each branch
        if (roll < 0.25) {
          // High Potential
          gpa = Number((8.8 + rng() * 1.0).toFixed(2));
          prevGpa = Number((gpa - 0.2 + rng() * 0.4).toFixed(2));
          attendancePct = Math.floor(92 + rng() * 7);
          backlogs = 0;
          codingScore = Math.floor(82 + rng() * 17);
          aptitudeScore = Math.floor(85 + rng() * 14);
          lmsCompletion = Math.floor(90 + rng() * 10);
          satisfaction = 'Very High';
        } else if (roll < 0.85) {
          // On Track
          gpa = Number((7.4 + rng() * 1.3).toFixed(2));
          prevGpa = Number((gpa - 0.1 + rng() * 0.2).toFixed(2));
          attendancePct = Math.floor(80 + rng() * 13);
          backlogs = 0;
          codingScore = Math.floor(68 + rng() * 16);
          aptitudeScore = Math.floor(70 + rng() * 16);
          lmsCompletion = Math.floor(78 + rng() * 14);
          satisfaction = rng() > 0.5 ? 'High' : 'Moderate';
        } else {
          // Moderate Attention
          gpa = Number((6.8 + rng() * 0.7).toFixed(2));
          prevGpa = Number((gpa + 0.1 - rng() * 0.2).toFixed(2));
          attendancePct = Math.floor(76 + rng() * 8);
          backlogs = 0;
          codingScore = Math.floor(58 + rng() * 14);
          aptitudeScore = Math.floor(60 + rng() * 14);
          lmsCompletion = Math.floor(68 + rng() * 12);
          satisfaction = 'Moderate';
        }
      }

      // Keep within valid limits
      gpa = Math.min(9.9, Math.max(5.0, gpa));
      prevGpa = Math.min(9.9, Math.max(5.0, prevGpa));
      attendancePct = Math.min(99, Math.max(55, attendancePct));

      const totalCredits = semester * 22;
      const internalScore = Math.min(98, Math.max(50, Math.round(gpa * 10)));
      const coreAverage = Math.min(99, Math.max(50, Math.round(gpa * 9.8)));

      const preferredDomain = config.preferredDomains[Math.floor(rng() * config.preferredDomains.length)];
      const readinessLevel: 'Job Ready' | 'Needs Target Practice' | 'Foundational Stage' =
        gpa >= 8.2 && codingScore >= 75 ? 'Job Ready' : gpa >= 6.8 ? 'Needs Target Practice' : 'Foundational Stage';

      // Pick 3-4 skills
      const studentSkills = config.skills.slice(0, 3 + Math.floor(rng() * 3));
      const studentCerts = rng() > 0.4 ? [config.certs[Math.floor(rng() * config.certs.length)]] : [];

      const strengths = [
        config.strengthsPool[Math.floor(rng() * config.strengthsPool.length)],
        `Solid attendance record (${attendancePct}%) and consistent lab dedication`,
        config.strengthsPool[(Math.floor(rng() * config.strengthsPool.length) + 1) % config.strengthsPool.length],
      ];

      const growthAreas = [
        config.growthAreasPool[Math.floor(rng() * config.growthAreasPool.length)],
        config.growthAreasPool[(Math.floor(rng() * config.growthAreasPool.length) + 1) % config.growthAreasPool.length],
      ];

      const primaryConcern = config.concernAreasPool[Math.floor(rng() * config.concernAreasPool.length)];

      const rawStudentData = {
        id: studentId,
        name: fullName,
        email,
        gender: isMale ? 'Male' : 'Female',
        department: branch,
        batch,
        semester,
        mentorName,
        academic: {
          gpa,
          previousSemesterGpa: prevGpa,
          internalAssessmentScore: internalScore,
          backlogsCount: backlogs,
          totalCreditsCompleted: totalCredits,
          coreSubjectAverage: coreAverage,
        },
        attendance: {
          overallPercentage: attendancePct,
          theoryPercentage: Math.max(50, attendancePct - 2),
          practicalPercentage: Math.min(100, attendancePct + 3),
          consecutiveAbsences: attendancePct < 75 ? Math.floor(rng() * 4) + 1 : 0,
          monthlyTrend: [
            { month: 'Aug', percentage: Math.min(100, attendancePct + 2) },
            { month: 'Sep', percentage: attendancePct },
            { month: 'Oct', percentage: Math.max(50, attendancePct - 3) },
            { month: 'Nov', percentage: attendancePct },
          ],
        },
        lms: {
          portalLoginsPerWeek: Math.floor(attendancePct / 6) + 2,
          moduleCompletionRate: lmsCompletion,
          quizAverageScore: Math.round(gpa * 9.5),
          assignmentOnTimeRate: lmsCompletion,
          videoWatchHours: Math.floor(15 + rng() * 25),
        },
        engagement: {
          forumPostsAndAnswers: Math.floor(5 + rng() * 25),
          extracurricularPoints: Math.floor(40 + rng() * 55),
          hackathonsAttended: roll < 0.3 ? Math.floor(1 + rng() * 4) : Math.floor(rng() * 2),
          seminarAttendance: Math.floor(3 + rng() * 8),
          clubLeadershipRole: roll < 0.2,
        },
        placement: {
          aptitudeScore,
          codingScore,
          mockInterviewRating: Number((gpa * 0.95).toFixed(1)),
          resumeReadinessScore: Math.min(98, Math.round(gpa * 9.6)),
          preferredDomain,
          readinessLevel,
        },
        skills: {
          technicalSkillRating: Math.round(gpa * 9.4),
          softSkillRating: Math.floor(65 + rng() * 28),
          verifiedCertifications: studentCerts,
          primaryTechnologies: studentSkills,
          gitHubProjectsCount: Math.floor(2 + rng() * 6),
        },
        feedback: {
          facultyRating: Number((Math.min(5.0, gpa / 2 + 0.3)).toFixed(1)),
          studentPulseScore: satisfaction === 'Very High' ? 4.8 : satisfaction === 'High' ? 4.2 : satisfaction === 'Moderate' ? 3.5 : 2.5,
          satisfactionLevel: satisfaction,
          primaryConcernArea: primaryConcern,
          advisorObservationNotes: `Student demonstrates steady academic engagement. Regular feedback tracked with faculty advisor ${mentorName}.`,
          isAnonymized: false,
        },
        strengths,
        growthAreas,
        loginStreak: Math.floor(1 + rng() * 18),
        lastLoginDate: new Date().toISOString().split('T')[0],
      };

      const breakdown = calculateCompositeBreakdown(
        rawStudentData.academic,
        rawStudentData.attendance,
        rawStudentData.lms,
        rawStudentData.engagement,
        rawStudentData.placement,
        rawStudentData.skills,
        rawStudentData.feedback
      );
      const riskLevel = determineRiskLevel(breakdown.compositeScore);

      students.push({
        ...rawStudentData,
        compositeScore: breakdown.compositeScore,
        riskLevel,
        breakdown,
      });

      globalIndex++;
    }
  }

  return students;
}

// Singleton instances for zero-overhead access across applet
export const INITIAL_COLLEGE_STUDENTS = generate1000CollegeStudents();

export interface CollegeOfficial {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  role: UserRole;
  cabin: string;
  phone: string;
  officeHours: string;
  responsibilities: string[];
  badge: string;
}

export const COLLEGE_OFFICIALS: CollegeOfficial[] = [
  {
    id: 'OFF-DEAN-01',
    name: 'Dr. K. V. Ramanathan',
    email: 'dean.academics@edunexus.edu',
    department: 'Office of Academic Affairs',
    designation: 'Dean of Academic Affairs (Cross-Branch Oversight)',
    role: 'Dean of Academics',
    cabin: 'Room E-101, Chanakya Administrative Block',
    phone: '+91 98401 00001',
    officeHours: 'Mon-Fri 2:00 PM - 5:00 PM',
    responsibilities: ['Curriculum Policy', 'Institutional Accreditation', 'Academic Audit across 5 Branches'],
    badge: 'Institutional Governance (1000 Students)',
  },
  {
    id: 'OFF-PRIN-01',
    name: 'Dr. P. Swaminathan',
    email: 'principal@edunexus.edu',
    department: 'College Executive Directorate',
    designation: 'Principal & Executive Director',
    role: 'Dean of Academics',
    cabin: 'Room E-102, Chanakya Administrative Block',
    phone: '+91 98401 00002',
    officeHours: 'Daily 11:00 AM - 1:00 PM',
    responsibilities: ['Campus Strategic Vision', 'Autonomous Governance', 'Research Grants'],
    badge: 'Executive Campus Directorate',
  },
  {
    id: 'OFF-PLC-01',
    name: 'Dr. Rajesh Khanna',
    email: 'placement.director@edunexus.edu',
    department: 'Placement & Corporate Relations',
    designation: 'Director of Corporate Relations & Placements',
    role: 'Placement Officer',
    cabin: 'Room P-101, Corporate Placement Wing',
    phone: '+91 98401 00003',
    officeHours: 'Mon-Sat 10:00 AM - 6:00 PM',
    responsibilities: ['Tier-1 Recruitment Drives', 'Industrial MOUs', 'Placement Benchmarks'],
    badge: 'Placement & Industry Head',
  },
  {
    id: 'OFF-COE-01',
    name: 'Dr. S. K. Narayanan',
    email: 'controller.exams@edunexus.edu',
    department: 'Examination & Evaluation Wing',
    designation: 'Controller of Examinations (COE)',
    role: 'Dean of Academics',
    cabin: 'Room X-201, Chanakya Administrative Block',
    phone: '+91 98401 00004',
    officeHours: 'Mon-Fri 10:00 AM - 1:00 PM',
    responsibilities: ['Semester Grading Integrity', 'End-Term Evaluation', 'Grade Audits'],
    badge: 'Examination Controller',
  },
  {
    id: 'OFF-STU-01',
    name: 'Prof. Harish Chandra',
    email: 'dean.studentwelfare@edunexus.edu',
    department: 'Student Welfare Directorate',
    designation: 'Dean of Student Affairs & Grievances',
    role: 'Faculty Advisor',
    cabin: 'Room S-105, Student Activity Centre',
    phone: '+91 98401 00005',
    officeHours: 'Mon-Fri 3:00 PM - 5:30 PM',
    responsibilities: ['Student Wellbeing & Redressal', 'Counseling Oversight', 'Anti-Ragging Squad'],
    badge: 'Student Welfare Dean',
  },
];

/**
 * Universal resolver to match any student by ID, legacy 3-digit ID, exact name, or email.
 * Guarantees that when a student logs in, their exact profile is ALWAYS loaded.
 */
export function resolveStudentId(idOrName: string, studentList: Student[]): Student | undefined {
  if (!idOrName || !studentList || studentList.length === 0) return undefined;
  const target = idOrName.toLowerCase().trim();

  // 1. Direct ID match (case-insensitive)
  let found = studentList.find((s) => s.id.toLowerCase() === target);
  if (found) return found;

  // 2. Legacy 3-digit ID alias map
  const legacyAliases: Record<string, string> = {
    'enx-2024-101': 'ENX-2024-0026', // Aarav Patel
    'enx-2024-102': 'ENX-2024-0001', // Sneha Reddy
    'enx-2024-103': 'ENX-2024-0027', // Karan Verma
    'enx-2024-104': 'ENX-2024-0051', // Sneha Kulkarni
    'enx-2024-105': 'ENX-2024-0101', // Rohan Sharma
    'enx-2024-106': 'ENX-2024-0002', // Deepika Nair
  };
  if (legacyAliases[target]) {
    found = studentList.find((s) => s.id === legacyAliases[target]);
    if (found) return found;
  }

  // 3. Match by exact full name
  found = studentList.find((s) => s.name.toLowerCase() === target);
  if (found) return found;

  // 4. Match by email
  found = studentList.find((s) => s.email.toLowerCase() === target);
  if (found) return found;

  // 5. Normalized alphanumeric string match (e.g. 'aaravpatel' === 'aarav patel')
  const cleanTarget = target.replace(/[^a-z0-9]/g, '');
  if (cleanTarget) {
    found = studentList.find((s) => s.name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanTarget);
    if (found) return found;

    // Check if ID without hyphens matches
    found = studentList.find((s) => s.id.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanTarget);
    if (found) return found;
  }

  return undefined;
}

