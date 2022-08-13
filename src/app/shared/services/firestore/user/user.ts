export class User {
    id: string;
    email: string;
    fullname: string;
    profileImage : string;
    hidePaidLists: boolean;
    messagingToken: string;

    constructor(
        id: string,
        email: string,
        fullname: string,
        profileImage : string,
        hidePaidLists: boolean,
        messagingToken: string
        ) {}
}