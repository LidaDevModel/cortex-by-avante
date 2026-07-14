"use client";

import { useRef, useState } from "react";
import { Lock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getAuthProfile, saveAuthProfile } from "@/lib/auth-mock";
import { USER } from "@/lib/user-mock";

const MAX_DESCRIPTION = 160;

/**
 * The profile form — first-run onboarding (activation step 3) and the standing
 * /profile/edit screen share it. Editable: photo + short description. Locked:
 * the Avante-provisioned identity (name, email, role), shown read-only so the
 * user sees the system knows who they are — with the escalation path spelled
 * out rather than hidden.
 */
export function ProfileForm({
  mode,
  onDone,
}: {
  mode: "onboarding" | "edit";
  /** Called after save (and after skip, in onboarding). */
  onDone: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState(() => getAuthProfile());

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setProfile((p) => ({ ...p, avatarUrl: String(reader.result) }));
    reader.readAsDataURL(file);
    e.target.value = ""; // same file can be re-picked
  }

  function handleSave() {
    saveAuthProfile({ ...profile, description: profile.description?.trim() || undefined });
    onDone();
  }

  const descriptionLength = profile.description?.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Photo */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 rounded-full shrink-0">
          {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt="" />}
          <AvatarFallback className="rounded-full bg-secondary text-primary font-semibold text-[18px]">
            {USER.initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start gap-1.5">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <Button
            type="button"
            variant="outline"
            className="h-9 border-primary text-primary hover:text-primary"
            onClick={() => fileRef.current?.click()}
          >
            {profile.avatarUrl ? "Change photo" : "Upload photo"}
          </Button>
          {profile.avatarUrl && (
            <button
              type="button"
              onClick={() => setProfile((p) => ({ ...p, avatarUrl: undefined }))}
              className="text-[12px] leading-[16px] text-muted-foreground hover:text-foreground transition-colors duration-100"
            >
              Remove photo
            </button>
          )}
        </div>
      </div>

      {/* Locked identity */}
      <div className="flex flex-col gap-3">
        {(
          [
            ["Full name", USER.fullName],
            ["Email", USER.email],
            ["Role", USER.role],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1">
            <span className="text-[12px] leading-[16px] font-medium text-muted-foreground">{label}</span>
            <div
              className="flex items-center justify-between gap-2 h-10 px-2.5 rounded-[8px] bg-surface-lifted"
              style={{ border: "1px solid transparent" }}
            >
              <span className="text-[14px] leading-[20px] text-foreground truncate">{value}</span>
              <Lock size={14} strokeWidth={1.5} className="text-muted-foreground shrink-0" aria-label="Locked" />
            </div>
          </div>
        ))}
        <p className="text-[12px] leading-[16px] text-muted-foreground">
          These details are managed by Avante — contact your manager to change them.
        </p>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-[14px] leading-[20px] font-semibold text-foreground">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          maxLength={MAX_DESCRIPTION}
          value={profile.description ?? ""}
          onChange={(e) => setProfile((p) => ({ ...p, description: e.target.value }))}
          placeholder="e.g. Night-shift field agent, Harbor site"
          className="w-full resize-none rounded-[8px] border border-input bg-surface px-2.5 py-2 text-[14px] leading-[20px] text-foreground outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <span className="self-end text-[12px] leading-[16px] text-muted-foreground tabular-nums">
          {descriptionLength}/{MAX_DESCRIPTION}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button type="button" size="cta" className="w-full" onClick={handleSave}>
          {mode === "onboarding" ? "Save and continue" : "Save changes"}
        </Button>
        {mode === "onboarding" && (
          <button
            type="button"
            onClick={onDone}
            className="text-[13px] leading-[20px] text-muted-foreground hover:text-foreground transition-colors duration-100 text-center py-1"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
