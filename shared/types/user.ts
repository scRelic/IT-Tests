export type User = {
    id: number;
    name: string;
    email: string;
    avatar_url?: string;
    birth_date?: string;
    created_at: string;
    count_completed_tests?: number;
    level: LevelName;
    exp: number;
    last_visit_date: string;
    current_streak: number;
    role: UserRole;
};

export type EditProfileData = {
    name: string;
    email: string;
    birth_date?: string;
    avatar_url?: string;
};


export type LevelName = "Trainee" | "Junior" | "Middle" | "Senior" | "Lead";


export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}
