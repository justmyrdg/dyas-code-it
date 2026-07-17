# DyasCodeIT - Landing Page Design

## 🎮 Landing Page Structure

### Section 1: Hero Section

**Layout**: Full-width hero with asymmetrical design

**Elements**:

```
Left Side:
- Main Headline: "Learn to Code, Level Up Your Skills"
- Subheadline: "Powered by Dyas AI Teaching Assistant"
- CTA Buttons:
  - "Start Learning" (Red button)
  - "Teach a Class" (Blue button)

Right Side:
- Large UNO card visual with animated color blocks
- Floating animated code snippet cards
```

**Tailwind Classes**:

```html
<section
	class="hero min-h-screen bg-white flex items-center justify-between px-8 py-16 gap-12">
	<div class="flex-1">
		<h1 class="text-6xl font-black mb-4 leading-tight">
			Learn to Code,
			<span
				class="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-yellow-400 to-blue-600">
				Level Up Your Skills
			</span>
		</h1>
		<p class="text-2xl text-gray-700 mb-8">
			Powered by Dyas AI Teaching Assistant. Interactive coding lessons,
			real-time feedback, gamified learning.
		</p>
		<div class="flex gap-4">
			<button class="uno-btn-primary text-lg px-8 py-4">Start Learning</button>
			<button class="uno-btn-secondary text-lg px-8 py-4">Teach a Class</button>
		</div>
	</div>
	<div class="flex-1 relative h-96">
		<!-- Animated UNO cards here -->
	</div>
</section>
```

---

### Section 2: Features (4 UNO Cards)

**Title**: "What Makes DyasCodeIT Special"

**4 Feature Cards** (One per color):

**Card 1 - Red** (Engaging):

- Icon: Graduation cap (SVG, no emoji)
- Title: "Engaging Lessons"
- Description: "Interactive coding lessons with real code execution. No theory, all practice."

**Card 2 - Yellow** (AI Tutoring):

- Icon: Brain/lightbulb (SVG)
- Title: "AI Tutor (Dyas)"
- Description: "24/7 AI assistant that guides you without giving answers. Learn at your pace."

**Card 3 - Blue** (Gamified):

- Icon: Trophy/medal (SVG)
- Title: "Gamified Learning"
- Description: "Earn certificates, badges, and build your coding portfolio. Make learning fun!"

**Card 4 - Green** (Community):

- Icon: People/community (SVG)
- Title: "Learn Together"
- Description: "Join classes with peers, get feedback from teachers, share your projects."

**HTML Structure**:

```html
<section class="features py-20 bg-gray-50 px-8">
	<h2 class="text-5xl font-black text-center mb-16">
		What Makes DyasCodeIT Special
	</h2>

	<div class="uno-grid">
		<!-- Feature Card 1 - Red -->
		<div class="uno-card uno-card-red">
			<div class="uno-card-header">
				<span class="uno-card-title">Engaging Lessons</span>
				<span class="uno-card-badge">Red</span>
			</div>
			<div class="uno-card-body">
				<svg class="w-16 h-16 mb-4"><!-- Graduation cap icon --></svg>
				<p class="text-white text-lg">
					Interactive coding lessons with real code execution. No theory, all
					practice.
				</p>
			</div>
		</div>

		<!-- Feature Card 2 - Yellow -->
		<div class="uno-card uno-card-yellow">
			<div class="uno-card-header">
				<span class="uno-card-title text-gray-900">AI Tutor (Dyas)</span>
				<span class="uno-card-badge">Yellow</span>
			</div>
			<div class="uno-card-body">
				<svg class="w-16 h-16 mb-4"><!-- Brain icon --></svg>
				<p class="text-gray-900 text-lg">
					24/7 AI assistant that guides you without giving answers. Learn at
					your pace.
				</p>
			</div>
		</div>

		<!-- Feature Card 3 - Blue -->
		<div class="uno-card uno-card-blue">
			<div class="uno-card-header">
				<span class="uno-card-title">Gamified Learning</span>
				<span class="uno-card-badge">Blue</span>
			</div>
			<div class="uno-card-body">
				<svg class="w-16 h-16 mb-4"><!-- Trophy icon --></svg>
				<p class="text-white text-lg">
					Earn certificates, badges, and build your coding portfolio. Make
					learning fun!
				</p>
			</div>
		</div>

		<!-- Feature Card 4 - Green -->
		<div class="uno-card uno-card-green">
			<div class="uno-card-header">
				<span class="uno-card-title">Learn Together</span>
				<span class="uno-card-badge">Green</span>
			</div>
			<div class="uno-card-body">
				<svg class="w-16 h-16 mb-4"><!-- People icon --></svg>
				<p class="text-white text-lg">
					Join classes with peers, get feedback from teachers, share your
					projects.
				</p>
			</div>
		</div>
	</div>
</section>
```

---

### Section 3: How It Works (4 Steps)

**Title**: "Get Started in 4 Easy Steps"

**Step Cards** (Progression):

1. **Step 1 - Create** (Red background)
   - Icon: Plus/add (SVG)
   - Title: "Teachers Create a Class"
   - Description: "Select a topic (Python, C++, etc) and create your class in seconds"

