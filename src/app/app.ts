import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ColorBendsComponent } from './color-bends/color-bends.component';
import { HeaderComponent } from './header/header.component';
import { CurvedScrollbarComponent} from "./curved-scrollbar/curved-scrollbar.component";
import { ModeService } from './Service/mode.service';
import { Subscription } from 'rxjs';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterOutlet,
        ColorBendsComponent,
        HeaderComponent,
        CurvedScrollbarComponent,
        NgStyle
    ],
    styleUrl: './app.css',
    templateUrl: './app.html'
})
export class AppComponent implements OnInit, OnDestroy {
    backgroundColor: string = '#FFFAF0';
    private darkModeSubscription!: Subscription;
    colorBendColors: string[] = ['#710013', '#00155a', '#003AFFFF'];

    constructor(private modeService: ModeService) { }

    ngOnInit() {
        this.darkModeSubscription = this.modeService.darkMode.subscribe(isDark => {
            this.backgroundColor = isDark ? 'black' : '#FFFAF0';
            this.colorBendColors = isDark?
                ['#ff0000', '#ffa500', '#ffff00',
                    '#00ff00', '#0000ff', '#ff00ff']:
                ['#00ff00', '#0000ff', '#ff00ff'];
        });
    }

    ngOnDestroy() {
        this.darkModeSubscription.unsubscribe();
    }
}