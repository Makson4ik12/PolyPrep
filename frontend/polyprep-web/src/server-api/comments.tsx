export interface IComment {
  id : number;
  created_at: number;
  updated_at: number;
  author_id: number;
  post_id: number;
  text: string;
}