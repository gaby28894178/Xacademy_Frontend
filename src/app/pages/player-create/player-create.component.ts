import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PlayersService } from '../../core/services/players.service';

@Component({
  selector: 'app-player-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <nav class="bg-green-700 text-white px-6 py-4 flex items-center gap-4 shadow-lg">
        <a routerLink="/players" class="text-white hover:text-green-200 transition">← Back</a>
        <span class="text-xl">⚽</span>
        <h1 class="text-xl font-bold">Create New Player</h1>
      </nav>

      <div class="max-w-2xl mx-auto px-4 py-8">
        <div class="bg-white rounded-2xl shadow-sm p-8">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-800">New Player</h2>
            <p class="text-gray-500 text-sm mt-1">Add a new player to the database</p>
          </div>

          <form [formGroup]="createForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Short Name *</label>
                <input formControlName="short_name" type="text" placeholder="e.g. Messi"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 outline-none"
                  [class.border-red-400]="createForm.get('short_name')?.invalid && createForm.get('short_name')?.touched" />
                <p *ngIf="createForm.get('short_name')?.invalid && createForm.get('short_name')?.touched"
                   class="text-red-500 text-xs mt-1">Name is required</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input formControlName="long_name" type="text"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <input formControlName="nationality" type="text"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Club</label>
                <input formControlName="club" type="text"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Positions</label>
                <input formControlName="positions" type="text" placeholder="ST, CF, LW..."
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input formControlName="age" type="number" min="15" max="50"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Overall (1-99)</label>
                <input formControlName="overall" type="number" min="1" max="99"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Potential (1-99)</label>
                <input formControlName="potential" type="number" min="1" max="99"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select formControlName="gender"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 outline-none">
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
            </div>

            <hr class="my-2" />
            <h3 class="text-lg font-semibold text-gray-700">Skills</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div *ngFor="let skill of skillFields">
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ skill.label }}</label>
                <input [formControlName]="skill.key" type="number" min="1" max="99"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 outline-none" />
              </div>
            </div>

            <div *ngIf="errorMsg" class="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
              {{ errorMsg }}
            </div>

            <div class="flex gap-3 pt-2">
              <button type="submit" [disabled]="loading || createForm.invalid"
                class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold px-6 py-2 rounded-lg transition">
                {{ loading ? 'Creating...' : '➕ Create Player' }}
              </button>
              <a routerLink="/players"
                class="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium flex items-center">
                Cancel
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class PlayerCreateComponent {
  loading = false;
  errorMsg = '';

  skillFields = [
    { key: 'pace', label: 'Pace' },
    { key: 'shooting', label: 'Shooting' },
    { key: 'passing', label: 'Passing' },
    { key: 'dribbling', label: 'Dribbling' },
    { key: 'defending', label: 'Defending' },
    { key: 'physic', label: 'Physic' },
  ];

  createForm = this.fb.group({
    short_name: ['', [Validators.required, Validators.maxLength(100)]],
    long_name: [''],
    nationality: [''],
    club: [''],
    positions: [''],
    age: [null as number | null, [Validators.min(15), Validators.max(50)]],
    overall: [null as number | null, [Validators.min(1), Validators.max(99)]],
    potential: [null as number | null, [Validators.min(1), Validators.max(99)]],
    gender: ['M'],
    pace: [null as number | null, [Validators.min(1), Validators.max(99)]],
    shooting: [null as number | null, [Validators.min(1), Validators.max(99)]],
    passing: [null as number | null, [Validators.min(1), Validators.max(99)]],
    dribbling: [null as number | null, [Validators.min(1), Validators.max(99)]],
    defending: [null as number | null, [Validators.min(1), Validators.max(99)]],
    physic: [null as number | null, [Validators.min(1), Validators.max(99)]],
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private playersService: PlayersService,
  ) {}

  onSubmit(): void {
    if (this.createForm.invalid) return;
    this.loading = true;
    this.errorMsg = '';
    this.playersService.createPlayer(this.createForm.value as any).subscribe({
      next: (player) => {
        this.router.navigate(['/players', player.id]);
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Failed to create player';
        this.loading = false;
      },
    });
  }
}
