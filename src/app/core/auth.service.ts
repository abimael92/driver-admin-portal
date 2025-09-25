import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  login(email: string, password: string) {
    if (email === 'driver@driver.com' && password === '123456') {
      this.userSubject.next({ email, role: 'driver' });
      return true;
    }
    if (email === 'client@client.com' && password === '123456') {
      this.userSubject.next({ email, role: 'passenger' });
      return true;
    }
    return false;
  }

  logout() {
    this.userSubject.next(null);
  }

  getUser() {
    return this.userSubject.value;
  }
}
