"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { SearchInput } from "@/components/ui/search-input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { FilterSelect } from "@/components/ui/filter-select";
import { MODULES } from "@/lib/training-mock";
import { InProgressCard, ModuleCard } from "@/components/training/ModuleCard";

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
