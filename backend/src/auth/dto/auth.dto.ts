import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from 'class-validator';
export class RegisterDto { @IsString() @IsNotEmpty() name!: string; @IsEmail() email!: string; @IsString() @MinLength(6) password!: string; }
export class LoginDto { @IsEmail() email!: string; @IsString() @IsNotEmpty() password!: string; }
export class SignupOtpRequestDto { @IsString() @IsNotEmpty() name!: string; @IsEmail() email!: string; @IsString() @MinLength(6) password!: string; }
export class SignupOtpVerifyDto { @IsEmail() email!: string; @IsString() @Length(6, 6) otp!: string; }
