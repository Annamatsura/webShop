import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable, Subject, tap} from "rxjs";
import {environment} from "../../../environments/environment";
import {AllCommentsType} from "../../../types/all-comments.type";
import {DefaultResponseType} from "../../../types/default-response.type";
import {ActionType} from "../../../types/action.type";
import {CommentActionsType} from "../../../types/comment-actions.type";

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(private http: HttpClient) { }

  getComments(offset: number, articleId: string): Observable<AllCommentsType>{
    return this.http.get<AllCommentsType>(environment.api + "comments?offset=" + offset + "&article=" + articleId);
  }

  setComment(text: string, id: string, accessToken: string): Observable<DefaultResponseType>{
    const headers= new HttpHeaders().set('x-auth', accessToken);
    return this.http.post<DefaultResponseType>(environment.api + "comments", {
      text: text,
      article: id
    }, {headers: headers});
  }

  setCommentAction(action: ActionType, id: string, accessToken: string): Observable<DefaultResponseType>{
    const headers= new HttpHeaders().set('x-auth', accessToken);
    return this.http.post<DefaultResponseType>(environment.api + "comments/" + id + "/apply-action", {
      action
    }, {headers: headers});
  }

  getCommentAction(id: string, accessToken: string): Observable<CommentActionsType | DefaultResponseType>{
    const headers= new HttpHeaders().set('x-auth', accessToken);
    return this.http.get<CommentActionsType | DefaultResponseType>(environment.api + "comments/" + id + "/actions", {
      headers: headers
    });
  }
  getAllCommentsActions(articleId: string, accessToken: string): Observable<CommentActionsType[] | DefaultResponseType>{
    const headers= new HttpHeaders().set('x-auth', accessToken);
    return this.http.get<CommentActionsType[] | DefaultResponseType>(environment.api +
      "comments/article-comment-actions?articleId=" + articleId, {
      headers: headers,
    });
  }
}
