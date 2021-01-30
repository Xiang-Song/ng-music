import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule ,
  ],
  exports: [
    CommonModule,
    FormsModule,
    NzButtonModule ,
  ]
})
export class ShareModule { }
