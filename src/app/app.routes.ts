import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/players', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'players',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/players-list/players-list.component').then(
        (m) => m.PlayersListComponent,
      ),
  },
  {
    path: 'players/create',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/player-create/player-create.component').then(
        (m) => m.PlayerCreateComponent,
      ),
  },
  {
    path: 'players/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/player-detail/player-detail.component').then(
        (m) => m.PlayerDetailComponent,
      ),
  },
  {
    path: 'players/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/player-edit/player-edit.component').then(
        (m) => m.PlayerEditComponent,
      ),
  },
  {
    path: 'players/:id/timeline',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/player-timeline/player-timeline.component').then(
        (m) => m.PlayerTimelineComponent,
      ),
  },
  { path: '**', redirectTo: '/players' },
];
