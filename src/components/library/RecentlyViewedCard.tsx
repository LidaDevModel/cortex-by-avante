"use client";

import { useId } from "react";
import { FolderIllustration } from "./FolderIllustration";
import { useTheme } from "@/components/theme-context";

export type RecentlyViewedItem = {
  id: string;
  type: "file" | "folder";
  name: string;
};

type Props = { item: RecentlyViewedItem; onClick?: () => void };

export function FileIllustration({ uid, shadowOpacity }: { uid: string; shadowOpacity: number }) {
  const d = `d${uid}`;

  return (
    <svg width="100%" viewBox="0 0 179 163" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
      {/* background tray — identical in both states */}
      <rect x="10" y="18" width="159.61" height="143.001" rx="11.3429" fill="var(--il-tray)" />

      {/* Single paper — real motion instead of the old two-picture crossfade:
          on hover the browser tweens it to the exact pose the baked hover
          drawing used (lift + tilt −3.14° about its top-left corner). */}
      <g
        className="transition-transform duration-300 ease-out group-hover:[transform:rotate(-3.14265deg)_translate(-2.4242px,-10.0459px)]"
        style={{ transformOrigin: "37.1512px 16.9746px", transformBox: "view-box" }}
      >
        <g filter={`url(#${d}f)`}>
          <rect x="39.5754" y="27.0205" width="100.128" height="125.161" rx="7.90488" fill={`url(#${d}p0)`} />
          <rect x="39.795" y="27.2401" width="99.6893" height="124.721" rx="7.6853" stroke={`url(#${d}p1)`} strokeWidth="0.43916" />
          <path d="M48.3586 39.5366C48.3586 37.475 50.0299 35.8037 52.0915 35.8037H127.188C129.249 35.8037 130.921 37.475 130.921 39.5366C130.921 41.5982 129.249 43.2694 127.188 43.2694H52.0915C50.0299 43.2694 48.3586 41.5982 48.3586 39.5366Z" fill={`url(#${d}p2)`} />
          <path d="M48.3588 53.5895C48.3588 52.4981 49.2435 51.6133 50.335 51.6133H84.5559C85.6474 51.6133 86.5322 52.4981 86.5322 53.5895C86.5322 54.6809 85.6474 55.5657 84.5559 55.5657H50.335C49.2436 55.5657 48.3588 54.6809 48.3588 53.5895Z" fill={`url(#${d}p3)`} />
          <path d="M48.3589 62.8122C48.3589 61.7207 49.2437 60.8359 50.3351 60.8359H84.5561C85.6475 60.8359 86.5323 61.7207 86.5323 62.8122C86.5323 63.9036 85.6475 64.7884 84.5561 64.7884H50.3351C49.2437 64.7884 48.3589 63.9036 48.3589 62.8122Z" fill={`url(#${d}p4)`} />
          <path d="M48.3588 72.0338C48.3588 70.9424 49.2435 70.0576 50.335 70.0576H84.5559C85.6474 70.0576 86.5322 70.9424 86.5322 72.0338C86.5322 73.1253 85.6474 74.0101 84.5559 74.0101H50.335C49.2436 74.0101 48.3588 73.1253 48.3588 72.0338Z" fill={`url(#${d}p5)`} />
          <path d="M48.3588 81.2565C48.3588 80.1651 49.2435 79.2803 50.335 79.2803H84.5559C85.6474 79.2803 86.5322 80.1651 86.5322 81.2565C86.5322 82.3479 85.6474 83.2327 84.5559 83.2327H50.335C49.2436 83.2327 48.3588 82.3479 48.3588 81.2565Z" fill={`url(#${d}p6)`} />
          <path d="M48.3589 90.4791C48.3589 89.3877 49.2437 88.5029 50.3351 88.5029H84.5561C85.6475 88.5029 86.5323 89.3877 86.5323 90.4791C86.5323 91.5706 85.6475 92.4554 84.5561 92.4554H50.3351C49.2437 92.4554 48.3589 91.5706 48.3589 90.4791Z" fill={`url(#${d}p7)`} />
          <path d="M48.3589 99.7008C48.3589 98.6094 49.2437 97.7246 50.3351 97.7246H84.5561C85.6475 97.7246 86.5323 98.6094 86.5323 99.7008C86.5323 100.792 85.6475 101.677 84.5561 101.677H50.3351C49.2437 101.677 48.3589 100.792 48.3589 99.7008Z" fill={`url(#${d}p8)`} />
          <path d="M48.3588 108.923C48.3588 107.832 49.2435 106.947 50.335 106.947H84.5559C85.6474 106.947 86.5322 107.832 86.5322 108.923C86.5322 110.015 85.6474 110.9 84.5559 110.9H50.335C49.2436 110.9 48.3588 110.015 48.3588 108.923Z" fill={`url(#${d}p9)`} />
          <path d="M48.3588 121.22C48.3588 120.129 49.2435 119.244 50.335 119.244H84.5559C85.6474 119.244 86.5322 120.129 86.5322 121.22C86.5322 122.312 85.6474 123.197 84.5559 123.197H50.335C49.2436 123.197 48.3588 122.312 48.3588 121.22Z" fill={`url(#${d}p10)`} />
          <path d="M48.3589 130.443C48.3589 129.352 49.2437 128.467 50.3351 128.467H84.5561C85.6475 128.467 86.5323 129.352 86.5323 130.443C86.5323 131.534 85.6475 132.419 84.5561 132.419H50.3351C49.2437 132.419 48.3589 131.534 48.3589 130.443Z" fill={`url(#${d}p11)`} />
          <path d="M48.3589 139.665C48.3589 138.573 49.2437 137.688 50.3351 137.688H84.5561C85.6475 137.688 86.5323 138.573 86.5323 139.665C86.5323 140.756 85.6475 141.641 84.5561 141.641H50.3351C49.2437 141.641 48.3589 140.756 48.3589 139.665Z" fill={`url(#${d}p12)`} />
          <path d="M92.7474 53.5895C92.7474 52.4981 93.6322 51.6133 94.7237 51.6133H128.945C130.036 51.6133 130.921 52.4981 130.921 53.5895C130.921 54.6809 130.036 55.5657 128.945 55.5657H94.7237C93.6322 55.5657 92.7474 54.6809 92.7474 53.5895Z" fill={`url(#${d}p13)`} />
          <path d="M92.7473 62.8122C92.7473 61.7207 93.6321 60.8359 94.7235 60.8359H128.944C130.036 60.8359 130.921 61.7207 130.921 62.8122C130.921 63.9036 130.036 64.7884 128.944 64.7884H94.7235C93.6321 64.7884 92.7473 63.9036 92.7473 62.8122Z" fill={`url(#${d}p14)`} />
          <path d="M92.7473 72.0338C92.7473 70.9424 93.6321 70.0576 94.7235 70.0576H128.944C130.036 70.0576 130.921 70.9424 130.921 72.0338C130.921 73.1253 130.036 74.0101 128.944 74.0101H94.7235C93.6321 74.0101 92.7473 73.1253 92.7473 72.0338Z" fill={`url(#${d}p15)`} />
          <path d="M92.7474 81.2565C92.7474 80.1651 93.6322 79.2803 94.7237 79.2803H128.945C130.036 79.2803 130.921 80.1651 130.921 81.2565C130.921 82.3479 130.036 83.2327 128.945 83.2327H94.7237C93.6322 83.2327 92.7474 82.3479 92.7474 81.2565Z" fill={`url(#${d}p16)`} />
          <path d="M92.7474 90.4791C92.7474 89.3877 93.6322 88.5029 94.7237 88.5029H128.945C130.036 88.5029 130.921 89.3877 130.921 90.4791C130.921 91.5706 130.036 92.4554 128.945 92.4554H94.7237C93.6322 92.4554 92.7474 91.5706 92.7474 90.4791Z" fill={`url(#${d}p17)`} />
          <path d="M92.7473 99.7018C92.7473 98.6104 93.6321 97.7256 94.7235 97.7256H128.944C130.036 97.7256 130.921 98.6104 130.921 99.7018C130.921 100.793 130.036 101.678 128.944 101.678H94.7235C93.6321 101.678 92.7473 100.793 92.7473 99.7018Z" fill={`url(#${d}p18)`} />
          <path d="M92.7474 108.923C92.7474 107.832 93.6322 106.947 94.7237 106.947H128.945C130.036 106.947 130.921 107.832 130.921 108.923C130.921 110.015 130.036 110.9 128.945 110.9H94.7237C93.6322 110.9 92.7474 110.015 92.7474 108.923Z" fill={`url(#${d}p19)`} />
          <path d="M92.5516 121.22C92.5516 120.129 93.4364 119.244 94.5279 119.244H128.749C129.84 119.244 130.725 120.129 130.725 121.22C130.725 122.312 129.84 123.197 128.749 123.197H94.5279C93.4364 123.197 92.5516 122.312 92.5516 121.22Z" fill={`url(#${d}p20)`} />
          <path d="M92.5516 130.443C92.5516 129.352 93.4364 128.467 94.5279 128.467H128.749C129.84 128.467 130.725 129.352 130.725 130.443C130.725 131.534 129.84 132.419 128.749 132.419H94.5279C93.4364 132.419 92.5516 131.534 92.5516 130.443Z" fill={`url(#${d}p21)`} />
        </g>
      </g>

      <defs>
        {/* ── default state defs ── */}
        <filter id={`${d}f`} x="37.731" y="25.176" width="112.601" height="137.632" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feMorphology radius="3.95244" operator="erode" in="SourceAlpha" result="effect1_dropShadow" />
          <feOffset dx="4.3916" dy="4.3916" />
          <feGaussianBlur stdDeviation="5.09425" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values={`0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${shadowOpacity} 0`} />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
        <linearGradient id={`${d}p0`} x1="139.704" y1="88.5029" x2="39.5754" y2="87.6246" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-border)" /><stop offset="1" stopColor="var(--il-doc-bg)" />
        </linearGradient>
        <linearGradient id={`${d}p1`} x1="139.963" y1="27.1173" x2="39.5754" y2="152.181" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-bg)" /><stop offset="1" stopColor="var(--il-doc-border)" />
        </linearGradient>
        <linearGradient id={`${d}p2`} x1="48.3586" y1="39.5366" x2="130.921" y2="39.5366" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${d}p3`} x1="48.3588" y1="53.5895" x2="86.5322" y2="53.5895" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${d}p4`} x1="48.3589" y1="62.8122" x2="86.5323" y2="62.8122" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${d}p5`} x1="48.3588" y1="72.0338" x2="86.5322" y2="72.0338" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${d}p6`} x1="48.3588" y1="81.2565" x2="86.5322" y2="81.2565" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${d}p7`} x1="48.3589" y1="90.4791" x2="86.5323" y2="90.4791" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${d}p8`} x1="48.3589" y1="99.7008" x2="86.5323" y2="99.7008" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${d}p9`} x1="48.3588" y1="108.923" x2="86.5322" y2="108.923" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${d}p10`} x1="48.3588" y1="121.22" x2="86.5322" y2="121.22" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${d}p11`} x1="48.3589" y1="130.443" x2="86.5323" y2="130.443" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${d}p12`} x1="48.3589" y1="139.665" x2="86.5323" y2="139.665" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${d}p13`} x1="92.7474" y1="53.5895" x2="130.921" y2="53.5895" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${d}p14`} x1="92.7473" y1="62.8122" x2="130.921" y2="62.8122" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${d}p15`} x1="92.7473" y1="72.0338" x2="130.921" y2="72.0338" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${d}p16`} x1="92.7474" y1="81.2565" x2="130.921" y2="81.2565" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${d}p17`} x1="92.7474" y1="90.4791" x2="130.921" y2="90.4791" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${d}p18`} x1="92.7473" y1="99.7018" x2="130.921" y2="99.7018" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${d}p19`} x1="92.7474" y1="108.923" x2="130.921" y2="108.923" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${d}p20`} x1="92.5516" y1="121.22" x2="130.725" y2="121.22" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${d}p21`} x1="92.5516" y1="130.443" x2="130.725" y2="130.443" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function RecentlyViewedCard({ item, onClick }: Props) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, "");
  const { isDark } = useTheme();
  const shadowOpacity = isDark ? 0.16 : 0.07;

  return (
    <button
      onClick={onClick}
      className="group flex flex-col gap-[14px] text-left cursor-pointer shrink-0 snap-start transition-transform duration-150 hover:-translate-y-1"
      style={{ width: 164 }}
    >
      <div className="w-full">
        {item.type === "file" ? (
          <FileIllustration uid={uid} shadowOpacity={shadowOpacity} />
        ) : (
          <FolderIllustration uid={uid} shadowOpacity={shadowOpacity} />
        )}
      </div>

      <div className="flex flex-col gap-0.5 text-center">
        <span className="text-[14px] leading-[20px] font-medium text-[var(--primary)] truncate block">
          {item.name}
        </span>
      </div>
    </button>
  );
}
