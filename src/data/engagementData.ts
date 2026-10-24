export const QUIZ_BANK = {
  'Electronics & Comm (ECE)': [
    { question: 'What is the Nyquist rate for a signal sampled at 10kHz?', options: ['5kHz', '10kHz', '20kHz', '25kHz'], correct: 2, explanation: 'Nyquist rate is 2 * bandwidth/frequency.' },
    { question: 'Which component is used for voltage stabilization?', options: ['Resistor', 'Zener Diode', 'Capacitor', 'Inductor'], correct: 1, explanation: 'Zener diode maintains constant voltage.' },
    { question: 'What does CMOS stand for?', options: ['Complementary Metal Oxide Semiconductor', 'Common Metal Oxide Semiconductor', 'Center Metal Oxide Semiconductor', 'Computer Metal Oxide Semiconductor'], correct: 0, explanation: 'Complementary Metal Oxide Semiconductor.' },
  ],
  'Computer Science (CSE)': [
    { question: 'What is the Big O complexity of binary search?', options: ['O(N)', 'O(N log N)', 'O(log N)', 'O(1)'], correct: 2, explanation: 'Binary search splits space in half each step.' },
    { question: 'Which data structure follows LIFO?', options: ['Queue', 'Stack', 'Linked List', 'Array'], correct: 1, explanation: 'Stack is Last-In-First-Out.' },
    { question: 'What is the purpose of the "static" keyword in Java?', options: ['Variable belongs to class', 'Variable belongs to instance', 'Variable is final', 'Method is abstract'], correct: 0, explanation: 'Static members belong to the class.' },
  ],
  'Information Tech (IT)': [
    { question: 'Which protocol is used for secure web browsing?', options: ['HTTP', 'FTP', 'HTTPS', 'SMTP'], correct: 2, explanation: 'HTTPS uses SSL/TLS encryption.' },
    { question: 'What is a primary key?', options: ['Foreign reference', 'Unique identifier', 'Non-indexed field', 'Table name'], correct: 1, explanation: 'Primary key uniquely identifies rows.' },
  ],
  'Electrical & Electronics (EEE)': [
    { question: 'Which law relates voltage, current, and resistance?', options: ['Kirchhoff', 'Ohm', 'Faraday', 'Lenz'], correct: 1, explanation: 'Ohm’s law states V=IR.' },
  ],
  'Mechanical Eng (MECH)': [
    { question: 'What is Young\'s Modulus?', options: ['Stress/Strain', 'Force*Area', 'Mass/Volume', 'Density*Gravity'], correct: 0, explanation: 'Young\'s Modulus measures material stiffness.' },
  ],
};

export const CHALLENGE_BANK = [
  { id: 'CH-1', title: 'Debugging Pro', desc: 'Identify the logic error in a provided code snippet.', type: 'Coding' },
  { id: 'CH-2', title: 'Circuit Solver', desc: 'Calculate current in a complex resistor network.', type: 'Engineering' },
  { id: 'CH-3', title: 'Database Architect', desc: 'Optimize a slow SQL query.', type: 'Tech' },
];
