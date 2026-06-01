export default function LoadingSpinner() {
  return (
    <div className="spinner-wrapper" role="status" aria-label="Loading">
      <div className="spinner" aria-hidden="true" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
