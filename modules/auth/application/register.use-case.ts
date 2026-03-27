import type { RegisterCredentials } from '../domain/auth.entity';
import type { AuthPort } from '../domain/auth.port';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export class RegisterUseCase {
  constructor(private readonly authPort: AuthPort) {}

  async execute(credentials: RegisterCredentials): Promise<void> {
    if (!credentials.firstName.trim()) {
      throw new Error('El nombre es requerido');
    }
    if (!credentials.lastName.trim()) {
      throw new Error('El apellido es requerido');
    }
    if (!credentials.email.trim()) {
      throw new Error('El email es requerido');
    }
    if (!EMAIL_REGEX.test(credentials.email)) {
      throw new Error('El formato del email no es válido');
    }
    if (!credentials.password.trim()) {
      throw new Error('La contraseña es requerida');
    }
    if (credentials.password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(
        `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
      );
    }
    await this.authPort.register(credentials);
  }
}
