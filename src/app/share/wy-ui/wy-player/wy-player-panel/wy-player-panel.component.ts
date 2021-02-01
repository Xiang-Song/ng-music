import { Component, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { timer } from 'rxjs';
import { Song } from 'src/app/services/data-types/common.types';
import { WyScrollComponent } from '../wy-scroll/wy-scroll.component';

@Component({
  selector: 'app-wy-player-panel',
  templateUrl: './wy-player-panel.component.html',
  styleUrls: ['./wy-player-panel.component.less']
})
export class WyPlayerPanelComponent implements OnInit, OnChanges {

  @Input() songList: Song[];
  @Input() currentSong: Song;
  @Input() currentIndex: number;
  @Input() show: boolean;

  @Output() onClose = new EventEmitter<void>();
  @Output() onChangeSong = new EventEmitter<Song>();

  scrollY = 0;
  
  @ViewChildren(WyScrollComponent) private wyScroll: QueryList<WyScrollComponent>;
  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['songList']){
      // console.log('ppsongList: ', this.songList);
      // this.currentIndex = 0;
    }
    if(changes['currentSong']){
      console.log('currentSong: ', this.currentSong);
      if(this.currentSong){
      //   this.currentIndex = findIndex(this.songList, this.currentSong);
      //   this.updateLyric();
        if(this.show){
          this.scrollToCurrent();
        }
      }
    }
    if(changes['show']){
      if(!changes['show'].firstChange && this.show){
        this.wyScroll.first.refreshScroll();
        // this.wyScroll.last.refreshScroll();
        timer(80).subscribe(() =>{
          if(this.currentSong){
            this.scrollToCurrent(0);
          }
        });
      }
    }

    
  }

  private scrollToCurrent(speed = 300){
    const songListRefs = this.wyScroll.first.el.nativeElement.querySelectorAll('ul li'); //all li tags under this scroll element; el was definded in wy-scroll constructor
    if(songListRefs.length){
      const currentLi = <HTMLElement>songListRefs[this.currentIndex || 0];
      const offsetTop = currentLi.offsetTop;
      const offsetHeight = currentLi.offsetHeight;
      // console.log('SY: ', this.scrollY);
      // console.log('offset: ', offsetTop);
      if(((offsetTop - Math.abs(this.scrollY)) > offsetHeight * 5) || offsetTop < Math.abs(this.scrollY)){
        this.wyScroll.first.scrollToElement(currentLi, speed, false, false );
      }
    }
    
  }

}
