import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'login',
    loadChildren: () =>
      import('./features/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: 'driver',
    loadChildren: () =>
      import('./features/driver-dashboard/driver-dashboard.module').then(
        (m) => m.DriverDashboardModule
      ),
  },
  {
    path: 'passenger',
    loadChildren: () =>
      import('./features/passenger-booking/passenger-booking.module').then(
        (m) => m.PassengerBookingModule
      ),
  },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
