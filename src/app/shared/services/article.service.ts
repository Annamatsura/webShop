import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {CartType} from "../../../types/cart.type";
import {ActiveParamsType} from "../../../types/active-params.type";
@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  constructor(private http: HttpClient) { }

  getTopArticles(): Observable<CartType[]>{
    return this.http.get<CartType[]>(environment.api + "articles/top");
  }
  getArticles(params: ActiveParamsType): Observable<{ totalCount: number, pages: number, items: CartType[] }>{
    return this.http.get<{ totalCount: number, pages: number, items: CartType[] }>(environment.api + "articles", {
      params: params
    });
  }

  getArticle(url: string): Observable<CartType>{
    return this.http.get<CartType>(environment.api + "articles/" + url);
  }

  getRelatedArticles(url: string): Observable<CartType[]>{
    return this.http.get<CartType[]>(environment.api + "articles/related/" + url);
  }
}
