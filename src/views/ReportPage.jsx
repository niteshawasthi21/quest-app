import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/Layout';
import { AttemptedReviewList } from '../components/report/AttemptedReviewList';
import { PerformanceCard } from '../components/report/PerformanceCard';
import { ReportEmptyState } from '../components/report/ReportEmptyState';
import { VisualReport } from '../components/report/VisualReport';
import { useApp } from '../state/AppContext';
import { downloadReportPdf, getAttemptedReview, getLatestReport, getReportStats } from '../utils/reportHelpers';

export function ReportPage() {
  const navigate = useNavigate();
  const { currentUser, latestReport, passPercentage, startExam, remainingAttempts } = useApp();

  const report = useMemo(() => getLatestReport(currentUser, latestReport), [currentUser, latestReport]);

  const attemptedReview = useMemo(() => getAttemptedReview(report), [report]);

  const stats = useMemo(() => getReportStats(report, attemptedReview, currentUser), [report, attemptedReview, currentUser]);

  if (!report) return <ReportEmptyState />;

  const handleRetake = () => {
    const result = startExam();
    if (result.ok) navigate('/exam');
  };

  const handleDownload = () => {
    downloadReportPdf({ currentUser, report, attemptedReview, stats });
  };

  return (
    <AppShell
      header={
        <>
          <div>
            <p className="eyebrow">Report</p>
            <h2>Attempt {report.attemptNumber} result</h2>
          </div>
          <button className="ghost-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
        </>
      }
    >
      <section className="report-grid">
        <PerformanceCard
          report={report}
          passPercentage={passPercentage}
          remainingAttempts={remainingAttempts}
          onBack={() => navigate('/dashboard')}
          onDownload={handleDownload}
          onRetake={handleRetake}
          currentUser={currentUser}
          stats={stats}
        />
        <VisualReport report={report} stats={stats} attemptedReview={attemptedReview} />
        <AttemptedReviewList attemptedReview={attemptedReview} />
      </section>
    </AppShell>
  );
}
