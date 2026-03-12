import { randomUUID } from 'node:crypto';
import { hashSync } from 'bcryptjs';
import type { IUserRepository } from '../../domain/ports/IUserRepository.js';
import { User } from '../../domain/entities/User.js';
import { DomainError } from '../../domain/errors/DomainError.js';
import type { RegisterInputDTO, AuthResponseDTO } from '../dtos/AuthDTO.js';
import { signToken } from '../../infrastructure/auth/jwt.js';

/**
 * Use Case: RegisterUser
 *
 * 1. Check email uniqueness
 * 2. Hash the password
 * 3. Create user via repository
 * 4. Return auth response (without password hash)
 */
export class RegisterUser {
    constructor(private readonly userRepository: IUserRepository) { }

    async execute(input: RegisterInputDTO): Promise<AuthResponseDTO> {
        const { name, email, password } = input;

        // 0. Validate inputs
        if (!name || name.trim().length === 0 || name.trim().length > 100) {
            throw new DomainError('Le nom est requis (100 caractères max)');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            throw new DomainError('Adresse email invalide');
        }

        if (!password || password.length < 8) {
            throw new DomainError('Le mot de passe doit contenir au moins 8 caractères');
        }
        if (!/[A-Z]/.test(password)) {
            throw new DomainError('Le mot de passe doit contenir au moins une majuscule');
        }
        if (!/[0-9]/.test(password)) {
            throw new DomainError('Le mot de passe doit contenir au moins un chiffre');
        }

        // 1. Check uniqueness
        const existing = await this.userRepository.findByEmail(email.toLowerCase().trim());
        if (existing) {
            throw new DomainError('Un compte avec cet email existe déjà');
        }

        // 2. Hash password
        const passwordHash = hashSync(password, 10);

        // 3. Create domain entity
        const user = new User({
            id: randomUUID(),
            name,
            email,
            passwordHash,
        });

        // 4. Persist
        const savedUser = await this.userRepository.save(user);

        const token = signToken({ userId: savedUser.id, email: savedUser.email });

        return {
            user: {
                id: savedUser.id,
                name: savedUser.name,
                email: savedUser.email,
            },
            groupId: null, // new user has no group yet
            token,
        };
    }
}
