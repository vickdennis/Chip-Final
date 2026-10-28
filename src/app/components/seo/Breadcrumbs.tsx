import React from 'react';
import { JsonLd } from './JsonLd';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumbs Component with Schema.org BreadcrumbList JSON-LD
 * Aids user navigation and generates Google breadcrumb rich snippets in SERP results.
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `https://chipng.com${item.url}`
    }))
  };

  return (
    <>
      <JsonLd data={schemaData} id="breadcrumbs-schema" />
      <nav aria-label="Breadcrumb" className="py-3 text-xs text-slate-400">
        <ol className="flex items-center flex-wrap gap-1.5">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.url} className="flex items-center gap-1.5">
                {index > 0 && <span className="text-slate-600">/</span>}
                {isLast ? (
                  <span className="text-indigo-400 font-medium" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <a
                    href={item.url}
                    className="hover:text-white transition-colors duration-150"
                  >
                    {item.name}
                  </a>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

export default Breadcrumbs;
