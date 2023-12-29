import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Country } from '../domain/country.enum';
import { TeamStanding } from '../domain/team-standing';
import { AsyncSubject, Observable, map, mergeMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FootballService {

  readonly footballApiHeaders: HttpHeaders;
  readonly leaguesMetaData: {
    country: Country,
    leagueId: number,
    currentSeason: AsyncSubject<number>
  }[] = [
    {
      country: Country.ENGLAND,
      leagueId: 39,
      currentSeason: new AsyncSubject<number>()
    },
    {
      country: Country.SPAIN,
      leagueId: 140,
      currentSeason: new AsyncSubject<number>()
    },
    {
      country: Country.FRANCE,
      leagueId: 61,
      currentSeason: new AsyncSubject<number>()
    },
    {
      country: Country.GERMANY,
      leagueId: 78,
      currentSeason: new AsyncSubject<number>()
    },
    {
      country: Country.ITALY,
      leagueId: 135,
      currentSeason: new AsyncSubject<number>()
    }
  ]

  constructor(private http: HttpClient) {
    this.footballApiHeaders = new HttpHeaders();
    this.footballApiHeaders = this.footballApiHeaders.set("x-rapidapi-key", "56a8a89c8da6d4d5f16100af1da8d432");
    this.setCurrentSeasonsForEveryLeague().subscribe();
   }

  getLeagueStanding(country: Country): Observable<TeamStanding[]> {
    const leagueMetaData = this.leaguesMetaData.filter(league => league.country == country)[0];
    return leagueMetaData.currentSeason.pipe(
      mergeMap(currentSeason =>
        this.getFootballApiData<any>(`standings?league=${leagueMetaData.leagueId}&season=${currentSeason}`).pipe(map(result => {
        return (result.response[0].league.standings[0] as any[]).map(standing => {
          const TeamStanding: TeamStanding = {
            teamId: standing.team.id,
            rank: standing.rank,
            name: standing.team.name,
            played: standing.all.played,
            win: standing.all.win,
            lose: standing.all.lose,
            logo: standing.team.logo
          }
          return TeamStanding;
        });
      })
    )))
  }

  setCurrentSeasonsForEveryLeague() {
    return this.getFootballApiData<any>(`leagues?current=true`).pipe(tap(result => {
      (result.response as any[]).forEach(response =>  this.leaguesMetaData.forEach(countryMetaData => {
        if (countryMetaData.leagueId === response.league.id) {
          countryMetaData.currentSeason.next(response.seasons[0].year);
          countryMetaData.currentSeason.complete();
        }
      }))
    }))
  }

  private getFootballApiData<T>(path: string) {
    return this.http.get<T>(`https://v3.football.api-sports.io/${path}`, {headers: this.footballApiHeaders});
  }
}
