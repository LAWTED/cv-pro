import type { MetadataRoute } from "next";

const BASE_URL = "https://ai-cv.ha7ch.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: [
          "GPTBot",
          "PerplexityBot",
          "ClaudeBot",
          "Googlebot",
          "anthropic-ai",
          "cohere-ai",
          "*",
        ],
        allow: "/",
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
