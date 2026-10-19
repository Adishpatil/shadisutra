import { getAdminCustomers, getAdminEvents } from "@/lib/admin/data";
import { CustomerViewClient } from "@/components/admin/CustomerViewClient";

export default async function AdminCustomersPage() {
  const [customers, events] = await Promise.all([
    getAdminCustomers(),
    getAdminEvents(),
  ]);

  const eventOptions = events.map((e) => ({
    id: e.id,
    name: e.name,
  }));

  return (
    <div className="space-y-6">
      <CustomerViewClient
        initialCustomers={customers}
        events={eventOptions}
      />
    </div>
  );
}
