export interface IPost {
  id: number;
  created_at: number;
  updated_at: number;
  scheduled_at: number | null;
  author_id: number;
  title: string;
  text: string;
  public: boolean;
  hashtages: string[];
}