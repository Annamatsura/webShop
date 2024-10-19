import {ChangeDetectorRef, Component, HostListener, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../core/auth/auth.service";
import {CartType} from "../../../../types/cart.type";
import {CategoryService} from "../../../shared/services/category.service";
import {CategoryType} from "../../../../types/category.type";
import {ActiveParamsUtil} from "../../../shared/utils/active-params.util";
import {debounceTime} from "rxjs";
import {ArticleService} from "../../../shared/services/article.service";
import {ActiveParamsType} from "../../../../types/active-params.type";
import {AppliedFilterType} from "../../../../types/applied-filter.type";

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {
  carts: CartType[] = [];
  categories: CategoryType[] = [];
  activeParams: ActiveParamsType = {categories: []};
  appliedFilters: AppliedFilterType[] = [];
  filterOpen: boolean = false;

  pages: number[] = [];
  notProductsText: boolean = false;

  constructor(private articleService: ArticleService,
              private categoryService: CategoryService,
              private activatedRoute: ActivatedRoute,
              private authService: AuthService,
              private router: Router,
              ) { }

  ngOnInit(): void {
    this.processCatalog();
  }

  processCatalog(){
    this.categoryService.getCategories()
      .subscribe(data => {
        this.categories = data;

        this.activatedRoute.queryParams
          .subscribe(params => {
            this.activeParams = ActiveParamsUtil.processParams(params);

            this.appliedFilters = [];
            this.activeParams.categories.forEach(url => {
              const foundType = this.categories.find(type => type.url === url);
              if (foundType){
                this.appliedFilters.push({
                  name: foundType.name,
                  urlParam: foundType.url
                });
              }
            });

            this.articleService.getArticles(this.activeParams)
              .subscribe( data => {
                this.pages = [];
                for (let i = 1; i <= data.pages; i++) {
                  this.pages.push(i);
                }

                this.carts = data.items;
                console.log(data.items);

                this.notProductsText = this.carts.length === 0;

              });
          });
      });
  }

  removeAppliedFilter(appliedFilter: AppliedFilterType){
    this.activeParams.categories = this.activeParams.categories.filter(item => item !== appliedFilter.urlParam);
    this.activeParams.page = 1;
    //делаем так, чтобы сработал ngOnInit и перезаписал категории
    this.router.navigate(['/articles'], {
      queryParams: this.activeParams
    });
  }

  toggleSorting(){
    this.filterOpen = !this.filterOpen;
  }

  // передаем параметры в url
  updateFilterParam(value: CategoryType, checked: boolean){
    if (this.activeParams.categories && this.activeParams.categories.length > 0) {
      const existingTypeInParams = this.activeParams.categories.find(item => item === value.url);
      if (existingTypeInParams && checked){ // если убираем checked у инпута то удаляем url
        this.activeParams.categories = this.activeParams.categories.filter(item => item !== value.url);
      } else if (!existingTypeInParams && !checked){ // если параметра нет но мы его чекаем
        // this.activeParams.types.push(url);
        this.activeParams.categories = [...this.activeParams.categories, value.url]; //при работе с queryParams push лучше не использовать
      }
    } else if (!checked){ //если в параметрах ничего нет и добавляем в типы новый кликнутый url
      this.activeParams.categories = [value.url];
    }
    this.activeParams.page = 1;
    this.router.navigate(['/articles'], {
      queryParams: this.activeParams
    })
  }

  openPage(page: number){
    this.activeParams.page = page;

    this.router.navigate(['/articles'], {
      queryParams: this.activeParams
    });
  }

  openPrevPage(){
    if (this.activeParams.page && this.activeParams.page > 1){
      this.activeParams.page--;

      this.router.navigate(['/articles'], {
        queryParams: this.activeParams
      });
    }
  }
  openNextPage(){
    if (this.activeParams.page && this.activeParams.page < this.pages.length){
      this.activeParams.page++;

      this.router.navigate(['/articles'], {
        queryParams: this.activeParams
      });
    } else if (!this.activeParams.page){
      this.activeParams.page = 2;
      this.router.navigate(['/articles'], {
        queryParams: this.activeParams
      });
    }
  }

  @HostListener('document:click', ['$event'])
  click(event: Event){
    const targetElement = event.target as HTMLElement;
    const isClickInsideSorting = targetElement.closest('.blog-sorting');

    if (this.filterOpen && !isClickInsideSorting){
      // Если окно сортировки открыто и клик был вне этого окна
      this.filterOpen = false;
    }
    else if (isClickInsideSorting) {
      this.filterOpen = true;
    }
  }

}
