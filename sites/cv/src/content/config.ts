import { defineCollection, z } from 'astro:content';

const projectsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    thumbnail: z.string().optional(),
    redirectUrl: z.string().optional(),
  }),
});

export const collections = {
  projects: projectsCollection,
};

export function relosveProjectsUrl(slug: string) {
  const [lang, ...restOfTheSlug] = slug.split('/');
  if (lang === 'en') {
    return `/projects/${restOfTheSlug}`;
  }
  return `${lang}/projects/${restOfTheSlug}`;
}
