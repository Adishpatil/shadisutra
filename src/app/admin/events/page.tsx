import { getAdminEvents, getAdminCustomers } from "@/lib/admin/data";
import { EventsViewClient } from "@/components/admin/EventsViewClient";

export default async function AdminEventsPage() {
  const [events, customers] = await Promise.all([
    getAdminEvents(),
    getAdminCustomers(),
  ]);

  const customerOptions = customers.map((c) => ({
    id: c.id,
    name: `${c.full_name} (@${c.username})`,
  }));

  return (
    <div>
      <EventsViewClient initialEvents={events} customers={customerOptions} />
    </div>
  );
}
