import {Component, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ModeService} from '../Service/mode.service';

@Component({
  selector: 'app-philosophy',
  templateUrl: './philosophy.component.html',
  styleUrl: './philosophy.component.css',
  standalone: true
})
export class PhilosophyComponent implements OnInit {
  mode: string = 'light';
  private darkModeSubscription!: Subscription;

  /** click-state for the "change" word */
  changeClicked = false;

  constructor(private modeService: ModeService) {}

  ngOnInit(): void {
    this.darkModeSubscription = this.modeService.darkMode.subscribe(isDark => {
      this.mode = isDark ? 'dark' : 'light';
    });
  }

  ngOnDestroy(): void {
    this.darkModeSubscription?.unsubscribe();
  }

  /** toggle the clicked colour */
  onChangeClick() {
    this.changeClicked = !this.changeClicked;
  }
}
