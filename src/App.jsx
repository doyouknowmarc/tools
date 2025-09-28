import React, { useState } from 'react';
import clsx from 'clsx';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import TextCounter from './components/TextCounter';
import HeicToJpgConverter from './components/HeicToJpgConverter';
import PomodoroTimer from './components/PomodoroTimer';
import PublicIp from './components/PublicIp';
import StakeholderTool from './components/stakeholder/StakeholderTool';
import OcrTool from './components/ocr/OcrTool';
import RAGTokenCalculator from './components/RAGTokenCalculator';
import TokenProductionRateDemo from './components/TokenProductionRateDemo';
import TextConverter from './components/TextConverter';
import ElasticSearchRamCalculator from './components/ElasticSearchRamCalculator';
import MailtoLinkGenerator from './components/MailtoLinkGenerator';
import QrCodeGenerator from './components/QrCodeGenerator';
import ScreenshotOptimizer from './components/ScreenshotOptimizer';
import MeetingPrepAssistant from './components/MeetingPrepAssistant';
import RegexTester from './components/RegexTester';
import ContentToneAdjuster from './components/ContentToneAdjuster';
import LocationDataTool from './components/LocationDataTool';
import Base64Tool from './components/Base64Tool';

function App() {
  // Active tool state
  const [activeTool, setActiveTool] = useState('heic2jpg');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 lg:flex-row">
      {/* Mobile sidebar overlay */}
      <div
        className={clsx(
          'fixed inset-0 z-40 flex transition-opacity duration-300 lg:hidden',
          isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div
          className="absolute inset-0 bg-gray-900/50"
          onClick={() => setIsSidebarOpen(false)}
        />
        <div
          className={clsx(
            'relative flex h-full w-64 max-w-full transform transition-transform duration-300',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <Sidebar
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            className="h-full shadow-xl"
            showCloseButton
            onClose={() => setIsSidebarOpen(false)}
            onNavigate={() => setIsSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block lg:shrink-0">
        <Sidebar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          className="h-full"
          onNavigate={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div
          className={clsx(
            'mx-auto',
            activeTool === 'stakeholders' || activeTool === 'ragcalc'
              ? 'w-full max-w-none'
              : activeTool === 'meetingprep' || activeTool === 'tone'
              ? 'max-w-5xl'
              : 'max-w-4xl'
          )}
        >
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-gray-100 lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {activeTool === 'heic2jpg'
                  ? 'HEIC to JPG Converter'
                  : activeTool === 'textcounter'
                  ? 'Text Counter'
                  : activeTool === 'converter'
                  ? 'Text Converter'
                  : activeTool === 'pomodoro'
                  ? 'Pomodoro Timer'
                  : activeTool === 'ipaddress'
                  ? 'Public IP Address'
                  : activeTool === 'stakeholders'
                  ? 'Stakeholder Matrix'
                  : activeTool === 'ragcalc'
                  ? 'RAG Token Calculator'
                  : activeTool === 'ocr'
                  ? 'Document OCR'
                  : activeTool === 'tokenrate'
                  ? 'Token Production Rate Demo'
                  : activeTool === 'esramcalc'
                  ? 'ES RAM Calculator'
                  : activeTool === 'mailtolink'
                  ? 'Mailto Link Generator'
                  : activeTool === 'qrcode'
                  ? 'QR Code Generator'
                  : activeTool === 'screenshot'
                  ? 'Screenshot Optimizer'
                  : activeTool === 'meetingprep'
                  ? 'Meeting Prep Assistant'
                  : activeTool === 'regex'
                  ? 'Regex Tester & Explainer'
                  : activeTool === 'tone'
                  ? 'Content Tone Adjuster'
                  : activeTool === 'base64'
                  ? 'Base64 Encoder & Decoder'
                  : activeTool === 'locationdata'
                  ? 'Location Data Visualizer'
                  : 'coming soon ..'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-500" />
            </div>
          </div>

          {/* Content Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            {activeTool === 'heic2jpg' ? (
              <HeicToJpgConverter />
            ) : activeTool === 'textcounter' ? (
              <TextCounter />
            ) : activeTool === 'converter' ? (
              <TextConverter />
            ) : activeTool === 'pomodoro' ? (
              <PomodoroTimer />
            ) : activeTool === 'ipaddress' ? (
              <PublicIp />
            ) : activeTool === 'stakeholders' ? (
              <StakeholderTool />
            ) : activeTool === 'ragcalc' ? (
              <RAGTokenCalculator />
            ) : activeTool === 'ocr' ? (
              <OcrTool />
            ) : activeTool === 'tokenrate' ? (
              <TokenProductionRateDemo />
            ) : activeTool === 'esramcalc' ? (
              <ElasticSearchRamCalculator />
            ) : activeTool === 'mailtolink' ? (
              <MailtoLinkGenerator />
            ) : activeTool === 'qrcode' ? (
              <QrCodeGenerator />
            ) : activeTool === 'screenshot' ? (
              <ScreenshotOptimizer />
            ) : activeTool === 'meetingprep' ? (
              <MeetingPrepAssistant />
            ) : activeTool === 'regex' ? (
              <RegexTester />
            ) : activeTool === 'tone' ? (
              <ContentToneAdjuster />
            ) : activeTool === 'base64' ? (
              <Base64Tool />
            ) : activeTool === 'locationdata' ? (
              <LocationDataTool />
            ) : activeTool === 'comingsoon' ? (
              <div className="text-center">
                <button
                  className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
                  onClick={() =>
                    (window.location.href =
                      'mailto:doyouknowmarc@mail.com?subject=I%20suggest%20the%20following%20feature%20bla%20bla%20bla')
                  }
                >
                  Suggest a Feature
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
