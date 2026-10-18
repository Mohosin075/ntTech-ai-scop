# 🚀 ScopeAI — AI Project Cost & Milestone Estimator
> **Tagline:** Intelligent Software Scoping, Costing & Milestone Engine  
> **Documentation:** Software Requirements Specification (SRS), UI/UX Guidelines, Schema & Architecture Roadmap

---

## 📑 সূচিপত্র (Table of Contents)
1. [প্রজেক্ট ওভারভিউ (Project Overview)](#১-প্রজেক্ট-ওভারভিউ-project-overview)
2. [কালার প্যালেট ও ডিজাইন সিস্টেম (UI/UX Guidelines)](#২-কালার-প্যালেট-ও-ডিজাইন-সিস্টেম-uiux-guidelines)
3. [পেজ-বাই-পেজ লেআউট গাইডলাইন (Pages & Layouts)](#৩-পেজ-বাই-পেজ-লেআউট-গাইডলাইন-pages--layouts)
4. [ডাটাবেস আর্কিটেকচার ও রিলেশনশিপ (Database Schema)](#৪-ডাটাবেস-আর্কিটেকচার-ও-রিলেশনশিপ-database-schema)
5. [বিজনেস লজিক ও ক্যালকুলেশন রুলস (Business Logic & State Machine)](#৫-বিজনেস-লজিক-ও-ক্যালকুলেশন-রুলস-business-logic--state-machine)
6. [AI / ML ফিচার স্পেসিফিকেশন ও Fallback স্ট্র্যাটেজি](#৬-ai--ml-ফিচার-স্পেসিফিকেশন-ও-fallback-স্ট্র্যাটেজি)
7. [ব্যাকএন্ড API লিস্ট ও ভ্যালিডেশন (APIs & Security)](#৭-ব্যাকএন্ড-api-লিস্ট-ও-ভ্যালিডেশন-apis--security)

---

## ১. প্রজেক্ট ওভারভিউ (Project Overview)

- **প্রজেক্টের নাম:** ScopeAI
- **ট্যাগলাইন:** *Intelligent Software Scoping, Costing & Milestone Engine*

### 🔴 মূল সমস্যা (Problem Statement)
সফটওয়্যার এজেন্সি বা ফ্রিল্যান্সারদের কাছে ক্লায়েন্ট যখন নতুন প্রজেক্টের আইডিয়া নিয়ে আসে, তখন ম্যানুয়ালি ফিচার ভাগ করা, সময়ের হিসাব বের করা এবং মাইলস্টোন বাজেট তৈরি করতে প্রচুর সময় নষ্ট হয় এবং হিসেবে ভুল হয়।

### 🟢 সমাধান (Solution)
ইউজার প্রজেক্টের রাফ আইডিয়া এবং **Hourly Rate** ইনপুট দিলে AI সাথে সাথে প্রজেক্টের:
- এক্সিকিউটিভ সামারি
- রিস্ক লেভেল (Risk Level)
- প্রয়োজনীয় টেক স্ট্যাক (Recommended Tech Stack)
- ফিচারগুলোর লিস্ট (ঘণ্টাসহ)

তৈরি করে দেবে। এরপর ব্যাকএন্ডের বিজনেস লজিক অটোমেটিক রিস্ক বাফার, মোট খরচ এবং ৩ ধাপের পেমেন্ট মাইলস্টোন হিসাব করে দেবে।

---

## ২. কালার প্যালেট ও ডিজাইন সিস্টেম (UI/UX Guidelines)

> [!NOTE]
> অ্যাসেসমেন্টে **Frontend & User Experience**-এর ওপর ১৫ মার্কস রয়েছে। Linear বা Vercel-এর মতো প্রিমিয়াম SaaS লুক আনতে **Modern Dark Slate + Indigo AI Theme** ব্যবহার করা হয়েছে।

### 🎨 কালার চার্ট (Hex Codes & Tailwind Classes)

| উপাদান (Element) | কালার নাম | Hex Code | Tailwind CSS Class | কোথায় ব্যবহার করবে |
| :--- | :--- | :--- | :--- | :--- |
| **Main Background** | Deep Slate | `#090D16` | `bg-slate-950` | পুরো অ্যাপের মূল ব্যাকগ্রাউন্ড |
| **Card / Surface** | Dark Navy Slate | `#111827` | `bg-gray-900` | সব কার্ড, টেবিল, ফর্ম এবং সাইডবার |
| **Card Border** | Subtle Border | `#1F2937` | `border-gray-800` | কার্ড ও ইনপুট ফিল্ডের বর্ডার (1px) |
| **Primary Brand / AI** | Electric Indigo | `#6366F1` | `bg-indigo-500` | মেইন বাটন, AI জেনারেট বাটন, অ্যাক্টিভ ট্যাব |
| **AI Accent / Glow** | Purple Violet | `#8B5CF6` | `text-violet-400` | AI Summary বক্সের বর্ডার ও আইকন |
| **Primary Text** | Crisp White | `#F9FAFB` | `text-gray-50` | হেডিং, প্রজেক্ট টাইটেল, টাকার অংক |
| **Secondary Text** | Muted Gray | `#9CA3AF` | `text-gray-400` | সাবটাইটেল, ডেসক্রিপশন, টেবিল হেডার |

### 🏷️ স্ট্যাটাস ও রিস্ক ব্যাজ কালার (Status & Risk Colors)

- **Success / Approved / Low Risk:**  
  `Emerald Green` (`#10B981` | `bg-emerald-500/10 text-emerald-400 border-emerald-500/20`)
- **Warning / Under Review / Medium Risk:**  
  `Amber Gold` (`#F59E0B` | `bg-amber-500/10 text-amber-400 border-amber-500/20`)
- **Danger / Rejected / High Risk:**  
  `Rose Red` (`#F43F5E` | `bg-rose-500/10 text-rose-400 border-rose-500/20`)
- **Info / AI Estimated:**  
  `Sky Blue` (`#0EA5E9` | `bg-sky-500/10 text-sky-400 border-sky-500/20`)

### 🔤 ফন্ট (Typography)
- **Heading & Body:** `Inter` অথবা `Plus Jakarta Sans`
- **Numbers / Cost / Hours:** `JetBrains Mono` অথবা `font-mono` *(টাকার হিসাব ও ঘণ্টা মনোস্পেস ফন্টে দেখালে ড্যাশবোর্ড খুব প্রফেশনাল লাগে)*

---

## ৩. পেজ-বাই-পেজ লেআউট গাইডলাইন (Pages & Layouts)

> পুরো প্রজেক্টে সুনির্দিষ্ট **৩টি পেজ** থাকবে:

### 📄 Page 1: Login & Register Page (`/login`)
- **লেআউট:** স্ক্রিনের একদম মাঝখানে একটি সুন্দর কার্ড (`max-w-md`)।
- **উপরে:** অ্যাপের লোগো (`✨ ScopeAI`) এবং ছোট সাবটাইটেল।
- **মাঝখানে:** Email ও Password ইনপুট ফিল্ড + "Sign In" বাটন (টগল করে Register-এ যাওয়ার অপশন)।
- **নিচে (জরুরি):** **"Quick Demo Access"** নামে ২টি বাটন:
  - `[Login as Estimator]` — ক্লিক করলেই অটোমেটিক ইমেইল/পাসওয়ার্ড বসে লগইন হবে।
  - `[Login as Admin Reviewer]` — ক্লিক করলেই অ্যাডমিন হিসেবে লগইন হবে।

---

### 📄 Page 2: Main Dashboard & AI Generator (`/dashboard`)
তিনটি সেকশনে বিভক্ত:

1. **Top Navbar:**
   - বামে: `✨ ScopeAI` লোগো।
   - ডানে: ইউজারের নাম, Role Badge (`ESTIMATOR` বা `ADMIN`), এবং Logout বাটন।

2. **Hero Section — "Create New AI Estimate":**
   - **Row 1:** বামে `Project Title` ইনপুট (যেমন: *Multi-vendor E-commerce Platform*), ডানে `Hourly Rate ($)` ইনপুট (যেমন: *25*)।
   - **Row 2:** বড় Textarea — `Project Requirements / Idea Description` (ন্যূনতম ২০ শব্দের বর্ণনা)।
     - নিচে ৩টি কুইক চিপ: `[Food Delivery App]`, `[Hospital Management]`, `[Real Estate Portal]`।
   - **Row 3:** ডান কোণায় অ্যাকশন বাটন: `✨ Generate AI Scope & Cost`।
   - **Loading State:** বাটন ডিসেবল হবে, স্পিনার ঘুরবে এবং মেসেজ দেখাবে:  
     `"AI is analyzing requirements, calculating risk & estimating hours..."`

3. **Bottom Section — "Recent Project Estimates":**
   - স্ট্যাটাস ফিল্টার ড্রপডাউন: `All`, `AI Estimated`, `Under Review`, `Approved`, `Rejected`।
   - প্রজেক্ট কার্ড গ্রিড (প্রতি রো-তে ৩টি কার্ড):
     - প্রজেক্ট টাইটেল + স্ট্যাটাস ব্যাজ
     - Risk Level ব্যাজ (`Low` / `Medium` / `High`)
     - মোট খরচ (যেমন: `$4,250`) ও মোট সময় (যেমন: `150 hrs • 5 Weeks`)
     - বাটন: `View Workspace →`

---

### 📄 Page 3: Project Estimate Workspace (`/projects/[id]`) — মূল আকর্ষণ
ডেস্কটপে **২ কলাম লেআউট** (বামে ৮ কলাম, ডানে ৪ কলাম):

#### 🔹 Top Header Bar
- **বামে:** `← Back to Dashboard`, প্রজেক্টের নাম, এবং বর্তমান `Status Badge`।
- **ডানে (Action Buttons):**
  - যদি স্ট্যাটাস `ai_estimated` হয়: `[Submit for Approval]` বাটন।
  - যদি ইউজার `admin` হয় এবং স্ট্যাটাস `under_review` হয়: সবুজ `[Approve Scope]` বাটন এবং লাল `[Reject]` বাটন।

#### 🔹 Summary KPI Strip (৪টি মেট্রিক্স কার্ড এক লাইনে)
1. **Total Estimated Cost:** `$3,450` *(ছোট করে: Base: $3,000 + Risk Buffer: $450)*
2. **Total Effort:** `120 Hours` *(Active features only)*
3. **Estimated Timeline:** `4 Weeks` *(Based on 30 hrs/week)*
4. **Risk Profile:** `MEDIUM RISK` *(12% Buffer) + AI Confidence: 88%*

#### 🔹 Left Column (মূল অংশ)
1. **AI Executive Summary & Tech Stack Card:**
   - বেগুনি বর্ডারে AI সামারি বক্স।
   - Recommended Tech Stack ব্যাজ (`Next.js`, `TypeScript`, `PostgreSQL`, `Redis` ইত্যাদি)।
   - AI ডাউন থাকলে Fallback ব্যাজ: `⚡ Generated via Standard Rule Engine (AI Fallback)`।
2. **Interactive Feature Breakdown Table (CRUD + Live Calculation):**
   - উপরে বাটন: `+ Add Custom Feature`
   - টেবিল কলামসমূহ:
     - `Include` (Checkbox — আনচেক করলে মোট খরচ ও ঘণ্টা থেকে তাৎক্ষণিক বাদ হবে)
     - `Feature Name` (যেমন: *Role-based Auth & JWT Security*)
     - `Category Badge` (`frontend`, `backend`, `database`, `integration`, `ai`)
     - `Complexity` (`low`, `medium`, `high`)
     - `Hours` (নাম্বার ইনপুট বা `+` / `-` বাটন)
     - `Subtotal ($)` (`Hours × Hourly Rate`)
     - `Action` (Delete আইকন)
   - *(নোট: প্রজেক্ট Approved হলে এডিট/ডিলিট স্বয়ংক্রিয়ভাবে লক হয়ে যাবে)*

#### 🔹 Right Column (সাইড প্যানেল)
1. **Payment Milestone Breakdown Card:**
   - `Milestone 1 (Kickoff & UI - 30%): $1,035`
   - `Milestone 2 (Core MVP & APIs - 40%): $1,380`
   - `Milestone 3 (Testing & Deployment - 30%): $1,035`
2. **Hourly Rate Adjuster Card:**
   - Hourly Rate ইনপুট + `[Recalculate]` বাটন।
3. **Status & Audit Info Card:**
   - প্রজেক্ট ক্রিয়েটর, তৈরির তারিখ, এবং রিজেক্টেড হলে লাল বক্সে `Rejection Reason`।

---

## ৪. ডাটাবেস আর্কিটেকচার ও রিলেশনশিপ (Database Schema)

রিলেশনশিপ: **Users (1) $\rightarrow$ Projects (Many)** এবং **Projects (1) $\rightarrow$ Features (Many)**

### 1. `users` Table / Collection
| Field | Type | Validation / Description |
| :--- | :--- | :--- |
| `id` | String / UUID | Primary Key |
| `name` | String | Required, min 2 chars |
| `email` | String | Required, Unique, lowercase |
| `passwordHash` | String | Required (bcrypt hashed) |
| `role` | Enum | `'estimator'` \| `'admin'` (Default: `'estimator'`) |
| `createdAt` | DateTime | Auto timestamp |
| `updatedAt` | DateTime | Auto timestamp |

### 2. `projects` Table / Collection
| Field | Type | Validation / Description |
| :--- | :--- | :--- |
| `id` | String / UUID | Primary Key |
| `createdById` | String / UUID | Ref: `User` (Required, Indexed) |
| `title` | String | Required, min 3 chars |
| `rawRequirement`| String | Required, min 20 chars |
| `hourlyRate` | Float / Number | Required, min 5, max 500 |
| `status` | Enum | `'ai_estimated'` \| `'under_review'` \| `'approved'` \| `'rejected'` |
| `executiveSummary`| String | AI generated summary |
| `riskLevel` | Enum | `'low'` \| `'medium'` \| `'high'` |
| `recommendedStack`| String[] | Array of strings (e.g. `["React", "Node.js", "PostgreSQL"]`) |
| `aiConfidenceScore`| Float / Number| 0 to 100 |
| `isFallbackUsed` | Boolean | Default `false` |
| `totalHours` | Float / Number | Active features hours sum |
| `baseCost` | Float / Number | Total Hours × Hourly Rate |
| `riskBufferPercent`| Float / Number| 5, 12, or 20 (%) |
| `riskBufferAmount` | Float / Number| Base Cost × Buffer % |
| `finalTotalCost` | Float / Number | Base Cost + Buffer Amount |
| `estimatedWeeks` | Int | ceil(Total Hours / 30) |
| `milestone1Amount` | Float / Number | 30% of Final Total Cost |
| `milestone2Amount` | Float / Number | 40% of Final Total Cost |
| `milestone3Amount` | Float / Number | Final Total Cost - M1 - M2 |
| `rejectionReason` | String | Optional (Required when status is `'rejected'`) |
| `reviewedById` | String / UUID | Ref: `User` (Optional) |
| `createdAt` | DateTime | Auto timestamp |
| `updatedAt` | DateTime | Auto timestamp |

### 3. `features` Table / Collection
| Field | Type | Validation / Description |
| :--- | :--- | :--- |
| `id` | String / UUID | Primary Key |
| `projectId` | String / UUID | Ref: `Project` (Required, Indexed, Cascade Delete) |
| `title` | String | Required |
| `category` | Enum | `'frontend'` \| `'backend'` \| `'database'` \| `'integration'` \| `'ai'` |
| `complexity` | Enum | `'low'` \| `'medium'` \| `'high'` |
| `estimatedHours` | Float / Number | Required, min 1, max 200 |
| `isIncluded` | Boolean | Default `true` |
| `createdAt` | DateTime | Auto timestamp |
| `updatedAt` | DateTime | Auto timestamp |

---

## ৫. বিজনেস লজিক ও ক্যালকুলেশন রুলস (Business Logic & State Machine)

### A. 🧮 গাণিতিক ফর্মুলা (Mathematical Formulas)
প্রতিবার প্রজেক্ট তৈরি হলে বা কোনো ফিচারের ঘণ্টা/চেকবক্স পরিবর্তন হলে নিচের ৫টি হিসাব অটোমেটিক রান করবে:

1. **Total Hours:**
   $$\text{Total Hours} = \sum (\text{estimatedHours for all features where } isIncluded == true)$$
2. **Base Cost:**
   $$\text{Base Cost} = \text{Total Hours} \times \text{Hourly Rate}$$
3. **Risk Buffer Percentage & Amount:**
   - $\text{riskLevel} == \text{'low'} \rightarrow 5\%$
   - $\text{riskLevel} == \text{'medium'} \rightarrow 12\%$
   - $\text{riskLevel} == \text{'high'} \rightarrow 20\%$
   $$\text{Risk Buffer Amount} = \text{Base Cost} \times \frac{\text{Risk Buffer \%}}{100}$$
4. **Final Total Cost:**
   $$\text{Final Total Cost} = \text{Base Cost} + \text{Risk Buffer Amount}$$
5. **Estimated Weeks:**
   $$\text{Estimated Weeks} = \lceil \text{Total Hours} \div 30 \rceil \quad (\text{সপ্তাহে ৩০ কর্মঘণ্টা ধরে})$$
6. **Milestones (30% - 40% - 30% Rounding Safe):**
   - $\text{Milestone 1} = \text{round}(\text{Final Total Cost} \times 0.30)$
   - $\text{Milestone 2} = \text{round}(\text{Final Total Cost} \times 0.40)$
   - $\text{Milestone 3} = \text{Final Total Cost} - \text{Milestone 1} - \text{Milestone 2}$ *(১ সেন্টের হেরফেরও হবে না)*

---

### B. 🛡️ স্ট্যাটাস ওয়ার্কফ্লো ও গার্ড রুলস (State Machine Guards)

- **Rule 1 (Empty Scope Guard):**  
  কোনো প্রজেক্টের `totalHours === 0` হলে (অর্থাৎ সব ফিচার আনচেক বা ডিলিট থাকলে) প্রজেক্ট `under_review`-তে সাবমিট করা যাবে না (`400 Bad Request`)।
- **Rule 2 (Role Guard):**  
  শুধুমাত্র `admin` রোলের ইউজার স্ট্যাটাস `under_review` থেকে `approved` বা `rejected` করতে পারবে। সাধারণ `estimator` চেষ্টা করলে `403 Forbidden` দেবে।
- **Rule 3 (Rejection Note Requirement):**  
  স্ট্যাটাস `rejected` করতে হলে বডিতে অবশ্যই `rejectionReason` (কমপক্ষে ১০ অক্ষর) থাকতে হবে।
- **Rule 4 (Immutability Lock):**  
  একবার প্রজেক্ট স্ট্যাটাস `approved` হয়ে গেলে, সেই প্রজেক্টের কোনো ফিচার এডিট, ডিলিট বা নতুন ফিচার যোগ করা যাবে না (`400 Bad Request: Approved projects are locked`)।

---

## ৬. AI / ML ফিচার স্পেসিফিকেশন ও Fallback স্ট্র্যাটেজি

### 🤖 মূল AI কাজসমূহ
1. **Text Summarization:** ইউজারের লম্বা বা অগোছালো রিকোয়ারমেন্ট থেকে ২ লাইনের প্রফেশনাল Executive Summary তৈরি।
2. **Classification:** প্রজেক্ট ঝুঁকি (`low`, `medium`, `high`) এবং ফিচার ক্যাটাগরি ক্লাসিফাই করা।
3. **Smart Recommendation:** প্রজেক্টের জন্য সেরা Tech Stack এবং প্রয়োজনীয় ৬-৮টি ফিচারের নাম ও সম্ভাব্য ঘণ্টা সুপারিশ করা।

### 🛡️ Fallback Strategy (নিরাপত্তা গ্যারান্টি)
যদি কোনো কারণে AI API রেসপন্স না দেয়, কী ইনভ্যালিড থাকে বা কোটা শেষ হয়, তবে সিস্টেম ক্র্যাশ না করে একটি **Rule-Based Fallback Generator** কল করবে:
- রিকোয়ারমেন্টের দৈর্ঘ্য ও কীওয়ার্ড দেখে ৬টি প্রমিত ফিচার তৈরি করবে।
- রেসপন্সে `isFallbackUsed: true` ফ্ল্যাগ যুক্ত করবে।
- UI-তে নোটিশ দেখাবে: `⚡ Generated via Standard Rule Engine (AI Fallback)`।

---

## ৭. ব্যাকএন্ড API লিস্ট ও ভ্যালিডেশন (APIs & Security)

> সমস্ত ইনপুট **Zod Schema** দিয়ে ভ্যালিডেট করা হবে।

| Method & Endpoint | Access Role | কাজ (Description) | Zod Validation Rules |
| :--- | :--- | :--- | :--- |
| `POST /api/auth/register` | Public | নতুন অ্যাকাউন্ট তৈরি | `name (min 2)`, `email (valid)`, `password (min 6)` |
| `POST /api/auth/login` | Public | লগইন ও JWT টোকেন প্রদান | `email (valid)`, `password (required)` |
| `POST /api/projects/generate` | Auth (Any) | AI দিয়ে প্রজেক্ট ও ফিচার তৈরি ও সেভ | `title (min 3)`, `rawRequirement (min 20)`, `hourlyRate (5-500)` |
| `GET /api/projects` | Auth (Any) | সব প্রজেক্টের লিস্ট (ফিল্টারিং সহ) | Query: optional `status enum` |
| `GET /api/projects/:id` | Auth (Any) | প্রজেক্ট ডিটেইলস + ফিচার লিস্ট | Params: valid ID format |
| `POST /api/projects/:id/features` | Auth (Any) | ম্যানুয়ালি নতুন ফিচার যোগ ও রিক্যালকুলেট | `title`, `category`, `complexity`, `estimatedHours (1-200)` |
| `PATCH /api/projects/:id/features/:featureId` | Auth (Any) | ঘণ্টা বা `isIncluded` আপডেট ও রিক্যালকুলেট | `estimatedHours (optional 1-200)`, `isIncluded (optional boolean)` |
| `DELETE /api/projects/:id/features/:featureId` | Auth (Any) | ফিচার ডিলিট ও কস্ট রিক্যালকুলেট | Params: valid IDs |
| `PATCH /api/projects/:id/status` | Auth (Admin / Estimator) | স্ট্যাটাস পরিবর্তন (`under_review`, `approved`, `rejected`) | `status (enum)`, conditional `rejectionReason (min 10)` |
