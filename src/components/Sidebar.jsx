import React from 'react';
import {
  PenLine,
  Mail,
  HelpCircle,
  ImagePlus,
  Timer,
  Globe,
  ScanText,
  Calculator,
  Activity,
  RefreshCw,
  Database,
  Braces,
  Wand2 as WandIcon,
  QrCode,
  Sparkles,
  ClipboardList as ClipboardListIcon,
  MapPin,
  X,
  FileCode,
  ThumbsUp
} from 'lucide-react';
import clsx from 'clsx';

function Sidebar({
  activeTool,
  setActiveTool,
  className,
  onNavigate,
  showCloseButton,
  onClose,
}) {
  const handleSelectTool = (tool) => () => {
    setActiveTool(tool);
    onNavigate?.();
  };

  return (
    <div
      className={clsx(
        'flex h-full w-64 flex-col overflow-y-auto border-r border-gray-200 bg-white',
        className
      )}
    >
      <div className="flex flex-col h-full">
        {/* User Profile */}
        <div className="p-4">
          {showCloseButton ? (
            <button
              type="button"
              className="mb-4 inline-flex items-center justify-center rounded-md border border-gray-200 bg-white p-2 text-gray-500 shadow-sm hover:bg-gray-100"
              onClick={() => onClose?.()}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-5 w-5" />
            </button>
          ) : null}
          <div className="flex items-center space-x-2 mb-8 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center overflow-hidden">
              <img src="./Marc.jpeg" alt="Marc" className="w-full h-full object-cover" />
            </div>
            <span className="text-gray-700 font-medium flex-1">Helpful Tools</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <button
              className={clsx(
                "w-full px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors",
                activeTool === 'heic2jpg'
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-50"
              )}
              onClick={handleSelectTool('heic2jpg')}
            >
              <ImagePlus className="w-5 h-5" />
              <span className="font-medium">HEIC to JPG</span>
            </button>

            <button
              className={clsx(
                "w-full px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors",
                activeTool === 'screenshot'
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-50"
              )}
              onClick={handleSelectTool('screenshot')}
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Screenshot Optimizer</span>
            </button>

            <button
              className={clsx(
                "w-full px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors",
                activeTool === 'textcounter'
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-50"
              )}
              onClick={handleSelectTool('textcounter')}
            >
              <PenLine className="w-5 h-5" />
              <span className="font-medium">Text Counter</span>
            </button>
            <button
              className={clsx(
                "w-full px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors",
                activeTool === 'converter'
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-50",
              )}
              onClick={handleSelectTool('converter')}
            >
              <RefreshCw className="w-5 h-5" />
              <span className="font-medium">Converter</span>
            </button>

            <button
              className={clsx(
                "w-full px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors",
                activeTool === 'base64'
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-50"
              )}
              onClick={handleSelectTool('base64')}
            >
              <FileCode className="w-5 h-5" />
              <span className="font-medium">Base64 Tool</span>
            </button>

            <button
              className={clsx(
                "w-full px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors",
                activeTool === 'pomodoro'
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-50"
              )}
              onClick={handleSelectTool('pomodoro')}
            >
              <Timer className="w-5 h-5" />
              <span className="font-medium">Pomodoro Timer</span>
            </button>

            <button
              className={clsx(
                "w-full px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors",
                activeTool === 'meetingprep'
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-50"
              )}
              onClick={handleSelectTool('meetingprep')}
            >
              <ClipboardListIcon className="w-5 h-5" />
              <span className="font-medium">Meeting Prep</span>
            </button>

            <button
              className={clsx(
                "w-full px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors",
                activeTool === 'voting'
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-50"
              )}
              onClick={handleSelectTool('voting')}
            >
              <ThumbsUp className="w-5 h-5" />
              <span className="font-medium">Voting Session</span>
            </button>

            <button
              className={clsx(
                "w-full px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors",
                activeTool === 'ipaddress'
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-50"
              )}
              onClick={handleSelectTool('ipaddress')}
            >
              <Globe className="w-5 h-5" />
              <span className="font-medium">Public IP</span>
            </button>

            <button
              className={clsx(
                "w-full px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors",
                activeTool === 'locationdata'
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-50"
              )}
              onClick={handleSelectTool('locationdata')}
            >
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Location Data</span>
            </button>

            <button
              className={clsx(
                "w-full px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors",
                activeTool === 'mailtolink'
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-50"
              )}
              onClick={handleSelectTool('mailtolink')}
            >
              <Mail className="w-5 h-5" />
              <span className="font-medium">Mailto Link</span>
            </button>

            <button
              className={clsx(
                "w-full px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors",
                activeTool === 'tone'
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-50"
              )}
              onClick={handleSelectTool('tone')}
            >
              <WandIcon className="w-5 h-5" />
              <span className="font-medium">Tone Adjuster</span>
            </button>

            <button
              className={clsx(
                "w-full px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors",
                activeTool === 'qrcode'
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-50"
              )}
              onClick={handleSelectTool('qrcode')}
            >
              <QrCode className="w-5 h-5" />
              <span className="font-medium">QR Codes</span>
            </button>

            <button
              className={clsx(
                "w-full px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors",
                activeTool === 'ocr'
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-50"
              )}
              onClick={handleSelectTool('ocr')}
            >
              <ScanText className="w-5 h-5" />
              <span className="font-medium">Document OCR</span>
            </button>


            <button
              className={clsx(
                "w-full px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors",
                activeTool === 'ragcalc'
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-50"
              )}
              onClick={handleSelectTool('ragcalc')}
            >
              <Calculator className="w-5 h-5" />
              <span className="font-medium">RAG Calculator</span>
            </button>
            <button
              className={clsx(
                "w-full px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors",
                activeTool === 'regex'
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-50",
              )}
              onClick={handleSelectTool('regex')}
            >
              <Braces className="w-5 h-5" />
              <span className="font-medium">Regex Tester</span>
            </button>
            <button
              className={clsx(
                "w-full px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors",
                activeTool === 'tokenrate'
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-50",
              )}
              onClick={handleSelectTool('tokenrate')}
            >
              <Activity className="w-5 h-5" />
              <span className="font-medium">Token Rate Demo</span>
            </button>

            <button
              className={clsx(
                "w-full px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors",
                activeTool === 'esramcalc'
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-50",
              )}
              onClick={handleSelectTool('esramcalc')}
            >
              <Database className="w-5 h-5" />
              <span className="font-medium">ES RAM Calculator</span>
            </button>

            <button
              className={clsx(
                "w-full px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors",
                activeTool === 'comingsoon'
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-50"
              )}
              onClick={handleSelectTool('comingsoon')}
            >
              <HelpCircle className="w-5 h-5" />
              <span className="font-medium">coming soon ..</span>
            </button>
          </nav>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-auto p-4">
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <NavItem
              icon={<Mail className="w-5 h-5" />}
              text="Contact Marc"
              onNavigate={onNavigate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, text, onNavigate }) {
  const handleClick = () => {
    if (text === "Contact Marc") {
      onNavigate?.();
      window.location.href = "mailto:doyouknowmarc@mail.com?subject=[Helpful Tools] .. &body=Hi Marc,";
    }
  };

  return (
    <button 
      className="w-full px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg flex items-center space-x-3 transition-colors group"
      onClick={handleClick}
    >
      <span className="text-gray-400 group-hover:text-gray-500">{icon}</span>
      <span className="font-medium">{text}</span>
    </button>
  );
}

export default Sidebar;
