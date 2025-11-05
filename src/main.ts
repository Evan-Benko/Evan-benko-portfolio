import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes, withHashLocation } from '@angular/router';

import { HomeComponent } from './app/home/home.component';
import { ProjectsComponent } from './app/projects/projects.component';
import { PhilosophyComponent } from './app/philosophy/philosophy.component';
import { ResumeComponent } from './app/resume/resume.component';
import { ContactComponent } from './app/contact/contact.component';
import { PageNotFoundComponent } from './app/page-not-found/page-not-found.component';
import { AppComponent } from './app/app';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'projects', component: ProjectsComponent },
    { path: 'philosophy', component: PhilosophyComponent },
    { path: 'resume', component: ResumeComponent },
    { path: 'contact', component: ContactComponent },
    { path: '**', component: PageNotFoundComponent }
];

bootstrapApplication(AppComponent, {
    providers: [
        provideRouter(routes, withHashLocation()), // This enables hash routing
        // Optional: Explicitly provide HashLocationStrategy (not required if using withHashLocation)
        // { provide: LocationStrategy, useClass: HashLocationStrategy }
    ]
}).catch(err => console.error(err));