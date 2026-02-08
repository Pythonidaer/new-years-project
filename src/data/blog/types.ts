export interface BlogPost {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  image: string;
  link: string;
  /** Optional slug, will be generated from title if not provided */
  slug?: string;
  /** Author name (e.g., "Heidi Fieselmann") */
  author?: string;
  /** Full article content (HTML string) */
  content?: string;
  /** Array of tag/category names for the footer tags section */
  tags?: string[];
}

export type BlogPosts = BlogPost[];

