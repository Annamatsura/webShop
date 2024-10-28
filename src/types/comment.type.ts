export type CommentType = {
  id?: string,
  text: string,
  date: string,
  likesCount: number,
  dislikesCount: number,
  loading?: boolean,
  user: {
    id: string,
    name: string
  }
}
