import { Department } from '../types/student';

export interface DailyNewsItem {
  id: string;
  date: string;
  title: string;
  category: string;
  content: string;
  readTime: string;
  department: Department;
  isToday?: boolean;
  author?: string;
}

export function getTodayDateString(): string {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return new Date().toLocaleDateString('en-US', options);
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return d.toLocaleDateString('en-US', options);
}

export const INITIAL_DAILY_NEWS: Record<Department, DailyNewsItem[]> = {
  'Electronics & Comm (ECE)': [
    {
      id: 'NEWS-ECE-TODAY',
      date: getTodayDateString(),
      title: 'FreeRTOS 2026 Core Release & RISC-V Hardware Security Extensions',
      category: 'Embedded Systems',
      content: 'The university microelectronics center deployed updated FreeRTOS kernels with hardware memory isolation on 32-bit RISC-V development boards. Students can explore secure task contexts in Lab 4.',
      readTime: '3 min read',
      department: 'Electronics & Comm (ECE)',
      isToday: true,
      author: 'Dr. Ramesh Sundaram (ECE HOD)',
    },
    {
      id: 'NEWS-ECE-YESTERDAY',
      date: getYesterdayDateString(),
      title: 'ISRO Satellite Telemetry Lab: Ground Station Active Tracking Workshop',
      category: 'Satellite & RF',
      content: 'ECE students conducted live orbital pass decodes of weather satellites using software-defined radio (SDR) and QFH antennas on the university observatory roof terrace.',
      readTime: '4 min read',
      department: 'Electronics & Comm (ECE)',
      isToday: false,
      author: 'Telecommunication Club',
    },
    {
      id: 'NEWS-ECE-ARCHIVE',
      date: 'Oct 14, 2026',
      title: 'Sub-3nm Gate-All-Around (GAA) Transistor Layout Clinic',
      category: 'VLSI Engineering',
      content: 'Cadence and Synopsys tool suites updated across all workstation terminals. Students preparing for microelectronics placements are invited to Thursday design rule check (DRC) clinic.',
      readTime: '2 min read',
      department: 'Electronics & Comm (ECE)',
      isToday: false,
      author: 'VLSI Research Lab',
    },
  ],

  'Computer Science (CSE)': [
    {
      id: 'NEWS-CSE-TODAY',
      date: getTodayDateString(),
      title: 'PostgreSQL 18 Release: Bi-Directional Sharding & Vector Embeddings',
      category: 'Database Systems',
      content: 'University database clusters upgraded with native pgvector indexing for sub-millisecond retrieval in LLM retrieval-augmented generation (RAG) capstone projects.',
      readTime: '3 min read',
      department: 'Computer Science (CSE)',
      isToday: true,
      author: 'Prof. Ananya Iyer',
    },
    {
      id: 'NEWS-CSE-YESTERDAY',
      date: getYesterdayDateString(),
      title: 'Campus Hackathon 2026: 48-Hour Full-Stack & AI Systems Sprint',
      category: 'Competitive Coding',
      content: 'Over 60 student teams registered for the annual hackathon sponsored by top-tier engineering firms. Focus domains include distributed consensus and autonomous agent workflows.',
      readTime: '4 min read',
      department: 'Computer Science (CSE)',
      isToday: false,
      author: 'ACM Student Chapter',
    },
    {
      id: 'NEWS-CSE-ARCHIVE',
      date: 'Oct 14, 2026',
      title: 'Zero-Knowledge Proofs in Decentralized Identity Frameworks',
      category: 'Cryptography',
      content: 'Guest lecture by alumni cybersecurity leads on zk-SNARKs and private credential verification for modern banking web services.',
      readTime: '5 min read',
      department: 'Computer Science (CSE)',
      isToday: false,
      author: 'Cybersecurity Cell',
    },
  ],

  'Information Tech (IT)': [
    {
      id: 'NEWS-IT-TODAY',
      date: getTodayDateString(),
      title: 'Apache Kafka 4.0 Event Streaming & Serverless Lakehouse Integration',
      category: 'Big Data & Cloud',
      content: 'New streaming telemetry pipeline launched in the Cloud Computing lab. Scholars can now build end-to-end Kafka-to-Snowflake pipelines with automated schema validation.',
      readTime: '3 min read',
      department: 'Information Tech (IT)',
      isToday: true,
      author: 'Dr. Shalini Mukherjee',
    },
    {
      id: 'NEWS-IT-YESTERDAY',
      date: getYesterdayDateString(),
      title: 'Zero Trust Network Architecture Rollout across Campus VPN',
      category: 'Cybersecurity',
      content: 'IT department implemented identity-aware proxy and mutual TLS (mTLS) authentication across student developer servers and remote laboratory access points.',
      readTime: '3 min read',
      department: 'Information Tech (IT)',
      isToday: false,
      author: 'Campus Systems Admin',
    },
  ],

  'Electrical & Electronics (EEE)': [
    {
      id: 'NEWS-EEE-TODAY',
      date: getTodayDateString(),
      title: '350kW Ultra-Fast EV Charger Silicon Carbide (SiC) Power Inverter Test',
      category: 'Power Electronics',
      content: 'Scholars in the Electric Mobility lab successfully benchmarked 98.7% inverter efficiency using wide-bandgap SiC power modules under continuous dynamic load simulation.',
      readTime: '4 min read',
      department: 'Electrical & Electronics (EEE)',
      isToday: true,
      author: 'Power Systems Society',
    },
    {
      id: 'NEWS-EEE-YESTERDAY',
      date: getYesterdayDateString(),
      title: 'Smart Grid Synchrophasor Real-Time Monitoring Pilot Active',
      category: 'Smart Grids',
      content: 'GPS-synchronized Phasor Measurement Units (PMUs) deployed on the campus microgrid feed solar substation metrics directly to central SCADA displays.',
      readTime: '3 min read',
      department: 'Electrical & Electronics (EEE)',
      isToday: false,
      author: 'Smart Grid Lab',
    },
  ],

  'Mechanical Eng (MECH)': [
    {
      id: 'NEWS-MECH-TODAY',
      date: getTodayDateString(),
      title: 'Collaborative Robotics: 6-Axis Cobot Assembly Line Optimization',
      category: 'Mechatronics & Robotics',
      content: 'Mechanical department unveiled two new collaborative robotic arms equipped with force-torque feedback sensors for sub-millimeter precision peg-in-hole assembly.',
      readTime: '3 min read',
      department: 'Mechanical Eng (MECH)',
      isToday: true,
      author: 'Prof. Vikramaditya Rao',
    },
    {
      id: 'NEWS-MECH-YESTERDAY',
      date: getYesterdayDateString(),
      title: 'Formula Student Hybrid Racecar Aerodynamic Wind Tunnel Testing',
      category: 'Automotive Engineering',
      content: 'Student motorsports team completed CFD simulations and scale wind tunnel validations, achieving a 14% drag reduction with carbon fiber front wings.',
      readTime: '4 min read',
      department: 'Mechanical Eng (MECH)',
      isToday: false,
      author: 'Motorsports Club',
    },
  ],
};
