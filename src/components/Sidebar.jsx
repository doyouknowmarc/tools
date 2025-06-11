import React from 'react';
import {
  PenLine,
  Mail,
  HelpCircle,
  ImagePlus,
  Timer,
  Globe
} from 'lucide-react';
import clsx from 'clsx';

function Sidebar({ activeTool, setActiveTool }) {
  return (
    <div className="w-64 bg-white border-r border-gray-200">
      <div className="flex flex-col h-full">
        {/* User Profile */}
        <div className="p-4">
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
              onClick={() => setActiveTool('heic2jpg')}
            >
              <ImagePlus className="w-5 h-5" />
              <span className="font-medium">HEIC to JPG</span>
            </button>

            <button 
              className={clsx(
                "w-full px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors",
                activeTool === 'textcounter' 
                  ? "bg-gray-900 text-white hover:bg-gray-800" 
                  : "text-gray-600 hover:bg-gray-50"
              )}
              onClick={() => setActiveTool('textcounter')}
            >
              <PenLine className="w-5 h-5" />
              <span className="font-medium">Text Counter</span>
            </button>
            
            <button
              className={clsx(
                "w-full px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors",
                activeTool === 'pomodoro'
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-50"
              )}
              onClick={() => setActiveTool('pomodoro')}
            >
              <Timer className="w-5 h-5" />
              <span className="font-medium">Pomodoro Timer</span>
            </button>

            <button
              className={clsx(
                "w-full px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors",
                activeTool === 'ipaddress'
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-50"
              )}
              onClick={() => setActiveTool('ipaddress')}
            >
              <Globe className="w-5 h-5" />
              <span className="font-medium">Public IP</span>
            </button>

            <button 
              className={clsx(
                "w-full px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors",
                activeTool === 'comingsoon' 
                  ? "bg-gray-900 text-white hover:bg-gray-800" 
                  : "text-gray-600 hover:bg-gray-50"
              )}
              onClick={() => setActiveTool('comingsoon')}
            >
              <HelpCircle className="w-5 h-5" />
              <span className="font-medium">coming soon ..</span>
            </button>
          </nav>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-auto p-4">
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <NavItem icon={<Mail className="w-5 h-5" />} text="Contact Marc" />
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, text }) {
  const handleClick = () => {
    if (text === "Contact Marc") {
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