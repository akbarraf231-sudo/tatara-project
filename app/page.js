import { supabaseServer } from '@/lib/supabaseServer';
import { HomePage } from '@/components/HomePage';

const DEFAULT_INGREDIENTS = [
  { name: 'Eggs', image_url: 'https://images.unsplash.com/photo-1569288063643-5d29ad64df09?w=200&h=200&fit=crop' },
  { name: 'Flour', image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=200&fit=crop' },
  { name: 'Butter', image_url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200&h=200&fit=crop' },
  { name: 'Strawberry', image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop' },
];

const DEFAULT_TESTIMONIALS = [
  { name: 'Rina', review: 'Kuenya enak banget! Akan order lagi pasti!', rating: 5 },
  { name: 'Budi', review: 'Custom cake-nya cantik banget, rasanya juga top!', rating: 5 },
  { name: 'Sarah', review: 'Roti & pastry-nya selalu fresh. Highly recommended!', rating: 5 },
];

const DEFAULTS = {
  hero_title: 'Celebrate life\'s sweet moments with the perfect cake',
  hero_subtitle: 'Indulge in a symphony of sweetness, where every bite tells a tale of delight.',
  hero_image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=800&fit=crop',
  about_title: 'About Us',
  about_text: 'Sinar Jaya Bakery adalah toko kue & roti yang sudah berdiri sejak lama, melayani pelanggan dengan dedikasi tinggi. Setiap kue dibuat dengan bahan premium dan resep tradisional.',
  about_image_1: 'https://images.unsplash.com/photo-1606101205803-c5b06d8c5e0d?w=400&h=300&fit=crop',
  about_image_2: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400&h=300&fit=crop',
  about_image_3: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
  about_image_4: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop',
  cakes_title: 'Our Menu',
  cakes_subtitle: 'Pilih daily fresh atau special order',
  order_title: 'Your Cart',
  contact_title: 'Visit Us Today',
  contact_text: 'Mampir ke toko kami untuk merasakan langsung aroma kue. Open daily 7 AM - 8 PM.',
  testimonials: DEFAULT_TESTIMONIALS,
  ingredients: DEFAULT_INGREDIENTS,
};

function mergeContent(d) {
  if (!d) return DEFAULTS;
  return {
    hero_title: d.hero_title || DEFAULTS.hero_title,
    hero_subtitle: d.hero_subtitle || DEFAULTS.hero_subtitle,
    hero_image_url: d.hero_image_url || DEFAULTS.hero_image_url,
    about_title: d.about_title || DEFAULTS.about_title,
    about_text: d.about_text || DEFAULTS.about_text,
    about_image_1: d.about_image_1 || DEFAULTS.about_image_1,
    about_image_2: d.about_image_2 || DEFAULTS.about_image_2,
    about_image_3: d.about_image_3 || DEFAULTS.about_image_3,
    about_image_4: d.about_image_4 || DEFAULTS.about_image_4,
    cakes_title: d.cakes_title || DEFAULTS.cakes_title,
    cakes_subtitle: d.cakes_subtitle || DEFAULTS.cakes_subtitle,
    order_title: d.order_title || DEFAULTS.order_title,
    contact_title: d.contact_title || DEFAULTS.contact_title,
    contact_text: d.contact_text || DEFAULTS.contact_text,
    testimonials: Array.isArray(d.testimonials) && d.testimonials.length ? d.testimonials : DEFAULTS.testimonials,
    ingredients: Array.isArray(d.ingredients) && d.ingredients.length ? d.ingredients : DEFAULTS.ingredients,
  };
}

// Revalidate every 60 seconds (ISR) to balance freshness with performance
// This prevents hitting Supabase on every single page load
export const revalidate = 60;

export default async function Home() {
  const [productsRes, settingsRes, landingRes] = await Promise.all([
    supabaseServer
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .then((r) => r)
      .catch(() => ({ data: [] })),
    supabaseServer
      .from('settings')
      .select('location_link')
      .limit(1)
      .maybeSingle()
      .then((r) => r)
      .catch(() => ({ data: null })),
    supabaseServer
      .from('landing_content')
      .select('*')
      .limit(1)
      .maybeSingle()
      .then((r) => r)
      .catch(() => ({ data: null })),
  ]);

  const products = productsRes.data || [];
  const locationLink = settingsRes.data?.location_link || '';
  const content = mergeContent(landingRes.data);

  return (
    <HomePage
      initialProducts={products}
      initialContent={content}
      initialLocationLink={locationLink}
    />
  );
}
