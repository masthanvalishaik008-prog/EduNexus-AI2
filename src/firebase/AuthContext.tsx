import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './config';
import { handleFirestoreError, OperationType } from './error';
import { UserRole, UserType } from '../types/student';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  userType: UserType;
  department: string;
  activeStudentId: string | null;
  staffId: string | null;
  authToken: string | null;
  setRole: (role: UserRole) => void;
  loading: boolean;
  isAuthenticated: boolean;
  isGuestSession: boolean;
  guestUserName: string;
  loginAsGuest: (name?: string, selectedRole?: UserRole, type?: UserType, studentId?: string, department?: string, staffId?: string, token?: string) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateLoginStreak: (studentId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'Faculty Advisor',
  userType: 'staff',
  department: 'Electronics & Comm (ECE)',
  activeStudentId: null,
  staffId: 'STF-ECE-01',
  authToken: null,
  setRole: () => {},
  loading: true,
  isAuthenticated: false,
  isGuestSession: false,
  guestUserName: 'Faculty Advisor',
  loginAsGuest: () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  updateLoginStreak: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthTokenState] = useState<string | null>(() => {
    return sessionStorage.getItem('edunexus_auth_token') || localStorage.getItem('edunexus_auth_token') || null;
  });
  const [role, setRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('edunexus_user_role') as UserRole) || 'Faculty Advisor';
  });
  const [department, setDepartmentState] = useState<string>(() => {
    return localStorage.getItem('edunexus_user_department') || 'ECE / Core Engineering';
  });
  const [userType, setUserTypeState] = useState<UserType>(() => {
    return (localStorage.getItem('edunexus_user_type') as UserType) || 'staff';
  });
  const [activeStudentId, setActiveStudentIdState] = useState<string | null>(() => {
    return localStorage.getItem('edunexus_active_student_id') || null;
  });
  const [staffId, setStaffIdState] = useState<string | null>(() => {
    return localStorage.getItem('edunexus_staff_id') || 'STF-ECE-01';
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isGuestSession, setIsGuestSession] = useState<boolean>(() => {
    return localStorage.getItem('edunexus_guest_session') === 'true';
  });
  const [guestUserName, setGuestUserName] = useState<string>(() => {
    return localStorage.getItem('edunexus_guest_username') || 'Dr. Ramesh Sundaram';
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsGuestSession(false);
        localStorage.removeItem('edunexus_guest_session');
        const userDocRef = doc(db, 'users', currentUser.uid);
        try {
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data?.role) {
              setRoleState(data.role as UserRole);
            }
          } else {
            // Initialize user doc
            await setDoc(userDocRef, {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Faculty User',
              photoURL: currentUser.photoURL || '',
              role: 'Faculty Advisor',
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.warn('Could not read/write user profile on auth change:', error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginAsGuest = (
    name: string = 'Dr. Ramesh Sundaram',
    selectedRole: UserRole = 'Faculty Advisor',
    type: UserType = 'staff',
    studentId?: string,
    dept?: string,
    sId?: string,
    token?: string
  ) => {
    // Requirement 4: Purge session residue completely before establishing new account session
    sessionStorage.clear();
    localStorage.removeItem('edunexus_active_student_id');
    localStorage.removeItem('edunexus_staff_id');
    localStorage.removeItem('edunexus_guest_username');
    localStorage.removeItem('edunexus_auth_token');

    setIsGuestSession(true);
    setGuestUserName(name);
    setRoleState(selectedRole);
    setUserTypeState(type);

    if (token) {
      setAuthTokenState(token);
      sessionStorage.setItem('edunexus_auth_token', token);
      localStorage.setItem('edunexus_auth_token', token);
    }

    const assignedDept = dept || (type === 'student' ? 'Computer Science (CSE)' : 'Electronics & Comm (ECE)');
    setDepartmentState(assignedDept);
    localStorage.setItem('edunexus_user_department', assignedDept);
    localStorage.setItem('edunexus_user_role', selectedRole);

    if (type === 'student') {
      // Strictly isolate student: clear any staff identifiers in state and storage
      setStaffIdState(null);
      localStorage.removeItem('edunexus_staff_id');
      const sid = studentId || 'ENX-2024-0003';
      setActiveStudentIdState(sid);
      localStorage.setItem('edunexus_active_student_id', sid);
    } else {
      // Strictly isolate staff: clear any student identifiers in state and storage
      setActiveStudentIdState(null);
      localStorage.removeItem('edunexus_active_student_id');
      const sid = sId || (type === 'staff' ? (localStorage.getItem('edunexus_staff_id') || 'STF-ECE-01') : 'STF-ECE-01');
      setStaffIdState(sid);
      localStorage.setItem('edunexus_staff_id', sid);
    }

    localStorage.setItem('edunexus_guest_session', 'true');
    localStorage.setItem('edunexus_guest_username', name);
    localStorage.setItem('edunexus_user_type', type);
    // After logon, set default white/light theme
    localStorage.setItem('edunexus_theme', 'light');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  };

  const setRole = async (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('edunexus_user_role', newRole);
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      try {
        await setDoc(userDocRef, { role: newRole, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsGuestSession(false);
      setUserTypeState('staff');
      setActiveStudentIdState(null);
      sessionStorage.clear();
      localStorage.removeItem('edunexus_auth_token');
      localStorage.removeItem('edunexus_guest_session');
      localStorage.setItem('edunexus_user_type', 'staff');
      localStorage.removeItem('edunexus_active_student_id');
      // After logon, set default white/light theme
      localStorage.setItem('edunexus_theme', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } catch (error) {
      console.error('Google Sign In failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Requirement 4: Frontend code completely clears local storage, session storage, and state stores
      sessionStorage.clear();
      localStorage.removeItem('edunexus_auth_token');
      localStorage.removeItem('edunexus_guest_session');
      localStorage.removeItem('edunexus_guest_username');
      localStorage.removeItem('edunexus_user_type');
      localStorage.removeItem('edunexus_user_role');
      localStorage.removeItem('edunexus_user_department');
      localStorage.removeItem('edunexus_active_student_id');
      localStorage.removeItem('edunexus_staff_id');

      // Reset all React state stores
      setIsGuestSession(false);
      setAuthTokenState(null);
      setGuestUserName('');
      setUserTypeState('staff');
      setActiveStudentIdState(null);
      setStaffIdState(null);

      // On logout, set default dark theme for login page
      localStorage.setItem('edunexus_theme', 'dark');
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      if (user) {
        await fbSignOut(auth);
      }
    } catch (error) {
      console.error('Sign Out failed:', error);
      throw error;
    }
  };

  const updateLoginStreak = async (studentId: string) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let lastLoginDate: string | undefined = undefined;
      let prevStreak = 0;

      // 1. Primary fast-path: Check local cache first for instant UI response
      try {
        const saved = localStorage.getItem('edunexus_students');
        if (saved) {
          const list = JSON.parse(saved);
          const found = list.find((s: any) => s.id === studentId);
          if (found) {
            lastLoginDate = found.lastLoginDate;
            prevStreak = Number(found.loginStreak) || 0;
          }
        }
      } catch {
        // ignore
      }

      // 2. If authenticated with Firebase and online, try syncing from Firestore
      const studentDocRef = doc(db, 'students', studentId);
      if (auth.currentUser) {
        try {
          const studentSnap = await getDoc(studentDocRef);
          if (studentSnap.exists()) {
            const d = studentSnap.data();
            if (d.lastLoginDate) {
              lastLoginDate = d.lastLoginDate;
              prevStreak = Number(d.loginStreak) || prevStreak;
            }
          }
        } catch {
          // Gracefully continue using local cache if Firestore is restricted
        }
      }

      // If already logged in today within 24 hours, preserve streak
      if (lastLoginDate === todayStr) {
        return;
      }

      let newStreak = 1;
      if (lastLoginDate === yesterdayStr) {
        // Consecutive day: advances to next day!
        newStreak = prevStreak + 1;
      } else {
        // First login or missed a day: begins at 1
        newStreak = 1;
      }

      // 3. Immediately persist updated streak to localStorage
      try {
        const saved = localStorage.getItem('edunexus_students');
        if (saved) {
          const list = JSON.parse(saved);
          const idx = list.findIndex((s: any) => s.id === studentId);
          if (idx !== -1) {
            list[idx].loginStreak = newStreak;
            list[idx].lastLoginDate = todayStr;
            localStorage.setItem('edunexus_students', JSON.stringify(list));
            window.dispatchEvent(new Event('storage'));
          }
        }
      } catch {
        // ignore
      }

      // 4. Save to Firestore if authenticated or permitted
      if (auth.currentUser) {
        try {
          await setDoc(
            studentDocRef,
            {
              id: studentId,
              loginStreak: newStreak,
              lastLoginDate: todayStr,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch {
          // Graceful fallback without console error noise
        }
      }
    } catch {
      // Non-blocking fallback
    }
  };

  const isAuthenticated = !!user || isGuestSession;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        userType,
        department,
        activeStudentId,
        staffId,
        authToken,
        setRole,
        loading,
        isAuthenticated,
        isGuestSession,
        guestUserName,
        loginAsGuest,
        signInWithGoogle,
        signOut,
        updateLoginStreak,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// ... Add updateLoginStreak helper function somewhere suitable?
// Actually, I can just put it inside AuthProvider.

