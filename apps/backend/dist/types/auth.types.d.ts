export type UserRole = 'student' | 'teacher' | 'admin';
export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatarUrl: string | null;
}
//# sourceMappingURL=auth.types.d.ts.map