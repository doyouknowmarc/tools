import { create } from 'zustand';

let idCounter = 0;

export const useStakeholderStore = create((set) => ({
  cards: [],
  addCard: (matrixId) =>
    set((state) => ({
      cards: [
        ...state.cards,
        {
          id: ++idCounter,
          matrixId,
          name: '',
          role: '',
          why: '',
          x: 20,
          y: 20,
        },
      ],
    })),
  updateCard: (id, data) =>
    set((state) => ({
      cards: state.cards.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),
  updatePosition: (id, delta) =>
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === id ? { ...c, x: c.x + delta.x, y: c.y + delta.y } : c
      ),
    })),
  removeCard: (id) =>
    set((state) => ({
      cards: state.cards.filter((c) => c.id !== id),
    })),
}));
