import { jsPDF } from 'jspdf';

export function getLatestReport(currentUser, latestReport) {
  return latestReport || currentUser?.attempts?.[currentUser.attempts.length - 1] || null;
}

export function getAttemptedReview(report) {
  return (report?.review || []).filter((item) => item.selectedAnswer);
}

export function getReportStats(report, attemptedReview, currentUser) {
  const correctAttemptedCount = attemptedReview.filter((item) => item.isCorrect).length;
  const incorrectAttemptedCount = attemptedReview.filter((item) => !item.isCorrect).length;
  const attemptsUsed = currentUser?.attempts?.length || report?.attemptNumber || 0;

  return {
    correctAttemptedCount,
    incorrectAttemptedCount,
    attemptsUsed,
  };
}

function drawBar(doc, x, y, width, height, value, total, color) {
  const fillWidth = total ? Math.max(0, Math.min(width, (value / total) * width)) : 0;

  // background
  doc.setFillColor(235, 239, 245);
  doc.roundedRect(x, y, width, height, 4, 4, 'F');

  // progress
  doc.setFillColor(...color);
  doc.roundedRect(x, y, fillWidth, height, 4, 4, 'F');
}

function addWrappedText(doc, text, x, y, maxWidth, lineHeight = 5) {
  const lines = doc.splitTextToSize(text || '', maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function drawCard(doc, x, y, width, height, title, value, color) {
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(230, 235, 245);
  doc.roundedRect(x, y, width, height, 6, 6, 'FD');

  // Accent line
  doc.setFillColor(...color);
  doc.roundedRect(x, y, 5, height, 6, 6, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(title, x + 10, y + 9);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(20, 20, 20);
  doc.text(value, x + 10, y + 22);
}

export function downloadReportPdf({ currentUser, report, attemptedReview, stats }) {
  if (!currentUser || !report) return;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;

  let y = 18;

  const ensureSpace = (needed = 18) => {
    if (y + needed > pageHeight - 18) {
      doc.addPage();
      y = 18;
    }
  };

  // ======================
  // HERO HEADER
  // ======================

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(10, 10, 190, 38, 10, 10, 'F');

  // Decorative circles
  doc.setFillColor(30, 41, 59);
  doc.circle(180, 18, 16, 'F');

  doc.setFillColor(51, 65, 85);
  doc.circle(192, 38, 18, 'F');

  doc.setTextColor(255, 255, 255);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('Quest Exam Report', margin + 4, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  doc.text(
    `Attempt ${report.attemptNumber} • ${report.passed ? 'PASSED' : 'FAILED'}`,
    margin + 4,
    37
  );

  y = 58;

  // ======================
  // USER INFO CARD
  // ======================

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, 182, 34, 8, 8, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.text('Candidate Information', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);

  const leftX = margin + 6;
  const rightX = margin + 94;

  doc.text(`Name: ${currentUser.name}`, leftX, y + 18);
  doc.text(`Email: ${currentUser.email}`, leftX, y + 25);

  doc.text(
    `Exam Date: ${new Date(report.attemptedOn).toLocaleString()}`,
    rightX,
    y + 18
  );

  doc.text(`Attempts Used: ${stats.attemptsUsed} / 3`, rightX, y + 25);

  y += 46;

  // ======================
  // METRICS SECTION
  // ======================

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('Performance Overview', margin, y);

  y += 8;

  drawCard(
    doc,
    margin,
    y,
    84,
    30,
    'Marks',
    `${report.score}/${report.totalQuestions}`,
    [59, 130, 246]
  );

  drawCard(
    doc,
    112,
    y,
    84,
    30,
    'Percentage',
    `${report.percentage}%`,
    [16, 185, 129]
  );

  y += 38;

  drawCard(
    doc,
    margin,
    y,
    84,
    30,
    'Answered',
    `${report.answeredCount}`,
    [245, 158, 11]
  );

  drawCard(
    doc,
    112,
    y,
    84,
    30,
    'Unanswered',
    `${report.unansweredCount}`,
    [239, 68, 68]
  );

  y += 46;

  // ======================
  // PERFORMANCE BARS
  // ======================

  ensureSpace(50);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('Performance Analytics', margin, y);

  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  // Correct
  doc.setTextColor(34, 197, 94);
  doc.text(`Correct Answers (${report.score})`, margin, y);
  drawBar(
    doc,
    margin,
    y + 3,
    170,
    7,
    report.score,
    report.totalQuestions,
    [34, 197, 94]
  );

  y += 16;

  // Incorrect
  doc.setTextColor(239, 68, 68);
  doc.text(
    `Incorrect Answers (${stats.incorrectAttemptedCount})`,
    margin,
    y
  );

  drawBar(
    doc,
    margin,
    y + 3,
    170,
    7,
    stats.incorrectAttemptedCount,
    report.totalQuestions,
    [239, 68, 68]
  );

  y += 16;

  // Unanswered
  doc.setTextColor(245, 158, 11);
  doc.text(`Unanswered (${report.unansweredCount})`, margin, y);

  drawBar(
    doc,
    margin,
    y + 3,
    170,
    7,
    report.unansweredCount,
    report.totalQuestions,
    [245, 158, 11]
  );

  y += 24;

  // ======================
  // REVIEW SECTION
  // ======================

  ensureSpace(30);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('Attempted Question Review', margin, y);

  y += 10;

  if (!attemptedReview.length) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('No attempted questions available.', margin, y);
    y += 10;
  } else {
    attemptedReview.forEach((item, index) => {
      ensureSpace(42);

      const isCorrect = item.isCorrect;

      // Card Background
      doc.setFillColor(
        ...(isCorrect ? [240, 253, 244] : [254, 242, 242])
      );

      doc.setDrawColor(
        ...(isCorrect ? [34, 197, 94] : [239, 68, 68])
      );

      doc.roundedRect(margin, y, 182, 34, 7, 7, 'FD');

      // Status Badge
      doc.setFillColor(
        ...(isCorrect ? [34, 197, 94] : [239, 68, 68])
      );

      doc.roundedRect(margin + 4, y + 4, 28, 8, 4, 4, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);

      doc.text(
        isCorrect ? 'CORRECT' : 'WRONG',
        margin + 8,
        y + 9
      );

      // Question
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);

      doc.text(`Question ${index + 1}`, margin + 38, y + 10);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);

      let textY = addWrappedText(
        doc,
        item.question,
        margin + 6,
        y + 18,
        168,
        4.5
      );

      doc.setTextColor(71, 85, 105);

      textY = addWrappedText(
        doc,
        `Your Answer: ${item.selectedAnswer}`,
        margin + 6,
        textY + 2,
        168,
        4.5
      );

      addWrappedText(
        doc,
        `Correct Answer: ${item.correctAnswer}`,
        margin + 6,
        textY + 2,
        168,
        4.5
      );

      y += 40;
    });
  }

  // ======================
  // FOOTER
  // ======================

  const totalPages = doc.internal.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    doc.setDrawColor(230, 230, 230);
    doc.line(14, 287, 196, 287);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);

    doc.text('Generated by Quest Examination System', 14, 292);
    doc.text(`Page ${i} of ${totalPages}`, 170, 292);
  }

  doc.save(`quest-report-attempt-${report.attemptNumber}.pdf`);
}