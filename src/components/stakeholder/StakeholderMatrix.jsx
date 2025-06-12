import React, { forwardRef } from 'react';

const defaultQuadrants = [
  'Keep satisfied',
  'Manage closely',
  'Monitor',
  'Keep informed',
];

const StakeholderMatrix = forwardRef(function StakeholderMatrix(
  { children, quadrantLabels = defaultQuadrants, xLabel = 'Interest', yLabel = 'Influence', onAddCard },
  ref
) {
  const [tl, tr, bl, br] = quadrantLabels;
  return (
    <div ref={ref} className="stakeholder-matrix relative w-full max-w-lg aspect-square mx-auto">
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
      {onAddCard && (
        <button type="button" className="add-card-button" onClick={onAddCard}>
          +
        </button>
      )}
    </div>
  );
});

export default StakeholderMatrix;
