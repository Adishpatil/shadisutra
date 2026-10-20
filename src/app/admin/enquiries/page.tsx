import { getAdminEnquiries } from "@/lib/admin/data";
import { EnquiriesViewClient } from "@/components/admin/EnquiriesViewClient";

export default async function AdminEnquiriesPage() {
  return <EnquiriesViewClient enquiries={await getAdminEnquiries()} />;
}
