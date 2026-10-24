import { Department } from '../types/student';

export interface QuizQuestion {
  id: number;
  subject: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty?: 'Fundamental' | 'Intermediate' | 'Advanced';
}

// 10 Comprehensive Questions for each Department
export const MASTER_DEPARTMENT_QUIZZES: Record<Department, QuizQuestion[]> = {
  'Electronics & Comm (ECE)': [
    {
      id: 1,
      subject: 'Embedded Systems & RTOS',
      question: 'What is the primary role of a Mutex in Real-Time Operating Systems (e.g., FreeRTOS)?',
      options: [
        'To dynamically resize task stack allocation at runtime',
        'To protect shared critical hardware/memory resources from concurrent race conditions',
        'To generate high-frequency PWM timer clocks for servo motors',
        'To compress binary firmware code in flash memory'
      ],
      correctIndex: 1,
      explanation: 'A Mutex (Mutual Exclusion object) provides exclusive ownership of shared peripherals or data, mitigating priority inversion via priority inheritance.',
      difficulty: 'Intermediate'
    },
    {
      id: 2,
      subject: 'Digital Signal Processing',
      question: 'Why are symmetric FIR (Finite Impulse Response) filters widely preferred in audio and telecommunication signal chains?',
      options: [
        'They offer infinitely sharp transition bands with zero computational cost',
        'They inherently provide strictly linear phase frequency response without phase distortion',
        'They require zero multipliers or hardware registers',
        'They are immune to quantization noise in 8-bit ADCs'
      ],
      correctIndex: 1,
      explanation: 'Symmetry in FIR filter impulse response coefficients guarantees constant group delay (strictly linear phase), preserving waveform shapes.',
      difficulty: 'Intermediate'
    },
    {
      id: 3,
      subject: 'Microcontrollers & Architecture',
      question: 'In ARM Cortex-M processors, what is the role of the Nested Vectored Interrupt Controller (NVIC)?',
      options: [
        'Directly powers off unused GPIO peripheral clocks',
        'Provides low-latency, deterministic interrupt dispatching with programmable priority levels and hardware tail-chaining',
        'Acts as the primary L1 instruction cache controller',
        'Compiles high-level C code into assembly machine opcodes'
      ],
      correctIndex: 1,
      explanation: 'The NVIC hardware handles interrupt prioritization, nesting, and tail-chaining in as few as 6-12 clock cycles.',
      difficulty: 'Advanced'
    },
    {
      id: 4,
      subject: 'Communication Protocols',
      question: 'Which of the following describes the I2C bus physical transmission layer?',
      options: [
        'Full-duplex 4-wire differential signaling with dedicated clock and chip select',
        'Two-wire open-drain bus (SDA and SCL) requiring external pull-up resistors',
        'Single-wire asynchronous half-duplex line with start/stop framing bits',
        'Wireless 2.4 GHz spread-spectrum frequency hopping channel'
      ],
      correctIndex: 1,
      explanation: 'I2C uses two bidirectional open-drain lines (Serial Data and Serial Clock) pulled high through external pull-up resistors.',
      difficulty: 'Fundamental'
    },
    {
      id: 5,
      subject: 'Analog Integrated Circuits',
      question: 'What happens to the bandwidth of an operational amplifier when its closed-loop gain is increased with negative feedback?',
      options: [
        'Bandwidth increases proportionally with gain',
        'Bandwidth decreases so that the Gain-Bandwidth Product (GBWP) remains constant',
        'Bandwidth remains strictly constant regardless of gain setting',
        'Bandwidth fluctuates randomly based on supply voltage drift'
      ],
      correctIndex: 1,
      explanation: 'For a single-pole op-amp, the product of closed-loop gain and -3dB bandwidth is a constant known as the Gain-Bandwidth Product (GBWP).',
      difficulty: 'Fundamental'
    },
    {
      id: 6,
      subject: 'VLSI Design',
      question: 'What is the dominant source of static power dissipation in deep sub-micron CMOS integrated circuits (< 28nm)?',
      options: [
        'Capacitive charging and discharging of internal transistor nodes',
        'Subthreshold leakage current and gate-oxide tunneling leakage',
        'Short-circuit direct path current during switching transitions',
        'Inductive ringing on package bond wires'
      ],
      correctIndex: 1,
      explanation: 'As transistor channel lengths shrink, gate oxides thin out, leading to exponential subthreshold and quantum tunneling leakage currents even in standby state.',
      difficulty: 'Advanced'
    },
    {
      id: 7,
      subject: 'Wireless Communications',
      question: 'In 5G NR and LTE wireless standards, what is the key advantage of OFDM (Orthogonal Frequency Division Multiplexing)?',
      options: [
        'Eliminates the requirement for analog power amplifiers at the transmitter',
        'Mitigates frequency-selective fading and multipath delay spread by dividing the channel into narrow orthogonal subcarriers',
        'Permits infinite distance line-of-sight propagation without path loss',
        'Requires zero guard bands or cyclic prefix intervals'
      ],
      correctIndex: 1,
      explanation: 'OFDM converts a broadband frequency-selective fading channel into multiple flat-fading parallel narrowband subcarriers, easily equalized with Cyclic Prefix.',
      difficulty: 'Intermediate'
    },
    {
      id: 8,
      subject: 'Electromagnetic Fields & Antennas',
      question: 'What is the radiation resistance of an ideal half-wave dipole antenna in free space?',
      options: [
        'Approximately 50 Ohms',
        'Approximately 73.13 Ohms',
        'Approximately 377 Ohms',
        'Approximately 120 Pi Ohms'
      ],
      correctIndex: 1,
      explanation: 'An ideal half-wave dipole in free space has an input impedance of approximately 73.13 + j42.5 Ohms, with a radiation resistance of ~73 Ohms.',
      difficulty: 'Fundamental'
    },
    {
      id: 9,
      subject: 'Control Systems',
      question: 'In a feedback control system, what is the effect of adding an Integral (I) controller to a Proportional (P) loop?',
      options: [
        'Drastically improves transient settling time without overshoot',
        'Eliminates steady-state error to step inputs by increasing system type number, but reduces stability margin',
        'Completely disables derivative action during load disturbances',
        'Renders the system open-loop unstable under all frequencies'
      ],
      correctIndex: 1,
      explanation: 'Integral action adds a pole at the origin (s=0), forcing steady-state tracking error to zero for step inputs while slightly decreasing phase margin.',
      difficulty: 'Intermediate'
    },
    {
      id: 10,
      subject: 'Sensors & IoT Telemetry',
      question: 'What is the principal benefit of using edge computing over raw cloud streaming in industrial IoT vibration analysis?',
      options: [
        'Edge devices use zero electrical power',
        'Reduces uplink network bandwidth and latency by computing FFT spectral feature vectors locally before transmitting alarms',
        'Guarantees 100% loss-free long-range Wi-Fi through solid concrete',
        'Eliminates the need for transducer calibration'
      ],
      correctIndex: 1,
      explanation: 'Running FFT and anomaly inference on the edge reduces gigabytes of raw sensor stream into kilobyte summary telemetry, enabling sub-millisecond safety shutoffs.',
      difficulty: 'Intermediate'
    }
  ],

  'Computer Science (CSE)': [
    {
      id: 1,
      subject: 'Algorithms & Complexity',
      question: 'What is the worst-case time complexity of randomized Quicksort when consistently picking suboptimal pivots?',
      options: ['O(N log N)', 'O(N)', 'O(N^2)', 'O(log N)'],
      correctIndex: 2,
      explanation: 'In the degenerate case where partition splits are maximally unbalanced (0 and N-1 elements), Quicksort recurses N times, resulting in O(N^2) complexity.',
      difficulty: 'Fundamental'
    },
    {
      id: 2,
      subject: 'Database Systems',
      question: 'Which ACID property guarantees that database transactions are executed completely or fully aborted without partial writes?',
      options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
      correctIndex: 0,
      explanation: 'Atomicity ensures all-or-nothing execution: if any statement in a transaction fails, all modifications are rolled back to the previous state.',
      difficulty: 'Fundamental'
    },
    {
      id: 3,
      subject: 'Operating Systems',
      question: 'What fundamental condition must hold for a Deadlock to occur according to the Coffman conditions?',
      options: [
        'Preemptive CPU scheduling enabled across threads',
        'Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait simultaneously present',
        'Excessive virtual memory swapping on secondary disk',
        'Lock-free atomic compare-and-swap CAS operations active'
      ],
      correctIndex: 1,
      explanation: 'Deadlock requires all 4 Coffman conditions to occur simultaneously. Breaking any one condition prevents system deadlock.',
      difficulty: 'Intermediate'
    },
    {
      id: 4,
      subject: 'Computer Networks',
      question: 'In TCP congestion control, what triggers the Fast Retransmit algorithm?',
      options: [
        'Expiration of the main retransmission timeout (RTO) timer',
        'Receipt of three duplicate ACKs for the same sequence number from the receiver',
        'Receipt of an ICMP destination unreachable packet',
        'Detection of jitter exceeding 50 milliseconds'
      ],
      correctIndex: 1,
      explanation: 'When 3 duplicate ACKs arrive, TCP infers packet loss without waiting for the slow RTO timer to expire, immediately retransmitting the missing segment.',
      difficulty: 'Intermediate'
    },
    {
      id: 5,
      subject: 'Data Structures',
      question: 'What is the worst-case search time complexity in a balanced Red-Black Tree or AVL Tree with N elements?',
      options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
      correctIndex: 1,
      explanation: 'Self-balancing binary search trees maintain maximum height O(log N), guaranteeing search, insertion, and deletion in O(log N) worst-case time.',
      difficulty: 'Fundamental'
    },
    {
      id: 6,
      subject: 'Distributed Systems',
      question: 'According to the CAP Theorem, what tradeoff must a distributed data store make during an inevitable network partition (P)?',
      options: [
        'Choose between Consistency (C) and Availability (A)',
        'Choose between Latency and Security',
        'Sacrifice durability of transaction logs',
        'Disable all replica synchronization indefinitely'
      ],
      correctIndex: 0,
      explanation: 'When a network partition splits servers, a system can either respond with stale data (prioritizing Availability) or return errors until consistent (prioritizing Consistency).',
      difficulty: 'Advanced'
    },
    {
      id: 7,
      subject: 'Artificial Intelligence & ML',
      question: 'In Deep Neural Networks, what is the primary purpose of Dropout regularization during training?',
      options: [
        'Accelerate forward-pass matrix multiplications on GPU tensor cores',
        'Prevent overfitting by randomly zeroing activations to break co-adaptation between neurons',
        'Enforce mathematical convexity on non-convex loss surfaces',
        'Normalize input batch features to zero mean and unit variance'
      ],
      correctIndex: 1,
      explanation: 'Dropout randomly deactivates a subset of neurons during each training step, forcing the network to learn robust, distributed representations.',
      difficulty: 'Intermediate'
    },
    {
      id: 8,
      subject: 'Compiler Design',
      question: 'Which phase of compiler construction is responsible for checking type consistency and variable scope declaration rules?',
      options: [
        'Lexical Analysis (Scanner)',
        'Syntax Analysis (Parser generating AST)',
        'Semantic Analysis (Type checking & Symbol Table binding)',
        'Target Code Generation & Register Allocation'
      ],
      correctIndex: 2,
      explanation: 'Semantic analysis decorates the abstract syntax tree, verifying type safety, variable declaration scopes, and function signatures.',
      difficulty: 'Intermediate'
    },
    {
      id: 9,
      subject: 'Cybersecurity & Cryptography',
      question: 'In asymmetric public-key cryptography (e.g. RSA or ECC), which key is used to sign a digital document and which to verify it?',
      options: [
        'Signed with Public Key, Verified with Private Key',
        'Signed with Private Key, Verified with Public Key',
        'Signed with Symmetric Session Key only',
        'Signed with Certificate Authority password'
      ],
      correctIndex: 1,
      explanation: 'The sender signs data using their private key. Anyone possessing the corresponding public key can mathematically verify authenticity without knowing the private key.',
      difficulty: 'Fundamental'
    },
    {
      id: 10,
      subject: 'Software Architecture',
      question: 'What is the primary benefit of the Idempotency pattern in RESTful API microservices (e.g., using an Idempotency-Key header)?',
      options: [
        'Guarantees duplicate requests (e.g. payment retries) produce the exact same outcome without multiple billings',
        'Encrypts HTTP request payloads with AES-256 in transit',
        'Eliminates the need for relational database indexes',
        'Bypasses reverse proxy rate limiting'
      ],
      correctIndex: 0,
      explanation: 'Idempotency ensures that executing an identical operation multiple times (due to client retries or network drops) produces the exact same state as a single call.',
      difficulty: 'Advanced'
    }
  ],

  'Information Tech (IT)': [
    {
      id: 1,
      subject: 'Data Analytics & SQL',
      question: 'Which SQL clause is evaluated after grouping rows with GROUP BY to filter aggregate summaries?',
      options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'],
      correctIndex: 1,
      explanation: 'HAVING filters aggregated summary values (e.g., HAVING COUNT(*) > 5), whereas WHERE filters individual table rows prior to grouping.',
      difficulty: 'Fundamental'
    },
    {
      id: 2,
      subject: 'Cloud Computing & AWS',
      question: 'What is the main difference between Amazon S3 and Amazon EBS storage in cloud architecture?',
      options: [
        'S3 is block storage for operating system boots, EBS is global object storage',
        'S3 is highly scalable object storage accessed via HTTP APIs; EBS is persistent block storage attached directly to EC2 instances',
        'EBS has infinite global durability, S3 is limited to a single rack',
        'S3 cannot store files larger than 1 megabyte'
      ],
      correctIndex: 1,
      explanation: 'S3 is an object store for unstructured files (images, backups) accessible via web URLs; EBS provides raw virtual disk blocks formatted by an EC2 filesystem.',
      difficulty: 'Fundamental'
    },
    {
      id: 3,
      subject: 'DevOps & Containers',
      question: 'What is the key architectural distinction between a Docker container and a standard Kernel Virtual Machine (VM)?',
      options: [
        'Containers bundle a complete guest operating system kernel for each app',
        'Containers share the host operating system kernel via Linux namespaces and cgroups, making them lightweight and fast to boot',
        'Virtual Machines cannot run on Linux servers',
        'Containers require hardware virtualization extensions (VT-x) in BIOS'
      ],
      correctIndex: 1,
      explanation: 'Containers virtualize at the OS level, isolating process trees and memory via cgroups/namespaces while sharing the host kernel, unlike hypervisor VMs.',
      difficulty: 'Intermediate'
    },
    {
      id: 4,
      subject: 'Big Data & Spark',
      question: 'In Apache Spark, what is a Resilient Distributed Dataset (RDD) transformation versus an action?',
      options: [
        'Transformations execute eagerly; actions are discarded immediately',
        'Transformations (e.g. map, filter) are lazily evaluated DAG plans; actions (e.g. count, collect) trigger actual computation cluster execution',
        'Actions write data to HDFS; transformations delete partitions',
        'RDDs cannot be transformed more than once'
      ],
      correctIndex: 1,
      explanation: 'Spark uses lazy evaluation: transformation lineage graphs are built in memory and only evaluated when an action (collect, count) demands output.',
      difficulty: 'Intermediate'
    },
    {
      id: 5,
      subject: 'Web Technologies & Security',
      question: 'What attack vector does a Cross-Site Scripting (XSS) vulnerability exploit?',
      options: [
        'Injecting unauthorized SQL statements into backend database queries',
        'Injecting malicious client-side JavaScript into web pages viewed by other users to steal session cookies',
        'Flooding network routers with high-volume UDP packets',
        'Overflowing stack memory buffers in C server daemons'
      ],
      correctIndex: 1,
      explanation: 'XSS allows an attacker to execute arbitrary scripts in the victim browser context, hijacking authenticated session tokens and credentials.',
      difficulty: 'Fundamental'
    },
    {
      id: 6,
      subject: 'ETL Pipelines',
      question: 'What is the purpose of a Change Data Capture (CDC) mechanism in modern real-time data streaming (e.g. Debezium + Kafka)?',
      options: [
        'Periodically dumps whole database tables into CSV every midnight',
        'Monitors transaction database write-ahead logs (WAL) to stream row-level insert, update, and delete events in real time',
        'Encrypts hard drives at the firmware level',
        'Generates automated mock test datasets'
      ],
      correctIndex: 1,
      explanation: 'CDC captures granular database row changes directly from transaction logs without polling or degrading production OLTP performance.',
      difficulty: 'Advanced'
    },
    {
      id: 7,
      subject: 'Distributed Caching',
      question: 'What is the Cache Stampede (or Thundering Herd) problem and how is it prevented in Redis architectures?',
      options: [
        'Cache memory fills to 100% and crashes the Redis server',
        'Concurrent requests simultaneously hit the database when a popular cached key expires; mitigated by probabilistic early expiration or mutex locks',
        'Data corruption during network partitioning',
        'Clients failing to authenticate with Redis passwords'
      ],
      correctIndex: 1,
      explanation: 'When a hot key expires, thousands of simultaneous queries hammer the backing SQL database. Mutex locks or XFetch probabilistic refresh prevent the crash.',
      difficulty: 'Advanced'
    },
    {
      id: 8,
      subject: 'Microservices & API Gateways',
      question: 'What is the function of the Circuit Breaker pattern (e.g., Netflix Hystrix / Resilience4j)?',
      options: [
        'Shuts down all cloud servers when monthly budgets exceed limits',
        'Detects downstream microservice failures and trips open to fast-fail subsequent requests, preventing cascading system exhaustion',
        'Balances HTTP traffic evenly across multiple Availability Zones',
        'Validates JSON schema payloads against OpenAPI specifications'
      ],
      correctIndex: 1,
      explanation: 'Circuit Breaker monitors failure rates: if a service starts timing out, it trips open to immediately return fallbacks instead of tying up thread pools.',
      difficulty: 'Intermediate'
    },
    {
      id: 9,
      subject: 'Data Warehousing',
      question: 'What is the primary difference between a Star Schema and a Snowflake Schema in columnar analytical databases (Snowflake, BigQuery)?',
      options: [
        'Star schemas store data as JSON documents; Snowflake schemas store pure XML',
        'In a Star schema, dimension tables are denormalized; in a Snowflake schema, dimensions are normalized into sub-dimension tables',
        'Star schemas require NoSQL databases; Snowflake schemas require Oracle',
        'Snowflake schemas have zero fact tables'
      ],
      correctIndex: 1,
      explanation: 'Star schemas denormalize dimension tables for faster analytical scan joins; Snowflake schemas normalize dimensions into hierarchical tables.',
      difficulty: 'Intermediate'
    },
    {
      id: 10,
      subject: 'Message Queues',
      question: 'In Apache Kafka, what happens when a consumer group has more consumer instances than partitions in a topic?',
      options: [
        'Kafka dynamically creates new topic partitions on brokers',
        'The surplus consumer instances sit completely idle with zero assigned partitions',
        'Consumer instances randomly drop 50% of messages',
        'The topic throughput scales proportionally with the extra consumers'
      ],
      correctIndex: 1,
      explanation: 'A topic partition can only be consumed by at most one consumer instance within a consumer group at any given time, leaving surplus instances idle.',
      difficulty: 'Advanced'
    }
  ],

  'Electrical & Electronics (EEE)': [
    {
      id: 1,
      subject: 'Power Systems & Transmission',
      question: 'What is the principal advantage of High Voltage Direct Current (HVDC) transmission over conventional AC for long distances (>600km)?',
      options: [
        'Eliminates charging current reactive power losses and skin effect, enabling higher power transfer capability across long lines and subsea cables',
        'Eliminates the requirement for power electronic converter stations',
        'Enables direct voltage step-up using simple magnetic transformers without rectifiers',
        'Reduces tower insulation requirements to zero'
      ],
      correctIndex: 0,
      explanation: 'HVDC eliminates cable capacitive charging losses and skin effect, allowing bulk power transfer over vast distances and underwater links where AC cables fail.',
      difficulty: 'Fundamental'
    },
    {
      id: 2,
      subject: 'Power Electronics',
      question: 'Which power semiconductor switch is best suited for high-voltage, high-power railway traction and wind turbine inverters (>3.3kV, hundreds of Amperes)?',
      options: ['Low-voltage silicon MOSFET', 'IGBT (Insulated Gate Bipolar Transistor) or SiC MOSFET', 'Signal Schottky diode', 'Bipolar Junction Transistor (BJT)'],
      correctIndex: 1,
      explanation: 'IGBTs combine the simple voltage-controlled gate of MOSFETs with the high current-carrying and low on-state voltage drop of bipolar transistors.',
      difficulty: 'Fundamental'
    },
    {
      id: 3,
      subject: 'Electrical Machines',
      question: 'In a 3-phase induction motor, what happens when the rotor rotates at exactly the synchronous speed (Slip s = 0)?',
      options: [
        'The motor produces maximum torque and burns out windings',
        'Zero relative motion exists between rotating magnetic field and rotor bars, producing zero induced EMF, zero rotor current, and zero electromagnetic torque',
        'The motor operates as a synchronous generator feeding power back',
        'The power factor reaches unity (1.0)'
      ],
      correctIndex: 1,
      explanation: 'Induction motors rely on slip (relative velocity) to induce currents in the rotor bars. At synchronous speed, relative speed is zero, producing zero torque.',
      difficulty: 'Intermediate'
    },
    {
      id: 4,
      subject: 'Control Systems',
      question: 'What does the Routh-Hurwitz stability criterion determine for an electrical feedback system?',
      options: [
        'Calculates the exact transient peak overshoot percentage',
        'Determines whether any roots of the characteristic polynomial lie in the unstable right-half of the complex s-plane without factoring the polynomial',
        'Measures the total harmonic distortion of current waveforms',
        'Optimizes copper wire gauge for motor windings'
      ],
      correctIndex: 1,
      explanation: 'Routh-Hurwitz array signs reveal whether any characteristic roots reside in the right-half plane (RHP), proving system stability without solving high-degree roots.',
      difficulty: 'Intermediate'
    },
    {
      id: 5,
      subject: 'Power System Protection',
      question: 'What is the operating principle of a differential relay used to protect large power transformers and generators?',
      options: [
        'Monitors ambient air temperature around cooling radiators',
        'Compares the currents entering and leaving the protected zone; trips when an internal fault creates an unbalanced differential current vector',
        'Measures voltage drop across neutral grounding resistors during rainstorms',
        'Detects overspeed on cooling fan blades'
      ],
      correctIndex: 1,
      explanation: 'Differential protection (Kirchhoff’s Current Law) compares incoming vs outgoing currents; any divergence indicates an internal fault within the protected boundary.',
      difficulty: 'Fundamental'
    },
    {
      id: 6,
      subject: 'Renewable Energy',
      question: 'What is the role of Maximum Power Point Tracking (MPPT) algorithms (e.g. Perturb & Observe) in solar photovoltaic inverters?',
      options: [
        'Mechanically tilts solar panels towards the morning sun with servo motors',
        'Dynamically adjusts inverter DC operating impedance so the PV array operates at its non-linear peak power knee voltage and current under varying irradiance',
        'Filters out 50Hz harmonics from grid AC lines',
        'Stores excess DC power in supercapacitors'
      ],
      correctIndex: 1,
      explanation: 'Solar I-V curves shift with temperature and sunlight; MPPT algorithms tune the converter duty cycle to operate at the exact peak power point ($P_{max} = V_{mp} \\times I_{mp}$).',
      difficulty: 'Intermediate'
    },
    {
      id: 7,
      subject: 'Electric Vehicles & Drives',
      question: 'Why are Permanent Magnet Synchronous Motors (PMSM) widely chosen for electric vehicle propulsion over standard induction motors?',
      options: [
        'PMSMs require zero power electronic inverter control',
        'Higher power density, superior low-speed torque efficiency, and absence of rotor copper losses',
        'PMSMs run directly on single-phase AC household wall plugs',
        'Permanent magnets eliminate thermal dissipation completely'
      ],
      correctIndex: 1,
      explanation: 'PMSMs use rare-earth neodymium magnets in the rotor, eliminating rotor excitation $I^2R$ copper losses and delivering high torque-to-weight ratios essential for EVs.',
      difficulty: 'Intermediate'
    },
    {
      id: 8,
      subject: 'Smart Grids & Synchrophasors',
      question: 'What is a Phasor Measurement Unit (PMU) in modern smart power grids?',
      options: [
        'A manual mechanical power factor correction capacitor switch',
        'A high-speed sensor measuring voltage and current phasors synchronized with GPS time stamps (30-60 samples/sec) for real-time grid stability monitoring',
        'A residential smart electric meter reading monthly kilowatt-hours',
        'A step-down distribution transformer pole unit'
      ],
      correctIndex: 1,
      explanation: 'PMUs measure GPS-time-synchronized voltage/current phasors across interconnected grids, alerting operators to inter-area power oscillations before blackouts occur.',
      difficulty: 'Advanced'
    },
    {
      id: 9,
      subject: 'Electromagnetic Interference (EMI)',
      question: 'Why are snubber circuits (e.g. series RC across power MOSFETs/IGBTs) incorporated into high-frequency switching converters?',
      options: [
        'To reduce audible fan noise inside equipment enclosures',
        'To suppress transient high-voltage inductive spikes ($L \\frac{di}{dt}$) and dampen switching ringing across the semiconductor switch',
        'To boost efficiency by converting heat back into current',
        'To calibrate analog voltmeter scales'
      ],
      correctIndex: 1,
      explanation: 'Fast switching transients across parasitic circuit inductances produce dangerous overvoltage spikes; snubbers dissipate this energy safely and reduce EMI.',
      difficulty: 'Fundamental'
    },
    {
      id: 10,
      subject: 'High Voltage Engineering',
      question: 'What phenomenon causes violet glow, audible hissing, and ozone generation around high-voltage transmission conductors when air dielectric breakdown is exceeded?',
      options: ['Ferranti Effect', 'Corona Discharge', 'Skin Effect', 'Proximity Effect'],
      correctIndex: 1,
      explanation: 'Corona discharge occurs when the localized electric field gradient around high-voltage conductors ionizes the surrounding air, dissipating power as light and sound.',
      difficulty: 'Fundamental'
    }
  ],

  'Mechanical Eng (MECH)': [
    {
      id: 1,
      subject: 'Thermodynamics & Power Cycles',
      question: 'What is the purpose of reheating steam between high-pressure and low-pressure turbines in an industrial Rankine power cycle?',
      options: [
        'To lower the condensation temperature below ambient water freezing point',
        'To elevate thermal cycle efficiency and prevent excessive moisture droplet erosion in the final turbine expansion stages',
        'To eliminate the need for boiler feedwater pumps',
        'To decrease the overall fuel consumption by 90%'
      ],
      correctIndex: 1,
      explanation: 'Reheating expands the average heat addition temperature, raising efficiency and maintaining steam quality above 90% at the low-pressure exhaust.',
      difficulty: 'Intermediate'
    },
    {
      id: 2,
      subject: 'Fluid Mechanics & Aerodynamics',
      question: 'What dimensionless number represents the ratio of inertial forces to viscous forces in fluid flow regimes?',
      options: ['Mach Number', 'Reynolds Number (Re)', 'Prandtl Number', 'Nusselt Number'],
      correctIndex: 1,
      explanation: 'The Reynolds Number ($Re = \\frac{\\rho v D}{\\mu}$) dictates whether flow is laminar ($Re < 2300$ in pipes), transitional, or turbulent.',
      difficulty: 'Fundamental'
    },
    {
      id: 3,
      subject: 'Robotics & Kinematics',
      question: 'What is the Denavit-Hartenberg (D-H) convention in multi-axis robotic arm modeling?',
      options: [
        'A finite-element method for estimating aluminum fatigue limits',
        'A standardized mathematical framework using 4 geometric parameters to define coordinate frames and compute forward kinematics of robotic joints',
        'A PID tuning rule for pneumatic piston actuators',
        'A CAD modeling standard for 3D printing gears'
      ],
      correctIndex: 1,
      explanation: 'D-H parameters ($\theta, d, a, \\alpha$) systematically map reference transformations between consecutive links in articulated robotic kinematic chains.',
      difficulty: 'Advanced'
    },
    {
      id: 4,
      subject: 'Strength of Materials',
      question: 'According to von Mises yield criterion, when does plastic yielding occur in ductile metals under multi-axial state of stress?',
      options: [
        'When the maximum normal stress equals atmospheric pressure',
        'When the octahedral shear stress or distortional strain energy per unit volume reaches that of simple tension yield',
        'When total volumetric compression exceeds 10%',
        'When hydrostatic pressure drops below zero'
      ],
      correctIndex: 1,
      explanation: 'The von Mises criterion states that yielding initiates when the shear strain energy of distortion reaches the critical energy of uniaxial yield.',
      difficulty: 'Intermediate'
    },
    {
      id: 5,
      subject: 'Heat Transfer',
      question: 'In convective heat transfer across a flat plate, what does the Prandtl number ($Pr = \\frac{\\nu}{\\alpha}$) physically signify?',
      options: [
        'Ratio of buoyant force to viscous force in natural convection',
        'Ratio of momentum diffusivity (kinematic viscosity) to thermal diffusivity, governing the relative thicknesses of velocity and thermal boundary layers',
        'Ratio of radiative heat flux to conductive heat flux',
        'Ratio of turbulent eddies to laminar stream velocity'
      ],
      correctIndex: 1,
      explanation: 'When $Pr = 1$, velocity and thermal boundary layer thicknesses grow at the exact same rate; for liquid metals $Pr \\ll 1$, thermal boundary layers dominate.',
      difficulty: 'Intermediate'
    },
    {
      id: 6,
      subject: 'CAD/CAM & Manufacturing',
      question: 'In G-code programming for 3-axis CNC milling machines, what does the modal command G00 command the cutting tool to do?',
      options: [
        'Linear cutting interpolation at specified feed rate F',
        'Rapid traverse positioning at maximum machine transit speed without cutting material',
        'Circular interpolation in clockwise direction',
        'Spindle stop and coolant shutoff'
      ],
      correctIndex: 1,
      explanation: 'G00 commands non-cutting rapid positioning to travel quickly between machining coordinates; G01 commands linear feed cutting.',
      difficulty: 'Fundamental'
    },
    {
      id: 7,
      subject: 'Automobile Engineering',
      question: 'What is the function of a mechanical differential unit in a vehicle rear axle drive assembly?',
      options: [
        'To keep both drive wheels locked at identical rotational speeds at all times',
        'To allow the outer wheel to rotate faster than the inner wheel while cornering, transmitting equal torque to both drive wheels',
        'To disengage the clutch when braking',
        'To increase turbocharger boost pressure during acceleration'
      ],
      correctIndex: 1,
      explanation: 'While cornering, the outer drive wheel must travel a larger arc radius than the inner wheel; the differential allows speed variation while maintaining drive torque.',
      difficulty: 'Fundamental'
    },
    {
      id: 8,
      subject: 'Material Science & Metallurgy',
      question: 'What is the microstructural product formed when austenite in high-carbon steel is rapidly quenched in cold water to prevent carbon diffusion?',
      options: ['Pearlite', 'Martensite (BCT crystal structure with high hardness and brittleness)', 'Ferrite', 'Cementite lamellae'],
      correctIndex: 1,
      explanation: 'Diffusionless shear transformation traps carbon atoms in the iron lattice, distorting FCC austenite into ultra-hard, brittle Body-Centered Tetragonal (BCT) martensite.',
      difficulty: 'Intermediate'
    },
    {
      id: 9,
      subject: 'Vibrations & Dynamics',
      question: 'What critical condition occurs when the excitation frequency of an external periodic force matches the natural frequency of a mechanical structure?',
      options: [
        'Resonance, where vibration amplitude amplifies exponentially and can cause catastrophic mechanical failure if damping is low',
        'Harmonic cancellation resulting in complete stillness',
        'Spontaneous phase reversal without vibration',
        'Immediate reduction in structural inertia'
      ],
      correctIndex: 0,
      explanation: 'At resonance ($\omega = \omega_n$), the system absorbs maximum energy from the driver; without adequate damping, vibration amplitudes escalate dangerously.',
      difficulty: 'Fundamental'
    },
    {
      id: 10,
      subject: 'Mechatronics & Actuators',
      question: 'What is the key functional difference between a Stepper Motor and a closed-loop Brushless DC (BLDC) Servo Motor?',
      options: [
        'Stepper motors require optical encoder feedback; servo motors cannot use feedback',
        'Stepper motors move in discrete open-loop angular steps and can lose synchronism under high torque loads; servo motors continuously adjust current using closed-loop encoder feedback',
        'Stepper motors only operate on AC grid lines',
        'BLDC servo motors cannot operate at high rotational velocities'
      ],
      correctIndex: 1,
      explanation: 'Stepper motors rotate in fixed steps without position verification; closed-loop servo motors continuously compare target position against encoder feedback to guarantee torque.',
      difficulty: 'Intermediate'
    }
  ]
};

/**
 * Returns 10 daily questions for a given department.
 * Uses a daily date hash so questions rotate fresh every day of the year!
 */
export function getDailyDepartmentQuiz(department: Department, referenceDate: Date = new Date()): QuizQuestion[] {
  const masterList = MASTER_DEPARTMENT_QUIZZES[department] || MASTER_DEPARTMENT_QUIZZES['Electronics & Comm (ECE)'];
  
  // Calculate day of the year (0 - 365)
  const start = new Date(referenceDate.getFullYear(), 0, 0);
  const diff = referenceDate.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Rotate order based on day of year so each day has a fresh order / permutation
  const rotated = masterList.map((q, idx) => {
    const dailyId = ((idx + dayOfYear) % masterList.length);
    return masterList[dailyId] || q;
  });

  // Ensure exactly 10 unique questions
  const uniqueMap = new Map<number, QuizQuestion>();
  for (const q of rotated) {
    uniqueMap.set(q.id, q);
  }
  for (const q of masterList) {
    if (uniqueMap.size >= 10) break;
    uniqueMap.set(q.id, q);
  }

  return Array.from(uniqueMap.values()).slice(0, 10);
}
