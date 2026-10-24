import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Newspaper, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../firebase/AuthContext';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  department: string;
  timestamp: string;
}

export function NewsSection() {
  const { department } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    if (!department) return;

    const q = query(collection(db, 'news'), where('department', '==', department));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: NewsItem[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as NewsItem);
        });
        setNews(items);
      },
      (error) => {
        console.warn('NewsSection onSnapshot error:', error);
      }
    );

    return () => unsubscribe();
  }, [department]);

  useEffect(() => {
    if (news.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [news]);

  if (news.length === 0) return null;

  return (
    <>
      <div className="bg-white border border-blue-200 rounded-2xl p-4 shadow-sm mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <Newspaper className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <AnimatePresence mode="wait">
            <motion.div
              key={news[currentIndex].id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="font-semibold text-slate-800 text-sm truncate cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => setSelectedNews(news[currentIndex])}
            >
              {news[currentIndex].title}
            </motion.div>
          </AnimatePresence>
        </div>
        <button
          onClick={() => setSelectedNews(news[currentIndex])}
          className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:gap-1.5 transition-all"
        >
          Read More <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <AnimatePresence>
        {selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedNews(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-900">{selectedNews.title}</h3>
                <button onClick={() => setSelectedNews(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-slate-600 leading-relaxed">{selectedNews.content}</p>
              <div className="mt-6 text-xs text-slate-400 font-mono">
                {new Date(selectedNews.timestamp).toLocaleDateString()} · {selectedNews.department}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
