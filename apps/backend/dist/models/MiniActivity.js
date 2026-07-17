"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniActivity = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
// A per-lesson interactive exercise. `config` is a JSONB blob whose shape depends on `type`
// (quiz options+correctIndex, fill_blank answers, code_challenge language+testCases). The
// grading service owns the config/answer type definitions.
class MiniActivity extends sequelize_1.Model {
}
exports.MiniActivity = MiniActivity;
MiniActivity.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    lessonId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'lessons', key: 'id' },
    },
    type: {
        type: sequelize_1.DataTypes.ENUM('quiz', 'code_challenge', 'fill_blank', 'debug'),
        allowNull: false,
    },
    prompt: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    position: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    config: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: database_1.sequelize,
    modelName: 'MiniActivity',
    tableName: 'mini_activities',
});
//# sourceMappingURL=MiniActivity.js.map