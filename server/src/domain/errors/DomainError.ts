export class DomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class TaskValueInvalidError extends DomainError {
    constructor(value: number) {
        super(`Task value must be non-negative, received: ${value}`);
    }
}

export class UserNotFoundError extends DomainError {
    constructor(userId: string) {
        super(`User not found: ${userId}`);
    }
}

export class EntityNotFoundError extends DomainError {
    constructor(entity: string, id: string) {
        super(`${entity} not found with id: ${id}`);
    }
}
