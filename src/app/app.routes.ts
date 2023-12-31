import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { TeamMatchesComponent } from './components/team-matches/team-matches.component';

export const routes: Routes = [
  { path: 'countries/:name', component: HomeComponent },
  { path: 'countries', component: HomeComponent },
  { path: 'countries/:country/teams/:teamId', component: TeamMatchesComponent },
  { path: '', component: HomeComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
