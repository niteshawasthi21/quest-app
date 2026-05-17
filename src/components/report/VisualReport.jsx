function DonutStat({ value, total, label, tone = 'primary' }) {
  const percentage = total ? Math.round((value / total) * 100) : 0;
  const color = tone === 'success' ? '#22c55e' : tone === 'danger' ? '#fb7185' : tone === 'warning' ? '#f59e0b' : '#6ee7f9';

  return (
    <div className="chart-card">
      <div
        className="donut-chart"
        style={{
          background: `conic-gradient(${color} 0deg ${percentage * 3.6}deg, rgba(255,255,255,0.08) ${percentage * 3.6}deg 360deg)`,
        }}
      >
        <div className="donut-center">
          <strong>{percentage}%</strong>
        </div>
      </div>
      <div className="chart-meta">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

export function VisualReport({ report, stats, attemptedReview }) {
  return (
    <article className="card">
      <p className="eyebrow">Visual report</p>

      <div className="chart-grid">
        <DonutStat value={report.score} total={report.totalQuestions} label="Overall score" tone={report.passed ? 'success' : 'danger'} />
        <DonutStat value={report.answeredCount} total={report.totalQuestions} label="Answered" tone="primary" />
        <DonutStat value={report.unansweredCount} total={report.totalQuestions} label="Unanswered" tone="warning" />
        <DonutStat value={stats.correctAttemptedCount} total={attemptedReview.length || 1} label="Correct in attempted" tone="success" />
      </div>

      <div className="progress-report">
        <div className="progress-row">
          <span>Correct</span>
          <div className="progress-track">
            <div className="progress-fill success" style={{ width: `${(report.score / report.totalQuestions) * 100}%` }} />
          </div>
          <strong>{report.score}</strong>
        </div>

        <div className="progress-row">
          <span>Incorrect</span>
          <div className="progress-track">
            <div className="progress-fill danger" style={{ width: `${(stats.incorrectAttemptedCount / report.totalQuestions) * 100}%` }} />
          </div>
          <strong>{stats.incorrectAttemptedCount}</strong>
        </div>

        <div className="progress-row">
          <span>Unanswered</span>
          <div className="progress-track">
            <div className="progress-fill warning" style={{ width: `${(report.unansweredCount / report.totalQuestions) * 100}%` }} />
          </div>
          <strong>{report.unansweredCount}</strong>
        </div>
      </div>
    </article>
  );
}
