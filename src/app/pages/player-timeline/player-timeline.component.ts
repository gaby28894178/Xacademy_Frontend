import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, LineController } from 'chart.js';
import { PlayersService, Player, PlayerStats } from '../../core/services/players.service';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, LineController);

@Component({
  selector: 'app-player-timeline',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BaseChartDirective],
  template: `
    <div class="min-h-screen bg-gray-50">
      <nav class="bg-green-700 text-white px-6 py-4 flex items-center gap-4 shadow-lg">
        <a [routerLink]="['/players', playerId]" class="text-white hover:text-green-200 transition">← Back</a>
        <span class="text-xl">⚽</span>
        <h1 class="text-xl font-bold">Skills Timeline</h1>
      </nav>

      <div *ngIf="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
      </div>

      <div *ngIf="player && !loading" class="max-w-5xl mx-auto px-4 py-8">
        <!-- Player Info -->
        <div class="bg-white rounded-2xl shadow-sm p-6 mb-6 flex items-center gap-4">
          <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-2xl text-white font-bold">
            {{ player.short_name.charAt(0) }}
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900">{{ player.short_name }}</h2>
            <p class="text-gray-500">{{ player.club }} · {{ player.nationality }}</p>
          </div>
        </div>

        <!-- Skill Selector -->
        <div class="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-3">Select a skill to visualize:</label>
          <div class="flex flex-wrap gap-2">
            <button *ngFor="let skill of availableSkills"
              (click)="selectSkill(skill.key)"
              [class.bg-green-600]="selectedSkill === skill.key"
              [class.text-white]="selectedSkill === skill.key"
              [class.border-green-600]="selectedSkill === skill.key"
              [class.bg-white]="selectedSkill !== skill.key"
              [class.text-gray-700]="selectedSkill !== skill.key"
              class="px-4 py-2 border rounded-lg text-sm font-medium transition hover:bg-green-50">
              {{ skill.label }}
            </button>
          </div>
        </div>

        <!-- Chart -->
        <div *ngIf="stats.length > 0" class="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-1">
            {{ getSkillLabel(selectedSkill) }} Evolution ({{ stats[0].fifa_version }}–{{ stats[stats.length-1].fifa_version }})
          </h3>
          <p class="text-gray-500 text-sm mb-6">Historical progression across FIFA versions</p>
          <canvas baseChart
            [data]="lineChartData"
            [options]="lineChartOptions"
            type="line">
          </canvas>
        </div>

        <div *ngIf="stats.length === 0 && !loading" class="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400">
          No historical data available for this player.
        </div>

        <!-- Data Table -->
        <div *ngIf="stats.length > 0" class="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">FIFA Version</th>
                <th *ngFor="let skill of availableSkills"
                  class="text-left px-4 py-3 text-xs font-medium uppercase"
                  [class.text-green-600]="selectedSkill === skill.key"
                  [class.font-bold]="selectedSkill === skill.key"
                  [class.text-gray-500]="selectedSkill !== skill.key">
                  {{ skill.label }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let s of stats" class="hover:bg-gray-50">
                <td class="px-6 py-3 font-medium text-gray-900">FIFA {{ s.fifa_version }}</td>
                <td *ngFor="let skill of availableSkills" class="px-4 py-3 text-sm"
                  [class.font-bold]="selectedSkill === skill.key"
                  [class.text-green-700]="selectedSkill === skill.key">
                  {{ getStatValue(s, skill.key) || '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class PlayerTimelineComponent implements OnInit {
  playerId!: number;
  player: Player | null = null;
  stats: PlayerStats[] = [];
  loading = false;
  selectedSkill = 'pace';

  availableSkills = [
    { key: 'pace', label: 'Pace' },
    { key: 'shooting', label: 'Shooting' },
    { key: 'passing', label: 'Passing' },
    { key: 'dribbling', label: 'Dribbling' },
    { key: 'defending', label: 'Defending' },
    { key: 'physic', label: 'Physic' },
  ];

  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Pace',
        borderColor: 'rgba(34,197,94,1)',
        backgroundColor: 'rgba(34,197,94,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}`,
        },
      },
    },
    scales: {
      y: { min: 0, max: 99, ticks: { stepSize: 10 } },
    },
  };

  constructor(
    private route: ActivatedRoute,
    private playersService: PlayersService,
  ) {}

  ngOnInit(): void {
    this.playerId = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;
    this.playersService.getTimeline(this.playerId).subscribe({
      next: (res) => {
        this.player = res.player;
        this.stats = res.stats;
        this.buildChart();
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  selectSkill(key: string): void {
    this.selectedSkill = key;
    this.buildChart();
  }

  buildChart(): void {
    const labels = this.stats.map((s) => `FIFA ${s.fifa_version}`);
    const data = this.stats.map((s) => this.getStatValue(s, this.selectedSkill) || 0);
    const label = this.getSkillLabel(this.selectedSkill);
    this.lineChartData = {
      labels,
      datasets: [
        {
          ...this.lineChartData.datasets[0],
          data,
          label,
        },
      ],
    };
  }

  getStatValue(stat: PlayerStats, key: string): number {
    return (stat as any)[key];
  }

  getSkillLabel(key: string): string {
    return this.availableSkills.find((s) => s.key === key)?.label || key;
  }
}
