import React, { useState } from 'react';
import clsx from 'clsx';
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


function App() {
  // Active tool state
  const [activeTool, setActiveTool] = useState('heic2jpg');
  
  

  
  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      <div className="flex h-screen">
        <Sidebar activeTool={activeTool} setActiveTool={setActiveTool} />

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto h-screen">
          <div
            className={
              clsx(
                'mx-auto',
                activeTool === 'stakeholders' || activeTool === 'ragcalc'
                  ? 'w-full max-w-none'
                  : 'max-w-4xl'
              )
            }
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
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
                  : 'coming soon ..'}
              </h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-500">
                </div>
              </div>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
              ) : activeTool === 'comingsoon' ? (
                <div className="text-center">
                  <button
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
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
    </div>
  );
}


export default App;
