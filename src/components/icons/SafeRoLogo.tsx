import { cn } from "@/lib/utils";

interface SafeRoLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

export function SafeRoLogo({ className, size = "md" }: SafeRoLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn(sizeClasses[size], className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer ring - represents satellite orbit */}
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke="currentColor"
        strokeWidth="2"
        className="text-primary"
        strokeDasharray="8 4"
        opacity="0.6"
      />
      
      {/* Middle ring - monitoring perimeter */}
      <circle
        cx="50"
        cy="50"
        r="35"
        stroke="currentColor"
        strokeWidth="2.5"
        className="text-primary"
      />
      
      {/* Inner filled circle - Romania */}
      <circle
        cx="50"
        cy="50"
        r="24"
        fill="currentColor"
        className="text-primary/20"
      />
      
      {/* Stylized Romania shape */}
      <path
        d="M35 45 Q40 38 50 36 Q60 38 65 45 Q68 52 65 58 Q60 65 50 67 Q40 65 35 58 Q32 52 35 45"
        fill="currentColor"
        className="text-primary"
        opacity="0.8"
      />
      
      {/* Satellite icon */}
      <g transform="translate(68, 20) scale(0.5)">
        <rect
          x="0"
          y="8"
          width="24"
          height="8"
          rx="2"
          fill="currentColor"
          className="text-accent"
        />
        <rect
          x="8"
          y="0"
          width="8"
          height="24"
          rx="2"
          fill="currentColor"
          className="text-accent"
        />
        <circle
          cx="12"
          cy="12"
          r="4"
          fill="currentColor"
          className="text-primary-foreground"
        />
      </g>
      
      {/* Signal waves */}
      <path
        d="M72 40 Q78 44 78 50 Q78 56 72 60"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        className="text-accent"
        strokeLinecap="round"
      />
      <path
        d="M76 36 Q84 42 84 50 Q84 58 76 64"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        className="text-accent"
        opacity="0.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
