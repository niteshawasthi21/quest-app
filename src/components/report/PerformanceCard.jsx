export function PerformanceCard({ report, passPercentage, remainingAttempts, onBack, onDownload, onRetake, currentUser, stats }) {
  return (
    <article className="card hero-card">
      <p className="eyebrow">Performance</p>
      <h1>{report.passed ? 'Passed' : 'Not passed'}</h1>
      <p>
        {currentUser?.name} scored {report.score} out of {report.totalQuestions} with {report.percentage}%. Minimum required percentage is {passPercentage}%.
      </p>

      <div className="stats-grid">
        <div><strong>{report.score}</strong><span>Marks</span></div>
        <div><strong>{report.answeredCount}</strong><span>Answered</span></div>
        <div><strong>{report.unansweredCount}</strong><span>Unanswered</span></div>
        <div><strong>{stats.attemptsUsed}/3</strong><span>Attempts</span></div>
      </div>

      {report.passed ? (
        <p className="message success">Cleared on attempt {report.clearedOnAttempt}.</p>
      ) : (
        <p className="message error">You need at least 120 correct answers to pass.</p>
      )}

      <div className="nav-actions">
        <button className="secondary-btn" onClick={onBack}>Back to dashboard</button>
        <button className="ghost-btn" onClick={onDownload}>Download PDF report</button>
        <button className="primary-btn" onClick={onRetake} disabled={remainingAttempts === 0}>Retake exam</button>
      </div>
    </article>
  );
}
