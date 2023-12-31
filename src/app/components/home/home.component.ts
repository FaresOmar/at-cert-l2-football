import { Component } from '@angular/core';
import { Country } from '../../domain/country.enum';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { StandingComponent } from '../standing/standing.component';
import { FootballApiService } from '../../football-api/football-api.service';
import { CountryService } from '../../domain/country.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, StandingComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  countries =  [Country.ENGLAND, Country.SPAIN, Country.GERMANY, Country.FRANCE, Country.ITALY];

  constructor(route: ActivatedRoute, countryService: CountryService) {
    countryService.setSelectedCountry(route.snapshot.paramMap.get('name'));
    route.params.subscribe(params => countryService.setSelectedCountry(params['name']));
  }
}
