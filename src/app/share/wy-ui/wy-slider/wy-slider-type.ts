import { Observable } from "rxjs";

export interface WySliderStyle {
    width?: string | null;
    height?: string | null;
    bottom?: string | null;
    left?: string | null;
}

export interface SliderEventObserverConfig {
    start: string;
    move: string;
    end: string;
    filterFunc: (e: Event) => boolean;
    pluckKey: string[];
    startPlucked$?: Observable<number>;
    moveResolved$?: Observable<number>;
    end$?: Observable<Event>;
}

export type SliderValue = number | null;