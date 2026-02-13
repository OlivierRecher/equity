export interface UserProps {
    readonly id: string;
    readonly name: string;
    readonly email: string;
}

export class User {
    readonly id: string;
    readonly name: string;
    readonly email: string;

    constructor(props: UserProps) {
        this.id = props.id;
        this.name = props.name;
        this.email = props.email;
    }
}
