import { createClient } from "contentful";

export const client = createClient({
  space: import.meta.env.VITE_CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN,
});

export async function getStories() {
  const response = await client.getEntries({
    content_type: "post",
    include: 2,
    order: "-fields.date",
  });

  return response.items.map((item) => normalizeStory(item));
}

function normalizeStory(item) {
  const fields = item.fields;
  const author = normalizeReference(fields.author);
  const category = normalizeReference(fields.category);

  return {
    id: item.sys.id,
    title: fields.title || "Untitled story",
    slug: fields.slug || item.sys.id,
    category: normalizeCategory(fields.categoryName || category),
    categorySlug: category?.slug || slugify(fields.categoryName || category?.title),
    excerpt: fields.excerpt || fields.description || "",
    content: fields.content || null,
    author: author?.name || String(fields.author || "").trim(),
    authorDetails: author,
    publishedDate: fields.publishedDate || fields.date || item.sys.createdAt,
    minutes: fields.minutes || estimateReadingTime(fields.content),
    featured: Boolean(fields.featured),
    image: getAssetUrl(fields.coverImage || fields.featuredImage || fields.image),
  };
}

function normalizeReference(reference) {
  if (!reference) return null;
  if (Array.isArray(reference)) return normalizeReference(reference[0]);
  const fields = reference.fields || reference;
  const name = fields.name || fields.title || "";
  return {
    name: String(name).trim(),
    slug: fields.slug || slugify(name),
    avatar: getAssetUrl(fields.avatar, { width: 160 }),
    bio: fields.bio || "",
    role: fields.role || "",
    title: fields.title || name,
  };
}

function getAssetUrl(asset, options = {}) {
  const url = asset?.fields?.file?.url || asset?.file?.url || asset?.url;
  if (!url) {
    return "";
  }

  const baseUrl = url.startsWith("//") ? `https:${url}` : url;
  const params = new URLSearchParams({
    w: String(options.width || 1200),
    q: "80",
    fm: "webp",
  });
  return `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}${params}`;
}

export function richTextToText(document) {
  if (typeof document === "string") {
    return document;
  }

  if (!document?.content) {
    return "";
  }

  return document.content
    .map((node) => {
      if (node.nodeType === "text") {
        return node.value;
      }

      const text = richTextToText(node);
      return node.nodeType === "paragraph" ? `${text}\n\n` : text;
    })
    .join("")
    .trim();
}

function normalizeCategory(category) {
  if (category?.title) return String(category.title).trim();
  const value = Array.isArray(category)
    ? category[0]
    : category?.fields?.name || category?.name || category;

  const normalized = String(value || "").trim().toLowerCase();

  const labels = {
    fiction: "Fiction",
    poetry: "Poetry",
    poetery: "Poetry",
    essays: "Essays",
    "flash fiction": "Flash fiction",
  };

  return labels[normalized] || String(value || "").trim();
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function estimateReadingTime(content) {
  const text = richTextToText(content);
  const wordCount = text ? text.split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(wordCount / 200));
}