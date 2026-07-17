# Educational Platform Plan

## Classroom Management System with Interactive Code & Assessments

---

## 1. Overview

A comprehensive, subscription-based classroom management platform where:

- **Admins create curriculum**: Topics, chapters, lessons, code examples, mini-activities, and chapter assessments
- **Teachers create classes**: Based on admin-created curriculum topics, generate unique class codes for student enrollment
  - **Free tier**: Create up to 2 classes (50 students max per class)
  - **Premium tier**: Unlimited classes (50 students max per class, higher features)
- **Students join classes**: Use class code to instantly join and access all lessons, activities, and assessments (max 50 per class)
- **Learning happens**: Students complete interactive lessons with runnable code examples, mini-activities per lesson, and chapter assessments
- **Certificates with QR codes**: Students earn verifiable certificates upon completion (QR code links to verification endpoint)
- **Single Sign-On**: Seamless login via GitHub or Google OAuth2
- **Teachers manage**: Track class progress, grade assessments, provide feedback to students

---

## 2. Core Features

### 2.1 Lesson Structure (Created & Managed by Admin)

- **Topic/Course**: High-level subject (e.g., "Python Basics", "Fundamentals of C++")
- **Chapter**: Major section within a topic (e.g., "Chapter 1: Variables & Data Types")
- **Lesson**: Individual units within a chapter (e.g., "Lesson 1.1: Understanding Variables")
  - Lesson content (text, explanations)
  - **Code Examples**: Runnable, executable code snippets
  - **Mini-Activities**: Interactive exercises per lesson (1-3 per lesson)
  - Learning resources (links, notes)

### 2.2 Class Management (Created by Teachers)

- **Teacher creates a Class** based on an existing Admin-created Topic/Course
- Class details:
  - Class name (e.g., "Python Basics - Batch 2024" or "Advanced C++ - Morning Session")
  - Unique alphanumeric class code (e.g., "PY2K24", "CPP-A01")
  - Class schedule/duration (optional)
  - Teacher assigned as class instructor
  - **Maximum 50 students per class** (soft limit with option to close enrollment)
  - Inherits all lessons, chapters, activities, and assessments from the topic
- **Teacher Subscription Model**:
  - **Free Tier**:
    - Create up to 2 classes
    - 50 students per class
    - Access to all curriculum
    - Basic class management
  - **Premium Tier** (monthly/annual subscription):
    - Unlimited classes
    - 50 students per class
    - Advanced analytics
    - Priority support
    - Custom branding (future)
- **Upgrade Flow**:
  - Teacher sees "Create Class" limit reached
  - Prompted to upgrade to Premium
  - Stripe/PayPal payment integration
  - Subscription auto-renews
- **Student Enrollment via Class Code**:
  - Students enter 6-character class code to join
  - Automatic enrollment (no teacher approval needed)
  - **Enrollment limit enforcement**: Class closes at 50 students
  - Student immediately sees all lessons in that class
  - One student can join multiple classes simultaneously
- **Multiple Teachers, Same Curriculum**:
  - Many teachers can create different classes from the same topic
  - Each class has independent student list and progress tracking
  - Same lessons/content, but separate class management

### 2.3 Interactive Code Execution

- Students can **view and run code examples** directly in the lesson
- Code editor with syntax highlighting
- Live execution environment (Python, C++, JavaScript, etc.)
- Output display panel
- "Try it yourself" mode where students can modify and run code

### 2.4 Mini-Activities (Created by Admin)

- **Per-Lesson Activities**: Short coding challenges/quizzes built into each lesson
- Types:
  - Multiple choice questions
  - Code-writing exercises (write and run code)
  - Fill-in-the-blank code snippets
  - Debugging challenges
- Immediate feedback on attempts
- Track completion status per student per class
- Build skills progressively
- Same activities for all classes using this topic

### 2.5 Chapter Assessments (Created by Admin)

- **Final evaluation** for each chapter
- Comprehensive test combining:
  - Multiple choice theory questions
  - Coding problems (write, test, submit)
  - Short answer questions
- **Grading**:
  - Automatic: Multiple choice, code test cases
  - Manual: Open-ended questions (teacher grades per class)
- Pass/fail threshold (typically 70%)
- Retry capability with cooldown
- Teacher sees student submissions and provides feedback

### 2.6 Practice Sandbox & Coding Projects

- **Separate from Curriculum**: Independent coding environment not tied to any topic or class
- **Project-Based Learning**: Students create their own coding projects
- **Guided Challenges** (Optional):
  - "Build a calculator", "Create a to-do app", "Make a snake game"
  - Pre-built starter templates
  - Difficulty levels (Beginner, Intermediate, Advanced)
  - Optional example solutions
- **Features**:
  - Full code editor with syntax highlighting
  - Run code in sandbox environment
  - Multiple programming languages (Python, C++, JavaScript, Java, etc.)
  - Console output and error messages
  - File management (upload/create files)
- **Version Control & History**:
  - Auto-save every 30 seconds (drafts)
  - Snapshots: Student can manually create versions ("v1 - basic structure", "v2 - added functions")
  - View and restore previous versions
  - Visual diff between versions
  - Comments on versions
- **Portfolio Building**:
  - Students showcase their best projects
  - Public/private project visibility
  - Projects can be shared via link
  - Include in resume/portfolio
- **Teacher Monitoring** (Optional):
  - Teachers can view student practice projects (if shared)
  - Leave feedback on projects
  - Suggest improvements (non-graded)
  - See progress on guided challenges

### 2.7 Certificates with QR Code Authenticity

