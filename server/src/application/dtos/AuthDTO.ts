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
    token: string;
}

/**
 * Input DTO for updating user profile
 */
export interface UpdateProfileInputDTO {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
}

/**
 * Output DTO for profile update
 */
export interface UpdateProfileResponseDTO {
    user: {
        id: string;
        name: string;
        email: string;
    };
}
