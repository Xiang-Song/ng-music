import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Song } from 'src/app/services/data-types/common.types';
import { AppStoreModule } from 'src/app/store';
import { SetPlayList } from 'src/app/store/actions/player.action';
import { getCurrentIndex, getCurrentSong, getPlayer, getPlayList, getPlayMode, getSongList } from 'src/app/store/selectors/player.selector';
import { PlayMode } from './player-type';

@Component({
  selector: 'app-wy-player',
  templateUrl: './wy-player.component.html',
  styleUrls: ['./wy-player.component.less']
})
export class WyPlayerComponent implements OnInit {

  percent = 0;
  bufferPercent = 0;
  songList: Song[];
  playList: Song[];
  currentIndex: number;
  currentSong: Song;
  currentMode: PlayMode;
  modeCount = 0;

  duration: number;
  currentTime: number;

  // play status
  playing = false;

  // ready to play?
  songReady = false;

  // volume percent
  volume = 60;

  // show volume panel or not
  showVolumePanel = false;

  // show list panel or not
  showPanel = false;

  // whether the click within the panel
  selfClick = false;


  @ViewChild('audio', { static: true}) private audio: ElementRef;
  private audioEl: HTMLAudioElement;

  constructor(
    private store$: Store<AppStoreModule>,
    @Inject(DOCUMENT) private doc: Document
    ) {
      const appStore$ = this.store$.pipe(select(getPlayer));
      appStore$.pipe(select(getSongList)).subscribe(list => this.watchList(list, 'songList'));
      appStore$.pipe(select(getPlayList)).subscribe(list => this.watchList(list, 'playList'));
      appStore$.pipe(select(getCurrentIndex)).subscribe(index => this.watchCurrentIndex(index));
      appStore$.pipe(select(getPlayMode)).subscribe(mode => this.watchPlayMode(mode));
      appStore$.pipe(select(getCurrentSong)).subscribe(song => this.watchCurrentSong(song));
     }

  ngOnInit(): void {
    this.audioEl = this.audio.nativeElement;
  }

  private watchList(list: Song[], type: string) {
    this[type] = list;
  }

  private watchCurrentIndex(index: number) {
    this.currentIndex = index;
  }

  private watchPlayMode(mode: PlayMode) {
    // this.currentMode = mode;
    // if (this.songList) {
    //   let list = this.songList.slice();
    //   if (mode.type === 'random') {
    //     list = shuffle(this.songList);
    //   }
    //   this.updateCurrentIndex(list, this.currentSong);
    //   this.store$.dispatch(SetPlayList({ playList: list }));
    // }
  }

  private watchCurrentSong(song: Song) {
    this.currentSong = song;
  //   this.bufferPercent = 0;
    if (song) {
      this.duration = song.dt / 1000;
    }
  console.log("song: ", song);
  }

  onCanPlay(){
    this.songReady = true;
    this.play();
  }

  private play(){
    this.audioEl.play();
    this.playing = true;
  }

}
