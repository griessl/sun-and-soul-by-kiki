import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonials' }),
  schema: z.object({
    name: z.string(),
    text_de: z.string(),
    text_en: z.string(),
    date: z.coerce.date(),
  }),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    name_de: z.string(),
    name_en: z.string(),
    intro_de: z.string().optional().default(''),
    intro_en: z.string().optional().default(''),
    steps_de: z.string().optional().default(''),
    steps_en: z.string().optional().default(''),
    price_label_de: z.string().optional().default(''),
    price_label_en: z.string().optional().default(''),
    price: z.number(),
    type: z.enum(['reiki', 'remote-reiki', 'sound-and-soul']),
    order: z.number().optional().default(99),
    active: z.boolean().default(true),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title_de: z.string(),
    title_en: z.string(),
    slug: z.string(),
    description_de: z.string().optional(),
    description_en: z.string().optional(),
    body_de: z.string().optional(),
    body_en: z.string().optional(),
    image: z.string().optional(),
    image_alt: z.string().optional(),
    published: z.boolean().default(false),
  }),
});

export const collections = { testimonials, services, pages };
