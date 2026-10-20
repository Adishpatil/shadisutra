import Link from "next/link";
import { site } from "@/config/site";
import { pageMetadata } from "@/config/seo";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

export const metadata = pageMetadata(
  "Services",
  `Explore wedding, birthday, and function planning services from ${site.name}.`,
  "/services"
);

const serviceCards = [
  {
    slug: "weddings",
    title: "Weddings & Pre-Wedding Ceremonies",
    subtitle: "Haldi, Mehendi, Sangeet & Reception",
    description:
      "End-to-end wedding production tailored to your traditions. We manage conceptual stage décor, mandap architecture, floral artistry, lighting sequences, and day-of coordination.",
    image: "/images/services/weddings.webp",
    aspectRatio: 16 / 9,
    highlights: [
      "Custom Mandap & Stage Architecture",
      "Fresh Exotic & Seasonal Floral Styling",
      "Mood, Ambient & Kinetic Stage Lighting",
      "Traditional Shehnai, Dhol & Acoustic Ensemble",
      "Guest Hospitality & On-Ground Timeline Control",
    ],
  },
  {
    slug: "birthdays",
    title: "Birthdays & Milestone Galas",
    subtitle: "From 1st Birthdays to 50th Jubilees",
    description:
      "Creative themes and atmospheric experiences curated to delight guests of all ages. Stunning photo backdrops, interactive entertainment, ambient sound, and seamless coordination.",
    image: "/images/services/birthdays.webp",
    aspectRatio: 16 / 9,
    highlights: [
      "Immersive Custom Theme Concepts",
      "Organic Balloon Installations & Backdrop Art",
      "Dynamic Sound & Live Entertainment Curation",
      "Themed Cake Stage & Dessert Table Styling",
      "Vendor Coordination & Timed Surprises",
    ],
  },
  {
    slug: "functions",
    title: "Functions & Corporate Gatherings",
    subtitle: "Anniversaries, Galas & Corporate Evenings",
    description:
      "Polished, professional event production for celebrations, cultural gatherings, and corporate galas. High-end staging, AV integration, and flawless itinerary management.",
    image: "/images/services/functions.webp",
    aspectRatio: 16 / 9,
    highlights: [
      "Modular Staging & Professional AV Systems",
      "Refined Minimalist Table & Hall Décor",
      "Artist & MC Stage Management",
      "Registration & VIP Guest Coordination",
      "Precision Itinerary & Protocol Execution",
    ],
  },
];

const pillars = [
  {
    title: "Full-Cycle Planning",
    desc: "From initial budget allocation and venue walkthroughs to vendor contract vetting and logistical planning.",
    icon: "📋",
  },
  {
    title: "Bespoke Décor & Architecture",
    desc: "3D concepts, fabric draping, structural stage design, and bespoke centerpieces tailored to your aesthetic.",
    icon: "✨",
  },
  {
    title: "Ambient & Architectural Lighting",
    desc: "Warm mood washes, beam effects, fairy light canopies, and kinetic stage lighting engineered for stunning photos.",
    icon: "💡",
  },
  {
    title: "Artisanal Floral Styling",
    desc: "Locally sourced and exotic blooms crafted into fragrant garlands, floral arches, and delicate dining runners.",
    icon: "🌸",
  },
  {
    title: "Music & Live Instruments",
    desc: "Acoustic ensembles, traditional instrumentalists, DJ sound setups, and seamless audio reinforcement.",
    icon: "🎶",
  },
  {
    title: "Day-of Coordination",
    desc: "Dedicated shadow planners for hosts, backstage production crew, and synchronized vendor cue management.",
    icon: "⏱️",
  },
];

export default function ServicesPage() {
  return (
    <div className="pt-24 pb-20">
      {/* Header */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center py-12 sm:py-16">
        <span className="text-xs font-semibold tracking-widest uppercase text-accent">
          What We Do
        </span>
        <h1 className="mt-3 text-4xl sm:text-5xl font-heading font-bold text-ink">
          Curated Event Services
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-ink-muted leading-relaxed max-w-3xl mx-auto">
          Every celebration is unique. Explore our specialized services designed to bring your vision to life
          with elegance, calm, and flawless execution.
        </p>
      </section>

      {/* 3 Main Pillars Cards */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 my-8">
        {serviceCards.map((service, index) => {
          const isEven = index % 2 === 1;
          return (
            <div
              key={service.slug}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center p-6 sm:p-10 bg-surface border border-border rounded-radius-lg shadow-[var(--shadow-sm)]`}
            >
              <div
                className={`lg:col-span-6 rounded-radius-md overflow-hidden relative ${
                  isEven ? "lg:order-2" : "lg:order-1"
                }`}
              >
                <PlaceholderImage
                  src={service.image}
                  alt={service.title}
                  aspectRatio={service.aspectRatio}
                  className="w-full h-auto object-cover rounded-radius-md"
                />
              </div>

              <div
                className={`lg:col-span-6 space-y-5 ${
                  isEven ? "lg:order-1" : "lg:order-2"
                }`}
              >
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                    {service.subtitle}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink mt-1">
                    {service.title}
                  </h2>
                </div>

                <p className="text-ink-muted text-base leading-relaxed">
                  {service.description}
                </p>

                <div className="space-y-2.5 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
                    What&apos;s Included:
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-ink-muted">
                    {service.highlights.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 flex flex-wrap gap-4 items-center">
                  <Link
                    href={`/services/${service.slug}`}
                    className="inline-flex items-center px-6 py-3 bg-accent text-accent-ink font-semibold rounded-radius-full text-sm hover:bg-accent-hover transition-colors shadow-[var(--shadow-sm)]"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/contact?service=${service.slug}`}
                    className="inline-flex items-center px-6 py-3 border border-border text-ink font-medium rounded-radius-full text-sm hover:border-accent hover:text-accent transition-colors"
                  >
                    Enquire Now
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Scope Matrix */}
      <section className="bg-surface border-y border-border py-16 sm:py-24 my-16">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold tracking-widest uppercase text-accent">
              Core Capabilities
            </span>
            <h2 className="mt-2 text-3xl font-heading font-bold text-ink">
              What Is Covered In Every Engagement
            </h2>
            <p className="mt-4 text-ink-muted">
              We handle every technical, logistical, and artistic dimension so you never have to juggle vendors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="p-6 rounded-radius-lg bg-bg border border-border flex flex-col justify-between"
              >
                <div>
                  <span className="text-3xl mb-4 block" aria-hidden="true">
                    {pillar.icon}
                  </span>
                  <h3 className="text-xl font-heading font-semibold text-ink">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-sm text-ink-muted leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center py-8">
        <h2 className="text-3xl font-heading font-bold text-ink">
          Need a Custom Plan for Your Celebration?
        </h2>
        <p className="mt-4 text-ink-muted text-base max-w-xl mx-auto">
          Get in touch with our team for a personalised walkthrough and quotation.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-3.5 bg-accent text-accent-ink font-semibold rounded-radius-full hover:bg-accent-hover transition-colors shadow-[var(--shadow-md)]"
          >
            Request a Consultation
          </Link>
        </div>
      </section>
    </div>
  );
}
