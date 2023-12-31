import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Match } from '../../domain/match';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FootballApiService } from '../../football-api/football-api.service';
import { CountryService } from '../../domain/country.service';
import { Country } from '../../domain/country.enum';

@Component({
  selector: 'app-team-matches',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './team-matches.component.html',
  styleUrl: './team-matches.component.scss'
})
export class TeamMatchesComponent {
  teamMatches?: Match[];

  country?: string;

  constructor(private router: Router , private route: ActivatedRoute, private countryService: CountryService, private footballApiService: FootballApiService) {
    this.setData();
  }

  navigateToLeague() {
    if (this.country) {
      this.router.navigate(['countries', this.country]);
    }
  }

  setData() {
    const country = this.route.snapshot.paramMap.get('country');
    if (!this.countryService.isCountryValid(this.route.snapshot.paramMap.get('country'))) {
      alert('Invalid country!');
      return;
    }
    this.country = country as string;
    const teamId = this.route.snapshot.paramMap.get('teamId');
    if (!teamId) {
      alert('Invalid country!');
      return;
    }
    this.footballApiService.getTeamMatches(country as Country, teamId).subscribe(matches => this.teamMatches = matches);
  }
}
