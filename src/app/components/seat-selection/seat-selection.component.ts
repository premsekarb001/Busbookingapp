// src/app/components/seat-selection/seat-selection.component.ts
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BusService, Bus, Seat } from '../../services/bus.service';

@Component({
  selector: 'app-seat-selection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seat-selection.component.html',
  styleUrls: ['./seat-selection.component.css']
})
export class SeatSelectionComponent implements OnInit {
  private busService = inject(BusService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  // State signals
  isLoading = signal(true);
  busDetails = signal<Bus | null>(null);
  seats = signal<Seat[]>([]);
  selectedSeats = signal<Seat[]>([]);
  
  // Computed values
  totalPrice = computed(() => {
    const bus = this.busDetails();
    if (!bus) return 0;
    return this.selectedSeats().length * bus.price;
  });
  
  selectedSeatCount = computed(() => this.selectedSeats().length);
  maxSeatsReached = computed(() => this.selectedSeatCount() >= 6);
  
  ngOnInit() {
    const busId = Number(this.route.snapshot.paramMap.get('id'));
    if (busId && !isNaN(busId)) {
      this.loadBusAndSeats(busId);
    } else {
      console.error('Invalid bus ID');
      this.router.navigate(['/search']);
    }
  }
  
  loadBusAndSeats(busId: number) {
    this.isLoading.set(true);
    
    // Load bus details
    this.busService.getBusById(busId).subscribe({
      next: (bus) => {
        this.busDetails.set(bus);
        
        // Load seat layout
        this.busService.getSeatLayout(busId).subscribe({
          next: (seats) => {
            this.seats.set(seats);
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error('Failed to load seats:', err);
            this.isLoading.set(false);
            alert('Failed to load seat layout. Please try again.');
            this.router.navigate(['/search']);
          }
        });
      },
      error: (err) => {
        console.error('Failed to load bus:', err);
        this.isLoading.set(false);
        alert('Bus not found. Please search again.');
        this.router.navigate(['/search']);
      }
    });
  }
  
  toggleSeat(seat: Seat) {
    // Don't allow selecting booked seats
    if (seat.isBooked) {
      alert('This seat is already booked!');
      return;
    }
    
    // Check if seat is already selected
    const isSelected = this.selectedSeats().some(s => s.seatNumber === seat.seatNumber);
    
    if (isSelected) {
      // Deselect seat
      this.selectedSeats.update(seats => 
        seats.filter(s => s.seatNumber !== seat.seatNumber)
      );
      
      // Update seat status
      this.seats.update(allSeats =>
        allSeats.map(s =>
          s.seatNumber === seat.seatNumber 
            ? { ...s, isSelected: false } 
            : s
        )
      );
    } else {
      // Check max seats limit
      if (this.selectedSeatCount() >= 6) {
        alert('You can only select up to 6 seats per booking');
        return;
      }
      
      // Select seat
      this.selectedSeats.update(seats => [...seats, seat]);
      
      // Update seat status
      this.seats.update(allSeats =>
        allSeats.map(s =>
          s.seatNumber === seat.seatNumber 
            ? { ...s, isSelected: true } 
            : s
        )
      );
    }
  }
  
  getSeatClass(seat: Seat): string {
    if (seat.isBooked) return 'seat booked';
    if (seat.isSelected) return 'seat selected';
    return 'seat available';
  }
  
  getSeatType(seatNumber: number): string {
    if (seatNumber <= 2 || (seatNumber > 40 && seatNumber <= 42)) return 'window';
    if (seatNumber % 4 === 0 || seatNumber % 4 === 3) return 'aisle';
    return 'middle';
  }
  
  isLadiesSeat(seatNumber: number): boolean {
    // Ladies preferred seats
    const ladiesSeats = [5, 6, 15, 16, 25, 26, 35, 36, 45, 46];
    return ladiesSeats.includes(seatNumber);
  }
  
  proceedToBooking() {
    if (this.selectedSeatCount() === 0) {
      alert('Please select at least one seat to continue');
      return;
    }
    
    const selectedSeatNumbers = this.selectedSeats().map(s => s.seatNumber);
    
    this.router.navigate(['/booking'], {
      state: {
        busId: this.busDetails()!.id,
        seats: selectedSeatNumbers,
        totalPrice: this.totalPrice()
      }
    });
  }
  
  clearSelection() {
    if (this.selectedSeatCount() === 0) return;
    
    if (confirm('Are you sure you want to clear all selected seats?')) {
      // Clear all selected seats
      this.selectedSeats.set([]);
      
      // Update all seats
      this.seats.update(allSeats =>
        allSeats.map(seat => ({
          ...seat,
          isSelected: false
        }))
      );
    }
  }
  
  goBack() {
    this.router.navigate(['/search']);
  }
  
  getTotalSeatsCount(): number {
    return this.seats().length;
  }
  
  getAvailableSeatsCount(): number {
    return this.seats().filter(s => !s.isBooked).length;
  }
  
  getBookedSeatsCount(): number {
    return this.seats().filter(s => s.isBooked).length;
  }
}