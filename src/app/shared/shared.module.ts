import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { CategoryFilterComponent } from './components/category-filter/category-filter.component';
import {TextCutPipe} from './pipes/pipe.pipe';
import {RouterModule} from "@angular/router";



@NgModule({
  declarations: [
    ProductCardComponent,
    CategoryFilterComponent,
    TextCutPipe,
  ],
  imports: [
    CommonModule,
    RouterModule,
  ],
  exports: [ProductCardComponent],

})
export class SharedModule { }
