import { cn } from "@/lib/utils";
import type { ServiceType } from "@/lib/types";

// ─── Simple Icons paths (official brand SVGs, viewBox 0 0 24 24) ─────────────
// Source: simple-icons npm package — MIT license

import {
  siNetflix,
  siSpotify,
  siHbomax,
  siYoutube,
  siApplemusic,
  siAppletv,
} from "simple-icons";

// ─── Per-service config ───────────────────────────────────────────────────────

interface ServiceConfig {
  /** SVG path string (viewBox 0 0 24 24). null = use customPath */
  path: string | null;
  /** Custom JSX for services not in simple-icons */
  customContent?: React.ReactNode;
  /** Background color hex (without #) */
  bg: string;
}


const SERVICE_CONFIG: Record<ServiceType, ServiceConfig> = {
  netflix: {
    path: siNetflix.path,
    bg: "E50914",
  },
  spotify: {
    path: siSpotify.path,
    bg: "1DB954",
  },
  disney_plus: {
    path: null,
    customContent: (
      <svg viewBox="0 0 24 24" fill="white" aria-hidden className="w-[65%] h-[65%]">
        <text
          x="2"
          y="17"
          fontFamily="'Arial Black', sans-serif"
          fontWeight="900"
          fontSize="13"
          letterSpacing="-0.5"
        >
          D+
        </text>
      </svg>
    ),
    bg: "0063E5",
  },
  hbo_max: {
    path: siHbomax.path,
    bg: "5822B4",
  },
  youtube_premium: {
    path: siYoutube.path,
    bg: "FF0000",
  },
  apple_music: {
    path: siApplemusic.path,
    bg: "FA243C",
  },
  apple_tv: {
    path: siAppletv.path,
    bg: "1C1C1E",
  },
  other: {
    path: null,
    customContent: (
      <svg viewBox="0 0 24 24" fill="white" aria-hidden className="w-full h-full p-[22%]">
        <circle cx="5" cy="12" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="19" cy="12" r="2" />
      </svg>
    ),
    bg: "424656",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

interface ServiceLogoProps {
  // Acepta ServiceType o string (para datos de DB)
  service: ServiceType | string;
  /** Tailwind size class + any extra classes (e.g. "size-10 rounded-xl") */
  className?: string;
  style?: React.CSSProperties;
}

export function ServiceLogo({ service, className, style }: ServiceLogoProps) {
  const config =
    SERVICE_CONFIG[service as ServiceType] ?? SERVICE_CONFIG["other"];

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center overflow-hidden shrink-0",
        className,
      )}
      style={{ backgroundColor: `#${config.bg}`, ...style }}
      aria-hidden="true"
    >
      {config.path ? (
        <svg
          viewBox="0 0 24 24"
          fill="white"
          aria-hidden
          className="w-[58%] h-[58%]"
        >
          <path d={config.path} />
        </svg>
      ) : (
        config.customContent
      )}
    </span>
  );
}
