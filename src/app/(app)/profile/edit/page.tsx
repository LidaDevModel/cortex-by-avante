"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { showToast } from "@/components/ui/toast";

export default function ProfileEditPage() {
  const router = useRouter();

  return (
    <div className="relative flex flex-col h-full overflow-hidden canvas-glow">
      <PageHeader crumbs={[{ label: "Profile", href: "/profile" }, { label: "Edit" }]} className="bg-transparent" />

      <ScrollCanvas>
        <div className="max-w-[400px] mx-auto px-4 pt-8 pb-12 flex flex-col gap-6">
          <h1 className="text-[28px] leading-[36px] font-bold text-foreground">Edit profile</h1>
          <ProfileForm
            mode="edit"
            onDone={() => {
              showToast({ title: "Profile updated." });
              router.push("/profile");
            }}
          />
        </div>
      </ScrollCanvas>
    </div>
  );
}
