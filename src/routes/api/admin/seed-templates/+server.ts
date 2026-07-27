// routes/api/admin/seed-templates/+server.ts
// One-time endpoint to update section templates in the DB
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sectionTemplates } from '$lib/server/db/schema';
import { requireSuperAdmin } from '$lib/server/adminGuard';
import type { RequestHandler } from './$types';

let sectionTemplateData = [
    {
        slug: "product-slider",
        name: "Product Slider",
        schemaDefinition: [
            { field: "sectionHeading", type: "text", label: "Section Heading", required: true },
            { field: "linkTo", type: "select", label: "Link to", options: ["category", "product_type"], required: true },
            { field: "linkValue", type: "select", label: "Value of Link to", source: "dynamic", dependsOn: "linkTo", required: true },
            { field: "promotionTag", type: "select", label: "Promotion Tag", source: "tags", tagType: "promotion" },
            { field: "productLimit", type: "select", label: "Maximum no. of Products", options: ["4", "6", "8", "10", "12"] },
            { field: "ctaText", type: "text", label: "CTA Text" },
            { field: "ctaLink", type: "text", label: "CTA Link", disabled: true, autoFrom: ["linkTo", "linkValue"] },
        ]
    },
    {
        slug: "long-banner",
        name: "Long Banner",
        schemaDefinition: [
            { field: "sectionHeading", type: "text", label: "Section Heading" },
            { field: "bannerHeading", type: "text", label: "Banner Heading", required: true },
            { field: "bannerSubheading", type: "text", label: "Banner Subheading" },
            { field: "linkTo", type: "select", label: "Link to", options: ["category", "product_type"], required: true },
            { field: "linkValue", type: "select", label: "Value of Link to", source: "dynamic", dependsOn: "linkTo", required: true },
            { field: "ctaText", type: "text", label: "CTA Text", required: true },
            { field: "ctaLink", type: "text", label: "CTA Link", disabled: true, autoFrom: ["linkTo", "linkValue"] },
            { field: "desktopImagePath", type: "image", label: "Banner Image", required: true },
            { field: "mobileImagePath", type: "image", label: "Banner Image (Mobile)" },
        ]
    },
    {
        slug: "two-column-grid",
        name: "Two Column Grid",
        schemaDefinition: [
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
        ]
    },
    {
        slug: "product-highlight",
        name: "Product Highlight",
        schemaDefinition: [
            { field: "sectionHeading", type: "text", label: "Section Heading" },
            { field: "bannerHeading", type: "text", label: "Banner Heading", required: true },
            { field: "bannerSubheading", type: "text", label: "Banner Subheading" },
            { field: "linkTo", type: "select", label: "Link to", options: ["category", "product_type"], required: true },
            { field: "linkValue", type: "select", label: "Value of Link to", source: "dynamic", dependsOn: "linkTo", required: true },
            { field: "ctaText", type: "text", label: "CTA Text", required: true },
            { field: "ctaLink", type: "text", label: "CTA Link", disabled: true, autoFrom: ["linkTo", "linkValue"] },
            { field: "background", type: "image", label: "Banner Image", required: true },
            { field: "mobileBackground", type: "image", label: "Banner Image (Mobile)" },
        ]
    },
    {
        slug: "testimonials",
        name: "Testimonials",
        schemaDefinition: [
            { field: "heading", type: "text", label: "Heading", required: true },
            { field: "image", type: "image", label: "Testimonial Image", required: true },
        ]
    }
]


export const POST: RequestHandler = async ({ locals }) => {
    requireSuperAdmin(locals);

    await Promise.all(
        sectionTemplateData.map((tpl) =>
            db.insert(sectionTemplates).values(tpl).onConflictDoUpdate({
                target: sectionTemplates.slug,
                set: {
                    name: tpl.name,
                    schemaDefinition: tpl.schemaDefinition,
                },
            })
        )
    );

    return json({ ok: true, updated: sectionTemplateData.length });
};
