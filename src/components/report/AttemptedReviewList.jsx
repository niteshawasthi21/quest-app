export function AttemptedReviewList({ attemptedReview }) {
  return (
    <article className="card review-card">
      <p className="eyebrow">Attempted answer review</p>

      {!attemptedReview.length ? (
        <p className="muted-line">No questions were attempted in this exam.</p>
      ) : (
        <div className="review-list">
          {attemptedReview.map((item, index) => (
            <div key={item.id} className={`review-item ${item.isCorrect ? 'correct' : 'wrong'}`}>
              <div className="review-head">
                <strong>Q{index + 1}</strong>
                <span className={item.isCorrect ? 'pill success' : 'pill danger'}>
                  {item.isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              <p>{item.question}</p>
              <small>
                Your answer: {item.selectedAnswer} | Correct answer: {item.correctAnswer}
              </small>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
