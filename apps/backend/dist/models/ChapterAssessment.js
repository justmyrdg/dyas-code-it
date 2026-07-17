"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChapterAssessment = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
// A chapter's final evaluation. `questions` is a JSONB array of typed questions (mcq / code /
// short_answer). mcq and code are auto-graded; short_answer requires teacher review.
class ChapterAssessment extends sequelize_1.Model {
}
exports.ChapterAssessment = ChapterAssessment;
ChapterAssessment.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    chapterId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'chapters', key: 'id' },
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    passingScore: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 70,
    },
    retryCooldownHours: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 24,
    },
    questions: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: database_1.sequelize,
    modelName: 'ChapterAssessment',
    tableName: 'chapter_assessments',
});
//# sourceMappingURL=ChapterAssessment.js.map