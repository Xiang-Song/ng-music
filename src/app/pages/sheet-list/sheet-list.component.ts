import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { sheetList } from 'src/app/services/data-types/common.types';
import { sheetParams, SheetService } from 'src/app/services/sheet.service';
import { BatchActionsService } from 'src/app/store/batch-actions.service';

@Component({
  selector: 'app-sheet-list',
  templateUrl: './sheet-list.component.html',
  styleUrls: ['./sheet-list.component.less']
})
export class SheetListComponent implements OnInit {
  listParams: sheetParams = {
    cat: '全部',
    order: 'hot',
    offset: 1,
    limit:35
  }
  sheets: sheetList;
  orderValue = 'hot';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sheetServe: SheetService,
    private batchActionsServe: BatchActionsService
  ) {
    this.listParams.cat = this.route.snapshot.queryParamMap.get('cat') || '全部';
    this.getList();
   }

  ngOnInit(): void {
  }


  onOrderChange(order: 'new' | 'hot'){
    this.listParams.order = order;
    this.listParams.offset = 1;
    this.getList();
  }

  onPageChange(page: number){
    this.listParams.offset = page;
    this.getList();
  }

  private getList(){
    this.sheetServe.getSheets(this.listParams).subscribe( sheets => {
      this.sheets = sheets;
      // console.log("~ this.sheets", this.sheets);
    });
  }

  onPlaySheet(id: number) {
    this.sheetServe.playSheet(id).subscribe(list => {
      this.batchActionsServe.selectPlayList({ list, index: 0});
    });
  }

  toInfo(id: number){
    this.router.navigate(['/sheetInfo', id]);
  }

}