- **Certificate Generation**: Issued when student completes all lessons and passes final assessment
- **QR Code Verification**:
  - Each certificate has unique QR code
  - QR links to verification endpoint: `platform.com/verify/{certificate_id}`
  - Verification page shows:
    - Student name
    - Topic/Course name
    - Completion date
    - Teacher name & class
    - Certificate validity status
- **Tamper-Proof**:
  - Digital signature on certificate
  - Certificate ID is unique and traceable
  - Can be verified even years later
  - Employers/institutions can verify authenticity via QR or manual ID lookup
- **Certificate Features**:
  - PDF download with embedded QR code
  - Shareable link (student can share proof)
  - Certificate printable
  - Cannot be forged (unique hash/signature)

### 2.8 Single Sign-On (SSO)

- **OAuth2 Integration**:
  - GitHub OAuth2
  - Google OAuth2
  - No password management required
  - One-click login
- **Account Linking**:
  - First-time login creates account automatically
  - Subsequent logins authenticate via OAuth provider
  - Can link multiple OAuth accounts to same platform account
- **User Profile Population**:
  - Name, email auto-filled from OAuth provider
  - Profile picture from provider
  - Minimal manual entry required
- **Security**:
  - OAuth tokens stored securely
  - No password storage on platform
  - Compliant with OAuth2 standards

### 2.9 AI Teaching Assistant - "Dyas"

- **24/7 Intelligent Tutoring**: AI-powered assistant available anytime, anywhere
- **Voice & Chat Interface**:
  - Text chat for quick questions
  - Voice input (speech-to-text) for hands-free learning
  - Voice output (text-to-speech) for explanations
- **Context-Aware Learning**:
  - Knows which lesson/activity student is working on
  - Understands student's skill level and learning pace
  - Maintains conversation history for continuity
  - Personalized explanations based on previous interactions
- **Guidance Without Answers** (Ethical AI):
  - Provides hints and guiding questions (Socratic method)
  - Explains concepts and underlying logic
  - Helps debug code without writing the solution
  - Asks "What happens if you...?" to guide thinking
  - Never gives direct answers to assessments
- **Features**:
  - **Code Explanation**: "Explain what this line does"
  - **Debugging Help**: "Why is this error happening?" → Dyas helps diagnose
  - **Concept Teaching**: Re-explain lesson content in different ways
  - **Step-by-Step Guidance**: Break down problem-solving into steps
  - **Error Analysis**: Help student understand what went wrong
  - **Challenge Hints**: Progressive hints for practice challenges
  - **Learning Suggestions**: "You seem to struggle with loops, here's extra practice"
  - **Language Support**: Explain in student's preferred language
- **Availability Across Platform**:
  - Available during lessons
  - Available during mini-activities
  - Available during chapter assessments (tutoring only, not during actual exam)
  - Always available in practice sandbox
  - Accessible from main menu anytime
- **Personality**: Friendly, encouraging, patient, never condescending

### 2.10 Progress & Badges

- **Class-level progress**: Summary for teacher (% of class completed each lesson)
- **Individual student progress**: Lesson completion, activity scores, assessment results
- Lesson completion checkmarks
- Achievement badges for milestones
- Certificate upon course completion (per class, with QR code)

---

## 3. User Roles & Capabilities

### 3.1 Teacher

**Responsibilities**: Create classes, manage students, track progress, grade assessments, manage subscription

**Capabilities**:

- Single Sign-On via GitHub or Google
- View available topics/courses created by admin
- Create a new class from an existing topic (up to 2 free, unlimited with Premium)
- Generate unique class code for student enrollment
- Share class code with students (email, QR code, manual share)
- View all enrolled students in their classes (max 50 per class)
- Monitor class progress (% completion per lesson, student list)
- View individual student progress and performance
- Grade manual/open-ended assessment questions
- Provide feedback on student submissions
- View class analytics (completion rates, average scores per activity)
- Manage class announcements/messages to students
- View lesson content (same access as students)
- Download class reports (grades, progress)
- Archive/close finished classes
- **Subscription Management**:
  - View subscription tier (Free/Premium)
  - View class creation limit status
  - Upgrade to Premium plan
  - Manage billing & payment methods
  - View invoice history
  - Cancel subscription

### 3.2 Student

**Responsibilities**: Join class, learn, complete activities and assessments, practice coding, earn certificates

**Capabilities**:

- Single Sign-On via GitHub or Google
- Enter class code to join a class
- View all lessons in their enrolled classes
- Read lesson content
- Run and modify code examples
- Complete mini-activities with instant feedback
- Submit chapter assessments
- View their grades and teacher feedback
- Track personal progress per class
- **Interact with Dyas AI Teaching Assistant**:
  - Chat with Dyas anytime (text or voice)
  - Get concept explanations
  - Receive debugging hints (without solutions)
  - Ask for step-by-step guidance
  - Request challenge hints
  - Get personalized learning suggestions
  - Access in all learning contexts
- **Practice & Sandbox**:
  - Access unlimited practice coding environment
  - Create new coding projects from scratch
  - Browse guided coding challenges (difficulty levels)
  - Use starter templates for projects
  - Run code in any supported language (Python, C++, JavaScript, Java, etc.)
  - Create snapshots/versions of projects (save progress)
  - View and restore previous versions
  - See visual diffs between versions
  - Share projects with teacher or publicly
  - Build portfolio of projects
  - View example solutions (if provided)
- Earn and download certificates (with QR codes) upon completion
- Verify certificate authenticity via QR code
- Share certificates
- Access learning resources
- View class announcements
- Retry assessments (after cooldown period)
- View certificate history and verification links

### 3.3 Administrator

**Responsibilities**: Create curriculum, manage platform, manage users

**Capabilities**:

