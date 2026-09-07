type StoryTone = {
  badge: string;
  panel: string;
  accent: string;
  ring: string;
  glyph: string;
  dot: string;
};

const STORY_TONES: StoryTone[] = [
  {
    badge: "bg-sky-100 text-sky-700 ring-sky-200",
    panel: "from-sky-50/90 via-white to-cyan-50/80",
    accent: "from-sky-200 via-cyan-200 to-white",
    ring: "ring-sky-200/70",
    glyph: "text-sky-300",
    dot: "bg-sky-300",
  },
  {
    badge: "bg-rose-100 text-rose-700 ring-rose-200",
    panel: "from-rose-50/90 via-white to-pink-50/80",
    accent: "from-rose-200 via-pink-200 to-white",
    ring: "ring-rose-200/70",
    glyph: "text-rose-300",
    dot: "bg-rose-300",
  },
  {
    badge: "bg-amber-100 text-amber-700 ring-amber-200",
    panel: "from-amber-50/90 via-white to-orange-50/80",
    accent: "from-amber-200 via-orange-200 to-white",
    ring: "ring-amber-200/70",
    glyph: "text-amber-300",
    dot: "bg-amber-300",
  },
  {
    badge: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    panel: "from-emerald-50/90 via-white to-lime-50/80",
    accent: "from-emerald-200 via-lime-200 to-white",
    ring: "ring-emerald-200/70",
    glyph: "text-emerald-300",
    dot: "bg-emerald-300",
  },
  {
    badge: "bg-violet-100 text-violet-700 ring-violet-200",
    panel: "from-violet-50/90 via-white to-fuchsia-50/80",
    accent: "from-violet-200 via-fuchsia-200 to-white",
    ring: "ring-violet-200/70",
    glyph: "text-violet-300",
    dot: "bg-violet-300",
  },
  {
    badge: "bg-fuchsia-100 text-fuchsia-700 ring-fuchsia-200",
    panel: "from-fuchsia-50/90 via-white to-rose-50/80",
    accent: "from-fuchsia-200 via-rose-200 to-white",
    ring: "ring-fuchsia-200/70",
    glyph: "text-fuchsia-300",
    dot: "bg-fuchsia-300",
  },
  {
    badge: "bg-cyan-100 text-cyan-700 ring-cyan-200",
    panel: "from-cyan-50/90 via-white to-sky-50/80",
    accent: "from-cyan-200 via-sky-200 to-white",
    ring: "ring-cyan-200/70",
    glyph: "text-cyan-300",
    dot: "bg-cyan-300",
  },
  {
    badge: "bg-lime-100 text-lime-700 ring-lime-200",
    panel: "from-lime-50/90 via-white to-emerald-50/80",
    accent: "from-lime-200 via-emerald-200 to-white",
    ring: "ring-lime-200/70",
    glyph: "text-lime-300",
    dot: "bg-lime-300",
  },
];

function hashStoryKey(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function getStoryTone(key?: string | null) {
  const normalized = key?.trim().toLowerCase();
  if (!normalized) {
    return STORY_TONES[0]!;
  }

  return STORY_TONES[hashStoryKey(normalized) % STORY_TONES.length]!;
}
