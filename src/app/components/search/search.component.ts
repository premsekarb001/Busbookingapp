// src/app/components/search/search.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BusService, Bus } from '../../services/bus.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  private busService = inject(BusService);
  private router = inject(Router);

  searchData = {
    from: '',
    to: ''
  };

  buses = signal<Bus[]>([]);
  isLoading = signal(false);
  hasSearched = signal(false);

  cities = [
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
    'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
    'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
    'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
    'Ramanathapuram', 'Ranipet', 'Salem', 'Sivagangai', 'Tenkasi',
    'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
    'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
    'Vellore', 'Viluppuram', 'Virudhunagar'
  ];

  searchBuses() {
    if (!this.searchData.from || !this.searchData.to) {
      alert('Please select both departure and destination cities');
      return;
    }

    if (this.searchData.from === this.searchData.to) {
      alert('Departure and destination cannot be the same');
      return;
    }

    this.isLoading.set(true);
    this.hasSearched.set(true);

    this.busService.searchBuses(this.searchData.from, this.searchData.to)
      .subscribe({
        next: (result) => {
          this.buses.set(result);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Search failed:', err);
          alert('Failed to search buses. Please try again.');
          this.isLoading.set(false);
        }
      });
  }

  selectBus(bus: Bus) {
    this.router.navigate(['/seats', bus.id]);
  }

  clearSearch() {
    this.searchData = { from: '', to: '' };
    this.buses.set([]);
    this.hasSearched.set(false);
  }

  getDuration(departure: string, arrival: string): string {
    // Simple duration calculation
    return "~6 hours";
  }
}

// ✅ ADD DEFAULT EXPORT AT THE BOTTOM
export default SearchComponent;