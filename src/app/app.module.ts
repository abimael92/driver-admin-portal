import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module'; // our routes
import { AppComponent } from './app.component';

// Pages
import { HomeComponent } from './pages/home/home.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

// Shared components
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { ButtonComponent } from './shared/button/button.component';
import { CardComponent } from './shared/card/card.component';

// Feature Modules
import { LoginModule } from './features/login/login.module';
import { DriverDashboardModule } from './features/driver-dashboard/driver-dashboard.module';
import { PassengerBookingModule } from './features/passenger-booking/passenger-booking.module';

// Services
import { AuthService } from './core/auth.service';
import { BookingService } from './core/booking.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NotFoundComponent,
    NavbarComponent,
    FooterComponent,
    ButtonComponent,
    CardComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    LoginModule,
    DriverDashboardModule,
    PassengerBookingModule,
  ],
  providers: [AuthService, BookingService],
  bootstrap: [AppComponent],
})
export class AppModule {}
