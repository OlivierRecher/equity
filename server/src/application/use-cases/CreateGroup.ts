import { randomUUID } from 'node:crypto';
import type { IGroupRepository } from '../../domain/ports/IGroupRepository.js';
import type { ICatalogRepository } from '../../domain/ports/ICatalogRepository.js';

// ─────────────────────────────────────────────────
// Template definitions
// ─────────────────────────────────────────────────

const TEMPLATES: Record<string, Array<{ name: string; defaultValue: number; icon: string }>> = {
    coloc: [
        { name: 'Vaisselle', defaultValue: 10, icon: '🍽️' },
        { name: 'Poubelles', defaultValue: 5, icon: '🗑️' },
        { name: 'Ménage', defaultValue: 20, icon: '🧹' },
        { name: 'Courses', defaultValue: 15, icon: '🛒' },
        { name: 'Lessive', defaultValue: 10, icon: '👕' },
    ],
    family: [
        { name: 'Repas', defaultValue: 15, icon: '🍳' },
        { name: 'Courses', defaultValue: 20, icon: '🛒' },
        { name: 'Ménage', defaultValue: 15, icon: '🧹' },
        { name: 'Jardinage', defaultValue: 10, icon: '🌱' },
        { name: 'Bricolage', defaultValue: 20, icon: '🔧' },
    ],
};

// ─────────────────────────────────────────────────
// Input / Output types
// ─────────────────────────────────────────────────

export interface CreateGroupInput {
    name: string;
    template?: 'coloc' | 'family' | 'custom';
    userId: string;
}

export interface CreateGroupOutput {
    id: string;
    name: string;
    code: string;
}

/**
 * Use Case: CreateGroup
 *
 * 1. Generate unique invite code
 * 2. Create group
 * 3. Add creator as ADMIN
 * 4. Seed catalog from template
 */
export class CreateGroup {
    constructor(
        private readonly groupRepository: IGroupRepository,
        private readonly catalogRepository: ICatalogRepository,
    ) { }

    async execute(input: CreateGroupInput): Promise<CreateGroupOutput> {
        const { name, template, userId } = input;

        // Generate a random 6-char invite code
        const code = randomUUID().slice(0, 6).toUpperCase();

        // 1. Create group
        const group = await this.groupRepository.create({ name, code });

        // 2. Add creator as ADMIN
        await this.groupRepository.addMember(group.id, userId, 'ADMIN');

        // 3. Seed catalog from template
        const templateItems = TEMPLATES[template ?? ''] ?? [];
        for (const item of templateItems) {
            await this.catalogRepository.create({
                ...item,
                groupId: group.id,
            });
        }

        return { id: group.id, name: group.name, code: group.code };
    }
}
