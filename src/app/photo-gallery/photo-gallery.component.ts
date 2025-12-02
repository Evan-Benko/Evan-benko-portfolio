import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThreejsCardComponent } from '../threejs-card/threejs-card.component';
@Component({
    selector: 'app-photo-gallery',
    standalone: true,
    imports: [CommonModule, ThreejsCardComponent],
    templateUrl: 'photo-gallery.component.html',
    styleUrl: 'photo-gallery.component.css',

})
export class PhotoGalleryComponent {
    @Input() mode: string = 'light';

    cardData = [
        {
            imagePath: 'assets/87F32AF2-6447-47D2-B093-ADCA4490D7B8.JPG',
            title: 'On The Beach',
            width: 200,
            height: 300
        },
        {
            imagePath: 'assets/2016890D-3DEF-403D-A48D-8844362AC3AA.png',
            title: 'On The Water',
            width: 200,
            height: 300
        },
        {
            imagePath: 'assets/3C42F24B-18F4-4B28-AD0F-8FBB197F422F.jpeg',
            title: 'On a Date',
            width: 200,
            height: 300
        },
        {
            imagePath: 'assets/B0D0D657-70E2-4D16-B91F-F9DE4B55A113.jpeg',
            title: 'Winning Big',
            width: 200,
            height: 300
        },
        {
            imagePath: 'assets/77551474369__506210E6-C867-403E-9D56-1E5AE3CE541F.jpg',
            title: 'Foraging Mushrooms',
            width: 200,
            height: 300
        },
    ];
}
