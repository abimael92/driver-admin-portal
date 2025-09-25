import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const role = this.auth.getRole();
    const expectedRole = route.data['role'];

    if (!role) {
      this.router.navigate(['/login']);
      return false;
    }

    if (expectedRole && role !== expectedRole) {
      // Role mismatch
      this.router.navigate(['/login']);
      return false;
    }

    return true; // allowed
  }
}
