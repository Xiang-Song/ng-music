import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { WyUiModule } from './wy-ui/wy-ui.module';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzModalModule,
    WyUiModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzInputModule,
    NzCarouselModule,
    NzModalModule,
    NzRadioModule,
    NzPaginationModule,
    NzTagModule,
    NzTableModule,
    NzMessageModule,
    WyUiModule,
  ],
})
export class ShareModule { }
