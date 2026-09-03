import { createClient } from "contentful";

export const client = createClient({
  space: "196nlfmkygec",
  accessToken: "v2MGH4aE6G4k0ygYo07HCl6tuFWHkZCWGRhRK4oghrQ",
});

export async function getStories() {
  const response = await client.getEntries({
    content_type: "post",
  });

  return response.items.map((item) => ({
    id: item.sys.id,
    title: item.fields.title || "",
    category: normalizeCategory(
      item.fields.categoryName || item.fields.category
    ),
    excerpt: item.fields.description || "",
    content: richTextToText(item.fields.content),
    author: String(item.fields.author || "").trim(),
    minutes: item.fields.minutes || estimateReadingTime(item.fields.content),
    featured: Boolean(item.fields.featured),
    image: getAssetUrl(
      item.fields.featuredImage || item.fields.image
    ),
  }));
}

function getAssetUrl(asset) {
  const url = asset?.fields?.file?.url || asset?.file?.url || asset?.url;
  if (!url) {
    return "";
  }

  return url.startsWith("//") ? `https:${url}` : url;
}

function richTextToText(document) {
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

function estimateReadingTime(content) {
  const text = richTextToText(content);
  const wordCount = text ? text.split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(wordCount / 200));
}