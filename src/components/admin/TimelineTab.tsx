"use client";

import { useState } from "react";
import type { EventTimelineEntry } from "@/lib/admin/designs-timeline-data";
import type { AdminFunction } from "@/lib/admin/data";

interface TimelineTabProps {
  eventId: string;
  functions: AdminFunction[];
  initialTimeline: EventTimelineEntry[];
}

export function TimelineTab({ eventId, functions, initialTimeline }: TimelineTabProps) {
  const [timeline, setTimeline] = useState<EventTimelineEntry[]>(initialTimeline);
  const [selectedFunctionId, setSelectedFunctionId] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = timeline.filter((entry) => {
    if (selectedFunctionId === "all") return true;
    return entry.function_id === selectedFunctionId;
  });

  const handleDelete = (id: string) => {
    setTimeline((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-4 rounded-radius-lg border border-border">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
            Master Itinerary &amp; Cues
          </span>
          <h3 className="font-heading font-bold text-base text-ink mt-0.5">
            Event Day Timeline Entries
          </h3>
          <p className="text-xs text-ink-muted">
            Minute-by-minute coordinator cues synced across floor managers and stage crew.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedFunctionId}
            onChange={(e) => setSelectedFunctionId(e.target.value)}
            className="text-xs font-medium px-3 py-2 rounded-radius-md border border-border bg-bg text-ink min-h-[40px]"
          >
            <option value="all">All Ceremonies</option>
            {functions.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-radius-md bg-accent text-accent-ink hover:bg-accent-hover transition-colors min-h-[40px]"
          >
            <span>+ Add Timeline Entry</span>
          </button>
        </div>
      </div>

      {/* Timeline List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-surface border border-dashed border-border rounded-radius-lg text-ink-muted text-xs">
          No timeline entries found for this ceremony. Tap &quot;+ Add Timeline Entry&quot; to schedule moments.
        </div>
      ) : (
        <div className="relative border-l-2 border-accent/40 ml-4 sm:ml-6 space-y-6 py-2">
          {filtered.map((item) => {
            const linkedFunction = functions.find((f) => f.id === item.function_id);

            return (
              <div key={item.id} className="relative pl-6 sm:pl-8 group">
                {/* Timeline node marker */}
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-accent border-2 border-bg ring-4 ring-accent/15 group-hover:scale-125 transition-transform" />

                <div className="bg-surface border border-border rounded-radius-lg p-5 shadow-[var(--shadow-sm)] hover:border-accent/40 transition-all space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-radius-sm">
                        ⏰ {item.starts_at}
                      </span>
                      {linkedFunction && (
                        <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                          • {linkedFunction.name}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="text-xs text-danger hover:underline self-end sm:self-auto"
                    >
                      Delete
                    </button>
                  </div>

                  <h4 className="text-sm sm:text-base font-heading font-bold text-ink">
                    {item.title}
                  </h4>

                  {item.notes && (
                    <p className="text-xs text-ink-muted leading-relaxed pt-2 border-t border-border/60">
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Add Timeline Entry */}
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
                Add Timeline Cue / Entry
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
                const newT: EventTimelineEntry = {
                  id: `tl-local-${Date.now()}`,
                  event_id: eventId,
                  function_id: String(formData.get("function_id")) || null,
                  starts_at: String(formData.get("starts_at")),
                  title: String(formData.get("title")),
                  notes: String(formData.get("notes") || "") || null,
                };
                setTimeline((prev) => [...prev, newT].sort((a, b) => a.starts_at.localeCompare(b.starts_at)));
                setShowAddModal(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Sub-Ceremony Function
                </label>
                <select
                  name="function_id"
                  className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-xs focus:ring-1 focus:ring-accent min-h-[44px]"
                >
                  <option value="">General Event Entry</option>
                  {functions.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Start Time (e.g. 18:30) *
                </label>
                <input
                  name="starts_at"
                  type="time"
                  required
                  defaultValue="18:00"
                  className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-xs focus:ring-1 focus:ring-accent min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Event / Cue Title *
                </label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Groom Baraat Arrival & Rose Petal Shower"
                  className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-xs focus:ring-1 focus:ring-accent min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Coordinator Instructions / Notes
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="e.g. Cue Dhol troupe, test wireless mic for pandit ji..."
                  className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-xs focus:ring-1 focus:ring-accent"
                />
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
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
