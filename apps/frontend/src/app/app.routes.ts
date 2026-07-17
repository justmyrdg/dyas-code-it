import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/auth.guards';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'forgot-password',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'reset-password',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/reset-password/reset-password').then((m) => m.ResetPassword),
  },
  {
    // OAuth callbacks land here; it redirects to the signed-in user's role area.
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('admin')],
    loadComponent: () => import('./pages/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/admin/topics-list').then((m) => m.TopicsList),
      },
      {
        path: 'topics/:id',
        loadComponent: () => import('./pages/admin/topic-editor').then((m) => m.TopicEditor),
      },
      {
        path: 'challenges',
        loadComponent: () => import('./pages/admin/challenges').then((m) => m.ChallengesPage),
      },
    ],
  },
  {
    path: 'teacher',
    canActivate: [authGuard, roleGuard('teacher')],
    loadComponent: () => import('./pages/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/teacher/classes-list').then((m) => m.ClassesList),
      },
      {
        path: 'classes/:id',
        loadComponent: () => import('./pages/teacher/class-detail').then((m) => m.ClassDetail),
      },
      {
        path: 'projects',
        loadComponent: () => import('./pages/teacher/shared-projects').then((m) => m.SharedProjects),
      },
    ],
  },
  {
    path: 'student',
    canActivate: [authGuard, roleGuard('student')],
    loadComponent: () => import('./pages/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/student/my-classes').then((m) => m.MyClasses),
      },
      {
        path: 'classes/:classId',
        loadComponent: () => import('./pages/student/class-view').then((m) => m.ClassView),
      },
      {
        path: 'classes/:classId/lessons/:lessonId',
        loadComponent: () => import('./pages/student/lesson-viewer').then((m) => m.LessonViewer),
      },
      {
        path: 'classes/:classId/assessments/:assessmentId',
        loadComponent: () => import('./pages/student/assessment').then((m) => m.AssessmentPage),
      },
      {
        path: 'practice',
        loadComponent: () => import('./pages/student/practice').then((m) => m.PracticePage),
      },
      {
        path: 'practice/:projectId',
        loadComponent: () => import('./pages/student/project-editor').then((m) => m.ProjectEditor),
      },
      {
        path: 'certificates/:id',
        loadComponent: () => import('./pages/student/certificate-view').then((m) => m.CertificateView),
      },
    ],
  },
  {
    // Public QR-code target — no auth guard.
    path: 'verify/:code',
    loadComponent: () => import('./pages/verify/verify').then((m) => m.VerifyPage),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
