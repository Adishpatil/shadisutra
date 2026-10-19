import { notFound } from "next/navigation";
import { getAdminEventById, getEventBudgetAndPayments } from "@/lib/admin/data";
import { getEventGuests } from "@/lib/guests/data";
import { getEventDesigns, getEventTimelineEntries } from "@/lib/admin/designs-timeline-data";
import { EventDetailClient } from "@/components/admin/EventDetailClient";

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [{ event, functions, itemsByFunction }, budgetData, guests, designs, timeline] =
    await Promise.all([
      getAdminEventById(id),
      getEventBudgetAndPayments(id),
      getEventGuests(id),
      getEventDesigns(id),
      getEventTimelineEntries(id),
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
      />
    </div>
  );
}
