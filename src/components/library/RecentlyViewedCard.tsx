"use client";

import { useId, useState, useEffect } from "react";
import { FolderIllustration } from "./FolderIllustration";

export type RecentlyViewedItem = {
  id: string;
  type: "file" | "folder";
  name: string;
};

type Props = { item: RecentlyViewedItem; onClick?: () => void };

export function FileIllustration({ uid, shadowOpacity }: { uid: string; shadowOpacity: number }) {
  const d = `d${uid}`;
  const h = `h${uid}`;

  return (
    <svg width="100%" viewBox="0 0 179 163" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* background tray — identical in both states */}
      <rect x="10" y="18" width="159.61" height="143.001" rx="11.3429" fill="var(--il-tray)" />

      {/* ── DEFAULT STATE ── fades out on hover */}
      <g className="opacity-100 transition-opacity duration-300 ease-in-out group-hover:opacity-0">
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

      {/* ── HOVER STATE ── fades in on hover */}
      <g className="opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100">
        <g filter={`url(#${h}f)`}>
          <rect x="37.1512" y="16.9746" width="100.128" height="125.161" rx="7.90488" transform="rotate(-3.14265 37.1512 16.9746)" fill={`url(#${h}p0)`} />
          <rect x="37.3825" y="17.1818" width="99.6893" height="124.721" rx="7.6853" transform="rotate(-3.14265 37.3825 17.1818)" stroke={`url(#${h}p1)`} strokeWidth="0.43916" />
          <path d="M46.6074 28.9899C46.4943 26.9314 48.0715 25.1711 50.13 25.0581L125.113 20.9411C127.172 20.8281 128.932 22.4052 129.045 24.4637C129.158 26.5222 127.581 28.2826 125.523 28.3956L50.5392 32.5125C48.4807 32.6256 46.7204 31.0484 46.6074 28.9899Z" fill={`url(#${h}p2)`} />
          <path d="M47.3779 43.0221C47.318 41.9323 48.153 41.0003 49.2428 40.9405L83.4123 39.0644C84.5021 39.0046 85.434 39.8395 85.4939 40.9293C85.5537 42.0191 84.7187 42.9511 83.629 43.0109L49.4595 44.887C48.3697 44.9468 47.4377 44.1119 47.3779 43.0221Z" fill={`url(#${h}p3)`} />
          <path d="M47.8836 52.2311C47.8238 51.1413 48.6587 50.2093 49.7485 50.1495L83.918 48.2734C85.0078 48.2136 85.9398 49.0485 85.9996 50.1383C86.0594 51.2281 85.2245 52.1601 84.1347 52.2199L49.9652 54.096C48.8754 54.1558 47.9434 53.3209 47.8836 52.2311Z" fill={`url(#${h}p4)`} />
          <path d="M48.389 61.4391C48.3291 60.3493 49.1641 59.4173 50.2539 59.3575L84.4234 57.4814C85.5132 57.4216 86.4451 58.2565 86.505 59.3463C86.5648 60.4361 85.7299 61.3681 84.6401 61.4279L50.4706 63.304C49.3808 63.3638 48.4488 62.5289 48.389 61.4391Z" fill={`url(#${h}p5)`} />
          <path d="M48.8945 70.649C48.8346 69.5592 49.6696 68.6273 50.7594 68.5674L84.9289 66.6914C86.0187 66.6315 86.9506 67.4665 87.0105 68.5563C87.0703 69.6461 86.2353 70.578 85.1456 70.6379L50.9761 72.5139C49.8863 72.5738 48.9543 71.7388 48.8945 70.649Z" fill={`url(#${h}p6)`} />
          <path d="M49.4002 79.8561C49.3404 78.7663 50.1753 77.8343 51.2651 77.7745L85.4346 75.8984C86.5244 75.8386 87.4564 76.6735 87.5162 77.7633C87.576 78.8531 86.7411 79.7851 85.6513 79.8449L51.4818 81.721C50.392 81.7808 49.46 80.9459 49.4002 79.8561Z" fill={`url(#${h}p7)`} />
          <path d="M49.9058 89.065C49.846 87.9752 50.6809 87.0433 51.7707 86.9835L85.9402 85.1074C87.03 85.0476 87.962 85.8825 88.0218 86.9723C88.0816 88.0621 87.2467 88.994 86.1569 89.0539L51.9874 90.93C50.8976 90.9898 49.9657 90.1548 49.9058 89.065Z" fill={`url(#${h}p8)`} />
          <path d="M50.4113 98.2731C50.3515 97.1833 51.1864 96.2513 52.2762 96.1915L86.4457 94.3154C87.5355 94.2556 88.4675 95.0905 88.5273 96.1803C88.5871 97.2701 87.7522 98.2021 86.6624 98.2619L52.4929 100.138C51.4031 100.198 50.4712 99.3628 50.4113 98.2731Z" fill={`url(#${h}p9)`} />
          <path d="M51.0854 110.551C51.0256 109.462 51.8605 108.53 52.9503 108.47L87.1198 106.594C88.2096 106.534 89.1415 107.369 89.2014 108.459C89.2612 109.548 88.4263 110.48 87.3365 110.54L53.167 112.416C52.0772 112.476 51.1452 111.641 51.0854 110.551Z" fill={`url(#${h}p10)`} />
          <path d="M51.5911 119.76C51.5313 118.671 52.3662 117.739 53.456 117.679L87.6255 115.803C88.7153 115.743 89.6473 116.578 89.7071 117.668C89.7669 118.757 88.932 119.689 87.8422 119.749L53.6727 121.625C52.5829 121.685 51.651 120.85 51.5911 119.76Z" fill={`url(#${h}p11)`} />
          <path d="M52.0966 128.969C52.0368 127.88 52.8717 126.948 53.9615 126.888L88.131 125.012C89.2208 124.952 90.1528 125.787 90.2126 126.877C90.2724 127.966 89.4375 128.898 88.3477 128.958L54.1782 130.834C53.0884 130.894 52.1565 130.059 52.0966 128.969Z" fill={`url(#${h}p12)`} />
          <path d="M91.6993 40.5885C91.6394 39.4987 92.4744 38.5667 93.5642 38.5069L127.734 36.6308C128.823 36.571 129.755 37.4059 129.815 38.4957C129.875 39.5855 129.04 40.5175 127.95 40.5773L93.7809 42.4534C92.6911 42.5132 91.7591 41.6783 91.6993 40.5885Z" fill={`url(#${h}p13)`} />
          <path d="M92.2049 49.7975C92.1451 48.7077 92.98 47.7757 94.0698 47.7159L128.239 45.8398C129.329 45.78 130.261 46.6149 130.321 47.7047C130.381 48.7945 129.546 49.7265 128.456 49.7863L94.2865 51.6624C93.1967 51.7222 92.2647 50.8873 92.2049 49.7975Z" fill={`url(#${h}p14)`} />
          <path d="M92.7106 59.0065C92.6508 57.9167 93.4857 56.9847 94.5755 56.9249L128.745 55.0488C129.835 54.989 130.767 55.8239 130.827 56.9137C130.886 58.0035 130.052 58.9355 128.962 58.9953L94.7922 60.8714C93.7024 60.9312 92.7705 60.0962 92.7106 59.0065Z" fill={`url(#${h}p15)`} />
          <path d="M93.2161 68.2145C93.1563 67.1247 93.9912 66.1927 95.081 66.1329L129.251 64.2568C130.34 64.197 131.272 65.0319 131.332 66.1217C131.392 67.2115 130.557 68.1435 129.467 68.2033L95.2977 70.0794C94.2079 70.1392 93.276 69.3043 93.2161 68.2145Z" fill={`url(#${h}p16)`} />
          <path d="M93.7219 77.4225C93.662 76.3327 94.497 75.4007 95.5868 75.3409L129.756 73.4648C130.846 73.405 131.778 74.2399 131.838 75.3297C131.898 76.4195 131.063 77.3515 129.973 77.4113L95.8035 79.2874C94.7137 79.3472 93.7817 78.5123 93.7219 77.4225Z" fill={`url(#${h}p17)`} />
          <path d="M94.2272 86.6324C94.1674 85.5426 95.0023 84.6107 96.0921 84.5508L130.262 82.6748C131.351 82.6149 132.283 83.4499 132.343 84.5397C132.403 85.6295 131.568 86.5614 130.478 86.6213L96.3088 88.4973C95.219 88.5572 94.2871 87.7222 94.2272 86.6324Z" fill={`url(#${h}p18)`} />
          <path d="M94.7329 95.8395C94.673 94.7497 95.508 93.8177 96.5978 93.7579L130.767 91.8818C131.857 91.822 132.789 92.6569 132.849 93.7467C132.909 94.8365 132.074 95.7685 130.984 95.8283L96.8144 97.7044C95.7246 97.7642 94.7927 96.9293 94.7329 95.8395Z" fill={`url(#${h}p19)`} />
          <path d="M95.2114 108.129C95.1515 107.039 95.9865 106.107 97.0763 106.047L131.246 104.171C132.336 104.111 133.268 104.946 133.327 106.036C133.387 107.126 132.552 108.058 131.462 108.117L97.293 109.993C96.2032 110.053 95.2712 109.218 95.2114 108.129Z" fill={`url(#${h}p20)`} />
          <path d="M95.7171 117.337C95.6573 116.247 96.4922 115.315 97.582 115.255L131.751 113.379C132.841 113.319 133.773 114.154 133.833 115.244C133.893 116.334 133.058 117.266 131.968 117.325L97.7987 119.201C96.7089 119.261 95.7769 118.426 95.7171 117.337Z" fill={`url(#${h}p21)`} />
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

        {/* ── hover state defs ── */}
        <filter id={`${h}f`} x="35.3068" y="9.64088" width="119.312" height="142.934" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
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
        <linearGradient id={`${h}p0`} x1="137.28" y1="78.457" x2="37.1512" y2="77.5787" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-border)" /><stop offset="1" stopColor="var(--il-doc-bg)" />
        </linearGradient>
        <linearGradient id={`${h}p1`} x1="137.539" y1="17.0714" x2="37.1512" y2="142.135" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-bg)" /><stop offset="1" stopColor="var(--il-doc-border)" />
        </linearGradient>
        <linearGradient id={`${h}p2`} x1="46.6074" y1="28.9899" x2="129.045" y2="24.4637" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${h}p3`} x1="47.3779" y1="43.0221" x2="85.4939" y2="40.9293" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${h}p4`} x1="47.8836" y1="52.2311" x2="85.9996" y2="50.1383" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${h}p5`} x1="48.389" y1="61.4391" x2="86.505" y2="59.3463" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${h}p6`} x1="48.8945" y1="70.649" x2="87.0105" y2="68.5563" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${h}p7`} x1="49.4002" y1="79.8561" x2="87.5162" y2="77.7633" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${h}p8`} x1="49.9058" y1="89.065" x2="88.0218" y2="86.9723" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${h}p9`} x1="50.4113" y1="98.2731" x2="88.5273" y2="96.1803" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${h}p10`} x1="51.0854" y1="110.551" x2="89.2014" y2="108.459" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${h}p11`} x1="51.5911" y1="119.76" x2="89.7071" y2="117.668" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${h}p12`} x1="52.0966" y1="128.969" x2="90.2126" y2="126.877" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${h}p13`} x1="91.6993" y1="40.5885" x2="129.815" y2="38.4957" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${h}p14`} x1="92.2049" y1="49.7975" x2="130.321" y2="47.7047" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${h}p15`} x1="92.7106" y1="59.0065" x2="130.827" y2="56.9137" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${h}p16`} x1="93.2161" y1="68.2145" x2="131.332" y2="66.1217" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${h}p17`} x1="93.7219" y1="77.4225" x2="131.838" y2="75.3297" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${h}p18`} x1="94.2272" y1="86.6324" x2="132.343" y2="84.5397" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${h}p19`} x1="94.7329" y1="95.8395" x2="132.849" y2="93.7467" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${h}p20`} x1="95.2114" y1="108.129" x2="133.327" y2="106.036" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
        <linearGradient id={`${h}p21`} x1="95.7171" y1="117.337" x2="133.833" y2="115.244" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--il-doc-line)" /><stop offset="1" stopColor="var(--il-doc-line)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function RecentlyViewedCard({ item, onClick }: Props) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, "");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const el = document.documentElement;
    setIsDark(el.classList.contains("dark"));
    const obs = new MutationObserver(() => setIsDark(el.classList.contains("dark")));
    obs.observe(el, { attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const shadowOpacity = isDark ? 0.16 : 0.07;

  return (
    <button
      onClick={onClick}
      className="group flex flex-col gap-[14px] text-left cursor-pointer shrink-0"
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
