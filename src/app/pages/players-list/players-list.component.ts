import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { PlayersService, Player, PlayerQuery } from '../../core/services/players.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-players-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <nav class="bg-green-700 text-white px-6 py-4 flex justify-between items-center shadow-lg">
        <div class="flex items-center gap-3">
          <span class="text-2xl">⚽</span>
          <h1 class="text-xl font-bold">FIFA Player Manager</h1>
        </div>
        <button (click)="logout()" class="bg-green-800 hover:bg-green-900 px-4 py-2 rounded-lg text-sm transition">
          Logout
        </button>
      </nav>

      <div class="max-w-7xl mx-auto px-4 py-6">
        <!-- Filters -->
        <div class="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h2 class="text-lg font-semibold text-gray-700 mb-4">Filter Players</h2>
          <form [formGroup]="filterForm" class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input formControlName="name" placeholder="Search by name..."
              class="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 outline-none" />
            <input formControlName="club" placeholder="Club..."
              class="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 outline-none" />
            <input formControlName="position" placeholder="Position (ST, GK...)"
              class="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 outline-none" />
            <input formControlName="nationality" placeholder="Nationality..."
              class="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 outline-none" />
          </form>

          <div class="flex justify-between items-center mt-4">
            <p class="text-sm text-gray-500">{{ meta?.total || 0 }} players found</p>
            <div class="flex gap-3">
              <button (click)="resetFilters()"
                class="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                Clear filters
              </button>
              <button (click)="exportCsv()"
                class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm transition flex items-center gap-2">
                📥 Export Excel
              </button>
              <a routerLink="/players/create"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition flex items-center gap-2">
                ➕ Add Player
              </a>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div *ngIf="loading" class="flex justify-center items-center py-20">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
          </div>

          <table *ngIf="!loading" class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Pos</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">OVR</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nationality</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let player of players" class="hover:bg-gray-50 transition">
                <td class="px-6 py-4">
                  <div class="font-medium text-gray-900">{{ player.short_name }}</div>
                  <div class="text-xs text-gray-500">{{ player.long_name }}</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ player.club || '—' }}</td>
                <td class="px-6 py-4">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {{ player.positions || '—' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="font-bold text-lg"
                    [class.text-yellow-500]="(player.overall || 0) >= 85"
                    [class.text-green-600]="(player.overall || 0) >= 75 && (player.overall || 0) < 85"
                    [class.text-gray-600]="(player.overall || 0) < 75">
                    {{ player.overall || '—' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ player.nationality || '—' }}</td>
                <td class="px-6 py-4">
                  <div class="flex gap-2">
                    <a [routerLink]="['/players', player.id]"
                      class="text-blue-600 hover:text-blue-800 text-sm font-medium">View</a>
                    <a [routerLink]="['/players', player.id, 'edit']"
                      class="text-green-600 hover:text-green-800 text-sm font-medium">Edit</a>
                    <a [routerLink]="['/players', player.id, 'timeline']"
                      class="text-purple-600 hover:text-purple-800 text-sm font-medium">Timeline</a>
                  </div>
                </td>
              </tr>
              <tr *ngIf="players.length === 0">
                <td colspan="6" class="px-6 py-16 text-center text-gray-400">No players found</td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div *ngIf="meta && meta.totalPages > 1"
            class="flex justify-between items-center px-6 py-4 border-t border-gray-200">
            <p class="text-sm text-gray-500">
              Page {{ meta.page }} of {{ meta.totalPages }}
            </p>
            <div class="flex gap-2">
              <button [disabled]="meta.page <= 1" (click)="changePage(meta.page - 1)"
                class="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition">
                ← Prev
              </button>
              <button [disabled]="meta.page >= meta.totalPages" (click)="changePage(meta.page + 1)"
                class="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition">
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PlayersListComponent implements OnInit {
  players: Player[] = [];
  meta: any = null;
  loading = false;
  currentPage = 1;

  filterForm = this.fb.group({
    name: [''],
    club: [''],
    position: [''],
    nationality: [''],
  });

  constructor(
    private fb: FormBuilder,
    private playersService: PlayersService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadPlayers();
    this.filterForm.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.loadPlayers();
      });
  }

  loadPlayers(): void {
    this.loading = true;
    const v = this.filterForm.value;
    const query: PlayerQuery = {
      name: v.name ?? undefined,
      club: v.club ?? undefined,
      position: v.position ?? undefined,
      nationality: v.nationality ?? undefined,
      page: this.currentPage,
      limit: 20,
    };
    this.playersService.getPlayers(query).subscribe({
      next: (res) => {
        this.players = res.data;
        this.meta = res.meta;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadPlayers();
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadPlayers();
  }

  exportCsv(): void {
    const v = this.filterForm.value;
    this.playersService.exportCsv({
      name: v.name ?? undefined,
      club: v.club ?? undefined,
      position: v.position ?? undefined,
      nationality: v.nationality ?? undefined,
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
