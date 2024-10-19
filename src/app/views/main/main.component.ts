import { Component, OnInit } from '@angular/core';
import {CartType} from "../../../types/cart.type";
import {ArticleService} from "../../shared/services/article.service";
import {Router} from "@angular/router";
import {OwlOptions} from "ngx-owl-carousel-o";
import {FormBuilder, Validators} from "@angular/forms";
import {ModalService} from "../../shared/services/modal.service";
import {ModalFormType} from "../../../types/modal-form.type";
import {ServiceType} from "../../../types/service.type";
import {DefaultResponseType} from "../../../types/default-response.type";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  carts: CartType[] = [];

  customOptionsCarousel: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: true,
    navSpeed: 700,
    animateOut: 'fadeOut',
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      }
    },
    nav: false
  }

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      }
    },
    nav: true
  }

  reviews = [
    {
      name: 'Станислав',
      image: 'review7.jpg',
      text: 'Спасибо огромное АйтиШторму за прекрасный блог с полезными статьями! Именно они и побудили меня углубиться в тему SMM и начать свою карьеру.'
    },
    {
      name: 'Алёна',
      image: 'review5.jpg',
      text: 'Обратилась в АйтиШторм за помощью копирайтера. Ни разу ещё не пожалела! Ребята действительно вкладывают душу в то, что делают, и каждый текст, который я получаю, с нетерпением хочется выложить в сеть.'
    },
    {
      name: 'Мария',
      image: 'review6.jpg',
      text: 'Команда АйтиШторма за такой короткий промежуток времени сделала невозможное: от простой фирмы по услуге продвижения выросла в мощный блог о важности личного бренда. Класс!'
    },
  ];

  modalForm = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^([А-ЯЁ][а-яё]*)(s[А-ЯЁ][а-яё]*)*$/)]],
    phone: ['', [Validators.required]],
    service: [''],
  });

  modalRequest: boolean = false;
  modalThanks: boolean = false;

  websiteCreation: boolean = false;
  promotion: boolean = false;
  advertising: boolean = false;
  copyWriting: boolean = false;

  websiteCreationText: ServiceType = ServiceType.websiteCreation;
  promotionText: ServiceType = ServiceType.promotion;
  advertisingText: ServiceType = ServiceType.advertising;
  copyWritingText: ServiceType = ServiceType.copyWriting;

  constructor(private articleService: ArticleService,
              private router: Router,
              private fb: FormBuilder,
              private modalService: ModalService,
              private _snackbar: MatSnackBar,
              ) { }

  ngOnInit(): void {
    this.articleService.getTopArticles()
      .subscribe( data => {
        this.carts = data;



      });
  }

  sendRequest(){
    if (this.modalForm.value.name && this.modalForm.value.phone){
      this.modalService.sendServiceRequest(this.modalForm.value.name,
        this.modalForm.value.phone, this.modalForm.value.service as ServiceType, ModalFormType.order)?.
          subscribe( data => {
            let error = null;
            if (data.error){
              error = data.message;
              this._snackbar.open(error);
              throw new Error(error);
            }

            this.modalRequest = false;
            this.modalThanks = true;
          })
    }

  }

  closeModal(){
    this.modalRequest = false;
    this.modalThanks = false;
  }

  openModal(value: ServiceType = ServiceType.websiteCreation){
    this.websiteCreation = false;
    this.promotion = false;
    this.advertising = false;
    this.copyWriting = false;

  this.modalForm.markAsUntouched();
  this.modalForm.markAsPristine();

    const paramsToUpdate = {
      name: '',
      phone: '',
      service: value,
    }

    this.modalForm.setValue(paramsToUpdate);
    switch (value) {
      case ServiceType.websiteCreation:
        this.websiteCreation = true;
        break;
      case ServiceType.promotion:
        this.promotion = true;
        break;
      case ServiceType.advertising:
        this.advertising = true;
        break;
      case ServiceType.copyWriting:
        this.copyWriting = true;
        break;
    }
    this.modalRequest = true;
  }

}
