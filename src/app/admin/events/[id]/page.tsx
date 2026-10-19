import { notFound } from "next/navigation";
import { getAdminEventById, getEventBudgetAndPayments } from "@/lib/admin/data";
import { EventDetailClient } from "@/components/admin/EventDetailClient";

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [{ event, functions, itemsByFunction }, budgetData] = await Promise.all([
    getAdminEventById(id),
    getEventBudgetAndPayments(id),
  ]);

  if (!event) {
    notFound();
  }

  return (
    <div>
      <EventDetailClient
        event={event}
        initialFunctions={functions}
        initialItemsByFunction={itemsByFunction}
        initialBudgetTotal={budgetData.agreedTotal}
        initialPayments={budgetData.payments}
        auditLogs={budgetData.auditLogs}
      />
    </div>
  );
}
