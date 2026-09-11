import Image from "next/image";
import Link from "next/link";

interface SiteLogoProps {
  showText?: boolean;
  showBadge?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

const sizes = {
  sm: 42,
  md: 48,
  lg: 58,
};

export function SiteLogo({
  showText = true,
  showBadge = true,
  size = "md",
  href = "/",
  className = "",
}: SiteLogoProps) {
  const px = sizes[size];

  const content = (
    <span className={`inline-flex items-center gap-0.5 flex-shrink-0 ${className}`}>
      <Image
        src="/logo.png"
        alt="LibertyPlace"
        width={px}
        height={px}
        className="object-contain flex-shrink-0 -mr-0.5"
        style={{ width: px, height: px }}
        priority
      />
      {showText && (
        <span className="font-display font-bold text-lg tracking-tight hidden sm:block leading-none -ml-0.5">
          LIBERTY<span className="text-kick-green">PLACE</span>
        </span>
      )}
      {showBadge && (
        <span className="px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] font-bold hidden sm:inline leading-none ml-0.5">
          18+
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="flex-shrink-0 hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
