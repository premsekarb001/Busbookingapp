// src/app/components/booking/booking.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BusService, Bus, Booking } from '../../services/bus.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  private busService = inject(BusService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  isLoading = signal(false);
  isBooked = signal(false);
  bookingSuccess = signal(false);
  
  busDetails = signal<Bus | null>(null);
  selectedSeats = signal<number[]>([]);
  totalAmount = signal(0);
  bookingId = signal<number | null>(null);
  
  passengerData = {
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: ''
  };
  
  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { busId: number; seats: number[]; totalPrice: number };
    
    if (state) {
      this.loadBusDetails(state.busId);
      this.selectedSeats.set(state.seats);
      this.totalAmount.set(state.totalPrice);
    } else {
      this.router.navigate(['/search']);
    }
  }
  
  loadBusDetails(busId: number) {
    this.isLoading.set(true);
    this.busService.getBusById(busId).subscribe({
      next: (bus) => {
        this.busDetails.set(bus);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load bus details:', err);
        this.isLoading.set(false);
        alert('Failed to load bus details');
        this.router.navigate(['/search']);
      }
    });
  }
  
  validateForm(): boolean {
    if (!this.passengerData.name || this.passengerData.name.trim().length < 2) {
      alert('Please enter a valid name');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.passengerData.email || !emailRegex.test(this.passengerData.email)) {
      alert('Please enter a valid email');
      return false;
    }
    
    const phoneRegex = /^\d{10}$/;
    if (!this.passengerData.phone || !phoneRegex.test(this.passengerData.phone)) {
      alert('Please enter valid 10-digit phone number');
      return false;
    }
    
    const age = Number(this.passengerData.age);
    if (!this.passengerData.age || isNaN(age) || age < 1 || age > 120) {
      alert('Please enter valid age (1-120)');
      return false;
    }
    
    return true;
  }
  
  confirmBooking() {
    console.log('=== CONFIRM BOOKING STARTED ===');
    
    if (!this.validateForm()) {
      console.log('Validation failed');
      return;
    }
    
    console.log('Validation passed');
    this.isLoading.set(true);
    
    const bookingData: any = {
      id: Date.now(),
      bookingId: 'BK' + Date.now(),
      busId: this.busDetails()!.id,
      busName: this.busDetails()!.busName,
      busNumber: this.busDetails()!.busNumber,
      from: this.busDetails()!.from,
      to: this.busDetails()!.to,
      departureTime: this.busDetails()!.departureTime,
      arrivalTime: this.busDetails()!.arrivalTime,
      seatNumbers: this.selectedSeats(),
      passengerName: this.passengerData.name,
      passengerEmail: this.passengerData.email,
      passengerPhone: this.passengerData.phone,
      passengerAge: this.passengerData.age,
      passengerGender: this.passengerData.gender,
      totalAmount: this.totalAmount(),
      bookingDate: new Date().toISOString(),
      status: 'Confirmed'
    };
    
    console.log('Booking data prepared:', bookingData);
    
    // ✅ Save to localStorage
    this.saveBookingToLocalStorage(bookingData);
    
    // Also save to json-server
    this.busService.bookTicket(bookingData).subscribe({
      next: (response) => {
        console.log('API save response:', response);
        this.isLoading.set(false);
        this.bookingSuccess.set(true);
        this.isBooked.set(true);
        this.bookingId.set(bookingData.id);
        
        setTimeout(() => {
          this.resetAndGoHome();
        }, 5000);
      },
      error: (err) => {
        console.error('Booking failed:', err);
        this.isLoading.set(false);
        alert('Booking failed. Please try again.');
      }
    });
  }
  
  // ✅ Updated saveBookingToLocalStorage with debug
  saveBookingToLocalStorage(booking: any) {
    console.log('=== SAVE TO LOCALSTORAGE STARTED ===');
    console.log('Booking to save:', booking);
    
    try {
      // Get existing bookings
      let existingBookings = localStorage.getItem('myBookings');
      console.log('Existing bookings string:', existingBookings);
      
      let bookings = existingBookings ? JSON.parse(existingBookings) : [];
      console.log('Existing bookings array:', bookings);
      
      // Add new booking at beginning
      bookings.unshift(booking);
      console.log('Bookings after adding:', bookings);
      
      // Save back to localStorage
      localStorage.setItem('myBookings', JSON.stringify(bookings));
      
      // Verify save
      const saved = localStorage.getItem('myBookings');
      console.log('Verified saved data:', saved);
      
      // Show success message
      alert('✅ Booking saved successfully! Check My Bookings page.');
      
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      alert('❌ Failed to save booking!');
    }
  }
  
  resetAndGoHome() {
    this.bookingSuccess.set(false);
    this.isBooked.set(false);
    this.router.navigate(['/search']);
  }
  
  goBack() {
    this.router.navigate(['/seats', this.busDetails()?.id]);
  }
  
  printTicket() {
    window.print();
  }
}