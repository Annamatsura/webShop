import { Component, OnInit } from '@angular/core';
import {ArticleService} from "../../../shared/services/article.service";
import {ActivatedRoute, Router} from "@angular/router";
import {CartType} from "../../../../types/cart.type";
import {AuthService} from "../../../core/auth/auth.service";
import {environment} from "../../../../environments/environment";
import {CommentService} from "../../../shared/services/comment.service";
import {AllCommentsType} from "../../../../types/all-comments.type";
import {CommentType} from "../../../../types/comment.type";
import {FormBuilder, Validators} from "@angular/forms";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {HttpErrorResponse} from "@angular/common/http";
import {ActionType} from "../../../../types/action.type";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  infoArticle: CartType | null = null;
  serverStaticPath = environment.serverStaticPath;
  relatedArticles: CartType[] | null = null;
  likeDislikeActive: boolean = false;

  isLogged: boolean = false;

  comments: CommentType[] | null = null;
  noCommentsText: boolean = false;
  threeComments: number = 3;
  // tenComments: number = 10;
  numbMoreComments: number = 0;
  buttonMoreComments: boolean = false;

  allComments: number = 0;

  actionComment = ActionType;

  commentForm = this.fb.group({
    comment: ['', Validators.required]
  });


  constructor(
    private articleService: ArticleService,
    private activatedRoute: ActivatedRoute,
    private commentService: CommentService,
    private authService: AuthService,
    private _snackbar: MatSnackBar,
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.isLogged = this.authService.getIsLoggedIn();
  }

  ngOnInit(): void {
    this.authService.isLogged$.subscribe((isLoggedIn: boolean) => {
      this.isLogged = isLoggedIn;
    });

    this.activatedRoute.params.subscribe(params => {
      this.articleService.getArticle(params['url'])
        .subscribe((data: CartType) => {
          this.infoArticle = data;

          this.doNumberComments(false);
        });
      this.articleService.getRelatedArticles(params['url'])
        .subscribe((data: CartType[]) => {
          this.relatedArticles = data;
        });

      //если не получены данные, то перевод на страницу 404
    });
  }

  doNumberComments(click: boolean){
    console.log('start', this.numbMoreComments)
    if (click){
      this.numbMoreComments += 10;
      console.log(1)
    } else {
      if (this.numbMoreComments === 0){
        console.log("q", 2)
        this.numbMoreComments = 3
        console.log(this.numbMoreComments);
      }
    }

    if (this.comments && this.allComments === 0){
      console.log(3)
      this.noCommentsText = true;
      this.numbMoreComments = 0;
    }
    else if (this.comments && this.allComments > 0 && this.allComments < 3){
      console.log(4)
      this.numbMoreComments = this.allComments;
      this.buttonMoreComments = false;
    }
    else if (this.comments && this.allComments > 3 && this.allComments < this.numbMoreComments){
      console.log(5)
      this.numbMoreComments = this.allComments;
      this.buttonMoreComments = false;
    }
    else if (this.comments && this.allComments > this.numbMoreComments){
      console.log(6)

      this.buttonMoreComments = true;
    }
    else if (!this.comments) {
      this.numbMoreComments = 3
    }
    else {
      this.noCommentsText = true;
      this.numbMoreComments = 0;
    }

    const numb = this.numbMoreComments;
    if (this.infoArticle){
      console.log('numb', numb)
      this.getComment(numb, this.infoArticle?.id);
    }
  }

  getComment(number: number, articleId: string){
    this.commentService.getComments(number, articleId)
      .subscribe(data => {
        this.allComments = data.allCount;
        if (this.allComments <= number){
          console.log('this.allComments < number')
          this.comments = data.comments.slice(0, this.allComments + 1);
          this.buttonMoreComments = false;
        } else{
          console.log('this.allComments > number')
          console.log(number + 1)
          number += 1;
          this.comments = data.comments.slice(0, number);
          console.log(data.comments.slice(0, number) )
          this.noCommentsText = false;
          this.buttonMoreComments = true;
        }

        this.router.navigate(['/articles/' + this.infoArticle?.url]);
      })
  }

  // getComment(number: number, articleId: string){
  //   if (number === 0){
  //     this.numbMoreComments = 3;
  //   } else {
  //     this.numbMoreComments += number;
  //   }
  //
  //   if (this.numbMoreComments > this.allComments){
  //     this.numbMoreComments = this.allComments;
  //   }
  //
  //   console.log(this.numbMoreComments);
  //   console.log(number);
  //
  //   this.commentService.getComments(this.numbMoreComments, articleId)
  //     .subscribe(data => {
  //       this.allComments = data.allCount;
  //       if (this.allComments > 0){
  //         this.comments = data.comments;
  //         this.buttonMoreComments = true;
  //
  //         if (this.numbMoreComments === this.allComments){
  //           this.buttonMoreComments = false;
  //         }
  //       }
  //       else {
  //         this.noCommentsText = true;
  //         //комментариев пока нет
  //       }
  //
  //       this.router.navigate(['/articles/' + this.infoArticle?.url]);
  //     })
  // }

  // getComment(number: number, articleId: string){
  //   if (this.numbMoreComments > 0){
  //     number += this.numbMoreComments;
  //   }
  //   console.log(this.numbMoreComments);
  //   this.commentService.getComments(number, articleId)
  //     .subscribe(data => {
  //       if (data.allCount > 0){
  //         this.noCommentsText = false;
  //         if (data.allCount > this.threeComments){
  //           this.comments = data.comments.slice(0,3);
  //           this.numbMoreComments = this.threeComments;
  //           this.buttonMoreComments = true;
  //         }
  //         else if (data.allCount > this.numbMoreComments + this.tenComments){
  //           this.numbMoreComments +=  this.tenComments;
  //           this.comments = data.comments.slice(0, this.numbMoreComments);
  //           this.buttonMoreComments = true;
  //         }
  //         else {
  //           this.comments = data.comments;
  //           this.buttonMoreComments = false;
  //         }
  //       }
  //       else {
  //         this.noCommentsText = true;
  //         //комментариев пока нет
  //       }
  //     })
  // }

  addComment(id: string | undefined){
    const token = this.authService.getTokens();
    if (this.commentForm.value.comment && id &&  token.accessToken){
      console.log(this.commentForm.value.comment)
      this.commentService.setComment(this.commentForm.value.comment, id, token.accessToken)
        .subscribe({
          next: (data: DefaultResponseType) => {
            if (data.error){
              const error = (data as DefaultResponseType).message;
              throw new Error(error);
            }

            this.commentForm.value.comment = '';
            this.router.navigate(['/articles/' + this.infoArticle?.url]);
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.error.message){
              this._snackbar.open(errorResponse.error.message);
            } else {
              this._snackbar.open('Ошибка заказа');
            }
          }
        });
    }
  }

  setCommentAction(action: ActionType, id: string){
    const token = this.authService.getTokens();
    if (token.accessToken){
      this.commentService.setCommentAction(action, id, token.accessToken)
        .subscribe({
          next: (data: DefaultResponseType) => {
            if (data.error){
              const error = (data as DefaultResponseType).message;
              throw new Error(error);
            }

            this.likeDislikeActive = true;
            this.router.navigate(['/articles/' + this.infoArticle?.url]);
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.error.message){
              this._snackbar.open(errorResponse.error.message);
            } else {
              this._snackbar.open('Ошибка заказа');
            }
          }
        })
    }

    console.log(action)
    console.log(id)
  }
  checkCommentAction(){}

  getAllCommentsActions(){}

}
