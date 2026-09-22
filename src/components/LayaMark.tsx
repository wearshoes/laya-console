export function LayaMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M16 1.8 29 9.1v13.8L16 30.2 3 22.9V9.1L16 1.8zm0 3.6L6.4 10.4v11.2L16 26.6l9.6-5V10.4L16 5.4z"
      />
      <path fill="currentColor" d="M16 11.2 21.2 14v5.6L16 22.4 10.8 19.6V14L16 11.2z" />
    </svg>
  );
}
