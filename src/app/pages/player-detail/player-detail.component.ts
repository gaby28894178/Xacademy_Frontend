import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Chart, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, RadarController } from 'chart.js';
import { PlayersService, Player } from '../../core/services/players.service';

Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, RadarController);

@Component({
  selector: 'app-player-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  template: `
    <div class="min-h-screen bg-gray-50">
      <nav class="bg-green-700 text-white px-6 py-4 flex items-center gap-4 shadow-lg">
        <a routerLink="/players" class="text-white hover:text-green-200 transition">← Back</a>
        <span class="text-xl">⚽</span>
        <h1 class="text-xl font-bold">Player Details</h1>
      </nav>

      <div *ngIf="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
      </div>

      <div *ngIf="player && !loading" class="max-w-5xl mx-auto px-4 py-8">
        <!-- Player Card -->
        <div class="bg-white rounded-2xl shadow-sm p-6 mb-6 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div class="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-4xl text-white font-bold flex-shrink-0">
            {{ player.short_name.charAt(0) }}
          </div>
          <div class="flex-1 text-center md:text-left">
            <h2 class="text-3xl font-bold text-gray-900">{{ player.short_name }}</h2>
            <p class="text-gray-500 text-lg">{{ player.long_name }}</p>
            <div class="flex flex-wrap gap-3 justify-center md:justify-start mt-3">
              <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {{ player.positions || 'N/A' }}
              </span>
              <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {{ player.club || 'No club' }}
              </span>
              <span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                🌍 {{ player.nationality || 'Unknown' }}
              </span>
              <span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {{ player.gender === 'F' ? '👩 Female' : '👨 Male' }}
              </span>
            </div>
          </div>
          <div class="flex gap-6">
            <div class="text-center">
              <p class="text-4xl font-bold"
                [class.text-yellow-500]="(player.overall || 0) >= 85"
                [class.text-green-600]="(player.overall || 0) < 85">
                {{ player.overall || '—' }}
              </p>
              <p class="text-xs text-gray-500 uppercase tracking-wide">Overall</p>
            </div>
            <div class="text-center">
              <p class="text-4xl font-bold text-blue-600">{{ player.potential || '—' }}</p>
              <p class="text-xs text-gray-500 uppercase tracking-wide">Potential</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 mb-6">
          <a [routerLink]="['/players', player.id, 'edit']"
            class="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition">
            ✏️ Edit Player
          </a>
          <a [routerLink]="['/players', player.id, 'timeline']"
            class="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition">
            📈 View Timeline
          </a>
        </div>

        <!-- Skills Radar Chart -->
        <div *ngIf="latestStats" class="bg-white rounded-2xl shadow-sm p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-1">Skills Radar</h3>
          <p class="text-gray-500 text-sm mb-6">FIFA {{ latestStats.fifa_version }} — Latest version</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Chart -->
            <div class="flex items-center justify-center">
              <div style="width: 100%; max-width: 350px;">
                <canvas baseChart
                  [data]="radarChartData"
                  [options]="radarChartOptions"
                  type="radar">
                </canvas>
              </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-2 gap-4">
              <div *ngFor="let stat of skillsList" class="bg-gray-50 rounded-xl p-4 flex flex-col items-center">
                <p class="text-sm text-gray-500 font-medium uppercase tracking-wide">{{ stat.label }}</p>
                <p class="text-3xl font-bold mt-1"
                  [class.text-yellow-500]="stat.value >= 85"
                  [class.text-green-600]="stat.value >= 70 && stat.value < 85"
                  [class.text-orange-500]="stat.value >= 50 && stat.value < 70"
                  [class.text-red-500]="stat.value < 50">
                  {{ stat.value || '—' }}
                </p>
                <div class="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div class="h-1.5 rounded-full"
                    [class.bg-yellow-400]="stat.value >= 85"
                    [class.bg-green-500]="stat.value >= 70 && stat.value < 85"
                    [class.bg-orange-400]="stat.value >= 50 && stat.value < 70"
                    [class.bg-red-400]="stat.value < 50"
                    [style.width.%]="stat.value">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PlayerDetailComponent implements OnInit {
  player: Player | null = null;
  loading = false;
  latestStats: any = null;
  skillsList: { label: string; value: number }[] = [];

  radarChartData: ChartData<'radar'> = {
    labels: ['Pace', 'Shooting', 'Passing', 'Dribbling', 'Defending', 'Physic'],
    datasets: [
      {
        data: [],
        label: 'Skills',
        backgroundColor: 'rgba(34,197,94,0.2)',
        borderColor: 'rgba(34,197,94,1)',
        pointBackgroundColor: 'rgba(34,197,94,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(34,197,94,1)',
      },
    ],
  };

  radarChartOptions: ChartOptions<'radar'> = {
    responsive: true,
    scales: {
      r: {
        min: 0,
        max: 99,
        ticks: { stepSize: 20 },
      },
    },
  };

  constructor(
    private route: ActivatedRoute,
    private playersService: PlayersService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;
    this.playersService.getPlayer(id).subscribe({
      next: (player) => {
        this.player = player;
        if (player.stats && player.stats.length > 0) {
          this.latestStats = player.stats[player.stats.length - 1];
          this.buildChart();
        }
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  buildChart(): void {
    if (!this.latestStats) return;
    const s = this.latestStats;
    const values = [
      s.pace || 0,
      s.shooting || 0,
      s.passing || 0,
      s.dribbling || 0,
      s.defending || 0,
      s.physic || 0,
    ];
    this.radarChartData = {
      ...this.radarChartData,
      datasets: [{ ...this.radarChartData.datasets[0], data: values }],
    };
    this.skillsList = [
      { label: 'Pace', value: s.pace || 0 },
      { label: 'Shooting', value: s.shooting || 0 },
      { label: 'Passing', value: s.passing || 0 },
      { label: 'Dribbling', value: s.dribbling || 0 },
      { label: 'Defending', value: s.defending || 0 },
      { label: 'Physic', value: s.physic || 0 },
    ];
  }
}
