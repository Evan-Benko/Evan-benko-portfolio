// mode.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModeService {
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  public darkMode: Observable<boolean> = this.darkModeSubject.asObservable();

  constructor() {}

  getDarkMode(): boolean {
    return this.darkModeSubject.value;
  }

  toggle() {
    const newValue = !this.darkModeSubject.value;
    this.darkModeSubject.next(newValue);
    console.log('Dark Mode is', newValue ? 'enabled' : 'disabled');
  }
}
