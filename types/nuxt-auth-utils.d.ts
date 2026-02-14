import { UserRole } from "../shared/types/user";

declare module "nuxt-auth-utils" {
    interface User {
        id: number;
        name: string;
        role: UserRole;
    }
}
