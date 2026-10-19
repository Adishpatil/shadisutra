import { getAdminEvents } from "@/lib/admin/data";
import { EventsViewClient } from "@/components/admin/EventsViewClient";

export default async function AdminEventsPage() {
  return (
    <div>
      <EventsViewClient initialEvents={await getAdminEvents()} />
    </div>
  );
}
