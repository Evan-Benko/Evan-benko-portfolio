import {Component, OnInit} from '@angular/core';
import {ModeService} from '../Service/mode.service';
import {Subscription} from 'rxjs';
import {PhotoGalleryComponent} from "../photo-gallery/photo-gallery.component";

@Component({
  selector: 'app-home',
    imports: [
        PhotoGalleryComponent,
    ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true
})
export class HomeComponent implements OnInit {
  mode: string = "light";
  private darkModeSubscription!: Subscription;

  constructor(private modeService: ModeService) { }

  ngOnInit() {
    this.darkModeSubscription = this.modeService.darkMode.subscribe(isDark => {
      this.mode = !isDark? 'light' : 'dark';
    });
  }
}
