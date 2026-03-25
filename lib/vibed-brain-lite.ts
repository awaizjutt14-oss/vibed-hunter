type Signal = "use" | "save" | "copy_hook" | "more" | "less" | "good_hook" | "weak_hook";
type Slot = "12:30 PM" | "6:30 PM" | "9:15 PM";

type BrainState = {
  slotCategory: Record<Slot, Record<string, number>>;
  slotHook: Record<Slot, Record<string, number>>;
  rejects: Record<string, number>;
};

const state: BrainState = {
  slotCategory: {
    "12:30 PM": {},
    "6:30 PM": {},
    "9:15 PM": {}
  },
  slotHook: {
    "12:30 PM": {},
    "6:30 PM": {},
    "9:15 PM": {}
  },
  rejects: {}
};

export function recordBrainFeedback(input: { slot: Slot; category?: string; hookStyle?: string; signal: Signal }) {
  const { slot, category, hookStyle, signal } = input;
  const delta = signal === "less" || signal === "weak_hook" ? -1 : 1;

  if (category) {
    state.slotCategory[slot][category] = (state.slotCategory[slot][category] ?? 0) + delta;
  }

  if (hookStyle) {
    state.slotHook[slot][hookStyle] = (state.slotHook[slot][hookStyle] ?? 0) + delta;
  }

  if ((signal === "less" || signal === "weak_hook") && category) {
    state.rejects[category] = (state.rejects[category] ?? 0) + 1;
  }
}

export function brainWeight(slot: Slot, category: string, hookStyle: string) {
  const categoryScore = state.slotCategory[slot][category] ?? 0;
  const hookScore = state.slotHook[slot][hookStyle] ?? 0;
  const rejectPenalty = state.rejects[category] ?? 0;
  return categoryScore + hookScore - rejectPenalty;
}

export function brainNotes(): string[] {
  const notes: string[] = [];

  (["12:30 PM", "6:30 PM", "9:15 PM"] as Slot[]).forEach((slot) => {
    const topCategory = topKey(state.slotCategory[slot]);
    const topHook = topKey(state.slotHook[slot]);

    if (topCategory || topHook) {
      notes.push(
        `${slot}: ${topCategory ? `prefers ${topCategory}` : ""}${topCategory && topHook ? ", " : ""}${topHook ? `likes ${topHook} hooks` : ""}`
      );
    }
  });

  return notes.slice(0, 3);
}

function topKey(obj: Record<string, number>) {
  const entries = Object.entries(obj);
  if (!entries.length) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}
