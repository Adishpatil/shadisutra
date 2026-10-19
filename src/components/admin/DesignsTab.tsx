"use client";

import { useState } from "react";
import type { EventDesignRecord } from "@/lib/admin/designs-timeline-data";

interface DesignsTabProps {
  eventId: string;
  initialDesigns: EventDesignRecord[];
}

export function DesignsTab({ eventId, initialDesigns }: DesignsTabProps) {
  const [designs, setDesigns] = useState<EventDesignRecord[]>(initialDesigns);
  const [filterFinalized, setFilterFinalized] = useState<"all" | "finalized" | "draft">("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = designs.filter((d) => {
    if (filterFinalized === "finalized") return d.is_finalized;
    if (filterFinalized === "draft") return !d.is_finalized;
    return true;
  });

  const handleToggleFinalized = (designId: string) => {
    setDesigns((prev) =>
      prev.map((d) => (d.id === designId ? { ...d, is_finalized: !d.is_finalized } : d))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-4 rounded-radius-lg border border-border">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
            Aesthetics &amp; 3D Renderings
          </span>
          <h3 className="font-heading font-bold text-base text-ink mt-0.5">
            Event Designs &amp; Lookbooks
          </h3>
          <p className="text-xs text-ink-muted">
            Designs marked as <strong>Finalized</strong> are available to the customer portal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterFinalized}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all" || value === "finalized" || value === "draft") {
                setFilterFinalized(value);
              }
            }}
            className="text-xs font-medium px-3 py-2 rounded-radius-md border border-border bg-bg text-ink min-h-[40px]"
          >
            <option value="all">All Designs ({designs.length})</option>
            <option value="finalized">Finalized Only</option>
            <option value="draft">Drafts Only</option>
          </select>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-radius-md bg-accent text-accent-ink hover:bg-accent-hover transition-colors min-h-[40px]"
          >
            <span>+ Add Design</span>
          </button>
        </div>
      </div>

      {/* Grid of Designs */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-surface border border-dashed border-border rounded-radius-lg text-ink-muted text-xs">
          No designs found. Tap &quot;+ Add Design&quot; to register a rendering, lookbook, or floorplan.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((d) => (
            <div
              key={d.id}
              className="bg-surface rounded-radius-lg border border-border shadow-[var(--shadow-sm)] overflow-hidden flex flex-col justify-between group"
            >
              {/* Image preview frame */}
              <div className="relative aspect-video bg-neutral-100 overflow-hidden border-b border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={d.signed_url ?? d.file_path}
                  alt={d.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-radius-sm text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                      d.is_finalized
                        ? "bg-success text-white border-success"
                        : "bg-surface/90 text-ink-muted border-border"
                    }`}
                  >
                    {d.is_finalized ? "Finalized" : "Draft (v" + d.version + ")"}
                  </span>
                </div>
              </div>

              {/* Details and controls */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-heading font-bold text-sm text-ink line-clamp-2">
                    {d.title}
                  </h4>
                  <p className="text-[11px] text-ink-muted mt-1 font-mono">
                    Version: v{d.version} • {new Date(d.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleFinalized(d.id)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-radius-md border transition-colors min-h-[36px] ${
                      d.is_finalized
                        ? "border-warning/40 text-warning hover:bg-warning-light"
                        : "border-success/40 text-success hover:bg-success-light"
                    }`}
                  >
                    {d.is_finalized ? "Unmark Finalized" : "Mark Finalized ✓"}
                  </button>

                  <a
                    href={d.signed_url ?? d.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-accent hover:underline"
                  >
                    Enlarge ↗
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Add Design Entry */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-md bg-surface border border-border rounded-radius-lg p-6 shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-heading font-bold text-base text-ink">
                Register New Design / Render
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-ink-muted hover:text-ink w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newD: EventDesignRecord = {
                  id: `des-local-${Date.now()}`,
                  event_id: eventId,
                  title: String(formData.get("title")),
                  file_path: String(formData.get("file_path")) || "/images/gallery/weddings/wedding-haldi-01.webp",
                  signed_url: null,
                  version: Number(formData.get("version")) || 1,
                  is_finalized: formData.get("is_finalized") === "on",
                  created_at: new Date().toISOString(),
                };
                setDesigns((prev) => [newD, ...prev]);
                setShowAddModal(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Design Title *
                </label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Sangeet Stage Backdrop 3D Mockup"
                  className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-xs focus:ring-1 focus:ring-accent min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Image URL / Asset Path
                </label>
                <input
                  name="file_path"
                  defaultValue="/images/gallery/weddings/wedding-haldi-01.webp"
                  className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-xs focus:ring-1 focus:ring-accent min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Version Number
                  </label>
                  <input
                    name="version"
                    type="number"
                    min="1"
                    defaultValue="1"
                    className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-xs focus:ring-1 focus:ring-accent min-h-[44px]"
                  />
                </div>

                <div className="pt-4 flex items-center gap-2">
                  <input
                    id="is_finalized"
                    name="is_finalized"
                    type="checkbox"
                    className="w-4 h-4 text-accent rounded border-border"
                  />
                  <label htmlFor="is_finalized" className="text-xs font-medium text-ink">
                    Mark Finalized
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-accent text-accent-ink rounded-radius-md text-xs font-semibold hover:bg-accent-hover min-h-[44px]"
                >
                  Save Design
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
