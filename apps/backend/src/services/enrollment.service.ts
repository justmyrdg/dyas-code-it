import { sequelize } from '../config/database';
import { Class, ClassEnrollment } from '../models';
import { MAX_STUDENTS_PER_CLASS } from '../config/limits';

export type JoinResult =
  | { ok: true; enrollment: ClassEnrollment; class: Class }
  | { ok: false; status: number; code: string; message: string };

export async function joinClassByCode(studentId: string, rawCode: string): Promise<JoinResult> {
  const code = rawCode.toUpperCase().trim();

  return sequelize.transaction(async (t) => {
    // Row lock on the class serializes concurrent joins so the 50-cap holds.
    const klass = await Class.findOne({
      where: { classCode: code },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!klass) {
      return { ok: false, status: 404, code: 'invalid_code', message: 'No class found with that code.' };
    }
    if (!klass.active) {
      return { ok: false, status: 403, code: 'class_closed', message: 'This class is closed to new enrollments.' };
    }

    const existing = await ClassEnrollment.findOne({
      where: { studentId, classId: klass.id },
      transaction: t,
    });
    if (existing) {
      if (existing.status === 'active') {
        return { ok: false, status: 409, code: 'already_enrolled', message: 'You are already enrolled in this class.' };
      }
      // Re-joining after dropping reuses the row (unique index on studentId+classId).
      existing.status = 'active';
      await existing.save({ transaction: t });
      return { ok: true, enrollment: existing, class: klass };
    }

    const activeCount = await ClassEnrollment.count({
      where: { classId: klass.id, status: 'active' },
      transaction: t,
    });
    if (activeCount >= MAX_STUDENTS_PER_CLASS) {
      return { ok: false, status: 403, code: 'class_full', message: 'This class is full.' };
    }

    const enrollment = await ClassEnrollment.create(
      { studentId, classId: klass.id },
      { transaction: t },
    );
    return { ok: true, enrollment, class: klass };
  });
}
