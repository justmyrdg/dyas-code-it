import { Class, ClassEnrollment } from '../models';
export type JoinResult = {
    ok: true;
    enrollment: ClassEnrollment;
    class: Class;
} | {
    ok: false;
    status: number;
    code: string;
    message: string;
};
export declare function joinClassByCode(studentId: string, rawCode: string): Promise<JoinResult>;
//# sourceMappingURL=enrollment.service.d.ts.map