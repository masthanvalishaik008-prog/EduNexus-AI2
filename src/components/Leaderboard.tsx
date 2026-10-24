import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Trophy, Award } from 'lucide-react';
import { Student } from '../types/student';

interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  department?: string;
}

interface LeaderboardProps {
  students?: Student[];
}

export function Leaderboard({ students }: LeaderboardProps) {
  const [topStudents, setTopStudents] = useState<LeaderboardEntry[]>(() => {
    if (students && students.length > 0) {
      return [...students]
        .map((s) => ({
          id: s.id,
          name: s.name,
          points: (s as any).points ?? Math.round(s.compositeScore * 10),
          department: s.department,
        }))
        .sort((a, b) => b.points - a.points)
        .slice(0, 5);
    }
    return [
      { id: 'ENX-2024-105', name: 'Ishaan Verma', points: 950, department: 'Civil Eng' },
      { id: 'ENX-2024-106', name: 'Ananya Sharma', points: 910, department: 'Comp Science' },
      { id: 'ENX-2024-101', name: 'Aarav Patel', points: 840, department: 'Electronics' },
      { id: 'ENX-2024-104', name: 'Sneha Reddy', points: 820, department: 'Information Tech' },
      { id: 'ENX-2024-102', name: 'Diya Nair', points: 760, department: 'Mechanical' },
    ];
  });

  useEffect(() => {
    try {
      const q = query(collection(db, 'students'), orderBy('points', 'desc'), limit(5));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const data: LeaderboardEntry[] = [];
            snapshot.forEach((doc) => {
              const d = doc.data();
              data.push({
                id: doc.id,
                name: d.name || 'Student',
                points: Number(d.points) || 0,
                department: d.department,
              });
            });
            if (data.length > 0) {
              setTopStudents(data);
            }
          }
        },
        (error) => {
          console.warn('Leaderboard onSnapshot notice:', error?.message || error);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('Leaderboard subscription error:', err);
    }
  }, []);

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 border border-amber-400/30 rounded-xl">
            <Trophy className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Engagement Leaderboard</h3>
            <p className="text-xs text-slate-400">Top STEM Quiz & Activity Achievers</p>
          </div>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Live XP
        </span>
      </div>

      <div className="space-y-2.5">
        {topStudents.map((student, index) => {
          const rankColors = [
            'text-amber-400 bg-amber-500/10 border-amber-500/30',
            'text-slate-300 bg-slate-400/10 border-slate-400/30',
            'text-amber-600 bg-amber-700/10 border-amber-700/30',
          ];
          const badgeClass = rankColors[index] || 'text-slate-500 bg-white/5 border-white/5';

          return (
            <div
              key={student.id}
              className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-2xl border border-white/5 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs border ${badgeClass} shrink-0`}
                >
                  #{index + 1}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate group-hover:text-amber-300 transition-colors">
                    {student.name}
                  </div>
                  {student.department && (
                    <div className="text-[11px] text-slate-400 truncate">{student.department}</div>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0 pl-2">
                <div className="text-sm font-bold text-emerald-400 flex items-center gap-1 justify-end">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  {student.points} XP
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
