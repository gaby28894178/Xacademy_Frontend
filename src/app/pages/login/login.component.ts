import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-green-800 to-green-600 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div class="text-center mb-8">
          <div class="text-6xl mb-3">⚽</div>
          <h1 class="text-3xl font-bold text-gray-800">FIFA Player Manager</h1>
          <p class="text-gray-500 mt-2">Sign in to continue</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              formControlName="email"
              placeholder="your@email.com"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              [class.border-red-400]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            />
            <p *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
               class="text-red-500 text-xs mt-1">Valid email is required</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              formControlName="password"
              placeholder="••••••••"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              [class.border-red-400]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            />
            <p *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
               class="text-red-500 text-xs mt-1">Password must be at least 6 characters</p>
          </div>

          <div *ngIf="errorMsg" class="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
            {{ errorMsg }}
          </div>

          <button
            type="submit"
            [disabled]="loading || loginForm.invalid"
            class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition duration-200"
          >
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });
  loading = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.errorMsg = '';
    const { email, password } = this.loginForm.value;
    this.authService.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/players']),
      error: (err) => {
        this.errorMsg = err.error?.message || 'Login failed. Check your credentials.';
        this.loading = false;
      },
    });
  }
}
