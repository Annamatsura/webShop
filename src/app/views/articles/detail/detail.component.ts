import { Component, OnInit } from '@angular/core';
import { ArticleService } from "../../../shared/services/article.service";
import { ActivatedRoute, Router } from "@angular/router";
import { CartType } from "../../../../types/cart.type";
import { AuthService } from "../../../core/auth/auth.service";
import { environment } from "../../../../environments/environment";
import { CommentService } from "../../../shared/services/comment.service";
import { CommentType } from "../../../../types/comment.type";
import { FormBuilder, Validators } from "@angular/forms";
import { DefaultResponseType } from "../../../../types/default-response.type";
import { MatSnackBar } from "@angular/material/snack-bar";
import { HttpErrorResponse } from "@angular/common/http";
import { ActionType } from "../../../../types/action.type";
import { UserInfoType } from "../../../../types/user-info.type";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  relatedArticles: CartType[] | null = null;
  actionComment = ActionType;
  infoArticle: CartType | null = null;
  serverStaticPath = environment.serverStaticPath;
  comments: CommentType[] = [];
  isLogged: boolean = false;
  userInfo: UserInfoType | null = null;
  noCommentsText: boolean = false;
  loadMoreComments: boolean = false;
  loading: boolean = false;

  allCommentsCount: number = 0;
  commentsToShowCount: number = 3;

  commentForm = this.fb.group({
    comment: ['', Validators.required]
  });

  // Флаги для каждого комментария
  toggleLikeDislike = new Map<string, { like: boolean; dislike: boolean; violate: boolean }>();

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
          console.log(this.commentsToShowCount)
          // this.fetchComments(this.commentsToShowCount);
          this.fetchComments();
        });
      this.articleService.getRelatedArticles(params['url'])
        .subscribe((data: CartType[]) => {
          this.relatedArticles = data;
        });
    });

    this.authService.getUserName(localStorage.getItem(this.authService.accessTokenKey) || '')
      .subscribe((data: UserInfoType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error) {
          this._snackbar.open((data as DefaultResponseType).message, 'Close');
        } else {
          this.userInfo = data as UserInfoType;
        }
      });
  }

  fetchComments(): void {
    if (!this.infoArticle) return;
    this.loading = true;
    const accessToken = localStorage.getItem(this.authService.accessTokenKey) || '';

    // Запрашиваем все комментарии, если их меньше 3
    const countToRequest = this.allCommentsCount < 3 ? this.allCommentsCount : this.commentsToShowCount;

    // Запрашиваем комментарии
    this.commentService.getComments(countToRequest, this.infoArticle.id)
      .subscribe(data => {
        const tempComments: CommentType[] = data.comments;
        this.allCommentsCount = data.allCount;
        this.noCommentsText = this.allCommentsCount === 0;

        // Объединяем текущие комментарии с новыми
        this.comments = [...this.comments, ...tempComments];

        // Проверяем, нужно ли показывать кнопку "Загрузить больше"
        this.loadMoreComments = this.comments.length + 3 < this.allCommentsCount;

        // Загружаем действия для комментариев только один раз при первой загрузке комментариев
        if (this.comments.length === tempComments.length && this.infoArticle) {
          this.commentService.getAllCommentsActions(this.infoArticle.id, accessToken)
            .subscribe((actions) => {
              if (!Array.isArray(actions)) return;

              // Очищаем toggleLikeDislike и обновляем действия на основе полученных данных
              this.toggleLikeDislike.clear();

              actions.forEach(action => {
                if (!this.toggleLikeDislike.has(action.comment)) {
                  this.toggleLikeDislike.set(action.comment, { like: false, dislike: false, violate: false });
                }

                const commentActions = this.toggleLikeDislike.get(action.comment);
                if (commentActions) {
                  commentActions.like = action.action === 'like';
                  commentActions.dislike = action.action === 'dislike';
                  commentActions.violate = action.action === 'violate';
                  this.toggleLikeDislike.set(action.comment, commentActions);
                }
              });
            });
        }

        this.loading = false;
      }, () => {
        this.loading = false;
      });
  }




  loadMore(): void {
    // Увеличиваем количество комментариев для загрузки на 10
    this.commentsToShowCount = this.commentsToShowCount + 10;

    // Проверяем, нужно ли загружать все комментарии при достижении общего количества
    if (this.commentsToShowCount >= this.allCommentsCount) {
      this.commentsToShowCount = this.allCommentsCount;
      this.loadMoreComments = false;
    }
    console.log(this.commentsToShowCount)

    // Загружаем комментарии с учетом увеличенного количества
    this.fetchComments();
  }



  // addComment(): void {
  //   const accessToken = localStorage.getItem(this.authService.accessTokenKey);
  //   if (!this.infoArticle || !this.commentForm.valid || !accessToken) return;
  //
  //   this.commentService.setComment(this.commentForm.value.comment || '', this.infoArticle.id, accessToken)
  //     .subscribe({
  //       next: (response) => {
  //         // Оповещение об успешном добавлении
  //         this._snackbar.open(response.message || 'Комментарий добавлен!', 'Close');
  //
  //         // Создаем объект нового комментария
  //         const newComment: CommentType = {
  //           id: 'temporary-id-' + Date.now(), // временный id, пока не придет от сервера
  //           text: this.commentForm.value.comment || '',
  //           date: new Date().toISOString(),
  //           likesCount: 0,
  //           dislikesCount: 0,
  //           user: this.userInfo!,
  //         };
  //
  //         // Добавляем новый комментарий в начало списка
  //         this.comments.unshift(newComment);
  //
  //         // Увеличиваем общее количество комментариев
  //         this.allCommentsCount++;
  //
  //         // Сбрасываем форму после добавления комментария
  //         this.commentForm.reset();
  //
  //         // Устанавливаем видимость кнопки "Загрузить ещё"
  //         this.loadMoreComments = this.allCommentsCount > this.comments.length;
  //       },
  //       error: (errorResponse: HttpErrorResponse) => {
  //         this._snackbar.open(errorResponse.error?.message || 'Ошибка добавления комментария', 'Close');
  //       }
  //     });
  // }
  addComment(): void {
    const accessToken = localStorage.getItem(this.authService.accessTokenKey);
    if (!this.infoArticle || !this.commentForm.valid || !accessToken) return;

    // Получаем текст комментария из формы
    const commentText = this.commentForm.value.comment || '';

    // Создаем временный комментарий
    const temporaryComment: CommentType = {
      id: `temp-${Date.now()}`,  // Временный ID для отслеживания
      text: commentText,
      date: new Date().toISOString(),
      likesCount: 0,
      dislikesCount: 0,
      loading: true,  // Флаг временного комментария
      user: {
        id: this.userInfo?.id || 'temp-user-id',  // Используем ID текущего пользователя или временный ID
        name: this.userInfo?.name || 'Anonymous'  // Используем имя текущего пользователя или 'Anonymous'
      }
    };

    // Добавляем временный комментарий в начало списка комментариев
    this.comments = [temporaryComment, ...this.comments];

    // Отправляем запрос на добавление комментария на сервер
    this.commentService.setComment(commentText, this.infoArticle.id, accessToken)
      .subscribe({
        next: (response) => {
          // Удаляем временный комментарий из списка
          this.comments = this.comments.filter(comment => comment.id !== temporaryComment.id);

          // Показать уведомление об успешном добавлении
          this._snackbar.open(response.message || 'Комментарий добавлен!');

          // Обновляем комментарии для отображения реального добавленного комментария
          // this.fetchComments(this.commentsToShowCount + 1);
          this.fetchComments();
        },
        error: (errorResponse: HttpErrorResponse) => {
          // Удаляем временный комментарий в случае ошибки
          this.comments = this.comments.filter(comment => comment.id !== temporaryComment.id);
          this._snackbar.open(errorResponse.error?.message || 'Ошибка добавления комментария');
        }
      });

    // Сбрасываем форму после добавления комментария
    this.commentForm.reset();
  }


  setCommentAction(action: ActionType, commentId: string) {
    const accessToken = localStorage.getItem(this.authService.accessTokenKey) || '';
    this.commentService.setCommentAction(action, commentId, accessToken).subscribe({
      next: () => {
        const commentIndex = this.comments.findIndex(comment => comment.id === commentId);
        if (commentIndex !== -1) {
          const currentComment = this.comments[commentIndex];

          // Устанавливаем начальные значения действий (если не были установлены)
          if (!this.toggleLikeDislike.has(commentId)) {
            this.toggleLikeDislike.set(commentId, { like: false, dislike: false, violate: false });
          }
          const commentActions = this.toggleLikeDislike.get(commentId);

          if (commentActions) {
            // Обновляем состояние действий
            switch (action) {
              case ActionType.like:
                // Если пользователь ставит лайк
                if (commentActions.like) {
                  // Если лайк уже установлен, убираем его
                  commentActions.like = false;
                  currentComment.likesCount--;  // Уменьшаем количество лайков
                } else {
                  // Убираем дизлайк, если он был
                  if (commentActions.dislike) {
                    commentActions.dislike = false;
                    currentComment.dislikesCount--;  // Уменьшаем количество дизлайков
                  }
                  commentActions.like = true;  // Устанавливаем лайк
                  currentComment.likesCount++;  // Увеличиваем количество лайков
                }
                break;

              case ActionType.dislike:
                // Если пользователь ставит дизлайк
                if (commentActions.dislike) {
                  // Если дизлайк уже установлен, убираем его
                  commentActions.dislike = false;
                  currentComment.dislikesCount--;  // Уменьшаем количество дизлайков
                } else {
                  // Убираем лайк, если он был
                  if (commentActions.like) {
                    commentActions.like = false;
                    currentComment.likesCount--;  // Уменьшаем количество лайков
                  }
                  commentActions.dislike = true;  // Устанавливаем дизлайк
                  currentComment.dislikesCount++;  // Увеличиваем количество дизлайков
                }
                break;

              case ActionType.violate:
                commentActions.violate = !commentActions.violate;
                this._snackbar.open('Жалоба отправлена');
                break;
            }

            // Обновляем Map с состояниями действий
            this.toggleLikeDislike.set(commentId, commentActions);
          }
        }
      },
      error: (errorResponse: HttpErrorResponse) => {
        if (errorResponse.error.message === 'No auth token') {
          this._snackbar.open('Действия к комментариям могут осуществлять только зарегистрированные пользователи');
        } else {
          this._snackbar.open(errorResponse.error?.message || 'Ошибка при применении действия');
        }
      }
    });
  }

}
