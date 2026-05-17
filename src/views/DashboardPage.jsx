import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/Layout';
import { useApp } from '../state/AppContext';

export function DashboardPage() {
  const navigate = useNavigate();
  const { currentUser, logout, startExam, remainingAttempts, maxAttempts, passPercentage, passedAttempt, questions } = useApp();

  const launchExam = () => {
    const result = startExam();
    if (result.ok) navigate('/exam');
  };

  return (
    <AppShell header={<><div><p className="eyebrow">Dashboard</p><h2>Hello, {currentUser?.name}</h2></div><button className="ghost-btn" onClick={logout}>Logout</button></>}>
      <section className="dashboard-grid">
        <article className="card hero-card">
          <p className="eyebrow">Exam overview</p>
          <h1>Networking Quest Assessment</h1>
          <p>Complete all {questions.length} questions within 60 minutes. You may move freely, flag answers for review, submit early, or let the exam auto-submit when time ends.</p>
          <div className="stats-grid">
            <div><strong>{questions.length}</strong><span>Questions</span></div>
            <div><strong>60 min</strong><span>Timer</span></div>
            <div><strong>{passPercentage}%</strong><span>Pass mark</span></div>
            <div><strong>{maxAttempts}</strong><span>Max attempts</span></div>
          </div>
          <button className="primary-btn" onClick={launchExam} disabled={remainingAttempts === 0}>Start exam</button>
        </article>
        <article className="card">
          <p className="eyebrow">Attempt status</p>
          <h3>{remainingAttempts} attempts left</h3>
          <p>You can take the exam up to {maxAttempts} times. The system records the exact attempt on which you cleared the exam.</p>
          {passedAttempt ? <p className="message success">Passed on attempt {passedAttempt.attemptNumber} with {passedAttempt.percentage}%.</p> : <p className="message info">You need at least 120 correct answers to pass.</p>}
        </article>
        <article className="card">
          <p className="eyebrow">Recent attempts</p>
          <div className="attempt-list">
            {(currentUser?.attempts || []).length ? currentUser.attempts.slice().reverse().map((attempt) => (
              <div key={attempt.id} className="attempt-item">
                <div>
                  <strong>Attempt {attempt.attemptNumber}</strong>
                  <span>{new Date(attempt.attemptedOn).toLocaleString()}</span>
                </div>
                <span className={attempt.passed ? 'pill success' : 'pill danger'}>{attempt.percentage}%</span>
              </div>
            )) : <p className="muted-line">No attempts yet.</p>}
          </div>
          <button className="secondary-btn" onClick={() => navigate('/report')} disabled={!(currentUser?.attempts || []).length}>Open latest report</button>
        </article>
      </section>
    </AppShell>
  );
}
