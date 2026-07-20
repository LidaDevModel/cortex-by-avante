"use client";

import { useId } from "react";
import { FileIllustration } from "./RecentlyViewedCard";
import { FolderIllustration } from "./FolderIllustration";
import { useTheme } from "@/components/theme-context";

type Props = {
  name: string;
  kind: "document" | "folder";
  lastModified: string;
  onClick?: () => void;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function DocGridCard({ name, kind, lastModified, onClick }: Props) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, "");
  const { isDark } = useTheme();
  const shadowOpacity = isDark ? 0.16 : 0.07;

  return (
    <button
      onClick={onClick}
      className="group flex flex-col gap-3 text-left cursor-pointer w-full transition-transform duration-150 hover:-translate-y-1"
    >
      <div className="w-full px-3">
        {kind === "document" ? (
          <FileIllustration uid={uid} shadowOpacity={shadowOpacity} />
        ) : (
          <FolderIllustration uid={uid} shadowOpacity={shadowOpacity} />
        )}
      </div>
      <div className="flex flex-col gap-0.5 px-1 items-center text-center">
        <span className="text-[14px] leading-[20px] font-medium text-foreground truncate w-full block">
          {name}
        </span>
        <span className="text-[12px] leading-[16px] font-[500] text-muted-foreground">
          {formatDate(lastModified)}
        </span>
      </div>
    </button>
  );
}
