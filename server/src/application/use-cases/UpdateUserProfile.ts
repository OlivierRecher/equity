import { hashSync, compareSync } from 'bcryptjs';
import type { IUserRepository } from '../../domain/ports/IUserRepository.js';
import { DomainError } from '../../domain/errors/DomainError.js';
import type { UpdateProfileInputDTO, UpdateProfileResponseDTO } from '../dtos/AuthDTO.js';

/**
 * Use Case: UpdateUserProfile
 *
 * Updates name, email, and/or password for the authenticated user.
 * Password change requires providing the current password.
 */
export class UpdateUserProfile {
    constructor(private readonly userRepository: IUserRepository) { }

    async execute(userId: string, input: UpdateProfileInputDTO): Promise<UpdateProfileResponseDTO> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new DomainError('Utilisateur introuvable');
        }

        const updateData: { name?: string; email?: string; passwordHash?: string } = {};

        if (input.name !== undefined) {
            updateData.name = input.name.trim();
        }

        if (input.email !== undefined) {
            const normalizedEmail = input.email.trim().toLowerCase();
            if (normalizedEmail !== user.email) {
                const existing = await this.userRepository.findByEmail(normalizedEmail);
                if (existing) {
                    throw new DomainError('Un compte avec cet email existe déjà');
                }
                updateData.email = normalizedEmail;
            }
        }

        if (input.newPassword) {
            if (!input.currentPassword) {
                throw new DomainError('Le mot de passe actuel est requis');
            }
            if (!user.passwordHash || !compareSync(input.currentPassword, user.passwordHash)) {
                throw new DomainError('Mot de passe actuel incorrect');
            }
            updateData.passwordHash = hashSync(input.newPassword, 10);
        }

        if (Object.keys(updateData).length === 0) {
            return {
                user: { id: user.id, name: user.name, email: user.email },
            };
        }

        const updated = await this.userRepository.update(userId, updateData);

        return {
            user: { id: updated.id, name: updated.name, email: updated.email },
        };
    }
}
