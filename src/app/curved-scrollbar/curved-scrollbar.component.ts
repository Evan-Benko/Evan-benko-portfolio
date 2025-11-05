import {Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {ModeService} from "../Service/mode.service";

@Component({
    selector: 'app-curved-scrollbar',
    standalone: true,
    templateUrl: './curved-scrollbar.component.html',
    styleUrl: './curved-scrollbar.component.css'
})
export class CurvedScrollbarComponent implements AfterViewInit, OnDestroy, OnInit {
    @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef<HTMLDivElement>;
    @ViewChild('thumbPath', { static: false }) thumbPath!: ElementRef<SVGPathElement>;
    @ViewChild('trackPath', { static: false }) trackPath!: ElementRef<SVGPathElement>;
    mode: string = "light";
    private darkModeSubscription!: Subscription;

    constructor(private modeService: ModeService) { }

    ngOnInit() {
        this.darkModeSubscription = this.modeService.darkMode.subscribe(isDark => {
            this.mode = !isDark? 'light' : 'dark';
        });
    }
    private config = {
        radius: 33,
        stroke: 0,
        inset: 0,
        trail: 70,
        thumb: 50,
        scrollPadding: 0
    };

    private resizeObserver?: ResizeObserver;
    private scrollListener?: () => void;

    ngAfterViewInit() {
        this.syncBar();
        this.setupScrollListener();
        this.setupResizeObserver();
    }

    ngOnDestroy() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        if (this.scrollListener) {
            this.scrollContainer.nativeElement.removeEventListener('scroll', this.scrollListener);
        }
    }

    @HostListener('window:resize')
    onResize() {
        this.syncBar();
    }

    private syncBar() {
        if (!this.scrollContainer || !this.thumbPath || !this.trackPath) return;

        const container = this.scrollContainer.nativeElement;
        const thumb = this.thumbPath.nativeElement;
        const track = this.trackPath.nativeElement;

        const mid = this.config.radius;
        const innerRad = Math.max(0, this.config.radius - (this.config.inset + this.config.stroke * 0.5));
        const padTop = this.config.inset + this.config.stroke * 0.5;
        const padLeft = this.config.radius * 2 - padTop;

        const svg = thumb.ownerSVGElement;
        if (svg) {
            svg.setAttribute('viewBox', `0 0 ${this.config.radius * 2} ${container.offsetHeight}`);
        }

        // Create the path
        let d = `
      M${mid - this.config.trail},${padTop}
      ${innerRad === 0 ? '' : `L${mid},${padTop}`}
      ${innerRad === 0 ? `L${padLeft},${padTop}` : `a${innerRad},${innerRad} 0 0 1 ${innerRad} ${innerRad}`}
      L${padLeft},${container.offsetHeight - (this.config.inset + this.config.stroke * 0.5 + innerRad)}
      ${innerRad === 0 ? `L${padLeft},${container.offsetHeight - (this.config.inset + this.config.stroke * 0.5)}`
            : `a${innerRad},${innerRad} 0 0 1 ${-innerRad} ${innerRad}`}
      L${mid - this.config.trail},${container.offsetHeight - (this.config.inset + this.config.stroke * 0.5)}
    `;

        thumb.setAttribute('d', d);
        track.setAttribute('d', d);

        const trackLength = track.getTotalLength();
        track.style.strokeDasharray = `${trackLength} ${trackLength}`;
        track.style.strokeDashoffset = '0';
    }

    private setupScrollListener() {
        const container = this.scrollContainer.nativeElement;
        const thumb = this.thumbPath.nativeElement;
        const track = this.trackPath.nativeElement;

        this.scrollListener = () => {
            const scrollPercentage = container.scrollTop / (container.scrollHeight - container.clientHeight);
            const trackLength = track.getTotalLength();
            const offset = scrollPercentage * (trackLength - this.config.thumb);

            thumb.style.strokeDashoffset = `-${offset}`;
        };

        container.addEventListener('scroll', this.scrollListener);
    }

    private setupResizeObserver() {
        this.resizeObserver = new ResizeObserver(() => {
            this.syncBar();
        });
        this.resizeObserver.observe(this.scrollContainer.nativeElement);
    }
}