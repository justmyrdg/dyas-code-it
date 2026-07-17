import { Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from 'sequelize';
export type ChallengeDifficulty = 'beginner' | 'intermediate' | 'advanced';
export declare class CodingChallenge extends Model<InferAttributes<CodingChallenge>, InferCreationAttributes<CodingChallenge>> {
    id: CreationOptional<string>;
    title: string;
    description: string;
    difficulty: ChallengeDifficulty;
    language: string;
    starterCode: string;
    hints: CreationOptional<string[]>;
    published: CreationOptional<boolean>;
    createdBy: string;
    createdAt: CreationOptional<Date>;
    updatedAt: CreationOptional<Date>;
}
//# sourceMappingURL=CodingChallenge.d.ts.map