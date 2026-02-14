import type { UserRole } from "./user";

declare module "#auth-utils" {
  interface User {
    id: number;
    name: string;
    role: UserRole;
  }
}

export {};
