import { UniqueConstraintError } from 'sequelize';
import { Class } from '../models';
import { generateClassCode } from '../utils/class-code';

const MAX_CODE_ATTEMPTS = 5;

// The unique constraint on classCode is the source of truth for collisions:
// generate, try to insert, and retry on UniqueConstraintError.
export async function createClassWithCode(input: {
  topicId: string;
  teacherId: string;
  name: string;
  schedule: string | null;
}): Promise<Class> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await Class.create({ ...input, classCode: generateClassCode() });
    } catch (err) {
      if (err instanceof UniqueConstraintError && attempt < MAX_CODE_ATTEMPTS) {
        continue;
      }
      throw err;
    }
  }
}
