export type FieldType = 'text' | 'textarea' | 'image';

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  default?: string;
};

export type PageDef = {
  name: string;
  label: string;
  route: string;
  editingMode: 'click-to-edit' | 'form-only' | 'sections';
  hasSections: boolean;
  fields: FieldDef[];
};

export const pages: PageDef[] = [
  {
    name: 'contact',
    label: 'Contact',
    route: '/contact',
    editingMode: 'click-to-edit',
    hasSections: false,
    fields: [
      { key: 'page_heading', label: 'Page Heading', type: 'text', default: 'Get in touch with Meta Electronics.' },
      { key: 'talk_heading', label: 'Talk Heading', type: 'text', default: "Let's Talk!" },
      { key: 'talk_description', label: 'Talk Description', type: 'textarea', default: 'Get in touch with us using the enquiry form or contact details provided.' },
      { key: 'email', label: 'Email', type: 'text', default: 'contact.meta@gmail.com' },
      { key: 'phone', label: 'Phone', type: 'text', default: '+91 8345678917' },
      { key: 'address', label: 'Address', type: 'textarea', default: 'Ranichak More, Haldia, Purba Medinipur district, West Bengal, India' },
      { key: 'contact_image', label: 'Contact Image', type: 'image', default: 'assets/page-contents/contact/contact.png' },
    ],
  },
  {
    name: 'home',
    label: 'Home',
    route: '/',
    editingMode: 'click-to-edit',
    hasSections: false,
    fields: [
      { key: 'hero_heading', label: 'Hero Heading', type: 'text', default: 'Original quality' },
      { key: 'hero_subheading', label: 'Hero Subheading', type: 'text', default: 'Electronics product' },
      { key: 'brands_heading', label: 'Brands Heading', type: 'text', default: 'We proudly offer a diverse selection of trusted products from renowned brands.' },
      { key: 'brands_description', label: 'Brands Description', type: 'textarea', default: "We believe variety is key to meeting our customers' needs. Our diverse selection makes it easy to find what you're looking for, from eco-friendly options to the latest innovations, ensuring access to the best products on the market." },
      { key: 'best_sellers_heading', label: 'Best Sellers Heading', type: 'text', default: 'Meta Electronics Best Sellers.' },
      { key: 'hero_image', label: 'Hero Background Image', type: 'image', default: 'assets/page-contents/home/hero-bg.jpg' },
    ],
  },
  {
    name: 'about',
    label: 'About',
    route: '/about',
    editingMode: 'click-to-edit',
    hasSections: false,
    fields: [
      { key: 'page_heading', label: 'Page Heading', type: 'text', default: 'About Meta Electronics' },
      { key: 'content', label: 'Page Content', type: 'textarea' },
    ],
  },
  {
    name: 'products_home',
    label: 'Products Home',
    route: '/products',
    editingMode: 'sections',
    hasSections: true,
    fields: [],
  },
];

export function getPageByName(name: string): PageDef | undefined {
  return pages.find(p => p.name === name);
}
