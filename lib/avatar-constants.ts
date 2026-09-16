export interface LightColorOption {
  id: string;
  name: string;
  bg: string;
  border: string;
  text: string;
  ring: string;
  hexBg: string;
  hexBorder: string;
  hexText: string;
  hexDot: string;
}

export const ALPHABETS = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
  "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
  "U", "V", "W", "X", "Y", "Z"
];

export const LIGHT_COLORS: LightColorOption[] = [
  {
    id: "lavender",
    name: "Lavender",
    bg: "bg-[#f3e8ff]",
    border: "border-[#c084fc]",
    text: "text-[#6b21a8]",
    ring: "ring-[#9333ea]",
    hexBg: "#f3e8ff",
    hexBorder: "#c084fc",
    hexText: "#6b21a8",
    hexDot: "#9333ea",
  },
  {
    id: "sky",
    name: "Sky Blue",
    bg: "bg-[#e0f2fe]",
    border: "border-[#7dd3fc]",
    text: "text-[#0369a1]",
    ring: "ring-[#0284c7]",
    hexBg: "#e0f2fe",
    hexBorder: "#7dd3fc",
    hexText: "#0369a1",
    hexDot: "#0284c7",
  },
  {
    id: "mint",
    name: "Mint Green",
    bg: "bg-[#dcfce7]",
    border: "border-[#86efac]",
    text: "text-[#15803d]",
    ring: "ring-[#16a34a]",
    hexBg: "#dcfce7",
    hexBorder: "#86efac",
    hexText: "#15803d",
    hexDot: "#16a34a",
  },
  {
    id: "peach",
    name: "Peach",
    bg: "bg-[#ffedd5]",
    border: "border-[#fdba74]",
    text: "text-[#c2410c]",
    ring: "ring-[#ea580c]",
    hexBg: "#ffedd5",
    hexBorder: "#fdba74",
    hexText: "#c2410c",
    hexDot: "#ea580c",
  },
  {
    id: "rose",
    name: "Rose Pink",
    bg: "bg-[#ffe4e6]",
    border: "border-[#fda4af]",
    text: "text-[#be123c]",
    ring: "ring-[#e11d48]",
    hexBg: "#ffe4e6",
    hexBorder: "#fda4af",
    hexText: "#be123c",
    hexDot: "#e11d48",
  },
  {
    id: "lemon",
    name: "Lemon",
    bg: "bg-[#fef9c3]",
    border: "border-[#fde047]",
    text: "text-[#a16207]",
    ring: "ring-[#ca8a04]",
    hexBg: "#fef9c3",
    hexBorder: "#fde047",
    hexText: "#a16207",
    hexDot: "#ca8a04",
  },
  {
    id: "cream",
    name: "Warm Cream",
    bg: "bg-[#fef3c7]",
    border: "border-[#fcd34d]",
    text: "text-[#92400e]",
    ring: "ring-[#d97706]",
    hexBg: "#fef3c7",
    hexBorder: "#fcd34d",
    hexText: "#92400e",
    hexDot: "#d97706",
  },
  {
    id: "periwinkle",
    name: "Periwinkle",
    bg: "bg-[#e0e7ff]",
    border: "border-[#a5b4fc]",
    text: "text-[#4338ca]",
    ring: "ring-[#4f46e5]",
    hexBg: "#e0e7ff",
    hexBorder: "#a5b4fc",
    hexText: "#4338ca",
    hexDot: "#4f46e5",
  },
  {
    id: "teal",
    name: "Teal",
    bg: "bg-[#ccfbf1]",
    border: "border-[#5eead4]",
    text: "text-[#0f766e]",
    ring: "ring-[#0d9488]",
    hexBg: "#ccfbf1",
    hexBorder: "#5eead4",
    hexText: "#0f766e",
    hexDot: "#0d9488",
  },
  {
    id: "coral",
    name: "Coral Red",
    bg: "bg-[#fee2e2]",
    border: "border-[#fca5a5]",
    text: "text-[#b91c1c]",
    ring: "ring-[#dc2626]",
    hexBg: "#fee2e2",
    hexBorder: "#fca5a5",
    hexText: "#b91c1c",
    hexDot: "#dc2626",
  },
];

export function getColorOption(colorId?: string | null): LightColorOption {
  const found = LIGHT_COLORS.find((c) => c.id === colorId);
  return found || LIGHT_COLORS[0];
}
