import nodemailer from 'nodemailer';
import { config } from '../config/env';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface BookingEmailData {
  guestName: string;
  hostName: string;
  hostEmail: string;
  guestEmail: string;
  propertyTitle: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  numberOfGuests: number;
  specialRequests?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (config.email.user && config.email.pass) {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.port === 465,
        auth: {
          user: config.email.user,
          pass: config.email.pass,
        },
      });
    } else {
      console.log('[Email Service] SMTP credentials not configured - emails will be logged only');
    }
  }

  private async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.log('[Email Service] Would send email:');
      console.log(`  To: ${options.to}`);
      console.log(`  Subject: ${options.subject}`);
      return true;
    }

    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      console.log(`[Email Service] Email sent to ${options.to}`);
      return true;
    } catch (error) {
      console.error('[Email Service] Failed to send email:', error);
      return false;
    }
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  }

  async sendNewBookingToHost(data: BookingEmailData): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #FF5A5F;">New Booking Request!</h1>
        <p>Hi ${data.hostName},</p>
        <p>You have received a new booking request for <strong>${data.propertyTitle}</strong>.</p>

        <div style="background-color: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Booking Details</h3>
          <p><strong>Guest:</strong> ${data.guestName}</p>
          <p><strong>Check-in:</strong> ${this.formatDate(data.checkIn)}</p>
          <p><strong>Check-out:</strong> ${this.formatDate(data.checkOut)}</p>
          <p><strong>Guests:</strong> ${data.numberOfGuests}</p>
          <p><strong>Total:</strong> ${this.formatPrice(data.totalPrice)}</p>
          ${data.specialRequests ? `<p><strong>Special Requests:</strong> ${data.specialRequests}</p>` : ''}
        </div>

        <p>Please log in to your dashboard to confirm or reject this booking.</p>

        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This is an automated message from RoomBnB. Please do not reply to this email.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: data.hostEmail,
      subject: `New Booking Request for ${data.propertyTitle}`,
      html,
    });
  }

  async sendBookingConfirmedToGuest(data: BookingEmailData): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #00A699;">Booking Confirmed!</h1>
        <p>Hi ${data.guestName},</p>
        <p>Great news! Your booking for <strong>${data.propertyTitle}</strong> has been confirmed by the host.</p>

        <div style="background-color: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Trip Details</h3>
          <p><strong>Property:</strong> ${data.propertyTitle}</p>
          <p><strong>Host:</strong> ${data.hostName}</p>
          <p><strong>Check-in:</strong> ${this.formatDate(data.checkIn)}</p>
          <p><strong>Check-out:</strong> ${this.formatDate(data.checkOut)}</p>
          <p><strong>Guests:</strong> ${data.numberOfGuests}</p>
          <p><strong>Total Paid:</strong> ${this.formatPrice(data.totalPrice)}</p>
        </div>

        <p>We hope you have a wonderful stay!</p>

        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This is an automated message from RoomBnB. Please do not reply to this email.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: data.guestEmail,
      subject: `Booking Confirmed - ${data.propertyTitle}`,
      html,
    });
  }

  async sendBookingRejectedToGuest(data: BookingEmailData): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #FF5A5F;">Booking Not Approved</h1>
        <p>Hi ${data.guestName},</p>
        <p>Unfortunately, your booking request for <strong>${data.propertyTitle}</strong> was not approved by the host.</p>

        <div style="background-color: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Booking Details</h3>
          <p><strong>Property:</strong> ${data.propertyTitle}</p>
          <p><strong>Check-in:</strong> ${this.formatDate(data.checkIn)}</p>
          <p><strong>Check-out:</strong> ${this.formatDate(data.checkOut)}</p>
        </div>

        <p>Don't worry - there are plenty of other great places to stay. Browse our listings to find your perfect accommodation!</p>

        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This is an automated message from RoomBnB. Please do not reply to this email.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: data.guestEmail,
      subject: `Booking Update - ${data.propertyTitle}`,
      html,
    });
  }

  async sendBookingCancelledToHost(data: BookingEmailData): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #FF5A5F;">Booking Cancelled</h1>
        <p>Hi ${data.hostName},</p>
        <p>A booking for <strong>${data.propertyTitle}</strong> has been cancelled.</p>

        <div style="background-color: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Cancelled Booking Details</h3>
          <p><strong>Guest:</strong> ${data.guestName}</p>
          <p><strong>Check-in:</strong> ${this.formatDate(data.checkIn)}</p>
          <p><strong>Check-out:</strong> ${this.formatDate(data.checkOut)}</p>
        </div>

        <p>The dates are now available for new bookings.</p>

        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This is an automated message from RoomBnB. Please do not reply to this email.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: data.hostEmail,
      subject: `Booking Cancelled - ${data.propertyTitle}`,
      html,
    });
  }

  async sendBookingCancelledToGuest(data: BookingEmailData): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #FF5A5F;">Booking Cancelled</h1>
        <p>Hi ${data.guestName},</p>
        <p>Your booking for <strong>${data.propertyTitle}</strong> has been cancelled.</p>

        <div style="background-color: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Cancelled Booking Details</h3>
          <p><strong>Property:</strong> ${data.propertyTitle}</p>
          <p><strong>Check-in:</strong> ${this.formatDate(data.checkIn)}</p>
          <p><strong>Check-out:</strong> ${this.formatDate(data.checkOut)}</p>
        </div>

        <p>If you have any questions, please contact us.</p>

        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This is an automated message from RoomBnB. Please do not reply to this email.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: data.guestEmail,
      subject: `Booking Cancelled - ${data.propertyTitle}`,
      html,
    });
  }
}

export const emailService = new EmailService();
