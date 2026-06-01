export default function ErrorMessage({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="error-banner" role="alert">
      <span className="error-text">{message}</span>
      <button
        type="button"
        className="error-dismiss"
        onClick={onDismiss}
        aria-label="Dismiss error"
      >
        ✕
      </button>
    </div>
  );
}
