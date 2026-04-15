type Post = {
  id: number;
  title: string;
  href: string;
  image: string;
  author?: string;
  date: string;
  tags?: string[];
  excerpt?: string;
  comments: string;
};