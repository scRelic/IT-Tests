export type RegisterCredentials = {
    name: string;
    email: string;
    password: string;
    description?: string;
    birth_date?: string;
};

export type LoginCredentials = {
    email: string;
    password: string;
};

