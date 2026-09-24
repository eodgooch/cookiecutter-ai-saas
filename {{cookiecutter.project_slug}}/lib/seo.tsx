import type { Metadata } from "next";
import config from "@/config";

export const getSEOTags = ({
  title,
  description,
  keywords,
  openGraph,
  canonicalUrlRelative,
}: Metadata & {
  canonicalUrlRelative?: string;
} = {}): Metadata => {
  return {
    title: title || config.appName,
    description: description || config.appDescription,
    keywords: keywords || [config.appName],
    applicationName: config.appName,
    metadataBase: new URL(
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/"
        : `https://${config.domainName}/`
    ),
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
    openGraph: {
      title: openGraph?.title || config.appName,
      description: openGraph?.description || config.appDescription,
      url: openGraph?.url || `https://${config.domainName}/`,
      siteName: config.appName,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: `https://${config.domainName}/og-image.png`,
          width: 1200,
          height: 630,
          alt: config.appName,
        },
      ],
    },
    twitter: {
      title: openGraph?.title || config.appName,
      description: openGraph?.description || config.appDescription,
      card: "summary_large_image",
      images: [`https://${config.domainName}/og-image.png`],
    },
    ...(canonicalUrlRelative && {
      alternates: { canonical: canonicalUrlRelative },
    }),
  };
};

// Serialize JSON-LD for an inline <script>. JSON.stringify leaves "<" intact,
// so a value containing "</script>" would close the tag early; escape it.
const jsonLd = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c");

export const renderSchemaTags = () => {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: config.appName,
            description: config.appDescription,
            image: `https://${config.domainName}/og-image.png`,
            url: `https://${config.domainName}/`,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: config.appName,
            url: `https://${config.domainName}/`,
            logo: `https://${config.domainName}/og-image.png`,
            description: config.appDescription,
            contactPoint: {
              "@type": "ContactPoint",
              url: `https://${config.domainName}/contact`,
              contactType: "customer support",
            },
          }),
        }}
      />
    </>
  );
};

export const renderArticleSchema = (post: {
  title: string;
  excerpt?: string | null;
  publishedAt?: string | null;
  slug: string;
  featuredImage?: { url?: string } | null;
  tags?: Array<{ tag?: string }> | null;
}) => {
  const baseUrl = `https://${config.domainName}`;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: jsonLd({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt || undefined,
          datePublished: post.publishedAt || undefined,
          url: `${baseUrl}/blog/${post.slug}`,
          image: post.featuredImage?.url || `${baseUrl}/og-image.png`,
          author: {
            "@type": "Organization",
            name: config.appName,
            url: baseUrl,
          },
          publisher: {
            "@type": "Organization",
            name: config.appName,
            logo: {
              "@type": "ImageObject",
              url: `${baseUrl}/og-image.png`,
            },
          },
          ...(post.tags &&
            post.tags.length > 0 && {
              keywords: post.tags
                .map((t) => t.tag)
                .filter(Boolean)
                .join(", "),
            }),
        }),
      }}
    />
  );
};

export const renderFAQSchema = (
  faqs: Array<{ q: string; a: string }>
) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: jsonLd({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.a,
            },
          })),
        }),
      }}
    />
  );
};
