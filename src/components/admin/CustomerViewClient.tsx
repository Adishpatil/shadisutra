"use client";

import { useState } from "react";
import type { AdminCustomerSummary } from "@/lib/admin/data";
import { CustomerList } from "@/components/admin/CustomerList";
import { CreateCustomerModal } from "@/components/admin/CreateCustomerModal";
import { useRouter } from "next/navigation";

interface CustomerViewClientProps {
  initialCustomers: AdminCustomerSummary[];
  events: { id: string; name: string }[];
}

export function CustomerViewClient({
  initialCustomers,
  events,
}: CustomerViewClientProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">
            Access &amp; Profiles
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink mt-1">
            Customer Accounts
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Provision portal logins, toggle access when events are finalized, and reset passwords.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-accent text-accent-ink rounded-radius-md font-semibold text-sm hover:bg-accent-hover transition-colors shadow-[var(--shadow-sm)] min-h-[44px]"
        >
          + Provision Customer
        </button>
      </div>

      <CustomerList initialCustomers={initialCustomers} />

      {modalOpen && (
        <CreateCustomerModal
          events={events}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
