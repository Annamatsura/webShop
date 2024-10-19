import {CommentType} from "./comment.type";

export type CartType = {
  text?:string,
  comments?: CommentType[],
  commentsCount?: number,
  id: string,
  title: string,
  description: string,
  image: string,
  date: string,
  category: string,
  url: string
}

