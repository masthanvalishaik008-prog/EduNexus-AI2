"""
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
        {"id": "ENX-2024-102", "name": "Priya Sharma", "department": "CSE", "semester": 6, "gpa": 9.3, "attendance": 96, "lms_completion": 98, "coding_score": 92, "aptitude": 94, "domain": "Software Development", "backlogs": 0},
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
            st.success("Intervention recorded successfully in local SQLite database!")
