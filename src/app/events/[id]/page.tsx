import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicEventShowcase } from "@/lib/events/public-data";
import { EventShowcaseClient } from "@/components/events/EventShowcaseClient";

interface EventPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getPublicEventShowcase(id);

  if (!event) {
    return {
      title: "Event Itinerary – Shadi Sutra",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${event.name} – Celebrations & Schedule | Shadi Sutra`,
    description: `Official schedule, venue directions, and ceremony details for ${event.name} at ${event.venue}.`,
    openGraph: {
      title: `${event.name} – Celebrations & Schedule`,
      description: `Official schedule, venue directions, and ceremony details for ${event.name}.`,
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function EventShowcasePage({ params }: EventPageProps) {
  const { id } = await params;
  const event = await getPublicEventShowcase(id);

  if (!event) {
    notFound();
  }

  return <EventShowcaseClient event={event} />;
}
