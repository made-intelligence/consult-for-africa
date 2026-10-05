import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/studio/",
          "/platform/",
          "/founder/",
          "/login",
          "/reset-password",
          "/oncadre/login",
          "/oncadre/register",
          "/oncadre/portal/",
          "/maarova/login",
          "/maarova/portal/",
          "/maarova/coach/",
          "/partner/",
          "/agent-portal/",
          "/client-portal/",
          // ilé is live for the founders to test but is not launched.
          // Remove this when the waiting list opens publicly.
          "/ile",
          // Lyfe is a consumer brand that will move to its own domain. Until
          // it does, keeping it out of the index stops Google tying a plastic
          // surgery practice to its management consultant's site, and stops
          // consultforafrica.com/lyfe becoming the URL people share. Paid and
          // WhatsApp traffic reach it perfectly well without being indexed.
          // Remove this the day the domain is pointed.
          "/lyfe",
          // Dr Bola Akinola's rebuilt site, in preview for him to test. It
          // moves to bolarinwaakinola.com, so it must never rank here.
          "/drbola",
        ],
      },
    ],
    sitemap: "https://consultforafrica.com/sitemap.xml",
  };
}
