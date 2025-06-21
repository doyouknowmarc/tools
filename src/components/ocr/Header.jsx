import React from 'react';
import { ScanText, Shield, Zap } from 'lucide-react';

export default function Header() {
  return (
    <header className="text-center mb-12">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
        <ScanText className="w-8 h-8 text-blue-600" />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Document OCR Processor</h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Transform any document into searchable, editable text with advanced OCR technology.
        Fast, secure, and completely private processing.
      </p>
      <div className="flex flex-wrap justify-center gap-8 text-sm">
        <div className="flex items-center space-x-2 text-gray-700">
          <Shield className="w-5 h-5 text-green-600" />
          <span>100% Client-Side Processing</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-700">
          <Zap className="w-5 h-5 text-blue-600" />
          <span>Instant Results</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-700">
          <ScanText className="w-5 h-5 text-purple-600" />
          <span>Searchable PDFs</span>
        </div>
      </div>
    </header>
  );
}