- Create topics/courses (e.g., "Python Basics", "C++ Advanced")
- Create chapters within topics
- Create lessons within chapters
- Write lesson content with rich text editor
- Add code examples (multiple languages supported)
- Create mini-activities (quizzes, coding challenges, debugging)
- Design chapter assessments
- Set assessment parameters (passing score, retry policy)
- Manage topic categories and organization
- Manage teacher accounts (create, approve, suspend, delete)
- Manage student accounts (create, verify, disable)
- Monitor platform usage & analytics
- Generate platform-wide reports
- Configure platform settings, grading policies, language support
- Manage system maintenance and updates
- Archive or deprecate old topics/courses
- View all classes and student enrollments across platform

---

## 4. Data Structure

### 4.1 Main Entities

```
Topic (Created by Admin)
├── id
├── name (e.g., "Python Basics")
├── description
├── admin_id
├── created_at
├── updated_at
└── status (draft, published, archived)

Class (Created by Teacher)
├── id
├── topic_id (links to admin-created curriculum)
├── teacher_id
├── name (e.g., "Python Basics - Batch 2024")
├── class_code (unique 6-char code, e.g., "PY2K24")
├── schedule (optional)
├── created_at
├── active (boolean)
└── max_students (optional limit)

Chapter (Created by Admin)
├── id
├── topic_id
├── title (e.g., "Chapter 1: Variables & Data Types")
├── order
└── description

Lesson (Created by Admin)
├── id
├── chapter_id
├── title
├── content (rich text)
├── order
└── learning_objectives

CodeExample (Created by Admin)
├── id
├── lesson_id
├── language (Python, C++, JavaScript, etc.)
├── code
├── description
└── expected_output

MiniActivity (Created by Admin)
├── id
├── lesson_id
├── type (quiz, code_challenge, fill_blank, debug)
├── question_text
├── answer_options / test_cases
├── correct_answer
└── difficulty

ChapterAssessment (Created by Admin)
├── id
├── chapter_id
├── title
├── passing_score
├── retry_cooldown (hours)
└── questions (array)

ClassEnrollment (Students join via class code)
├── id
├── student_id
├── class_id
├── enrolled_date
└── status (active, completed, dropped)

StudentProgress (tracked per class and lesson)
├── id
├── student_id
├── class_id
├── lesson_id
├── completed (boolean)
├── last_accessed
└── time_spent

ActivitySubmission
├── id
├── student_id
├── activity_id
├── class_id
├── attempt_number
├── answer / code_submitted
├── score
├── feedback
└── submitted_at

AssessmentSubmission
├── id
├── student_id
├── assessment_id
├── class_id
├── attempt_number
├── submitted_at
├── score
└── status (pending, graded, passed, failed)

TeacherSubscription
├── id
├── teacher_id
├── tier (free, premium)
├── classes_limit (2 for free, unlimited for premium)
├── max_students_per_class (50 for all tiers)
├── stripe_customer_id
├── stripe_subscription_id
├── status (active, canceled, past_due)
├── created_at
├── renews_at (null for free tier)
└── cancel_at (when cancellation takes effect)

Certificate
├── id
├── student_id
├── class_id
├── topic_id
├── certificate_code (unique identifier)
├── qr_code_url
├── issued_date
├── pdf_url
├── verification_hash (for tamper-proof verification)
└── status (active, revoked)

PracticeProject (Student-created sandbox projects)
├── id
├── student_id
├── title
├── description
├── language (Python, C++, JavaScript, Java, etc.)
├── difficulty (beginner, intermediate, advanced)
├── is_from_challenge (boolean - based on guided challenge or from scratch)
├── challenge_id (optional - if based on admin challenge)
├── visibility (private, shared_with_teacher, public)
├── created_at
├── updated_at
├── current_version_id (latest version)
├── stars (optional - for portfolio showcase)
└── portfolio_featured (boolean)

ProjectVersion
├── id
├── project_id
├── version_number
├── code (complete code at this version)
├── language
├── created_at
├── message (user-provided version message, e.g., "v1 - basic structure")
├── author_id (student_id)
├── is_working (boolean - code runs without errors)
└── execution_output (last run output)

ProjectComparison (For diff/history)
├── id
├── project_id
├── version_a_id
├── version_b_id
├── diff_summary
└── created_at

CodingChallenge (Admin-created optional practice challenges)
├── id
├── title
├── description
├── difficulty (beginner, intermediate, advanced)
├── language
├── starter_code (optional template)
├── problem_statement
├── example_input
├── example_output
├── test_cases (optional - for auto-grading)
├── solution_code (hidden until student gives up)
├── hints (array - progressive)
├── created_by (admin_id)
└── published (boolean)

StudentChallengeProgress (Tracks practice challenge attempts)
├── id
├── student_id
├── challenge_id
├── project_id (linked practice project)
├── attempts (count)
├── completed (boolean)
├── viewed_hints (array of hint indices)
├── viewed_solution (boolean)
├── first_completion_time
└── last_attempt_at

DyasConversation (AI Teaching Assistant interactions)
├── id
├── student_id
├── context_type (lesson, activity, assessment, sandbox, general)
├── context_id (lesson_id or activity_id or project_id, optional)
├── created_at
├── updated_at
├── messages (array - conversation history)
│   ├── role (student or dyas)
│   ├── content (message text)
│   ├── timestamp
│   ├── voice_enabled (boolean - was voice used?)
│   └── helpful (boolean - student feedback)
├── student_skill_level (inferred: beginner, intermediate, advanced)
├── topics_discussed (array of concept names)
└── learning_patterns (object - tracks common questions/struggles)

DyasHintProvided (Track hint requests)
├── id
├── student_id
├── activity_id or challenge_id
├── hint_level (1, 2, 3 - progressive)
├── hint_text
├── provided_at
└── helped (boolean - did hint lead to correct answer?)

DyasLearningProfile (Student-specific AI data)
├── id
├── student_id
├── preferred_explanation_style (code_focused, concept_focused, visual, step_by_step)
├── language_preference (Python, C++, JavaScript, etc.)
├── difficulty_level (auto-detected: beginner, intermediate, advanced)
├── common_mistakes (array of error patterns)
├── topics_needing_help (array of concepts student struggles with)
├── learning_speed (slow, normal, fast)
├── total_dyas_interactions (count)
└── last_updated
```

