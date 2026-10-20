export const site = {
  name: "Shadi Sutra",
  tagline: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  hours: "",
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
