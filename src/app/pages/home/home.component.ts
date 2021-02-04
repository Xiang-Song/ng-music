import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzCarouselComponent } from 'ng-zorro-antd/carousel';
import { map } from 'rxjs/internal/operators';
import { Banner, HotTag, Singer, SongSheet } from 'src/app/services/data-types/common.types';
import { SheetService } from 'src/app/services/sheet.service';
import { BatchActionsService } from 'src/app/store/batch-actions.service';


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
    private route: ActivatedRoute,
    private router: Router,
    private sheetServe: SheetService,
    private batchActionsServe: BatchActionsService
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

  onPlaySheet(id: number){
    console.log("id: ", id);
    this.sheetServe.playSheet(id).subscribe(list => {
      this.batchActionsServe.selectPlayList({list, index: 0});
    })
  }

  toInfo(id: number){
    this.router.navigate(['/sheetInfo', id]);
  }

}
