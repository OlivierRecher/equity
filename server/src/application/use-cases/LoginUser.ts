import { compareSync } from 'bcryptjs';
import type { IUserRepository } from '../../domain/ports/IUserRepository.js';
import type { IGroupRepository } from '../../domain/ports/IGroupRepository.js';
import { DomainError } from '../../domain/errors/DomainError.js';
import type { LoginInputDTO, AuthResponseDTO } from '../dtos/AuthDTO.js';

const INVALID_CREDENTIALS = 'Email ou mot de passe incorrect';

/**
 * Use Case: LoginUser
 *
 * 1. Find user by email
 * 2. Compare password hash
 * 3. Find user's first group membership
 * 4. Return auth response
 */
export class LoginUser {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly groupRepository: IGroupRepository,
    ) { }

    async execute(input: LoginInputDTO): Promise<AuthResponseDTO> {
        const { email, password } = input;

        // 1. Find user
        const user = await this.userRepository.findByEmail(email);
        if (!user || !user.passwordHash || !compareSync(password, user.passwordHash)) {
            throw new DomainError(INVALID_CREDENTIALS);
        }

        // 3. Get first group membership
        const groupId = await this.groupRepository.findFirstGroupIdByUserId(user.id);

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            groupId,
        };
    }
}
