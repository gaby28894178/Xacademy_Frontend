import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Player {
  id: number;
  short_name: string;
  long_name: string;
  age: number;
  nationality: string;
  club: string;
  overall: number;
  potential: number;
  positions: string;
  gender: string;
  photo_url?: string;
  stats: PlayerStats[];
}

export interface PlayerStats {
  id: number;
  fifa_version: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physic: number;
  skill_moves: number;
  weak_foot: number;
  attack: number;
  vision: number;
  agility: number;
  acceleration: number;
  sprint_speed: number;
  stamina: number;
}

export interface PlayerListResponse {
  data: Player[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PlayerQuery {
  name?: string;
  club?: string;
  position?: string;
  nationality?: string;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class PlayersService {
  private apiUrl = `${environment.apiUrl}/players`;

  constructor(private http: HttpClient) {}

  getPlayers(query: PlayerQuery = {}): Observable<PlayerListResponse> {
    let params = new HttpParams();
    if (query.name) params = params.set('name', query.name);
    if (query.club) params = params.set('club', query.club);
    if (query.position) params = params.set('position', query.position);
    if (query.nationality) params = params.set('nationality', query.nationality);
    if (query.page) params = params.set('page', query.page.toString());
    if (query.limit) params = params.set('limit', query.limit.toString());
    return this.http.get<PlayerListResponse>(this.apiUrl, { params });
  }

  getPlayer(id: number): Observable<Player> {
    return this.http.get<Player>(`${this.apiUrl}/${id}`);
  }

  getTimeline(id: number): Observable<{ player: Player; stats: PlayerStats[] }> {
    return this.http.get<{ player: Player; stats: PlayerStats[] }>(
      `${this.apiUrl}/${id}/timeline`,
    );
  }

  createPlayer(data: Partial<Player & PlayerStats>): Observable<Player> {
    return this.http.post<Player>(this.apiUrl, data);
  }

  updatePlayer(id: number, data: Partial<Player & PlayerStats>): Observable<Player> {
    return this.http.put<Player>(`${this.apiUrl}/${id}`, data);
  }

  exportCsv(query: PlayerQuery = {}): void {
    let params = new HttpParams();
    if (query.name) params = params.set('name', query.name);
    if (query.club) params = params.set('club', query.club);
    if (query.position) params = params.set('position', query.position);
    if (query.nationality) params = params.set('nationality', query.nationality);

    this.http
      .get(`${this.apiUrl}/export/csv`, {
        params,
        responseType: 'blob',
      })
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'players.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }
}
