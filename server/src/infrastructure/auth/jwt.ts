import jwt from 'jsonwebtoken';

function getSecret(): string {
    const secret = process.env['JWT_SECRET'];
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is required. Set it in your .env file.');
    }
    return secret;
}

const SECRET: string = getSecret();
const EXPIRES_IN = '30d';

interface JwtPayload {
    userId: string;
    email: string;
}

export function signToken(payload: JwtPayload): string {
    return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
    return jwt.verify(token, SECRET) as JwtPayload;
}
