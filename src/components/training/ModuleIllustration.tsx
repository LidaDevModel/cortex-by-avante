"use client";

import { useId } from "react";

type ModuleCategory = "first-aid" | "escalations" | "clients" | "incidents";

/* ─── Shared style helpers ─── */

const fillStyle = { fillOpacity: "var(--il-icon-fill-opacity)" } as React.CSSProperties;
const shadowStyle = { fillOpacity: "var(--il-icon-shadow-opacity)" } as React.CSSProperties;

/* ─── HeartPulse ─── */

function HeartPulseIllustration({ width, height }: { width: number; height: number }) {
  const rawId = useId();
  const u = rawId.replace(/[^a-zA-Z0-9]/g, "");

  return (
    <svg width={width} height={height} viewBox="0 0 84 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath={`url(#${u}cp)`}>
        <g filter={`url(#${u}bl)`}>
          <ellipse cx="42.6907" cy="96.0277" rx="32.9232" ry="8.2308" fill={`url(#${u}sh)`} style={shadowStyle} />
        </g>
        <path d="M68.0489 51.9602C73.4995 46.6193 79.0233 40.2176 79.0233 31.8404C79.0233 26.5044 76.9035 21.3868 73.1303 17.6136C69.3571 13.8405 64.2396 11.7207 58.9035 11.7207C52.4652 11.7207 47.9291 13.5498 42.4419 19.037C36.9547 13.5498 32.4186 11.7207 25.9803 11.7207C20.6442 11.7207 15.5267 13.8405 11.7535 17.6136C7.98035 21.3868 5.8606 26.5044 5.8606 31.8404C5.8606 40.2541 11.3478 46.6559 16.835 51.9602L42.4419 77.5671L68.0489 51.9602Z" fill={`url(#${u}fi)`} style={fillStyle} />
        <path d="M10.3234 44.6439H33.2965L35.1256 40.9858L42.4418 57.4474L49.7581 31.8404L55.2453 44.6439H74.5237M68.0489 51.9602C73.4995 46.6193 79.0233 40.2176 79.0233 31.8404C79.0233 26.5044 76.9035 21.3868 73.1303 17.6136C69.3571 13.8405 64.2396 11.7207 58.9035 11.7207C52.4652 11.7207 47.9291 13.5498 42.4419 19.037C36.9547 13.5498 32.4186 11.7207 25.9803 11.7207C20.6442 11.7207 15.5267 13.8405 11.7535 17.6136C7.98035 21.3868 5.8606 26.5044 5.8606 31.8404C5.8606 40.2541 11.3478 46.6559 16.835 51.9602L42.4419 77.5671L68.0489 51.9602Z" stroke={`url(#${u}st)`} strokeWidth="2.598" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <filter id={`${u}bl`} x="3.73" y="81.76" width="77.92" height="28.53" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="3.02" result="effect1_foregroundBlur" />
        </filter>
        <radialGradient id={`${u}sh`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(42.6907 96.0277) rotate(90) scale(8.2308 32.9232)">
          <stop stopColor="var(--il-icon-shadow-from)" />
          <stop offset="1" stopColor="var(--il-icon-shadow-to)" />
        </radialGradient>
        <linearGradient id={`${u}fi`} x1="42.44" y1="11.72" x2="42.44" y2="77.57" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-icon-fill-from)" />
          <stop offset="1" stopColor="var(--il-icon-fill-to)" />
        </linearGradient>
        <linearGradient id={`${u}st`} x1="94.67" y1="131.59" x2="66.93" y2="-38.14" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-icon-stroke-from)" />
          <stop offset="1" stopColor="var(--il-icon-stroke-to)" />
        </linearGradient>
        <clipPath id={`${u}cp`}>
          <rect width="84" height="109.395" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

/* ─── Shield ─── */

function ShieldIllustration({ width, height }: { width: number; height: number }) {
  const rawId = useId();
  const u = rawId.replace(/[^a-zA-Z0-9]/g, "");

  return (
    <svg width={width} height={height} viewBox="0 0 78 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M68.1561 47.34C68.1561 65.546 55.4119 74.6489 40.2646 79.9287C39.4714 80.1975 38.6098 80.1846 37.825 79.8923C22.6412 74.6489 9.89697 65.546 9.89697 47.34V21.8516C9.89697 20.8859 10.2806 19.9597 10.9635 19.2769C11.6463 18.594 12.5725 18.2104 13.5382 18.2104C20.8206 18.2104 29.9236 13.8409 36.2592 8.30633C37.0306 7.64727 38.0119 7.28516 39.0266 7.28516C40.0412 7.28516 41.0225 7.64727 41.7939 8.30633C48.166 13.8774 57.2325 18.2104 64.5149 18.2104C65.4806 18.2104 66.4068 18.594 67.0896 19.2769C67.7725 19.9597 68.1561 20.8859 68.1561 21.8516V47.34Z" fill={`url(#${u}fi)`} style={fillStyle} stroke={`url(#${u}st)`} strokeWidth="2.586" strokeLinecap="round" strokeLinejoin="round" />
      <g filter={`url(#${u}bl)`}>
        <ellipse cx="38.7787" cy="95.6927" rx="32.7708" ry="8.1927" fill={`url(#${u}sh)`} style={shadowStyle} />
      </g>
      <defs>
        <filter id={`${u}bl`} x="0" y="81.49" width="77.56" height="28.40" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="3.00" result="effect1_foregroundBlur" />
        </filter>
        <linearGradient id={`${u}fi`} x1="39.03" y1="7.29" x2="39.03" y2="80.12" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-icon-fill-from)" />
          <stop offset="1" stopColor="var(--il-icon-fill-to)" />
        </linearGradient>
        <linearGradient id={`${u}st`} x1="80.62" y1="139.88" x2="39.00" y2="-43.43" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-icon-stroke-from)" />
          <stop offset="1" stopColor="var(--il-icon-stroke-to)" />
        </linearGradient>
        <radialGradient id={`${u}sh`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(38.7787 95.6927) rotate(90) scale(8.1927 32.7708)">
          <stop stopColor="var(--il-icon-shadow-from)" />
          <stop offset="1" stopColor="var(--il-icon-shadow-to)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ─── TriangleAlert ─── */

function TriangleAlertIllustration({ width, height }: { width: number; height: number }) {
  const rawId = useId();
  const u = rawId.replace(/[^a-zA-Z0-9]/g, "");

  return (
    <svg width={width} height={height} viewBox="0 0 84 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath={`url(#${u}cp)`}>
        <path d="M78.1013 65.8427L48.8362 14.6289C48.1981 13.5029 47.2727 12.5664 46.1545 11.9148C45.0363 11.2632 43.7653 10.9199 42.4711 10.9199C41.1769 10.9199 39.9058 11.2632 38.7876 11.9148C37.6694 12.5664 36.744 13.5029 36.1059 14.6289L6.84084 65.8427C6.19584 66.9598 5.85764 68.2275 5.86049 69.5174C5.86335 70.8073 6.20717 72.0735 6.8571 73.1876C7.50704 74.3018 8.43998 75.2243 9.56137 75.8617C10.6828 76.4991 11.9527 76.8288 13.2426 76.8171H71.7727C73.0563 76.8158 74.317 76.4768 75.4282 75.8341C76.5394 75.1915 77.4619 74.2678 78.1032 73.1558C78.7444 72.0438 79.0818 70.7826 79.0815 69.499C79.0811 68.2154 78.7431 66.9544 78.1013 65.8427Z" fill={`url(#${u}fi)`} style={fillStyle} />
        <path d="M42.5079 32.9196V47.5522M42.5079 62.1847H42.5445M78.1013 65.8427L48.8362 14.6289C48.1981 13.5029 47.2727 12.5664 46.1545 11.9148C45.0363 11.2632 43.7653 10.9199 42.4711 10.9199C41.1769 10.9199 39.9058 11.2632 38.7876 11.9148C37.6694 12.5664 36.744 13.5029 36.1059 14.6289L6.84084 65.8427C6.19584 66.9598 5.85764 68.2275 5.86049 69.5174C5.86335 70.8073 6.20717 72.0735 6.8571 73.1876C7.50704 74.3018 8.43998 75.2243 9.56137 75.8617C10.6828 76.4991 11.9527 76.8288 13.2426 76.8171H71.7727C73.0563 76.8158 74.317 76.4768 75.4282 75.8341C76.5394 75.1915 77.4619 74.2678 78.1032 73.1558C78.7444 72.0438 79.0818 70.7826 79.0815 69.499C79.0811 68.2154 78.7431 66.9544 78.1013 65.8427Z" stroke={`url(#${u}st)`} strokeWidth="2.598" strokeLinecap="round" strokeLinejoin="round" />
        <g filter={`url(#${u}bl)`}>
          <ellipse cx="42.6907" cy="96.137" rx="32.9232" ry="8.2308" fill={`url(#${u}sh)`} style={shadowStyle} />
        </g>
      </g>
      <defs>
        <filter id={`${u}bl`} x="3.73" y="81.87" width="77.92" height="28.53" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="3.02" result="effect1_foregroundBlur" />
        </filter>
        <linearGradient id={`${u}fi`} x1="42.47" y1="10.92" x2="42.47" y2="76.82" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-icon-fill-from)" />
          <stop offset="1" stopColor="var(--il-icon-fill-to)" />
        </linearGradient>
        <linearGradient id={`${u}st`} x1="94.74" y1="130.88" x2="66.98" y2="-38.98" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-icon-stroke-from)" />
          <stop offset="1" stopColor="var(--il-icon-stroke-to)" />
        </linearGradient>
        <radialGradient id={`${u}sh`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(42.6907 96.137) rotate(90) scale(8.2308 32.9232)">
          <stop stopColor="var(--il-icon-shadow-from)" />
          <stop offset="1" stopColor="var(--il-icon-shadow-to)" />
        </radialGradient>
        <clipPath id={`${u}cp`}>
          <rect width="84" height="109.395" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

/* ─── UserRound ─── */

function UserRoundIllustration({ width, height }: { width: number; height: number }) {
  const rawId = useId();
  const u = rawId.replace(/[^a-zA-Z0-9]/g, "");

  return (
    <svg width={width} height={height} viewBox="0 0 88 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath={`url(#${u}cp)`}>
        <path d="M44.9992 46.4596C55.1244 46.4596 63.3326 38.2515 63.3326 28.1263C63.3326 18.0011 55.1244 9.79297 44.9992 9.79297C34.874 9.79297 26.6659 18.0011 26.6659 28.1263C26.6659 38.2515 34.874 46.4596 44.9992 46.4596Z" fill={`url(#${u}fi)`} style={fillStyle} />
        <path d="M72.4479 75.793C74.2999 75.793 74.2999 75.793 74.2999 74.4085C73.9564 67.1326 70.9149 60.225 65.741 55.0512C60.24 49.5501 52.7789 46.4596 44.9992 46.4596C37.2195 46.4596 29.7585 49.5501 24.2574 55.0512C19.0836 60.225 16.0421 67.1326 15.6985 74.4085C15.6987 75.793 15.6567 75.793 17.6241 75.793" fill={`url(#${u}fi)`} style={fillStyle} />
        <path d="M44.9992 46.4596C55.1244 46.4596 63.3326 38.2515 63.3326 28.1263C63.3326 18.0011 55.1244 9.79297 44.9992 9.79297C34.874 9.79297 26.6659 18.0011 26.6659 28.1263C26.6659 38.2515 34.874 46.4596 44.9992 46.4596ZM44.9992 46.4596C52.7789 46.4596 60.24 49.5501 65.741 55.0512C70.9149 60.225 73.9564 67.1326 74.2999 74.4085C74.2999 75.793 74.2999 75.793 72.4479 75.793H17.6241C15.6567 75.793 15.6987 75.793 15.6985 74.4085C16.0421 67.1326 19.0836 60.225 24.2574 55.0512C29.7585 49.5501 37.2195 46.4596 44.9992 46.4596Z" stroke={`url(#${u}st)`} strokeWidth="1.958" strokeLinecap="round" strokeLinejoin="round" />
        <g filter={`url(#${u}bl)`}>
          <ellipse cx="43.9993" cy="96.252" rx="33" ry="8.25" fill={`url(#${u}sh)`} style={shadowStyle} />
        </g>
      </g>
      <defs>
        <filter id={`${u}bl`} x="4.95" y="81.95" width="78.10" height="28.60" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="3.025" result="effect1_foregroundBlur" />
        </filter>
        <linearGradient id={`${u}fi`} x1="44.998" y1="9.793" x2="44.998" y2="75.793" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-icon-fill-from)" />
          <stop offset="1" stopColor="var(--il-icon-fill-to)" />
        </linearGradient>
        <linearGradient id={`${u}st`} x1="86.84" y1="129.94" x2="52.54" y2="-37.71" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-icon-stroke-from)" />
          <stop offset="1" stopColor="var(--il-icon-stroke-to)" />
        </linearGradient>
        <radialGradient id={`${u}sh`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(43.9993 96.252) rotate(90) scale(8.25 33)">
          <stop stopColor="var(--il-icon-shadow-from)" />
          <stop offset="1" stopColor="var(--il-icon-shadow-to)" />
        </radialGradient>
        <clipPath id={`${u}cp`}>
          <rect width="88" height="110" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

/* ─── Dispatcher ─── */

const ILLUSTRATIONS: Record<ModuleCategory, React.ComponentType<{ width: number; height: number }>> = {
  "first-aid":   HeartPulseIllustration,
  "escalations": TriangleAlertIllustration,
  "clients":     UserRoundIllustration,
  "incidents":   ShieldIllustration,
};

export function ModuleIllustration({
  category,
  width = 80,
  height = 80,
  className,
}: {
  category: ModuleCategory;
  width?: number;
  height?: number;
  className?: string;
}) {
  const Illustration = ILLUSTRATIONS[category];
  return (
    <span className={className} data-il-group="module">
      <Illustration width={width} height={height} />
    </span>
  );
}
