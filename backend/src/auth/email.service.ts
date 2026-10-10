import { BadGatewayException, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendSignupOtp(email: string, otp: string) {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
      this.logger.warn(`Development signup OTP for ${email}: ${otp}`);
      return;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM?.trim() || 'DocQ <onboarding@resend.dev>',
        to: [email],
        subject: 'Your DocQ AI signup verification code',
        html: `<p>Your DocQ AI signup verification code is:</p><h2>${otp}</h2><p>This code expires in 10 minutes.</p>`,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      this.logger.error(`Resend rejected the email (${response.status}): ${details}`);
      throw new BadGatewayException('Email provider rejected the message. Check the backend logs for details.');
    }
  }
}
