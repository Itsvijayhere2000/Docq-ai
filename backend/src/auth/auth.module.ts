import { Module } from '@nestjs/common'; import { AuthController } from './auth.controller'; import { AuthService } from './auth.service'; import { JwtAuthGuard } from '../common/jwt-auth.guard'; import { EmailService } from './email.service';
@Module({ controllers: [AuthController], providers: [AuthService, JwtAuthGuard, EmailService], exports: [AuthService] }) export class AuthModule {}
