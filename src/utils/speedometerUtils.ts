/**
 * Speedometer Daily Login Streak Utilities
 * 
 * Rules:
 * - If student logs in today: streak begins at 1 (or increments if logged in yesterday).
 * - If student logged in yesterday and logs in today: streak increments by +1 (e.g., day 1 -> day 2).
 * - If 24h+ passes without a login (missed a day): speedometer resets to 0.
 * - No manual buttons that can be misused.
 */

export interface StreakEvaluation {
  effectiveStreak: number;
  statusText: string;
  isStreakActiveToday: boolean;
  consecutiveDays: number;
  lastLoginFormatted: string;
}

export function evaluateStudentStreak(
  lastLoginDate?: string,
  rawStreak: number = 0,
  referenceDate: Date = new Date()
): StreakEvaluation {
  const todayStr = referenceDate.toISOString().split('T')[0];

  const yesterday = new Date(referenceDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (!lastLoginDate) {
    return {
      effectiveStreak: 0,
      statusText: 'No previous login recorded. Login today to begin Day 1 on speedometer!',
      isStreakActiveToday: false,
      consecutiveDays: 0,
      lastLoginFormatted: 'Never',
    };
  }

  // Did the student log in today?
  if (lastLoginDate === todayStr) {
    const streak = Math.max(1, rawStreak);
    return {
      effectiveStreak: streak,
      statusText: `Active today! Speedometer reading: Day ${streak} streak recorded.`,
      isStreakActiveToday: true,
      consecutiveDays: streak,
      lastLoginFormatted: 'Today',
    };
  }

  // Did the student log in yesterday?
  if (lastLoginDate === yesterdayStr) {
    // Yesterday was logged in. If they haven't logged in yet today, the maintained streak is pending today's session
    const streak = Math.max(1, rawStreak);
    return {
      effectiveStreak: streak,
      statusText: `Yesterday was Day ${streak}. Login today to increase to Day ${streak + 1}!`,
      isStreakActiveToday: false,
      consecutiveDays: streak,
      lastLoginFormatted: 'Yesterday',
    };
  }

  // Missed yesterday or more (more than 24 hours gap): streak resets to 0!
  return {
    effectiveStreak: 0,
    statusText: `Missed consecutive login (last active: ${lastLoginDate}). Speedometer reset to 0. Log in to start fresh at Day 1!`,
    isStreakActiveToday: false,
    consecutiveDays: 0,
    lastLoginFormatted: lastLoginDate,
  };
}

/**
 * Calculates updated streak when a student logs into their session
 */
export function calculateLoginAction(
  lastLoginDate?: string,
  currentStreak: number = 0,
  referenceDate: Date = new Date()
): { newStreak: number; newDate: string; changed: boolean } {
  const todayStr = referenceDate.toISOString().split('T')[0];

  const yesterday = new Date(referenceDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastLoginDate === todayStr) {
    // Already logged in today within 24h
    return {
      newStreak: Math.max(1, currentStreak),
      newDate: todayStr,
      changed: false,
    };
  }

  if (lastLoginDate === yesterdayStr) {
    // Logged in yesterday! Advances streak by +1
    return {
      newStreak: (currentStreak || 0) + 1,
      newDate: todayStr,
      changed: true,
    };
  }

  // Missed a day or first time: starts at 1
  return {
    newStreak: 1,
    newDate: todayStr,
    changed: true,
  };
}
