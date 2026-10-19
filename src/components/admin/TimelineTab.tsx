"use client";

import { useState } from "react";
import type { EventTimelineEntry } from "@/lib/admin/designs-timeline-data";
import type { AdminFunction } from "@/lib/admin/data";
import {
  createTimelineEntryAction,
  deleteTimelineEntryAction,
  updateTimelineEntryAction,
} from "@/lib/admin/timeline-actions";

interface TimelineTabProps {
  eventId: string;
  eventDate: string;
  functions: AdminFunction[];
  initialTimeline: EventTimelineEntry[];
}

export function TimelineTab({ eventId, eventDate, functions, initialTimeline }: TimelineTabProps) {
  const [timeline, setTimeline] = useState<EventTimelineEntry[]>(initialTimeline);
  const [selectedFunctionId, setSelectedFunctionId] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<EventTimelineEntry | null>(null);

  const filtered = timeline.filter((entry) => {
    if (selectedFunctionId === "all") return true;
    return entry.function_id === selectedFunctionId;
  });

  const closeEntryModal = () => {
    setShowAddModal(false);
    setEditingEntry(null);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const localDateTime = new Date(`${eventDate}T${String(formData.get("starts_at"))}`);
    if (!Number.isFinite(localDateTime.getTime())) {
      alert("Choose a valid timeline date and time.");
      return;
    }
    const functionValue = String(formData.get("function_id") ?? "");
    const input = {
      eventId,
      functionId: functionValue || null,
      startsAt: localDateTime.toISOString(),
      title: String(formData.get("title") ?? ""),
      notes: String(formData.get("notes") ?? ""),
    };

    const result = editingEntry
      ? await updateTimelineEntryAction({ ...input, entryId: editingEntry.id })
      : await createTimelineEntryAction(input);
    if (!result.success || !result.entry) {
      alert(result.error ?? "Could not save timeline entry.");
      return;
    }

    setTimeline((current) =>
      [
        ...current.filter((entry) => entry.id !== result.entry.id),
        result.entry,
      ].sort((left, right) => left.starts_at.localeCompare(right.starts_at))
    );
    closeEntryModal();
  };

  const handleDelete = async (id: string) => {
    const result = await deleteTimelineEntryAction(id, eventId);
    if (!result.success) {
      alert(result.error ?? "Could not delete timeline entry.");
      return;
    }
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
            className="text-base font-medium px-3 py-2 rounded-radius-md border border-border bg-bg text-ink min-h-[44px]"
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
            onClick={() => {
              setEditingEntry(null);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-radius-md bg-accent text-accent-ink hover:bg-accent-hover transition-colors min-h-[44px]"
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
                        {new Date(item.starts_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {linkedFunction && (
                        <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                          • {linkedFunction.name}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEntry(item);
                          setShowAddModal(true);
                        }}
                        className="min-h-[44px] px-3 text-sm font-semibold text-accent hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="min-h-[44px] px-3 text-sm font-semibold text-danger hover:underline"
                      >
                        Delete
                      </button>
                    </div>
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
          onClick={closeEntryModal}
        >
          <div
            className="w-full max-w-md max-h-[90dvh] overflow-y-auto bg-surface border border-border rounded-radius-lg p-6 shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-heading font-bold text-base text-ink">
                {editingEntry ? "Edit Timeline Entry" : "Add Timeline Cue / Entry"}
              </h3>
              <button
                type="button"
                onClick={closeEntryModal}
                className="text-ink-muted hover:text-ink min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSave}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Sub-Ceremony Function
                </label>
                <select
                  name="function_id"
                  defaultValue={editingEntry?.function_id ?? ""}
                  className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-base focus:ring-1 focus:ring-accent min-h-[44px]"
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
                  defaultValue={
                    editingEntry
                      ? new Date(editingEntry.starts_at).toTimeString().slice(0, 5)
                      : "18:00"
                  }
                  className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-base focus:ring-1 focus:ring-accent min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Event / Cue Title *
                </label>
                <input
                  name="title"
                  required
                  defaultValue={editingEntry?.title ?? ""}
                  placeholder="e.g. Groom Baraat Arrival & Rose Petal Shower"
                  className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-base focus:ring-1 focus:ring-accent min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Coordinator Instructions / Notes
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  defaultValue={editingEntry?.notes ?? ""}
                  placeholder="e.g. Cue Dhol troupe, test wireless mic for pandit ji..."
                  className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-base focus:ring-1 focus:ring-accent min-h-[88px]"
                />
              </div>

              <div className="sticky bottom-0 -mx-6 -mb-6 mt-4 border-t border-border bg-surface px-6 py-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEntryModal}
                  className="px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-accent text-accent-ink rounded-radius-md text-sm font-semibold hover:bg-accent-hover min-h-[44px]"
                >
                  {editingEntry ? "Save Changes" : "Save Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
