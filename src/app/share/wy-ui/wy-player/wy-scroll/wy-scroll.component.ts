import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import BScroll from '@better-scroll/core';
import ScrollBar from '@better-scroll/scroll-bar';
import MouseWheel from '@better-scroll/mouse-wheel';

BScroll.use(ScrollBar);
BScroll.use(MouseWheel);

@Component({
  selector: 'app-wy-scroll',
  template: `
  <div class="wy-scroll" #wrap>
    <ng-content></ng-content>
  </div>
`,
  styles: [`.wy-scroll{width: 100%; height: 100%; overflow: hidden;}`],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WyScrollComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() refreshDelay = 50;
  @Input() songData: any[];

  private bs: BScroll;

  @ViewChild('wrap', { static: true }) private wrapRef!: ElementRef;
  constructor() { }
  
  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.bs = new BScroll(this.wrapRef.nativeElement,{
      scrollbar:{
        interactive: true
      },
      mouseWheel:{}
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['songData']){
      this.refreshScroll();
    }
  }

  private refresh(){
    this.bs.refresh();
  }

  refreshScroll(){
    setTimeout(() =>{
      this.refresh();
    }, this.refreshDelay);
  }

}
