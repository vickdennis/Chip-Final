import React from 'react';
import { Helmet } from 'react-helmet-async';

export interface SeoHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'product' | 'profile';
  image?: string;
  noindex?: boolean;
  keywords?: string;
  schemaJsonLd?: object | object[] | string;
}

const SITE_ORIGIN = 'https://www.chipng.com';
const DEFAULT_OG_IMAGE = 'https://www.chipng.com/chipng_3d_logo.jpg';

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  canonicalPath,
  canonicalUrl,
  ogType = 'website',
  image = DEFAULT_OG_IMAGE,
  noindex = false,
  keywords,
  schemaJsonLd,
}) => {
  const normalizedPath = canonicalPath
    ? canonicalPath === '/'
      ? '/'
      : `/${canonicalPath.replace(/^\/+/, '').replace(/\/+$/, '')}`
    : '/';

  const resolvedCanonical = canonicalUrl || `${SITE_ORIGIN}${normalizedPath}`;
  const robotsContent = noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  const serializedSchema =
    typeof schemaJsonLd === 'string'
      ? schemaJsonLd
      : schemaJsonLd
      ? JSON.stringify(schemaJsonLd)
      : null;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={resolvedCanonical} />

      {/* OpenGraph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="CHIP NG" />
      <meta property="og:url" content={resolvedCanonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      <meta property="og:image:alt" content={title} />

      {/* Twitter / X Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@chipng_nfc" />
      <meta name="twitter:creator" content="@chipng_nfc" />
      <meta name="twitter:url" content={resolvedCanonical} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {serializedSchema ? (
        <script type="application/ld+json">{serializedSchema}</script>
      ) : null}
    </Helmet>
  );
};

export default SeoHead;
