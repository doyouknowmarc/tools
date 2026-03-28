import React from 'react';

const SUGGEST_FEATURE_HREF =
  'mailto:doyouknowmarc@mail.com?subject=I%20suggest%20the%20following%20feature%20bla%20bla%20bla';

export default function ComingSoonTool() {
  return (
    <div className="text-center">
      <a
        href={SUGGEST_FEATURE_HREF}
        className="inline-flex rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
      >
        Suggest a Feature
      </a>
    </div>
  );
}
