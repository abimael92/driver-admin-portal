import { Component } from '@angular/core';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-passenger-booking',
  templateUrl: './passenger-booking.component.html',
  styleUrls: ['./passenger-booking.component.scss'],
})
export class PassengerBookingComponent {
  constructor(private auth: AuthService) {}

  logout() {
    this.auth.logout();
  }
}
