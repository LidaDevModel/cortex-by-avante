"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModuleIllustration } from "@/components/training/ModuleIllustration";
import Link from "next/link";
import { FilterSelect } from "@/components/ui/filter-select";
import { ProgressBar } from "@/components/ui/progress-bar";

/* ─── Types ─── */

type ModuleStatus = "not-started" | "in-progress" | "completed";
type ModuleCategory = "first-aid" | "escalations" | "clients" | "incidents";

type Module = {
  id: string;
  title: string;
  chapters: number;
  hours: number;
  progress: number; // 0-100
  status: ModuleStatus;
  required: boolean;
  category: ModuleCategory;
};

/* ─── Mock data ─── */


const MODULES: Module[] = [
  { id: "1", title: "Escalation Procedures 1", chapters: 6, hours: 2, progress: 10, status: "in-progress", required: true, category: "escalations" },
  { id: "2", title: "First Aid Awareness 1", chapters: 6, hours: 2, progress: 90, status: "in-progress", required: false, category: "first-aid" },
  { id: "3", title: "Incident Response 1", chapters: 6, hours: 2, progress: 37, status: "in-progress", required: true, category: "incidents" },
  { id: "4", title: "Client Protocols 1", chapters: 6, hours: 2, progress: 90, status: "in-progress", required: true, category: "clients" },
  { id: "5", title: "Security Protocols 1", chapters: 6, hours: 2, progress: 0, status: "not-started", required: true, category: "incidents" },
  { id: "6", title: "Guard Duty Fundamentals", chapters: 4, hours: 1, progress: 0, status: "not-started", required: true, category: "clients" },
  { id: "7", title: "Emergency Procedures 1", chapters: 5, hours: 2, progress: 0, status: "not-started", required: false, category: "escalations" },
  { id: "8", title: "First Aid Awareness 2", chapters: 6, hours: 2, progress: 100, status: "completed", required: true, category: "first-aid" },
  { id: "9", title: "Client Protocols 2", chapters: 4, hours: 1, progress: 0, status: "not-started", required: false, category: "clients" },
];

/* ─── Sub-components ─── */


const CARD_BG = "var(--surface-raised)";
const ILLUSTRATION_GLOW = "var(--illustration-glow)";
const ILLUSTRATION_GLOW_SIDE = "var(--illustration-glow-side)";
const ILLUSTRATION_GLOW_CARD = "var(--illustration-glow-card)";
const ILLUSTRATION_GLOW_SIDE_CARD = "var(--illustration-glow-side-card)";


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

/* Large card used in the In Progress section */
function InProgressCard({ module }: { module: Module }) {
  return (
    <Link
      href={`/training/modules/${module.id}`}
      className="relative flex flex-col rounded-[12px] overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-150"
      style={{ background: CARD_BG, border: "1px solid var(--border)" }}
    >
      {/* Illustration area — gradient anchored to icon zone, bleeds into card body below */}
      <div className="relative flex items-center justify-center" style={{ height: 157 }}>
        <div className="absolute inset-x-0 top-0 pointer-events-none z-0" style={{ height: "calc(100% + 600px)", background: ILLUSTRATION_GLOW_CARD }} />
        <ModuleIllustration category={module.category} width={80} height={80} className="relative object-contain z-10" />
      </div>

      {/* Content — z-10 so it sits above the bleeding gradient */}
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
            {module.status === "completed" ? "Completed" : module.status === "not-started" ? "Not started" : `${module.progress}% complete`}
          </span>
          <RequiredPill required={module.required} />
        </div>
      </div>
    </Link>
  );
}

/* Compact card used in the main module list */
function ModuleCard({ module }: { module: Module }) {
  const showProgress = module.status !== "not-started";
  return (
    <Link
      href={`/training/modules/${module.id}`}
      className="relative flex rounded-[12px] overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-150"
      style={{ background: CARD_BG, border: "1px solid var(--border)" }}
    >
      {/* Illustration column — gradient anchored to icon zone, bleeds rightward into text area */}
      <div className="relative flex items-center justify-center shrink-0" style={{ width: 88 }}>
        <div className="absolute inset-y-0 left-0 pointer-events-none z-0" style={{ width: "calc(100% + 200px)", background: ILLUSTRATION_GLOW_SIDE_CARD }} />
        <ModuleIllustration category={module.category} width={40} height={40} className="relative object-contain z-10" />
      </div>

      {/* Right content — z-10 so it sits above the bleeding gradient */}
      <div className="relative z-10 flex flex-col gap-1.5 min-w-0 flex-1 px-3 py-3">
        <p className="text-[14px] leading-[20px] font-semibold truncate" style={{ color: "var(--primary)" }}>
          {module.title}
        </p>
        <p className="text-[12px] leading-[16px] text-muted-foreground whitespace-nowrap">
          {module.chapters} chapters · {module.hours}h
        </p>
        {showProgress ? (
          <div className="flex items-center gap-2">
            <div className="flex-1"><ProgressBar value={module.progress} /></div>
            <span className="text-[12px] leading-[16px] text-muted-foreground shrink-0 w-8 text-right">
              {module.status === "completed" ? "100%" : `${module.progress}%`}
            </span>
          </div>
        ) : (
          <span className="text-[12px] leading-[16px] text-muted-foreground">Not started</span>
        )}
        <RequiredPill required={module.required} />
      </div>
    </Link>
  );
}

