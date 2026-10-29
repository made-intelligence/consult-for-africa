import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js requires unsafe-inline for styles; unsafe-eval only in dev for HMR
      `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"} https://*.sanity.io`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://cdn.sanity.io https://images.unsplash.com",
      "font-src 'self' data:",
      "connect-src 'self' https://*.sanity.io https://*.api.sanity.io https://*.r2.cloudflarestorage.com https://cfa-uploads.*.r2.cloudflarestorage.com",
      "media-src 'self' blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // The Haven staff documents are not in public/ on purpose: anything there is
  // fetchable by URL with no session, and these carry audit findings. They are
  // streamed by /api/haven-staff/doc after a session check, so the file has to
  // be traced into that function or it will not exist at runtime.
  outputFileTracingIncludes: {
    "/api/haven-staff/doc/[name]": ["./private-assets/haven/**"],
  },
  serverExternalPackages: ["@react-pdf/renderer"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // A link an employer can be given on a phone call. Until now the only way
      // in was a strip in the footer of the CadreHealth homepage.
      { source: "/hire", destination: "/oncadre/hire", permanent: false },
      { source: "/employers", destination: "/oncadre/hire", permanent: false },

      // The employer area was Dashboard, Post Role, Applications, Search, which
      // was not a set of places. These paths are in people's history and in
      // emails we have already sent, so they keep working.
      {
        source: "/oncadre/employer/search",
        destination: "/oncadre/employer/candidates",
        permanent: false,
      },
      {
        source: "/oncadre/employer/post-role",
        destination: "/oncadre/employer/roles/new",
        permanent: false,
      },
      {
        source: "/oncadre/employer/applications",
        destination: "/oncadre/employer/pipeline",
        permanent: false,
      },
      {
        source: "/oncadre/employer/applications/:id",
        destination: "/oncadre/employer/pipeline/:id",
        permanent: false,
      },
      {
        source: "/oncadre/employer/profile/:id",
        destination: "/oncadre/employer/candidates/:id",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
