export interface BlogPost {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  image: string;
  link: string;
  slug?: string; // Optional slug, will be generated from title if not provided
  author?: string; // Author name (e.g., "Heidi Fieselmann")
  content?: string; // Full article content (HTML string)
  tags?: string[]; // Array of tag/category names for the footer tags section
}

export type BlogPosts = BlogPost[];

