import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { AppStoreModule } from '.';
import { Song } from '../services/data-types/common.types';
import { findIndex, shuffle } from '../utils/array';
import { SetCurrentIndex, SetPlayList, SetSongList } from './actions/player.action';
import { PlayState } from './reducers/player.reducer';
import { getPlayer } from './selectors/player.selector';

@Injectable({
  providedIn: AppStoreModule
})
export class BatchActionsService {
  private playerState: PlayState

  constructor(private store$: Store<AppStoreModule>) {
    this.store$.pipe(select(getPlayer)).subscribe(res => this.playerState = res);
   }


  // play list
  selectPlayList({list, index}: {list: Song[], index: number}){
    this.store$.dispatch(SetSongList({ songList: list}));
      let trueIndex = index;
      let trueList = list.slice();
      if (this.playerState?.playMode.type === 'random'){
        trueList = shuffle(list || []);
        trueIndex = findIndex(trueList, list[trueIndex])
      } 
      this.store$.dispatch(SetPlayList({ playList: trueList}));
      this.store$.dispatch(SetCurrentIndex({ currentIndex: trueIndex}));
  }

  // add song to songList / playlist
  insertSong(song: Song, isPlay: boolean) {
    const songList = this.playerState.songList.slice();
    let playList = this.playerState.playList.slice();
    let insertIndex = this.playerState.currentIndex;
    const pIndex = findIndex(playList, song);
    if (pIndex > -1) {
      // song exist
      if (isPlay) {
        insertIndex = pIndex;
      }
    } else {
      songList.push(song);
      playList.push(song);
      if (isPlay) {
        insertIndex = songList.length - 1;
      }

      // if (this.playerState.playMode.type === 'random') {
      //   playList = shuffle(songList);
      // } else {
      //   playList.push(song);
      // }

      this.store$.dispatch(SetSongList({ songList }));
      this.store$.dispatch(SetPlayList({ playList }));
    }

    if (insertIndex !== this.playerState.currentIndex) {
      this.store$.dispatch(SetCurrentIndex({ currentIndex: insertIndex }));
      // this.store$.dispatch(SetCurrentAction({ currentAction: CurrentActions.Play }));
    } //else {
    //   this.store$.dispatch(SetCurrentAction({ currentAction: CurrentActions.Add }));
    // }
  }

  // add multiple songs to songlist / playlist
  insertSongs(songs: Song[]) {
    const songList = this.playerState.songList.slice();
    const playList = this.playerState.playList.slice();
    songs.forEach(item => {
      const pIndex = findIndex(playList, item);
      if (pIndex === -1) {
        songList.push(item);
        playList.push(item);
      }
    });
    this.store$.dispatch(SetSongList({ songList }));
    this.store$.dispatch(SetPlayList({ playList }));
  }

  // delete song from list panel
  deleteSong(song: Song){
    const songList = this.playerState.songList.slice();
    const playList = this.playerState.playList.slice();
    let currentIndex = this.playerState.currentIndex;
    const sIndex = findIndex(songList, song);
    songList.splice(sIndex, 1);
    const pIndex = findIndex(playList, song);
    playList.splice(pIndex, 1);

    if(currentIndex > pIndex || currentIndex === playList.length){
      currentIndex--;
    }

    this.store$.dispatch(SetSongList({ songList }));
    this.store$.dispatch(SetPlayList({ playList }));
    this.store$.dispatch(SetCurrentIndex({ currentIndex }));
  }

  //clear whole list from panel
  clearSong(){
    this.store$.dispatch(SetSongList({ songList: [] }));
    this.store$.dispatch(SetPlayList({ playList: [] }));
    this.store$.dispatch(SetCurrentIndex({ currentIndex: -1 }));
  }
}
