var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  createApp: () => createApp
});
module.exports = __toCommonJS(server_exports);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_express_session = __toESM(require("express-session"), 1);
var import_passport = __toESM(require("passport"), 1);
var import_nodemailer = __toESM(require("nodemailer"), 1);
var import_passport_google_oauth20 = require("passport-google-oauth20");
var import_passport_apple = __toESM(require("passport-apple"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
import_dotenv.default.config();
var SMTP_SERVICE = process.env.SMTP_SERVICE || "gmail";
var SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
var SMTP_PORT = Number(process.env.SMTP_PORT || 587);
var SMTP_USER = process.env.SMTP_USER || "rawthinkofficial.org@gmail.com";
var SMTP_PASS = process.env.SMTP_PASS || "";
var SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;
var transporterOptions = SMTP_SERVICE ? { service: SMTP_SERVICE, auth: { user: SMTP_USER, pass: SMTP_PASS } } : {
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
};
var emailTransporter = SMTP_USER && SMTP_PASS ? import_nodemailer.default.createTransport(transporterOptions) : null;
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var DB_FILE = import_path.default.join(DATA_DIR, "db.json");
function initDatabase() {
  if (!import_fs.default.existsSync(DATA_DIR)) {
    import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
  }
  const defaultCourses = [
    {
      id: "course-1",
      title: "AI Foundations Bootcamp",
      price: 299,
      duration: "1 Hour",
      features: [
        "AI Basics & Evolution",
        "Introduction to ChatGPT & Modern LLMs",
        "Prompting Fundamentals & Structure",
        "AI Advantages in Daily Workflows",
        "AI Limitations & Hallucinations",
        "Interactive Live Q&A Session"
      ],
      bonuses: [
        "AI Starter Guide PDF",
        "Premium Beginner Prompt Pack",
        "Official RAWTHINK AI Certificate"
      ],
      schedule: "Every Saturday, 2:00 PM - 3:00 PM NPT"
    },
    {
      id: "course-2",
      title: "AI Productivity Workshop",
      price: 349,
      duration: "2 Hours",
      badge: "Limited Seats",
      features: [
        "Advanced System Role Prompting",
        "AI for Academic Studies & Research",
        "AI for Automated Presentation Writing",
        "Personal Productivity Systems & Dashboards",
        "Practical Live Exercises & Code Generation",
        "Visual Asset Design with AI Canvas"
      ],
      bonuses: [
        "100+ Masterclass Prompt Templates",
        "AI Toolkit Cheat Sheet",
        "Direct Lifetime Recording Access",
        "Official Completion Certificate"
      ],
      schedule: "Every Sunday, 11:00 AM - 1:00 PM NPT"
    },
    {
      id: "course-3",
      title: "AI Development & Automation Masterclass",
      price: 599,
      duration: "3 Hours",
      badge: "Most Popular",
      features: [
        "Integrating AI APIs inside Developer projects",
        "Building Automated Workflows & Orchestrators",
        "AI Assistants, Autonomous Agents, & Web Scraping",
        "Solving Real-world Business Use Cases with AI",
        "Full Practical Projects From Scratch (Coded Live)",
        "Connecting Frontend Apps securely to Backend AI Nodes"
      ],
      bonuses: [
        "Developer Project Templates Archive",
        "Raw Premium Developers Prompt Library",
        "Exclusive RAWTHINK Discord VIP Channel",
        "Vetted Digital Career Certificate"
      ],
      schedule: "Every Wednesday, 6:00 PM - 9:00 PM NPT"
    }
  ];
  const defaultTools = [
    // Writing Tools
    { id: "tool-1", name: "ChatGPT", category: "Writing", description: "Advanced conversational agent for writing, editing, and planning content.", tags: ["LLM", "Writing", "Free Tier"], link: "https://chatgpt.com", iconName: "MessageSquare" },
    { id: "tool-2", name: "Jasper AI", category: "Writing", description: "Enterprise-grade copywriting tool for sales campaigns and newsletters.", tags: ["Copywriting", "Paid"], link: "https://jasper.ai", iconName: "PenTool" },
    { id: "tool-3", name: "Copy.ai", category: "Writing", description: "AI writing assistant that streamlines corporate social copy generation.", tags: ["Social Media", "Paid"], link: "https://copy.ai", iconName: "FileText" },
    // Image Tools
    { id: "tool-4", name: "Midjourney", category: "Image", description: "State-of-the-art artistic graphics engine operating via Discord commands.", tags: ["Art", "Community", "Paid"], link: "https://midjourney.com", iconName: "Palette" },
    { id: "tool-5", name: "DALL-E 3", category: "Image", description: "OpenAI text-to-image engine with exceptional instruction adherence.", tags: ["Image Gen", "ChatGPT Integration"], link: "https://openai.com/dall-e-3", iconName: "Image" },
    { id: "tool-6", name: "Stable Diffusion", category: "Image", description: "Open-source photorealistic image models suitable for self-hosting.", tags: ["Open Source", "Advanced"], link: "https://stability.ai", iconName: "Layers" },
    // Video Tools
    { id: "tool-7", name: "Runway Gen-2", category: "Video", description: "Award-winning video generation platform utilizing multimodality inputs.", tags: ["Video Gen", "Paid"], link: "https://runwayml.com", iconName: "Tv" },
    { id: "tool-8", name: "Sora", category: "Video", description: "Complex physics simulator producing high-fidelity cinematic video spans.", tags: ["Cinematic", "OpenAI"], link: "https://openai.com/sora", iconName: "Video" },
    { id: "tool-9", name: "Pika Labs", category: "Video", description: "Responsive video customization platform specialized in motion control.", tags: ["Animation", "Free Tier"], link: "https://pika.art", iconName: "Clapperboard" },
    // Coding Tools
    { id: "tool-10", name: "GitHub Copilot", category: "Coding", description: "First major IDE autocomplete model improving development speed.", tags: ["Autocomplete", "Developer"], link: "https://github.com/features/copilot", iconName: "Code" },
    { id: "tool-11", name: "Cursor", category: "Coding", description: "Next-generation code compiler IDE optimized for continuous AI pairings.", tags: ["IDE", "Editor", "Highly Recommended"], link: "https://cursor.com", iconName: "Cpu" },
    { id: "tool-12", name: "Windsurf", category: "Coding", description: "AI-native flow editor with collaborative capabilities.", tags: ["IDE", "Flow"], link: "https://codeium.com/windsurf", iconName: "Terminal" },
    // Research Tools
    { id: "tool-13", name: "Consensus", category: "Research", description: "Scientific search machine synthesizing answers from millions of journals.", tags: ["Academic", "Journals"], link: "https://consensus.app", iconName: "Library" },
    { id: "tool-14", name: "Perplexity AI", category: "Research", description: "Dynamic conversational search providing live sources and notes.", tags: ["Search Engine", "Free Tier"], link: "https://perplexity.ai", iconName: "Search" },
    { id: "tool-15", name: "Elicit", category: "Research", description: "Research automation platform mapping concepts, trends, and citations.", tags: ["Research", "Synthesizer"], link: "https://elicit.com", iconName: "BookOpen" },
    // Presentation Tools
    { id: "tool-16", name: "Tome", category: "Presentation", description: "Interactive storytelling platform compiling fully customized decks.", tags: ["Decks", "AI Slides"], link: "https://tome.app", iconName: "Layout" },
    { id: "tool-17", name: "Gamma App", category: "Presentation", description: "Beautiful web-native designer composing pages and presentations.", tags: ["Presentations", "Highly Polished"], link: "https://gamma.app", iconName: "Sparkles" },
    // Productivity Tools
    { id: "tool-18", name: "Notion AI", category: "Productivity", description: "In-workspace collaborator assisting summary writing, translations and spreadsheets.", tags: ["Notes", "Co-Writer"], link: "https://notion.so", iconName: "Briefcase" },
    { id: "tool-19", name: "Otter.ai", category: "Productivity", description: "Live transcription utility taking active minutes during meetings.", tags: ["Minutes", "Transcription"], link: "https://otter.ai", iconName: "Volume2" }
  ];
  const defaultResources = [
    { id: "res-1", title: "AI Beginner Guide PDF", category: "Ebook", downloadsCount: 421, fileSize: "1.4 MB", downloadUrl: "#" },
    { id: "res-2", title: "Ultimate Prompt Engineering Matrix", category: "Prompt Pack", downloadsCount: 512, fileSize: "950 KB", downloadUrl: "#" },
    { id: "res-3", title: "Top 70+ AI Tools Catalog with links", category: "Directory", downloadsCount: 689, fileSize: "1.1 MB", downloadUrl: "#" },
    { id: "res-4", title: "Bootcamp Lecture Notes & Cheat Sheet", category: "Lecture Notes", downloadsCount: 198, fileSize: "620 KB", downloadUrl: "#" },
    { id: "res-5", title: "Nepal-centric AI Career & Business Roadmap", category: "Ebook", downloadsCount: 304, fileSize: "2.1 MB", downloadUrl: "#" },
    { id: "res-6", title: "Midjourney Prompt Cheat Sheet V6", category: "Prompt Pack", downloadsCount: 275, fileSize: "740 KB", downloadUrl: "#" }
  ];
  const defaultSchedule = [
    { id: "sched-1", courseId: "course-1", workshopName: "AI Foundations Bootcamp", instructor: "Er. Sandesh Shrestha", date: "2026-06-06", time: "14:00 - 15:00", seatsRemaining: 18, totalSeats: 50 },
    { id: "sched-2", courseId: "course-2", workshopName: "AI Productivity Workshop", instructor: "Dr. Ramesh Adhikari", date: "2026-06-07", time: "11:00 - 13:00", seatsRemaining: 8, totalSeats: 30 },
    { id: "sched-3", courseId: "course-3", workshopName: "AI Dev & Automation Masterclass", instructor: "Er. Sandesh Shrestha", date: "2026-06-10", time: "18:00 - 21:00", seatsRemaining: 12, totalSeats: 40 }
  ];
  const defaultQuizzes = [
    {
      id: "q-1",
      question: "What does system role prompting refer to in ChatGPT?",
      options: [
        "Setting the conversational limit of ChatGPT",
        "Instructing the chatbot to adopt a specific persona, background, and set of guidelines",
        "Choosing the theme or background color of OpenAI interface",
        "Paying for ChatGPT Plus subscription"
      ],
      correctOptionIndex: 1,
      explanation: "System role prompting anchors the model behaviour by guiding its specific identity, credentials, rules, tone, and processing goals before handling prompt inputs."
    },
    {
      id: "q-2",
      question: "Which prompting pattern forces the LLM to explain thoughts sequentially before concluding?",
      options: [
        "Few-Shot Prompting",
        "Chain-of-Thought (CoT) Prompting",
        "Zero-Shot Prompting",
        "Direct Instruction Pattern"
      ],
      correctOptionIndex: 1,
      explanation: "Chain-of-Thought (CoT) prompting explicitly triggers the model to output intermediate reasoning steps, which improves logic precision."
    },
    {
      id: "q-3",
      question: "What is a hallucination in generative AI?",
      options: [
        "When the server fails to load because of traffic overload",
        "When the AI outputs plausible-sounding but factually incorrect or fabricated claims",
        "When the AI screen flickers red under dark mode settings",
        "A state-of-the-art model specialized in mental health diagnostics"
      ],
      correctOptionIndex: 1,
      explanation: "Hallucination occurs when an LLM synthesizes statements that sound fluent, but are entirely invented or factually incorrect."
    },
    {
      id: "q-4",
      question: "Which of the following is optimal for fine-tuning prompt adherence without writing custom APIs?",
      options: [
        "Providing clear examples (Few-Shot Prompting) and structured XML tag indicators",
        "Re-installing Node modules",
        "Typing prompts in ALL-CAPS screaming format",
        "Ignoring system instructions"
      ],
      correctOptionIndex: 0,
      explanation: "Providing structure like XML tags (<examples>, <context>) and few-shot examples optimizes structured outputs dramatically."
    }
  ];
  const defaultLeaderboard = [
    { id: "lh-1", userId: "user-demo1", userName: "Aayush Koirala", score: 4, totalQuestions: 4, pointsEarned: 100, date: "2026-05-29" },
    { id: "lh-2", userId: "user-demo2", userName: "Supriya Thapa", score: 4, totalQuestions: 4, pointsEarned: 100, date: "2026-05-30" },
    { id: "lh-3", userId: "user-demo3", userName: "Bipin Gurung", score: 3, totalQuestions: 4, pointsEarned: 75, date: "2026-05-31" },
    { id: "lh-4", userId: "user-demo4", userName: "Neha Pokharel", score: 3, totalQuestions: 4, pointsEarned: 75, date: "2026-05-31" }
  ];
  const defaultForum = [
    {
      id: "post-1",
      userId: "admin-1",
      userName: "RAWTHINK AI Team",
      userRole: "admin",
      category: "announcement",
      title: "Welcome to RAWTHINK AI Academy Nepal! \u{1F1F3}\u{1F1F5}",
      content: "We are thrilled to launch this premium digital AI community. Our courses utilize interactive live screens, eSewa verified digital gateways, certificates issuing dashboards, and custom prompt libraries. Jump into the Resources center to grab free guidelines today! Join the discussions, ask questions, or practice prompts here on this forum.",
      likes: 24,
      comments: [
        { id: "c-1", userId: "user-bipin", userName: "Bipin Gurung", userRole: "student", content: "Incredible platform! Really love the clean brown-cream UI, and having a local community makes a big difference.", createdAt: "2026-05-31T00:15:00Z" }
      ],
      createdAt: "2026-05-30T09:00:00Z"
    },
    {
      id: "post-2",
      userId: "user-demo1",
      userName: "Aayush Koirala",
      userRole: "student",
      category: "showcase",
      title: "Automated Kathmandu Bus Route Optimizer with Cursor!",
      content: "Using prompt chaining techniques learned during the automation preview, I configured a full Node compiler inside Cursor to write a route optimizer schema for central KTM. Highly recommend Course 3 code examples!",
      likes: 12,
      comments: [],
      createdAt: "2026-05-31T00:05:00Z"
    }
  ];
  const defaultUsers = [
    {
      id: "admin-1",
      name: "Super Admin",
      email: "admin@rawthink.ai",
      phone: "9841234567",
      role: "admin",
      referralCode: "RAWADMIN",
      points: 1e3,
      badges: ["Founder", "AI Expert"],
      streak: 7,
      createdAt: "2026-05-15T00:00:00Z",
      achievements: ["Community Architect"]
    },
    {
      id: "student-demo",
      name: "Prajwal Shrestha",
      email: "student@gmail.com",
      phone: "9801122334",
      role: "student",
      referralCode: "PRAJWAL9",
      points: 40,
      badges: ["Early Bird"],
      streak: 1,
      createdAt: "2026-05-30T10:00:00Z",
      achievements: ["Account Registered"]
    }
  ];
  const defaultEnrollments = [
    {
      id: "en-1",
      userId: "student-demo",
      userName: "Prajwal Shrestha",
      userEmail: "student@gmail.com",
      courseId: "course-1",
      courseTitle: "AI Foundations Bootcamp",
      price: 299,
      transactionId: "TXN-984218-KTM",
      remarks: "Enrolling in Saturday Bootcamp!",
      status: "approved",
      createdAt: "2026-05-30T11:00:00Z"
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
    notifications: [],
    pendingPayments: []
  };
  if (!import_fs.default.existsSync(DB_FILE)) {
    import_fs.default.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
    console.log("[DB] New database generated successfully at:", DB_FILE);
  } else {
    try {
      const data = import_fs.default.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(data);
      db = { ...db, ...parsed };
      import_fs.default.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
    } catch (err) {
      console.error("[DB] Read error, resetting db.json", err);
      import_fs.default.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
    }
  }
}
function readDB() {
  try {
    const data = import_fs.default.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    console.error("Error reading DB", e);
    return {
      users: [],
      courses: [],
      enrollments: [],
      tools: [],
      resources: [],
      schedule: [],
      quizzes: [],
      leaderboard: [],
      forum: [],
      notifications: [],
      pendingPayments: [],
      announcements: [],
      sentMailsLog: []
    };
  }
}
var writeInProgress = false;
var writeQueue = [];
function writeDB(data) {
  if (writeInProgress) {
    writeQueue[0] = data;
    return;
  }
  writeInProgress = true;
  try {
    const tmp = DB_FILE + ".tmp";
    import_fs.default.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
    import_fs.default.renameSync(tmp, DB_FILE);
  } catch (e) {
    console.error("Error writing DB", e);
  } finally {
    writeInProgress = false;
    if (writeQueue.length > 0) {
      const next = writeQueue.shift();
      process.nextTick(() => writeDB(next));
    }
  }
}
initDatabase();
var googleAI = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    googleAI = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { "User-Agent": "aistudio-build" }
      }
    });
    console.log("[Gemini] googleAI instantiated successfully from API secret");
  } else {
    console.warn("[Gemini] GEMINI_API_KEY not configured. Falling back to structured simulated expert responses.");
  }
} catch (err) {
  console.error("[Gemini] Failed to load GoogleGenAI SDK safely", err);
}
async function createApp() {
  const app = (0, import_express.default)();
  const PORT = Number(process.env.PORT || 3e3);
  app.use(import_express.default.json({ limit: "12mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "12mb" }));
  app.use((0, import_express_session.default)({
    secret: process.env.SESSION_SECRET || "rawthink-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  }));
  app.use(import_passport.default.initialize());
  app.use(import_passport.default.session());
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
  const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID || "";
  const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID || "";
  const APPLE_KEY_ID = process.env.APPLE_KEY_ID || "";
  const APPLE_PRIVATE_KEY = (process.env.APPLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  const APPLE_REDIRECT_URI = process.env.APPLE_REDIRECT_URI || `http://localhost:3000/auth/apple/callback`;
  const pendingOtps = {};
  const sanitizeStr = (s) => s.trim().replace(/['"<>]/g, "");
  import_passport.default.serializeUser((user, done) => {
    done(null, user.id);
  });
  import_passport.default.deserializeUser((id, done) => {
    const db = readDB();
    const user = db.users.find((u) => u.id === id);
    done(null, user || null);
  });
  const findOrCreateSocialUser = (profileEmail, displayName, phoneNumber = "", providerName = "") => {
    const db = readDB();
    const emailClean = profileEmail.toLowerCase().trim();
    let user = db.users.find((u) => u.email === emailClean);
    if (!user) {
      const userPhone = phoneNumber || "";
      const newUser = {
        id: "u-" + Math.random().toString(36).substring(2, 9),
        name: sanitizeStr(displayName),
        email: emailClean,
        phone: userPhone,
        role: "student",
        referralCode: `${providerName.toUpperCase().slice(0, 3)}${Math.floor(Math.random() * 9e3 + 1e3)}`,
        points: 20,
        badges: [`${providerName.charAt(0).toUpperCase() + providerName.slice(1)} Connect`],
        streak: 1,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        achievements: ["Social Login"],
        referrals: [],
        referredDownloads: 0,
        selectedTimeSlots: {}
      };
      newUser.password = `${providerName}-linked`;
      db.users.push(newUser);
      writeDB(db);
      user = newUser;
    }
    return user;
  };
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    import_passport.default.use(new import_passport_google_oauth20.Strategy({
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback"
    }, async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || `google-${profile.id}@rawthink.ai`;
        const name = profile.displayName || "Google User";
        const user = findOrCreateSocialUser(email, name, "", "google");
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }));
  }
  if (APPLE_CLIENT_ID && APPLE_TEAM_ID && APPLE_KEY_ID && APPLE_PRIVATE_KEY) {
    import_passport.default.use(new import_passport_apple.default({
      clientID: APPLE_CLIENT_ID,
      teamID: APPLE_TEAM_ID,
      keyID: APPLE_KEY_ID,
      privateKey: APPLE_PRIVATE_KEY,
      callbackURL: "/auth/apple/callback",
      passReqToCallback: false
    }, async (_accessToken, _refreshToken, idToken, profile, done) => {
      try {
        const email = profile.email || `apple-${profile.id}@rawthink.ai`;
        const name = profile.name?.firstName ? `${profile.name.firstName} ${profile.name.lastName || ""}`.trim() : "Apple User";
        const user = findOrCreateSocialUser(email, name, "", "apple");
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }));
  }
  const renderLoginSuccessPage = (res, user) => {
    return res.send(`<!doctype html><html><head><meta charset="utf-8"><title>RAWTHINK AI Login Success</title></head><body><script>
      const user = ${JSON.stringify(user)};
      window.localStorage.setItem('rawthink_user', JSON.stringify(user));
      window.location.href = '/';
    </script></body></html>`);
  };
  const renderLoginFailurePage = (res, message = "Login failed") => {
    return res.status(401).send(`<!doctype html><html><head><meta charset="utf-8"><title>RAWTHINK AI Login Failed</title></head><body><h1>${message}</h1><p><a href="/">Return to RAWTHINK</a></p></body></html>`);
  };
  const fallbackSocialLogin = (providerName, res) => {
    const user = findOrCreateSocialUser(`${providerName}-${Date.now()}@rawthink.ai`, `${providerName.charAt(0).toUpperCase() + providerName.slice(1)} User`, "", providerName);
    return renderLoginSuccessPage(res, user);
  };
  app.get("/auth/google", (req, res, next) => {
    if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
      import_passport.default.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
    } else {
      fallbackSocialLogin("google", res);
    }
  });
  app.get("/auth/google/callback", import_passport.default.authenticate("google", { failureRedirect: "/auth/failure" }), (req, res) => {
    const user = req.user;
    if (!user) return renderLoginFailurePage(res, "Google login failed to resolve user.");
    renderLoginSuccessPage(res, user);
  });
  app.get("/auth/apple", (req, res, next) => {
    if (APPLE_CLIENT_ID && APPLE_TEAM_ID && APPLE_KEY_ID && APPLE_PRIVATE_KEY) {
      import_passport.default.authenticate("apple")(req, res, next);
    } else {
      fallbackSocialLogin("apple", res);
    }
  });
  app.post("/auth/apple/callback", import_passport.default.authenticate("apple", { failureRedirect: "/auth/failure" }), (req, res) => {
    const user = req.user;
    if (!user) return renderLoginFailurePage(res, "Apple login failed to resolve user.");
    renderLoginSuccessPage(res, user);
  });
  app.get("/auth/failure", (req, res) => {
    renderLoginFailurePage(res, "Authentication failed or was canceled.");
  });
  app.post("/api/auth/phone/send-otp", (req, res) => {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required." });
    }
    const phoneClean = sanitizeStr(phone);
    const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
    pendingOtps[phoneClean] = { otp, expiresAt: Date.now() + 5 * 60 * 1e3 };
    writeDB(readDB());
    return res.json({ message: `OTP sent to ${phoneClean}. Use ${otp} to verify.`, otp });
  });
  app.post("/api/auth/phone/verify", (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: "Phone and OTP are required." });
    }
    const phoneClean = sanitizeStr(phone);
    const record = pendingOtps[phoneClean];
    if (!record || record.otp !== otp || record.expiresAt < Date.now()) {
      return res.status(401).json({ error: "OTP is invalid or expired." });
    }
    delete pendingOtps[phoneClean];
    const db = readDB();
    const email = `phone-${phoneClean}@rawthink.ai`;
    let user = db.users.find((u) => u.phone === phoneClean || u.email === email);
    if (!user) {
      user = {
        id: "u-" + Math.random().toString(36).substring(2, 9),
        name: `Phone User ${phoneClean.slice(-4)}`,
        email,
        phone: phoneClean,
        role: "student",
        referralCode: `PH${Math.floor(Math.random() * 9e3 + 1e3)}`,
        points: 15,
        badges: ["Phone Verified"],
        streak: 1,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        achievements: ["Phone Login"],
        referrals: [],
        referredDownloads: 0,
        selectedTimeSlots: {}
      };
      user.password = otp;
      db.users.push(user);
      writeDB(db);
    }
    res.json({ success: true, user });
  });
  app.post("/api/auth/signup", (req, res) => {
    const { name, email, phone, password, referralCode } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: "All fields are strictly required." });
    }
    const emailClean = email.toLowerCase().trim();
    const db = readDB();
    const exists = db.users.find((u) => u.email === emailClean);
    if (exists) {
      return res.status(400).json({ error: "A user with this email already exists." });
    }
    const newRefCode = `${name.substring(0, 4).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`;
    const newUser = {
      id: "u-" + Math.random().toString(36).substring(2, 9),
      name: sanitizeStr(name),
      email: emailClean,
      phone: sanitizeStr(phone),
      role: "student",
      referralCode: newRefCode,
      referredByBy: referralCode ? referralCode.toUpperCase().trim() : void 0,
      points: 100,
      // Initialize coins/points to 100 by default
      coins: 100,
      badges: ["Early Bird"],
      streak: 1,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      achievements: ["Account Registered"],
      referrals: [],
      referredDownloads: 0,
      selectedTimeSlots: {}
    };
    newUser.password = password;
    db.users.push(newUser);
    const credentialsEmail = {
      to: newUser.email,
      from: "credentials-daemon@rawthink.ai",
      subject: "\u{1F511} Your RAWTHINK AI Academy Secure Credentials Generated!",
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
    if (!db.sentMailsLog) {
      db.sentMailsLog = [];
    }
    db.sentMailsLog.push({
      id: "mail-" + Math.random().toString(36).substring(2, 9),
      userId: newUser.id,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      ...credentialsEmail
    });
    if (referralCode) {
      const codeClean = referralCode.toUpperCase().trim();
      const referrer = db.users.find((u) => u.referralCode === codeClean);
      if (referrer) {
        referrer.points = (referrer.points || 0) + 100;
        referrer.coins = (referrer.coins || 0) + 100;
        if (!referrer.referrals) referrer.referrals = [];
        if (!referrer.referrals.includes(newUser.email)) {
          referrer.referrals.push(newUser.email);
        }
        if (!referrer.achievements.includes("Referrer Star")) {
          referrer.achievements.push("Referrer Star");
        }
        const count = referrer.referrals.length;
        let milestoneMsg = "";
        if (count >= 10) {
          milestoneMsg = "\u{1F381} Sensational! You have referred 10+ friends. You entered the 100% FREE class voucher tier!";
          referrer.badges.push("Sovereign Ref");
        } else if (count >= 6) {
          milestoneMsg = "\u{1F525} Incredible! You have referred 6 friends. You unlocked a 30% OFF pricing tier!";
        } else if (count >= 4) {
          milestoneMsg = "\u2B50 Excellent job! You have referred 4 friends. You unlocked a 20% OFF pricing tier!";
        }
        db.notifications.push({
          id: "notif-" + Math.random().toString(36).substring(2, 9),
          userId: referrer.id,
          text: `\u{1F389} A new student (${newUser.name}) registered using your referral! You earned +100 Coins! Total referrals: ${count}. ${milestoneMsg}`,
          isRead: false,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    }
    db.notifications.push({
      id: "notif-" + Math.random().toString(36).substring(2, 9),
      userId: newUser.id,
      text: `\u{1F44B} Welcome to RAWTHINK AI platform! Your login credentials have been dispatched to your Gmail context: ${newUser.email}`,
      isRead: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    writeDB(db);
    res.json({
      success: true,
      user: newUser,
      simulatedEmailSent: credentialsEmail
    });
  });
  app.post("/api/auth/register", (req, res) => {
    const { name, email, phone, password, referralCode } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: "All fields are strictly required." });
    }
    const emailClean = email.toLowerCase().trim();
    const db = readDB();
    const exists = db.users.find((u) => u.email === emailClean);
    if (exists) {
      return res.status(400).json({ error: "A user with this email already exists." });
    }
    const newRefCode = `${name.substring(0, 4).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`;
    const newUser = {
      id: "u-" + Math.random().toString(36).substring(2, 9),
      name: sanitizeStr(name),
      email: emailClean,
      phone: sanitizeStr(phone),
      role: "student",
      referralCode: newRefCode,
      referredByBy: referralCode ? referralCode.toUpperCase().trim() : void 0,
      points: 100,
      coins: 100,
      badges: ["Early Bird"],
      streak: 1,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      achievements: ["Account Registered"],
      referrals: [],
      referredDownloads: 0,
      selectedTimeSlots: {}
    };
    newUser.password = password;
    db.users.push(newUser);
    const credentialsEmail = {
      to: newUser.email,
      from: "credentials-daemon@rawthink.ai",
      subject: "\u{1F511} Your RAWTHINK AI Academy Secure Credentials Generated!",
      body: `Welcome ${newUser.name}! Your account has been created. Invite code: ${newRefCode}`
    };
    db.sentMailsLog = db.sentMailsLog || [];
    db.sentMailsLog.push({ id: "mail-" + Math.random().toString(36).substring(2, 9), userId: newUser.id, timestamp: (/* @__PURE__ */ new Date()).toISOString(), ...credentialsEmail });
    if (referralCode) {
      const codeClean = referralCode.toUpperCase().trim();
      const referrer = db.users.find((u) => u.referralCode === codeClean);
      if (referrer) {
        referrer.points = (referrer.points || 0) + 100;
        referrer.coins = (referrer.coins || 0) + 100;
        if (!referrer.referrals) referrer.referrals = [];
        if (!referrer.referrals.includes(newUser.email)) referrer.referrals.push(newUser.email);
        if (!referrer.achievements.includes("Referrer Star")) referrer.achievements.push("Referrer Star");
        db.notifications.push({ id: "notif-" + Math.random().toString(36).substring(2, 9), userId: referrer.id, text: `\u{1F389} ${newUser.name} registered with your referral, you earned +100 Coins!`, isRead: false, createdAt: (/* @__PURE__ */ new Date()).toISOString() });
      }
    }
    db.notifications = db.notifications || [];
    db.notifications.push({ id: "notif-" + Math.random().toString(36).substring(2, 9), userId: newUser.id, text: `Welcome to RAWTHINK! Your account is ready.`, isRead: false, createdAt: (/* @__PURE__ */ new Date()).toISOString() });
    writeDB(db);
    res.json({ success: true, user: newUser, simulatedEmailSent: credentialsEmail });
  });
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const db = readDB();
    const emailClean = email.toLowerCase().trim();
    let user = db.users.find((u) => u.email === emailClean);
    if (!user) {
      if (emailClean === "admin@rawthink.ai") {
        user = db.users.find((u) => u.role === "admin");
      } else {
        return res.status(401).json({ error: "No account registered with this email." });
      }
    }
    if (user.password && user.password !== password) {
      return res.status(401).json({ error: "Incorrect credentials password. Please click Forgot Password to check your secure registers." });
    }
    const token = import_crypto.default.randomBytes(24).toString("hex");
    user.sessionToken = token;
    user.coins = user.coins ?? user.points ?? 0;
    writeDB(db);
    res.json({ success: true, user, token });
  });
  app.post("/api/auth/social-login", (req, res) => {
    const { provider, email, phone, otp } = req.body;
    const providerKey = provider?.toLowerCase?.();
    const db = readDB();
    if (providerKey === "phone") {
      if (!phone) {
        return res.status(400).json({ error: "Phone number is required for phone sign-in." });
      }
      if (!otp || otp !== "123456") {
        return res.status(401).json({ error: "Please enter the valid OTP code sent to your phone." });
      }
      const phoneClean = phone.trim();
      let user = db.users.find((u) => u.phone === phoneClean);
      if (!user) {
        const newUser = {
          id: "u-" + Math.random().toString(36).substring(2, 9),
          name: `Phone User ${phoneClean.slice(-4)}`,
          email: `phone-${phoneClean}@rawthink.ai`,
          phone: phoneClean,
          role: "student",
          referralCode: `P${Math.floor(Math.random() * 9e3 + 1e3)}`,
          points: 20,
          badges: ["Phone Verified"],
          streak: 1,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          achievements: ["Phone Login"],
          referrals: [],
          referredDownloads: 0,
          selectedTimeSlots: {}
        };
        newUser.password = otp;
        db.users.push(newUser);
        writeDB(db);
        return res.json({ success: true, user: newUser });
      }
      return res.json({ success: true, user });
    }
    if (providerKey === "google" || providerKey === "apple") {
      const emailClean = email ? email.toLowerCase().trim() : `${providerKey}-${Date.now()}@rawthink.ai`;
      let user = db.users.find((u) => u.email === emailClean);
      if (!user) {
        const newUser = {
          id: "u-" + Math.random().toString(36).substring(2, 9),
          name: providerKey === "google" ? "Google Learner" : "Apple Learner",
          email: emailClean,
          phone: phone ? phone.trim() : "",
          role: "student",
          referralCode: `${providerKey.toUpperCase().slice(0, 3)}${Math.floor(Math.random() * 9e3 + 1e3)}`,
          points: 25,
          badges: [`${providerKey.charAt(0).toUpperCase() + providerKey.slice(1)} Connect`],
          streak: 1,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          achievements: ["Social Login"],
          referrals: [],
          referredDownloads: 0,
          selectedTimeSlots: {}
        };
        newUser.password = `${providerKey}-linked`;
        db.users.push(newUser);
        writeDB(db);
        return res.json({ success: true, user: newUser });
      }
      return res.json({ success: true, user });
    }
    return res.status(400).json({ error: "Unsupported social login provider." });
  });
  app.post("/api/auth/forgot-password", async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Please provide Email address." });
    }
    const db = readDB();
    const emailClean = email.toLowerCase().trim();
    const user = db.users.find((u) => u.email === emailClean);
    if (!user) {
      return res.status(404).json({ error: "No user record matching this email was found in RAWTHINK registers." });
    }
    const token = import_crypto.default.randomBytes(20).toString("hex");
    const expiresAt = Date.now() + 60 * 60 * 1e3;
    user.resetToken = token;
    user.resetTokenExpiresAt = expiresAt;
    user.resetTokenSentAt = (/* @__PURE__ */ new Date()).toISOString();
    const resetLink = `${process.env.APP_URL || "http://localhost:3000"}/auth/reset-password?email=${encodeURIComponent(user.email)}&token=${token}`;
    const recoveryEmail = {
      to: user.email,
      from: SMTP_FROM,
      subject: "\u{1F510} RAWTHINK AI: Password Reset Instructions",
      body: `Hello ${user.name},

A password reset request was received for your RAWTHINK AI account.

Please use the code below to reset your password, or click the link if your email client supports it:

Reset Code: ${token}

Reset Link: ${resetLink}

This code will expire in 1 hour.

If you did not request this, just ignore this message and your existing password will remain secure.

RAWTHINK AI Support Team`
    };
    if (!db.sentMailsLog) {
      db.sentMailsLog = [];
    }
    db.sentMailsLog.push({
      id: "mail-" + Math.random().toString(36).substring(2, 9),
      userId: user.id,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      ...recoveryEmail
    });
    writeDB(db);
    let actualSendResult = null;
    if (emailTransporter) {
      try {
        actualSendResult = await emailTransporter.sendMail({
          from: SMTP_FROM,
          to: user.email,
          subject: recoveryEmail.subject,
          text: recoveryEmail.body
        });
      } catch (mailErr) {
        console.warn("SMTP email send failed:", mailErr?.message || mailErr);
      }
    }
    res.json({
      success: true,
      message: "Password reset instruction generated successfully.",
      simulatedEmailSent: recoveryEmail,
      emailSent: !!actualSendResult,
      smtpInfo: actualSendResult ? { accepted: actualSendResult.accepted } : null
    });
  });
  app.post("/api/auth/reset-password", (req, res) => {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: "Email, token, and new password are all required." });
    }
    const db = readDB();
    const emailClean = email.toLowerCase().trim();
    const user = db.users.find((u) => u.email === emailClean);
    if (!user) {
      return res.status(404).json({ error: "Could not find a user with that email address." });
    }
    if (user.resetToken !== token || !user.resetTokenExpiresAt) {
      return res.status(400).json({ error: "Invalid or expired reset token." });
    }
    if (Date.now() > user.resetTokenExpiresAt) {
      return res.status(400).json({ error: "Reset token has expired. Please request a new link." });
    }
    user.password = newPassword;
    delete user.resetToken;
    delete user.resetTokenExpiresAt;
    delete user.resetTokenSentAt;
    writeDB(db);
    res.json({ success: true, message: "Your password has been updated successfully. Please log in with your new credentials." });
  });
  app.get("/api/user/profile/:id", (req, res) => {
    const db = readDB();
    const user = db.users.find((u) => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User profiles not found" });
    }
    res.json({ user });
  });
  app.get("/api/courses", (req, res) => {
    const db = readDB();
    res.json({ courses: db.courses });
  });
  app.post("/api/enroll", (req, res) => {
    const { userId, courseId, transactionId, remarks, screenshot } = req.body;
    if (!userId || !courseId || !transactionId) {
      return res.status(400).json({ error: "User ID, Course ID, and eSewa Transaction ID are mandatory." });
    }
    const db = readDB();
    const user = db.users.find((u) => u.id === userId);
    const course = db.courses.find((c) => c.id === courseId);
    if (!user || !course) {
      return res.status(404).json({ error: "User or course parameters invalid" });
    }
    const duplicate = db.enrollments.find(
      (e) => e.userId === userId && e.courseId === courseId && (e.status === "approved" || e.status === "pending")
    );
    if (duplicate) {
      return res.status(400).json({ error: "You already have an active or pending enrollment for this class." });
    }
    const referCount = user.referrals?.length || 0;
    let discountPercent = 0;
    if (referCount >= 10) discountPercent = 100;
    else if (referCount >= 6) discountPercent = 30;
    else if (referCount >= 4) discountPercent = 20;
    const discountAmount = Math.round(course.price * discountPercent / 100);
    const discountedPrice = Math.max(0, course.price - discountAmount);
    const newEnrollment = {
      id: "en-" + Math.random().toString(36).substring(2, 9),
      userId,
      userName: user.name,
      userEmail: user.email,
      courseId,
      courseTitle: course.title,
      price: discountedPrice,
      transactionId: sanitizeStr(transactionId),
      remarks: remarks ? sanitizeStr(remarks) : void 0,
      screenshotUrl: screenshot || void 0,
      // Contains base64 screenshot
      status: "pending",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.enrollments.push(newEnrollment);
    db.notifications.push({
      id: "notif-" + Math.random().toString(36).substring(2, 9),
      userId: "admin-1",
      text: `\u{1F4B8} Pending eSewa payment submitted by ${user.name} for ${course.title} (Rs. ${discountedPrice})`,
      isRead: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    writeDB(db);
    res.json({ success: true, enrollment: newEnrollment });
  });
  app.post("/api/courses/purchase", (req, res) => {
    const { userId, courseId } = req.body;
    if (!userId || !courseId) return res.status(400).json({ error: "userId and courseId are required." });
    const db = readDB();
    const user = db.users.find((u) => u.id === userId);
    const course = db.courses.find((c) => c.id === courseId);
    if (!user || !course) return res.status(404).json({ error: "User or course not found." });
    const existing = db.enrollments.find((e) => e.userId === userId && e.courseId === courseId && e.status === "approved");
    if (existing) return res.status(400).json({ error: "You are already enrolled in this course." });
    const cost = course.price;
    const balance = user.coins ?? user.points ?? 0;
    if (balance < cost) return res.status(400).json({ error: "Insufficient coins to purchase this course." });
    user.coins = balance - cost;
    user.coinsInvested = (user.coinsInvested || 0) + cost;
    const newEnrollment = {
      id: "en-" + Math.random().toString(36).substring(2, 9),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      courseId: course.id,
      courseTitle: course.title,
      price: cost,
      transactionId: "COIN-" + Math.random().toString(36).substring(2, 9),
      status: "approved",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.enrollments.push(newEnrollment);
    db.notifications = db.notifications || [];
    db.notifications.push({ id: "notif-" + Math.random().toString(36).substring(2, 9), userId: user.id, text: `\u2705 You purchased ${course.title} using ${cost} coins.`, isRead: false, createdAt: (/* @__PURE__ */ new Date()).toISOString() });
    writeDB(db);
    res.json({ success: true, enrollment: newEnrollment, coins: user.coins, coinsInvested: user.coinsInvested });
  });
  app.post("/api/resources/unlock", (req, res) => {
    const { userId, resourceId } = req.body;
    if (!userId || !resourceId) {
      return res.status(400).json({ error: "User ID and Resource ID are required." });
    }
    const db = readDB();
    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "Student profile not found." });
    }
    const COST = 50;
    const resourceIndex = (db.resources || []).findIndex((r) => r.id === resourceId);
    if (resourceIndex >= 0 && resourceIndex < 2) {
      if (!user.unlockedResources) user.unlockedResources = [];
      if (!user.unlockedResources.includes(resourceId)) user.unlockedResources.push(resourceId);
      writeDB(db);
      return res.json({ success: true, coins: user.coins ?? user.points ?? 0, unlockedResources: user.unlockedResources, badges: user.badges });
    }
    const unlockedCount = (user.unlockedResources || []).length;
    const referralsCount = (user.referrals || []).length || 0;
    const invested = user.coinsInvested || 0 || 0;
    if (unlockedCount >= 2 && referralsCount < 5 && invested < 50) {
      return res.status(403).json({ error: "Unlock limit reached. Refer 5 friends or invest 50 coins to unlock more than 2 resources." });
    }
    const balance = user.coins ?? user.points ?? 0;
    if (balance < COST) {
      return res.status(400).json({ error: "Insufficient coins! Unlock costs 50 coins." });
    }
    if (!user.unlockedResources) user.unlockedResources = [];
    if (user.unlockedResources.includes(resourceId)) {
      return res.json({ success: true, coins: balance, unlockedResources: user.unlockedResources, badges: user.badges });
    }
    user.coins = balance - COST;
    user.points = user.points ?? 0;
    user.points = user.points - 0;
    user.coinsInvested = (user.coinsInvested || 0) + COST;
    user.unlockedResources.push(resourceId);
    if (!user.badges.includes("Knowledge Seeker")) user.badges.push("Knowledge Seeker");
    writeDB(db);
    res.json({ success: true, coins: user.coins, coinsInvested: user.coinsInvested, unlockedResources: user.unlockedResources, badges: user.badges });
  });
  app.post("/api/tools/unlock", (req, res) => {
    const { userId, toolId } = req.body;
    if (!userId || !toolId) return res.status(400).json({ error: "User ID and Tool ID are required." });
    const db = readDB();
    const user = db.users.find((u) => u.id === userId);
    if (!user) return res.status(404).json({ error: "Student profile not found." });
    const tool = (db.tools || []).find((t) => t.id === toolId);
    if (!tool) return res.status(404).json({ error: "Tool not found." });
    const COST = 50;
    if (!user.unlockedTools) user.unlockedTools = [];
    const unlockedToolsCount = (user.unlockedTools || []).length;
    const referralsCount = (user.referrals || []).length || 0;
    const invested = user.coinsInvested || 0 || 0;
    if (unlockedToolsCount >= 2 && referralsCount < 5 && invested < 50) {
      return res.status(403).json({ error: "Unlock limit reached. Refer 5 friends or invest 50 coins to unlock more than 2 AI tools." });
    }
    const balance = user.coins ?? user.points ?? 0;
    if (balance < COST) return res.status(400).json({ error: "Insufficient coins! Unlock costs 50 coins." });
    if (user.unlockedTools.includes(toolId)) {
      return res.json({ success: true, coins: balance, unlockedTools: user.unlockedTools, badges: user.badges });
    }
    user.coins = balance - COST;
    user.coinsInvested = (user.coinsInvested || 0) + COST;
    user.unlockedTools.push(toolId);
    if (!user.badges.includes("AI Explorer")) user.badges.push("AI Explorer");
    db.notifications = db.notifications || [];
    db.notifications.push({ id: "notif-" + Math.random().toString(36).substring(2, 9), userId: user.id, text: `\u{1F513} You unlocked tool: ${tool.name} using 50 coins.`, isRead: false, createdAt: (/* @__PURE__ */ new Date()).toISOString() });
    writeDB(db);
    res.json({ success: true, coins: user.coins, coinsInvested: user.coinsInvested, unlockedTools: user.unlockedTools, badges: user.badges });
  });
  app.post("/api/feedback", (req, res) => {
    const { userId, type, target, rating, comment } = req.body;
    if (!type || !rating || !comment) {
      return res.status(400).json({ error: "Type, rating index, and comment are required." });
    }
    const db = readDB();
    if (!db.feedbacks) {
      db.feedbacks = [];
    }
    const newFeedback = {
      id: "fb-" + Math.random().toString(36).substring(2, 9),
      userId: userId || "anonymous",
      type,
      // 'course' or 'platform'
      target: target ? sanitizeStr(target) : "General",
      rating: Number(rating),
      comment: sanitizeStr(comment),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.feedbacks.push(newFeedback);
    let awardedCoins = 0;
    if (userId) {
      const user = db.users.find((u) => u.id === userId);
      if (user && user.role !== "admin") {
        user.points = (user.points || 0) + 10;
        awardedCoins = 10;
        db.notifications.push({
          id: "notif-" + Math.random().toString(36).substring(2, 9),
          userId: user.id,
          text: `\u{1F381} Thank you for your feedback! You've been rewarded +10 Coins! Keep shaping RAWTHINK AI!`,
          isRead: false,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    }
    writeDB(db);
    res.json({ success: true, feedback: newFeedback, awardedCoins });
  });
  app.post("/api/resources/download/:id", (req, res) => {
    const db = readDB();
    const resource = db.resources.find((r) => r.id === req.params.id);
    if (!resource) {
      return res.status(404).json({ error: "Resource item not found" });
    }
    resource.downloadsCount = (resource.downloadsCount || 0) + 1;
    const { userId } = req.body;
    if (userId) {
      const user = db.users.find((u) => u.id === userId);
      if (user) {
        user.points = (user.points || 0) + 5;
        if (!user.achievements.includes("Knowledge Seeker")) {
          user.achievements.push("Knowledge Seeker");
        }
      }
    }
    writeDB(db);
    res.json({ success: true, downloadsCount: resource.downloadsCount });
  });
  app.get("/api/resources", (req, res) => {
    const db = readDB();
    res.json({ resources: db.resources });
  });
  app.get("/api/tools", (req, res) => {
    const db = readDB();
    res.json({ tools: db.tools });
  });
  app.post("/api/tools", (req, res) => {
    const { name, category, description, tags, link, iconName } = req.body;
    if (!name || !category || !description || !link) {
      return res.status(400).json({ error: "Missing required tool fields" });
    }
    const db = readDB();
    const newTool = {
      id: `tool-${Date.now()}`,
      name,
      category,
      description,
      tags: tags || [],
      link,
      iconName: iconName || "Cpu"
    };
    db.tools.push(newTool);
    writeDB(db);
    res.status(201).json({ success: true, tool: newTool, tools: db.tools });
  });
  app.put("/api/tools/:id", (req, res) => {
    const { id } = req.params;
    const { name, category, description, tags, link, iconName } = req.body;
    const db = readDB();
    const toolIndex = db.tools.findIndex((t) => t.id === id);
    if (toolIndex === -1) {
      return res.status(404).json({ error: "AI Tool not found" });
    }
    db.tools[toolIndex] = {
      ...db.tools[toolIndex],
      name: name !== void 0 ? name : db.tools[toolIndex].name,
      category: category !== void 0 ? category : db.tools[toolIndex].category,
      description: description !== void 0 ? description : db.tools[toolIndex].description,
      tags: tags !== void 0 ? tags : db.tools[toolIndex].tags,
      link: link !== void 0 ? link : db.tools[toolIndex].link,
      iconName: iconName !== void 0 ? iconName : db.tools[toolIndex].iconName
    };
    writeDB(db);
    res.json({ success: true, tool: db.tools[toolIndex], tools: db.tools });
  });
  app.delete("/api/tools/:id", (req, res) => {
    const { id } = req.params;
    const db = readDB();
    const initialLength = db.tools.length;
    db.tools = db.tools.filter((t) => t.id !== id);
    if (db.tools.length === initialLength) {
      return res.status(404).json({ error: "AI Tool not found" });
    }
    writeDB(db);
    res.json({ success: true, tools: db.tools });
  });
  app.post("/api/quiz/submit", (req, res) => {
    const { userId, score, totalQuestions } = req.body;
    if (!userId || score === void 0) {
      return res.status(400).json({ error: "Required fields missing" });
    }
    const db = readDB();
    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const pointsGranted = score * 25;
    user.points = (user.points || 0) + pointsGranted;
    user.streak = (user.streak || 1) + 1;
    if (score === totalQuestions && !user.badges.includes("AI Mastermind")) {
      user.badges.push("AI Mastermind");
    }
    if (!user.achievements.includes("Quiz Ace") && score >= 3) {
      user.achievements.push("Quiz Ace");
    }
    const entry = {
      id: "lh-" + Math.random().toString(36).substring(2, 9),
      userId,
      userName: user.name,
      score,
      totalQuestions,
      pointsEarned: pointsGranted,
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    };
    db.leaderboard.unshift(entry);
    db.leaderboard.sort((a, b) => b.score - a.score || new Date(b.date).getTime() - new Date(a.date).getTime());
    db.leaderboard = db.leaderboard.slice(0, 20);
    writeDB(db);
    res.json({ success: true, pointsEarned: pointsGranted, currentPoints: user.points, streak: user.streak });
  });
  app.get("/api/leaderboard", (req, res) => {
    const db = readDB();
    res.json({ leaderboard: db.leaderboard });
  });
  app.get("/api/referrals/leaderboard", (req, res) => {
    const db = readDB();
    const students = db.users.filter((u) => u.role === "student");
    const leaderboard = students.map((u) => ({
      id: u.id,
      name: u.name,
      referralsCount: u.referrals ? u.referrals.length : 0,
      points: u.points || 0
    }));
    leaderboard.sort((a, b) => b.referralsCount - a.referralsCount || b.points - a.points);
    res.json({ leaderboard: leaderboard.slice(0, 5) });
  });
  app.get("/api/community/posts", (req, res) => {
    const db = readDB();
    res.json({ forum: db.forum });
  });
  app.post("/api/community/posts", (req, res) => {
    const { userId, title, content, category } = req.body;
    if (!userId || !title || !content || !category) {
      return res.status(400).json({ error: "Please enter Title, Category and Content body." });
    }
    const db = readDB();
    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      return res.status(403).json({ error: "Access denied" });
    }
    const newPost = {
      id: "post-" + Math.random().toString(36).substring(2, 9),
      userId,
      userName: user.name,
      userRole: user.role === "admin" ? "admin" : "student",
      category,
      title: sanitizeStr(title),
      content: sanitizeStr(content),
      likes: 0,
      comments: [],
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.forum.unshift(newPost);
    user.points = (user.points || 0) + 10;
    writeDB(db);
    res.json({ success: true, post: newPost });
  });
  app.post("/api/community/posts/:id/like", (req, res) => {
    const db = readDB();
    const post = db.forum.find((p) => p.id === req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    post.likes = (post.likes || 0) + 1;
    writeDB(db);
    res.json({ success: true, likes: post.likes });
  });
  app.post("/api/community/posts/:id/comment", (req, res) => {
    const { userId, content } = req.body;
    if (!userId || !content) return res.status(400).json({ error: "Comment body empty" });
    const db = readDB();
    const post = db.forum.find((p) => p.id === req.params.id);
    const user = db.users.find((u) => u.id === userId);
    if (!post || !user) return res.status(404).json({ error: "Post or user not found" });
    post.comments.push({
      id: "comment-" + Math.random().toString(36).substring(2, 9),
      userId,
      userName: user.name,
      userRole: user.role === "admin" ? "admin" : "student",
      content: sanitizeStr(content),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    writeDB(db);
    res.json({ success: true, comments: post.comments });
  });
  app.get("/api/schedule", (req, res) => {
    const db = readDB();
    res.json({ schedule: db.schedule });
  });
  app.post("/api/schedule", (req, res) => {
    const { courseId, workshopName, instructor, date, time, totalSeats } = req.body;
    if (!courseId || !workshopName || !instructor || !date || !time) {
      return res.status(400).json({ error: "All fields are strictly required to schedule a class." });
    }
    const db = readDB();
    const newSession = {
      id: "session-" + Math.random().toString(36).substring(2, 9),
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
    db.users.forEach((u) => {
      if (u.role === "student") {
        db.notifications.push({
          id: "notif-" + Math.random().toString(36).substring(2, 9),
          userId: u.id,
          text: `\u{1F4C5} New class scheduled: "${workshopName}" on ${date} at ${time}. Reserve your slot now!`,
          isRead: false,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    });
    writeDB(db);
    res.json({ success: true, session: newSession, schedule: db.schedule });
  });
  app.put("/api/schedule/:id", (req, res) => {
    const sessionId = req.params.id;
    const { courseId, workshopName, instructor, date, time, totalSeats } = req.body;
    const db = readDB();
    const session2 = db.schedule.find((s) => s.id === sessionId);
    if (!session2) {
      return res.status(404).json({ error: "Schedule session not found." });
    }
    session2.courseId = courseId || session2.courseId;
    session2.workshopName = workshopName !== void 0 ? sanitizeStr(workshopName) : session2.workshopName;
    session2.instructor = instructor !== void 0 ? sanitizeStr(instructor) : session2.instructor;
    session2.date = date !== void 0 ? sanitizeStr(date) : session2.date;
    session2.time = time !== void 0 ? sanitizeStr(time) : session2.time;
    if (totalSeats !== void 0) {
      const seatsDiff = Number(totalSeats) - session2.totalSeats;
      session2.totalSeats = Number(totalSeats);
      session2.seatsRemaining = Math.max(0, session2.seatsRemaining + seatsDiff);
    }
    writeDB(db);
    res.json({ success: true, session: session2, schedule: db.schedule });
  });
  app.delete("/api/schedule/:id", (req, res) => {
    const sessionId = req.params.id;
    const db = readDB();
    const originalCount = db.schedule.length;
    db.schedule = db.schedule.filter((s) => s.id !== sessionId);
    if (db.schedule.length === originalCount) {
      return res.status(404).json({ error: "Schedule session not found." });
    }
    writeDB(db);
    res.json({ success: true, schedule: db.schedule });
  });
  app.post("/api/user/book-slot", (req, res) => {
    const { userId, courseId, timeSlotId } = req.body;
    if (!userId || !courseId || !timeSlotId) {
      return res.status(400).json({ error: "Core parameter criteria missing." });
    }
    const db = readDB();
    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "Student record could not be located." });
    }
    const session2 = db.schedule.find((s) => s.id === timeSlotId);
    if (!session2) {
      return res.status(404).json({ error: "Class schedule slot not found." });
    }
    if (session2.seatsRemaining <= 0) {
      return res.status(400).json({ error: "This schedule slot is completely full. Please choose another." });
    }
    if (!user.selectedTimeSlots) {
      user.selectedTimeSlots = {};
    }
    const previousSlotId = user.selectedTimeSlots[courseId];
    if (previousSlotId && previousSlotId !== timeSlotId) {
      const prevSession = db.schedule.find((s) => s.id === previousSlotId);
      if (prevSession) {
        prevSession.seatsRemaining = Math.min(prevSession.seatsRemaining + 1, prevSession.totalSeats);
      }
    }
    if (previousSlotId !== timeSlotId) {
      session2.seatsRemaining = Math.max(session2.seatsRemaining - 1, 0);
    }
    user.selectedTimeSlots[courseId] = timeSlotId;
    db.notifications.push({
      id: "notif-" + Math.random().toString(36).substring(2, 9),
      userId: user.id,
      text: `\u2705 Time slot reserved! You are booked for "${session2.workshopName}" on ${session2.date} at ${session2.time}.`,
      isRead: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    writeDB(db);
    res.json({ success: true, user });
  });
  app.post("/api/user/simulate-referral-signup", (req, res) => {
    const { userId, friendEmail, friendName } = req.body;
    if (!userId || !friendEmail || !friendName) {
      return res.status(400).json({ error: "Please provide friend name and email address." });
    }
    const db = readDB();
    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "Referrer profile not found." });
    }
    const friendMailClean = friendEmail.toLowerCase().trim();
    const exists = db.users.find((u) => u.email === friendMailClean);
    if (exists) {
      return res.status(400).json({ error: "A registree with this friend email already exists." });
    }
    const friendRefCode = `${friendName.substring(0, 4).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`;
    const newFriend = {
      id: "u-" + Math.random().toString(36).substring(2, 9),
      name: sanitizeStr(friendName),
      email: friendMailClean,
      phone: "9841" + Math.floor(Math.random() * 1e6),
      role: "student",
      referralCode: friendRefCode,
      referredByBy: user.referralCode,
      points: 15,
      badges: ["Early Bird"],
      streak: 1,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      achievements: ["Account Registered", "Referred User"],
      referrals: [],
      referredDownloads: 0,
      selectedTimeSlots: {}
    };
    newFriend.password = "friend123";
    db.users.push(newFriend);
    if (!user.referrals) {
      user.referrals = [];
    }
    if (!user.referrals.includes(friendMailClean)) {
      user.referrals.push(friendMailClean);
    }
    user.points = (user.points || 0) + 33;
    const referralsCount = user.referrals.length;
    let milestoneMsg = "";
    if (referralsCount >= 10) {
      milestoneMsg = "\u{1F381} Congratulations! You hit 10 referrals & unlocked the 100% FREE class voucher tier!";
      if (!user.badges.includes("Sovereign Ref")) user.badges.push("Sovereign Ref");
    } else if (referralsCount >= 6) {
      milestoneMsg = "\u{1F525} Wonderful! You hit 6 referrals & unlocked the 30% OFF pricing tier!";
    } else if (referralsCount >= 4) {
      milestoneMsg = "\u2B50 Awesome! You hit 4 referrals & unlocked the 20% OFF pricing tier!";
    }
    db.notifications.push({
      id: "notif-" + Math.random().toString(36).substring(2, 9),
      userId: user.id,
      text: `\u{1F389} Dynamic Referral Added: "${friendName}" registered using your code! +33 Points awarded. Total referrals: ${referralsCount}. ${milestoneMsg}`,
      isRead: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    writeDB(db);
    res.json({ success: true, user, referralsCount });
  });
  app.post("/api/user/simulate-referral-download", (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is strictly required." });
    }
    const db = readDB();
    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "User profile not found." });
    }
    user.referredDownloads = (user.referredDownloads || 0) + 1;
    db.notifications.push({
      id: "notif-" + Math.random().toString(36).substring(2, 9),
      userId: user.id,
      text: `\u{1F4F1} One of your referred friends successfully downloaded the RAWTHINK AI mobile PWA app! Referred downloads: ${user.referredDownloads}`,
      isRead: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    writeDB(db);
    res.json({ success: true, user, referredDownloads: user.referredDownloads });
  });
  app.get("/api/notifications/:userId", (req, res) => {
    const db = readDB();
    const list = db.notifications.filter((n) => n.userId === req.params.userId);
    res.json({ notifications: list });
  });
  app.get("/api/admin/users", (req, res) => {
    const db = readDB();
    res.json({ users: db.users });
  });
  app.get("/api/admin/payments", (req, res) => {
    const db = readDB();
    res.json({ enrollments: db.enrollments });
  });
  app.post("/api/admin/payments/decide", (req, res) => {
    const { enrollmentId, decision, adminId } = req.body;
    if (!enrollmentId || !decision) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    const db = readDB();
    const admin = db.users.find((u) => u.id === adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ error: "Admin-only module authorization failed." });
    }
    const enrollment = db.enrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment reference not found" });
    }
    enrollment.status = decision;
    const student = db.users.find((u) => u.id === enrollment.userId);
    if (student) {
      if (decision === "approved") {
        const approvedCount = db.enrollments.filter((e) => e.userId === student.id && e.status === "approved").length;
        let enrollmentCoins = 100;
        if (approvedCount === 2) {
          enrollmentCoins = 120;
        } else if (approvedCount >= 3) {
          enrollmentCoins = 299;
        }
        student.points = (student.points || 0) + enrollmentCoins;
        if (!student.badges.includes("Scholar")) {
          student.badges.push("Scholar");
        }
        db.notifications.push({
          id: "notif-" + Math.random().toString(36).substring(2, 9),
          userId: student.id,
          text: `\u{1F389} CONGRATULATIONS! Your payment of Rs. ${enrollment.price} for "${enrollment.courseTitle}" has been verified! Welcome to class!`,
          isRead: false,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        const session2 = db.schedule.find((s) => s.courseId === enrollment.courseId);
        if (session2 && session2.seatsRemaining > 0) {
          session2.seatsRemaining -= 1;
        }
      } else {
        db.notifications.push({
          id: "notif-" + Math.random().toString(36).substring(2, 9),
          userId: student.id,
          text: `\u274C eSewa verification alert: Your transaction (ID: ${enrollment.transactionId}) for "${enrollment.courseTitle}" could not be confirmed. Please check your transaction details or re-upload screenshot.`,
          isRead: false,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    }
    writeDB(db);
    res.json({ success: true, enrollment });
  });
  app.post("/api/admin/decision", (req, res) => {
    const { enrollmentId, decision, adminId } = req.body;
    if (!enrollmentId || !decision) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    const db = readDB();
    const admin = db.users.find((u) => u.id === adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ error: "Admin-only module authorization failed." });
    }
    const enrollment = db.enrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment reference not found" });
    }
    enrollment.status = decision;
    const student = db.users.find((u) => u.id === enrollment.userId);
    if (student) {
      if (decision === "approved") {
        const approvedCount = db.enrollments.filter((e) => e.userId === student.id && e.status === "approved").length;
        let enrollmentCoins = 100;
        if (approvedCount === 2) {
          enrollmentCoins = 120;
        } else if (approvedCount >= 3) {
          enrollmentCoins = 299;
        }
        student.points = (student.points || 0) + enrollmentCoins;
        student.coins = (student.coins || 0) + enrollmentCoins;
        if (!student.badges.includes("Scholar")) student.badges.push("Scholar");
        db.notifications.push({ id: "notif-" + Math.random().toString(36).substring(2, 9), userId: student.id, text: `\u{1F389} CONGRATULATIONS! Your payment of Rs. ${enrollment.price} for "${enrollment.courseTitle}" has been verified!`, isRead: false, createdAt: (/* @__PURE__ */ new Date()).toISOString() });
        const session2 = db.schedule.find((s) => s.courseId === enrollment.courseId);
        if (session2 && session2.seatsRemaining > 0) session2.seatsRemaining -= 1;
      } else {
        db.notifications.push({ id: "notif-" + Math.random().toString(36).substring(2, 9), userId: student.id, text: `\u274C Your payment for "${enrollment.courseTitle}" could not be confirmed.`, isRead: false, createdAt: (/* @__PURE__ */ new Date()).toISOString() });
      }
    }
    writeDB(db);
    res.json({ success: true, enrollment });
  });
  app.post("/api/admin/upload-qr", (req, res) => {
    const { adminId, filename = "esewa_qr.png", imageBase64 } = req.body;
    if (!adminId || !imageBase64) {
      return res.status(400).json({ error: "adminId and imageBase64 are required." });
    }
    const db = readDB();
    const admin = db.users.find((u) => u.id === adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ error: "Admin authorization required." });
    }
    try {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");
      const safeName = sanitizeStr(filename || "esewa_qr.png");
      const outPath = import_path.default.join(process.cwd(), "public", safeName);
      import_fs.default.writeFileSync(outPath, buffer);
      db.notifications = db.notifications || [];
      db.notifications.push({
        id: "notif-" + Math.random().toString(36).substring(2, 9),
        userId: admin.id,
        text: `\u{1F5BC}\uFE0F Admin uploaded merchant QR image: ${safeName}`,
        isRead: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      writeDB(db);
      return res.json({ success: true, url: `/${safeName}` });
    } catch (err) {
      console.error("QR upload error", err);
      return res.status(500).json({ error: "Failed to save QR image." });
    }
  });
  app.post("/api/admin/announce", (req, res) => {
    const { adminId, title, content, pinned } = req.body;
    if (!adminId || !title || !content) return res.status(400).json({ error: "Missing parameters" });
    const db = readDB();
    const admin = db.users.find((u) => u.id === adminId);
    if (!admin || admin.role !== "admin") return res.status(403).json({ error: "Unauthorized" });
    const ann = {
      id: "ann-" + Math.random().toString(36).substring(2, 9),
      adminId: admin.id,
      title: sanitizeStr(title),
      content: sanitizeStr(content),
      pinned: !!pinned,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.announcements = db.announcements || [];
    db.announcements.unshift(ann);
    (db.users || []).forEach((u) => {
      db.notifications.push({ id: "notif-" + Math.random().toString(36).substring(2, 9), userId: u.id, text: `\u{1F4E2} ${ann.title} - ${ann.content.slice(0, 120)}`, isRead: false, createdAt: (/* @__PURE__ */ new Date()).toISOString() });
    });
    writeDB(db);
    res.json({ success: true, announcement: ann });
  });
  app.post("/api/admin/certificates/issue", (req, res) => {
    const { userId, certificateName, adminId } = req.body;
    const db = readDB();
    const admin = db.users.find((u) => u.id === adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized credentials" });
    }
    const student = db.users.find((u) => u.id === userId);
    if (!student) return res.status(404).json({ error: "Student not found" });
    if (!student.achievements.includes(`Certified: ${certificateName}`)) {
      student.achievements.push(`Certified: ${certificateName}`);
    }
    db.notifications.push({
      id: "notif-" + Math.random().toString(36).substring(2, 9),
      userId: student.id,
      text: `\u{1F393} A verified excellence credentials certificate has been generated for ${certificateName}! Check your profile.`,
      isRead: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    writeDB(db);
    res.json({ success: true, achievements: student.achievements });
  });
  app.get("/api/admin/export/:type", (req, res) => {
    const type = req.params.type;
    const db = readDB();
    let csvContent = "";
    let filename = `rawthink_${type}_export.csv`;
    switch (type) {
      case "users":
        csvContent = "ID,Name,Email,Phone,Role,Points,Streak,CreatedDate\n";
        db.users.forEach((u) => {
          csvContent += `"${u.id}","${u.name}","${u.email}","${u.phone}","${u.role}",${u.points || 0},${u.streak || 1},"${u.createdAt}"
`;
        });
        break;
      case "paid":
        csvContent = "EnrollmentID,StudentName,Email,CourseName,Price(Rs),TransactionID,Status,UploadedDate\n";
        db.enrollments.forEach((e) => {
          csvContent += `"${e.id}","${e.userName}","${e.userEmail}","${e.courseTitle}",${e.price},"${e.transactionId || ""}","${e.status}","${e.createdAt}"
`;
        });
        break;
      case "participants":
        csvContent = "SessionID,WorkshopName,Instructor,Date,Time,SeatsRemaining,TotalSeats\n";
        db.schedule.forEach((s) => {
          csvContent += `"${s.id}","${s.workshopName}","${s.instructor}","${s.date}","${s.time}",${s.seatsRemaining},${s.totalSeats}
`;
        });
        break;
      case "referrals":
        csvContent = "StudentID,StudentName,ReferralCode,ReferredBy,PointsTotal,Streaks\n";
        db.users.forEach((u) => {
          if (u.referredByBy || u.points > 100) {
            csvContent += `"${u.id}","${u.name}","${u.referralCode}","${u.referredByBy || "None"}",${u.points},${u.streak}
`;
          }
        });
        break;
      case "downloads":
        csvContent = "ResourceID,Title,Category,DownloadsCounter,Filesize\n";
        db.resources.forEach((r) => {
          csvContent += `"${r.id}","${r.title}","${r.category}",${r.downloadsCount},"${r.fileSize}"
`;
        });
        break;
      default:
        return res.status(400).send("Invalid export model type");
    }
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    return res.status(200).send(csvContent);
  });
  app.post("/api/ai/workshop-qna", async (req, res) => {
    const { prompt, courseContext, userId } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt instruction cannot be empty." });
    }
    const db = readDB();
    const user = userId ? db.users.find((u) => u.id === userId) : null;
    let deductPoints = false;
    if (user && user.role !== "admin") {
      if ((user.points || 0) < 100) {
        return res.status(403).json({
          error: "\u26A0\uFE0F Insufficient Coins! Asking the advanced AI tutor costs 100 coins. Navigate to Classrooms or refer friends to earn more!"
        });
      }
      deductPoints = true;
    }
    if (!googleAI) {
      const simulatedResponses = [
        `### \u{1F44B} RAWTHINK AI Interactive Workshop Guide

To adopt advanced prompting matrices in Nepal's local marketplace, configure high-fidelity system personas:

1. **Few-Shot Anchor**: Provide 2-3 specific Nepalese rupee conversions or regional client briefs so ChatGPT maps context correctly.
2. **Delimiter Isolation**: Encapsulate CSV sheets or course slides inside structural tags like \`[data]\` or \`[instructions]\` to reduce confusion.
3. **Formatting Constraints**: Explicitly instruct: *"Respond only in structured markdown bullets pairing Kathmandu Standard Time (NPT)."*`,
        `### \u{1F680} Professional Automation Advice

When utilizing automated web scrappers or developer compiler APIs (Course 3 blueprint):
- Always secure keys using backend server routes (like standard Node environment secrets).
- Leverage asynchronous task schedules to throttle traffic.
- When generating digital code with Cursor, start prompts with clear architectural declarations before requesting individual functions.`,
        `### \u{1F9E0} Model Chaining Patterns

For high-value study pipelines (Course 2 Productivity systems):
- Ask the model to generate a hierarchical syllabus outline first.
- In a secondary prompt, feed the generated outline and instruct the compiler: *"Expand Section 1 inside detailed educational narratives, keeping the tone friendly, objective, and scannable."*`
      ];
      const chosen = simulatedResponses[Math.floor(Math.random() * simulatedResponses.length)];
      if (deductPoints && user) {
        user.points = (user.points || 0) - 100;
        writeDB(db);
      }
      return res.json({
        text: `*(Simulated expert mode - Cost: 100 Coins deducted)*

${chosen}

*Note: To query live Gemini models, please set a valid GEMINI_API_KEY in Settings > Secrets.*`,
        updatedPoints: user ? user.points : void 0
      });
    }
    try {
      const sanitizedPrompt = sanitizeStr(prompt);
      const systemInstruction = `You are the master RAWTHINK AI Workshop Tutor, a friendly, objective, and world-class educational instructor teaching Nepalese and South Asian developers, content writers, and marketing professionals. 
      Help them build faster and achieve excellence. You are explaining concepts mentioned in "${courseContext || "AI and Prompt Engineering"}".
      Format your response beautifully with structural Markdown bullet points, clear bold topics, and clean examples. Keep answers concise, helpful, and free from sales filler.`;
      const response = await googleAI.models.generateContent({
        model: "gemini-3.5-flash",
        contents: sanitizedPrompt,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });
      const aiText = response.text || "No response returned from Gemini API.";
      if (deductPoints && user) {
        user.points = (user.points || 0) - 100;
        writeDB(db);
      }
      return res.json({
        text: aiText,
        updatedPoints: user ? user.points : void 0
      });
    } catch (err) {
      console.error("[Gemini API Endpoint Error]", err);
      return res.status(500).json({
        error: `Failed to retrieve response: ${err.message || err.toString()}`,
        text: `Failed to query the AI Model. Fallback simulated tip: When configuring Prompt matrices, maintain concise, sequential guidelines inside system delimiters.`
      });
    }
  });
  app.get("/api/admin/stats", (req, res) => {
    const db = readDB();
    const totalUsers = db.users.length;
    const totalRevenue = db.enrollments.filter((e) => e.status === "approved").reduce((sum, e) => sum + e.price, 0);
    const registeredStudents = db.users.filter((u) => u.role === "student").length;
    const pendingPayments = db.enrollments.filter((e) => e.status === "pending").length;
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
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  return app;
}
async function startServer() {
  const app = await createApp();
  const PORT = Number(process.env.PORT || 3e3);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[RAWTHINK AI Backend] Server successfully booted at http://localhost:${PORT}`);
  });
}
if (!process.env.VERCEL) {
  startServer();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createApp
});
//# sourceMappingURL=server.cjs.map
