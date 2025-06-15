export interface Question {
  id: string;
  text: string;
  // Could add difficulty, category, etc. later
}

export interface Answer {
  questionId: string;
  audioUrl?: string; // URL to recorded audio
  transcript: string;
  duration?: number; // seconds
}

export interface SentimentAnalysis {
  overallSentiment: string;
  confidenceLevel: string;
  areasForImprovement: string;
}

export interface CoachingFeedback {
  feedback: string;
}

export interface KeywordRelevance {
  relevanceAnalysis: string;
}

export interface InterviewFeedback {
  sentimentAnalysis?: SentimentAnalysis;
  coachingFeedback?: CoachingFeedback;
  keywordRelevance?: KeywordRelevance;
}

export interface InterviewSession {
  id: string;
  title: string;
  jobDescription?: string;
  questions: Question[];
  answers: Answer[];
  feedback?: InterviewFeedback[]; // Array of feedback, one per question/answer
  overallFeedback?: SentimentAnalysis; // Overall session feedback
  createdAt: string; // ISO date string
  duration?: number; // total duration in seconds
  customQuestionSetId?: string;
}

export interface QuestionSet {
  id: string;
  name: string;
  description?: string;
  questions: Question[];
  createdAt: string; // ISO date string
  jobDescriptionContext?: string; // Job description used to generate this set
}

export interface ProgressMetric {
  date: string; // or Date object
  score: number; // e.g., average sentiment score
  metricName: string;
}
