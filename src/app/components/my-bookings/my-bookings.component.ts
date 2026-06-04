import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css']
})
export class MyBookingsComponent implements OnInit {
  private router = inject(Router);
  
  bookings = signal<any[]>([]);
  isLoading = signal(true);
  
  ngOnInit() {
    this.loadBookings();
  }
  
  loadBookings() {
    this.isLoading.set(true);
    
    console.log('=== MY BOOKINGS DEBUG ===');
    console.log('localStorage key "myBookings":', localStorage.getItem('myBookings'));
    
    const storedBookings = localStorage.getItem('myBookings');
    
    if (storedBookings) {
      const parsedBookings = JSON.parse(storedBookings);
      console.log('Parsed bookings:', parsedBookings);
      console.log('Number of bookings:', parsedBookings.length);
      this.bookings.set(parsedBookings);
    } else {
      console.log('No bookings found in localStorage');
      this.bookings.set([]);
    }
    
    this.isLoading.set(false);
  }
  
  // Add test booking
  addDummyBooking() {
    const dummyBooking = {
      id: Date.now(),
      bookingId: 'TEST' + Date.now(),
      busName: 'KPN Travels',
      busNumber: 'TN-01-AB-1234',
      from: 'Chennai',
      to: 'Coimbatore',
      departureTime: '06:00 AM',
      arrivalTime: '01:00 PM',
      seatNumbers: [5, 6, 7],
      passengerName: 'Test User',
      passengerEmail: 'test@example.com',
      passengerPhone: '9876543210',
      totalAmount: 2550,
      bookingDate: new Date().toISOString(),
      status: 'Confirmed'
    };
    
    let bookings = JSON.parse(localStorage.getItem('myBookings') || '[]');
    bookings.unshift(dummyBooking);
    localStorage.setItem('myBookings', JSON.stringify(bookings));
    
    console.log('Dummy booking added!');
    this.loadBookings(); // Refresh
    alert('Test booking added! Check your bookings list.');
  }
  
  viewBookingDetails(booking: any) {
    alert('Booking Details:\n' + 
      'ID: ' + booking.bookingId + '\n' +
      'Bus: ' + booking.busName + '\n' +
      'From: ' + booking.from + ' → ' + booking.to + '\n' +
      'Seats: ' + booking.seatNumbers.join(', ') + '\n' +
      'Passenger: ' + booking.passengerName + '\n' +
      'Total: ₹' + booking.totalAmount);
  }
  
  cancelBooking(bookingId: number) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      let bookings = JSON.parse(localStorage.getItem('myBookings') || '[]');
      bookings = bookings.filter((b: any) => b.id !== bookingId);
      localStorage.setItem('myBookings', JSON.stringify(bookings));
      this.loadBookings();
      alert('Booking cancelled successfully!');
    }
  }
  
  downloadTicket(booking: any) {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(this.getTicketHTML(booking));
      printWindow.print();
    }
  }
  
  getTicketHTML(booking: any): string {
    return `
      <html>
        <head><title>Ticket - ${booking.bookingId}</title></head>
        <body style="font-family: Arial; padding: 20px;">
          <h1 style="color: #4CAF50;">Bus Ticket</h1>
          <hr>
          <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
          <p><strong>Bus:</strong> ${booking.busName} (${booking.busNumber})</p>
          <p><strong>From:</strong> ${booking.from} → ${booking.to}</p>
          <p><strong>Departure:</strong> ${booking.departureTime}</p>
          <p><strong>Arrival:</strong> ${booking.arrivalTime}</p>
          <p><strong>Seats:</strong> ${booking.seatNumbers.join(', ')}</p>
          <p><strong>Passenger:</strong> ${booking.passengerName}</p>
          <p><strong>Phone:</strong> ${booking.passengerPhone}</p>
          <p><strong>Total Amount:</strong> ₹${booking.totalAmount}</p>
          <hr>
          <p>Thank you for booking with us!</p>
        </body>
      </html>
    `;
  }
  
  goBack() {
    this.router.navigate(['/search']);
  }
}