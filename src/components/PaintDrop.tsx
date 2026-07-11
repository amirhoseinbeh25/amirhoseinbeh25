export default function PaintDrop({ className = "", color = "var(--color-primary)" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 48 56" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24 2C24 2 44 26.5 44 38C44 49.598 35.046 55 24 55C12.954 55 4 49.598 4 38C4 26.5 24 2 24 2Z"
        fill={color}
      />
      <ellipse cx="17" cy="34" rx="4" ry="7" fill="white" fillOpacity="0.35" />
    </svg>
  );
}
