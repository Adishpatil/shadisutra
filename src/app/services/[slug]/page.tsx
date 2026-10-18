import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/config/site";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

interface ServiceDetail {
  slug: string;
  title: string;
  categoryName: string;
  tagline: string;
  heroImage: string;
  overview: string;
  capabilities: {
    category: string;
    description: string;
    deliverables: string[];
  }[];
  faq: {
    question: string;
    answer: string;
  }[];
}

const serviceData: Record<string, ServiceDetail> = {
  weddings: {
    slug: "weddings",
    title: "Wedding Planning & Event Management",
    categoryName: "Weddings",
    tagline: "Regal aesthetics, heartfelt rituals, and stress-free execution.",
    heroImage: "/images/gallery/weddings/wedding-mandap-01.webp",
    overview:
      "A wedding is an unforgettable milestone combining deep-rooted traditions and personal style. From vibrant pre-wedding Haldi, Mehendi, and Sangeet celebrations to the solemn Phere and grand Reception, we manage every artistic and logistical detail with poise.",
    capabilities: [
      {
        category: "Planning & Timeline",
        description: "Master event blueprints, day-by-day countdown itineraries, venue management, and shadow coordinators.",
        deliverables: [
          "Pre-wedding ceremony timeline mapping",
          "Family and bridal party coordination",
          "Budget formulation and vendor contracts",
        ],
      },
      {
        category: "Decor & Staging",
        description: "Tailored mandap setups, royal entry pathways, royal seating lounges, and thematic dining spaces.",
        deliverables: [
          "Architectural mandap design & structural sign-off",
          "Grand couple entry props and kinetic pyros (safe cold-pyro)",
          "Theme-matched furniture, drapes, and chandeliers",
        ],
      },
      {
        category: "Architectural & Mood Lighting",
        description: "Cinematic lighting schemes designed to flatter photographs, stage highlights, and ambient warmth.",
        deliverables: [
          "Warm ambient par-lighting and fairy canopies",
          "Sharpy beams and intelligent moving heads for Sangeet",
          "Subtle architectural wash for venue exterior and greenery",
        ],
      },
      {
        category: "Floral Design",
        description: "Bespoke floral architecture utilizing seasonal marigolds, imported orchids, roses, and fragrant mogra.",
        deliverables: [
          "Intricate floral jali work and mandap ceilings",
          "Scented entrance gateways and vedi decor",
          "Bridal floral jewellery and boutonnieres",
        ],
      },
      {
        category: "Music & Live Instruments",
        description: "From auspicious morning Shehnai and classical flute to energetic Punjabi Dholis and celebrity DJs.",
        deliverables: [
          "Traditional Mangal Vadya and live Shenai ensembles",
          "Baraat live percussionists and brass band",
          "Sangeet concert audio with digital acoustic mixers",
        ],
      },
      {
        category: "Hospitality & Coordination",
        description: "Dedicated hospitality desks, baggage handling, welcome hampers, and RSVP management.",
        deliverables: [
          "Dedicated coordinator for the Bride & Groom",
          "VIP guest hospitality & welcome tilak ceremony",
          "On-site emergency kit & vendor payment dispatch",
        ],
      },
    ],
    faq: [
      {
        question: "When should we begin planning our wedding with Shadi Sutra?",
        answer:
          "Ideally 4 to 9 months prior to your wedding dates. However, we also cater to expedited timelines depending on venue availability and season.",
      },
      {
        question: "Can we track our wedding items and finalized stage designs online?",
        answer:
          "Yes! Through our dedicated Client Portal, you receive private access to finalized 3D renders, schedule timelines, and guest list tracking.",
      },
    ],
  },
  birthdays: {
    slug: "birthdays",
    title: "Birthday Celebrations & Jubilees",
    categoryName: "Birthdays",
    tagline: "Joyous, vibrant themes brought to life with elegance and fun.",
    heroImage: "/images/gallery/birthdays/birthday-decor-01.webp",
    overview:
      "Whether celebrating a little one's 1st birthday, a sweet 16, or an exquisite 50th jubilee, our team crafts immersive party atmospheres with customized backdrops, energetic entertainment, and curated culinary staging.",
    capabilities: [
      {
        category: "Concept & Planning",
        description: "From fairytale castles and safari adventures to sophisticated black-tie anniversaries.",
        deliverables: [
          "Theme conceptualization & 3D mockups",
          "Guest count & seating layout optimization",
          "Run-of-show schedule for speeches and cake cutting",
        ],
      },
      {
        category: "Decor & Installations",
        description: "Custom balloon art, neon signage, photogenic stage backdrops, and dessert tables.",
        deliverables: [
          "Organic multi-layered balloon arches and garlands",
          "Custom acrylic signage and themed cutouts",
          "Styled dessert pedestals and character setups",
        ],
      },
      {
        category: "Lighting & Sound",
        description: "Atmospheric party lighting and premium sound to keep energy soaring throughout the celebration.",
        deliverables: [
          "Colour-coordinated LED wash lights",
          "Pro audio systems for music, games, and announcements",
          "Disco and laser lights for evening dance sessions",
        ],
      },
      {
        category: "Flowers & Accents",
        description: "Delicate tabletop floral pieces complementing party color palettes.",
        deliverables: [
          "Fresh table bouquets and centerpieces",
          "Floral cake table accents",
          "Eco-friendly botanical installations",
        ],
      },
      {
        category: "Entertainment & Activities",
        description: "Magicians, interactive game hosts, face painters, caricature artists, and live DJs.",
        deliverables: [
          "Engaging emcees for interactive party games",
          "Live kid-friendly performers or acoustic trios",
          "Curated DJ playlists tailored to all generations",
        ],
      },
      {
        category: "Coordination & Flow",
        description: "Seamless event management ensuring hosts can mingle with friends and family without hassle.",
        deliverables: [
          "Vendor setup management before guest arrival",
          "Cake arrival, candle lighting, and photo cues",
          "Return gift and favour distribution management",
        ],
      },
    ],
    faq: [
      {
        question: "Do you organize both indoor and outdoor birthday parties?",
        answer:
          "Yes, we create setups for banquet halls, private residences, backyards, farmhouses, and outdoor lawns with complete weather-contingency planning.",
      },
      {
        question: "Can you accommodate dietary and kid-friendly entertainment requests?",
        answer:
          "Absolutely. We work closely with catering partners and entertainment acts to ensure safe, engaging, and age-appropriate experiences.",
      },
    ],
  },
  functions: {
    slug: "functions",
    title: "Functions, Corporate Events & Social Galas",
    categoryName: "Functions",
    tagline: "Professional excellence, refined styling, and crisp execution.",
    heroImage: "/images/gallery/functions/function-corporate-01.webp",
    overview:
      "From anniversary celebrations, thread ceremonies, and family reunions to corporate gala dinners and product launches, we ensure crisp logistics, stunning stage aesthetics, and courteous guest handling.",
    capabilities: [
      {
        category: "Strategic Planning",
        description: "Structured event itineraries, VIP protocols, audio-visual testing, and contingency plans.",
        deliverables: [
          "Comprehensive minute-by-minute rundown",
          "Floor plan design with fire and safety exits",
          "Vendor coordination and licensing verification",
        ],
      },
      {
        category: "Stage & Set Design",
        description: "Modern modular stages, podiums, backdrop branding, and high-end executive seating.",
        deliverables: [
          "Seamless LED video wall backdrops or branded stage flats",
          "Executive lecterns, microphone setups, and furniture",
          "Thematic registration booths and photo-op installations",
        ],
      },
      {
        category: "Technical Lighting & AV",
        description: "Broadcast-grade lighting, crystal clear voice projection, and multi-display management.",
        deliverables: [
          "High-lumen projection and LED display arrays",
          "Lapel, handheld, and podium microphone arrays",
          "Intelligent lighting presets for keynote vs dinner modes",
        ],
      },
      {
        category: "Floral & Table Styling",
        description: "Sophisticated corporate florals and minimalist centerpieces that facilitate conversation.",
        deliverables: [
          "Understated executive table arrangements",
          "Stage floral podium accents and VIP bouquets",
          "Foyer and reception welcome arrangements",
        ],
      },
      {
        category: "Music & Keynote Production",
        description: "Live instrumental background music, conference audio control, and celebratory entertainment.",
        deliverables: [
          "Curated instrumental quartets or jazz ensembles",
          "Emcee support and awards ceremony fanfare cues",
          "Full audio recording capabilities for archival",
        ],
      },
      {
        category: "On-Site Floor Coordination",
        description: "Strict schedule adherence, registration flow, and backstage cueing.",
        deliverables: [
          "Host desk and name badge check-in",
          "Backstage speaker/performer greenroom assistance",
          "Seamless transition from presentations to banquet dinner",
        ],
      },
    ],
    faq: [
      {
        question: "Can you provide AV equipment and technical operators?",
        answer:
          "Yes, we supply complete audio-visual systems with on-site certified sound and lighting technicians.",
      },
      {
        question: "How do you handle corporate invoicing and approvals?",
        answer:
          "We offer transparent, itemized estimates with clear deliverables to suit corporate procurement guidelines.",
      },
    ],
  },
};

