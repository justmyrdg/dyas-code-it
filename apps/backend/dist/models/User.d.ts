import { Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from 'sequelize';
import type { UserRole } from '../types/auth.types';
export declare class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    id: CreationOptional<string>;
    email: string;
    passwordHash: string | null;
    name: string;
    role: UserRole;
    githubId: string | null;
    googleId: string | null;
    avatarUrl: string | null;
    passwordResetTokenHash: string | null;
    passwordResetExpiresAt: Date | null;
    createdAt: CreationOptional<Date>;
    updatedAt: CreationOptional<Date>;
}
//# sourceMappingURL=User.d.ts.map