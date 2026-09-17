import React from "react";
import { Helmet } from "react-helmet-async";

const MetaData = ({
  title,
  description,
  image,
  url,
  type = "website",
  noIndex = false,
  schema = null,
}) => {
  const siteUrl = import.meta.env.VITE_SITE_URL;

  const fullUrl = url
    ? url.startsWith("http")
      ? url
      : `${siteUrl}${url}`
    : siteUrl;

  const fullTitle = title
    ? title.includes("Pixel & Pen")
      ? title
      : `${title} · Pixel & Pen`
    : "Pixel & Pen";

  return (
    <Helmet>
      {/* Basic SEO */}
      <title>{fullTitle}</title>

      {description && (
        <meta name="description" content={description} />
      )}

      {/* Robots */}
      {noIndex && (
        <meta
          name="robots"
          content="noindex, nofollow"
        />
      )}

      {/* Canonical */}
      {!noIndex && fullUrl && (
        <link
          rel="canonical"
          href={fullUrl}
        />
      )}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />

      {description && (
        <meta
          property="og:description"
          content={description}
        />
      )}

      <meta
        property="og:type"
        content={type}
      />

      {!noIndex && fullUrl && (
        <meta
          property="og:url"
          content={fullUrl}
        />
      )}

      {image && (
        <meta
          property="og:image"
          content={image}
        />
      )}

      {/* X / Twitter */}
      <meta
        name="twitter:card"
        content="summary_large_image"
      />

      <meta
        name="twitter:title"
        content={fullTitle}
      />

      {description && (
        <meta
          name="twitter:description"
          content={description}
        />
      )}

      {image && (
        <meta
          name="twitter:image"
          content={image}
        />
      )}

      {/* Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default MetaData;