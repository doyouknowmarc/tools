import React, { useState } from 'react';
import clsx from 'clsx';
import Sidebar from './components/Sidebar';
import TextCounter from './components/TextCounter';
import HeicToJpgConverter from './components/HeicToJpgConverter';
import PomodoroTimer from './components/PomodoroTimer';
import PublicIp from './components/PublicIp';
import StakeholderTool from './components/stakeholder/StakeholderTool';


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
                activeTool === 'stakeholders' ? 'w-2/3 max-w-none' : 'max-w-4xl'
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
                  : activeTool === 'pomodoro'
                  ? 'Pomodoro Timer'
                  : activeTool === 'ipaddress'
                  ? 'Public IP Address'
                  : activeTool === 'stakeholders'
                  ? 'Stakeholder Matrix'
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
              ) : activeTool === 'pomodoro' ? (
                <PomodoroTimer />
              ) : activeTool === 'ipaddress' ? (
                <PublicIp />
              ) : activeTool === 'stakeholders' ? (
                <StakeholderTool />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default App;
