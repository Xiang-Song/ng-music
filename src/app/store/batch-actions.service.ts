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
