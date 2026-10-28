import React from 'react';

interface JsonLdProps {
  data: Record<string, any> | Array<Record<string, any>>;
  id?: string;
}

/**
 * JsonLd Server Component
 * Safely embeds Schema.org structured data (JSON-LD) into the document head/body
 * formatted specifically for search engine crawlers and LLM answer engines.
 */
export function JsonLd({ data, id }: JsonLdProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c')
      }}
    />
  );
}

export default JsonLd;