export async function generateStaticParams() {
  return [
    { slug: "weddings" },
    { slug: "birthdays" },
    { slug: "functions" },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = serviceData[slug];
  if (!service) return { title: "Service Not Found" };

  return {
    title: service.title,
    description: service.overview,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = serviceData[slug];

  if (!service) {
    notFound();
  }

  return (
    <div className="pt-24 pb-20">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ol className="flex items-center space-x-2 text-sm text-ink-muted">
          <li>
            <Link href="/" className="hover:text-ink transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/services" className="hover:text-ink transition-colors">
              Services
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-ink font-semibold" aria-current="page">
            {service.categoryName}
          </li>
        </ol>
      </nav>

      {/* Hero Header */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center py-8 sm:py-12">
        <span className="text-xs font-semibold tracking-widest uppercase text-accent">
          {service.categoryName}
        </span>
        <h1 className="mt-3 text-3xl sm:text-5xl font-heading font-bold text-ink">
          {service.title}
        </h1>
        <p className="mt-4 text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto">
          {service.tagline}
        </p>
      </section>

      {/* Hero Image Showcase */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mb-16">
        <div className="rounded-radius-lg overflow-hidden shadow-[var(--shadow-md)]">
          <PlaceholderImage
            src={service.heroImage}
            alt={`${service.title} showcase photo`}
            aspectRatio={16 / 9}
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

      {/* Overview Block */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto mb-16">
        <div className="p-8 sm:p-10 bg-surface border border-border rounded-radius-lg shadow-[var(--shadow-sm)]">
          <h2 className="text-2xl font-heading font-bold text-ink mb-4">
            Our Approach to {service.categoryName}
          </h2>
          <p className="text-ink-muted leading-relaxed text-base sm:text-lg">
            {service.overview}
          </p>
        </div>
      </section>

      {/* Detailed Capabilities Matrix */}
      <section className="bg-surface border-y border-border py-16 sm:py-24 my-16">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold tracking-widest uppercase text-accent">
              Comprehensive Scope
            </span>
            <h2 className="mt-2 text-3xl font-heading font-bold text-ink">
              What Is Covered Under {service.categoryName}
            </h2>
            <p className="mt-4 text-ink-muted">
              We coordinate across planning, décor, lighting, flowers, music, and on-ground logistics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {service.capabilities.map((item) => (
              <div
                key={item.category}
                className="p-6 rounded-radius-lg bg-bg border border-border flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-xl font-heading font-semibold text-ink">
                    {item.category}
                  </h3>
                  <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-ink mb-2">
                    Key Deliverables:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-ink-muted">
                    {item.deliverables.map((d) => (
                      <li key={d} className="flex items-start gap-2">
                        <span className="text-accent font-bold">✓</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto mb-16">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink text-center mb-10">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {service.faq.map((item) => (
            <div
              key={item.question}
              className="p-6 rounded-radius-md bg-surface border border-border"
            >
              <h3 className="font-heading text-lg font-semibold text-ink">
                {item.question}
              </h3>
              <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Box */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center py-8">
        <div className="p-8 sm:p-12 bg-accent-light rounded-radius-lg border border-accent/20">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink">
            Planning a {service.categoryName.replace(/s$/, "")}?
          </h2>
          <p className="mt-3 text-ink-muted text-base max-w-xl mx-auto">
            Contact our dedicated team to discuss your dates, ideas, and custom budget.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/contact?service=${service.slug}`}
              className="inline-flex items-center px-8 py-3.5 bg-accent text-accent-ink font-semibold rounded-radius-full hover:bg-accent-hover transition-colors shadow-[var(--shadow-sm)] w-full sm:w-auto justify-center"
            >
              Plan Your {service.categoryName}
            </Link>
            <Link
              href="/gallery"
              className="inline-flex items-center px-8 py-3.5 border border-ink/20 text-ink font-semibold rounded-radius-full hover:border-accent hover:text-accent transition-colors w-full sm:w-auto justify-center"
            >
              View {service.categoryName} Gallery
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
