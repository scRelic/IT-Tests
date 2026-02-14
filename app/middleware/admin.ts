// import { UserRole } from "../../shared/types/user";

// export default defineNuxtRouteMiddleware(() => {
//     const { user } = useUserSession()

//     if (!user.value) return navigateTo("/auth/login");

//     const userRole = String(user.value.role as UserRole.ADMIN).toLocaleLowerCase();
//     const isAdmin = userRole === UserRole.ADMIN;

//     if (!isAdmin) return navigateTo("/");
// });