/* ─── Page ─── */

export default function ModulesPage() {
  const [requirementFilter, setRequirementFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const handleScroll = useCallback(() => {
    scrollRef.current?.classList.add("is-scrolling");
    clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => scrollRef.current?.classList.remove("is-scrolling"), 800);
  }, []);

  const inProgress = useMemo(
    () => MODULES.filter((m) => m.status === "in-progress").slice(0, 3),
    []
  );

  const totalInProgress = MODULES.filter((m) => m.status === "in-progress").length;

  const filteredModules = useMemo(() => {
    let list = MODULES;

    if (requirementFilter === "required") list = list.filter((m) => m.required);
    else if (requirementFilter === "optional") list = list.filter((m) => !m.required);

    if (statusFilter === "in-progress") list = list.filter((m) => m.status === "in-progress");
    else if (statusFilter === "completed") list = list.filter((m) => m.status === "completed");
    else if (statusFilter === "not-started") list = list.filter((m) => m.status === "not-started");

    if (categoryFilter) list = list.filter((m) => m.category === categoryFilter);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((m) => m.title.toLowerCase().includes(q));
    }

    return list;
  }, [requirementFilter, statusFilter, categoryFilter, search]);

  return (
    <div className="relative flex flex-col h-full overflow-hidden" style={{ background: "var(--surface)" }}>

      {/* Header */}
      <header className="relative z-10 flex items-center gap-2 px-4 h-14 shrink-0" style={{ background: "var(--surface)" }}>
        <SidebarTrigger className="-ml-1" />
        <div className="flex items-center gap-1.5 text-[14px] leading-[20px]">
          <span className="text-muted-foreground">Training</span>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium text-foreground">Modules</span>
        </div>
      </header>

      {/* Scrollable canvas */}
      <div className="relative flex-1 overflow-hidden">
        {/* Scrollable content — mask-image fades edges, no border gap */}
        <div ref={scrollRef} onScroll={handleScroll} className="absolute inset-0 overflow-y-auto z-10 scroll-thin" style={{ maskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)" }}>
        <div className="relative max-w-[920px] mx-auto px-8 pt-8 pb-12 flex flex-col gap-8">
          {/* Page title */}
          <h1 className="text-[28px] leading-[36px] font-bold text-foreground">
            Modules
          </h1>

          {/* In Progress section */}
          {inProgress.length > 0 && (
            <section className="flex flex-col gap-4">
              <div className="flex items-baseline justify-between">
                <p className="section-label">
                  In progress
                </p>
                {totalInProgress > 3 && (
                  <Link
                    href="/training/modules/in-progress"
                    className="text-[13px] leading-[16px] font-medium transition-colors duration-100"
                    style={{ color: "var(--primary)" }}
                  >
                    See all
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-3 gap-6">
                {inProgress.map((m) => (
                  <InProgressCard key={m.id} module={m} />
                ))}
              </div>
            </section>
          )}

          {/* Search + filter row */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search modules..."
              className="flex-1"
            />

            {/* Filter pills */}
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
              <FilterSelect
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="All statuses"
                className="w-[132px]"
                options={[
                  { value: "in-progress", label: "In progress" },
                  { value: "completed", label: "Completed" },
                  { value: "not-started", label: "Not started" },
                ]}
              />
            </div>
          </div>

          {/* Module grid */}
          {filteredModules.length > 0 ? (
            <div className="grid grid-cols-3 gap-6">
              {filteredModules.map((m) => (
                <ModuleCard key={m.id} module={m} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-[15px] leading-[24px] text-muted-foreground">
                No modules found.
              </p>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
