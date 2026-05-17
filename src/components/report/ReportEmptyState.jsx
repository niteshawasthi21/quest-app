import { AppShell } from '../Layout';

export function ReportEmptyState() {
  return (
    <AppShell header={<div><p className="eyebrow">Report</p><h2>No report yet</h2></div>}>
      <article className="card"><p>You have not completed any attempt yet.</p></article>
    </AppShell>
  );
}