## 5. Feature Workflow Examples

### 5.1 Admin Creates a Topic/Course

1. Admin logs in to admin dashboard
2. Clicks "Create New Topic"
3. Fills in topic name, description, target audience
4. Creates Chapter 1 with title and description
5. Adds Lesson 1.1 with:
   - Lesson title & content
   - 1-2 code examples (with expected output)
   - 2-3 mini-activities (quizzes, coding challenges)
6. Creates more lessons for the chapter
7. Designs chapter assessment with 10-15 questions
8. Reviews and publishes the topic (now available for teachers)

### 5.2 Teacher Creates a Class

1. Teacher logs in
2. Views available published topics
3. Selects "Python Basics" topic
4. Clicks "Create Class"
5. Fills in:
   - Class name: "Python Basics - Batch 2024"
   - Schedule: "MWF 10am-11am"
   - Auto-generated class code: "PY2K24"
6. Publishes class
7. Shares class code with students via email/poster/QR code

### 5.3 Student Joins a Class

1. Student receives class code "PY2K24" from teacher
2. Logs into platform
3. Clicks "Join Class"
4. Enters class code "PY2K24"
5. Successfully enrolled in "Python Basics - Batch 2024"
6. Can immediately see:
   - All chapters and lessons
   - Progress dashboard
   - Class announcements

### 5.4 Student Learns & Completes a Lesson

1. Student opens "Lesson 1.1: Understanding Variables"
2. Reads lesson content
3. Views first code example → clicks "Run" → sees output
4. Modifies example code and runs it again
5. Completes first mini-activity (gets immediate feedback)
6. Completes second and third mini-activities
7. Marks lesson as complete
8. (Repeat for other lessons)
9. When ready, takes Chapter 1 Assessment
10. Gets score and feedback; if failed, can retry after cooldown (e.g., 3 days)

### 5.5 Grading Flow

- **Automated**: Multiple choice, code execution tests, fill-in-blank
- **Manual Review**: Teacher opens grading dashboard, reviews student submissions for open-ended questions
- **Feedback**: Teacher writes comments on submission
- **Student Notification**: Student sees grade + feedback within 24-48 hours

### 5.6 Student Practices with Coding Challenges

1. Student clicks "Practice" in main navigation
2. Browses available coding challenges (difficulty filter: Beginner/Intermediate/Advanced)
3. Selects "Build a Calculator" (Beginner challenge)
4. Sees problem statement, example input/output
5. Chooses to start with starter code template
6. Project "My Calculator" created, opens in code editor
7. Writes code, runs it, tests with provided examples
8. Saves version 1: "basic operations - add/subtract"
9. Continues coding, adds multiplication/division
10. Saves version 2: "all operations working"
11. Stuck? Clicks "Get Hint" → sees progressive hints
12. Completes the challenge, saves final version
13. Optionally views teacher's solution for comparison
14. Marks challenge as complete

### 5.7 Student Creates Portfolio Project from Scratch

1. Student clicks "New Project" in Practice section
2. Fills in:
   - Project name: "Snake Game"
   - Description: "A simple snake game in Python"
   - Language: Python
   - Visibility: Private (for now)
3. Opens blank code editor or imports starter template
4. Writes code, runs and debugs
5. Auto-saves every 30 seconds (draft versions)
6. Manually creates versions as milestones:
   - v1: "Game grid and snake display"
   - v2: "Keyboard controls working"
   - v3: "Collision detection and score"
   - v4: "Final polish - game over screen"
7. Right-click on v2 vs v3 → "Compare versions" → sees visual diff
8. Shares project with teacher for feedback (visibility: shared_with_teacher)
9. Teacher leaves comments: "Great collision logic! Consider refactoring the input handler."
10. Student updates code, creates v5: "Refactored input handler"
11. When satisfied, makes project public (visibility: public) and adds to portfolio
12. Shares portfolio link with friends/employers

### 5.8 Teacher Reviews Student Practice Projects

1. Teacher receives notification: "Sarah shared project 'Snake Game' with you"
2. Clicks link to view project
3. Sees latest code and version history
4. Hovers over lines to leave inline comments
5. Types comment: "Nice use of list slicing here!"
6. Student sees feedback in real-time
7. Marks project as "reviewed" (non-graded, just feedback)
8. Can view all versions of the project

### 5.9 Student Uses Dyas AI Teaching Assistant

**Scenario 1: Getting Help During a Lesson**

1. Student is in "Lesson 2.3: Loops in Python"
2. Reads about `for` loops but confused about loop variable scope
3. Clicks "Ask Dyas" button in lesson sidebar
4. Asks: "I don't understand why the loop variable is still there after the loop ends"
5. Dyas responds: "Great question! In Python, variables don't disappear after a loop. What do you think would happen if you tried to print the loop variable after the loop?" (Socratic method)
6. Student: "Oh, it would print the last value it had?"
7. Dyas: "Exactly! Try running this code to see..."
8. Dyas provides a small code snippet (not the answer, just scaffolding)
9. Student runs it, understands, continues lesson
10. Dyas adds "loop_scope" to student's learning profile

**Scenario 2: Debugging Code in Practice Sandbox**

