import { Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from 'sequelize';
export type CertificateStatus = 'active' | 'revoked';
export declare class Certificate extends Model<InferAttributes<Certificate>, InferCreationAttributes<Certificate>> {
    id: CreationOptional<string>;
    studentId: string;
    classId: string;
    topicId: string;
    certificateCode: string;
    status: CreationOptional<CertificateStatus>;
    issuedAt: Date;
    createdAt: CreationOptional<Date>;
    updatedAt: CreationOptional<Date>;
}
//# sourceMappingURL=Certificate.d.ts.map