export interface UserProps {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly passwordHash?: string;
}

export class User {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly passwordHash?: string;

    constructor(props: UserProps) {
        this.id = props.id;
        this.name = props.name;
        this.email = props.email;
        this.passwordHash = props.passwordHash;
    }
}
