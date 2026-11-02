import { notFound } from "next/navigation";
import { getAdminEventById, getEventBudgetAndPayments } from "@/lib/admin/data";
import { getEventGuests } from "@/lib/guests/data";
import { getEventDesigns, getEventTimelineEntries } from "@/lib/admin/designs-timeline-data";
import { getAdminEventShareLink } from "@/lib/events/share-actions";
import { getAdminEventClientShareLink } from "@/lib/events/client-share-actions";
import { getEventMoneyRecords } from "@/lib/admin/event-money-data";
import { EventDetailClient } from "@/components/admin/EventDetailClient";

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [
    { event, functions, itemsByFunction },
    budgetData,
    guests,
    designs,
    timeline,
    shareLink,
    clientShareLink,
    expenses,
  ] =
    await Promise.all([
      getAdminEventById(id),
      getEventBudgetAndPayments(id),
      getEventGuests(id),
      getEventDesigns(id),
      getEventTimelineEntries(id),
      getAdminEventShareLink(id),
      getAdminEventClientShareLink(id),
      getEventMoneyRecords(id),
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
        initialGuests={guests}
        initialDesigns={designs}
        initialTimeline={timeline}
        initialShareLink={shareLink}
        initialClientShareLink={clientShareLink}
        initialExpenses={expenses}
      />
    </div>
  );
}
