import {Component, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ModeService} from '../Service/mode.service';

@Component({
  selector: 'app-resume',
  imports: [],
  templateUrl: './resume.component.html',
  styleUrl: './resume.component.css',
})
export class ResumeComponent implements OnInit {
  mode: string = "light";
  private darkModeSubscription!: Subscription;

  constructor(private modeService: ModeService) { }

  ngOnInit() {
    this.darkModeSubscription = this.modeService.darkMode.subscribe(isDark => {
      this.mode = !isDark? 'light' : 'dark';
    });
  }
}
