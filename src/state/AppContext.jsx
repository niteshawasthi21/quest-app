import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import questionsData from '../data/questions.json';

const AppContext = createContext(null);
const USERS_KEY = 'quest_app_users_v1';
const SESSION_KEY = 'quest_app_session_v1';
const EXAM_MINUTES = 60;
const MAX_ATTEMPTS = 3;
const PASS_PERCENTAGE = 80;

const questions = questionsData.slice(0, 150).map((item, index) => ({
  ...item,
  uid: item.id ?? index + 1,
  options: (item.options || []).map((opt, optionIndex) => ({
    id: opt.id ?? String.fromCharCode(65 + optionIndex),
    text: opt.text,
  })),
}));

const readStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export function AppProvider({ children }) {
  const [users, setUsers] = useState(() => readStorage(USERS_KEY, []));
  const [sessionUserId, setSessionUserId] = useState(() => readStorage(SESSION_KEY, null));
  const [examState, setExamState] = useState(null);
  const [latestReport, setLatestReport] = useState(null);

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUserId));
  }, [sessionUserId]);

  const currentUser = useMemo(
    () => users.find((user) => user.id === sessionUserId) || null,
    [users, sessionUserId]
  );

  const remainingAttempts = currentUser ? Math.max(0, MAX_ATTEMPTS - currentUser.attempts.length) : MAX_ATTEMPTS;
  const passedAttempt = currentUser?.attempts?.find((attempt) => attempt.passed) || null;

  const register = ({ name, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (users.some((user) => user.email === normalizedEmail)) {
      return { ok: false, message: 'Email already registered.' };
    }

    const user = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      password,
      createdAt: new Date().toISOString(),
      attempts: [],
    };

    setUsers((prev) => [...prev, user]);
    setSessionUserId(user.id);
    return { ok: true };
  };

  const login = ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find((item) => item.email === normalizedEmail && item.password === password);
    if (!user) {
      return { ok: false, message: 'Invalid email or password.' };
    }
    setSessionUserId(user.id);
    return { ok: true };
  };

  const logout = () => {
    setSessionUserId(null);
    setExamState(null);
  };

  const startExam = () => {
    if (!currentUser || remainingAttempts <= 0) {
      return { ok: false, message: 'No attempts left.' };
    }
    const startedAt = Date.now();
    setExamState({
      startedAt,
      endsAt: startedAt + EXAM_MINUTES * 60 * 1000,
      currentIndex: 0,
      attemptNumber: currentUser.attempts.length + 1,
      answers: {},
      flagged: {},
    });
    setLatestReport(null);
    return { ok: true };
  };

  const updateAnswer = (questionId, answer) => {
    setExamState((prev) => ({ ...prev, answers: { ...prev.answers, [questionId]: answer } }));
  };

  const toggleFlag = (questionId) => {
    setExamState((prev) => ({ ...prev, flagged: { ...prev.flagged, [questionId]: !prev.flagged[questionId] } }));
  };

  const jumpToQuestion = (index) => {
    setExamState((prev) => ({ ...prev, currentIndex: index }));
  };

  const nextQuestion = () => {
    setExamState((prev) => ({ ...prev, currentIndex: Math.min(prev.currentIndex + 1, questions.length - 1) }));
  };

  const prevQuestion = () => {
    setExamState((prev) => ({ ...prev, currentIndex: Math.max(prev.currentIndex - 1, 0) }));
  };

  const submitExam = (mode = 'manual') => {
    if (!currentUser || !examState) return null;

    const answeredCount = Object.keys(examState.answers).length;
    const score = questions.reduce((total, question) => {
      return total + (examState.answers[question.uid] === question.correctAnswer ? 1 : 0);
    }, 0);
    const percentage = Number(((score / questions.length) * 100).toFixed(2));
    const passed = percentage >= PASS_PERCENTAGE;

    const report = {
      id: crypto.randomUUID(),
      attemptNumber: examState.attemptNumber,
      attemptedOn: new Date().toISOString(),
      submitMode: mode,
      totalQuestions: questions.length,
      answeredCount,
      unansweredCount: questions.length - answeredCount,
      score,
      percentage,
      passed,
      passPercentage: PASS_PERCENTAGE,
      clearedOnAttempt: passed ? examState.attemptNumber : null,
      answers: examState.answers,
      flagged: examState.flagged,
      review: questions.map((question) => ({
        id: question.uid,
        question: question.question,
        category: question.category,
        difficulty: question.difficulty,
        options: question.options,
        selectedAnswer: examState.answers[question.uid] ?? null,
        correctAnswer: question.correctAnswer,
        isCorrect: examState.answers[question.uid] === question.correctAnswer,
      })),
    };

    setUsers((prev) => prev.map((user) => user.id === currentUser.id ? { ...user, attempts: [...user.attempts, report] } : user));
    setExamState(null);
    setLatestReport(report);
    return report;
  };

  return (
    <AppContext.Provider value={{
      questions,
      currentUser,
      examState,
      latestReport,
      examMinutes: EXAM_MINUTES,
      maxAttempts: MAX_ATTEMPTS,
      passPercentage: PASS_PERCENTAGE,
      remainingAttempts,
      passedAttempt,
      register,
      login,
      logout,
      startExam,
      updateAnswer,
      toggleFlag,
      jumpToQuestion,
      nextQuestion,
      prevQuestion,
      submitExam,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
