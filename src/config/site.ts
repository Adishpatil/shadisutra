export const site = {
  name: "Shadi Sutra",
  tagline: "TODO: tagline",
  phone: "TODO",
  whatsapp: "TODO", // digits only, used for wa.me links
  email: "TODO",
  address: "TODO",
  hours: "TODO",
  social: {
    instagram: "TODO",
    facebook: "TODO",
    youtube: "",
  },
} as const;

/** Computed helpers derived from `site` */
export const siteLinks = {
  whatsappUrl: `https://wa.me/${site.whatsapp}`,
  phoneUrl: `tel:${site.phone}`,
  emailUrl: `mailto:${site.email}`,
  instagramUrl: `https://instagram.com/${site.social.instagram}`,
  facebookUrl: `https://facebook.com/${site.social.facebook}`,
  youtubeUrl: site.social.youtube
    ? `https://youtube.com/@${site.social.youtube}`
    : "",
} as const;
