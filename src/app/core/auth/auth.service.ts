import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {map, Observable, Subject, switchMap, tap, throwError} from "rxjs";
import {environment} from "../../../environments/environment";
import {DefaultResponseType} from "../../../types/default-response.type";
import {LoginResponseType} from "../../../types/login-response.type";
import {UserInfoType} from "../../../types/user-info.type";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public accessTokenKey: string = 'accessToken';
  public refreshTokenKey: string = 'refreshToken';
  public userIdKey: string = 'userId';

  public isLogged$: Subject<boolean> = new Subject<boolean>();
  private isLogged: boolean = false;

  public userInfo$: Subject<string> = new Subject<string>();
  private userInfo: string = '';


  constructor(private http: HttpClient) {
    this.isLogged = !!localStorage.getItem(this.accessTokenKey);
  }

  login(email: string, password: string, rememberMe: boolean): Observable<DefaultResponseType | LoginResponseType> {
    return this.http.post<DefaultResponseType | LoginResponseType>(environment.api + 'login', {
      email, password, rememberMe
    }).pipe(
      // После успешного логина, сохраняем токены
      tap((response: any) => {
        if ('accessToken' in response && 'refreshToken' in response) {
          this.setTokens(response.accessToken, response.refreshToken);
        }
      }),

      switchMap((response: LoginResponseType) => {
        // Вызываем метод для получения информации о пользователе
        return this.getUserName(response.accessToken).pipe(
          // Обновляем информацию о пользователе в userInfo и уведомляем подписчиков
          tap((userInfo: any) => {
            if (userInfo.name) {
              this.userInfo = userInfo.name;
              this.userInfo$.next(this.userInfo); // Оповещаем подписчиков
            }
          }),
          // Возвращаем исходный ответ (LoginResponseType) после выполнения всех действий
          map(() => response)
        );
      })
    );
  }




  // login(email: string, password: string, rememberMe: boolean) : Observable<DefaultResponseType | LoginResponseType>{
  //   return this.http.post<DefaultResponseType | LoginResponseType>(environment.api + 'login', {
  //     email, password, rememberMe
  //   })
  // }

  // signup(name: string, email: string, password: string) : Observable<DefaultResponseType | LoginResponseType>{
  //   return this.http.post<DefaultResponseType | LoginResponseType>(environment.api + 'signup', {
  //     name, email, password
  //   })
  // }

  signup(name: string, email: string, password: string): Observable<DefaultResponseType | LoginResponseType> {
    return this.http.post<DefaultResponseType | LoginResponseType>(environment.api + 'signup', {
      name, email, password
    }).pipe(
      // После успешной регистрации, устанавливаем токены
      tap((response: any) => {
        if ('accessToken' in response && 'refreshToken' in response) {
          this.setTokens(response.accessToken, response.refreshToken);
        }
      }),
      switchMap((response: LoginResponseType) => {
        // Вызываем метод для получения информации о пользователе
        return this.getUserName(response.accessToken)
          .pipe(
            // Обновляем информацию о пользователе в userInfo и уведомляем подписчиков
            tap((userInfo: any) => {
              if (userInfo.name) {
                this.userInfo = userInfo.name;
                this.userInfo$.next(this.userInfo); // Оповещаем подписчиков
              }
            }),
            // Возвращаем исходный ответ (LoginResponseType) после выполнения всех действий
            map(() => response)
        );
      })
    );
  }

  getUserName(accessToken: string): Observable<DefaultResponseType | UserInfoType>{
    const headers= new HttpHeaders().set('x-auth', accessToken);
    return this.http.get<DefaultResponseType | UserInfoType>(environment.api + 'users', {headers: headers});
  }


  logout() : Observable<DefaultResponseType>{
    const tokens = this.getTokens();

    if (tokens && tokens.refreshToken){
      return this.http.post<DefaultResponseType>(environment.api + 'logout', {
        refreshToken: tokens.refreshToken
      })
    }
    throw throwError(() => 'Can not find token');

  }

  refresh(): Observable<DefaultResponseType | LoginResponseType> {
    const tokens = this.getTokens();
    if (tokens && tokens.refreshToken){
      return this.http.post<DefaultResponseType | LoginResponseType>(environment.api + 'refresh', {
        refreshToken: tokens.refreshToken
      })
    }
    throw throwError(() => 'Can not use token');
  }

  public getIsLoggedIn(){
    return this.isLogged;
  }

  public setTokens(accessToken: string, refreshToken: string): void{
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    this.isLogged = true;
    this.isLogged$.next(true);
  }

  public removeTokens(): void{
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.isLogged = false;
    this.isLogged$.next(false);
  }

  public getTokens(): {accessToken: string | null, refreshToken: string | null} {
    return {
      accessToken: localStorage.getItem(this.accessTokenKey),
      refreshToken: localStorage.getItem(this.refreshTokenKey),
    }
  }

  get userId(): null | string {
    return localStorage.getItem(this.userIdKey);
  }

  set userId(id: string | null){
    if (id){
      localStorage.setItem(this.userIdKey, id);
    } else {
      localStorage.removeItem(this.userIdKey);
    }
  }

}
