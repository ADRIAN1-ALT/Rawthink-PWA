import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { 
  User, Enrollment, Course, ResourceDownload, AITool, 
  ForumPost, QuizQuestion, QuizHistory, Announcement, Notification, SessionSchedule 
} from './src/types';

// Establish relative locations
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Initialize database storage
function initDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const defaultCourses: Course[] = [
    {
      id: 'course-1',
      title: 'AI Foundations Bootcamp',
      price: 299,
      duration: '1 Hour',
      features: [
        'AI Basics & Evolution',
        'Introduction to ChatGPT & Modern LLMs',
        'Prompting Fundamentals & Structure',
        'AI Advantages in Daily Workflows',
        'AI Limitations & Hallucinations',
        'Interactive Live Q&A Session'
      ],
      bonuses: [
        'AI Starter Guide PDF',
        'Premium Beginner Prompt Pack',
        'Official RAWTHINK AI Certificate'
      ],
      schedule: 'Every Saturday, 2:00 PM - 3:00 PM NPT'
    },
    {
      id: 'course-2',
      title: 'AI Productivity Workshop',
      price: 349,
      duration: '2 Hours',
      badge: 'Limited Seats',
      features: [
        'Advanced System Role Prompting',
        'AI for Academic Studies & Research',
        'AI for Automated Presentation Writing',
        'Personal Productivity Systems & Dashboards',
        'Practical Live Exercises & Code Generation',
        'Visual Asset Design with AI Canvas'
      ],
      bonuses: [
        '100+ Masterclass Prompt Templates',
        'AI Toolkit Cheat Sheet',
        'Direct Lifetime Recording Access',
        'Official Completion Certificate'
      ],
      schedule: 'Every Sunday, 11:00 AM - 1:00 PM NPT'
    },
    {
      id: 'course-3',
      title: 'AI Development & Automation Masterclass',
      price: 599,
      duration: '3 Hours',
      badge: 'Most Popular',
      features: [
        'Integrating AI APIs inside Developer projects',
        'Building Automated Workflows & Orchestrators',
        'AI Assistants, Autonomous Agents, & Web Scraping',
        'Solving Real-world Business Use Cases with AI',
        'Full Practical Projects From Scratch (Coded Live)',
        'Connecting Frontend Apps securely to Backend AI Nodes'
      ],
      bonuses: [
        'Developer Project Templates Archive',
        'Raw Premium Developers Prompt Library',
        'Exclusive RAWTHINK Discord VIP Channel',
        'Vetted Digital Career Certificate'
      ],
      schedule: 'Every Wednesday, 6:00 PM - 9:00 PM NPT'
    }
  ];

  const defaultTools: AITool[] = [
    // Writing Tools
    { id: 'tool-1', name: 'ChatGPT', category: 'Writing', description: 'Advanced conversational agent for writing, editing, and planning content.', tags: ['LLM', 'Writing', 'Free Tier'], link: 'https://chatgpt.com', iconName: 'MessageSquare' },
    { id: 'tool-2', name: 'Jasper AI', category: 'Writing', description: 'Enterprise-grade copywriting tool for sales campaigns and newsletters.', tags: ['Copywriting', 'Paid'], link: 'https://jasper.ai', iconName: 'PenTool' },
    { id: 'tool-3', name: 'Copy.ai', category: 'Writing', description: 'AI writing assistant that streamlines corporate social copy generation.', tags: ['Social Media', 'Paid'], link: 'https://copy.ai', iconName: 'FileText' },
    // Image Tools
    { id: 'tool-4', name: 'Midjourney', category: 'Image', description: 'State-of-the-art artistic graphics engine operating via Discord commands.', tags: ['Art', 'Community', 'Paid'], link: 'https://midjourney.com', iconName: 'Palette' },
    { id: 'tool-5', name: 'DALL-E 3', category: 'Image', description: 'OpenAI text-to-image engine with exceptional instruction adherence.', tags: ['Image Gen', 'ChatGPT Integration'], link: 'https://openai.com/dall-e-3', iconName: 'Image' },
    { id: 'tool-6', name: 'Stable Diffusion', category: 'Image', description: 'Open-source photorealistic image models suitable for self-hosting.', tags: ['Open Source', 'Advanced'], link: 'https://stability.ai', iconName: 'Layers' },
    // Video Tools
    { id: 'tool-7', name: 'Runway Gen-2', category: 'Video', description: 'Award-winning video generation platform utilizing multimodality inputs.', tags: ['Video Gen', 'Paid'], link: 'https://runwayml.com', iconName: 'Tv' },
    { id: 'tool-8', name: 'Sora', category: 'Video', description: 'Complex physics simulator producing high-fidelity cinematic video spans.', tags: ['Cinematic', 'OpenAI'], link: 'https://openai.com/sora', iconName: 'Video' },
    { id: 'tool-9', name: 'Pika Labs', category: 'Video', description: 'Responsive video customization platform specialized in motion control.', tags: ['Animation', 'Free Tier'], link: 'https://pika.art', iconName: 'Clapperboard' },
    // Coding Tools
    { id: 'tool-10', name: 'GitHub Copilot', category: 'Coding', description: 'First major IDE autocomplete model improving development speed.', tags: ['Autocomplete', 'Developer'], link: 'https://github.com/features/copilot', iconName: 'Code' },
    { id: 'tool-11', name: 'Cursor', category: 'Coding', description: 'Next-generation code compiler IDE optimized for continuous AI pairings.', tags: ['IDE', 'Editor', 'Highly Recommended'], link: 'https://cursor.com', iconName: 'Cpu' },
    { id: 'tool-12', name: 'Windsurf', category: 'Coding', description: 'AI-native flow editor with collaborative capabilities.', tags: ['IDE', 'Flow'], link: 'https://codeium.com/windsurf', iconName: 'Terminal' },
    // Research Tools
    { id: 'tool-13', name: 'Consensus', category: 'Research', description: 'Scientific search machine synthesizing answers from millions of journals.', tags: ['Academic', 'Journals'], link: 'https://consensus.app', iconName: 'Library' },
    { id: 'tool-14', name: 'Perplexity AI', category: 'Research', description: 'Dynamic conversational search providing live sources and notes.', tags: ['Search Engine', 'Free Tier'], link: 'https://perplexity.ai', iconName: 'Search' },
    { id: 'tool-15', name: 'Elicit', category: 'Research', description: 'Research automation platform mapping concepts, trends, and citations.', tags: ['Research', 'Synthesizer'], link: 'https://elicit.com', iconName: 'BookOpen' },
    // Presentation Tools
    { id: 'tool-16', name: 'Tome', category: 'Presentation', description: 'Interactive storytelling platform compiling fully customized decks.', tags: ['Decks', 'AI Slides'], link: 'https://tome.app', iconName: 'Layout' },
    { id: 'tool-17', name: 'Gamma App', category: 'Presentation', description: 'Beautiful web-native designer composing pages and presentations.', tags: ['Presentations', 'Highly Polished'], link: 'https://gamma.app', iconName: 'Sparkles' },
    // Productivity Tools
    { id: 'tool-18', name: 'Notion AI', category: 'Productivity', description: 'In-workspace collaborator assisting summary writing, translations and spreadsheets.', tags: ['Notes', 'Co-Writer'], link: 'https://notion.so', iconName: 'Briefcase' },
    { id: 'tool-19', name: 'Otter.ai', category: 'Productivity', description: 'Live transcription utility taking active minutes during meetings.', tags: ['Minutes', 'Transcription'], link: 'https://otter.ai', iconName: 'Volume2' }
  ];

  const defaultResources: ResourceDownload[] = [
    { id: 'res-1', title: 'AI Beginner Guide PDF', category: 'Ebook', downloadsCount: 421, fileSize: '1.4 MB', downloadUrl: '#' },
    { id: 'res-2', title: 'Ultimate Prompt Engineering Matrix', category: 'Prompt Pack', downloadsCount: 512, fileSize: '950 KB', downloadUrl: '#' },
    { id: 'res-3', title: 'Top 70+ AI Tools Catalog with links', category: 'Directory', downloadsCount: 689, fileSize: '1.1 MB', downloadUrl: '#' },
    { id: 'res-4', title: 'Bootcamp Lecture Notes & Cheat Sheet', category: 'Lecture Notes', downloadsCount: 198, fileSize: '620 KB', downloadUrl: '#' },
    { id: 'res-5', title: 'Nepal-centric AI Career & Business Roadmap', category: 'Ebook', downloadsCount: 304, fileSize: '2.1 MB', downloadUrl: '#' },
    { id: 'res-6', title: 'Midjourney Prompt Cheat Sheet V6', category: 'Prompt Pack', downloadsCount: 275, fileSize: '740 KB', downloadUrl: '#' }
  ];

  const defaultSchedule: SessionSchedule[] = [
    { id: 'sched-1', courseId: 'course-1', workshopName: 'AI Foundations Bootcamp', instructor: 'Er. Sandesh Shrestha', date: '2026-06-06', time: '14:00 - 15:00', seatsRemaining: 18, totalSeats: 50 },
    { id: 'sched-2', courseId: 'course-2', workshopName: 'AI Productivity Workshop', instructor: 'Dr. Ramesh Adhikari', date: '2026-06-07', time: '11:00 - 13:00', seatsRemaining: 8, totalSeats: 30 },
    { id: 'sched-3', courseId: 'course-3', workshopName: 'AI Dev & Automation Masterclass', instructor: 'Er. Sandesh Shrestha', date: '2026-06-10', time: '18:00 - 21:00', seatsRemaining: 12, totalSeats: 40 }
  ];

  const defaultQuizzes: QuizQuestion[] = [
    {
      id: 'q-1',
      question: 'What does system role prompting refer to in ChatGPT?',
      options: [
        'Setting the conversational limit of ChatGPT',
        'Instructing the chatbot to adopt a specific persona, background, and set of guidelines',
        'Choosing the theme or background color of OpenAI interface',
        'Paying for ChatGPT Plus subscription'
      ],
      correctOptionIndex: 1,
      explanation: 'System role prompting anchors the model behaviour by guiding its specific identity, credentials, rules, tone, and processing goals before handling prompt inputs.'
    },
    {
      id: 'q-2',
      question: 'Which prompting pattern forces the LLM to explain thoughts sequentially before concluding?',
      options: [
        'Few-Shot Prompting',
        'Chain-of-Thought (CoT) Prompting',
        'Zero-Shot Prompting',
        'Direct Instruction Pattern'
      ],
      correctOptionIndex: 1,
      explanation: 'Chain-of-Thought (CoT) prompting explicitly triggers the model to output intermediate reasoning steps, which improves logic precision.'
    },
    {
      id: 'q-3',
      question: 'What is a hallucination in generative AI?',
      options: [
        'When the server fails to load because of traffic overload',
        'When the AI outputs plausible-sounding but factually incorrect or fabricated claims',
        'When the AI screen flickers red under dark mode settings',
        'A state-of-the-art model specialized in mental health diagnostics'
      ],
      correctOptionIndex: 1,
      explanation: 'Hallucination occurs when an LLM synthesizes statements that sound fluent, but are entirely invented or factually incorrect.'
    },
    {
      id: 'q-4',
      question: 'Which of the following is optimal for fine-tuning prompt adherence without writing custom APIs?',
      options: [
        'Providing clear examples (Few-Shot Prompting) and structured XML tag indicators',
        'Re-installing Node modules',
        'Typing prompts in ALL-CAPS screaming format',
        'Ignoring system instructions'
      ],
      correctOptionIndex: 0,
      explanation: 'Providing structure like XML tags (<examples>, <context>) and few-shot examples optimizes structured outputs dramatically.'
    }
  ];

  const defaultLeaderboard: QuizHistory[] = [
    { id: 'lh-1', userId: 'user-demo1', userName: 'Aayush Koirala', score: 4, totalQuestions: 4, pointsEarned: 100, date: '2026-05-29' },
    { id: 'lh-2', userId: 'user-demo2', userName: 'Supriya Thapa', score: 4, totalQuestions: 4, pointsEarned: 100, date: '2026-05-30' },
    { id: 'lh-3', userId: 'user-demo3', userName: 'Bipin Gurung', score: 3, totalQuestions: 4, pointsEarned: 75, date: '2026-05-31' },
    { id: 'lh-4', userId: 'user-demo4', userName: 'Neha Pokharel', score: 3, totalQuestions: 4, pointsEarned: 75, date: '2026-05-31' }
  ];

  const defaultForum: ForumPost[] = [
    {
      id: 'post-1',
      userId: 'admin-1',
      userName: 'RAWTHINK AI Team',
      userRole: 'admin',
      category: 'announcement',
      title: 'Welcome to RAWTHINK AI Academy Nepal! 🇳🇵',
      content: 'We are thrilled to launch this premium digital AI community. Our courses utilize interactive live screens, eSewa verified digital gateways, certificates issuing dashboards, and custom prompt libraries. Jump into the Resources center to grab free guidelines today! Join the discussions, ask questions, or practice prompts here on this forum.',
      likes: 24,
      comments: [
        { id: 'c-1', userId: 'user-bipin', userName: 'Bipin Gurung', userRole: 'student', content: 'Incredible platform! Really love the clean brown-cream UI, and having a local community makes a big difference.', createdAt: '2026-05-31T00:15:00Z' }
      ],
      createdAt: '2026-05-30T09:00:00Z'
    },
    {
      id: 'post-2',
      userId: 'user-demo1',
      userName: 'Aayush Koirala',
      userRole: 'student',
      category: 'showcase',
      title: 'Automated Kathmandu Bus Route Optimizer with Cursor!',
      content: 'Using prompt chaining techniques learned during the automation preview, I configured a full Node compiler inside Cursor to write a route optimizer schema for central KTM. Highly recommend Course 3 code examples!',
      likes: 12,
      comments: [],
      createdAt: '2026-05-31T00:05:00Z'
    }
  ];

  const defaultUsers: User[] = [
    {
      id: 'admin-1',
      name: 'Super Admin',
      email: 'admin@rawthink.ai',
      phone: '9841234567',
      role: 'admin',
      referralCode: 'RAWADMIN',
      points: 1000,
      badges: ['Founder', 'AI Expert'],
      streak: 7,
      createdAt: '2026-05-15T00:00:00Z',
      achievements: ['Community Architect']
    },
    {
      id: 'student-demo',
      name: 'Prajwal Shrestha',
      email: 'student@gmail.com',
      phone: '9801122334',
      role: 'student',
      referralCode: 'PRAJWAL9',
      points: 40,
      badges: ['Early Bird'],
      streak: 1,
      createdAt: '2026-05-30T10:00:00Z',
      achievements: ['Account Registered']
    }
  ];

  const defaultEnrollments: Enrollment[] = [
    {
      id: 'en-1',
      userId: 'student-demo',
      userName: 'Prajwal Shrestha',
      userEmail: 'student@gmail.com',
      courseId: 'course-1',
      courseTitle: 'AI Foundations Bootcamp',
      price: 299,
      transactionId: 'TXN-984218-KTM',
      remarks: 'Enrolling in Saturday Bootcamp!',
      status: 'approved',
      createdAt: '2026-05-30T11:00:00Z'
    }
  ];

  let db = {
    users: defaultUsers,
    courses: defaultCourses,
    enrollments: defaultEnrollments,
    tools: defaultTools,
    resources: defaultResources,
    schedule: defaultSchedule,
    quizzes: defaultQuizzes,
    leaderboard: defaultLeaderboard,
    forum: defaultForum,
    notifications: [] as Notification[]
  };

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    console.log('[DB] New database generated successfully at:', DB_FILE);
  } else {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      // Ensure all fields exist
      db = { ...db, ...parsed };
      // Save sanitized version
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Read error, resetting db.json', err);
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    }
  }
}

