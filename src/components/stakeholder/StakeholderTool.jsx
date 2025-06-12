import React, { useRef } from 'react';
import { DndContext } from '@dnd-kit/core';
import { createSnapModifier } from '@dnd-kit/modifiers';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import StakeholderMatrix from './StakeholderMatrix.jsx';
import PersonaCard from './PersonaCard.jsx';
import StakeholderInfo from './StakeholderInfo.jsx';
import { useStakeholderStore } from './store.js';
import './stakeholder.css';

export default function StakeholderTool() {
  const cards = useStakeholderStore((state) => state.cards);
  const addCard = useStakeholderStore((state) => state.addCard);
  const updatePosition = useStakeholderStore((state) => state.updatePosition);
  const exportRef = useRef();

  const modifiers = [createSnapModifier(40)];

  const handleDragEnd = (event) => {
    const { delta, active } = event;
    updatePosition(active.id, delta);
  };

  const handleExport = () => {
    if (exportRef.current === null) return;
    toPng(exportRef.current, { cacheBust: true })
      .then((dataUrl) => {
        saveAs(dataUrl, 'stakeholder-matrix.png');
      })
      .catch((err) => {
        console.error('Oops, something went wrong!', err);
      });
  };

  return (
    <div className="app-container w-full h-full relative flex flex-col items-center justify-center">
      <StakeholderInfo />
      <DndContext onDragEnd={handleDragEnd} modifiers={modifiers}>
        <div className="matrix-row w-full" ref={exportRef}>
          <StakeholderMatrix
            quadrantLabels={[
              'Blockers',
              'Drivers',
              'Bystanders',
              'Defenders',
            ]}
            onAddCard={() => addCard(2)}
          >
            {cards
              .filter((card) => card.matrixId === 2)
              .map((card) => (
                <PersonaCard key={card.id} id={card.id} />
              ))}
          </StakeholderMatrix>
          <StakeholderMatrix onAddCard={() => addCard(1)}>
            {cards
              .filter((card) => card.matrixId === 1)
              .map((card) => (
                <PersonaCard key={card.id} id={card.id} />
              ))}
          </StakeholderMatrix>
        </div>
      </DndContext>
      <button
        type="button"
        onClick={handleExport}
        className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors"
      >
        Export as PNG
      </button>
    </div>
  );
}
