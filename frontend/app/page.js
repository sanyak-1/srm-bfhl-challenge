"use client";

import { useState, useCallback } from "react";

// ─── Recursive Tree Node ──────────────────────────────────────────────────────
function TreeNode({ label, children, depth = 0, isLast = true, prefix = "" }) {
  const hasChildren = children && Object.keys(children).length > 0;
  const connector = isLast ? "└─" : "├─";
  const childPrefix = prefix + (isLast ? "   " : "│  ");

  return (
    <div className="font-mono text-sm leading-relaxed">
      <div className="flex items-center gap-1 group">
        <span className="text-cyan-600 select-none whitespace-pre">{prefix}{connector}</span>
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold tracking-wider transition-all
            ${depth === 0
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]"
              : depth === 1
              ? "bg-violet-500/15 text-violet-300 border border-violet-500/30"
              : "bg-slate-700/60 text-slate-300 border border-slate-600/40"
            }`}
        >
          {label}
        </span>
      </div>

      {hasChildren && (
        <div>
          {Object.entries(children).map(([key, val], i, arr) => (
            <TreeNode
              key={key}
              label={key}
              children={val}
              depth={depth + 1}
              isLast={i === arr.length - 1}
              prefix={childPrefix}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tree Card ────────────────────────────────────────────────────────────────
function HierarchyCard({ hierarchy, index }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 overflow-hidden shadow-lg backdrop-blur-sm transition-all hover:border-slate-600/80">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-800/80 hover:bg-slate-800 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-500 bg-slate-700/60 px-2 py-0.5 rounded">
            TREE #{index + 1}
          </span>
          <span className="font-semibold text-white tracking-wide">
            Root:{" "}
            <span className="text-cyan-400 font-mono">{hierarchy.root}</span>
          </span>
          {hierarchy.has_cycle && (
            <span className="flex items-center gap-1 text-xs font-medium text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full animate-pulse">
              ⚠ Cycle
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-3 text-xs text-slate-400">
            <span>
              Depth{" "}
              <span className="text-violet-400 font-mono font-bold">
                {hierarchy.depth}
              </span>
            </span>
          </div>
          <span
            className={`text-slate-500 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
          >
            ▶
          </span>
        </div>
      </button>

      {/* Tree Body */}
      {expanded && (
        <div className="px-5 py-4">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3 font-mono">
            Structure
          </p>
          <div className="bg-slate-950/60 rounded-lg border border-slate-800 p-4 overflow-x-auto">
            {Object.keys(hierarchy.tree).length === 0 ? (
              <span className="text-slate-500 font-mono text-sm italic">
                Single node — no children
              </span>
            ) : (
              <div className="space-y-0.5">
                <div className="flex items-center gap-1 font-mono text-sm mb-1">
                  <span className="text-slate-600 select-none">⬤ </span>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                    {hierarchy.root}
                  </span>
                  <span className="text-xs text-slate-500 font-mono ml-1">
                    (root)
                  </span>
                </div>
                {Object.entries(hierarchy.tree).map(([key, val], i, arr) => (
                  <TreeNode
                    key={key}
                    label={key}
                    children={val}
                    depth={1}
                    isLast={i === arr.length - 1}
                    prefix=""
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent, icon }) {
  return (
    <div
      className={`rounded-xl border bg-slate-900/70 p-4 flex flex-col gap-1 shadow-md backdrop-blur-sm transition-all hover:scale-[1.02] ${accent}`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-2xl font-bold font-mono text-white mt-1">
        {value}
      </span>
      <span className="text-xs text-slate-400 font-medium uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

// ─── Badge List ───────────────────────────────────────────────────────────────
function BadgeList({ title, items, color }) {
  if (!items || items.length === 0) return null;

  const colorMap = {
    red: "bg-red-500/10 text-red-300 border-red-500/30",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  };

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-5 shadow-md">
      <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3 font-mono">
        {title}{" "}
        <span className="text-slate-400 normal-case tracking-normal font-normal">
          ({items.length})
        </span>
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={i}
            className={`font-mono text-xs px-3 py-1.5 rounded-lg border ${colorMap[color]}`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const PLACEHOLDER = `["A->B", "A->C", "B->D", "C->D", "E->F"]`;

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = useCallback(async () => {
    setError(null);
    setResult(null);

    // ── Validate JSON ──
    let parsed;
    try {
      parsed = JSON.parse(input.trim());
      if (!Array.isArray(parsed)) throw new Error("Input must be a JSON array.");
    } catch (e) {
      setError(e.message || "Invalid JSON. Please enter a valid JSON array.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/bfhl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: parsed }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error ${res.status}: ${text || res.statusText}`);
      }

      const json = await res.json();
      setResult(json);
    } catch (e) {
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [input]);

  return (
    <main className="min-h-screen bg-[#0a0e1a] text-white selection:bg-cyan-500/30">
      {/* ── Background grid ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Glow blob ── */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12 space-y-8">

        {/* ── Header ── */}
        <header className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
            <span className="text-xs font-mono text-slate-500 tracking-widest uppercase">
              BFHL Full-Stack Challenge
            </span>
          </div>
          <h1
            className="text-3xl font-bold tracking-tight text-white"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Graph{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">
              Hierarchy
            </span>{" "}
            Explorer
          </h1>
          <p className="text-slate-400 text-sm max-w-lg">
            Submit a JSON array of edge strings (e.g.{" "}
            <code className="text-cyan-400 bg-slate-800 px-1 rounded font-mono text-xs">
              "A-&gt;B"
            </code>
            ) to parse and visualise forest hierarchies.
          </p>
        </header>

        {/* ── Input Panel ── */}
        <section className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-5 space-y-3 shadow-lg backdrop-blur-sm">
          <label
            htmlFor="json-input"
            className="text-xs text-slate-500 uppercase tracking-widest font-semibold font-mono block"
          >
            Edge List · JSON Array
          </label>
          <textarea
            id="json-input"
            rows={5}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={PLACEHOLDER}
            className={`w-full rounded-lg bg-slate-950/80 border font-mono text-sm text-slate-200 placeholder-slate-600 px-4 py-3 resize-y outline-none transition-all focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/60
              ${error ? "border-red-500/60" : "border-slate-700/60"}`}
            spellCheck={false}
          />

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <button
              onClick={() => setInput(PLACEHOLDER)}
              className="text-xs text-slate-500 hover:text-slate-300 font-mono underline underline-offset-2 transition-colors"
            >
              load example
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all
                bg-cyan-500 hover:bg-cyan-400 text-slate-900 shadow-[0_0_16px_rgba(6,182,212,0.35)] hover:shadow-[0_0_24px_rgba(6,182,212,0.55)]
                disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-900/40 border-t-slate-900 rounded-full animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <span>▶</span> Submit
                </>
              )}
            </button>
          </div>
        </section>

        {/* ── Error Banner ── */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm text-red-300 shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
            <span className="text-red-400 text-base mt-0.5">✕</span>
            <div>
              <p className="font-semibold text-red-200 mb-0.5">Error</p>
              <p className="font-mono text-xs opacity-90">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-200 text-lg leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* ── Results ── */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Identity row */}
            <div className="flex flex-wrap gap-2 items-center text-xs font-mono">
              <span className="text-slate-500">user</span>
              <span className="bg-slate-800 border border-slate-700 text-slate-300 px-2 py-1 rounded">
                {result.user_id}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-500">email</span>
              <span className="bg-slate-800 border border-slate-700 text-slate-300 px-2 py-1 rounded">
                {result.email_id}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-500">roll</span>
              <span className="bg-slate-800 border border-slate-700 text-cyan-400 px-2 py-1 rounded">
                {result.college_roll_number}
              </span>
            </div>

            {/* ── Summary Stats ── */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3 font-mono">
                Summary
              </p>
              <div className="grid grid-cols-3 gap-3">
                <StatCard
                  icon="🌲"
                  label="Total Trees"
                  value={result.summary.total_trees}
                  accent="border-cyan-500/20 hover:border-cyan-500/40"
                />
                <StatCard
                  icon="🔄"
                  label="Cycles Found"
                  value={result.summary.total_cycles}
                  accent={
                    result.summary.total_cycles > 0
                      ? "border-amber-500/30 hover:border-amber-500/50"
                      : "border-slate-700/60"
                  }
                />
                <StatCard
                  icon="🏆"
                  label="Largest Root"
                  value={result.summary.largest_tree_root || "—"}
                  accent="border-violet-500/20 hover:border-violet-500/40"
                />
              </div>
            </div>

            {/* ── Hierarchies ── */}
            {result.hierarchies && result.hierarchies.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3 font-mono">
                  Hierarchies · {result.hierarchies.length} tree
                  {result.hierarchies.length !== 1 ? "s" : ""}
                </p>
                <div className="space-y-3">
                  {result.hierarchies.map((h, i) => (
                    <HierarchyCard key={i} hierarchy={h} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Warnings ── */}
            <div className="space-y-3">
              <BadgeList
                title="Invalid Entries"
                items={result.invalid_entries}
                color="red"
              />
              <BadgeList
                title="Duplicate Edges"
                items={result.duplicate_edges}
                color="amber"
              />
            </div>

            {/* ── Raw JSON toggle ── */}
            <details className="group rounded-xl border border-slate-700/40 bg-slate-900/50 overflow-hidden">
              <summary className="cursor-pointer px-5 py-3 text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-2 list-none">
                <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
                Raw API Response
              </summary>
              <pre className="px-5 pb-5 text-xs font-mono text-slate-400 overflow-x-auto leading-relaxed">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>

      {/* ── Google Font import ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;600&display=swap');
      `}</style>
    </main>
  );
}