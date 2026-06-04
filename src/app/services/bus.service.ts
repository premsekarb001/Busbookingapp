import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Bus {
  id: number;
  busName: string;
  busNumber: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  totalSeats: number;
  availableSeats: number[];
}

export interface Seat {
  seatNumber: number;
  isBooked: boolean;
  isSelected: boolean;
}

export interface Booking {
  id?: number;
  busId: number;
  busName: string;
  seatNumbers: number[];
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  totalAmount: number;
  bookingDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class BusService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000';

  // Search buses by route
  searchBuses(from: string, to: string): Observable<Bus[]> {
    return this.http.get<Bus[]>(`${this.apiUrl}/buses?from=${from}&to=${to}`);
  }

  // Get all buses
  getAllBuses(): Observable<Bus[]> {
    return this.http.get<Bus[]>(`${this.apiUrl}/buses`);
  }

  // Get single bus details
  getBusById(id: number): Observable<Bus> {
    return this.http.get<Bus>(`${this.apiUrl}/buses/${id}`);
  }

  // Get seat layout for a bus
  getSeatLayout(busId: number): Observable<Seat[]> {
    return this.getBusById(busId).pipe(
      map(bus => {
        const seats: Seat[] = [];
        for (let i = 1; i <= bus.totalSeats; i++) {
          seats.push({
            seatNumber: i,
            isBooked: !bus.availableSeats.includes(i),
            isSelected: false
          });
        }
        return seats;
      })
    );
  }

  // Book tickets
  bookTicket(bookingData: Booking): Observable<Booking> {
    bookingData.bookingDate = new Date().toISOString();
    bookingData.id = Date.now();
    
    // Update bus available seats
    this.getBusById(bookingData.busId).subscribe(bus => {
      const updatedAvailableSeats = bus.availableSeats.filter(
        seat => !bookingData.seatNumbers.includes(seat)
      );
      
      this.http.patch(`${this.apiUrl}/buses/${bookingData.busId}`, {
        availableSeats: updatedAvailableSeats
      }).subscribe();
    });
    
    return this.http.post<Booking>(`${this.apiUrl}/bookings`, bookingData);
  }

  // Get bookings by email
  getBookingsByEmail(email: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/bookings?passengerEmail=${email}`);
  }

  // Get all bookings
  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/bookings`);
  }
}