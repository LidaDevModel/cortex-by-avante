"use client";

import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BranchingScenario, BranchingNode, BranchingOption } from "@/lib/exam-mock";

type NodeState = "locked" | "current" | "visited" | "end";

type Props = {
  scenario: BranchingScenario;
  decisions: Record<string, string>; // nodeId → optionId chosen
  isCompleted: boolean;
  onDecision: (nodeId: string, optionId: string) => void;
  onComplete: (lastNodeId: string, lastOptionId: string) => void;
  mapVariant?: "card" | "plain";
};

function getNodeState(
  node: BranchingNode,
  currentNodeId: string,
  decisions: Record<string, string>
): NodeState {
  if (node.type === "end") return "end";
  if (node.id === currentNodeId) return "current";
  if (decisions[node.id]) return "visited";
  return "locked";
}

// Simple linear layout positions for up to 5 nodes
function getNodePositions(nodes: BranchingNode[]): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};
  const step = 1 / (nodes.length - 1);
  nodes.forEach((n, i) => {
    positions[n.id] = { x: 0.1 + i * step * 0.8, y: 0.5 };
  });
  return positions;
}

type SVGMapProps = {
  scenario: BranchingScenario;
  currentNodeId: string;
  decisions: Record<string, string>;
  animatingEdge: string | null; // "nodeId→nextId"
};