// Read whole DB helper
function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading DB', e);
    return {
      users: [], courses: [], enrollments: [], tools: [], 
      resources: [], schedule: [], quizzes: [], leaderboard: [], forum: [], notifications: []
    };
  }
}

// Write helper
function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing DB', e);
  }
}

// Master initialization
initDatabase();

// Instantiate Gemini API Server-Side cleanly
let googleAI: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    googleAI = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' }
      }
    });
    console.log('[Gemini] googleAI instantiated successfully from API secret');
  } else {
    console.warn('[Gemini] GEMINI_API_KEY not configured. Falling back to structured simulated expert responses.');
  }
} catch (err) {
  console.error('[Gemini] Failed to load GoogleGenAI SDK safely', err);
}

// Express initialization
async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares supporting base64 inputs securely
  app.use(express.json({ limit: '12mb' }));
  app.use(express.urlencoded({ extended: true, limit: '12mb' }));

  // Helper function to mock hash passwords (for presentation logic, keeping it clean)
  const sanitizeStr = (s: string) => s.trim().replace(/['"<>]/g, '');

  // ---------------- AUTH API ENDPOINTS ----------------

  app.post('/api/auth/signup', (req: Request, res: Response) => {
    const { name, email, phone, password, referralCode } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields are strictly required.' });
    }

    const emailClean = email.toLowerCase().trim();
    const db = readDB();

    const exists = db.users.find((u: User) => u.email === emailClean);
    if (exists) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    // Generate high-value short code for new registrant
    const newRefCode = `${name.substring(0, 4).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`;

    const newUser: User = {
      id: 'u-' + Math.random().toString(36).substring(2, 9),
      name: sanitizeStr(name),
      email: emailClean,
      phone: sanitizeStr(phone),
      role: 'student',
      referralCode: newRefCode,
      referredByBy: referralCode ? referralCode.toUpperCase().trim() : undefined,
      points: referralCode ? 15 : 0, // Instant signup points if referred!
      badges: ['Early Bird'],
      streak: 1,
      createdAt: new Date().toISOString(),
      achievements: ['Account Registered'],
      referrals: [],
      referredDownloads: 0,
      selectedTimeSlots: {}
    };

    // Store secure password in database to support realistic password recovery
    (newUser as any).password = password;

    db.users.push(newUser);

    // Simulated email body matching high-end Gmail credentials dispatch
    const credentialsEmail = {
      to: newUser.email,
      from: 'credentials-daemon@rawthink.ai',
      subject: '🔑 Your RAWTHINK AI Academy Secure Credentials Generated!',
      body: `Dear ${newUser.name},

Your RAWTHINK AI student account has been successfully generated by our server-side secure enrollment engine.

-----------------------------------------
SECURE LOGIN CREDENTIALS:
-----------------------------------------
Email / Username : ${newUser.email}
Profile Password : ${password}
Your Invite Code : ${newRefCode}
-----------------------------------------

Nepal PWA Mobile App Access:
This app supports progressive loading! Click the "Download App" button on your mobile device browser header to place RAWTHINK AI directly onto your home screen.

Master AI. Build Faster. Stay Ahead.
Best Regards,
The RAWTHINK Automated Credentials System
Pepsicola, Suncity, Kathmandu, Nepal`
    };

    // Store the sent mail log in backend memory for debugging / visual inspection
    if (!db.sentMailsLog) {
      db.sentMailsLog = [];
    }
    db.sentMailsLog.push({
      id: 'mail-' + Math.random().toString(36).substring(2, 9),
      userId: newUser.id,
      timestamp: new Date().toISOString(),
      ...credentialsEmail
    });

    // Dynamic referral matching
    if (referralCode) {
      const codeClean = referralCode.toUpperCase().trim();
      const referrer = db.users.find((u: User) => u.referralCode === codeClean);
      if (referrer) {
        referrer.points = (referrer.points || 0) + 33; // Premium bonus!
        
        // Ensure arrays are initialized
        if (!referrer.referrals) referrer.referrals = [];
        if (!referrer.referrals.includes(newUser.email)) {
          referrer.referrals.push(newUser.email);
        }

        if (!referrer.achievements.includes('Referrer Star')) {
          referrer.achievements.push('Referrer Star');
        }

        const count = referrer.referrals.length;
        let milestoneMsg = '';
        if (count >= 10) {
          milestoneMsg = '🎁 Sensational! You have referred 10+ friends. You entered the 100% FREE class voucher tier!';
          referrer.badges.push('Sovereign Ref');
        } else if (count >= 6) {
          milestoneMsg = '🔥 Incredible! You have referred 6 friends. You unlocked a 30% OFF pricing tier!';
        } else if (count >= 4) {
          milestoneMsg = '⭐ Excellent job! You have referred 4 friends. You unlocked a 20% OFF pricing tier!';
        }

        db.notifications.push({
          id: 'notif-' + Math.random().toString(36).substring(2, 9),
          userId: referrer.id,
          text: `🎉 A new student (${newUser.name}) registered using your referral! You earned +33 Points! Total: ${count}. ${milestoneMsg}`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    }

    // Add general notification
    db.notifications.push({
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      userId: newUser.id,
      text: `👋 Welcome to RAWTHINK AI platform! Your login credentials have been dispatched to your Gmail context: ${newUser.email}`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    writeDB(db);
    res.json({ 
      success: true, 
      user: newUser, 
      simulatedEmailSent: credentialsEmail 
    });
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = readDB();
    const emailClean = email.toLowerCase().trim();

    let user = db.users.find((u: User) => u.email === emailClean);
    if (!user) {
      if (emailClean === 'admin@rawthink.ai') {
        user = db.users.find((u: User) => u.role === 'admin');
      } else {
        return res.status(401).json({ error: 'No account registered with this email.' });
      }
    }

    // Authenticate password if stored to honor real user login logic
    if ((user as any).password && (user as any).password !== password) {
      return res.status(401).json({ error: 'Incorrect credentials password. Please click Forgot Password to check your secure registers.' });
    }

    res.json({ success: true, user });
  });

  app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Please provide Email address.' });
    }

    const db = readDB();
    const emailClean = email.toLowerCase().trim();
    const user = db.users.find((u: User) => u.email === emailClean);

    if (!user) {
      return res.status(404).json({ error: 'No user record matching this email was found in RAWTHINK registers.' });
    }

    // Retrieve or set password
    const userPassword = (user as any).password || 'rawthink123';
    
    const recoveryEmail = {
      to: user.email,
      from: 'security-notify@rawthink.ai',
      subject: '⚠️ RAWTHINK AI: Password Recovery Dispatch Request',
      body: `Hi ${user.name},

You have requested password recovery coordinates for your RAWTHINK AI online account.

-----------------------------------------
YOUR RETRIEVED ACCOUNT ACCESS CODES:
-----------------------------------------
Registered Email : ${user.email}
Secure Password  : ${userPassword}
-----------------------------------------

If you did not make this request, please safely secure your account immediately inside the online platform.

Clear. Actionable. Coded.
RAWTHINK AI Core Infrastructure Team
Pepsicola, Suncity, Kathmandu, Nepal`
    };

    if (!db.sentMailsLog) {
      db.sentMailsLog = [];
    }
    db.sentMailsLog.push({
      id: 'mail-' + Math.random().toString(36).substring(2, 9),
      userId: user.id,
      timestamp: new Date().toISOString(),
      ...recoveryEmail
    });

    writeDB(db);

    res.json({ 
      success: true, 
      message: 'Account recovery email simulated successfully!',
      simulatedEmailSent: recoveryEmail
    });
  });

  // ---------------- GENERAL USER API ----------------

  app.get('/api/user/profile/:id', (req: Request, res: Response) => {
    const db = readDB();
    const user = db.users.find((u: User) => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User profiles not found' });
    }
    res.json({ user });
  });

  // ---------------- COURSES & CLASSES ----------------

  app.get('/api/courses', (req: Request, res: Response) => {
    const db = readDB();
    res.json({ courses: db.courses });
  });

  // eSewa payment submission API
  app.post('/api/enroll', (req: Request, res: Response) => {
    const { userId, courseId, transactionId, remarks, screenshot } = req.body;
    if (!userId || !courseId || !transactionId) {
      return res.status(400).json({ error: 'User ID, Course ID, and eSewa Transaction ID are mandatory.' });
    }

    const db = readDB();
    const user = db.users.find((u: User) => u.id === userId);
    const course = db.courses.find((c: Course) => c.id === courseId);

    if (!user || !course) {
      return res.status(404).json({ error: 'User or course parameters invalid' });
    }

    // Check duplicate pending or active enrollment
    const duplicate = db.enrollments.find((e: Enrollment) => 
      e.userId === userId && e.courseId === courseId && (e.status === 'approved' || e.status === 'pending')
    );

    if (duplicate) {
      return res.status(400).json({ error: 'You already have an active or pending enrollment for this class.' });
    }

    // Calculate and automatically apply referral discount on checkout price
    const referCount = user.referrals?.length || 0;
    let discountPercent = 0;
    if (referCount >= 10) discountPercent = 100;
    else if (referCount >= 6) discountPercent = 30;
    else if (referCount >= 4) discountPercent = 20;

    const discountAmount = Math.round((course.price * discountPercent) / 100);
    const discountedPrice = Math.max(0, course.price - discountAmount);

    const newEnrollment: Enrollment = {
      id: 'en-' + Math.random().toString(36).substring(2, 9),
      userId,
      userName: user.name,
      userEmail: user.email,
      courseId,
      courseTitle: course.title,
      price: discountedPrice,
      transactionId: sanitizeStr(transactionId),
      remarks: remarks ? sanitizeStr(remarks) : undefined,
      screenshotUrl: screenshot || undefined, // Contains base64 screenshot
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.enrollments.push(newEnrollment);

    // Admin notify log
    db.notifications.push({
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      userId: 'admin-1',
      text: `💸 Pending eSewa payment submitted by ${user.name} for ${course.title} (Rs. ${discountedPrice})`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    writeDB(db);
    res.json({ success: true, enrollment: newEnrollment });
  });

  // ---------------- FREE RESOURCE DOWNLOADS TRACKER ----------------

  app.post('/api/resources/unlock', (req: Request, res: Response) => {
    const { userId, resourceId } = req.body;
    if (!userId || !resourceId) {
      return res.status(400).json({ error: 'User ID and Resource ID are required.' });
    }

    const db = readDB();
    const user = db.users.find((u: User) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    if ((user.points || 0) < 50) {
      return res.status(400).json({ error: 'Insufficient coins! Unlock costs 50 coins.' });
    }

    user.points = (user.points || 0) - 50;
    if (!user.unlockedResources) {
      user.unlockedResources = [];
    }
    if (!user.unlockedResources.includes(resourceId)) {
      user.unlockedResources.push(resourceId);
    }

    if (!user.badges.includes('Knowledge Seeker')) {
      user.badges.push('Knowledge Seeker');
    }

    writeDB(db);
    res.json({ 
      success: true, 
      points: user.points, 
      unlockedResources: user.unlockedResources,
      badges: user.badges 
    });
  });

  app.post('/api/feedback', (req: Request, res: Response) => {
    const { userId, type, target, rating, comment } = req.body;
    if (!type || !rating || !comment) {
      return res.status(400).json({ error: 'Type, rating index, and comment are required.' });
    }

    const db = readDB();
    if (!db.feedbacks) {
      db.feedbacks = [];
    }

    const newFeedback = {
      id: 'fb-' + Math.random().toString(36).substring(2, 9),
      userId: userId || 'anonymous',
      type, // 'course' or 'platform'
      target: target ? sanitizeStr(target) : 'General',
      rating: Number(rating),
      comment: sanitizeStr(comment),
      createdAt: new Date().toISOString()
    };

    db.feedbacks.push(newFeedback);

    let awardedCoins = 0;
    if (userId) {
      const user = db.users.find((u: User) => u.id === userId);
      if (user && user.role !== 'admin') {
        user.points = (user.points || 0) + 10;
        awardedCoins = 10;
        db.notifications.push({
          id: 'notif-' + Math.random().toString(36).substring(2, 9),
          userId: user.id,
          text: `🎁 Thank you for your feedback! You've been rewarded +10 Coins! Keep shaping RAWTHINK AI!`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    }

    writeDB(db);
    res.json({ success: true, feedback: newFeedback, awardedCoins });
  });

  app.post('/api/resources/download/:id', (req: Request, res: Response) => {
    const db = readDB();
    const resource = db.resources.find((r: ResourceDownload) => r.id === req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource item not found' });
    }

    resource.downloadsCount = (resource.downloadsCount || 0) + 1;
    
    // Award the user points for studying if userId provided
    const { userId } = req.body;
    if (userId) {
      const user = db.users.find((u: User) => u.id === userId);
      if (user) {
        user.points = (user.points || 0) + 5;
        if (!user.achievements.includes('Knowledge Seeker')) {
          user.achievements.push('Knowledge Seeker');
        }
      }
    }

    writeDB(db);
    res.json({ success: true, downloadsCount: resource.downloadsCount });
  });

  app.get('/api/resources', (req: Request, res: Response) => {
    const db = readDB();
    res.json({ resources: db.resources });
  });

  app.get('/api/tools', (req: Request, res: Response) => {
    const db = readDB();
    res.json({ tools: db.tools });
  });

  // Create a new AI tool
  app.post('/api/tools', (req: Request, res: Response) => {
    const { name, category, description, tags, link, iconName } = req.body;
    if (!name || !category || !description || !link) {
      return res.status(400).json({ error: 'Missing required tool fields' });
    }

    const db = readDB();
    const newTool = {
      id: `tool-${Date.now()}`,
      name,
      category,
      description,
      tags: tags || [],
      link,
      iconName: iconName || 'Cpu'
    };

    db.tools.push(newTool);
    writeDB(db);
    res.status(201).json({ success: true, tool: newTool, tools: db.tools });
  });

  // Update/edit an AI tool
  app.put('/api/tools/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, category, description, tags, link, iconName } = req.body;

    const db = readDB();
    const toolIndex = db.tools.findIndex((t: any) => t.id === id);
    if (toolIndex === -1) {
      return res.status(404).json({ error: 'AI Tool not found' });
    }

    db.tools[toolIndex] = {
      ...db.tools[toolIndex],
      name: name !== undefined ? name : db.tools[toolIndex].name,
      category: category !== undefined ? category : db.tools[toolIndex].category,
      description: description !== undefined ? description : db.tools[toolIndex].description,
      tags: tags !== undefined ? tags : db.tools[toolIndex].tags,
      link: link !== undefined ? link : db.tools[toolIndex].link,
      iconName: iconName !== undefined ? iconName : db.tools[toolIndex].iconName,
    };

    writeDB(db);
    res.json({ success: true, tool: db.tools[toolIndex], tools: db.tools });
  });

  // Delete an AI tool
  app.delete('/api/tools/:id', (req: Request, res: Response) => {
    const { id } = req.params;

    const db = readDB();
    const initialLength = db.tools.length;
    db.tools = db.tools.filter((t: any) => t.id !== id);

    if (db.tools.length === initialLength) {
      return res.status(404).json({ error: 'AI Tool not found' });
    }

    writeDB(db);
    res.json({ success: true, tools: db.tools });
  });

  // ---------------- INTERACTIVE QUIZZES ----------------

  app.post('/api/quiz/submit', (req: Request, res: Response) => {
    const { userId, score, totalQuestions } = req.body;
    if (!userId || score === undefined) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const db = readDB();
    const user = db.users.find((u: User) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Points multiplier: 25 points per correct answer
    const pointsGranted = score * 25;
    user.points = (user.points || 0) + pointsGranted;
    user.streak = (user.streak || 1) + 1;

    // Award badges based on quiz performance
    if (score === totalQuestions && !user.badges.includes('AI Mastermind')) {
      user.badges.push('AI Mastermind');
    }
    if (!user.achievements.includes('Quiz Ace') && score >= 3) {
      user.achievements.push('Quiz Ace');
    }

    const entry: QuizHistory = {
      id: 'lh-' + Math.random().toString(36).substring(2, 9),
      userId,
      userName: user.name,
      score,
      totalQuestions,
      pointsEarned: pointsGranted,
      date: new Date().toISOString().split('T')[0]
    };

    db.leaderboard.unshift(entry);
    
    // Sort leaderboard top score order
    db.leaderboard.sort((a: QuizHistory, b: QuizHistory) => b.score - a.score || new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Prune to top 20
    db.leaderboard = db.leaderboard.slice(0, 20);

    writeDB(db);
    res.json({ success: true, pointsEarned: pointsGranted, currentPoints: user.points, streak: user.streak });
  });

  app.get('/api/leaderboard', (req: Request, res: Response) => {
    const db = readDB();
    res.json({ leaderboard: db.leaderboard });
  });

  app.get('/api/referrals/leaderboard', (req: Request, res: Response) => {
    const db = readDB();
    const students = db.users.filter((u: any) => u.role === 'student');
    const leaderboard = students.map((u: any) => ({
      id: u.id,
      name: u.name,
      referralsCount: u.referrals ? u.referrals.length : 0,
      points: u.points || 0
    }));
    // Sort by referralsCount desc, then points desc
    leaderboard.sort((a: any, b: any) => b.referralsCount - a.referralsCount || b.points - a.points);
    res.json({ leaderboard: leaderboard.slice(0, 5) });
  });

  // ---------------- GENERAL COMMUNITY BOARD / FORUM ----------------

  app.get('/api/community/posts', (req: Request, res: Response) => {
    const db = readDB();
    res.json({ forum: db.forum });
  });

  app.post('/api/community/posts', (req: Request, res: Response) => {
    const { userId, title, content, category } = req.body;
    if (!userId || !title || !content || !category) {
      return res.status(400).json({ error: 'Please enter Title, Category and Content body.' });
    }

    const db = readDB();
    const user = db.users.find((u: User) => u.id === userId);
    if (!user) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const newPost: ForumPost = {
      id: 'post-' + Math.random().toString(36).substring(2, 9),
      userId,
      userName: user.name,
      userRole: user.role === 'admin' ? 'admin' : 'student',
      category: category,
      title: sanitizeStr(title),
      content: sanitizeStr(content),
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString()
    };

    db.forum.unshift(newPost);
    user.points = (user.points || 0) + 10; // reward interaction points
    
    writeDB(db);
    res.json({ success: true, post: newPost });
  });

  app.post('/api/community/posts/:id/like', (req: Request, res: Response) => {
    const db = readDB();
    const post = db.forum.find((p: ForumPost) => p.id === req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.likes = (post.likes || 0) + 1;
    writeDB(db);
    res.json({ success: true, likes: post.likes });
  });

  app.post('/api/community/posts/:id/comment', (req: Request, res: Response) => {
    const { userId, content } = req.body;
    if (!userId || !content) return res.status(400).json({ error: 'Comment body empty' });

    const db = readDB();
    const post = db.forum.find((p: ForumPost) => p.id === req.params.id);
    const user = db.users.find((u: User) => u.id === userId);

    if (!post || !user) return res.status(404).json({ error: 'Post or user not found' });

    post.comments.push({
      id: 'comment-' + Math.random().toString(36).substring(2, 9),
      userId,
      userName: user.name,
      userRole: user.role === 'admin' ? 'admin' : 'student',
      content: sanitizeStr(content),
      createdAt: new Date().toISOString()
    });

    writeDB(db);
    res.json({ success: true, comments: post.comments });
  });

  // ---------------- GENERAL CALENDAR & NOTIFICATIONS ----------------

  app.get('/api/schedule', (req: Request, res: Response) => {
    const db = readDB();
    res.json({ schedule: db.schedule });
  });

  // Admin schedules a class session on the calendar
  app.post('/api/schedule', (req: Request, res: Response) => {
    const { courseId, workshopName, instructor, date, time, totalSeats } = req.body;
    if (!courseId || !workshopName || !instructor || !date || !time) {
      return res.status(400).json({ error: 'All fields are strictly required to schedule a class.' });
    }

    const db = readDB();
    const newSession: SessionSchedule = {
      id: 'session-' + Math.random().toString(36).substring(2, 9),
      courseId,
      workshopName: sanitizeStr(workshopName),
      instructor: sanitizeStr(instructor),
      date: sanitizeStr(date),
      time: sanitizeStr(time),
      seatsRemaining: Number(totalSeats || 30),
      totalSeats: Number(totalSeats || 30)
    };

    if (!db.schedule) {
      db.schedule = [];
    }
    db.schedule.push(newSession);

    // Push notification to all students about the newly scheduled slot
    db.users.forEach((u: User) => {
      if (u.role === 'student') {
        db.notifications.push({
          id: 'notif-' + Math.random().toString(36).substring(2, 9),
          userId: u.id,
          text: `📅 New class scheduled: "${workshopName}" on ${date} at ${time}. Reserve your slot now!`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    });

    writeDB(db);
    res.json({ success: true, session: newSession, schedule: db.schedule });
  });

  // Approved student reserves a specific class session schedule slot
  app.post('/api/user/book-slot', (req: Request, res: Response) => {
    const { userId, courseId, timeSlotId } = req.body;
    if (!userId || !courseId || !timeSlotId) {
      return res.status(400).json({ error: 'Core parameter criteria missing.' });
    }

    const db = readDB();
    const user = db.users.find((u: User) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'Student record could not be located.' });
    }

    const session = db.schedule.find((s: SessionSchedule) => s.id === timeSlotId);
    if (!session) {
      return res.status(404).json({ error: 'Class schedule slot not found.' });
    }

    if (session.seatsRemaining <= 0) {
      return res.status(400).json({ error: 'This schedule slot is completely full. Please choose another.' });
    }

    if (!user.selectedTimeSlots) {
      user.selectedTimeSlots = {};
    }

    // Check if they booked already and restore a seat if they change their mind
    const previousSlotId = user.selectedTimeSlots[courseId];
    if (previousSlotId && previousSlotId !== timeSlotId) {
      const prevSession = db.schedule.find((s: SessionSchedule) => s.id === previousSlotId);
      if (prevSession) {
        prevSession.seatsRemaining = Math.min(prevSession.seatsRemaining + 1, prevSession.totalSeats);
      }
    }

    // Only deduct if booking a new slot or changing
    if (previousSlotId !== timeSlotId) {
      session.seatsRemaining = Math.max(session.seatsRemaining - 1, 0);
    }

    user.selectedTimeSlots[courseId] = timeSlotId;

    db.notifications.push({
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      userId: user.id,
      text: `✅ Time slot reserved! You are booked for "${session.workshopName}" on ${session.date} at ${session.time}.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    writeDB(db);
    res.json({ success: true, user });
  });

  // Simulator for a referred friend registering to get instant tiers
  app.post('/api/user/simulate-referral-signup', (req: Request, res: Response) => {
    const { userId, friendEmail, friendName } = req.body;
    if (!userId || !friendEmail || !friendName) {
      return res.status(400).json({ error: 'Please provide friend name and email address.' });
    }

    const db = readDB();
    const user = db.users.find((u: User) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'Referrer profile not found.' });
    }

    const friendMailClean = friendEmail.toLowerCase().trim();
    const exists = db.users.find((u: User) => u.email === friendMailClean);
    if (exists) {
      return res.status(400).json({ error: 'A registree with this friend email already exists.' });
    }

    // Sign up friend
    const friendRefCode = `${friendName.substring(0, 4).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`;
    const newFriend: User = {
      id: 'u-' + Math.random().toString(36).substring(2, 9),
      name: sanitizeStr(friendName),
      email: friendMailClean,
      phone: '9841' + Math.floor(Math.random() * 1000000),
      role: 'student',
      referralCode: friendRefCode,
      referredByBy: user.referralCode,
      points: 15,
      badges: ['Early Bird'],
      streak: 1,
      createdAt: new Date().toISOString(),
      achievements: ['Account Registered', 'Referred User'],
      referrals: [],
      referredDownloads: 0,
      selectedTimeSlots: {}
    };

    (newFriend as any).password = 'friend123';
    db.users.push(newFriend);

    // Track in user
    if (!user.referrals) {
      user.referrals = [];
    }
    if (!user.referrals.includes(friendMailClean)) {
      user.referrals.push(friendMailClean);
    }

    user.points = (user.points || 0) + 33;

    const referralsCount = user.referrals.length;
    let milestoneMsg = '';
    if (referralsCount >= 10) {
      milestoneMsg = '🎁 Congratulations! You hit 10 referrals & unlocked the 100% FREE class voucher tier!';
      if (!user.badges.includes('Sovereign Ref')) user.badges.push('Sovereign Ref');
    } else if (referralsCount >= 6) {
      milestoneMsg = '🔥 Wonderful! You hit 6 referrals & unlocked the 30% OFF pricing tier!';
    } else if (referralsCount >= 4) {
      milestoneMsg = '⭐ Awesome! You hit 4 referrals & unlocked the 20% OFF pricing tier!';
    }

    db.notifications.push({
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      userId: user.id,
      text: `🎉 Dynamic Referral Added: "${friendName}" registered using your code! +33 Points awarded. Total referrals: ${referralsCount}. ${milestoneMsg}`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    writeDB(db);
    res.json({ success: true, user, referralsCount });
  });

  // Simulator for referred friend downloading the app (unlocks PDF certificate download!)
  app.post('/api/user/simulate-referral-download', (req: Request, res: Response) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is strictly required.' });
    }

    const db = readDB();
    const user = db.users.find((u: User) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    user.referredDownloads = (user.referredDownloads || 0) + 1;
    
    db.notifications.push({
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      userId: user.id,
      text: `📱 One of your referred friends successfully downloaded the RAWTHINK AI mobile PWA app! Referred downloads: ${user.referredDownloads}`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    writeDB(db);
    res.json({ success: true, user, referredDownloads: user.referredDownloads });
  });

  app.get('/api/notifications/:userId', (req: Request, res: Response) => {
    const db = readDB();
    const list = db.notifications.filter((n: Notification) => n.userId === req.params.userId);
    res.json({ notifications: list });
  });

  // ---------------- SUPER ADMIN API CONTROLS ----------------

  app.get('/api/admin/users', (req: Request, res: Response) => {
    const db = readDB();
    res.json({ users: db.users });
  });

  app.get('/api/admin/payments', (req: Request, res: Response) => {
    const db = readDB();
    res.json({ enrollments: db.enrollments });
  });

  // Approve/reject transaction manually
  app.post('/api/admin/payments/decide', (req: Request, res: Response) => {
    const { enrollmentId, decision, adminId } = req.body; // decision: 'approved' | 'rejected'
    if (!enrollmentId || !decision) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const db = readDB();
    const admin = db.users.find((u: User) => u.id === adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ error: 'Admin-only module authorization failed.' });
    }

    const enrollment = db.enrollments.find((e: Enrollment) => e.id === enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment reference not found' });
    }

    enrollment.status = decision;

    const student = db.users.find((u: User) => u.id === enrollment.userId);
    
    if (student) {
      if (decision === 'approved') {
        // Calculate progressive rewards based on total approved workshop count
        const approvedCount = db.enrollments.filter((e: Enrollment) => e.userId === student.id && e.status === 'approved').length;
        let enrollmentCoins = 100;
        if (approvedCount === 2) {
          enrollmentCoins = 120;
        } else if (approvedCount >= 3) {
          enrollmentCoins = 299;
        }
        student.points = (student.points || 0) + enrollmentCoins;

        if (!student.badges.includes('Scholar')) {
          student.badges.push('Scholar');
        }
        
        db.notifications.push({
          id: 'notif-' + Math.random().toString(36).substring(2, 9),
          userId: student.id,
          text: `🎉 CONGRATULATIONS! Your payment of Rs. ${enrollment.price} for "${enrollment.courseTitle}" has been verified! Welcome to class!`,
          isRead: false,
          createdAt: new Date().toISOString()
        });

        // Dedup decrement in workshops schedule
        const session = db.schedule.find((s: SessionSchedule) => s.courseId === enrollment.courseId);
        if (session && session.seatsRemaining > 0) {
          session.seatsRemaining -= 1;
        }

      } else {
        db.notifications.push({
          id: 'notif-' + Math.random().toString(36).substring(2, 9),
          userId: student.id,
          text: `❌ eSewa verification alert: Your transaction (ID: ${enrollment.transactionId}) for "${enrollment.courseTitle}" could not be confirmed. Please check your transaction details or re-upload screenshot.`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    }

    writeDB(db);
    res.json({ success: true, enrollment });
  });

  // Admin issue digital certificate manually override
  app.post('/api/admin/certificates/issue', (req: Request, res: Response) => {
    const { userId, certificateName, adminId } = req.body;
    const db = readDB();
    
    const admin = db.users.find((u: User) => u.id === adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized credentials' });
    }

    const student = db.users.find((u: User) => u.id === userId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    if (!student.achievements.includes(`Certified: ${certificateName}`)) {
      student.achievements.push(`Certified: ${certificateName}`);
    }

    db.notifications.push({
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      userId: student.id,
      text: `🎓 A verified excellence credentials certificate has been generated for ${certificateName}! Check your profile.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    writeDB(db);
    res.json({ success: true, achievements: student.achievements });
  });

  // ---------------- EXCEL CSV EXPORTER -----------------

  app.get('/api/admin/export/:type', (req: Request, res: Response) => {
    const type = req.params.type;
    const db = readDB();
    let csvContent = '';
    let filename = `rawthink_${type}_export.csv`;

    switch(type) {
      case 'users':
        csvContent = 'ID,Name,Email,Phone,Role,Points,Streak,CreatedDate\n';
        db.users.forEach((u: User) => {
          csvContent += `"${u.id}","${u.name}","${u.email}","${u.phone}","${u.role}",${u.points || 0},${u.streak || 1},"${u.createdAt}"\n`;
        });
        break;

      case 'paid':
        csvContent = 'EnrollmentID,StudentName,Email,CourseName,Price(Rs),TransactionID,Status,UploadedDate\n';
        db.enrollments.forEach((e: Enrollment) => {
          csvContent += `"${e.id}","${e.userName}","${e.userEmail}","${e.courseTitle}",${e.price},"${e.transactionId || ''}","${e.status}","${e.createdAt}"\n`;
        });
        break;

      case 'participants':
        csvContent = 'SessionID,WorkshopName,Instructor,Date,Time,SeatsRemaining,TotalSeats\n';
        db.schedule.forEach((s: SessionSchedule) => {
          csvContent += `"${s.id}","${s.workshopName}","${s.instructor}","${s.date}","${s.time}",${s.seatsRemaining},${s.totalSeats}\n`;
        });
        break;

      case 'referrals':
        csvContent = 'StudentID,StudentName,ReferralCode,ReferredBy,PointsTotal,Streaks\n';
        db.users.forEach((u: User) => {
          if (u.referredByBy || u.points > 100) {
            csvContent += `"${u.id}","${u.name}","${u.referralCode}","${u.referredByBy || 'None'}",${u.points},${u.streak}\n`;
          }
        });
        break;

      case 'downloads':
        csvContent = 'ResourceID,Title,Category,DownloadsCounter,Filesize\n';
        db.resources.forEach((r: ResourceDownload) => {
          csvContent += `"${r.id}","${r.title}","${r.category}",${r.downloadsCount},"${r.fileSize}"\n`;
        });
        break;

      default:
        return res.status(400).send('Invalid export model type');
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    return res.status(200).send(csvContent);
  });

  // ---------------- GEMINI AI SERVER INTERACTIVE WORKSHOP TUTOR -----------------
  
  app.post('/api/ai/workshop-qna', async (req: Request, res: Response) => {
    const { prompt, courseContext, userId } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt instruction cannot be empty.' });
    }

    const db = readDB();
    const user = userId ? db.users.find((u: any) => u.id === userId) : null;
    let deductPoints = false;

    if (user && user.role !== 'admin') {
      if ((user.points || 0) < 100) {
        return res.status(403).json({ 
          error: '⚠️ Insufficient Coins! Asking the advanced AI tutor costs 100 coins. Navigate to Classrooms or refer friends to earn more!' 
        });
      }
      deductPoints = true;
    }

    // Lazy fallback check
    if (!googleAI) {
      // Simulate highly advanced educational instructions matching Nepal digital framework (returns premium text)
      const simulatedResponses = [
        `### 👋 RAWTHINK AI Interactive Workshop Guide\n\nTo adopt advanced prompting matrices in Nepal's local marketplace, configure high-fidelity system personas:\n\n1. **Few-Shot Anchor**: Provide 2-3 specific Nepalese rupee conversions or regional client briefs so ChatGPT maps context correctly.\n2. **Delimiter Isolation**: Encapsulate CSV sheets or course slides inside structural tags like \`[data]\` or \`[instructions]\` to reduce confusion.\n3. **Formatting Constraints**: Explicitly instruct: *"Respond only in structured markdown bullets pairing Kathmandu Standard Time (NPT)."*`,
        `### 🚀 Professional Automation Advice\n\nWhen utilizing automated web scrappers or developer compiler APIs (Course 3 blueprint):\n- Always secure keys using backend server routes (like standard Node environment secrets).\n- Leverage asynchronous task schedules to throttle traffic.\n- When generating digital code with Cursor, start prompts with clear architectural declarations before requesting individual functions.`,
        `### 🧠 Model Chaining Patterns\n\nFor high-value study pipelines (Course 2 Productivity systems):\n- Ask the model to generate a hierarchical syllabus outline first.\n- In a secondary prompt, feed the generated outline and instruct the compiler: *"Expand Section 1 inside detailed educational narratives, keeping the tone friendly, objective, and scannable."*`
      ];

      const chosen = simulatedResponses[Math.floor(Math.random() * simulatedResponses.length)];
      
      if (deductPoints && user) {
        user.points = (user.points || 0) - 100;
        writeDB(db);
      }

      return res.json({ 
        text: `*(Simulated expert mode - Cost: 100 Coins deducted)*\n\n${chosen}\n\n*Note: To query live Gemini models, please set a valid GEMINI_API_KEY in Settings > Secrets.*`,
        updatedPoints: user ? user.points : undefined
      });
    }

    try {
      const sanitizedPrompt = sanitizeStr(prompt);
      const systemInstruction = `You are the master RAWTHINK AI Workshop Tutor, a friendly, objective, and world-class educational instructor teaching Nepalese and South Asian developers, content writers, and marketing professionals. 
      Help them build faster and achieve excellence. You are explaining concepts mentioned in "${courseContext || 'AI and Prompt Engineering'}".
      Format your response beautifully with structural Markdown bullet points, clear bold topics, and clean examples. Keep answers concise, helpful, and free from sales filler.`;

      const response = await googleAI.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: sanitizedPrompt,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });

      const aiText = response.text || 'No response returned from Gemini API.';
      
      if (deductPoints && user) {
        user.points = (user.points || 0) - 100;
        writeDB(db);
      }

      return res.json({ 
        text: aiText,
        updatedPoints: user ? user.points : undefined
      });

    } catch (err: any) {
      console.error('[Gemini API Endpoint Error]', err);
      return res.status(500).json({ 
        error: `Failed to retrieve response: ${err.message || err.toString()}`,
        text: `Failed to query the AI Model. Fallback simulated tip: When configuring Prompt matrices, maintain concise, sequential guidelines inside system delimiters.`
      });
    }
  });

  // ---------------- GENERAL STATS SUMMARY -----------------

  app.get('/api/admin/stats', (req: Request, res: Response) => {
    const db = readDB();
    const totalUsers = db.users.length;
    const totalRevenue = db.enrollments
      .filter((e: Enrollment) => e.status === 'approved')
      .reduce((sum: number, e: Enrollment) => sum + e.price, 0);

    const registeredStudents = db.users.filter((u: User) => u.role === 'student').length;
    const pendingPayments = db.enrollments.filter((e: Enrollment) => e.status === 'pending').length;
    const upcomingWorkshops = db.schedule.length;

    res.json({
      totalUsers,
      totalRevenue,
      registeredStudents,
      pendingPayments,
      upcomingWorkshops,
      recentActivity: db.enrollments.slice(-5)
    });
  });

  // ---------------- MIDDLEWARE & STATIC SERVING ----------------

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RAWTHINK AI Backend] Server successfully booted at http://localhost:${PORT}`);
  });
}

startServer();
