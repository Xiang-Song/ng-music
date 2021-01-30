import { Component, OnInit, ViewChild } from '@angular/core';
import { NzCarouselComponent } from 'ng-zorro-antd/carousel';
import { Banner } from 'src/app/services/data-types/common.types';
import { HomeService } from 'src/app/services/home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {

  carouselActiveIndex = 0;
  banners: Banner[];

  @ViewChild(NzCarouselComponent, {static: true}) private nzCarousel!: NzCarouselComponent;
  
  constructor(private homeServe: HomeService) { 
    this.homeServe.getBanners().subscribe(banners => {
      this.banners = banners;
    })
      
  }

  ngOnInit(): void {
  }

  onBeforeChange({ to }:{ to:any }) {
    this.carouselActiveIndex = to;
  }

  onChangeSlide(type: 'pre' | 'next'){
    this.nzCarousel[type]();
  }

}
