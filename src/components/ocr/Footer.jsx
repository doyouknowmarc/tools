import React from 'react';
import { Info, Lock, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 text-center">
      <div className="border-t border-gray-200 pt-8">
        <div className="flex flex-wrap justify-center gap-8 mb-6">
          <div className="flex items-start space-x-3 text-sm max-w-xs">
            <Lock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900">Privacy First</div>
              <div className="text-gray-600">
                All document processing happens locally in your browser. No data is sent to servers.
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3 text-sm max-w-xs">
            <Cpu className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900">Advanced OCR</div>
              <div className="text-gray-600">
                Powered by Tesseract.js for accurate text recognition across multiple languages.
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3 text-sm max-w-xs">
            <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900">Searchable Output</div>
              <div className="text-gray-600">
                PDFs are enhanced with invisible text layers for full searchability.
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          <p>Supported formats: PDF, JPG, PNG, TIFF • Maximum file size: 25MB</p>
          <p className="mt-1">
            For best results, ensure documents have clear text and good contrast.
          </p>
        </div>
      </div>
    </footer>
  );
}
