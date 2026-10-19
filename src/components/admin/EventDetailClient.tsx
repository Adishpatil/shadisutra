"use client";

import { useState } from "react";
import { formatNumber } from "@/lib/format";
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
  updateFunctionAction,
  deleteFunctionAction,
  addItemAction,
  updateItemAction,
  deleteItemAction,
  updateItemStatusAction,
  updateEventDetailsAction,
} from "@/lib/admin/event-actions";

import { BudgetPaymentsTab } from "@/components/admin/BudgetPaymentsTab";
import { GuestListTab } from "@/components/admin/GuestListTab";
import { DesignsTab } from "@/components/admin/DesignsTab";
import { TimelineTab } from "@/components/admin/TimelineTab";
import { EventShareLinkPanel } from "@/components/admin/EventShareLinkPanel";
import type { PaymentRecord } from "@/lib/admin/budget-calculations";
import type { AuditLogItem } from "@/lib/admin/data";
import type { AdminEventShareLink } from "@/lib/events/share-actions";
import type { GuestRecord } from "@/lib/guests/data";
import type { EventDesignRecord, EventTimelineEntry } from "@/lib/admin/designs-timeline-data";

interface EventDetailClientProps {
  event: AdminEventSummary;
  initialFunctions: AdminFunction[];
  initialItemsByFunction: Record<string, AdminItem[]>;
  initialBudgetTotal?: number;
  initialPayments?: PaymentRecord[];
  auditLogs?: AuditLogItem[];
  initialGuests?: GuestRecord[];
  initialDesigns?: EventDesignRecord[];
  initialTimeline?: EventTimelineEntry[];
  initialShareLink: AdminEventShareLink | null;
}

type TabType = "items" | "functions" | "budget" | "designs" | "timeline" | "guests";

