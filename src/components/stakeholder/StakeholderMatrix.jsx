import React, { forwardRef } from 'react';

const defaultQuadrants = [
  'Keep satisfied',
  'Manage closely',
  'Monitor',
  'Keep informed',
];

const StakeholderMatrix = forwardRef(function StakeholderMatrix(
  { children, quadrantLabels = defaultQuadrants, xLabel = 'Interest', yLabel = 'Influence' },
  ref
) {
  const [tl, tr, bl, br] = quadrantLabels;
  return (
    <div ref={ref} className="stakeholder-matrix relative w-full aspect-square flex-1">
      <div className="axis-y">
        <span>{yLabel}</span>
      </div>
      <div className="axis-x">
        <span>{xLabel}</span>
      </div>
      <div className="matrix-grid">
        <div className="cell">{tl}</div>
        <div className="cell">{tr}</div>
        <div className="cell">{bl}</div>
        <div className="cell">{br}</div>
      </div>
      {children}
    </div>
  );
});

export default StakeholderMatrix;
