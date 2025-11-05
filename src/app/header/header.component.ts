import {Component, OnInit} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ModeService } from '../Service/mode.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  modeIcon = 'fa fa-moon-o';   // start in light mode
  mode: string = "light";
  protected segmentMode: string = "segmentedLight";
  private darkModeSubscription!: Subscription;

  constructor(public router: Router, private modeService: ModeService) {}

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  changeMode(): void {
    this.modeService.toggle();
  }
  ngOnInit() {
    this.darkModeSubscription = this.modeService.darkMode.subscribe(isDark => {
      this.modeIcon = !isDark ? 'fa fa-moon-o' : 'fa fa-sun-o';
      this.mode = !isDark? 'light' : 'dark';
      this.segmentMode = !isDark ? 'segmentedLight' : 'segmentedDark';
    });
  }
}
