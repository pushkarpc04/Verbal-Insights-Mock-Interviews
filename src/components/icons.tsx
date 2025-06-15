
import React from 'react';
import {
  Home,
  Settings,
  PlusCircle,
  List,
  BarChart2,
  Mic,
  FileText,
  Sparkles,
  Lightbulb,
  CheckCircle,
  XCircle,
  Edit3,
  Trash2,
  ChevronsUpDown,
  HelpCircle,
  Briefcase,
  MessageSquare,
  Brain,
  RotateCcw,
  Copy,
  Save,
  PlayCircle,
  PauseCircle,
  StopCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreVertical,
  Download,
  Upload,
  Info,
  BookOpen,
  LogOut,
  LogIn, // Added LogIn import
  User,
  Clock,
  AlertTriangle,
  Zap,
  ThumbsUp,
  ThumbsDown,
  ClipboardList,
  Target,
  Edit,
  Book,
  Search,
  Mail,
  Lock,
} from 'lucide-react';
import { cn } from "@/lib/utils";

export const Icons = {
  home: Home,
  settings: Settings,
  add: PlusCircle,
  list: List,
  progress: BarChart2,
  mic: Mic,
  transcript: FileText,
  ai: Sparkles,
  feedback: Lightbulb,
  success: CheckCircle,
  error: XCircle,
  edit: Edit3,
  delete: Trash2,
  dropdown: ChevronsUpDown,
  help: HelpCircle,
  job: Briefcase,
  question: MessageSquare,
  analysis: Brain,
  retry: RotateCcw,
  copy: Copy,
  save: Save,
  play: PlayCircle,
  pause: PauseCircle,
  stop: StopCircle,
  prev: ChevronLeft,
  next: ChevronRight,
  view: Eye,
  more: MoreVertical,
  download: Download,
  upload: Upload,
  info: Info,
  guide: BookOpen,
  logout: LogOut,
  login: LogIn, // Added login icon
  user: User,
  clock: Clock,
  warning: AlertTriangle,
  generate: Zap,
  thumbsUp: ThumbsUp,
  thumbsDown: ThumbsDown,
  questionSet: ClipboardList,
  target: Target,
  editPencil: Edit,
  book: Book,
  search: Search,
  mail: Mail,
  lock: Lock,
  logo: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
      <path d="M12 22V12" />
      <circle cx="12" cy="7" r="1" />
      <circle cx="7" cy="9.5" r="1" />
      <circle cx="17" cy="9.5" r="1" />
    </svg>
  ),
};

export const LoadingSpinner = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("animate-spin", className)}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

