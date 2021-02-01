import { Component, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { timer } from 'rxjs';
import { Song } from 'src/app/services/data-types/common.types';
import { SongService } from 'src/app/services/song.service';
import { findIndex } from 'src/app/utils/array';
import { WyScrollComponent } from '../wy-scroll/wy-scroll.component';
import { BaseLyricLine, WyLyric } from './wy-lyric';

@Component({
  selector: 'app-wy-player-panel',
  templateUrl: './wy-player-panel.component.html',
  styleUrls: ['./wy-player-panel.component.less']
})
export class WyPlayerPanelComponent implements OnInit, OnChanges {
  @Input() playing: boolean;
  @Input() songList: Song[];
  @Input() currentSong: Song;
  @Input() show: boolean;


  @Output() onClose = new EventEmitter<void>();
  @Output() onChangeSong = new EventEmitter<Song>();

  scrollY = 0;

  currentIndex: number;
  currentLyric: BaseLyricLine[];
  currentLineNum: number;

  private lyric: WyLyric;
  
  @ViewChildren(WyScrollComponent) private wyScroll: QueryList<WyScrollComponent>;
  constructor(private songServe: SongService) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['playing']){
      if(!changes['playing'].firstChange){
        this.lyric && this.lyric.togglePlay(this.playing);
      }
    }

    if(changes['songList']){
      // console.log('ppsongList: ', this.songList);
      this.currentIndex = 0;
    }
    if(changes['currentSong']){
      console.log('currentSong: ', this.currentSong);
      if(this.currentSong){
        this.currentIndex = findIndex(this.songList, this.currentSong);
        this.updateLyric();
        if(this.show){
          this.scrollToCurrent();
        }
      }
    }
    if(changes['show']){
      if(!changes['show'].firstChange && this.show){
        this.wyScroll.first.refreshScroll();
        this.wyScroll.last.refreshScroll();
        timer(80).subscribe(() =>{
          if(this.currentSong){
            this.scrollToCurrent(0);
          }
        });
      }
    }

  }

  private updateLyric() {
    // this.resetLyric();
    this.songServe.getLyric(this.currentSong.id).subscribe(res => {
      this.lyric = new WyLyric(res);
      this.currentLyric = this.lyric.lines;
      // this.startLine = res.tlyric ? 1 : 3;
      this.handleLyric();
      this.wyScroll.last.scrollTo(0, 0);


      if (this.playing) {
        this.lyric.play();
      }
    });
  }

  private handleLyric(){
    this.lyric.handler.subscribe(({lineNum}) =>{
    console.log("🚀 ~ file: wy-player-panel.component.ts ~ line 90 ~ WyPlayerPanelComponent ~ this.lyric.handler.subscribe ~ lineNum", lineNum)
    this.currentLineNum = lineNum;
    })
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
