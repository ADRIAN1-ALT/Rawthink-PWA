export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'student' | 'admin';
  sessionToken?: string;
  coins?: number; // alias for points - used to denote spendable coins in UI
  referralCode: string;
  referredByBy?: string;
  points: number;
  badges: string[];
  streak: number;
  createdAt: string;
  achievements: string[];
  referrals?: string[]; // Emails of registered friends referred by this user
  unlockedResources?: string[]; // List of premium resource IDs unlocked with coins
  unlockedTools?: string[]; // List of AI tool IDs unlocked with coins
  coinsInvested?: number; // cumulative coins spent (used to lift unlock limits)
  referredDownloads?: number; // Number of referred friends who successfully downloaded the PWA app
  selectedTimeSlots?: { [courseId: string]: string }; // Course ID to TimeSlot ID booking map
  password?: string;
  resetToken?: string;
  resetTokenExpiresAt?: number;
  resetTokenSentAt?: string;
}

export interface Course {
  id: string;
  title: string;
  price: number; // in Nepalese Rupees (Rs.)
  duration: string;
  badge?: string;
  features: string[];
  bonuses: string[];
  schedule: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  price: number;
  transactionId: string;
  remarks?: string;
  screenshotUrl?: string; // base64 screenshot string
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface ResourceDownload {
  id: string;
  title: string;
  category: string;
  downloadsCount: number;
  fileSize: string;
  downloadUrl: string;
}

export interface AITool {
  id: string;
  name: string;
  category: 'Writing' | 'Image' | 'Video' | 'Coding' | 'Research' | 'Presentation' | 'Productivity';
  description: string;
  tags: string[];
  link: string;
  iconName: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface QuizHistory {
  id: string;
  userId: string;
  userName: string;
  score: number;
  totalQuestions: number;
  pointsEarned: number;
  date: string;
}

export interface ForumPost {
  id: string;
  userId: string;
  userName: string;
  userRole: 'student' | 'admin';
  category: 'announcement' | 'discussion' | 'showcase' | 'qa';
  title: string;
  content: string;
  likes: number;
  comments: ForumComment[];
  createdAt: string;
}

export interface ForumComment {
  id: string;
  userId: string;
  userName: string;
  userRole: 'student' | 'admin';
  content: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
}

export interface Notification {
  id: string;
  userId: string;
  text: string;
  isRead: boolean;
  createdAt: string;
}

export interface SessionSchedule {
  id: string;
  courseId: string;
  workshopName: string;
  instructor: string;
  date: string;
  time: string;
  seatsRemaining: number;
  totalSeats: number;
}
