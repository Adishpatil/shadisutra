"use client";

import { useState, useRef } from "react";
import type { GuestRecord } from "@/lib/guests/data";
import {
  parseGuestCSV,
  parseGuestExcel,
  exportGuestsToExcel,
  generateGuestTemplateExcel,
  type GuestRow,
} from "@/lib/guests/guest-engine";
import { addGuestAction, importGuestsAction, deleteGuestAction } from "@/lib/guests/actions";

interface GuestListTabProps {
  eventId: string;
  eventName: string;
  initialGuests: GuestRecord[];
}

export function GuestListTab({ eventId, eventName, initialGuests }: GuestListTabProps) {
  const [guests, setGuests] = useState<GuestRecord[]>(initialGuests);
  const [search, setSearch] = useState("");
  const [rsvpFilter, setRsvpFilter] = useState<string>("all");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Import flow state
  const [importPreview, setImportPreview] = useState<GuestRow[]>([]);
  const [importErrors, setImportErrors] = useState<{ row: number; message: string }[]>([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stats calculation
  const totalGuestsCount = guests.reduce((sum, g) => sum + (Number(g.party_size) || 1), 0);
  const confirmedCount = guests
    .filter((g) => g.rsvp === "yes")
    .reduce((sum, g) => sum + (Number(g.party_size) || 1), 0);
  const pendingCount = guests
    .filter((g) => g.rsvp === "pending")
    .reduce((sum, g) => sum + (Number(g.party_size) || 1), 0);
  const declinedCount = guests
    .filter((g) => g.rsvp === "no")
    .reduce((sum, g) => sum + (Number(g.party_size) || 1), 0);

  // Filtered list
  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.phone && g.phone.includes(search)) ||
      (g.table_no && g.table_no.toLowerCase().includes(search.toLowerCase()));

    const matchesRsvp = rsvpFilter === "all" || g.rsvp === rsvpFilter;

    return matchesSearch && matchesRsvp;
  });

  // Handle Export to Excel
  const handleExport = async () => {
    try {
      const buffer = await exportGuestsToExcel(guests, eventName);
      const blob = new Blob([buffer as any], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${eventName.toLowerCase().replace(/\s+/g, "-")}-guest-list.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export Excel file");
    }
  };

  // Handle Download Template
  const handleDownloadTemplate = async () => {
    try {
      const buffer = await generateGuestTemplateExcel();
      const blob = new Blob([buffer as any], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "shadi-sutra-guest-template.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download template");
    }
  };

  // Handle File Selection (CSV or Excel)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File size exceeds 2 MB limit");
      return;
    }

    try {
      if (file.name.endsWith(".csv")) {
        const text = await file.text();
        const { validRows, errors } = parseGuestCSV(text);
        setImportPreview(validRows);
        setImportErrors(errors);
      } else if (file.name.endsWith(".xlsx")) {
        const buffer = await file.arrayBuffer();
        const { validRows, errors } = await parseGuestExcel(buffer);
        setImportPreview(validRows);
        setImportErrors(errors);
      } else {
        alert("Please upload a .csv or .xlsx file");
      }
    } catch {
      alert("Error parsing file format");
    }
  };

  // Confirm Import
  const handleConfirmImport = async () => {
    if (importPreview.length === 0) return;
    setImporting(true);

    const res = await importGuestsAction(eventId, importPreview);
    if (res.success) {
      // Local optimistic update
      const newGuests: GuestRecord[] = importPreview.map((r, i) => ({
        ...r,
        id: `imported-${Date.now()}-${i}`,
        event_id: eventId,
      }));
      setGuests((prev) => [...prev, ...newGuests]);
      setShowImportModal(false);
      setImportPreview([]);
      setImportErrors([]);
    } else {
      alert(res.error || "Import failed");
    }
    setImporting(false);
  };

  // Delete Guest
  const handleDeleteGuest = async (guestId: string) => {
    if (!confirm("Are you sure you want to remove this guest?")) return;
    setGuests((prev) => prev.filter((g) => g.id !== guestId));
    await deleteGuestAction(eventId, guestId);
  };

  return (
    <div className="space-y-6">
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface p-4 rounded-radius-lg border border-border shadow-[var(--shadow-sm)]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Total Expected
          </span>
          <p className="text-xl sm:text-2xl font-bold text-ink mt-1">
            {totalGuestsCount} <span className="text-xs font-normal text-ink-muted">guests ({guests.length} parties)</span>
          </p>
        </div>

        <div className="bg-surface p-4 rounded-radius-lg border border-border shadow-[var(--shadow-sm)]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-success">
            Confirmed (Attending)
          </span>
          <p className="text-xl sm:text-2xl font-bold text-success mt-1">
            {confirmedCount}
          </p>
        </div>

        <div className="bg-surface p-4 rounded-radius-lg border border-border shadow-[var(--shadow-sm)]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-warning">
            Pending RSVP
          </span>
          <p className="text-xl sm:text-2xl font-bold text-warning mt-1">
            {pendingCount}
          </p>
        </div>

        <div className="bg-surface p-4 rounded-radius-lg border border-border shadow-[var(--shadow-sm)]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-danger">
            Declined
          </span>
          <p className="text-xl sm:text-2xl font-bold text-danger mt-1">
            {declinedCount}
          </p>
        </div>
      </div>

      {/* 2. Action Toolbar & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-4 rounded-radius-lg border border-border">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or table..."
            className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-xs focus:ring-1 focus:ring-accent min-h-[40px]"
          />
          <select
            value={rsvpFilter}
            onChange={(e) => setRsvpFilter(e.target.value)}
            className="text-xs font-medium px-3 py-2 rounded-radius-md border border-border bg-bg text-ink min-h-[40px]"
          >
            <option value="all">All RSVP</option>
            <option value="yes">Attending</option>
            <option value="pending">Pending</option>
            <option value="no">Declined</option>
          </select>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-radius-md border border-border text-ink bg-bg hover:bg-surface transition-colors min-h-[40px]"
          >
            <span>📊</span>
            <span>Export Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-radius-md border border-accent/40 bg-accent/10 text-accent hover:bg-accent hover:text-accent-ink transition-colors min-h-[40px]"
          >
            <span>📥</span>
            <span>Import (.xlsx/.csv)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-radius-md bg-accent text-accent-ink hover:bg-accent-hover transition-colors min-h-[40px]"
          >
            <span>+ Quick Add</span>
          </button>
        </div>
      </div>

      {/* 3. Guests List (Desktop Table ≥ 768px) */}
      <div className="hidden md:block bg-surface rounded-radius-lg border border-border shadow-[var(--shadow-sm)] overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-bg text-ink-muted uppercase tracking-wider font-semibold">
              <th className="py-3 px-4">Guest / Family</th>
              <th className="py-3 px-4 text-center">Party Size</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">RSVP</th>
              <th className="py-3 px-4">Table / Seating</th>
              <th className="py-3 px-4">Notes</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredGuests.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-ink-muted">
                  No guest entries found matching current filter.
                </td>
              </tr>
            ) : (
              filteredGuests.map((g) => {
                const rsvpBadge = {
                  yes: "bg-success-light text-success border-success/30",
                  pending: "bg-warning-light text-warning border-warning/30",
                  no: "bg-danger-light text-danger border-danger/30",
                }[g.rsvp];

                return (
                  <tr key={g.id} className="hover:bg-bg/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-ink">
                      {g.name}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-accent">
                      {g.party_size}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-ink-muted">
                      {g.phone || "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-radius-sm text-[10px] font-bold uppercase tracking-wider border ${rsvpBadge}`}
                      >
                        {g.rsvp === "yes" ? "Attending" : g.rsvp}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-ink">
                      {g.table_no || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-ink-muted max-w-xs truncate">
                      {g.notes || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteGuest(g.id!)}
                        className="text-danger hover:underline font-semibold"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Guests Stacked Cards (< 768px Mobile First) */}
      <div className="md:hidden space-y-3">
        {filteredGuests.length === 0 ? (
          <div className="p-8 text-center bg-surface border border-dashed border-border rounded-radius-lg text-ink-muted text-xs">
            No guests found. Tap &quot;+ Quick Add&quot; or &quot;Import&quot; to begin.
          </div>
        ) : (
          filteredGuests.map((g) => {
            const rsvpBadge = {
              yes: "bg-success-light text-success border-success/30",
              pending: "bg-warning-light text-warning border-warning/30",
              no: "bg-danger-light text-danger border-danger/30",
            }[g.rsvp];

            return (
              <div
                key={g.id}
                className="bg-surface p-4 rounded-radius-lg border border-border shadow-[var(--shadow-sm)] space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-heading font-bold text-sm text-ink">{g.name}</h4>
                    <span className="text-xs text-accent font-semibold">
                      Party of {g.party_size}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-radius-sm text-[10px] font-bold uppercase tracking-wider border ${rsvpBadge}`}
                  >
                    {g.rsvp === "yes" ? "Attending" : g.rsvp}
                  </span>
                </div>

                <div className="text-xs text-ink-muted space-y-1 pt-1 border-t border-border/50">
                  {g.phone && <p>📞 Phone: <span className="font-mono text-ink">{g.phone}</span></p>}
                  {g.table_no && <p>🪑 Table: <span className="font-semibold text-ink">{g.table_no}</span></p>}
                  {g.notes && <p className="italic text-ink-muted">📝 {g.notes}</p>}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDeleteGuest(g.id!)}
                    className="text-xs text-danger hover:underline font-semibold min-h-[36px]"
                  >
                    Remove Guest
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. MODAL: Quick Add Single Guest */}
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
                Add Guest / Party
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
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const res = await addGuestAction(eventId, formData);
                if (res.success) {
                  // Optimistic addition
                  const newG: GuestRecord = {
                    id: `local-${Date.now()}`,
                    event_id: eventId,
                    name: String(formData.get("name")),
                    party_size: Number(formData.get("party_size")) || 1,
                    phone: String(formData.get("phone") || "") || null,
                    rsvp: (formData.get("rsvp") as any) || "pending",
                    table_no: String(formData.get("table_no") || "") || null,
                    notes: String(formData.get("notes") || "") || null,
                  };
                  setGuests((prev) => [newG, ...prev]);
                  setShowAddModal(false);
                } else {
                  alert(res.error || "Failed to add guest");
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Guest or Family Name *
                </label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Vikram & Sunita Malhotra"
                  className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-xs focus:ring-1 focus:ring-accent min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Party Size (1–50) *
                  </label>
                  <input
                    name="party_size"
                    type="number"
                    min="1"
                    max="50"
                    defaultValue="1"
                    required
                    className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-xs focus:ring-1 focus:ring-accent min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    RSVP Status
                  </label>
                  <select
                    name="rsvp"
                    defaultValue="pending"
                    className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-xs focus:ring-1 focus:ring-accent min-h-[44px]"
                  >
                    <option value="pending">Pending</option>
                    <option value="yes">Attending (Yes)</option>
                    <option value="no">Declined (No)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    name="phone"
                    placeholder="98XXXXXXXX"
                    className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-xs focus:ring-1 focus:ring-accent min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Table / Seating
                  </label>
                  <input
                    name="table_no"
                    placeholder="e.g. Table 4"
                    className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-xs focus:ring-1 focus:ring-accent min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Special Notes / Dietary
                </label>
                <input
                  name="notes"
                  placeholder="e.g. Jain meal, Bride's side"
                  className="w-full px-3 py-2 rounded-radius-md border border-border bg-bg text-ink text-xs focus:ring-1 focus:ring-accent min-h-[44px]"
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
                  Save Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: Batch Import (.xlsx / .csv) */}
      {showImportModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
          onClick={() => setShowImportModal(false)}
        >
          <div
            className="w-full max-w-2xl bg-surface border border-border rounded-radius-lg p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                  Spreadsheet Ingestion
                </span>
                <h3 className="font-heading font-bold text-lg text-ink">
                  Import Guests (.xlsx or .csv)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="text-ink-muted hover:text-ink w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-ink-muted">
              Upload your guest spreadsheet (max 2 MB and up to 2,000 rows). Columns supported:{" "}
              <strong>Name, Party Size, Phone, RSVP, Table No, Notes</strong>.
            </p>

            {/* Template download link */}
            <div className="p-3 bg-accent/10 border border-accent/20 rounded-radius-md flex items-center justify-between gap-2 text-xs">
              <span className="text-ink">
                Need the standard spreadsheet format?
              </span>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="font-bold text-accent hover:underline whitespace-nowrap"
              >
                📥 Download Template (.xlsx)
              </button>
            </div>

            {/* File picker */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.csv"
                onChange={handleFileChange}
                className="block w-full text-xs text-ink file:mr-4 file:py-2.5 file:px-4 file:rounded-radius-md file:border-0 file:text-xs file:font-semibold file:bg-accent file:text-accent-ink hover:file:bg-accent-hover"
              />
            </div>

            {/* Errors breakdown */}
            {importErrors.length > 0 && (
              <div className="p-3 bg-danger-light border border-danger/30 rounded-radius-md text-xs text-danger space-y-1">
                <p className="font-bold">⚠️ Found {importErrors.length} row validation error(s):</p>
                <ul className="list-disc list-inside max-h-24 overflow-y-auto">
                  {importErrors.map((err, i) => (
                    <li key={i}>
                      Row {err.row}: {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preview table */}
            {importPreview.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-ink">
                  <span>Valid Rows Ready ({importPreview.length}):</span>
                </div>
                <div className="border border-border rounded-radius-md overflow-hidden max-h-48 overflow-y-auto text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-bg text-ink-muted">
                      <tr>
                        <th className="p-2">Name</th>
                        <th className="p-2">Size</th>
                        <th className="p-2">RSVP</th>
                        <th className="p-2">Table</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {importPreview.slice(0, 10).map((r, i) => (
                        <tr key={i}>
                          <td className="p-2 font-medium text-ink">{r.name}</td>
                          <td className="p-2 text-accent font-bold">{r.party_size}</td>
                          <td className="p-2 capitalize">{r.rsvp}</td>
                          <td className="p-2 text-ink-muted">{r.table_no || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {importPreview.length > 10 && (
                    <div className="p-2 text-center text-ink-muted bg-bg/50">
                      ...and {importPreview.length - 10} more rows
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={importPreview.length === 0 || importing}
                onClick={handleConfirmImport}
                className="px-5 py-2 bg-accent text-accent-ink rounded-radius-md text-xs font-semibold hover:bg-accent-hover disabled:opacity-50 min-h-[44px]"
              >
                {importing ? "Importing..." : `Confirm Import (${importPreview.length} Guests)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
