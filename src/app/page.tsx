import Link from "next/link";
import { site } from "@/config/site";
import { getFeaturedImages } from "@/lib/gallery";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

export default function HomePage() {
  const featuredImages = getFeaturedImages();

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
        {/* Hero background placeholder */}
        <div className="absolute inset-0 image-placeholder" aria-hidden="true">
          <PlaceholderImage
            src="/images/hero/hero-01.webp"
            alt="Hero celebration backdrop"
            fill
            priority
            className="w-full h-full object-cover"
          />
        </div>
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-ink/50" aria-hidden="true" />

        <div className="relative z-10 text-center px-4 sm:px-6 max-w-3xl mx-auto pt-20">
          <h1 className="text-white font-heading text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
            {site.tagline !== "TODO: tagline"
              ? site.tagline
              : "Crafting Unforgettable Celebrations"}
          </h1>
          <p className="mt-6 text-white/90 text-lg sm:text-xl font-body max-w-xl mx-auto">
            Weddings, birthdays, and milestone events — planned and executed with care,
            creativity, and attention to every detail.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-accent text-accent-ink font-semibold rounded-radius-full text-base sm:text-lg hover:bg-accent-hover transition-colors shadow-[var(--shadow-md)]"
            >
              Plan Your Event
            </Link>
            <Link
              href="/gallery"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white/15 backdrop-blur-sm text-white font-semibold rounded-radius-full text-base sm:text-lg hover:bg-white/25 transition-colors border border-white/30"
            >
              View Portfolio
            </Link>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-accent">
            Curated Experiences
          </span>
          <h2 className="mt-2 font-heading text-3xl sm:text-4xl font-bold text-ink">
            Our Services
          </h2>
          <p className="mt-4 text-ink-muted max-w-2xl mx-auto">
            From intimate gatherings to grand celebrations, we bring your vision to life.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              title: "Weddings",
              desc: "Complete wedding planning and execution — from venue décor and floral design to coordination on the big day.",
              href: "/services/weddings",
              img: "/images/services/weddings.webp",
            },
            {
              title: "Birthdays",
              desc: "Themed birthday celebrations with creative décor, lighting, and entertainment for all ages.",
              href: "/services/birthdays",
              img: "/images/services/birthdays.webp",
            },
            {
              title: "Functions",
              desc: "Corporate events, social gatherings, and special occasions — professionally managed from start to finish.",
              href: "/services/functions",
              img: "/images/services/functions.webp",
            },
          ].map((service) => (
            <Link
              key={service.title}
              href={service.href}
              className="group block bg-surface border border-border rounded-radius-lg p-6 sm:p-8 transition-all hover:shadow-[var(--shadow-md)] hover:border-accent/40"
            >
              {/* Service image placeholder */}
              <div className="overflow-hidden rounded-radius-md mb-6 aspect-[4/3] relative">
                <PlaceholderImage
                  src={service.img}
                  alt={service.title}
                  aspectRatio={4 / 3}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-semibold text-ink group-hover:text-accent transition-colors">
                {service.title}
              </h3>
              <p className="mt-3 text-ink-muted text-sm leading-relaxed">
                {service.desc}
              </p>
              <span className="mt-4 inline-flex items-center text-accent font-semibold text-sm group-hover:gap-2 transition-all">
                Learn more
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Gallery Strip */}
      <section className="py-16 sm:py-24 bg-surface border-y border-border">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-xs font-semibold tracking-widest uppercase text-accent">
              Recent Highlights
            </span>
            <h2 className="mt-2 font-heading text-3xl sm:text-4xl font-bold text-ink">
              Our Work
            </h2>
            <p className="mt-4 text-ink-muted max-w-2xl mx-auto">
              A glimpse into the celebrations we&rsquo;ve brought to life.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredImages.slice(0, 3).map((item, i) => (
              <div
                key={`${item.src}-${i}`}
                className="rounded-radius-md overflow-hidden bg-bg border border-border group"
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <PlaceholderImage
                    src={item.src}
                    alt={item.alt}
                    width={item.width}
                    height={item.height}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                    {item.category}
                  </span>
                  <p className="text-sm font-medium text-ink truncate mt-1">
                    {item.alt}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/gallery"
              className="inline-flex items-center px-8 py-3.5 border-2 border-accent text-accent font-semibold rounded-radius-full hover:bg-accent hover:text-accent-ink transition-colors"
            >
              Explore Full Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-accent">
            Step-by-Step
          </span>
          <h2 className="mt-2 font-heading text-3xl sm:text-4xl font-bold text-ink">
            How We Work
          </h2>
          <p className="mt-4 text-ink-muted max-w-xl mx-auto">
            From your first thought to the final send-off, our structured process ensures nothing is left to chance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { step: "01", title: "Consultation", desc: "We listen to your vision, understand your requirements, and discuss your budget." },
            { step: "02", title: "Planning", desc: "Our team creates a detailed plan covering every element — décor, vendors, timelines." },
            { step: "03", title: "Design", desc: "We present design concepts and finalize every detail before execution begins." },
            { step: "04", title: "Execution", desc: "On the day, we handle everything so you can enjoy every moment stress-free." },
          ].map((item) => (
            <div key={item.step} className="p-6 bg-surface border border-border rounded-radius-lg">
              <span className="inline-block text-accent font-heading text-4xl font-bold opacity-40">
                {item.step}
              </span>
              <h3 className="mt-3 font-heading text-xl font-semibold text-ink">
                {item.title}
              </h3>
              <p className="mt-2 text-ink-muted text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials (placeholder) */}
      <section className="py-16 sm:py-24 bg-accent-light/40 border-y border-border">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-xs font-semibold tracking-widest uppercase text-accent">
              Client Feedback
            </span>
            <h2 className="mt-2 font-heading text-3xl sm:text-4xl font-bold text-ink">
              What Our Clients Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((i) => (
              <blockquote
                key={i}
                className="bg-surface border border-border rounded-radius-lg p-6 sm:p-8 flex flex-col justify-between"
              >
                <p className="text-ink-muted italic leading-relaxed text-sm sm:text-base">
                  &ldquo;TODO: Real testimonial from a client. Replace this
                  placeholder with genuine feedback.&rdquo;
                </p>
                <footer className="mt-6 pt-4 border-t border-border text-sm font-semibold text-ink">
                  — TODO: Client Name
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-ink">
            Ready to Start Planning?
          </h2>
          <p className="mt-4 text-ink-muted text-lg max-w-xl mx-auto">
            Let&rsquo;s discuss your event. Reach out to us and we&rsquo;ll make
            it unforgettable.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-accent text-accent-ink font-semibold rounded-radius-full text-base hover:bg-accent-hover transition-colors shadow-[var(--shadow-md)] w-full sm:w-auto justify-center"
            >
              Get in Touch
            </Link>
            <Link
              href="/gallery"
              className="inline-flex items-center px-8 py-4 border-2 border-border text-ink font-semibold rounded-radius-full text-base hover:border-accent hover:text-accent transition-colors w-full sm:w-auto justify-center"
            >
              View Our Work
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
