/**
 * Vendor logo URLs, keyed by a normalized vendor name.
 *
 * Vendor names arriving from the backend (Product.store / Vendor.name) may vary in
 * casing/spacing depending on how each scraper recorded them (e.g. "Town Team",
 * "TownTeam", "townteam"). normalizeVendorKey() strips everything but lowercase
 * letters/digits so lookups are resilient to those variations.
 *
 * To add a new vendor's logo, add an entry here — no other file needs to change.
 */
const VENDOR_LOGOS: Record<string, string> = {
  lablanca: 'https://lablancaegypt.com/cdn/shop/files/la_balanca-01_270x.png?v=1648112047',
  sigmafit: 'https://sigmafiteg.com/cdn/shop/files/2_9d5bba1d-1ad6-44d8-85ca-91521cb5b2b7.png?v=1772634853&width=80',
  townteam: 'https://townteam.com/cdn/shop/files/logo-B_130x@2x.png?v=1730019648',
  wayupsports: 'https://wayupsports.com/cdn/shop/files/Horizontal_Black_b_white_circle_b31dc6fb-0705-4afc-980d-c7f3c21c3a96.webp?v=1764511802&width=300',
  intersport: 'https://www.intersport.com.eg/cdn/shop/files/intersport-logo.png?v=1703447841&width=280',
  iraven: 'https://shop.iravin.com/cdn/shop/files/ravin_logo_black_005f4b08-3420-459e-84c0-28f047143a2d.png?v=1700640894&width=135',
  jumia: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSv8qrx49i1hfQKuxPDIf26C5R2npK9WrAlwJ_Go1_agQ&s=10',
  basiclook: 'https://www.basiclook.com/cdn/shop/files/Logo.png?v=1765131774&width=240',
  decathlon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWmF0Nl604uBj7xbKVDVV3cwHd-YOMzl_HRx27JGkjmg&s=10',
  gorillaoutfit: 'https://gorillaoutfit.com/cdn/shop/files/logoooo.png?v=1773893682&width=260',
};

function normalizeVendorKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Returns the vendor's logo URL, or undefined if we don't have one on file. */
export function getVendorLogo(vendorName: string): string | undefined {
  return VENDOR_LOGOS[normalizeVendorKey(vendorName)];
}
