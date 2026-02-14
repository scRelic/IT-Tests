import { getQuery, createError, defineEventHandler } from "h3";
import db from "../../../utils/db";

export default defineEventHandler(async (event) => {
    try {
        const { page, limit, search, sortBy, sortDir, role } = getQuery(event);

        const pageSize = Math.min(100, Math.max(1, Number(limit) || 10));
        const currentPage = Math.max(1, Number(page) || 1);
        const offset = (currentPage - 1) * pageSize;

        const searchValue = typeof search === "string" ? search.trim() : "";
        const hasSearch = searchValue.length > 0;
        const searchLike = `%${searchValue}%`;

        const roleValue = typeof role === "string" ? role.trim() : "";
        const allowedRoles = new Set(["admin", "user", "banned"]);
        const roleFilter = allowedRoles.has(roleValue) ? roleValue : "";
        const hasRole = roleFilter.length > 0;

        const sortByValue = typeof sortBy === "string" ? sortBy.trim() : "";
        const sortDirValue = typeof sortDir === "string" ? sortDir.trim().toLowerCase() : "";
        const direction = sortDirValue === "asc" ? "ASC" : "DESC";

        let orderBySql = `id ${direction}`;

        if (sortByValue === "created_at") {
            orderBySql = `created_at ${direction} NULLS LAST`;
        }
        else if (sortByValue === "last_visit_date") {
            orderBySql = `last_visit_date ${direction} NULLS LAST`;
        }
        else if (sortByValue === "level") {
            orderBySql = `(
                CASE level
                    WHEN 'Trainee' THEN 1
                    WHEN 'Junior' THEN 2
                    WHEN 'Middle' THEN 3
                    WHEN 'Senior' THEN 4
                    WHEN 'Lead' THEN 5
                    ELSE 0
                END
            ) ${direction}, exp ${direction} NULLS LAST, id DESC`;
        }

        const whereParts: string[] = [];
        const whereParams: any[] = [];

        if (hasSearch) {
            whereParams.push(searchLike);
            const idx = whereParams.length;
            whereParts.push(`(name ILIKE $${idx} OR email ILIKE $${idx})`);
        }

        if (hasRole) {
            whereParams.push(roleFilter);
            const idx = whereParams.length;
            whereParts.push(`role = $${idx}`);
        }

        const whereSql = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

        const totalQuery = `SELECT COUNT(*)::int AS count FROM users ${whereSql};`;

        const limitIdx = whereParams.length + 1;
        const offsetIdx = whereParams.length + 2;

        const usersQuery = `SELECT id, name, email, avatar_url, created_at, last_visit_date, role, level, exp, current_streak
         FROM users
         ${whereSql}
         ORDER BY ${orderBySql}
         LIMIT $${limitIdx} OFFSET $${offsetIdx};`;


        const [totalResult, usersResult] = await Promise.all([
            db.query(totalQuery, whereParams),
            db.query(usersQuery, [...whereParams, pageSize, offset])
        ]);

        const total = Number(totalResult.rows?.[0]?.count ?? 0);

        return {
            users: usersResult.rows,
            total,
            page: currentPage,
            limit: pageSize,
        };
    } catch (error: any) {
        if (error.statusCode) throw error;

        console.error("Error fetching admin users:", error);
        throw createError({
            statusCode: 500,
            statusMessage: "Internal Server Error"
        });
    }
});