2. **Step 2 - Share** (Yellow background)
   - Icon: Share/link (SVG)
   - Title: "Share Class Code"
   - Description: "Get a unique code. Share with students via email, QR, or link"

3. **Step 3 - Learn** (Blue background)
   - Icon: Book/learning (SVG)
   - Title: "Students Join & Learn"
   - Description: "Students enter code, access lessons, ask Dyas for help, do activities"

4. **Step 4 - Earn** (Green background)
   - Icon: Certificate/medal (SVG)
   - Title: "Earn Certificates"
   - Description: "Complete curriculum, get verified certificate with QR code"

**HTML Structure**:

```html
<section class="how-it-works py-20 bg-white px-8">
	<h2 class="text-5xl font-black text-center mb-16">
		Get Started in 4 Easy Steps
	</h2>

	<div class="relative">
		<!-- Connecting line (desktop only) -->
		<div
			class="hidden md:block absolute top-24 left-0 right-0 h-1 bg-gray-300"></div>

		<div class="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
			<!-- Step 1 - Red -->
			<div class="uno-card uno-card-red">
				<div class="uno-card-header">
					<span class="uno-card-badge">Step 1</span>
				</div>
				<div class="uno-card-body flex flex-col items-center text-center">
					<div
						class="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4">
						<span class="text-4xl font-black text-red-600">+</span>
					</div>
					<h3 class="text-2xl font-bold mb-2">Create a Class</h3>
					<p class="text-white">
						Select a topic and create your class in seconds
					</p>
				</div>
			</div>

			<!-- Step 2 - Yellow -->
			<div class="uno-card uno-card-yellow">
				<div class="uno-card-header">
					<span class="uno-card-badge">Step 2</span>
				</div>
				<div class="uno-card-body flex flex-col items-center text-center">
					<div
						class="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4">
						<span class="text-4xl font-black text-yellow-400">SHARE</span>
					</div>
					<h3 class="text-2xl font-bold text-gray-900 mb-2">Share Code</h3>
					<p class="text-gray-900">Get unique code. Share via email or QR</p>
				</div>
			</div>

			<!-- Step 3 - Blue -->
			<div class="uno-card uno-card-blue">
				<div class="uno-card-header">
					<span class="uno-card-badge">Step 3</span>
				</div>
				<div class="uno-card-body flex flex-col items-center text-center">
					<div
						class="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4">
						<span class="text-4xl font-black text-blue-600">LEARN</span>
					</div>
					<h3 class="text-2xl font-bold mb-2">Join & Learn</h3>
					<p class="text-white">
						Students join, learn, and get help from Dyas AI
					</p>
				</div>
			</div>

			<!-- Step 4 - Green -->
			<div class="uno-card uno-card-green">
				<div class="uno-card-header">
					<span class="uno-card-badge">Step 4</span>
				</div>
				<div class="uno-card-body flex flex-col items-center text-center">
					<div
						class="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4">
						<span class="text-4xl font-black text-green-600">C</span>
					</div>
					<h3 class="text-2xl font-bold mb-2">Get Certificate</h3>
					<p class="text-white">Earn QR-verified certificate on completion</p>
				</div>
			</div>
		</div>
	</div>
</section>
```

---

### Section 4: Pricing

**Title**: "Choose Your Plan"

**Free Tier Card**:

- Color: Light gray with black border
- Features:
  - 2 classes
  - 50 students per class
  - Full Dyas AI access
  - Certificates with QR
- CTA: "Get Started Free"

**Premium Tier Card**:

- Color: Blue with accent
- Badge: "Most Popular"
- Price: "$9.99/month or $99.99/year"
- Features:
  - Unlimited classes
  - Advanced analytics
  - Priority support
  - (All free features included)
- CTA: "Start Free Trial"

**HTML Structure**:

