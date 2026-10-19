"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import type { EventDesignRecord } from "@/lib/admin/designs-timeline-data";
import {
  deleteDesignAction,
  setDesignFinalizedAction,
  uploadDesignAction,
} from "@/lib/admin/design-actions";
import { formatDateTime } from "@/lib/format";

interface DesignsTabProps {
  eventId: string;
  initialDesigns: EventDesignRecord[];
}

export function DesignsTab({ eventId, initialDesigns }: DesignsTabProps) {
  const router = useRouter();
  const designs = initialDesigns;
  const [filterFinalized, setFilterFinalized] = useState<"all" | "finalized" | "draft">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const filtered = designs.filter((design) =>
    filterFinalized === "all" ||
    (filterFinalized === "finalized" ? design.is_finalized : !design.is_finalized)
  );

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploading(true);
    setError(null);
    const result = await uploadDesignAction(new FormData(event.currentTarget));
    setUploading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setShowAddModal(false);
    router.refresh();
  }

  async function handleFinalize(design: EventDesignRecord) {
    if (!design.is_finalized && !confirm(
      "Finalizing makes this file reachable to anyone with the event's public share link. Continue?"
    )) {
      return;
    }
    setBusyId(design.id);
    setError(null);
    const result = await setDesignFinalizedAction(
      design.id,
      eventId,
      !design.is_finalized
    );
    setBusyId(null);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleDelete(design: EventDesignRecord) {
    if (!confirm(`Delete "${design.title}" and its stored file?`)) return;
    setBusyId(design.id);
    setError(null);
    const result = await deleteDesignAction(design.id, eventId);
    setBusyId(null);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-radius-lg border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent">
            Aesthetics &amp; 3D Renderings
          </span>
          <h3 className="mt-0.5 font-heading text-base font-bold text-ink">
            Event Designs &amp; Lookbooks
          </h3>
          <p className="text-sm text-ink-muted">
            Private drafts stay admin-only. Finalized files are available to anyone with the event share link.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="design-filter">Filter designs</label>
          <select
            id="design-filter"
            value={filterFinalized}
            onChange={(event) => {
              const value = event.target.value;
              if (value === "all" || value === "finalized" || value === "draft") {
                setFilterFinalized(value);
              }
            }}
            className="min-h-[44px] rounded-radius-md border border-border bg-bg px-3 text-base text-ink"
          >
            <option value="all">All Designs ({designs.length})</option>
            <option value="finalized">Finalized Only</option>
            <option value="draft">Drafts Only</option>
          </select>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="min-h-[44px] rounded-radius-md border border-border px-4 text-base font-semibold text-ink"
          >
            Refresh previews
          </button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setShowAddModal(true);
            }}
            className="min-h-[44px] rounded-radius-md bg-accent px-4 text-base font-semibold text-accent-ink hover:bg-accent-hover"
          >
            + Add Design
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-radius-md border border-danger/30 bg-danger-light p-3 text-sm text-danger">
          {error}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-radius-lg border border-dashed border-border bg-surface p-8 text-center text-base text-ink-muted">
          No designs found. Add a private draft to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((design) => (
            <article
              key={design.id}
              className="flex flex-col overflow-hidden rounded-radius-lg border border-border bg-surface shadow-[var(--shadow-sm)]"
            >
              <div className="relative flex aspect-video items-center justify-center overflow-hidden border-b border-border bg-neutral-100">
                {design.file_kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={design.preview_url} alt={design.title} className="h-full w-full object-cover" />
                ) : (
                  <a
                    href={design.preview_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] px-4 text-base font-semibold text-accent"
                  >
                    Open PDF preview
                  </a>
                )}
                <span className={`absolute right-2 top-2 rounded-radius-sm border px-2 py-1 text-xs font-bold ${
                  design.is_finalized
                    ? "border-success bg-success text-white"
                    : "border-border bg-surface text-ink-muted"
                }`}>
                  {design.is_finalized ? "Finalized" : `Draft · v${design.version}`}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-4 p-4">
                <div>
                  <h4 className="break-words font-heading text-base font-bold text-ink">{design.title}</h4>
                  <p className="mt-1 text-sm text-ink-muted">
                    Version {design.version} · {formatDateTime(design.created_at)}
                  </p>
                </div>
                <div className="mt-auto flex flex-col gap-2 border-t border-border pt-3">
                  <button
                    type="button"
                    disabled={busyId === design.id}
                    onClick={() => void handleFinalize(design)}
                    className={`min-h-[44px] rounded-radius-md border px-3 text-base font-semibold disabled:opacity-50 ${
                      design.is_finalized
                        ? "border-warning/40 text-warning hover:bg-warning-light"
                        : "border-success/40 text-success hover:bg-success-light"
                    }`}
                  >
                    {busyId === design.id
                      ? "Saving…"
                      : design.is_finalized
                        ? "Unmark Finalized"
                        : "Finalize design"}
                  </button>
                  <a
                    href={design.preview_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-radius-md border border-border px-3 text-base font-semibold text-accent"
                  >
                    {design.file_kind === "pdf" ? "Open PDF preview" : "Open preview"}
                  </a>
                  <button
                    type="button"
                    disabled={busyId === design.id}
                    onClick={() => void handleDelete(design)}
                    className="min-h-[44px] rounded-radius-md px-3 text-base font-semibold text-danger disabled:opacity-50"
                  >
                    Delete design and file
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-design-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
          onClick={() => !uploading && setShowAddModal(false)}
        >
          <div
            className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-radius-lg border border-border bg-surface p-5 shadow-xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="add-design-title" className="font-heading text-lg font-bold text-ink">
              Upload a design draft
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              PNG, JPG, WebP, or PDF. Maximum 10 MB. New uploads remain private drafts.
            </p>
            <form onSubmit={(event) => void handleUpload(event)} className="mt-5 space-y-4">
              <input type="hidden" name="eventId" value={eventId} />
              <div>
                <label htmlFor="design-title" className="mb-1 block text-sm font-semibold text-ink">
                  Design title
                </label>
                <input
                  id="design-title"
                  name="title"
                  required
                  maxLength={120}
                  autoComplete="off"
                  className="min-h-[48px] w-full rounded-radius-md border border-border bg-bg px-3 text-base text-ink"
                />
              </div>
              <div>
                <label htmlFor="design-file" className="mb-1 block text-sm font-semibold text-ink">
                  File
                </label>
                <input
                  id="design-file"
                  name="file"
                  type="file"
                  required
                  accept=".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf"
                  className="min-h-[48px] w-full rounded-radius-md border border-border bg-bg px-3 py-2 text-base text-ink file:mr-3 file:min-h-[40px]"
                />
              </div>
              {error && <p role="alert" className="text-sm text-danger">{error}</p>}
              <div className="sticky bottom-0 flex gap-3 border-t border-border bg-surface pt-4">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => setShowAddModal(false)}
                  className="min-h-[48px] flex-1 rounded-radius-md border border-border px-4 text-base font-semibold text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="min-h-[48px] flex-1 rounded-radius-md bg-accent px-4 text-base font-semibold text-accent-ink disabled:opacity-50"
                >
                  {uploading ? "Uploading…" : "Upload draft"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
