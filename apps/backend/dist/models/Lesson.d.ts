import { Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from 'sequelize';
export interface CodeExample {
    language: string;
    code: string;
    description: string;
    expectedOutput: string;
}
export declare class Lesson extends Model<InferAttributes<Lesson>, InferCreationAttributes<Lesson>> {
    id: CreationOptional<string>;
    chapterId: string;
    title: string;
    content: string;
    learningObjectives: string | null;
    position: number;
    codeExamples: CreationOptional<CodeExample[]>;
    createdAt: CreationOptional<Date>;
    updatedAt: CreationOptional<Date>;
}
//# sourceMappingURL=Lesson.d.ts.map