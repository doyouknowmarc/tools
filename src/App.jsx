import React, { Suspense, useState } from 'react';
import clsx from 'clsx';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import { defaultToolId, getToolConfig } from './toolRegistry';

function App() {
  const [activeTool, setActiveTool] = useState(defaultToolId);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeToolConfig = getToolConfig(activeTool);
  const ActiveToolComponent = activeToolConfig.Component;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 lg:flex-row">
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
            onSelectTool={setActiveTool}
            className="h-full shadow-xl"
            showCloseButton
            onClose={() => setIsSidebarOpen(false)}
            onNavigate={() => setIsSidebarOpen(false)}
          />
        </div>
      </div>

      <div className="hidden lg:block lg:shrink-0">
        <Sidebar
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          className="h-full"
          onNavigate={() => setIsSidebarOpen(false)}
        />
      </div>

      <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className={clsx('mx-auto w-full', activeToolConfig.maxWidthClass)}>
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
                {activeToolConfig.title}
              </h1>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <Suspense
              fallback={
                <div
                  role="status"
                  className="flex min-h-[12rem] items-center justify-center text-sm text-gray-500"
                >
                  Loading tool…
                </div>
              }
            >
              <ActiveToolComponent />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
