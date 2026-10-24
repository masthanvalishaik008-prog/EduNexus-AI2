import React, { useState } from 'react';
import {
  X,
  Code2,
  Terminal,
  FileText,
  Download,
  Copy,
  Check,
  Layers,
  CheckCircle2,
  Laptop
} from 'lucide-react';

interface LocalDeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LocalDeploymentGuideModal({
  isOpen,
  onClose,
}: LocalDeploymentGuideModalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'setup' | 'code' | 'requirements' | 'architecture' | 'testing'>('setup');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const pythonStreamlitCode = `"""
EduNexus AI — Student Success Analytics & Placement Intelligence
Full standalone Streamlit backend & dashboard for Windows 11 / VS Code
No paid APIs required. Runs locally on Python 3.10+ with Pandas, Plotly & SQLite.
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import sqlite3
import os

# --- PAGE CONFIGURATION ---
st.set_page_config(
    page_title="EduNexus AI — Student Success & Placement",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- DATABASE SETUP (SQLite) ---
def init_db():
    conn = sqlite3.connect("edunexus.db")
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS interventions (
            id TEXT PRIMARY KEY,
            student_id TEXT,
            student_name TEXT,
            department TEXT,
            type TEXT,
            faculty_lead TEXT,
            date_logged TEXT,
            initial_score REAL,
            outcome_notes TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# --- LOAD SAMPLE DATASET ---
@st.cache_data
def load_student_data():
    data = [
        {"id": "ENX-2024-101", "name": "Aarav Patel", "department": "ECE", "semester": 6, "gpa": 8.4, "attendance": 91, "lms_completion": 88, "coding_score": 78, "aptitude": 82, "domain": "Embedded Systems & IoT", "backlogs": 0},
        {"id": "ENX-2024-102", "name": "Sneha Reddy", "department": "CSE", "semester": 6, "gpa": 9.3, "attendance": 96, "lms_completion": 98, "coding_score": 92, "aptitude": 94, "domain": "Software Development", "backlogs": 0},
        {"id": "ENX-2024-103", "name": "Karan Verma", "department": "ECE", "semester": 6, "gpa": 5.8, "attendance": 64, "lms_completion": 46, "coding_score": 42, "aptitude": 48, "domain": "Electronics Testing", "backlogs": 2},
        {"id": "ENX-2024-104", "name": "Sneha Kulkarni", "department": "IT", "semester": 6, "gpa": 8.1, "attendance": 88, "lms_completion": 82, "coding_score": 74, "aptitude": 78, "domain": "Data Analytics", "backlogs": 0},
        {"id": "ENX-2024-105", "name": "Devendra Rao", "department": "EEE", "semester": 6, "gpa": 6.9, "attendance": 74, "lms_completion": 64, "coding_score": 56, "aptitude": 62, "domain": "Embedded Systems & IoT", "backlogs": 1},
        {"id": "ENX-2024-106", "name": "Meera Nair", "department": "ECE", "semester": 6, "gpa": 8.7, "attendance": 93, "lms_completion": 90, "coding_score": 82, "aptitude": 86, "domain": "Electronics Testing", "backlogs": 0},
        {"id": "ENX-2024-107", "name": "Rohan Deshmukh", "department": "MECH", "semester": 6, "gpa": 6.2, "attendance": 71, "lms_completion": 54, "coding_score": 48, "aptitude": 55, "domain": "Embedded Systems & IoT", "backlogs": 1},
        {"id": "ENX-2024-108", "name": "Ritu Sen", "department": "CSE", "semester": 6, "gpa": 7.9, "attendance": 86, "lms_completion": 79, "coding_score": 70, "aptitude": 72, "domain": "Software Development", "backlogs": 0},
    ]
    df = pd.DataFrame(data)
    # Calculate Explainable Composite Success Score
    df['academic_score'] = (df['gpa'] / 10) * 60 + 30 - (df['backlogs'] * 5)
    df['composite_score'] = (
        (df['academic_score'] * 0.25) +
        (df['attendance'] * 0.20) +
        (df['lms_completion'] * 0.15) +
        (df['coding_score'] * 0.20) +
        (df['aptitude'] * 0.20)
    ).round().astype(int)
    return df

df = load_student_data()

# --- SIDEBAR NAVIGATION ---
st.sidebar.title("EduNexus AI")
st.sidebar.markdown("**Student Success & Placement Platform**")
menu = st.sidebar.radio(
    "Navigation",
    ["1. Executive Dashboard", "2. Student 360° Profile", "3. Early Support Radar", "4. What-If Simulator", "5. Log Intervention"]
)

# --- 1. EXECUTIVE DASHBOARD ---
if menu == "1. Executive Dashboard":
    st.header("Executive Dashboard")
    st.markdown("Holistic cohort health across 7 campus data pillars.")
    
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total Students Monitored", len(df))
    col2.metric("Average Success Score", f"{df['composite_score'].mean():.1f} / 100")
    col3.metric("Cohort Attendance", f"{df['attendance'].mean():.1f}%")
    col4.metric("At-Risk Students (<75% Att)", len(df[df['attendance'] < 75]))
    
    col_chart1, col_chart2 = st.columns(2)
    with col_chart1:
        fig_dept = px.bar(
            df.groupby('department')['composite_score'].mean().reset_index(),
            x='department', y='composite_score',
            title='Department Average Success Score',
            color='composite_score',
            color_continuous_scale='Blues'
        )
        st.plotly_chart(fig_dept, use_container_width=True)
        
    with col_chart2:
        fig_scatter = px.scatter(
            df, x='attendance', y='composite_score',
            color='department', size='gpa', hover_name='name',
            title='Attendance vs. Success Score Correlation'
        )
        fig_scatter.add_vline(x=75, line_dash="dash", line_color="red", annotation_text="75% Cutoff")
        st.plotly_chart(fig_scatter, use_container_width=True)

# --- 2. STUDENT 360° PROFILE ---
elif menu == "2. Student 360° Profile":
    st.header("Student 360° Profile")
    student_name = st.selectbox("Select Student:", df['name'].tolist())
    st_row = df[df['name'] == student_name].iloc[0]
    
    colA, colB = st.columns([1, 2])
    with colA:
        st.subheader(f"{st_row['name']} ({st_row['id']})")
        st.write(f"**Department:** {st_row['department']} · **Semester:** {st_row['semester']}")
        st.write(f"**GPA:** {st_row['gpa']} / 10.0 · **Backlogs:** {st_row['backlogs']}")
        st.write(f"**Attendance:** {st_row['attendance']}%")
        st.write(f"**Target Pathway:** {st_row['domain']}")
        st.metric("Composite Success Score", f"{st_row['composite_score']} / 100")
        
    with colB:
        categories = ['Academic', 'Attendance', 'LMS Modules', 'Coding', 'Aptitude']
        scores = [
            st_row['academic_score'],
            st_row['attendance'],
            st_row['lms_completion'],
            st_row['coding_score'],
            st_row['aptitude']
        ]
        fig_radar = go.Figure()
        fig_radar.add_trace(go.Scatterpolar(r=scores, theta=categories, fill='toself', name='Student Score'))
        fig_radar.add_trace(go.Scatterpolar(r=[75]*5, theta=categories, line_dash='dash', name='75% Benchmark'))
        fig_radar.update_layout(polar=dict(radialaxis=dict(visible=True, range=[0, 100])), showlegend=True)
        st.plotly_chart(fig_radar, use_container_width=True)

# --- 3. EARLY SUPPORT RADAR ---
elif menu == "3. Early Support Radar":
    st.header("Early Support Radar")
    st.info("Ethical AI Safeguard: Flags initiate faculty mentorship; zero automated punitive measures.")
    
    flagged = df[(df['attendance'] < 75) | (df['backlogs'] > 0) | (df['coding_score'] < 60)]
    st.dataframe(flagged[['id', 'name', 'department', 'attendance', 'backlogs', 'coding_score', 'composite_score']])

# --- 4. WHAT-IF SIMULATOR ---
elif menu == "4. What-If Simulator":
    st.header("What-If Intervention Simulator")
    student_name = st.selectbox("Choose student for simulation:", df['name'].tolist())
    st_row = df[df['name'] == student_name].iloc[0]
    
    st.write(f"Current Baseline Score: **{st_row['composite_score']}/100**")
    att_boost = st.slider("Attendance Increase (%)", 0, 25, 10)
    coding_boost = st.slider("Coding Practice Gain (pts)", 0, 40, 20)
    
    projected = round(st_row['composite_score'] + (att_boost * 0.20) + (coding_boost * 0.20))
    st.success(f"Projected Score: **{projected}/100** (Net Gain: +{projected - st_row['composite_score']} pts)")
    st.caption("Simulation scenario based on demonstration model weights.")

# --- 5. LOG INTERVENTION ---
elif menu == "5. Log Intervention":
    st.header("Intervention Tracker (SQLite Persistence)")
    with st.form("intervention_form"):
        s_id = st.selectbox("Student:", df['id'].tolist())
        faculty = st.text_input("Faculty Lead:", "Dr. Ramesh Sundaram")
        itype = st.selectbox("Type:", ["1-on-1 Mentoring", "Remedial Class", "Mock Interview Lab"])
        notes = st.text_area("Remedial Plan Notes:")
        submitted = st.form_submit_button("Save to Database")
        if submitted:
            conn = sqlite3.connect("edunexus.db")
            c = conn.cursor()
            c.execute(
                "INSERT INTO interventions VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?, ?)",
                (f"INT-{os.urandom(2).hex()}", s_id, "Selected", "Eng", itype, faculty, 65.0, notes)
            )
            conn.commit()
            conn.close()
            st.success("Intervention recorded successfully in local SQLite!")
`;

  const requirementsTxt = `# EduNexus AI — Requirements for Python / Streamlit (Windows 11)
streamlit>=1.32.0
pandas>=2.2.0
plotly>=5.20.0
numpy>=1.26.0
`;

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type: `${type};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                Local Deployment & Beginner Setup Guide (Windows 11 & VS Code)
              </h2>
              <p className="text-xs text-slate-500">
                Complete runnable Python + Streamlit + SQLite project bundle with zero paid APIs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
              activeTab === 'setup' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            1. Step-by-Step Setup
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
              activeTab === 'code' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            2. Python app.py
          </button>

          <button
            onClick={() => setActiveTab('requirements')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
              activeTab === 'requirements' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            3. requirements.txt
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
              activeTab === 'architecture' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            4. Architecture Diagram
          </button>

          <button
            onClick={() => setActiveTab('testing')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
              activeTab === 'testing' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            5. Verification & Testing
          </button>
        </div>

        {/* Tab 1: Step-by-Step Setup Guide */}
        {activeTab === 'setup' && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">System Requirements for Local Windows 11 PC</h3>
              <p className="text-slate-600">
                Tested and optimized for: Intel Core i5 (8th gen or newer), 8 GB RAM, Windows 11, VS Code. Requires Python 3.10, 3.11, or 3.12 (standard free install from python.org). Zero external paid APIs required.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="font-bold text-slate-900 mb-1">Step 1: Open VS Code & Create Project Folder</div>
                <p className="text-slate-600">Open VS Code, press <kbd className="bg-slate-100 px-1 py-0.5 rounded border">Ctrl + `</kbd> to launch the integrated terminal, and run:</p>
                <pre className="mt-1.5 p-2.5 bg-slate-900 text-cyan-300 font-mono rounded text-[11px] overflow-x-auto">
mkdir edunexus-local
cd edunexus-local
                </pre>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="font-bold text-slate-900 mb-1">Step 2: Create a Clean Python Virtual Environment</div>
                <p className="text-slate-600">In the VS Code terminal (PowerShell or Bash), create and activate your environment:</p>
                <pre className="mt-1.5 p-2.5 bg-slate-900 text-cyan-300 font-mono rounded text-[11px] overflow-x-auto">
python -m venv venv
.\venv\Scripts\Activate.ps1
                </pre>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="font-bold text-slate-900 mb-1">Step 3: Install Required Open-Source Packages</div>
                <p className="text-slate-600">Create a <code>requirements.txt</code> file (or download from Tab 3) and install:</p>
                <pre className="mt-1.5 p-2.5 bg-slate-900 text-cyan-300 font-mono rounded text-[11px] overflow-x-auto">
pip install -r requirements.txt
                </pre>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="font-bold text-slate-900 mb-1">Step 4: Launch the EduNexus Streamlit Application</div>
                <p className="text-slate-600">Run the application locally on your PC:</p>
                <pre className="mt-1.5 p-2.5 bg-slate-900 text-cyan-300 font-mono rounded text-[11px] overflow-x-auto">
streamlit run app.py
                </pre>
                <p className="mt-1 text-[11px] text-emerald-700">Your browser will automatically open to <code>http://localhost:8501</code> with the interactive dashboard!</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Python Code */}
        {activeTab === 'code' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500">app.py · Standalone Python & Streamlit Engine</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(pythonStreamlitCode, 'code')}
                  className="flex items-center gap-1 px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                >
                  {copiedSection === 'code' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'code' ? 'Copied!' : 'Copy Code'}</span>
                </button>
                <button
                  onClick={() => downloadFile(pythonStreamlitCode, 'app.py', 'text/x-python')}
                  className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download app.py</span>
                </button>
              </div>
            </div>
            <pre className="p-3.5 bg-slate-900 text-slate-100 font-mono text-[11px] rounded-xl overflow-x-auto max-h-[420px] leading-relaxed">
              {pythonStreamlitCode}
            </pre>
          </div>
        )}

        {/* Tab 3: Requirements.txt */}
        {activeTab === 'requirements' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500">requirements.txt</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(requirementsTxt, 'reqs')}
                  className="flex items-center gap-1 px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                >
                  {copiedSection === 'reqs' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'reqs' ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => downloadFile(requirementsTxt, 'requirements.txt', 'text/plain')}
                  className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download requirements.txt</span>
                </button>
              </div>
            </div>
            <pre className="p-3.5 bg-slate-900 text-slate-100 font-mono text-[11px] rounded-xl overflow-x-auto leading-relaxed">
              {requirementsTxt}
            </pre>
          </div>
        )}

        {/* Tab 4: Architecture Diagram */}
        {activeTab === 'architecture' && (
          <div className="space-y-4 text-xs text-slate-700">
            <h3 className="font-bold text-slate-900 text-sm">System Architecture & The Student Success Action Loop</h3>
            <pre className="p-4 bg-slate-950 text-cyan-300 font-mono text-[11px] rounded-xl overflow-x-auto leading-relaxed">
{`+-----------------------------------------------------------------------------------------+
|                                7-PILLAR CAMPUS DATA STREAMS                              |
|  [Academic GPA]  [Attendance]  [LMS Activity]  [Engagement]  [Placement]  [Skills] [Pulse] |
+-----------------------------------------------------------------------------------------+
                                             |
                                    (CSV Ingestion Engine)
                                    [Data Quality & Validation]
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                           EDUNEXUS EXPLAINABLE ANALYTICS CORE                           |
|  * Formula Engine: Academic 25%, Att 20%, LMS 15%, Placement 15%, Skills 10%, Feedback 5%|
|  * Early Support Radar: Threshold Pattern Detection (Attendance < 75%, Backlogs > 0)     |
|  * What-If Simulator: Real-Time Hypothetical Interventions                              |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                          STUDENT SUCCESS ACTION LOOP (INTERACTION)                      |
|                                                                                         |
|   [Integrate Data]  --->  [Analyze Patterns]  --->  [Explain Findings]                  |
|          ^                                                   |                          |
|          |                                                   v                          |
|   [Measure Progress] <--- [Track Intervention] <--- [Recommend Support]                 |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                                   DELIVERY INTERFACES                                   |
|  * React + TypeScript + Tailwind (Interactive AI Studio Cloud Web App)                  |
|  * Python + Streamlit + Plotly + SQLite (Local Windows 11 PC Desktop Execution)         |
+-----------------------------------------------------------------------------------------+`}
            </pre>
          </div>
        )}

        {/* Tab 5: Verification & Testing */}
        {activeTab === 'testing' && (
          <div className="space-y-3 text-xs text-slate-700">
            <h3 className="font-bold text-slate-900 text-sm">Testing Instructions & Verification Checklist</h3>
            <div className="space-y-2">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Test 1: Explainable Success Score Attribution</strong>
                  <p className="text-slate-600 mt-0.5">Open Student 360° Profile. Verify each category contributes its exact deterministic percentage to the composite total.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Test 2: Early Support Radar Review Workflow</strong>
                  <p className="text-slate-600 mt-0.5">Filter by Urgent priority. Click &ldquo;Review Alert&rdquo;, add faculty notes, and transition status to &ldquo;Session Scheduled&rdquo;.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Test 3: What-If Simulation Responsiveness</strong>
                  <p className="text-slate-600 mt-0.5">Move the Attendance and Coding Practice sliders. Ensure the gauge recalculates in real-time and updates projected tier.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Test 4: Intervention Logging & Outcome Tracking</strong>
                  <p className="text-slate-600 mt-0.5">Log a new mentoring session. Verify it appears immediately in the operational list with baseline metrics.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Test 5: CSV Schema Validation & Export</strong>
                  <p className="text-slate-600 mt-0.5">Download the CSV template or sample dataset. Verify header format and range boundaries.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-lg shadow-xs"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
