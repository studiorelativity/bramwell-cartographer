import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const writing = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/writing" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

const work = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/work" }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    status: z.enum(["in-progress", "shipped"]),
    order: z.number(),
    url: z.string().nullable().optional(),
    summary: z.string(),
    stack: z.string(),
    caption: z.string().optional(),
  }),
});

const people = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/people" }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    order: z.number(),
    group: z.enum(["founder", "mentor"]),
    photo: z.string().optional(),
    photoMaxWidth: z.number().optional(),
    link: z.string().nullable().optional(),
  }),
});

export const collections = { writing, work, people };
