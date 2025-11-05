import {Component, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ModeService} from '../Service/mode.service';

@Component({
  selector: 'app-philosophy',
  imports: [],
  templateUrl: './philosophy.component.html',
  styleUrl: './philosophy.component.css',
})
export class PhilosophyComponent implements OnInit {
  mode: string = "light";
  private darkModeSubscription!: Subscription;

  constructor(private modeService: ModeService) { }

  ngOnInit() {
    this.darkModeSubscription = this.modeService.darkMode.subscribe(isDark => {
      this.mode = !isDark? 'light' : 'dark';
    });
  }
}
