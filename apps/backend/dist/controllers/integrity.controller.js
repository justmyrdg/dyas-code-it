"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClassIntegrityReport = getClassIntegrityReport;
const models_1 = require("../models");
const similarity_service_1 = require("../services/similarity.service");
const http_1 = require("../utils/http");
function codeAnswers(answers) {
    const result = new Map();
    if (!Array.isArray(answers))
        return result;
    answers.forEach((answer, index) => {
        const source = answer?.source;
        if (typeof source === 'string' && source.trim()) {
            result.set(index, source);
        }
    });
    return result;
}
// On-demand integrity report for one class: pairwise code-similarity across the
// latest submission per student per assessment, plus behavioral flags from the
// client-captured metadata. Dyas usage is deliberately NOT an input here.
async function getClassIntegrityReport(req, res, next) {
    try {
        const klass = await models_1.Class.findByPk(req.params.classId);
        if (!klass || klass.teacherId !== req.user.sub) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Class not found.');
            return;
        }
        const submissions = await models_1.AssessmentSubmission.findAll({
            where: { classId: klass.id },
            order: [['attemptNumber', 'ASC']],
        });
        if (!submissions.length) {
            res.json({ similarityFlags: [], behaviorFlags: [] });
            return;
        }
        const students = await models_1.User.findAll({
            where: { id: [...new Set(submissions.map((s) => s.studentId))] },
            attributes: ['id', 'name'],
        });
        const studentName = new Map(students.map((s) => [s.id, s.name]));
        const assessments = await models_1.ChapterAssessment.findAll({
            where: { id: [...new Set(submissions.map((s) => s.assessmentId))] },
            attributes: ['id', 'title'],
        });
        const assessmentTitle = new Map(assessments.map((a) => [a.id, a.title]));
        // Latest attempt per (student, assessment).
        const latest = new Map();
        for (const submission of submissions) {
            latest.set(`${submission.studentId}:${submission.assessmentId}`, submission);
        }
        const byAssessment = new Map();
        for (const submission of latest.values()) {
            const list = byAssessment.get(submission.assessmentId) ?? [];
            list.push(submission);
            byAssessment.set(submission.assessmentId, list);
        }
        const similarityFlags = [];
        const behaviorFlagList = [];
        for (const [assessmentId, subs] of byAssessment) {
            // Behavioral flags per submission.
            for (const submission of subs) {
                const flags = (0, similarity_service_1.behavioralFlags)(submission.integrity);
                if (flags.length) {
                    behaviorFlagList.push({
                        assessmentId,
                        assessmentTitle: assessmentTitle.get(assessmentId) ?? 'Assessment',
                        student: {
                            id: submission.studentId,
                            name: studentName.get(submission.studentId) ?? 'Unknown',
                        },
                        submissionId: submission.id,
                        flags,
                    });
                }
            }
            // Pairwise code similarity per question.
            for (let i = 0; i < subs.length; i++) {
                const answersA = codeAnswers(subs[i].answers);
                for (let j = i + 1; j < subs.length; j++) {
                    const answersB = codeAnswers(subs[j].answers);
                    for (const [questionIndex, codeA] of answersA) {
                        const codeB = answersB.get(questionIndex);
                        if (!codeB)
                            continue;
                        const { similar, score } = (0, similarity_service_1.isSuspiciouslySimilar)(codeA, codeB);
                        if (similar) {
                            similarityFlags.push({
                                assessmentId,
                                assessmentTitle: assessmentTitle.get(assessmentId) ?? 'Assessment',
                                questionIndex,
                                studentA: { id: subs[i].studentId, name: studentName.get(subs[i].studentId) ?? 'Unknown' },
                                studentB: { id: subs[j].studentId, name: studentName.get(subs[j].studentId) ?? 'Unknown' },
                                similarity: Math.round(score * 100) / 100,
                            });
                        }
                    }
                }
            }
        }
        similarityFlags.sort((a, b) => b.similarity - a.similarity);
        res.json({ similarityFlags, behaviorFlags: behaviorFlagList });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=integrity.controller.js.map