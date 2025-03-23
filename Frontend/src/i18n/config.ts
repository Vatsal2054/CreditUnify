export type Locale = (typeof locales)[number];

export const locales = ["en"] as const;

export const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी" },
  { code: "gu", name: "ગુજરાતી" },
//   { code: "ma", name: "मराठी" },
//   { code: "bn", name: "বাংলা" },
//   { code: "te", name: "తెలుగు" },
];


export const defaultLocale:Locale = "en";