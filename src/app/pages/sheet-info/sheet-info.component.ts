import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/internal/operators';
import { Song, SongSheet } from 'src/app/services/data-types/common.types';
import { SongService } from 'src/app/services/song.service';
import { AppStoreModule } from 'src/app/store';
import { BatchActionsService } from 'src/app/store/batch-actions.service';
import { getCurrentSong, getPlayer } from 'src/app/store/selectors/player.selector';
import { findIndex } from 'src/app/utils/array';

@Component({
  selector: 'app-sheet-info',
  templateUrl: './sheet-info.component.html',
  styleUrls: ['./sheet-info.component.less']
})
export class SheetInfoComponent implements OnInit, OnDestroy {
  sheetInfo: SongSheet;

  description = {
    short: '',
    long: ''
  };

  controlDesc = {
    isExpand: false,
    label: '展开',
    iconCls: 'down'
  };

  currentSong: Song;
  currentIndex = -1;
  private appStore$: Observable<AppStoreModule>;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private store$: Store<AppStoreModule>,
    private songServe: SongService,
    private batchActionServe: BatchActionsService,
    private nzMessageServe: NzMessageService
    ) {
    this.route.data.pipe(map(res => res.sheetInfo)).subscribe(res => {
    this.sheetInfo = res;
    if(res.description) {
      this.changeDesc(res.description);
    }
    })
    this.listenCurrent();
   }

  ngOnInit(): void {
  }

  private listenCurrent(){
    this.store$
    .pipe(select(getPlayer), select(getCurrentSong), takeUntil(this.destroy$))
    .subscribe(song => {
      this.currentSong = song;
      if (song) {
        this.currentIndex = findIndex(this.sheetInfo.tracks, song);
      } else {
        this.currentIndex = -1;
      }
    });
  }

  private changeDesc(desc: string) {
    if (desc.length < 99) {
      this.description = {
        short: this.replaceBr('<b>介绍：</b>' + desc),
        long: ''
      };
    } else {
      this.description = {
        short: this.replaceBr('<b>介绍：</b>' + desc.slice(0, 99)) + '...',
        long: this.replaceBr('<b>介绍：</b>' + desc)
      };
    }
  }

  private replaceBr(str: string): string {
    return str.replace(/\n/g, '<br />');
  }

  toggleDesc(){
    this.controlDesc.isExpand = !this.controlDesc.isExpand;
    if (this.controlDesc.isExpand){
      this.controlDesc.label = '收起';
      this.controlDesc.iconCls = 'up';
    } else {
      this.controlDesc.label = '展开';
      this.controlDesc.iconCls = 'down';
    }
  }

  //add one song
  onAddSong(song: Song, isPlay = false){
    if (!this.currentSong || this.currentSong.id !== song.id) {
      this.songServe.getSongList(song) //since there is only one song passed in / pass out, list[0] works
      .subscribe(list => {
        if (list.length) {
          this.batchActionServe.insertSong(list[0], isPlay); 
        } else {
          this.nzMessageServe.create('warning', 'url not available!');
        }
      });
    }
  }

  onAddSongs(songs: Song[], isPlay = false) {
    this.songServe.getSongList(songs).subscribe(list => {
      if (list.length) {
        if (isPlay) {
          this.batchActionServe.selectPlayList({ list, index: 0 });
        } else {
          this.batchActionServe.insertSongs(list);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
