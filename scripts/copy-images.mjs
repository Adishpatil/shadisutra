import fs from 'node:fs';
import path from 'node:path';

const brainDir = 'C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\cc614e33-3a10-4ff2-8c98-2899550fb6e1';
const targets = [
  { src: 'wedding_haldi_decor_1792404163602.jpg', dest: 'public/images/gallery/weddings/wedding-haldi-01.webp' },
  { src: 'wedding_mandap_decor_1792404187170.jpg', dest: 'public/images/gallery/weddings/wedding-mandap-01.webp' },
  { src: 'wedding_reception_decor_1792404215710.jpg', dest: 'public/images/gallery/weddings/wedding-reception-01.webp' },
  { src: 'birthday_decor_1792404236487.jpg', dest: 'public/images/gallery/birthdays/birthday-decor-01.webp' },
  { src: 'corporate_gala_1792404258529.jpg', dest: 'public/images/gallery/functions/function-corporate-01.webp' },
  { src: 'wedding_mandap_decor_1792404187170.jpg', dest: 'public/images/services/weddings.webp' },
  { src: 'birthday_decor_1792404236487.jpg', dest: 'public/images/services/birthdays.webp' },
  { src: 'corporate_gala_1792404258529.jpg', dest: 'public/images/services/functions.webp' },
  { src: 'wedding_mandap_decor_1792404187170.jpg', dest: 'public/images/hero/hero-01.webp' },
  { src: 'wedding_reception_decor_1792404215710.jpg', dest: 'public/images/about/about-01.webp' },
];

for (const t of targets) {
  const fullSrc = path.join(brainDir, t.src);
  const fullDest = path.resolve(t.dest);
  fs.mkdirSync(path.dirname(fullDest), { recursive: true });
  fs.copyFileSync(fullSrc, fullDest);
  console.log(`Copied ${t.src} -> ${t.dest}`);
}
console.log('All images copied successfully!');
