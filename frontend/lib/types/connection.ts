export interface Invitation {
    id: string;
    from_email: string;
    from_name: string | null;
    createdAt: string;
}

export interface Connection {
    connectionId: string;
    partner: {
        email: string;
        name: string;
    } | null;
}
