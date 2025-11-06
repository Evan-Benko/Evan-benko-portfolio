import { Component, Input, AfterViewInit, ElementRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-instagram-embed',
  template: `<div [innerHTML]="embedCode"></div>`,
  standalone: true,
  imports: [],
})
export class InstagramEmbedComponent implements AfterViewInit {
  @Input() postUrl!: string;

  embedCode: SafeHtml = '';

  private scriptLoaded = false;

  constructor(
    private sanitizer: DomSanitizer,
    private el: ElementRef
  ) {}

  ngAfterViewInit(): void {
    const html = `
      <blockquote
        class="instagram-media"
        data-instgrm-permalink="${this.postUrl}"
        data-instgrm-version="14"
        style="max-width:540px; width:100%; margin:20px auto; padding:">
      </blockquote>`;

    this.embedCode = this.sanitizer.bypassSecurityTrustHtml(html);

    this.loadInstagramScript();
  }

  private loadInstagramScript(): void {
    if (this.scriptLoaded) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = '//www.instagram.com/embed.js';
    script.onload = () => {
      // Instagram provides a global `instgrm` object
      if ((window as any).instgrm) {
        (window as any).instgrm.Embeds.process();
      }
    };
    document.body.appendChild(script);
    this.scriptLoaded = true;
  }
}
