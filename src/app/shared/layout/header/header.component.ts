import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../../core/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {IsActiveMatchOptions, Router} from "@angular/router";
import {UserInfoType} from "../../../../types/user-info.type";
import {DefaultResponseType} from "../../../../types/default-response.type";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  isLogged: boolean = false;
  userName: string | null = null;
  userInfo: UserInfoType | null = null;
  accessTokenForName: string | null = null;

  public linkActiveOptions: IsActiveMatchOptions = {
    matrixParams: 'exact',
    queryParams: 'exact',
    paths: 'exact',
    fragment: 'exact',
  };
  constructor(private authService: AuthService,
              private _snackbar: MatSnackBar,
              private router: Router,
              ) {
    this.isLogged = this.authService.getIsLoggedIn();

  }

  ngOnInit(): void {
    this.authService.isLogged$.subscribe((isLoggedIn: boolean) => {
      this.isLogged = isLoggedIn;
    });
    this.authService.userInfo$
      .subscribe(userName => {
        this.userName = userName;
      })
    this.accessTokenForName = localStorage.getItem(this.authService.accessTokenKey);
    if (this.accessTokenForName){
      this.authService.getUserName(this.accessTokenForName)
        .subscribe( (data: UserInfoType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined){
            const error = (data as DefaultResponseType).message;
            throw new Error(error);
          }

          this.userInfo = data as UserInfoType;
          this.userName = this.userInfo.name;
        })
    }
  }

  logout(): void{
    this.authService.logout()
      .subscribe({
        next: () => {
          this.doLogout();
        },
        error: () => {
          this.doLogout();
        }
      })
  }

  doLogout(): void{
    this.authService.removeTokens();
    this.authService.userId = null;
    this._snackbar.open('Вы вышли из системы');
    this.router.navigate(['/']);
  }

}