export function EventDetailClient({
  event,
  initialFunctions,
  initialItemsByFunction,
  initialBudgetTotal = 0,
  initialPayments = [],
  auditLogs = [],
  initialGuests = [],
  initialDesigns = [],
  initialTimeline = [],
  initialShareLink,
}: EventDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("items");
  const [eventData, setEventData] = useState(event);
  const [functions, setFunctions] = useState(initialFunctions);
  const [itemsByFunction, setItemsByFunction] = useState(initialItemsByFunction);
  const [selectedFunctionId, setSelectedFunctionId] = useState<string>("all");
  const [status, setStatus] = useState(event.status);

  // Modals state
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [showAddFunction, setShowAddFunction] = useState(false);
  const [editingFunction, setEditingFunction] = useState<AdminFunction | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<{ item: AdminItem; functionId: string } | null>(null);
  const [addItemTargetFunctionId, setAddItemTargetFunctionId] = useState<string>(
    functions[0]?.id || ""
  );

  // Status Change
  const handleStatusChange = async (
    newStatus: "planning" | "finalized" | "completed" | "cancelled"
  ) => {
    setStatus(newStatus);
    setEventData((prev) => ({ ...prev, status: newStatus }));
    await updateEventStatusAction(event.id, newStatus);
  };

  // Quick item status toggle (tap to cycle: not_started -> in_progress -> done)
  const handleItemStatusCycle = async (item: AdminItem, functionId: string) => {
    const cycleMap: Record<AdminItem["status"], AdminItem["status"]> = {
      not_started: "in_progress",
      in_progress: "done",
      done: "not_started",
    };

    const nextStatus = cycleMap[item.status];

    // Optimistic UI update
    setItemsByFunction((prev) => {
      const copy = { ...prev };
      if (copy[functionId]) {
        copy[functionId] = copy[functionId].map((it) =>
          it.id === item.id ? { ...it, status: nextStatus } : it
        );
      }
      return copy;
    });

    await updateItemStatusAction(item.id, event.id, nextStatus);
  };

  // Edit Event Submit
  const handleEditEventSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await updateEventDetailsAction(event.id, formData);
    if (res.success) {
      setEventData((prev) => ({
        ...prev,
        name: formData.get("name")?.toString() || prev.name,
        type: (formData.get("type")?.toString() || prev.type) as any,
        date: formData.get("date")?.toString() || prev.date,
        venue: formData.get("venue")?.toString() || prev.venue,
      }));
      setShowEditEventModal(false);
      router.refresh();
    } else {
      alert(`Error updating event: ${res.error}`);
    }
  };

  // Add Function submit
  const handleAddFunctionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await addFunctionAction(event.id, formData);
    if (res.success) {
      const newFunc: AdminFunction = {
        id: (res as any).functionId || `f-${Date.now()}`,
        event_id: event.id,
        name: formData.get("name")?.toString() || "",
        date: formData.get("date")?.toString() || "",
        start_time: formData.get("startTime")?.toString() || null,
        notes: formData.get("notes")?.toString() || null,
      };
      setFunctions((prev) => [...prev, newFunc]);
      setShowAddFunction(false);
      router.refresh();
    } else {
      alert(`Error: ${res.error}`);
    }
  };

  // Edit Function submit
  const handleEditFunctionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingFunction) return;
    const formData = new FormData(e.currentTarget);
    const res = await updateFunctionAction(editingFunction.id, event.id, formData);
    if (res.success) {
      setFunctions((prev) =>
        prev.map((f) =>
          f.id === editingFunction.id
            ? {
                ...f,
                name: formData.get("name")?.toString() || f.name,
                date: formData.get("date")?.toString() || f.date,
                start_time: formData.get("startTime")?.toString() || null,
                notes: formData.get("notes")?.toString() || null,
              }
            : f
        )
      );
      setEditingFunction(null);
      router.refresh();
    } else {
      alert(`Error: ${res.error}`);
    }
  };

  // Delete Function
  const handleDeleteFunction = async (functionId: string) => {
    if (!confirm("Are you sure you want to delete this sub-function and all its items?")) return;
    const res = await deleteFunctionAction(functionId, event.id);
    if (res.success) {
      setFunctions((prev) => prev.filter((f) => f.id !== functionId));
      setItemsByFunction((prev) => {
        const copy = { ...prev };
        delete copy[functionId];
        return copy;
      });
      router.refresh();
    } else {
      alert(`Error deleting function: ${res.error}`);
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
      const newItem: AdminItem = {
        id: (res as any).itemId || `item-${Date.now()}`,
        function_id: targetFunc,
        category: (formData.get("category")?.toString() || "decor") as any,
        title: formData.get("title")?.toString() || "",
        vendor: formData.get("vendor")?.toString() || null,
        cost: parseFloat(formData.get("cost")?.toString() || "0") || 0,
        notes: formData.get("notes")?.toString() || null,
        status: (formData.get("status")?.toString() || "not_started") as any,
      };

      setItemsByFunction((prev) => {
        const copy = { ...prev };
        const list = copy[targetFunc] ? [...copy[targetFunc]] : [];
        if (!list.some((it) => it.id === newItem.id)) {
          list.push(newItem);
        }
        copy[targetFunc] = list;
        return copy;
      });

      setShowAddItem(false);
      router.refresh();
    } else {
      alert(`Error: ${res.error}`);
    }
  };

  // Edit Item submit
  const handleEditItemSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;
    const formData = new FormData(e.currentTarget);
    const res = await updateItemAction(editingItem.item.id, event.id, formData);
    if (res.success) {
      const updated: AdminItem = {
        ...editingItem.item,
        category: (formData.get("category")?.toString() || editingItem.item.category) as any,
        title: formData.get("title")?.toString() || editingItem.item.title,
        vendor: formData.get("vendor")?.toString() || null,
        cost: parseFloat(formData.get("cost")?.toString() || "0") || 0,
        notes: formData.get("notes")?.toString() || null,
        status: (formData.get("status")?.toString() || editingItem.item.status) as any,
      };

      setItemsByFunction((prev) => {
        const copy = { ...prev };
        for (const fId of Object.keys(copy)) {
          copy[fId] = copy[fId].map((it) => (it.id === updated.id ? updated : it));
        }
        return copy;
      });

      setEditingItem(null);
      router.refresh();
    } else {
      alert(`Error updating item: ${res.error}`);
    }
  };

  // Delete Item
  const handleDeleteItem = async (itemId: string, functionId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    const res = await deleteItemAction(itemId, event.id);
    if (res.success) {
      setItemsByFunction((prev) => {
        const copy = { ...prev };
        if (copy[functionId]) {
          copy[functionId] = copy[functionId].filter((it) => it.id !== itemId);
        }
        return copy;
      });
      router.refresh();
    } else {
      alert(`Error deleting item: ${res.error}`);
    }
  };

  // Gather items to display in tracking view
  const displayItems = Object.entries(itemsByFunction)
    .filter(([funcId]) =>
      selectedFunctionId === "all" ? true : funcId === selectedFunctionId
    )
    .flatMap(([funcId, items]) => items.map((it) => ({ ...it, parentFunctionId: funcId })));

  const categories = ["lighting", "flowers", "decor", "instruments", "other"] as const;

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. Header Banner & Status                                     */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-surface p-6 sm:p-8 rounded-radius-lg border border-border shadow-[var(--shadow-sm)] space-y-5">
        <div className="flex items-center justify-between text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <Link href="/admin/events" className="hover:text-accent font-medium transition-colors">
              ← Events
            </Link>
            <span className="text-border">/</span>
            <span className="capitalize font-semibold text-accent">{eventData.type}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowEditEventModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-radius-md border border-border text-xs font-medium text-ink hover:border-accent hover:text-accent transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Event Details
          </button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3 flex-wrap text-xs text-ink-muted">
              <span className="px-2.5 py-0.5 rounded-radius-sm bg-accent/10 border border-accent/30 text-accent font-semibold tracking-wider uppercase text-[11px]">
                {eventData.type}
              </span>
              <span className="inline-flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {eventData.date}
              </span>
              <span className="inline-flex items-center gap-1 truncate">
                <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {eventData.venue}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
              {eventData.name}
            </h1>

          </div>

          <div className="flex items-center gap-3 flex-wrap shrink-0">
            <Link
              href={`/admin/events/${event.id}`}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-radius-md border border-accent/40 bg-accent/10 text-accent text-xs font-semibold hover:bg-accent hover:text-accent-ink transition-all min-h-[40px] shadow-sm"
              title="Manage event share link"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <span>Event share link</span>
            </Link>

            <div className="flex items-center gap-2">
              <label htmlFor="event-detail-status" className="sr-only">
                Event Status
              </label>
              <select
                id="event-detail-status"
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as AdminEventSummary['status'])}
                className="text-xs font-semibold px-3 py-2 rounded-radius-md border border-border bg-bg text-ink focus:ring-1 focus:ring-accent min-h-[40px]"
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

      <EventShareLinkPanel eventId={event.id} initialLink={initialShareLink} />

      {/* ------------------------------------------------------------- */}
      {/* 2. Swipeable Tab Bar with Active Indicator                    */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-border text-sm">
        {[
          { key: "items", label: "Items & Production" },
          { key: "functions", label: `Sub-Events (${functions.length})` },
          { key: "budget", label: "Budget & Payments" },
          { key: "designs", label: "3D Renders" },
          { key: "timeline", label: "Timeline" },
          { key: "guests", label: "Guest List" },
        ].map((t) => {
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key as TabType)}
              className={`px-4 py-2.5 font-medium whitespace-nowrap text-xs sm:text-sm transition-all border-b-2 -mb-[2px] ${
                isActive
                  ? "border-accent text-accent font-semibold"
                  : "border-transparent text-ink-muted hover:text-ink hover:border-border"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: Tracking View (Items grouped by Category)              */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "items" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <label htmlFor="filter-function-items" className="text-xs font-semibold text-ink-muted uppercase">
                Filter:
              </label>
              <select
                id="filter-function-items"
                value={selectedFunctionId}
                onChange={(e) => setSelectedFunctionId(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-radius-md border border-border bg-surface text-ink focus:ring-1 focus:ring-accent min-h-[36px]"
              >
                <option value="all">All Sub-Events ({functions.length})</option>
                {functions.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowAddItem(true)}
              className="inline-flex items-center justify-center px-4 py-2 bg-accent text-accent-ink rounded-radius-md font-semibold text-xs hover:bg-accent-hover transition-colors shadow-[var(--shadow-sm)] min-h-[40px]"
            >
              + Add Item
            </button>
          </div>

          {/* Grouped Category Cards */}
          {categories.map((cat) => {
            const catItems = displayItems.filter((i) => i.category === cat);
            if (catItems.length === 0) return null;

            const categoryTotal = catItems.reduce((acc, curr) => acc + (curr.cost || 0), 0);

            return (
              <div
                key={cat}
                className="bg-surface rounded-radius-lg border border-border shadow-[var(--shadow-sm)] overflow-hidden"
              >
                <div className="bg-bg/60 px-5 py-3.5 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    <h3 className="font-heading font-bold text-base text-ink capitalize">
                      {cat}
                    </h3>
                    <span className="text-xs font-mono text-ink-muted font-normal">
                      ({catItems.length})
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-ink">
                    ₹{formatNumber(categoryTotal)}
                  </span>
                </div>

                <div className="divide-y divide-border/60">
                  {catItems.map((item, idx) => {
                    const statusBadgeClass = {
                      not_started: "bg-ink-muted/10 text-ink-muted border-border",
                      in_progress: "bg-warning-light text-warning border-warning/30",
                      done: "bg-success-light text-success border-success/30",
                    }[item.status];

                    const statusLabel = {
                      not_started: "Not Started",
                      in_progress: "In Progress",
                      done: "Done",
                    }[item.status];

                    return (
                      <div
                        key={`${item.id}-${idx}`}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-bg/20 transition-colors"
                      >
                        <div className="space-y-1.5 flex-1">
                          <h4 className="font-semibold text-sm text-ink leading-tight">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-ink-muted flex-wrap">
                            {item.vendor && (
                              <span className="inline-flex items-center gap-1 font-medium text-ink">
                                <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                {item.vendor}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 font-mono font-semibold text-ink">
                              ₹{formatNumber(item.cost)}
                            </span>
                            {item.notes && (
                              <span className="text-ink-muted italic">
                                &bull; {item.notes}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions: Edit, Delete, Status Toggle */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleItemStatusCycle(item, item.parentFunctionId)}
                            className={`px-3 py-1 rounded-radius-full text-xs font-semibold border transition-all hover:scale-105 min-h-[32px] ${statusBadgeClass}`}
                            title="Click to toggle status: Not Started → In Progress → Done"
                          >
                            {statusLabel}
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingItem({ item, functionId: item.parentFunctionId })}
                            className="p-1.5 rounded-radius-sm border border-border text-ink-muted hover:text-accent hover:border-accent transition-colors"
                            title="Edit Item"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id, item.parentFunctionId)}
                            className="p-1.5 rounded-radius-sm border border-border text-ink-muted hover:text-danger hover:border-danger transition-colors"
                            title="Delete Item"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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
            <div className="text-center py-12 bg-surface rounded-radius-lg border border-border text-ink-muted text-sm space-y-3">
              <p>No production items logged for this selection.</p>
              <button
                type="button"
                onClick={() => setShowAddItem(true)}
                className="px-4 py-2 bg-accent text-accent-ink text-xs font-semibold rounded-radius-md hover:bg-accent-hover transition-colors"
              >
                + Add First Item
              </button>
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
            <div>
              <h2 className="text-lg font-heading font-bold text-ink">
                Sub-Events &amp; Ceremonies
              </h2>
              <p className="text-xs text-ink-muted">
                Manage each wedding or party function schedule and notes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddFunction(true)}
              className="inline-flex items-center justify-center px-4 py-2 bg-accent text-accent-ink text-xs font-semibold rounded-radius-md hover:bg-accent-hover transition-colors min-h-[40px]"
            >
              + Add Sub-Function
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {functions.map((func) => (
              <div
                key={func.id}
                className="bg-surface p-5 rounded-radius-lg border border-border shadow-[var(--shadow-sm)] flex flex-col justify-between space-y-3 hover:border-accent/40 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading font-bold text-base text-ink">
                      {func.name}
                    </h3>
                    <span className="text-xs font-mono text-accent font-semibold px-2 py-0.5 rounded-radius-sm bg-accent/10 border border-accent/20">
                      {func.start_time || "TBD"}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {func.date}
                  </p>
                  {func.notes && (
                    <p className="text-xs text-ink-muted pt-2 border-t border-border line-clamp-3">
                      {func.notes}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setEditingFunction(func)}
                    className="px-2.5 py-1 text-ink-muted hover:text-accent font-medium rounded-radius-sm border border-border hover:border-accent transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteFunction(func.id)}
                    className="px-2.5 py-1 text-danger hover:bg-danger-light font-medium rounded-radius-sm border border-danger/30 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {functions.length === 0 && (
            <div className="text-center py-12 bg-surface rounded-radius-lg border border-border text-ink-muted text-sm space-y-3">
              <p>No sub-events created yet.</p>
              <button
                type="button"
                onClick={() => setShowAddFunction(true)}
                className="px-4 py-2 bg-accent text-accent-ink text-xs font-semibold rounded-radius-md hover:bg-accent-hover transition-colors"
              >
                + Create Sub-Function
              </button>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* OTHER TABS                                                    */}
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
        <DesignsTab
          eventId={event.id}
          initialDesigns={initialDesigns}
        />
      )}

      {activeTab === "timeline" && (
        <TimelineTab
          eventId={event.id}
          functions={functions}
          initialTimeline={initialTimeline}
        />
      )}

      {activeTab === "guests" && (
        <GuestListTab
          eventId={event.id}
          eventName={event.name}
          initialGuests={initialGuests}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Edit Event Details                                     */}
      {/* ------------------------------------------------------------- */}
      {showEditEventModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
          onClick={() => setShowEditEventModal(false)}
        >
          <div
            className="w-full max-w-md bg-surface rounded-radius-lg border border-border shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-heading font-bold text-ink">
              Edit Event Information
            </h3>
            <form onSubmit={handleEditEventSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-semibold uppercase text-ink mb-1">
                  Event Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={eventData.name}
                  required
                  className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-sm focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-ink mb-1">
                    Type
                  </label>
                  <select
                    name="type"
                    defaultValue={eventData.type}
                    className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-sm focus:ring-1 focus:ring-accent"
                  >
                    <option value="wedding">Wedding</option>
                    <option value="birthday">Birthday</option>
                    <option value="function">Function</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-ink mb-1">
                    Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={eventData.date}
                    required
                    className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-sm focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-ink mb-1">
                  Venue <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="venue"
                  defaultValue={eventData.venue}
                  required
                  className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-sm focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditEventModal(false)}
                  className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink min-h-[40px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-accent text-accent-ink rounded-radius-md text-xs font-semibold hover:bg-accent-hover min-h-[40px]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
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
                    defaultValue={eventData.date}
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
                  className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink min-h-[40px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-accent text-accent-ink rounded-radius-md text-xs font-semibold hover:bg-accent-hover min-h-[40px]"
                >
                  Save Function
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Edit Sub-Function                                      */}
      {/* ------------------------------------------------------------- */}
      {editingFunction && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
          onClick={() => setEditingFunction(null)}
        >
          <div
            className="w-full max-w-md bg-surface rounded-radius-lg border border-border shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-heading font-bold text-ink">
              Edit Sub-Function
            </h3>
            <form onSubmit={handleEditFunctionSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-semibold uppercase text-ink mb-1">
                  Function Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingFunction.name}
                  required
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
                    defaultValue={editingFunction.date}
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
                    defaultValue={editingFunction.start_time || ""}
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
                  defaultValue={editingFunction.notes || ""}
                  className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-sm focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingFunction(null)}
                  className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink min-h-[40px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-accent text-accent-ink rounded-radius-md text-xs font-semibold hover:bg-accent-hover min-h-[40px]"
                >
                  Save Changes
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
              Add Item to Production Tracker
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
                  className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink min-h-[40px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-accent text-accent-ink rounded-radius-md text-xs font-semibold hover:bg-accent-hover min-h-[40px]"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Edit Item Details                                      */}
      {/* ------------------------------------------------------------- */}
      {editingItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
          onClick={() => setEditingItem(null)}
        >
          <div
            className="w-full max-w-md bg-surface rounded-radius-lg border border-border shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-heading font-bold text-ink">
              Edit Item Details
            </h3>
            <form onSubmit={handleEditItemSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-ink mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    defaultValue={editingItem.item.category}
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
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={editingItem.item.status}
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
                  defaultValue={editingItem.item.title}
                  required
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
                    defaultValue={editingItem.item.vendor || ""}
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
                    defaultValue={editingItem.item.cost}
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
                  defaultValue={editingItem.item.notes || ""}
                  className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-sm focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink min-h-[40px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-accent text-accent-ink rounded-radius-md text-xs font-semibold hover:bg-accent-hover min-h-[40px]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
