import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SongSheet } from 'src/app/services/data-types/common.types';

@Component({
  selector: 'app-single-sheet',
  templateUrl: './single-sheet.component.html',
  styleUrls: ['./single-sheet.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SingleSheetComponent implements OnInit {

  @Input() sheet:SongSheet;
  @Output() onPlay = new EventEmitter<number>();
  constructor() { }

  ngOnInit(): void {
  }

  playSheet(id: number){
    this.onPlay.emit(id);
  }

  get coverImg(): string{
    return this.sheet.picUrl || this.sheet.coverImgUrl;
  }

}
