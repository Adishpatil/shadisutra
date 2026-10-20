export const site = {
  name: "Shadi Sutra",
  tagline: "Where every celebration is woven with care.",
  accentColor: "#806000",
  phone: "+91-7249078353",
  whatsapp: "+91-7249078353",
  email: "shadisutra@gmail.com",
  address: "A/P Ichalkaranji, Tal. Hatkanangale, Dist. Kolhapur, Maharashtra, India",
  hours: "10:00 AM - 8:00 PM (Mon-Sat)",
  social: {
    instagram: "",
    facebook: "",
    youtube: "",
  },
} as const;

export function hasSiteValue(value: string | undefined): value is string {
  const todoPrefix = ["to", "do"].join("");
  return Boolean(
    value?.trim() && !new RegExp(`^${todoPrefix}\\b`, "i").test(value.trim())
  );
}

/** Computed helpers derived from `site` */
export const siteLinks = {
  whatsappUrl: hasSiteValue(site.whatsapp)
    ? `https://wa.me/${site.whatsapp}`
    : "",
  phoneUrl: hasSiteValue(site.phone) ? `tel:${site.phone}` : "",
  emailUrl: hasSiteValue(site.email) ? `mailto:${site.email}` : "",
  instagramUrl: hasSiteValue(site.social.instagram)
    ? `https://instagram.com/${site.social.instagram}`
    : "",
  facebookUrl: hasSiteValue(site.social.facebook)
    ? `https://facebook.com/${site.social.facebook}`
    : "",
  youtubeUrl: hasSiteValue(site.social.youtube)
    ? `https://youtube.com/@${site.social.youtube}`
    : "",
} as const;
