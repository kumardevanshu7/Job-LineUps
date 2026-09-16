export interface LightColorOption {
  id: string;
  name: string;
  bg: string;
  border: string;
  text: string;
  ring: string;
  hexBg: string;
  hexText: string;
}

export const ALPHABETS = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
  "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
  "U", "V", "W", "X", "Y", "Z"
];

export const LIGHT_COLORS: LightColorOption[] = [
  {
    id: "lavender",
    name: "Light Lavender",
    bg: "bg-[#ede9fe]",
    border: "border-[#ddd6fe]",
    text: "text-[#6d28d9]",
    ring: "ring-[#6d28d9]",
    hexBg: "#ede9fe",
    hexText: "#6d28d9",
  },
  {
    id: "sky",
    name: "Light Sky",
    bg: "bg-[#e0f2fe]",
    border: "border-[#bae6fd]",
    text: "text-[#0284c7]",
    ring: "ring-[#0284c7]",
    hexBg: "#e0f2fe",
    hexText: "#0284c7",
  },
  {
    id: "mint",
    name: "Light Mint",
    bg: "bg-[#dcfce7]",
    border: "border-[#bbf7d0]",
    text: "text-[#15803d]",
    ring: "ring-[#15803d]",
    hexBg: "#dcfce7",
    hexText: "#15803d",
  },
  {
    id: "peach",
    name: "Light Peach",
    bg: "bg-[#ffedd5]",
    border: "border-[#fed7aa]",
    text: "text-[#c2410c]",
    ring: "ring-[#c2410c]",
    hexBg: "#ffedd5",
    hexText: "#c2410c",
  },
  {
    id: "rose",
    name: "Light Rose",
    bg: "bg-[#ffe4e6]",
    border: "border-[#fecdd3]",
    text: "text-[#be123c]",
    ring: "ring-[#be123c]",
    hexBg: "#ffe4e6",
    hexText: "#be123c",
  },
  {
    id: "lemon",
    name: "Light Lemon",
    bg: "bg-[#fef9c3]",
    border: "border-[#fef08a]",
    text: "text-[#a16207]",
    ring: "ring-[#a16207]",
    hexBg: "#fef9c3",
    hexText: "#a16207",
  },
  {
    id: "cream",
    name: "Light Cream",
    bg: "bg-[#f5e9d4]",
    border: "border-[#eedfbe]",
    text: "text-[#854d0e]",
    ring: "ring-[#854d0e]",
    hexBg: "#f5e9d4",
    hexText: "#854d0e",
  },
  {
    id: "periwinkle",
    name: "Light Periwinkle",
    bg: "bg-[#e0e7ff]",
    border: "border-[#c7d2fe]",
    text: "text-[#4338ca]",
    ring: "ring-[#4338ca]",
    hexBg: "#e0e7ff",
    hexText: "#4338ca",
  },
  {
    id: "teal",
    name: "Light Teal",
    bg: "bg-[#ccfbf1]",
    border: "border-[#99f6e4]",
    text: "text-[#0f766e]",
    ring: "ring-[#0f766e]",
    hexBg: "#ccfbf1",
    hexText: "#0f766e",
  },
  {
    id: "coral",
    name: "Light Coral",
    bg: "bg-[#fee2e2]",
    border: "border-[#fecaca]",
    text: "text-[#b91c1c]",
    ring: "ring-[#b91c1c]",
    hexBg: "#fee2e2",
    hexText: "#b91c1c",
  },
];

export function getColorOption(colorId?: string | null): LightColorOption {
  const found = LIGHT_COLORS.find((c) => c.id === colorId);
  return found || LIGHT_COLORS[0];
}
