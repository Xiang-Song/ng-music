import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NzCarouselComponent } from 'ng-zorro-antd/carousel';
import { map } from 'rxjs/internal/operators';
import { Banner, HotTag, Singer, SongSheet } from 'src/app/services/data-types/common.types';
import { HomeService } from 'src/app/services/home.service';
import { SingerService } from 'src/app/services/singer.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {

  carouselActiveIndex = 0;
  banners: Banner[];
  hotTags: HotTag[];
  songSheetList: SongSheet[];
  singers: Singer[];

  @ViewChild(NzCarouselComponent, {static: true}) private nzCarousel!: NzCarouselComponent;
  
  constructor(
    private route: ActivatedRoute
    ) { 
      this.route.data.pipe(map(res => res.HomeDatas)).subscribe(([banners, hotTags, songSheetList, singers]) => {
        this.banners = banners;
        this.hotTags = hotTags;
        this.songSheetList = songSheetList;
        this.singers = singers;
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
