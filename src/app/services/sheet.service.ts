import { HttpClient, HttpParams } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map, pluck, switchMap } from "rxjs/internal/operators";
import { sheetList, Song, SongSheet } from "./data-types/common.types";
import { API_CONFIG, ServicesModule } from "./services.module";
import { SongService } from "./song.service";
import * as queryString from 'query-string';

export type sheetParams = {
  offset: number;
  limit: number;
  order: 'new' | 'hot';
  cat: string;
}

@Injectable({
  providedIn: ServicesModule
})
export class SheetService {

  constructor(
    private http: HttpClient, 
    @Inject(API_CONFIG) private uri: string,
    private songServe: SongService
    ) { }

  //get sheet list by catogory
  getSheets(args: sheetParams): Observable<sheetList>{
    const params = new HttpParams({ fromString: queryString.stringify(args) });
    return this.http.get(this.uri + 'top/playlist', {params})
    .pipe(map(res => res as sheetList));
  }
  
  getSongSheetDetail(id:number): Observable<SongSheet> {
    const params = new HttpParams().set('id', id.toString());
    return this.http.get(this.uri + 'playlist/detail', {params})
    .pipe(map((res: { playlist: SongSheet }) => res.playlist));
  }

  playSheet(id: number): Observable<Song[]>{
    return this.getSongSheetDetail(id).
    pipe(pluck('tracks'), switchMap(tracks => this.songServe.getSongList(tracks)))
  }

}