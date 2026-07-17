import { User } from './User';
import { Topic } from './Topic';
import { Chapter } from './Chapter';
import { Lesson } from './Lesson';
import { Class } from './Class';
import { ClassEnrollment } from './ClassEnrollment';
import { StudentProgress } from './StudentProgress';
import { MiniActivity } from './MiniActivity';
import { ActivitySubmission } from './ActivitySubmission';
import { ChapterAssessment } from './ChapterAssessment';
import { AssessmentSubmission } from './AssessmentSubmission';
import { CodingChallenge } from './CodingChallenge';
import { PracticeProject } from './PracticeProject';
import { ProjectVersion } from './ProjectVersion';
import { StudentChallengeProgress } from './StudentChallengeProgress';
import { Certificate } from './Certificate';
import { DyasConversation } from './DyasConversation';
import { TeacherSubscription } from './TeacherSubscription';

// All associations live here so individual model files never import each other.

Topic.hasMany(Chapter, { as: 'chapters', foreignKey: 'topicId', onDelete: 'CASCADE' });
Chapter.belongsTo(Topic, { as: 'topic', foreignKey: 'topicId' });

Chapter.hasMany(Lesson, { as: 'lessons', foreignKey: 'chapterId', onDelete: 'CASCADE' });
Lesson.belongsTo(Chapter, { as: 'chapter', foreignKey: 'chapterId' });

Topic.hasMany(Class, { as: 'classes', foreignKey: 'topicId' });
Class.belongsTo(Topic, { as: 'topic', foreignKey: 'topicId' });
User.hasMany(Class, { as: 'taughtClasses', foreignKey: 'teacherId' });
Class.belongsTo(User, { as: 'teacher', foreignKey: 'teacherId' });

Class.hasMany(ClassEnrollment, { as: 'enrollments', foreignKey: 'classId', onDelete: 'CASCADE' });
ClassEnrollment.belongsTo(Class, { as: 'class', foreignKey: 'classId' });
ClassEnrollment.belongsTo(User, { as: 'student', foreignKey: 'studentId' });

StudentProgress.belongsTo(Class, { as: 'class', foreignKey: 'classId' });
StudentProgress.belongsTo(Lesson, { as: 'lesson', foreignKey: 'lessonId' });
StudentProgress.belongsTo(User, { as: 'student', foreignKey: 'studentId' });

Lesson.hasMany(MiniActivity, { as: 'activities', foreignKey: 'lessonId', onDelete: 'CASCADE' });
MiniActivity.belongsTo(Lesson, { as: 'lesson', foreignKey: 'lessonId' });

MiniActivity.hasMany(ActivitySubmission, { as: 'submissions', foreignKey: 'activityId', onDelete: 'CASCADE' });
ActivitySubmission.belongsTo(MiniActivity, { as: 'activity', foreignKey: 'activityId' });
ActivitySubmission.belongsTo(Class, { as: 'class', foreignKey: 'classId' });
ActivitySubmission.belongsTo(User, { as: 'student', foreignKey: 'studentId' });

Chapter.hasMany(ChapterAssessment, { as: 'assessments', foreignKey: 'chapterId', onDelete: 'CASCADE' });
ChapterAssessment.belongsTo(Chapter, { as: 'chapter', foreignKey: 'chapterId' });

ChapterAssessment.hasMany(AssessmentSubmission, { as: 'submissions', foreignKey: 'assessmentId', onDelete: 'CASCADE' });
AssessmentSubmission.belongsTo(ChapterAssessment, { as: 'assessment', foreignKey: 'assessmentId' });
AssessmentSubmission.belongsTo(Class, { as: 'class', foreignKey: 'classId' });
AssessmentSubmission.belongsTo(User, { as: 'student', foreignKey: 'studentId' });

User.hasMany(PracticeProject, { as: 'practiceProjects', foreignKey: 'studentId' });
PracticeProject.belongsTo(User, { as: 'student', foreignKey: 'studentId' });
PracticeProject.belongsTo(CodingChallenge, { as: 'challenge', foreignKey: 'challengeId' });

PracticeProject.hasMany(ProjectVersion, { as: 'versions', foreignKey: 'projectId', onDelete: 'CASCADE' });
ProjectVersion.belongsTo(PracticeProject, { as: 'project', foreignKey: 'projectId' });

CodingChallenge.hasMany(StudentChallengeProgress, { as: 'progress', foreignKey: 'challengeId', onDelete: 'CASCADE' });
StudentChallengeProgress.belongsTo(CodingChallenge, { as: 'challenge', foreignKey: 'challengeId' });
StudentChallengeProgress.belongsTo(PracticeProject, { as: 'project', foreignKey: 'projectId' });
StudentChallengeProgress.belongsTo(User, { as: 'student', foreignKey: 'studentId' });

Certificate.belongsTo(User, { as: 'student', foreignKey: 'studentId' });
Certificate.belongsTo(Class, { as: 'class', foreignKey: 'classId' });
Certificate.belongsTo(Topic, { as: 'topic', foreignKey: 'topicId' });

DyasConversation.belongsTo(User, { as: 'student', foreignKey: 'studentId' });

User.hasOne(TeacherSubscription, { as: 'subscription', foreignKey: 'teacherId' });
TeacherSubscription.belongsTo(User, { as: 'teacher', foreignKey: 'teacherId' });

export {
  User,
  Topic,
  Chapter,
  Lesson,
  Class,
  ClassEnrollment,
  StudentProgress,
  MiniActivity,
  ActivitySubmission,
  ChapterAssessment,
  AssessmentSubmission,
  CodingChallenge,
  PracticeProject,
  ProjectVersion,
  StudentChallengeProgress,
  Certificate,
  DyasConversation,
  TeacherSubscription,
};
