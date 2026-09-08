import { IsEmail, IsString, MinLength } from 'class-validator';

// A DTO (Data Transfer Object) describes the exact shape a request body
// must have. NestJS uses class-validator's decorators here to reject bad
// requests automatically (e.g. a missing email, or a 3-character password)
// BEFORE our own code ever runs — that validation logic doesn't live in
// the controller, it lives here, next to the shape it's validating.
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(1)
  displayName: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}