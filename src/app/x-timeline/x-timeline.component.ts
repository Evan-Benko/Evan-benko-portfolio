import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import {NgIf} from '@angular/common';

declare global {
  interface Window {
    twttr: any;
  }
}

@Component({
  selector: 'app-x-timeline',
  templateUrl: './x-timeline.component.html',
  imports: [
    NgIf
  ],
  styleUrls: ['./x-timeline.component.css']
})
export class XTimelineComponent implements OnInit, AfterViewInit {
  @Input() username: string = 'thee_evy';
  @Input() tweetId: string = '1975905367931695386'; // You'll need to manually update this with your latest tweet ID

  embedUrl: string = '';
  isLoading: boolean = true;

  ngOnInit() {
    if (this.tweetId) {
      this.embedUrl = `https://platform.twitter.com/embed/Tweet.html?id=${this.tweetId}`;
    }
  }

  ngAfterViewInit() {
    // Load Twitter widget script
    if (!window.twttr) {
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.onload = () => {
        this.loadWidget();
      };
      document.body.appendChild(script);
    } else {
      this.loadWidget();
    }
  }

  loadWidget() {
    if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load();
      this.isLoading = false;
    }
  }
}