function DecisionMap({ scenario, currentNodeId, decisions, animatingEdge }: SVGMapProps) {
  const W = 600;
  const H = 84;
  const R = 22;

  // Build ordered list — skip start node, begin from first decision/end node
  const startNode = scenario.nodes.find(n => n.id === scenario.startNodeId);
  const firstId = startNode?.nextId ?? scenario.startNodeId;
  const orderedIds: string[] = [firstId];
  let cur: BranchingNode | undefined = scenario.nodes.find(n => n.id === firstId);
  while (cur) {
    const decision = decisions[cur.id];
    const option = cur.options?.find(o => o.id === decision);
    const nextId = option?.nextNodeId ?? cur.nextId;
    if (!nextId) break;
    orderedIds.push(nextId);
    cur = scenario.nodes.find(n => n.id === nextId);
  }
  // Add future locked nodes by following nextId from the last node in the path
  let tail: BranchingNode | undefined = scenario.nodes.find(n => n.id === orderedIds[orderedIds.length - 1]);
  while (tail) {
    const nextId = tail.nextId;
    if (!nextId || orderedIds.includes(nextId)) break;
    orderedIds.push(nextId);
    tail = scenario.nodes.find(n => n.id === nextId);
  }

  const posMap: Record<string, { x: number; y: number }> = {};
  const total = orderedIds.length;
  orderedIds.forEach((id, i) => {
    posMap[id] = {
      x: (W / (total + 1)) * (i + 1),
      y: 34,
    };
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="100%"
      style={{ overflow: "visible" }}
    >
      {/* Edges */}
      {orderedIds.slice(0, -1).map((id, i) => {
        const nextId = orderedIds[i + 1];
        const a = posMap[id];
        const b = posMap[nextId];
        const edgeKey = `${id}→${nextId}`;
        const isAnimating = animatingEdge === edgeKey;
        const srcNode = scenario.nodes.find(n => n.id === id);
        const srcState = getNodeState(srcNode!, currentNodeId, decisions);
        const isTraced = srcState === "visited";

        return (
          <g key={edgeKey}>
            {/* Base line */}
            <line
              x1={a.x + R}
              y1={a.y}
              x2={b.x - R}
              y2={b.y}
              stroke="var(--border)"
              strokeWidth={2}
            />
            {/* Traced line */}
            {(isTraced || isAnimating) && (
              <line
                x1={a.x + R}
                y1={a.y}
                x2={b.x - R}
                y2={b.y}
                stroke="var(--primary)"
                strokeWidth={2.5}
                strokeDasharray={isAnimating ? "200" : "none"}
                strokeDashoffset={isAnimating ? "200" : "0"}
                style={isAnimating ? { animation: "dash-trace 500ms ease-out forwards" } : {}}
              />
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {orderedIds.map((id) => {
        const node = scenario.nodes.find((n) => n.id === id)!;
        const pos = posMap[id];
        const state = getNodeState(node, currentNodeId, decisions);

        if (node.type === "end") {
          const isReached = state === "current" || state === "visited";
          const s = R * 1.2;
          return (
            <g key={id} transform={`translate(${pos.x}, ${pos.y})`}>
              <polygon
                points={`0,${-s} ${s},0 0,${s} ${-s},0`}
                fill={isReached ? "color-mix(in srgb, var(--primary) 15%, var(--surface-raised))" : "var(--surface-raised)"}
                stroke={isReached ? "var(--primary)" : "var(--border)"}
                strokeWidth={isReached ? 2.5 : 1.5}
              />
              {/* Inner dot — signals this is terminal, not an empty step */}
              <circle
                r={4}
                fill={isReached ? "var(--primary)" : "var(--border)"}
              />
            </g>
          );
        }

        return (
          <g
            key={id}
            transform={`translate(${pos.x}, ${pos.y})`}
            style={
              state === "current"
                ? { animation: "node-pulse 2s ease-in-out infinite" }
                : {}
            }
          >
            <circle
              r={R}
              fill={
                state === "current"
                  ? "var(--accent-subtle)"
                  : state === "visited"
                  ? "color-mix(in srgb, var(--primary) 15%, var(--surface-raised))"
                  : "var(--surface-raised)"
              }
              stroke={
                state === "current"
                  ? "var(--primary)"
                  : state === "visited"
                  ? "var(--primary)"
                  : "var(--border)"
              }
              strokeWidth={state === "current" ? 2.5 : 1.5}
              style={state === "current" ? { animation: "node-pulse-ring 2s ease-in-out infinite" } : {}}
            />
            {state === "locked" && (
              <g transform="translate(-6,-6)">
                <Lock size={12} color="var(--muted-foreground)" strokeWidth={1.5} />
              </g>
            )}
            {state === "visited" && (
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="11"
                fontWeight="600"
                fill="var(--primary)"
              >
                ✓
              </text>
            )}
          </g>
        );
      })}

      {/* Labels */}
      {orderedIds.map((id) => {
        const node = scenario.nodes.find((n) => n.id === id)!;
        const pos = posMap[id];
        const state = getNodeState(node, currentNodeId, decisions);
        if (state === "locked") return null;
        return (
          <text
            key={`label-${id}`}
            x={pos.x}
            y={pos.y + R + 14}
            textAnchor="middle"
            fontSize="11"
            fill="var(--muted-foreground)"
            fontFamily="inherit"
          >
            {node.label}
          </text>
        );
      })}

      <style>{`
        @keyframes dash-trace {
          to { stroke-dashoffset: 0; }
        }
        @keyframes node-pulse-ring {
          0%, 100% { r: ${R}; opacity: 1; }
          50% { r: ${R + 3}; opacity: 0.8; }
        }
      `}</style>
    </svg>
  );
}

export function BranchingGame({ scenario, decisions, isCompleted, onDecision, onComplete, mapVariant = "plain" }: Props) {
  // Start at the first decision node, not the start placeholder
  const firstDecisionNode = scenario.nodes.find((n) => n.type === "decision");
  const endNode = scenario.nodes.find((n) => n.type === "end");
  const [currentNodeId, setCurrentNodeId] = useState(() => {
    if (isCompleted) return endNode?.id ?? firstDecisionNode?.id ?? scenario.startNodeId;
    // Walk decisions forward to find the first undecided node
    let nodeId = firstDecisionNode?.id ?? scenario.startNodeId;
    while (decisions[nodeId]) {
      const node = scenario.nodes.find((n) => n.id === nodeId);
      const option = node?.options?.find((o) => o.id === decisions[nodeId]);
      const nextId = option?.nextNodeId;
      if (!nextId) break;
      const nextNode = scenario.nodes.find((n) => n.id === nextId);
      if (!nextNode || nextNode.type === "end") return nextId;
      nodeId = nextId;
    }
    return nodeId;
  });
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [animatingEdge, setAnimatingEdge] = useState<string | null>(null);

  const currentNode = scenario.nodes.find((n) => n.id === currentNodeId)!;
  const isDecisionNode = currentNode.type === "decision";

  function handleConfirm() {
    if (!selectedOption || locked) return;
    setLocked(true);

    const option = currentNode.options?.find((o) => o.id === selectedOption);
    if (!option) return;

    onDecision(currentNodeId, selectedOption);

    const edgeKey = `${currentNodeId}→${option.nextNodeId}`;
    const lastNodeId = currentNodeId;
    const lastOptionId = selectedOption;
    setAnimatingEdge(edgeKey);

    setTimeout(() => {
      setAnimatingEdge(null);
      const nextNode = scenario.nodes.find((n) => n.id === option.nextNodeId);
      if (nextNode?.type === "end") {
        onComplete(lastNodeId, lastOptionId);
      } else {
        setCurrentNodeId(option.nextNodeId);
        setSelectedOption(null);
        setLocked(false);
      }
    }, 600);
  }

  const isCard = mapVariant === "card";

  if (isCompleted) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {isCard ? (
          <div className="shrink-0 w-full">
            <div className="max-w-[640px] mx-auto px-4 sm:px-8 pt-6">
              <div style={{ width: "100%", height: 84 }}>
                  <DecisionMap scenario={scenario} currentNodeId={endNode?.id ?? ""} decisions={decisions} animatingEdge={null} />
                </div>
            </div>
          </div>
        ) : (
          <div className="shrink-0 max-w-[640px] mx-auto w-full px-4 sm:px-8">
            <div style={{ width: "100%", height: 84 }}>
              <DecisionMap scenario={scenario} currentNodeId={endNode?.id ?? ""} decisions={decisions} animatingEdge={null} />
            </div>
          </div>
        )}
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 sm:px-8">
          <p className="text-[14px] font-medium text-[var(--primary)]">Scenario completed</p>
          <p className="text-[13px] text-muted-foreground text-center max-w-[400px]">
            Your decisions have been recorded and cannot be changed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Decision map — plain variant stays fixed outside scroll */}
      {!isCard && (
        <div className="shrink-0 max-w-[640px] mx-auto w-full px-4 sm:px-8">
          <div style={{ width: "100%", height: 84 }}>
            <DecisionMap scenario={scenario} currentNodeId={currentNodeId} decisions={decisions} animatingEdge={animatingEdge} />
          </div>
        </div>
      )}

      {/* Decision zone */}
      <div className="flex-1 overflow-y-auto scroll-thin" style={isCard ? { maskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 48px), transparent 100%)" } : {}}>
        <div className={`max-w-[640px] mx-auto px-4 sm:px-8 flex flex-col gap-6 ${isCard ? "py-8" : "pt-4 pb-8"}`}>
          {/* Card variant map — inside scroll so alignment matches options exactly */}
          {isCard && (
            <div style={{ width: "100%", height: 84 }}>
              <DecisionMap scenario={scenario} currentNodeId={currentNodeId} decisions={decisions} animatingEdge={animatingEdge} />
            </div>
          )}
          {isDecisionNode && (
            <>
              <p
                className="text-[15px] leading-[24px] text-foreground animate-in fade-in slide-in-from-bottom-2 duration-200"
                style={{ animationTimingFunction: "ease-out" }}
              >
                {currentNode.scenarioText}
              </p>

              <div className="flex flex-col gap-3">
                {currentNode.options?.map((option) => {
                  const isSelected = selectedOption === option.id;
                  const isConfirmed = locked && isSelected;
                  const isDisabled = locked && !isSelected;

                  return (
                    <button
                      key={option.id}
                      onClick={() => !locked && setSelectedOption(option.id)}
                      disabled={isDisabled}
                      className={cn(
                        "w-full text-left px-4 py-3.5 rounded-[12px] border-2 text-[14px] leading-[20px] transition-all duration-150",
                        isConfirmed
                          ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] cursor-default"
                          : isSelected
                          ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] cursor-pointer"
                          : isDisabled
                          ? "border-border bg-[var(--surface-raised)] opacity-40 cursor-not-allowed"
                          : "border-border bg-[var(--surface-raised)] hover:border-[color-mix(in_srgb,var(--primary)_40%,transparent)] cursor-pointer"
                      )}
                    >
                      {option.text}
                    </button>
                  );
                })}
              </div>

              {selectedOption && !locked && (
                <div className="flex justify-end animate-in fade-in duration-150">
                  <button
                    onClick={handleConfirm}
                    className="h-10 px-6 rounded-[8px] bg-[var(--primary)] text-[var(--primary-foreground)] text-[14px] font-medium hover:opacity-90 transition-opacity duration-100 cursor-pointer"
                  >
                    Confirm decision
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
