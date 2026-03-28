import { lazy } from 'react';
import {
  Activity,
  Braces,
  Calculator,
  ClipboardList,
  Database,
  FileCode,
  Globe,
  Hash,
  HelpCircle,
  ImagePlus,
  Mail,
  MapPin,
  PenLine,
  QrCode,
  RefreshCw,
  ScanText,
  Scissors,
  Sparkles,
  ThumbsUp,
  Timer,
  Users,
  Wand2,
} from 'lucide-react';

const DEFAULT_MAX_WIDTH_CLASS = 'max-w-4xl';

const createTool = ({ loader, showInSidebar = true, maxWidthClass = DEFAULT_MAX_WIDTH_CLASS, ...tool }) => ({
  ...tool,
  loader,
  showInSidebar,
  maxWidthClass,
  Component: lazy(loader),
});

export const CONTACT_MARC_HREF =
  'mailto:doyouknowmarc@mail.com?subject=%5BHelpful%20Tools%5D%20..%20&body=Hi%20Marc,';

export const defaultToolId = 'counter';

export const toolRegistry = [
  createTool({
    id: 'counter',
    title: 'Simple Counter',
    sidebarLabel: 'Simple Counter',
    icon: Hash,
    loader: () => import('./components/CounterTool'),
  }),
  createTool({
    id: 'heic2jpg',
    title: 'HEIC to JPG Converter',
    sidebarLabel: 'HEIC to JPG',
    icon: ImagePlus,
    loader: () => import('./components/HeicToJpgConverter'),
  }),
  createTool({
    id: 'screenshot',
    title: 'Screenshot Optimizer',
    sidebarLabel: 'Screenshot Optimizer',
    icon: Sparkles,
    loader: () => import('./components/ScreenshotOptimizer'),
  }),
  createTool({
    id: 'backgroundremoval',
    title: 'Background Remover',
    sidebarLabel: 'Background Remover',
    icon: Scissors,
    loader: () => import('./components/BackgroundRemovalTool'),
  }),
  createTool({
    id: 'textcounter',
    title: 'Text Counter',
    sidebarLabel: 'Text Counter',
    icon: PenLine,
    loader: () => import('./components/TextCounter'),
  }),
  createTool({
    id: 'converter',
    title: 'Text Converter',
    sidebarLabel: 'Converter',
    icon: RefreshCw,
    loader: () => import('./components/TextConverter'),
  }),
  createTool({
    id: 'base64',
    title: 'Base64 Encoder & Decoder',
    sidebarLabel: 'Base64 Tool',
    icon: FileCode,
    loader: () => import('./components/Base64Tool'),
  }),
  createTool({
    id: 'pomodoro',
    title: 'Pomodoro Timer',
    sidebarLabel: 'Pomodoro Timer',
    icon: Timer,
    loader: () => import('./components/PomodoroTimer'),
  }),
  createTool({
    id: 'meetingprep',
    title: 'Meeting Prep Assistant',
    sidebarLabel: 'Meeting Prep',
    icon: ClipboardList,
    maxWidthClass: 'max-w-6xl xl:max-w-7xl',
    loader: () => import('./components/MeetingPrepAssistant'),
  }),
  createTool({
    id: 'voting',
    title: 'Local Voting Session',
    sidebarLabel: 'Voting Session',
    icon: ThumbsUp,
    loader: () => import('./components/VotingTool'),
  }),
  createTool({
    id: 'ipaddress',
    title: 'Public IP Address',
    sidebarLabel: 'Public IP',
    icon: Globe,
    loader: () => import('./components/PublicIp'),
  }),
  createTool({
    id: 'locationdata',
    title: 'Location Data Visualizer',
    sidebarLabel: 'Location Data',
    icon: MapPin,
    loader: () => import('./components/LocationDataTool'),
  }),
  createTool({
    id: 'mailtolink',
    title: 'Mailto Link Generator',
    sidebarLabel: 'Mailto Link',
    icon: Mail,
    loader: () => import('./components/MailtoLinkGenerator'),
  }),
  createTool({
    id: 'tone',
    title: 'Content Tone Adjuster',
    sidebarLabel: 'Tone Adjuster',
    icon: Wand2,
    maxWidthClass: 'max-w-6xl xl:max-w-7xl',
    loader: () => import('./components/ContentToneAdjuster'),
  }),
  createTool({
    id: 'qrcode',
    title: 'QR Code Generator',
    sidebarLabel: 'QR Codes',
    icon: QrCode,
    loader: () => import('./components/QrCodeGenerator'),
  }),
  createTool({
    id: 'ocr',
    title: 'Document OCR',
    sidebarLabel: 'Document OCR',
    icon: ScanText,
    loader: () => import('./components/ocr/OcrTool'),
  }),
  createTool({
    id: 'ragcalc',
    title: 'RAG Token Calculator',
    sidebarLabel: 'RAG Calculator',
    icon: Calculator,
    maxWidthClass: 'max-w-none',
    loader: () => import('./components/RAGTokenCalculator'),
  }),
  createTool({
    id: 'regex',
    title: 'Regex Tester & Explainer',
    sidebarLabel: 'Regex Tester',
    icon: Braces,
    loader: () => import('./components/RegexTester'),
  }),
  createTool({
    id: 'tokenrate',
    title: 'Token Production Rate Demo',
    sidebarLabel: 'Token Rate Demo',
    icon: Activity,
    loader: () => import('./components/TokenProductionRateDemo'),
  }),
  createTool({
    id: 'esramcalc',
    title: 'ES RAM Calculator',
    sidebarLabel: 'ES RAM Calculator',
    icon: Database,
    loader: () => import('./components/ElasticSearchRamCalculator'),
  }),
  createTool({
    id: 'stakeholders',
    title: 'Stakeholder Matrix',
    sidebarLabel: 'Stakeholder Matrix',
    icon: Users,
    maxWidthClass: 'max-w-none',
    showInSidebar: false,
    loader: () => import('./components/stakeholder/StakeholderTool'),
  }),
  createTool({
    id: 'comingsoon',
    title: 'coming soon ..',
    sidebarLabel: 'coming soon ..',
    icon: HelpCircle,
    loader: () => import('./components/ComingSoonTool'),
  }),
];

export const sidebarTools = toolRegistry.filter((tool) => tool.showInSidebar);

const toolLookup = Object.fromEntries(toolRegistry.map((tool) => [tool.id, tool]));

export function getToolConfig(toolId) {
  return toolLookup[toolId] || toolLookup[defaultToolId];
}
