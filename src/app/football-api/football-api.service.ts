import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Country } from '../domain/country.enum';
import { TeamStanding } from '../domain/team-standing';
import { AsyncSubject, Observable, ReplaySubject, map, switchMap, tap } from 'rxjs';
import { Match } from '../domain/match';

@Injectable({
  providedIn: 'root'
})
export class FootballApiService {

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
      switchMap(currentSeason =>
        this.getFootballApiData<StandingApiResponse>(`standings?league=${leagueMetaData.leagueId}&season=${currentSeason}`).pipe(map(result => {
          this.handleErrors(result.errors.requests);
          return result.response[0].league.standings[0].map(standing => {
            const TeamStanding: TeamStanding = {
              teamId: standing.team.id,
              rank: standing.rank,
              name: standing.team.name,
              played: standing.all.played,
              win: standing.all.win,
              draw: standing.all.draw,
              lose: standing.all.lose,
              logo: standing.team.logo,
              goalsDiff: standing.goalsDiff,
              points: standing.points
            }
            return TeamStanding;
          });
        }))
      )
    )
  }

  getTeamMatches(country: Country, teamId: string) {
    const leagueMetaData = this.leaguesMetaData.filter(league => league.country == country)[0]
    return leagueMetaData.currentSeason.pipe(
      switchMap(currentSeason =>
        this.getFootballApiData<fixtureApiResponse>(`fixtures?league=${leagueMetaData.leagueId}&season=${currentSeason}&team=${teamId}&last=10`).pipe(map(result => {
          this.handleErrors(result.errors.requests);
          return result.response.map(fixture => {
            const match: Match = {
              homeTeam: {
                name: fixture.teams.home.name,
                logo: fixture.teams.home.logo,
                goals: fixture.score.fulltime.home
              },
              awayTeam: {
                name: fixture.teams.away.name,
                logo: fixture.teams.away.logo,
                goals: fixture.score.fulltime.away
              }
            }
            return match;
          });
        }))
      )
    )
  }

  setCurrentSeasonsForEveryLeague() {
    return this.getFootballApiData<LeagueApiResponse>(`leagues?current=true`).pipe(tap(result => {
      this.handleErrors(result.errors.requests);
      result.response.forEach(response =>  this.leaguesMetaData.forEach(countryMetaData => {
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

  private handleErrors(error: String) {
    if (error) {
      alert(error);
    }
  }
}

interface fixtureApiResponse {
  response: {
    teams: {
      home: {
        id: number,
        name: string,
        logo: string
      },
      away: {
        id: number,
        name: string,
        logo: string
      }
    },
    score: {
      fulltime: {
        home: number,
        away: number
      }
    }
  }[],
  errors: {
    requests: string
  }
}

interface StandingApiResponse {
  response: {
    league: {
      standings: Standing[][]
    }
  }[],
  errors: {
    requests: string
  }
}

interface LeagueApiResponse {
  response: {
    league: {
      id: number
    }
    seasons: {
      year: number
    }[]
  }[],
  errors: {
    requests: string
  }
}

interface Standing {
  team: {
    id: number,
    name: string,
    logo: string
  },
  rank: number,
  goalsDiff: number,
  points: number,
  all: {
    played: number,
    win: number,
    draw: number
    lose: number
  }
}
