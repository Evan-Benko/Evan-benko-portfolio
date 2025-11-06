import {Component, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ModeService} from '../Service/mode.service';
import {InstagramEmbedComponent} from "../instagram-embed/instagram-embed.component"
import {XTimelineComponent} from "../x-timeline/x-timeline.component"
import {LinkedInCardComponent} from "../linkedin-card/linkedin-card.component"
@Component({
  selector: 'app-contact',
  imports: [InstagramEmbedComponent, XTimelineComponent, LinkedInCardComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent implements OnInit {
  mode: string = "light";
  private darkModeSubscription!: Subscription;
  constructor(private modeService: ModeService,) { }

  ngOnInit() {
    this.darkModeSubscription = this.modeService.darkMode.subscribe(isDark => {
      this.mode = !isDark? 'light' : 'dark';
    });
  }
}
