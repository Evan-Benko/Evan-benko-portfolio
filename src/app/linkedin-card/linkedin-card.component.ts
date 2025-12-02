// linkedin-card.component.ts
import { Component, Input, OnInit } from '@angular/core';
import {NgIf} from '@angular/common';

@Component({
    selector: 'app-linkedin-card',
    templateUrl: './linkedin-card.component.html',
    imports: [
        NgIf
    ],
    standalone: true,
    styleUrls: ['./linkedin-card.component.css']
})
export class LinkedInCardComponent implements OnInit {
  @Input() profileUrl: string = '';
  @Input() name: string = 'Evan Benko';
  @Input() headline: string = '';
  @Input() imageUrl: string = 'assets/0CDBA0A7-FE1D-4C88-B053-9D4F7ACDBD71_1_105_c.jpeg';
  @Input() location: string = '';

  ngOnInit() {
    // Extract username from URL if needed
    if (this.profileUrl && !this.imageUrl) {
      // You can manually set profile data here
    }
  }

  openProfile() {
    window.open(this.profileUrl, '_blank');
  }
}