1. Student is working on "Build a Calculator" challenge
2. Code runs but gives wrong answer for division
3. Clicks floating Dyas chat button
4. Asks (via voice): "My division is not working correctly"
5. Dyas (voice response): "Let me help! What answer do you get for 10 ÷ 3?"
6. Student: "It gives me 3 instead of 3.333..."
7. Dyas: "Ah! What type of division are you using? There's regular division and integer division in Python. Which one do you want?"
8. Student realizes the issue (using // instead of /)
9. Dyas: "You got it! Now try running your code again"
10. Student fixes it, completes challenge
11. Dyas logs: Student struggled with division operators, needs reinforcement

**Scenario 3: Getting Hints on Mini-Activity**

1. Student is stuck on a coding mini-activity
2. Clicks "Need a hint?" after several failed attempts
3. Dyas provides Level 1 hint: "This problem requires using a conditional statement. Which one would you use?"
4. Student still stuck, clicks "More help"
5. Dyas provides Level 2 hint: "Think about `if-elif-else`. What condition would check if a number is positive?"
6. Student understands, solves it
7. Teacher can see in dashboard: "Student received 2 hints on this activity but eventually solved it" (not penalized, just logged)

**Scenario 4: Personalized Learning Suggestions**

1. After week of work, Dyas analyzes student's DyasLearningProfile
2. Student sees notification: "Dyas noticed you're struggling with functions. Want to practice a challenge specifically on function definitions?"
3. Student clicks "Yes"
4. Dyas recommends 3 beginner challenges focused on functions
5. Student works through them with Dyas guidance
6. Teacher can see progress improvement on function-related activities

---

## 6. Technical Components

### 6.1 Frontend

- **Student Dashboard**: My classes, progress, announcements, practice projects
- **Lesson Viewer**: Content + integrated code editor
- **Code Editor**: Syntax highlighting, execution, output display
- **Activity Interface**: Quiz, coding, debugging modes
- **Assessment Portal**: Timed tests, submission
- **Profile & Progress**: Analytics per class, certificates
- **Practice/Sandbox Interface**:
  - Code editor with full language support
  - Project file management
  - Version history view and restore
  - Version comparison (visual diff)
  - Run/debug console
  - Project sharing and portfolio
  - Guided challenge browser
  - Progressive hints system
  - Solution viewer (optional)
- **Teacher Dashboard**: Classes, class analytics, student list, grading queue, student project reviews
- **Admin Dashboard**: Topic management, user management, platform analytics, challenge management
- **Dyas AI Teaching Assistant Interface**:
  - Floating chat widget (accessible from any page)
  - Voice input/output toggle
  - Conversation history
  - Context-aware suggestions
  - Hint system UI
  - Learning profile insights
  - Personalized recommendations

### 6.2 Backend

- **User Management**:
  - OAuth2 Authentication (GitHub, Google)
  - Automatic account creation on first SSO login
  - Role management (teacher, student, admin)
  - No password storage
- **Course Management**: CRUD for topics, chapters, lessons (admin only)
- **Class Management**: CRUD for classes (teachers), class code generation, enrollment limit enforcement
- **Code Execution Engine**: Sandboxed environment for running code
- **Grading System**: Automatic grading for objective questions + manual review workflow
- **Progress Tracking**: Activity logs, completion states, time tracking
- **Notifications**: Email alerts, in-app notifications
- **Analytics**: Usage reports, performance metrics
- **Student Enrollment**: Class code validation, auto-enrollment, 50-student limit per class
- **Payment Processing**:
  - Stripe/PayPal integration
  - Subscription management (Stripe Billing API)
  - Invoice generation
  - Subscription tier enforcement
- **Certificate Generation**:
  - QR code generation (via QR library)
  - PDF generation with QR embedded
  - Digital signature for authenticity
  - Certificate verification endpoint
- **Audit & Compliance**:
  - Subscription event tracking
  - Certificate issuance logging
  - GDPR compliance (data exports)
- **Practice/Sandbox Management**:
  - Project CRUD (create, read, update, delete)
  - Version control system (auto-save, snapshots, restore)
  - Code diff engine (compare versions)
  - Project sharing permissions
  - Portfolio management
  - Coding challenge management (admin)
  - Progressive hints system
  - Solution storage and access control
  - Challenge progress tracking
  - Auto-grading for challenge test cases (if provided)
- **File Management**:
  - Multi-file project support
  - File upload/download
  - Project export (ZIP)
- **Dyas AI Teaching Assistant**:
  - LLM API integration (Claude, GPT-4, etc.)
  - Conversation management and context preservation
  - Voice-to-text and text-to-voice APIs
  - Learning profile generation and analysis
  - Hint generation engine (progressive levels)
  - Context-aware response generation
  - Safety guardrails (prevent giving direct answers)
  - Conversation history persistence
  - Student skill level inference
  - Personalized recommendation engine
  - Multi-language support
  - Rate limiting and usage tracking

### 6.3 Infrastructure

- Database (PostgreSQL, MongoDB)
- Code execution sandbox (Docker containers, language-specific environments)
- File storage (for assets, resources, certificates)
- CDN for asset delivery
- **OAuth2 Providers**:
  - GitHub OAuth2 integration
  - Google OAuth2 integration
- **Payment Processing**:
  - Stripe (subscription management, payments)
  - Webhook handling for payment events
- **Certificate Generation**:
  - QR code library (python-qrcode, qrcode.js)
  - PDF generation library (ReportLab, pdfkit)
- **Email Service**: SendGrid or AWS SES for notifications
- **Monitoring**: Sentry for error tracking, Datadog for analytics
- Message queue for async grading/certificate generation
- **Dyas AI Services**:
  - LLM Provider: Anthropic Claude API (or OpenAI GPT-4 as fallback)
  - Speech-to-Text: Google Cloud Speech-to-Text or Deepgram
  - Text-to-Speech: Google Cloud Text-to-Speech or Amazon Polly (for voice responses)
  - Conversation caching for reduced API costs
  - Rate limiting to manage API costs

---

## 7. Practice Sandbox & Project-Based Learning Architecture

### 7.1 Key Features

- **Unlimited Practice Projects**: Students can create as many sandbox projects as they want
- **Independent from Curriculum**: Practice projects are separate from class topics/lessons
- **Version Control**: Auto-save drafts + manual versioning for milestones
- **Diff Viewer**: Visual comparison between project versions
- **Multiple Languages**: Support for all languages used in curriculum (Python, C++, JavaScript, Java, etc.)
- **Project Sharing**:
  - Private: Only visible to student
  - Shared with Teacher: Teacher can view and give feedback
  - Public: Shareable link, can be added to portfolio
- **Portfolio Building**: Showcase best projects, share via link or CV
- **Guided Challenges**: Optional admin-created coding challenges with difficulty levels
- **Progressive Hints**: Multi-level hint system (student can ask for help without seeing solution)
- **Solution Viewer**: View instructor's solution after completion (optional)

### 7.2 Practice vs. Assessed Work

| Aspect              | Class Lessons/Assessments        | Practice Sandbox                    |
| ------------------- | -------------------------------- | ----------------------------------- |
| **Grade Impact**    | YES - counted toward final grade | NO - no grades, purely exploratory  |
| **Deadline**        | YES - chapter deadlines apply    | NO - unlimited time                 |
| **Topics**          | Tied to curriculum topic         | Free choice - any programming topic |
| **Visibility**      | Private within class             | Can be public/shared                |
| **Feedback**        | Formal grades + teacher comments | Informal suggestions (if shared)    |
| **Portfolio**       | Certificate only                 | Can showcase projects               |
| **Mistakes**        | Penalized in assessment          | Encouraged - part of learning       |
| **Experimentation** | Limited (following lessons)      | Unlimited (any idea)                |

### 7.3 Use Cases

1. **Exploration**: Student wants to learn Flask (beyond current curriculum) → creates project
2. **Portfolio Building**: Student builds game/app to show employers
3. **Challenge Practice**: Student attempts "Build a Chat App" challenge to practice
4. **Reinforcement**: Student practices Python loops via guided challenges
5. **Collaboration**: Student shares project with teacher for feedback before submitting assessment
6. **Innovation**: Student combines multiple concepts in their own project

### 7.4 Teacher Interaction with Practice Projects

- **Optional Monitoring**: Teachers can optionally check student practice projects (if shared)
- **Non-Graded Feedback**: Teachers provide suggestions and encouragement
- **Mentoring**: Can guide students toward harder challenges
- **Portfolio Review**: Can recommend best projects for portfolio/resume
- **Skill Gap Detection**: Can see where students struggle in practice → adjust lesson content

---

## 8. Implementation Phases

### Phase 1: MVP (Weeks 1-6)

- User authentication (teacher, student, admin)
- Admin interface to create topics, chapters, lessons
- Lesson viewer with rich text content
- Code example display with basic execution
- Teacher dashboard to create classes and share codes
- Student enrollment via class code
- Basic progress tracking

### Phase 2: Mini-Activities & Interactivity (Weeks 7-10)

- Mini-activity system (quizzes, coding challenges)
- Advanced code execution with multiple languages
- Activity submission & automatic grading
- Immediate feedback on activities
- Enhanced UI/UX for lesson viewer

### Phase 3: Assessments & Manual Grading (Weeks 11-14)

- Chapter assessment builder
- Assessment submission interface
- Automatic grading for objective questions
- Manual review & feedback workflow for open-ended questions
- Teacher grading dashboard
- Student feedback display

### Phase 4: Practice Sandbox & Certificates (Weeks 15-18)

- Practice project creation and management
- Version history and diff viewer
- Guided coding challenges library
- Progressive hints system
- Certificate generation with QR codes
- Portfolio feature
- Project sharing

### Phase 5: Dyas AI & Analytics (Weeks 19-24)

- Dyas AI Teaching Assistant integration
  - LLM API setup and configuration
  - Conversation management system
  - Speech-to-text and text-to-speech integration
  - Learning profile generation
  - Hint generation engine
  - Safety guardrails and content filtering
  - Contextual response generation
- Class analytics (enrollment, completion, performance)
- Student analytics (progress, time spent, performance, Dyas interactions)
- Administrator dashboard and reports
- Certificates & badges system
- Performance optimization
- Security hardening

### Phase 6: Advanced Features (Future)

- Discussion forums per class
- Peer review system
- Collaborative coding
- Mobile app
- Video lessons integration
- Learning paths & prerequisites
- Leaderboards & gamification
- Email notifications

---

## 8. Pricing & Business Model

### 8.1 Teacher Subscription Tiers

**Free Tier** (Forever Free)

- Create up to 2 classes
- 50 students per class
- Access to all curriculum topics
- Basic class management & grading
- Community support
- Student enrollment via class code
- Certificate generation with QR codes

**Premium Tier** ($9.99 - $19.99/month or $99.99 - $199.99/year)

- Unlimited classes
- 50 students per class (max)
- All Free tier features plus:
  - Advanced class analytics & reporting
  - Priority email support
  - Custom branding in certificates (future)
  - API access for integrations (future)
  - Bulk certificate export
  - Advanced class messaging

### 8.2 Revenue Model

- **Primary**: Teacher subscriptions (Premium tier)
- **Secondary**: Enterprise licensing (admin/platform customization)
- **Future**: Student premium features (resume building, skill verification)

### 8.3 Enrollment Management

- **Free Teachers**: 2 × 50 students = 100 max students total
- **Premium Teachers**: Unlimited classes × 50 students per class
- Class closes at 50 students (with option to enable waitlist)

### 8.4 Upgrade Flow

1. Teacher creates 2 free classes
2. Clicks "Create Class" for 3rd class → "Upgrade Required" dialog
3. Prompted with Premium benefits
4. Redirected to Stripe checkout
5. Auto-renews monthly/annually
6. Can cancel anytime (no lock-in)

### 8.5 Payment & Billing

- **Stripe Integration** for:
  - Subscription management
  - Invoice generation
  - Payment retry logic
  - Dunning emails for failed payments
- **Billing Portal**:
  - View subscription status
  - Change billing frequency (monthly/annual)
  - Update payment method
  - Download invoices
  - Cancel subscription

---

## 9. Success Metrics

### 9.1 Product Metrics

- **Class Creation**: # of classes created by teachers
- **Enrollment**: # of students per class (average)
- **Completion Rate**: % of students completing a course
- **Mini-Activity Success**: % passing activities on first attempt
- **Assessment Pass Rate**: % of students passing chapter assessments
- **Engagement**: Average time spent per lesson, activity completion rate
- **Retention**: Student return rate, class completion
- **Certificate Issuance**: # of certificates issued, certificate verification rate
- **Platform Stability**: Uptime, code execution success rate

### 9.2 Business Metrics

- **Conversion**: % of free teachers upgrading to Premium
- **Churn Rate**: % of Premium subscribers canceling
- **MRR/ARR**: Monthly/Annual Recurring Revenue
- **ARPU**: Average Revenue Per User (teacher)
- **CAC**: Customer Acquisition Cost
- **LTV**: Lifetime Value per teacher
- **Free-to-Paid Ratio**: Free vs Premium teacher count
- **Class-per-Teacher**: Average classes per teacher (Free vs Premium)

### 9.3 User Satisfaction

- **Teacher Satisfaction**: Ease of creating classes, grading workflow satisfaction
- **Student Satisfaction**: Course ratings, feedback scores, NPS
- **Support Tickets**: Response time, resolution rate

---

## 10. Considerations & Best Practices

### 10.1 Pedagogy

- **Spaced Repetition**: Review key concepts across lessons
- **Active Learning**: Mini-activities every lesson (not just reading)
- **Immediate Feedback**: Instant results on activities
- **Progressive Difficulty**: Build complexity gradually
- **Hands-On Practice**: Real code execution (not just theory)
- **Classroom Continuity**: Each class can have its own pace

### 10.2 Technical Considerations

- **Code Safety**: Sandbox execution; prevent malicious code, resource limits
- **Scalability**: Handle 1000+ concurrent users, multiple classes
- **Language Support**: Start with Python, C++, JavaScript; extensible
- **Performance**: Fast code execution (<2 sec), quick UI response
- **Accessibility**: WCAG compliance, keyboard navigation
- **Class Code Security**: Ensure codes are unique, non-guessable

### 10.3 Content Quality

- **Review Process**: Admin approval before publishing curriculum
- **Version Control**: Track changes to lessons/assessments
- **Reusability**: Same curriculum supports multiple classes
- **Feedback Quality**: Teachers provide constructive feedback
- **Activity Difficulty**: Balanced to support progressive learning

### 10.4 Classroom Management

- **Flexible Enrollment**: Students can join/leave anytime
- **Teacher Control**: Option to limit class size (50 max)
- **Progress Visibility**: Teachers see class-wide and individual progress
- **Grading Flexibility**: Optional deadlines per class (can vary by teacher)

### 10.5 Security & Compliance

- **OAuth2 Security**: Follow OAuth2 standards, no password storage
- **Payment Security**: PCI-DSS compliance via Stripe (we never handle card data)
- **Certificate Authenticity**: Digital signatures, unique hashes
- **Data Privacy**: GDPR compliance, data export functionality
- **Audit Logging**: Track all subscription changes, certificate issuance
- **DDoS Protection**: Use CDN with DDoS mitigation

### 10.6 Subscription Management

- **Graceful Downgrade**: Free teachers who exceed 2 classes downgraded to most recent 2
- **Payment Failures**: Automatic retry, dunning emails, grace period
- **Cancel Policy**: Immediate access loss upon cancellation or non-payment
- **Pro-Rata Billing**: Handle mid-cycle upgrades/downgrades fairly
- **Export on Cancel**: Allow teachers to export class data before access is revoked

---

## 11. Glossary

| Term                   | Definition                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------- |
| **Topic**              | A course or subject created by admin (e.g., "Python Basics")                            |
| **Chapter**            | A major section within a topic                                                          |
| **Lesson**             | An individual unit of instruction within a chapter                                      |
| **Class**              | A classroom instance created by a teacher based on a topic (max 50 students)            |
| **Class Code**         | Unique 6-character code for students to join a class                                    |
| **Code Example**       | Executable code snippet within a lesson                                                 |
| **Mini-Activity**      | Short exercise/quiz within a lesson                                                     |
| **Chapter Assessment** | Final evaluation for a chapter (same for all classes)                                   |
| **Enrollment**         | Student registration for a class via class code                                         |
| **Progress**           | Completion status and performance tracking per student per class                        |
| **Certificate**        | Digital credential with QR code issued upon course completion                           |
| **QR Verification**    | QR code linking to certificate authenticity check                                       |
| **SSO**                | Single Sign-On via GitHub or Google OAuth2                                              |
| **Premium Tier**       | Paid subscription for unlimited classes                                                 |
| **Free Tier**          | Free plan limited to 2 classes per teacher                                              |
| **Dyas**               | AI Teaching Assistant that provides hints, guidance, and personalized learning          |
| **Practice Sandbox**   | Independent coding environment for students to experiment and build projects            |
| **Project Version**    | A saved snapshot of a coding project at a point in time                                 |
| **Learning Profile**   | AI-generated profile tracking student's skill level, preferences, and learning patterns |
| **Socratic Method**    | Teaching technique where AI asks guiding questions instead of giving answers            |

---

## 12. Key Differences from Traditional LMS

| Feature                 | Traditional LMS             | This Platform                                   |
| ----------------------- | --------------------------- | ----------------------------------------------- |
| **Curriculum Creation** | Teachers create             | Admin creates (reusable)                        |
| **Class Creation**      | N/A                         | Teachers create from curriculum                 |
| **Student Enrollment**  | Manual approval or code     | Instant via class code                          |
| **Code Execution**      | No built-in support         | Integrated + sandboxed                          |
| **Lesson Reuse**        | One-time creation           | Shared across multiple classes                  |
| **Scalability**         | Limited                     | High (same curriculum, many classes)            |
| **Teacher Workflow**    | Content creation + teaching | Teaching + classroom management                 |
| **Curriculum Updates**  | Affects all classes         | Single update affects all using classes         |
| **Pricing**             | Usually per-institution     | Per-teacher subscription (flexible)             |
| **Authentication**      | Email/password              | OAuth2 (GitHub, Google)                         |
| **Certificates**        | Simple PDF                  | Verifiable with QR codes                        |
| **Class Size**          | Varies                      | Max 50 students per class                       |
| **AI Tutoring**         | None (or chatbot)           | Dyas AI Teaching Assistant with Socratic method |
| **Practice/Sandbox**    | None                        | Unlimited projects with version control         |
| **Voice Interface**     | None                        | Voice chat with AI tutor                        |

---

## 13. MVP vs. Future Features

### MVP (Phase 1-5, Launch)

- ✅ Admin curriculum creation (topics, chapters, lessons)
- ✅ Teachers create classes from curriculum
- ✅ Student enrollment via class code (max 50 per class)
- ✅ Lesson viewing with code examples
- ✅ Mini-activities with instant feedback
- ✅ Chapter assessments with grading
- ✅ Teacher grading dashboard
- ✅ Student progress tracking
- ✅ Practice sandbox (unlimited projects)
- ✅ Project version history and diff viewer
- ✅ Guided coding challenges (optional)
- ✅ Progressive hints system
- ✅ Portfolio feature
- ✅ Basic certificates with QR codes
- ✅ SSO via GitHub & Google
- ✅ Free/Premium subscription (2 classes free)
- ✅ Stripe payment integration
- ✅ Dyas AI Teaching Assistant
  - Text & voice chat interface
  - Context-aware lesson guidance
  - Hint generation and progressive assistance
  - Student learning profile tracking
  - Personalized recommendations

### Future Features (Post-Launch)

- [ ] Discussion forums per class
- [ ] Peer review system
- [ ] Collaborative coding
- [ ] Mobile app
- [ ] Video lesson integration
- [ ] Learning paths & prerequisites
- [ ] Leaderboards & gamification
- [ ] Resume building from certificates
- [ ] Skill verification marketplace
- [ ] Custom certificate branding
- [ ] API for third-party integrations
- [ ] Advanced analytics & reporting
- [ ] White-label platform
- [ ] Enterprise single sign-on (SAML)

---

## 14. Next Steps

1. **Design Database Schema**: Include subscription, certificate, practice project, and anti-cheating tables
2. **Set up OAuth2**: GitHub and Google developer apps
3. **Integrate Stripe**: Payment processing and subscription management
4. **Build User Authentication**: SSO via GitHub/Google + auto account creation
5. **Create Admin Interface**: Topic, chapter, lesson creation tools + challenge builder
6. **Create Teacher Dashboard**:
   - Class creation with limit enforcement
   - Subscription management UI
   - View subscription status
   - Student project review interface
7. **Build Lesson Viewer**: Content display + code execution engine
8. **Create Student Interface**: Class enrollment via code, lesson access
9. **Implement Mini-Activities**: Activity submission & automatic grading
10. **Build Grading System**: Manual review dashboard for teachers
11. **Practice Sandbox**:
    - Project creation and file management
    - Version history and snapshot system
    - Diff viewer for code comparison
    - Guided challenges library
    - Portfolio feature
12. **Anti-Cheating System**:
    - Code plagiarism detection (MOSS/JPlag integration)
    - Behavioral monitoring (tab switching, keystroke dynamics)
    - Activity anomaly detection
    - Copy-paste detection
    - Submission metadata tracking
    - Manual review workflow for flagged submissions
13. **Certificate System**:
    - Generation with QR codes
    - PDF creation
    - Verification endpoint
    - Digital signatures
14. **Dyas AI Teaching Assistant**:
    - LLM API integration (Claude/GPT-4)
    - Conversation management system
    - Speech-to-text and text-to-speech APIs
    - Learning profile generation engine
    - Hint generation system (progressive levels)
    - Safety guardrails (prevent answer-giving)
    - Voice interface UI
    - Context-aware response generation
    - Conversation history persistence
15. **Class Limit Enforcement**: Enforce 50-student max per class
16. **Create Analytics Dashboards**: For teachers and admins (including practice usage, Dyas interactions)
17. **Test & Deploy**: QA, security review, beta launch
18. **Set up Payment Webhooks**: Handle subscription events
19. **Gather Feedback**: Iterate based on user input
20. **Scale & Enhance**: Add advanced features based on usage patterns

---

**Document Version**: 5.0  
**Last Updated**: 2026-07-15  
**Status**: Ready for Development Planning - Startup Edition with Practice Sandbox & Dyas AI
