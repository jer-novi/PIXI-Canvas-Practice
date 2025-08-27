// Mock data voor en gedicht
// src/data/testdata.js
export const poems = [
  {
    id: 123,
    title: "De Sterrenhemel",
    author: "H. Marsman",
    lines: [
      "De zee, de zee, de zee,",
      "altijd de zee.",
      "Zij is de spiegel van mijn ziel,",
      "de bron van mijn bestaan.",
    ],
  },
  // eventueel meer gedichten
];

export function getPoemById(id) {
  return poems.find((p) => String(p.id) === String(id)) || null;
}
