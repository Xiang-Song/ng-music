import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { NzModalComponent, NzModalService } from 'ng-zorro-antd/modal';
import { fromEvent, Subscription } from 'rxjs';
import { Song } from 'src/app/services/data-types/common.types';
import { AppStoreModule } from 'src/app/store';
import { SetCurrentIndex, SetPlayList, SetPlayMode, SetSongList } from 'src/app/store/actions/player.action';
import { BatchActionsService } from 'src/app/store/batch-actions.service';
import { getCurrentIndex, getCurrentSong, getPlayer, getPlayList, getPlayMode, getSongList } from 'src/app/store/selectors/player.selector';
import { findIndex, shuffle } from 'src/app/utils/array';
import { PlayMode } from './player-type';
import { WyPlayerPanelComponent } from './wy-player-panel/wy-player-panel.component';


const modeTypes: PlayMode[] = [{
  type: 'loop',
  label: '循环'
}, {
  type: 'random',
  label: '随机'
}, {
  type: 'singleLoop',
  label: '单曲循环'
}];


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

  private winClick: Subscription;

  @ViewChild('audio', { static: true}) private audio: ElementRef;
  @ViewChild(WyPlayerPanelComponent, { static: false}) private playerPanel: WyPlayerPanelComponent;
  private audioEl: HTMLAudioElement;

  constructor(
    private store$: Store<AppStoreModule>,
    @Inject(DOCUMENT) private doc: Document,
    private nzModalserve: NzModalService,
    private batchActionsServe: BatchActionsService
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
    this.currentMode = mode;
    if (this.songList) {
      let list = this.songList.slice();
      if (mode.type === 'random') {
        list = shuffle(this.songList);
      }
      this.updateCurrentIndex(list, this.currentSong);
      this.store$.dispatch(SetPlayList({ playList: list }));
    }
  }

  private watchCurrentSong(song: Song) {
    this.currentSong = song;
    this.bufferPercent = 0;
    if (song) {
      this.duration = song.dt / 1000;
    }
  console.log("song: ", song);
  }

  private updateCurrentIndex(list: Song[], song: Song) {
    const newIndex = findIndex(list, song);
    this.store$.dispatch(SetCurrentIndex({ currentIndex: newIndex }));
  }

  // switch play mode
  changeMode(){
    this.store$.dispatch(SetPlayMode({ playMode: modeTypes[++this.modeCount % 3] }));
  }

  // slider control song
  onPercentChange(per: number){
    if (this.currentSong) {
      const currentTime =  this.duration * (per / 100);
      this.audioEl.currentTime = currentTime;
      if(this.playerPanel){
        this.playerPanel.seekLyric(currentTime * 1000);
      }
    }
  }

  // volume control
  onVolumeChange(per: number){
    this.audioEl.volume = per / 100;
  }

  // control volume panel display
  toggleVolPanel() {
    this.togglePanel('showVolumePanel');
  }

   // control list and lyric panel display
   toggleListPanel() {
     if(this.songList.length){
      this.togglePanel('showPanel');
     }
    
  }

  togglePanel(type: string){
    this[type]= !this[type];
    if(this.showVolumePanel || this.showPanel){
      this.bindDocumentClickListener();
    } else {
      this.unbindDocumentClickListener();
    }
  }

  private bindDocumentClickListener(){
    if(!this.winClick){
      this.winClick = fromEvent(this.doc, 'click').subscribe(()=>{
        if(!this.selfClick) { //click outside of panel
          this.showVolumePanel = false;
          this.showPanel = false;
          this.unbindDocumentClickListener();
        }
        this.selfClick = false;
      })
    }
  }

  private unbindDocumentClickListener(){
    if(this.winClick){
      this.winClick.unsubscribe();
      this.winClick = null;
    }
  }

  // play/pause
  onToggle(){
    if (!this.currentSong) {
      if (this.playList.length) {
        this.updateIndex(0);
      }
    } else {
      if(this.songReady){
        this.playing = !this.playing;
        if(this.playing){
          this.audioEl.play();
        }else {
          this.audioEl.pause();
        }
      }
    }
  }

  //previous
  onPrev(index: number){
    if(!this.songReady) return;
    if(this.playList.length === 1){
      this.loop();
    } else {
      const newIndex = index < 0  ? this.playList.length - 1 : index;
      this.updateIndex(newIndex);
    }
    
  }

  // next one
  onNext(index: number){
    if(!this.songReady) return;
    if(this.playList.length === 1){
      this.loop();
    } else {
      const newIndex = index >= this.playList.length ? 0 : index;
      this.updateIndex(newIndex);
    }
  }

  // start over when finished the list
  onEnded() {
    this.playing = false;
    if (this.currentMode.type === 'singleLoop') {
      this.loop();
    } else {
      this.onNext(this.currentIndex + 1);
    }
  }

   // single song loop
  private loop(){
    this.audioEl.currentTime = 0;
    this.play();
    if(this.playerPanel){
      this.playerPanel.seekLyric(0);
    }
  }

  private updateIndex(index: number){
    this.store$.dispatch(SetCurrentIndex({ currentIndex: index}));
    this.songReady = false;
  }

  onCanPlay(){
    this.songReady = true;
    this.play();
  }

  private play(){
    this.audioEl.play();
    this.playing = true;
  }

  onTimeUpdate(e: Event) {
    this.currentTime = (<HTMLAudioElement>e.target).currentTime;
    this.percent = (this.currentTime / this.duration) * 100; // song control slider
    const buffered = this.audioEl.buffered;
    if (buffered.length && this.bufferPercent < 100) {
      this.bufferPercent = (buffered.end(0) / this.duration) * 100;
    }
  }

  get picUrl(): string {
    return this.currentSong ? this.currentSong.al.picUrl : '//s4.music.126.net/style/web2/img/default/default_album.jpg';
  }

  // change song in list panel
  onChangeSong(song: Song){
    this.updateCurrentIndex(this.playList, song);
  }

  // delete song from list panel
  onDeleteSong(song: Song){
    this.batchActionsServe.deleteSong(song);
  }

  //clear whole list from panel
  onClearSong(){
    this.nzModalserve.confirm({
      nzTitle: 'confirm delete the whole list?',
      nzOnOk: () => {
        this.batchActionsServe.clearSong();
      }
    })
  }
  

}
