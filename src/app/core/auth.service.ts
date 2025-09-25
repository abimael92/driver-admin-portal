import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private users = [
    { email: 'driver@driver.com', password: '123456', role: 'driver' },
    { email: 'client@client.com', password: '123456', role: 'passenger' },
  ];

  constructor(private router: Router) {}

  login(email: string, password: string): boolean {
    const user = this.users.find(
      (u) => u.email === email && u.password === password
    );
    if (user) {
      localStorage.setItem('userRole', user.role); // store role temporarily
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);
  }

  getRole(): string | null {
    return localStorage.getItem('userRole');
  }
}
