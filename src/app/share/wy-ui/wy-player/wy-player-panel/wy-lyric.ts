import { from, Subject, zip } from "rxjs";
import { skip } from "rxjs/internal/operators";
import { Lyric } from "src/app/services/data-types/common.types";

const timeExp = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
// const timeExp = /\[(\d{1,2}):(\d{2})(?:\.(\d{2,3}))?\]/;

export interface BaseLyricLine {
    txt: string; 
    txtCn: string;
}

interface lyricLine extends BaseLyricLine{
    time: number
}

interface Handler extends BaseLyricLine{
    lineNum: number
}

export class WyLyric{
    private lrc: Lyric;
    lines: lyricLine[] = [];

    private playing = false;
    private curNum: number;
    private startStamp: number;
    private pauseStamp: number;
    private timer: any;

    handler = new Subject<Handler>();

    constructor(lrc: Lyric){
        this.lrc = lrc;
        this.init();
    }

    private init(){
        if(this.lrc.tlyric){
            this.generTLyric();
        } else {
            this.generLyric();
        }
    }

    private generLyric(){
        const lines = this.lrc.lyric.split('\n');
        lines.forEach(line => this.makeLine(line));
        console.log('lines: ', this.lines);
    }

    private generTLyric(){
        const lines = this.lrc.lyric.split('\n');
        // console.log("lines", lines)
        const tlines = this.lrc.tlyric.split('\n').filter(item => timeExp.exec(item) !== null);
        // console.log("tlines", tlines)
        const moreLine = lines.length - tlines.length;

        // make sure the longer one locate at first place
        let tempArr = [];
        if (moreLine >= 0){
            tempArr = [lines, tlines];
        } else {
            tempArr = [tlines, lines];
        }

        const first = timeExp.exec(tempArr[1][0])[0]; //first time stamp for tlines
        // console.log("first", first);

        // find index in lines which has the same time with first item in tlines
        const skipIndex = tempArr[0].findIndex(item => {
            const exec = timeExp.exec(item);
            if (exec) {
                return exec[0] === first;
            }
        })

        const _skip = skipIndex === -1 ? 0 : skipIndex;
        const skipItems = tempArr[0].slice(0, _skip);
        if (skipItems.length){
            skipItems.forEach(line => this.makeLine(line));
        }
        // console.log("this.lines", this.lines)

        let zipLines$;
        if (moreLine > 0) {
        zipLines$ = zip(from(lines).pipe(skip(_skip)), from(tlines));
        } else {
        zipLines$ = zip(from(lines), from(tlines).pipe(skip(_skip)));
        }
        zipLines$.subscribe(([line, tline]) => this.makeLine(line, tline));
        
    }

    private makeLine(line: string, tline=''){
        const result = timeExp.exec(line);
        // console.log('result: ', result);
        if(result){
            const txt = line.replace(timeExp, '').trim();
            const txtCn = tline ? tline.replace(timeExp, '').trim() : '';
            if (txt){
                const thirdResult = result[3] || '00';
                const len = thirdResult.length;
                const _thirdResult = len > 2 ? parseInt(thirdResult) :  parseInt(thirdResult) * 10;
                const time = Number(result[1]) * 60000 + Number(result[2]) * 1000 + _thirdResult;
                this.lines.push({ txt, txtCn, time});
            }

        }
    }

    play(startTime = 0){
        if (!this.lines.length) return;
        if (!this.playing){
            this.playing = true;
        }
        this.curNum = this.findCurNum(startTime);//based a initial time, to calculate initial curNum, if it start from beginning, then the startTime is 0, curNum also will be 0, if it restart after a pause, then the startTime is a positive number, so as curNum 
        console.log("curNum", this.curNum);
        this.startStamp = Date.now() - startTime; // if startTime > 0, it set a virtual startStamp in past

        if(this.curNum < this.lines.length){
            clearTimeout(this.timer);
            this.playReset();
        }
    }

    private playReset(){
        let line = this.lines[this.curNum];
        const delay = line.time - (Date.now() - this.startStamp) // calculate time interval based on time of each line of lyric
        this.timer = setTimeout(() =>{
            this.callHandler(this.curNum++); //emit a curNum and add 1
            if(this.curNum < this.lines.length && this.playing){ //if still within the song, reset play()
                this.playReset();
            }
        }, delay)
    }

    private callHandler(i: number){
        this.handler.next({
            txt: this.lines[i].txt,
            txtCn: this.lines[i].txtCn,
            lineNum: i
        });
    }

    // input is time in millisecond, output is the index of one lyric line corresponding to that time
    private findCurNum(time: number): number{
        const index = this.lines.findIndex(item => time <= item.time);
        return index === -1 ? this.lines.length -1 : index;
    }

    togglePlay(playing: boolean){
        const now = Date.now();
        this.playing =playing;
        if(playing){
            const startTime = (this.pauseStamp || now) - (this.startStamp || now);
            this.play(startTime);
        } else {
            this.stop();
            this.pauseStamp = now; //reset pauseStamp
        }
    }

    stop(){
        if(this.playing){
            this.playing = false;
        }
        clearTimeout(this.timer);
    }
}