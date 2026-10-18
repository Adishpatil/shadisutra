import { notFound } from "next/navigation";
import { getAdminEventById } from "@/lib/admin/data";
import { EventDetailClient } from "@/components/admin/EventDetailClient";

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { event, functions, itemsByFunction } = await getAdminEventById(id);

  if (!event) {
    notFound();
  }

  return (
    <div>
      <EventDetailClient
        event={event}
        initialFunctions={functions}
        initialItemsByFunction={itemsByFunction}
      />
    </div>
  );
}
