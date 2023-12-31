import { Component, OnDestroy } from '@angular/core';
import { TeamStanding } from '../../domain/team-standing';
import { FootballApiService } from '../../football-api/football-api.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';
import { CountryService } from '../../domain/country.service';

@Component({
  selector: 'app-standing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './standing.component.html',
  styleUrl: './standing.component.scss'
})
export class StandingComponent implements OnDestroy {
  leagueStanding?: TeamStanding[];
  country?: string;
  countrySubscription: Subscription;
  leagueSubscription?: Subscription;

  constructor(countryService: CountryService, footballApiService: FootballApiService) {
    this.countrySubscription = countryService.getSelectedCountry().subscribe(country => {
      this.country = country;
      this.leagueSubscription = footballApiService.getLeagueStanding(country).subscribe(leagueStanding => this.leagueStanding = leagueStanding)
    });
  }

  ngOnDestroy(): void {
    this.countrySubscription.unsubscribe();
    this.leagueSubscription?.unsubscribe();
  }
}
