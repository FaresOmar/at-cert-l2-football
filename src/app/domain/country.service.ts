import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { Country } from './country.enum';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  selectedCountry: ReplaySubject<Country>;

  constructor() {
    this.selectedCountry = new ReplaySubject<Country>(1);
  }

  setSelectedCountry(country: string | null) {
    if (this.isCountryValid(country)) {
      this.selectedCountry.next(country as Country);
    }
  }

  getSelectedCountry(): Observable<Country> {
    return this.selectedCountry;
  }

  isCountryValid(country: string | null) {
    return Object.values<string | null>(Country).includes(country);
  }

}
