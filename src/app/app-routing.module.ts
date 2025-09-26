import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HeroComponent } from './components/hero/hero.component';
import { FeaturesComponent } from './components/features/features.component';
import { HowItWorksComponent } from './components/how-it-works/how-it-works.component';
import { CtaBannerComponent } from './components/cta-banner/cta-banner.component';

const routes: Routes = [
  { path: '', component: HeroComponent },
  { path: 'search', component: FeaturesComponent },
  { path: 'how-it-works', component: HowItWorksComponent },
  { path: 'become-driver', component: CtaBannerComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
