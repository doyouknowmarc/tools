import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useStakeholderStore } from './store.js';

export default function PersonaCard({ id }) {
  const card = useStakeholderStore((state) =>
    state.cards.find((c) => c.id === id)
  );
  const updateCard = useStakeholderStore((state) => state.updateCard);
  const removeCard = useStakeholderStore((state) => state.removeCard);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const style = {
    transform: `translate3d(${card.x + (transform?.x || 0)}px, ${
      card.y + (transform?.y || 0)
    }px, 0)`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="persona-card"
      {...listeners}
      {...attributes}
    >
      <button
        type="button"
        className="delete-card-button"
        onClick={(e) => {
          e.stopPropagation();
          removeCard(id);
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        ×
      </button>

      <input
        className="persona-input"
        type="text"
        placeholder="Name"
        value={card.name}
        onChange={(e) => updateCard(id, { name: e.target.value })}
        onPointerDown={(e) => e.stopPropagation()}
        required
      />
      <input
        className="persona-input"
        type="text"
        placeholder="Role / Organisation"
        value={card.role}
        onChange={(e) => updateCard(id, { role: e.target.value })}
        onPointerDown={(e) => e.stopPropagation()}
      />
      <textarea
        className="persona-textarea"
        placeholder="Why here?"
        value={card.why}
        onChange={(e) => updateCard(id, { why: e.target.value })}
        onPointerDown={(e) => e.stopPropagation()}
      />
    </div>
  );
}
