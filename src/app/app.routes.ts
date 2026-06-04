import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/search', pathMatch: 'full' },
  { path: 'search', loadComponent: () => import('./components/search/search.component').then(m => m.SearchComponent) },
  { path: 'seats/:id', loadComponent: () => import('./components/seat-selection/seat-selection.component').then(m => m.SeatSelectionComponent) },
  { path: 'booking', loadComponent: () => import('./components/booking/booking.component').then(m => m.BookingComponent) },
  { 
    path: 'my-bookings', 
    loadComponent: () => import('./components/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent) 
  },
  { path: '**', redirectTo: '/search' }
];