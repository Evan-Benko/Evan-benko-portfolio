import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';

import { HomeComponent } from './app/home/home.component';
import { AppComponent } from './app/app';
import {provideHttpClient} from '@angular/common/http';
import {importProvidersFrom, isDevMode} from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    {path: 'projects',loadComponent:()=>
      import("./app/projects/projects.component").then(m=>m.ProjectsComponent)},
    { path: 'philosophy',loadComponent:()=>
        import("./app/philosophy/philosophy.component").then(m=>m.PhilosophyComponent)},
    { path: 'resume',loadComponent:()=>
        import("./app/resume/resume.component").then(m=>m.ResumeComponent)},
    { path: 'contact',loadComponent:()=>
        import("./app/contact/contact.component").then(m=>m.ContactComponent)},
    { path: '**',loadComponent:()=>
        import("./app/page-not-found/page-not-found.component").then(m=>m.PageNotFoundComponent)},
];

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    importProvidersFrom(), provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ]
})
  .then(r =>console.log( "Bootstrap Loaded Successfully"));
