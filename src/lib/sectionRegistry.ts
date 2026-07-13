import type { Component } from 'svelte';

export type SectionTemplateDef = {
  slug: string;
  name: string;
  component: Component;
  skeleton?: Component;
  schema: { field: string; type: string; label?: string; required?: boolean; options?: string[]; source?: string; dependsOn?: string; showWhen?: string; disabled?: boolean; autoFrom?: string[]; tagType?: string }[];
};

import ProductSlider from './Components/section-templates/ProductSlider.svelte';
import LongBanner from './Components/section-templates/LongBanner.svelte';
import TwoColumnGrid from './Components/section-templates/TwoColumnGrid.svelte';
import ProductHighlight from './Components/section-templates/ProductHighlight.svelte';

import SliderSkeleton from './Components/skeletons/SliderSkeleton.svelte';
import LongBannerSkeleton from './Components/skeletons/LongBannerSkeleton.svelte';
import TwoColumnGridSkeleton from './Components/skeletons/TwoColumnGridSkeleton.svelte';
import ProductHighlightSkeleton from './Components/skeletons/ProductHighlightSkeleton.svelte';

export const sectionRegistry: SectionTemplateDef[] = [
  {
    slug: 'product-slider',
    name: 'Product Slider',
    component: ProductSlider,
    skeleton: SliderSkeleton,
    schema: [
      { field: "sectionHeading", type: "text", label: "Section Heading", required: true },
      { field: "linkTo", type: "select", label: "Link to", options: ["category", "product_type"], required: true },
      { field: "linkValue", type: "select", label: "Value of Link to", source: "dynamic", dependsOn: "linkTo", required: true },
      { field: "promotionTag", type: "select", label: "Promotion Tag", source: "tags", tagType: "promotion" },
      { field: "productLimit", type: "select", label: "Maximum no. of Products", options: ["4", "6", "8", "10", "12"] },
      { field: "ctaText", type: "text", label: "CTA Text" },
      { field: "ctaLink", type: "text", label: "CTA Link", disabled: true, autoFrom: ["linkTo", "linkValue"] },
    ],
  },
  {
    slug: 'long-banner',
    name: 'Long Banner',
    component: LongBanner,
    skeleton: LongBannerSkeleton,
    schema: [
      { field: "sectionHeading", type: "text", label: "Section Heading" },
      { field: "bannerHeading", type: "text", label: "Banner Heading", required: true },
      { field: "bannerSubheading", type: "text", label: "Banner Subheading" },
      { field: "linkTo", type: "select", label: "Link to", options: ["category", "product_type"], required: true },
      { field: "linkValue", type: "select", label: "Value of Link to", source: "dynamic", dependsOn: "linkTo", required: true },
      { field: "ctaText", type: "text", label: "CTA Text", required: true },
      { field: "ctaLink", type: "text", label: "CTA Link", disabled: true, autoFrom: ["linkTo", "linkValue"] },
      { field: "desktopImagePath", type: "image", label: "Banner Image", required: true },
      { field: "mobileImagePath", type: "image", label: "Banner Image (Mobile)" },
    ],
  },
  {
    slug: 'two-column-grid',
    name: 'Two Column Grid',
    component: TwoColumnGrid,
    skeleton: TwoColumnGridSkeleton,
    schema: [
      { field: "sectionHeading", type: "text", label: "Section Heading" },
      { field: "leftMode", type: "select", label: "Left Column", options: ["single", "batch"], required: true },
      { field: "leftProductSlug", type: "product-search", label: "Search Product", dependsOn: "leftMode", showWhen: "single" },
      { field: "leftHeading", type: "text", label: "Heading", dependsOn: "leftMode", showWhen: "batch", required: true },
      { field: "leftSubheading", type: "text", label: "Subheading", dependsOn: "leftMode", showWhen: "batch" },
      { field: "leftLinkTo", type: "select", label: "Link to", options: ["category", "product_type"], dependsOn: "leftMode", showWhen: "batch", required: true },
      { field: "leftLinkValue", type: "select", label: "Value of Link to", source: "dynamic", dependsOn: "leftLinkTo", required: true },
      { field: "leftCtaText", type: "text", label: "CTA Text", dependsOn: "leftMode", showWhen: "batch", required: true },
      { field: "leftCtaLink", type: "text", label: "CTA Link", disabled: true, autoFrom: ["leftMode", "leftProductSlug", "leftLinkTo", "leftLinkValue"] },
      { field: "leftImage", type: "image", label: "Banner Image", dependsOn: "leftMode", showWhen: "batch", required: true },
      { field: "leftMobileImage", type: "image", label: "Banner Image (Mobile)", dependsOn: "leftMode", showWhen: "batch" },
      { field: "rightMode", type: "select", label: "Right Column", options: ["single", "batch"], required: true },
      { field: "rightProductSlug", type: "product-search", label: "Search Product", dependsOn: "rightMode", showWhen: "single" },
      { field: "rightHeading", type: "text", label: "Heading", dependsOn: "rightMode", showWhen: "batch", required: true },
      { field: "rightSubheading", type: "text", label: "Subheading", dependsOn: "rightMode", showWhen: "batch" },
      { field: "rightLinkTo", type: "select", label: "Link to", options: ["category", "product_type"], dependsOn: "rightMode", showWhen: "batch", required: true },
      { field: "rightLinkValue", type: "select", label: "Value of Link to", source: "dynamic", dependsOn: "rightLinkTo", required: true },
      { field: "rightCtaText", type: "text", label: "CTA Text", dependsOn: "rightMode", showWhen: "batch", required: true },
      { field: "rightCtaLink", type: "text", label: "CTA Link", disabled: true, autoFrom: ["rightMode", "rightProductSlug", "rightLinkTo", "rightLinkValue"] },
      { field: "rightImage", type: "image", label: "Banner Image", dependsOn: "rightMode", showWhen: "batch", required: true },
      { field: "rightMobileImage", type: "image", label: "Banner Image (Mobile)", dependsOn: "rightMode", showWhen: "batch" },
    ],
  },
  {
    slug: 'product-highlight',
    name: 'Product Highlight',
    component: ProductHighlight,
    skeleton: ProductHighlightSkeleton,
    schema: [
      { field: "sectionHeading", type: "text", label: "Section Heading" },
      { field: "bannerHeading", type: "text", label: "Banner Heading", required: true },
      { field: "bannerSubheading", type: "text", label: "Banner Subheading" },
      { field: "linkTo", type: "select", label: "Link to", options: ["category", "product_type"], required: true },
      { field: "linkValue", type: "select", label: "Value of Link to", source: "dynamic", dependsOn: "linkTo", required: true },
      { field: "ctaText", type: "text", label: "CTA Text", required: true },
      { field: "ctaLink", type: "text", label: "CTA Link", disabled: true, autoFrom: ["linkTo", "linkValue"] },
      { field: "background", type: "image", label: "Banner Image", required: true },
      { field: "mobileBackground", type: "image", label: "Banner Image (Mobile)" },
    ],
  },
];

export function getTemplateBySlug(slug: string): SectionTemplateDef | undefined {
  return sectionRegistry.find(t => t.slug === slug);
}