```html
<section class="pricing py-20 bg-gray-50 px-8">
	<h2 class="text-5xl font-black text-center mb-16">
		Simple Pricing, Great Value
	</h2>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
		<!-- Free Tier -->
		<div class="uno-card bg-white border-4 border-black">
			<div class="uno-card-header bg-gray-100">
				<span class="uno-card-title">Free Forever</span>
				<span class="uno-card-badge">Free</span>
			</div>
			<div class="uno-card-body">
				<p class="text-3xl font-black mb-6 text-gray-900">$0</p>
				<ul class="space-y-3 mb-8">
					<li class="flex items-center text-gray-900">
						<span class="w-6 h-6 mr-3 text-green-600 font-bold">✓</span>
						<span class="font-semibold">2 Classes</span>
					</li>
					<li class="flex items-center text-gray-900">
						<span class="w-6 h-6 mr-3 text-green-600 font-bold">✓</span>
						<span class="font-semibold">50 Students Per Class</span>
					</li>
					<li class="flex items-center text-gray-900">
						<span class="w-6 h-6 mr-3 text-green-600 font-bold">✓</span>
						<span class="font-semibold">Full Dyas AI Access</span>
					</li>
					<li class="flex items-center text-gray-900">
						<span class="w-6 h-6 mr-3 text-green-600 font-bold">✓</span>
						<span class="font-semibold">Certificates with QR</span>
					</li>
				</ul>
				<button class="w-full uno-btn-primary">Get Started Free</button>
			</div>
		</div>

		<!-- Premium Tier -->
		<div class="uno-card uno-card-blue relative">
			<div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
				<span
					class="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-black border-2 border-black">
					MOST POPULAR
				</span>
			</div>
			<div class="uno-card-header">
				<span class="uno-card-title">Premium</span>
				<span class="uno-card-badge">Pro</span>
			</div>
			<div class="uno-card-body">
				<p class="text-3xl font-black mb-2 text-white">
					$9.99<span class="text-base text-white text-opacity-80">/month</span>
				</p>
				<p class="text-white text-opacity-80 mb-6 font-semibold">
					or $99.99/year (save 17%)
				</p>
				<ul class="space-y-3 mb-8 text-white">
					<li class="flex items-center">
						<span
							class="w-6 h-6 mr-3 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold text-sm"
							>✓</span
						>
						<span class="font-semibold">Unlimited Classes</span>
					</li>
					<li class="flex items-center">
						<span
							class="w-6 h-6 mr-3 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold text-sm"
							>✓</span
						>
						<span class="font-semibold">Advanced Analytics</span>
					</li>
					<li class="flex items-center">
						<span
							class="w-6 h-6 mr-3 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold text-sm"
							>✓</span
						>
						<span class="font-semibold">Priority Support</span>
					</li>
					<li class="flex items-center">
						<span
							class="w-6 h-6 mr-3 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold text-sm"
							>✓</span
						>
						<span class="font-semibold">Dyas Priority Queue</span>
					</li>
				</ul>
				<button
					class="w-full bg-white text-blue-600 font-bold py-3 rounded-xl border-2 border-white hover:bg-blue-50">
					Start Free Trial
				</button>
			</div>
		</div>
	</div>
</section>
```

---

### Section 5: Testimonials

**Layout**: Carousel-style testimonials

**Testimonial 1** (Student - Yellow):

```
"I was stuck on loops for weeks. Dyas helped me understand them without just giving me the answer. The interactive lessons are amazing!"
- Sarah, Student
- Avatar: S badge
```

**Testimonial 2** (Teacher - Blue):

```
"I can create a class and share it in minutes. My students love learning with Dyas. Grading is so much easier with automated feedback!"
- John, Teacher
- Avatar: J badge
```

---

### Section 6: CTA Section

**Title**: "Ready to Code?"

**Two Options**:

- "I'm a Student" (Red button) → Join Class modal
- "I'm a Teacher" (Blue button) → Create Class modal

---

### Section 7: Footer

**Links**:

- About
- Docs
- Blog
- Status
- Support
- Terms
- Privacy

**Social**:

- GitHub
- Twitter
- LinkedIn

**Copyright**: DyasCodeIT 2024. All rights reserved.

---

## 🎨 Tailwind Configuration for UNO Theme

**tailwind.config.js**:

```javascript
module.exports = {
	content: ["./src/**/*.{html,ts}"],
	theme: {
		extend: {
			colors: {
				"uno-red": "#FF4444",
				"uno-yellow": "#FFD700",
				"uno-blue": "#0066FF",
				"uno-green": "#00AA44",
			},
			borderRadius: {
				uno: "24px",
				"uno-lg": "32px",
			},
			boxShadow: {
				uno: "0 8px 16px rgba(0, 0, 0, 0.1)",
				"uno-lg": "0 12px 24px rgba(0, 0, 0, 0.15)",
			},
			fontSize: {
				"uno-h1": "48px",
				"uno-h2": "36px",
				"uno-h3": "24px",
				"uno-h4": "20px",
			},
		},
	},
	plugins: [],
};
```

---

## 📱 Responsive Design

**Breakpoints**:

- Mobile: < 768px (1 column layout)
- Tablet: 768px - 1024px (2 column layout)
- Desktop: > 1024px (3-4 column layout)

**Mobile-First Approach**:

- All cards stack vertically on mobile
- Touch-friendly button sizes (44px minimum height)
- Adjusted font sizes for readability
- Full-width sections with padding

---

## 🎬 Animations

**Hover Effects**:

- Card lift: `hover:shadow-xl hover:scale-105`
- Button pulse: `active:scale-95`

**Page Load**:

- Cards fade in with stagger delay
- Hero text slides in from left
- Feature icons bounce slightly

**CSS**:

```css
@keyframes cardSlideIn {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.uno-card {
	animation: cardSlideIn 0.6s ease-out;
}

.uno-card:nth-child(1) {
	animation-delay: 0.1s;
}
.uno-card:nth-child(2) {
	animation-delay: 0.2s;
}
.uno-card:nth-child(3) {
	animation-delay: 0.3s;
}
.uno-card:nth-child(4) {
	animation-delay: 0.4s;
}
```

---

**Landing Page Status**: ✅ Complete Design & Structure Ready
