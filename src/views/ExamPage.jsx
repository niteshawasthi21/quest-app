import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/Layout';
import { useApp } from '../state/AppContext';

export function ExamPage() {
  const navigate = useNavigate();
  const { questions, examState, updateAnswer, toggleFlag, jumpToQuestion, nextQuestion, prevQuestion, submitExam } = useApp();
  const [remainingMs, setRemainingMs] = useState(examState ? examState.endsAt - Date.now() : 0);

  useEffect(() => {
    if (!examState) {
      navigate('/dashboard');
      return;
    }

    const timer = setInterval(() => {
      const timeLeft = examState.endsAt - Date.now();
      setRemainingMs(Math.max(0, timeLeft));
      if (timeLeft <= 0) {
        clearInterval(timer);
        submitExam('auto');
        navigate('/report');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [examState, navigate, submitExam]);

  const answeredCount = useMemo(() => examState ? Object.keys(examState.answers).length : 0, [examState]);
  if (!examState) return null;

  const currentQuestion = questions[examState.currentIndex];
  const mins = String(Math.floor(remainingMs / 60000)).padStart(2, '0');
  const secs = String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, '0');

  const handleSubmit = () => {
    submitExam('manual');
    navigate('/report');
  };

  return (
    <AppShell header={<div className="exam-header"><div><p className="eyebrow">Attempt {examState.attemptNumber}</p><h2>Exam in progress</h2></div><div className="header-actions"><div className="timer-badge">{mins}:{secs}</div><button className="primary-btn" onClick={handleSubmit}>Submit exam</button></div></div>}>
      <section className="exam-layout">
        <article className="card question-card">
          <div className="question-meta">
            <span className="pill">Question {examState.currentIndex + 1} / {questions.length}</span>
            <span className="pill">{currentQuestion.category}</span>
            <span className="pill">{currentQuestion.difficulty}</span>
          </div>
          <h3>{currentQuestion.question}</h3>
          <div className="options-list">
            {currentQuestion.options.map((option) => {
              const checked = examState.answers[currentQuestion.uid] === option.text;
              return (
                <label key={option.id} className={`option-card ${checked ? 'selected' : ''}`}>
                  <input type="radio" name={`question-${currentQuestion.uid}`} checked={checked} onChange={() => updateAnswer(currentQuestion.uid, option.text)} />
                  <span className="option-key">{option.id}</span>
                  <span>{option.text}</span>
                </label>
              );
            })}
          </div>
          <div className="question-actions">
            <button className="ghost-btn" onClick={() => toggleFlag(currentQuestion.uid)}>{examState.flagged[currentQuestion.uid] ? 'Unflag' : 'Flag for review'}</button>
            <div className="nav-actions">
              <button className="secondary-btn" onClick={prevQuestion} disabled={examState.currentIndex === 0}>Previous</button>
              <button className="primary-btn" onClick={nextQuestion} disabled={examState.currentIndex === questions.length - 1}>Next</button>
            </div>
          </div>
        </article>
        <aside className="card palette-card">
          <div className="palette-head"><h3>Question palette</h3><p>{answeredCount} answered · {questions.length - answeredCount} pending</p></div>
          <div className="palette-grid">
            {questions.map((question, index) => {
              const isAnswered = !!examState.answers[question.uid];
              const isFlagged = !!examState.flagged[question.uid];
              const isActive = index === examState.currentIndex;
              return (
                <button key={question.uid} className={`palette-btn ${isAnswered ? 'answered' : ''} ${isFlagged ? 'flagged' : ''} ${isActive ? 'active' : ''}`} onClick={() => jumpToQuestion(index)}>
                  {index + 1}
                </button>
              );
            })}
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
