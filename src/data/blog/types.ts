export interface BlogPost {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  image: string;
  link: string;
  slug?: string; // Optional slug, will be generated from title if not provided
}

export type BlogPosts = BlogPost[];

