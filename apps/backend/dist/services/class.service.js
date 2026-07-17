"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClassWithCode = createClassWithCode;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const class_code_1 = require("../utils/class-code");
const MAX_CODE_ATTEMPTS = 5;
// The unique constraint on classCode is the source of truth for collisions:
// generate, try to insert, and retry on UniqueConstraintError.
async function createClassWithCode(input) {
    for (let attempt = 1;; attempt++) {
        try {
            return await models_1.Class.create({ ...input, classCode: (0, class_code_1.generateClassCode)() });
        }
        catch (err) {
            if (err instanceof sequelize_1.UniqueConstraintError && attempt < MAX_CODE_ATTEMPTS) {
                continue;
            }
            throw err;
        }
    }
}
//# sourceMappingURL=class.service.js.map