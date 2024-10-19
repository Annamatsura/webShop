import {Component, Input, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {CartType} from "../../../../types/cart.type";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {
  @Input() cart!: CartType;

  @Input() pathIsTop: string = '';
  serverStaticPath = environment.serverStaticPath;
  constructor(private router: Router) {}

  ngOnInit(): void {}

  navigate(){
    this.router.navigate(['/articles/' + this.cart.url]);
  }

}
