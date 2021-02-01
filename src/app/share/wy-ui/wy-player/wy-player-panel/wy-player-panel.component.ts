import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Song } from 'src/app/services/data-types/common.types';

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
  
  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['songList']){
      // console.log('ppsongList: ', this.songList);
      // this.currentIndex = 0;
    }
    if(changes['currentSong']){
      // if(this.currentSong){
      //   this.currentIndex = findIndex(this.songList, this.currentSong);
      //   this.updateLyric();
      //   if(this.show){
      //     this.scrollToCurrent();
        // }
      }
  }

}
