export default function PaintDrop({
  className = "",
  color = "var(--color-primary)",
  glossy = false,
  style,
}: {
  className?: string;
  color?: string;
  glossy?: boolean;
  style?: React.CSSProperties;
}) {
  const gradientId = `drop-gradient-${color.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <svg viewBox="0 0 48 56" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      {glossy && (
        <defs>
          <linearGradient id={gradientId} x1="8" y1="4" x2="40" y2="54" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="white" stopOpacity="0.55" />
            <stop offset="35%" stopColor={color} />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
      )}
      <path
        d="M24 2C24 2 44 26.5 44 38C44 49.598 35.046 55 24 55C12.954 55 4 49.598 4 38C4 26.5 24 2 24 2Z"
        fill={glossy ? `url(#${gradientId})` : color}
      />
      <ellipse cx="17" cy="34" rx="4" ry="7" fill="white" fillOpacity="0.35" />
    </svg>
  );
}
