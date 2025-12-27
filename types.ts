
export enum AppTab {
  HOME = 'home',
  CHAT = 'chat',
  QUIZ = 'quiz',
  GAMES = 'games',
  TOOLS = 'tools',
  VIDEO_LAB = 'video_lab',
  SIMULATOR = 'simulator',
  ABOUT = 'about'
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
}

export interface QuizResult {
  score: number;
  total: number;
  timeSpent: number;
  accuracy: number;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  currentQuestion: number;
  isReady: boolean;
  lastResponseTime?: number;
}

export interface Room {
  id: string;
  hostId: string;
  players: Player[];
  status: 'lobby' | 'playing' | 'finished';
  questionIds: string[];
}

export interface LeaderboardEntry {
  playerName: string;
  score: number;
  date: string;
}
