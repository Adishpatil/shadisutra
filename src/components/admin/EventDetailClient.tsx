"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  AdminEventSummary,
  AdminFunction,
  AdminItem,
} from "@/lib/admin/data";
import {
  updateEventStatusAction,
  addFunctionAction,
  addItemAction,
  updateItemStatusAction,
} from "@/lib/admin/event-actions";

import { BudgetPaymentsTab } from "@/components/admin/BudgetPaymentsTab";
import { QRCodeModal } from "@/components/admin/QRCodeModal";
import type { PaymentRecord } from "@/lib/admin/budget-calculations";
import type { AuditLogItem } from "@/lib/admin/data";

interface EventDetailClientProps {
  event: AdminEventSummary;
  initialFunctions: AdminFunction[];
  initialItemsByFunction: Record<string, AdminItem[]>;
  initialBudgetTotal?: number;
  initialPayments?: PaymentRecord[];
  auditLogs?: AuditLogItem[];
}

type TabType = "functions" | "items" | "budget" | "designs" | "timeline" | "guests";

export function EventDetailClient({
  event,
  initialFunctions,
  initialItemsByFunction,
  initialBudgetTotal = 0,
  initialPayments = [],
  auditLogs = [],
}: EventDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("items"); // Default to tracking view
  const [functions] = useState(initialFunctions);
  const [itemsByFunction, setItemsByFunction] = useState(initialItemsByFunction);
  const [selectedFunctionId, setSelectedFunctionId] = useState<string>("all");
  const [status, setStatus] = useState(event.status);

  // Modals state
  const [showAddFunction, setShowAddFunction] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [addItemTargetFunctionId, setAddItemTargetFunctionId] = useState<string>(
    functions[0]?.id || ""
  );

  // Status Change
  const handleStatusChange = async (
    newStatus: "planning" | "finalized" | "completed" | "cancelled"
  ) => {
    setStatus(newStatus);
    await updateEventStatusAction(event.id, newStatus);
  };

  // Quick item status toggle (tap to cycle: not_started -> in_progress -> done)
  const handleItemStatusCycle = async (item: AdminItem) => {
    const cycleMap: Record<AdminItem["status"], AdminItem["status"]> = {
      not_started: "in_progress",
      in_progress: "done",
      done: "not_started",
    };

    const nextStatus = cycleMap[item.status];

    // Optimistic UI update
    setItemsByFunction((prev) => {
      const copy = { ...prev };
      if (copy[item.function_id]) {
        copy[item.function_id] = copy[item.function_id].map((it) =>
          it.id === item.id ? { ...it, status: nextStatus } : it
        );
      }
      return copy;
    });

    await updateItemStatusAction(item.id, event.id, nextStatus);
  };

  // Add Function submit
  const handleAddFunctionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await addFunctionAction(event.id, formData);
    if (res.success) {
      setShowAddFunction(false);
      router.refresh();
    } else {
      alert(`Error: ${res.error}`);
    }
  };

  // Add Item submit
  const handleAddItemSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const targetFunc = addItemTargetFunctionId || functions[0]?.id;
    if (!targetFunc) {
      alert("Please create a sub-function before adding items.");
      return;
    }

    const res = await addItemAction(targetFunc, event.id, formData);
    if (res.success) {
      setShowAddItem(false);
      router.refresh();
    } else {
      alert(`Error: ${res.error}`);
    }
  };

  // Gather items to display in tracking view
  const displayItems = Object.entries(itemsByFunction)
    .filter(([funcId]) =>
      selectedFunctionId === "all" ? true : funcId === selectedFunctionId
    )
    .flatMap(([, items]) => items);

  const categories = ["lighting", "flowers", "decor", "instruments", "other"] as const;

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. Header Banner & Status                                     */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-surface p-5 sm:p-8 rounded-radius-lg border border-border shadow-[var(--shadow-sm)] space-y-4">
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <Link href="/admin/events" className="hover:text-accent">
            ← Back to Events
          </Link>
          <span>/</span>
          <span className="capitalize">{event.type}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs uppercase font-bold text-accent tracking-wider">
                {event.type}
              </span>
              <span className="text-xs text-ink-muted">
                📅 {event.date}
              </span>
              <span className="text-xs text-ink-muted">
                📍 {event.venue}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink mt-1">
              {event.name}
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              Client: <strong>{event.customer_name}</strong> (@{event.customer_username})
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-radius-md border border-accent/40 bg-accent/10 text-accent text-xs font-semibold hover:bg-accent hover:text-accent-ink transition-colors min-h-[44px]"
              title="Generate QR code for guests"
            >
              <span>📱</span>
              <span>Event QR</span>
            </button>

            <div>
              <label htmlFor="event-detail-status" className="sr-only">
                Event Status
              </label>
              <select
                id="event-detail-status"
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as AdminEventSummary['status'])}
                className="text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-radius-md border border-border bg-bg text-ink focus:ring-1 focus:ring-accent min-h-[44px]"
              >
                <option value="planning">Status: Planning</option>
                <option value="finalized">Status: Finalized</option>
                <option value="completed">Status: Completed</option>
                <option value="cancelled">Status: Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Swipeable / Horizontally Scrollable Tab Bar                */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border text-sm">
        {[
          { key: "items", label: "Items (Tracking View)" },
          { key: "functions", label: `Functions (${functions.length})` },
          { key: "budget", label: "Budget & Payments" },
          { key: "designs", label: "Designs" },
          { key: "timeline", label: "Timeline" },
          { key: "guests", label: "Guest List" },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key as TabType)}
            className={`px-4 py-2.5 rounded-radius-md font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors min-h-[44px] ${
              activeTab === t.key
                ? "bg-accent text-accent-ink shadow-[var(--shadow-sm)]"
                : "text-ink-muted hover:text-ink hover:bg-surface border border-transparent hover:border-border"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: Items (The Tracking View)                              */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "items" && (
        <div className="space-y-6">
          {/* Sub-header with function filter & Add button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-ink-muted">
                Filter by Function:
              </span>
              <select
                value={selectedFunctionId}
                onChange={(e) => setSelectedFunctionId(e.target.value)}
                className="text-xs font-medium px-3 py-1.5 rounded-radius-md border border-border bg-surface text-ink min-h-[36px]"
              >
                <option value="all">All Sub-Events</option>
                {functions.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                setAddItemTargetFunctionId(functions[0]?.id || "");
                setShowAddItem(true);
              }}
              className="inline-flex items-center justify-center px-4 py-2 bg-accent text-accent-ink text-xs font-semibold rounded-radius-md shadow-[var(--shadow-sm)] hover:bg-accent-hover transition-colors min-h-[44px]"
            >
              + Quick Add Item
            </button>
          </div>

          {/* Grouped by Category */}
          {categories.map((cat) => {
            const catItems = displayItems.filter((it) => it.category === cat);
            if (catItems.length === 0) return null;

            return (
              <div
                key={cat}
                className="bg-surface rounded-radius-lg border border-border shadow-[var(--shadow-sm)] overflow-hidden"
              >
                {/* Category Header */}
                <div className="bg-bg/60 px-5 py-3 border-b border-border flex items-center justify-between">
                  <h3 className="font-heading font-bold text-base uppercase tracking-wider text-ink flex items-center gap-2">
                    <span className="capitalize">{cat}</span>
                    <span className="text-xs text-ink-muted font-mono font-normal">
                      ({catItems.length})
                    </span>
                  </h3>
                  <span className="text-xs font-semibold text-accent font-mono">
                    ₹{catItems.reduce((acc, c) => acc + c.cost, 0).toLocaleString()}
                  </span>
                </div>

                {/* Items List - Desktop Table & Mobile Cards */}
                <div className="divide-y divide-border">
                  {catItems.map((item) => {
                    const statusBadgeClass = {
                      not_started: "bg-danger-light text-danger border-danger/30",
                      in_progress: "bg-warning-light text-warning border-warning/30",
                      done: "bg-success-light text-success border-success/30",
                    }[item.status];

                    const statusLabel = {
                      not_started: "Not Started",
                      in_progress: "In Progress",
                      done: "Done ✓",
                    }[item.status];

                    return (
                      <div
                        key={item.id}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-bg/30 transition-colors"
                      >
                        <div className="space-y-1">
                          <h4 className="font-semibold text-sm text-ink">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-ink-muted flex-wrap">
                            {item.vendor && (
                              <span>🏢 Vendor: <strong>{item.vendor}</strong></span>
                            )}
                            <span>💰 Cost: <strong>₹{item.cost.toLocaleString()}</strong></span>
                            {item.notes && (
                              <span className="italic text-ink-muted">📝 {item.notes}</span>
                            )}
                          </div>
                        </div>

                        {/* Interactive Status Switcher */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleItemStatusCycle(item)}
                            className={`px-3 py-1.5 rounded-radius-full text-xs font-semibold border transition-all hover:scale-105 min-h-[36px] ${statusBadgeClass}`}
                            title="Click to cycle status: Not Started → In Progress → Done"
                          >
                            {statusLabel}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {displayItems.length === 0 && (
            <div className="text-center py-12 bg-surface rounded-radius-lg border border-border text-ink-muted text-sm">
              No items added yet. Click <strong>+ Quick Add Item</strong> above to start tracking.
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: Functions (Sub-events)                                 */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "functions" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-bold text-ink">
              Sub-Events &amp; Ceremonies
            </h2>
            <button
              type="button"
              onClick={() => setShowAddFunction(true)}
              className="inline-flex items-center justify-center px-4 py-2 bg-accent text-accent-ink text-xs font-semibold rounded-radius-md hover:bg-accent-hover transition-colors min-h-[44px]"
            >
              + Add Sub-Function
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {functions.map((func) => (
              <div
                key={func.id}
                className="bg-surface p-5 rounded-radius-lg border border-border shadow-[var(--shadow-sm)] space-y-2"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-heading font-bold text-base text-ink">
                    {func.name}
                  </h3>
                  <span className="text-xs font-mono text-accent font-semibold">
                    {func.start_time || "Time TBD"}
                  </span>
                </div>
                <p className="text-xs text-ink-muted">📅 Date: {func.date}</p>
                {func.notes && (
                  <p className="text-xs text-ink-muted pt-2 border-t border-border">
                    {func.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* OTHER TABS: Placeholders ready for Phase 5, 6, 7              */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "budget" && (
        <BudgetPaymentsTab
          eventId={event.id}
          initialAgreedTotal={initialBudgetTotal || event.budget_total || 0}
          initialPayments={initialPayments}
          items={Object.values(itemsByFunction).flat()}
          auditLogs={auditLogs}
        />
      )}

      {activeTab === "designs" && (
        <div className="p-8 bg-surface rounded-radius-lg border border-border text-center space-y-3">
          <h3 className="font-heading text-lg font-bold text-ink">
            Designs &amp; 3D Renderings
          </h3>
          <p className="text-sm text-ink-muted max-w-md mx-auto">
            Upload images &amp; PDFs, manage versions, and mark finalized designs for client portal display.
          </p>
          <span className="inline-block text-xs text-accent font-semibold uppercase tracking-wider bg-accent-light px-3 py-1 rounded-radius-full">
            Connected in Phase 6
          </span>
        </div>
      )}

      {activeTab === "timeline" && (
        <div className="p-8 bg-surface rounded-radius-lg border border-border text-center space-y-3">
          <h3 className="font-heading text-lg font-bold text-ink">
            Day-by-Day Master Itinerary
          </h3>
          <p className="text-sm text-ink-muted max-w-md mx-auto">
            Schedule entries synced across client portal and backstage event crew.
          </p>
          <span className="inline-block text-xs text-accent font-semibold uppercase tracking-wider bg-accent-light px-3 py-1 rounded-radius-full">
            Connected in Phase 6
          </span>
        </div>
      )}

      {activeTab === "guests" && (
        <div className="p-8 bg-surface rounded-radius-lg border border-border text-center space-y-3">
          <h3 className="font-heading text-lg font-bold text-ink">
            Shared Guest List &amp; RSVPs
          </h3>
          <p className="text-sm text-ink-muted max-w-md mx-auto">
            Excel / CSV import and export with formula injection neutralization.
          </p>
          <span className="inline-block text-xs text-accent font-semibold uppercase tracking-wider bg-accent-light px-3 py-1 rounded-radius-full">
            Connected in Phase 7
          </span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Add Sub-Function                                       */}
      {/* ------------------------------------------------------------- */}
      {showAddFunction && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
          onClick={() => setShowAddFunction(false)}
        >
          <div
            className="w-full max-w-md bg-surface rounded-radius-lg border border-border shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-heading font-bold text-ink">
              Add Sub-Function
            </h3>
            <form onSubmit={handleAddFunctionSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-semibold uppercase text-ink mb-1">
                  Function Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Sangeet & Cocktail Night"
                  className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-sm focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-ink mb-1">
                    Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={event.date}
                    required
                    className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-sm focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-ink mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-sm focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-ink mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="e.g. Dress code, location, setup timing..."
                  className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-sm focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddFunction(false)}
                  className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-accent text-accent-ink rounded-radius-md text-xs font-semibold hover:bg-accent-hover min-h-[44px]"
                >
                  Save Function
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Quick Add Item (Tracking View)                         */}
      {/* ------------------------------------------------------------- */}
      {showAddItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
          onClick={() => setShowAddItem(false)}
        >
          <div
            className="w-full max-w-md bg-surface rounded-radius-lg border border-border shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-heading font-bold text-ink">
              Add Item to Tracking View
            </h3>
            <form onSubmit={handleAddItemSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-semibold uppercase text-ink mb-1">
                  Assign to Function <span className="text-danger">*</span>
                </label>
                <select
                  value={addItemTargetFunctionId}
                  onChange={(e) => setAddItemTargetFunctionId(e.target.value)}
                  className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-sm focus:ring-1 focus:ring-accent"
                >
                  {functions.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-ink mb-1">
                    Category <span className="text-danger">*</span>
                  </label>
                  <select
                    name="category"
                    defaultValue="decor"
                    className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-sm focus:ring-1 focus:ring-accent"
                  >
                    <option value="lighting">Lighting</option>
                    <option value="flowers">Flowers</option>
                    <option value="decor">Decor</option>
                    <option value="instruments">Instruments / Music</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-ink mb-1">
                    Initial Status
                  </label>
                  <select
                    name="status"
                    defaultValue="not_started"
                    className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-sm focus:ring-1 focus:ring-accent"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-ink mb-1">
                  Item Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Moving heads & cold pyros"
                  className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-sm focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-ink mb-1">
                    Vendor
                  </label>
                  <input
                    type="text"
                    name="vendor"
                    placeholder="e.g. Lumina FX"
                    className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-sm focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-ink mb-1">
                    Estimated Cost (₹)
                  </label>
                  <input
                    type="number"
                    name="cost"
                    placeholder="e.g. 50000"
                    className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-sm focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-ink mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Contract notes, arrival timing, power requirements..."
                  className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-sm focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddItem(false)}
                  className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-accent text-accent-ink rounded-radius-md text-xs font-semibold hover:bg-accent-hover min-h-[44px]"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal for Guest Showcase */}
      <QRCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        eventId={event.id}
        eventName={event.name}
        eventStatus={status}
      />
    </div>
  );
}
