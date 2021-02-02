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
  private lyricRefs: NodeList;
  
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
      } else {
        this.resetLyric();
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
    this.resetLyric();
    this.songServe.getLyric(this.currentSong.id).subscribe(res => {
      this.lyric = new WyLyric(res);
      this.currentLyric = this.lyric.lines;
      const startLine = res.tlyric ? 1 : 3;
      this.handleLyric(startLine);
      this.wyScroll.last.scrollTo(0, 0);


      if (this.playing) {
        this.lyric.play();
      }
    });
  }

  private handleLyric(startLine){
    this.lyric.handler.subscribe(({lineNum}) =>{
      if (!this.lyricRefs){
        this.lyricRefs = this.wyScroll.last.el.nativeElement.querySelectorAll('ul li');
        console.log("lyricRefs", this.lyricRefs);
      }

      if (this.lyricRefs.length){
        this.currentLineNum = lineNum;
        if (lineNum > startLine){
          const targetLine = this.lyricRefs[lineNum - startLine];
        if (targetLine){
          this.wyScroll.last.scrollToElement(targetLine, 300, false, false);
        }
        } else {
          this.wyScroll.last.scrollTo(0, 0);
        }
        
      }
          
    })
  }

  private resetLyric(){
    if(this.lyric){
      this.lyric.stop();
      this.lyric = null;
      this.currentLyric = [];
      this.currentLineNum = 0;
      this.lyricRefs = null;
    }
  }

  seekLyric(time: number) {
    if (this.lyric) {
      this.lyric.seek(time);
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
