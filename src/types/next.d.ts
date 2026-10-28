/**
 * Next.js 14+ App Router Type Definitions
 * Provides full TypeScript support for Server Components, Metadata API, and Route Handlers.
 */

declare module 'next' {
  export interface Metadata {
    metadataBase?: URL | null;
    title?: string | { default: string; template: string };
    description?: string | null;
    applicationName?: string | null;
    authors?: Array<{ name: string; url?: string }>;
    generator?: string | null;
    keywords?: string[] | string | null;
    referrer?: string | null;
    themeColor?: string | Array<{ media?: string; color: string }>;
    colorScheme?: 'normal' | 'dark' | 'light' | 'dark light' | 'light dark';
    viewport?: string | { width?: string | number; initialScale?: number; maximumScale?: number; userScalable?: boolean };
    creator?: string | null;
    publisher?: string | null;
    robots?: string | {
      index?: boolean;
      follow?: boolean;
      nocache?: boolean;
      googleBot?: {
        index?: boolean;
        follow?: boolean;
        noimageindex?: boolean;
        'max-video-preview'?: number | string;
        'max-image-preview'?: 'none' | 'standard' | 'large';
        'max-snippet'?: number;
      };
    };
    icons?: any;
    manifest?: string | URL | null;
    openGraph?: {
      title?: string;
      description?: string;
      url?: string | URL;
      siteName?: string;
      images?: Array<{
        url: string;
        width?: number;
        height?: number;
        alt?: string;
      }> | string;
      locale?: string;
      type?: 'website' | 'article' | 'book' | 'profile' | 'music.song' | 'music.album' | 'video.movie' | 'video.episode';
      publishedTime?: string;
      authors?: string[];
      tags?: string[];
    };
    twitter?: {
      card?: 'summary' | 'summary_large_image' | 'app' | 'player';
      title?: string;
      description?: string;
      site?: string;
      creator?: string;
      images?: string[] | Array<{ url: string; alt?: string }>;
    };
    alternates?: {
      canonical?: string | URL | null;
      languages?: Record<string, string>;
      media?: Record<string, string>;
      types?: Record<string, string>;
    };
    category?: string;
    classification?: string;
    other?: Record<string, string | number | Array<string | number>>;
  }

  export type ResolvingMetadata = Promise<Metadata>;

  export namespace MetadataRoute {
    export type Sitemap = Array<{
      url: string;
      lastModified?: string | Date;
      changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
      priority?: number;
    }>;

    export interface Robots {
      rules:
        | {
            userAgent?: string | string[];
            allow?: string | string[];
            disallow?: string | string[];
            crawlDelay?: number;
          }
        | Array<{
            userAgent?: string | string[];
            allow?: string | string[];
            disallow?: string | string[];
            crawlDelay?: number;
          }>;
      sitemap?: string | string[];
      host?: string;
    }
  }
}

declare module 'next/server' {
  export class NextResponse extends Response {
    static json(body: any, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, init?: number | ResponseInit): NextResponse;
    static next(): NextResponse;
  }
}
