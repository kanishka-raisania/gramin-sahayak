/**
 * GraminLogo — SVG logo component for Gramin Sahayak
 * Green + saffron gradient with hands-holding-crop icon
 */
const GraminLogo = ({ size = 40, showText = false }: { size?: number; showText?: boolean }) => {
  return (
    <div className="flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Circular background with gradient */}
        <defs>
          <linearGradient id="logoGradient" x1="0" y1="0" x2="64" y2="64">
            <stop offset="0%" stopColor="hsl(145, 55%, 28%)" />
            <stop offset="100%" stopColor="hsl(30, 85%, 55%)" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="30" fill="url(#logoGradient)" />
        {/* Hands holding a crop sprout */}
        {/* Left hand */}
        <path
          d="M16 38 C16 34 20 30 24 32 L28 36"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Right hand */}
        <path
          d="M48 38 C48 34 44 30 40 32 L36 36"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Cupped hands bottom */}
        <path
          d="M24 36 Q32 44 40 36"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Sprout stem */}
        <line x1="32" y1="34" x2="32" y2="20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        {/* Leaves */}
        <path
          d="M32 28 C28 24 26 26 28 30"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="hsl(145, 55%, 90%)"
          fillOpacity="0.3"
        />
        <path
          d="M32 24 C36 20 38 22 36 26"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="hsl(145, 55%, 90%)"
          fillOpacity="0.3"
        />
        {/* Top leaf */}
        <path
          d="M32 20 C30 16 32 14 34 18"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="text-lg font-extrabold text-primary-foreground tracking-tight">
            Gramin Sahayak
          </span>
          <span className="text-[10px] font-medium text-primary-foreground/70 tracking-wide uppercase">
            Rural Digital Assistant
          </span>
        </div>
      )}
    </div>
  );
};

export default GraminLogo;
