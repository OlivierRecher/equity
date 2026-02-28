/**
 * Input DTO for user registration
 */
export interface RegisterInputDTO {
    name: string;
    email: string;
    password: string;
}

/**
 * Input DTO for user login
 */
export interface LoginInputDTO {
    email: string;
    password: string;
}

/**
 * Output DTO for auth responses (register & login)
 */
export interface AuthResponseDTO {
    user: {
        id: string;
        name: string;
        email: string;
    };
    groupId: string | null;
}
