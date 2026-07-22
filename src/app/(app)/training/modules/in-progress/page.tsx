"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { PageHeader } from "@/components/ui/page-header";
import { ModuleIllustration } from "@/components/training/ModuleIllustration";
import Link from "next/link";
import { FilterSelect } from "@/components/ui/filter-select";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ScrollCanvas } from "@/components/ui/scroll-canvas";
import { getPersona } from "@/lib/demo-persona";

/* ─── Types ─── */

type ModuleCategory = "first-aid" | "escalations" | "clients" | "incidents";

type Module = {
  id: string;
  title: string;
  chapters: number;
  hours: number;
  progress: number;
  required: boolean;
  category: ModuleCategory;
};

/* ─── Mock data (in-progress modules only) ─── */


const IN_PROGRESS_MODULES: Module[] = [
  { id: "1", title: "Escalation Procedures 1",  chapters: 6, hours: 2, progress: 10, required: true,  category: "escalations" },
  { id: "2", title: "First Aid Awareness 1",    chapters: 6, hours: 2, progress: 90, required: false, category: "first-aid" },
  { id: "3", title: "Incident Response 1",      chapters: 6, hours: 2, progress: 37, required: true,  category: "incidents" },
  { id: "4", title: "Client Protocols 1",       chapters: 6, hours: 2, progress: 90, required: true,  category: "clients" },
];

const ILLUSTRATION_GLOW_CARD = "var(--illustration-glow-card)";

/* ─── Sub-components ─── */

function RequiredPill({ required }: { required: boolean }) {
  if (required) {
    return (
      <span
        className="self-start text-[11px] leading-[16px] font-medium px-2 py-0.5 rounded-full border shrink-0"
        style={{ borderColor: "color-mix(in srgb, var(--primary) 30%, transparent)", color: "var(--primary)" }}
      >
        Required
      </span>
    );
  }
  return (
    <span className="self-start text-[11px] leading-[16px] font-medium px-2 py-0.5 rounded-full border border-border text-muted-foreground shrink-0">
      Optional
    </span>
  );
}

function InProgressCard({ module }: { module: Module }) {
  return (
    <Link
      href={`/training/modules/${module.id}`}
      className="relative flex flex-col rounded-[12px] overflow-hidden cursor-pointer bg-[var(--surface-raised)] hover:shadow-md dark:hover:shadow-none dark:hover:bg-[var(--card-hover-bg)] transition-[box-shadow,background-color] duration-150"
      style={{ border: "1px solid var(--border)" }}
    >
      <div className="relative flex items-center justify-center" style={{ height: 157 }}>
        <div className="absolute inset-x-0 top-0 pointer-events-none z-0" style={{ height: "calc(100% + 600px)", background: ILLUSTRATION_GLOW_CARD }} />
        <ModuleIllustration category={module.category} width={80} height={80} className="relative object-contain z-10" />
      </div>
      <div className="relative z-10 flex flex-col gap-2 px-3 pt-3 pb-3">
        <p className="text-[14px] leading-[20px] font-semibold" style={{ color: "var(--primary)" }}>
          {module.title}
        </p>
        <p className="text-[12px] leading-[16px] text-muted-foreground">
          {module.chapters} chapters · {module.hours}h
        </p>
        <ProgressBar value={module.progress} />
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] leading-[16px] text-muted-foreground">
            {module.progress}% complete
          </span>
          <RequiredPill required={module.required} />
        </div>
      </div>
    </Link>
  );
}

/* ─── Page ─── */

export default function InProgressPage() {
  const [categoryFilter, setCategoryFilter] = useState("");
  const [requirementFilter, setRequirementFilter] = useState("");
  const [search, setSearch] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleScroll = useCallback(() => {
    scrollRef.current?.classList.add("is-scrolling");
    clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => scrollRef.current?.classList.remove("is-scrolling"), 800);
  }, []);

  // A new guard has nothing in progress; Mike sees his real list.
  const sourceModules = useMemo(() => (getPersona() === "new" ? [] : IN_PROGRESS_MODULES), []);

  const filtered = useMemo(() => {
    let list = sourceModules;
    if (requirementFilter === "required") list = list.filter((m) => m.required);
    else if (requirementFilter === "optional") list = list.filter((m) => !m.required);
    if (categoryFilter) list = list.filter((m) => m.category === categoryFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((m) => m.title.toLowerCase().includes(q));
    }
    return list;
  }, [sourceModules, requirementFilter, categoryFilter, search]);

  return (
    <div className="relative flex flex-col h-full overflow-hidden" style={{ background: "var(--surface)" }}>

      {/* Header — shared PageHeader (breadcrumb on desktop, quiet on mobile) */}
      <PageHeader
        crumbs={[
          { label: "Training", href: "/training/modules" },
          { label: "Modules", href: "/training/modules" },
          { label: "In progress" },
        ]}
      />

      {/* Scrollable canvas */}
      <ScrollCanvas ref={scrollRef} onScroll={handleScroll}>
          <div className="max-w-[920px] mx-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-8">

            {/* Title */}
            <div className="flex flex-col gap-1">
              <Link
                href="/training/modules"
                className="flex items-center gap-1.5 w-fit text-[13px] leading-[20px] text-muted-foreground hover:text-foreground transition-colors duration-100 mb-1"
              >
                <ArrowLeft size={14} strokeWidth={2} />
                <span>Back to modules</span>
              </Link>
              <h1 className="text-[28px] leading-[36px] font-bold text-foreground">
                In progress
              </h1>
              <p className="text-[13px] leading-[20px] text-muted-foreground">
                {sourceModules.length} module{sourceModules.length !== 1 ? "s" : ""} in progress
              </p>
            </div>

            {/* Search + filters */}
            <div className="flex items-center justify-between gap-2">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search in progress modules..."
                className="w-full sm:w-[280px]"
              />
              <div className="flex items-center gap-1 shrink-0">
                <FilterSelect
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  placeholder="All categories"
                  className="w-[148px]"
                  options={[
                    { value: "first-aid", label: "First aid" },
                    { value: "escalations", label: "Escalations" },
                    { value: "clients", label: "Clients" },
                    { value: "incidents", label: "Incidents" },
                  ]}
                />
                <FilterSelect
                  value={requirementFilter}
                  onChange={setRequirementFilter}
                  placeholder="Show all"
                  className="w-[110px]"
                  options={[
                    { value: "required", label: "Required" },
                    { value: "optional", label: "Optional" },
                  ]}
                />
              </div>
            </div>

            {/* Card grid */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-3 gap-6">
                {filtered.map((m) => (
                  <InProgressCard key={m.id} module={m} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-[15px] leading-[24px] text-muted-foreground">
                  No modules match your filters.
                </p>
              </div>
            )}

          </div>
      </ScrollCanvas>
    </div>
  );
}
