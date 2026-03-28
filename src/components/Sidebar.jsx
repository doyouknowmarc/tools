import React from 'react';
import { Mail, X } from 'lucide-react';
import clsx from 'clsx';
import { CONTACT_MARC_HREF, sidebarTools } from '../toolRegistry';

function Sidebar({
  activeTool,
  onSelectTool,
  className,
  onNavigate,
  showCloseButton,
  onClose,
}) {
  const handleSelectTool = (toolId) => () => {
    onSelectTool(toolId);
    onNavigate?.();
  };

  const profileImageUrl = `${import.meta.env.BASE_URL}Marc.jpeg`;

  return (
    <div
      className={clsx(
        'flex h-full w-64 flex-col overflow-y-auto border-r border-gray-200 bg-white',
        className
      )}
    >
      <div className="flex h-full flex-col">
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

          <div className="mb-8 flex cursor-pointer items-center space-x-2 rounded-lg p-2 hover:bg-gray-50">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-rose-500">
              <img
                src={profileImageUrl}
                alt="Marc"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="flex-1 font-medium text-gray-700">Helpful Tools</span>
          </div>

          <nav className="space-y-2">
            {sidebarTools.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;

              return (
                <button
                  key={tool.id}
                  type="button"
                  className={clsx(
                    'flex w-full items-center space-x-3 rounded-lg px-3 py-2 transition-colors',
                    isActive
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                  onClick={handleSelectTool(tool.id)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tool.sidebarLabel}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="space-y-2 border-t border-gray-200 pt-4">
            <a
              href={CONTACT_MARC_HREF}
              className="group flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-50"
              onClick={() => onNavigate?.()}
            >
              <Mail className="h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              <span className="font-medium">Contact Marc</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
