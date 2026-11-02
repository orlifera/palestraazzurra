/**
 * The files the staff may edit from /admin. This module is safe to import from
 * client components: it holds only names and paths, never file contents.
 */

export type ContentKey = "hours" | "contact" | "stats" | "staff" | "tour" | "workout" | "exercises"

export type EditableFile =
  | { id: ContentKey; path: `content/${ContentKey}.json`; title: string; description: string; kind: "content" }
  | { id: "messages-it" | "messages-en"; path: `messages/${"it" | "en"}.json`; title: string; description: string; kind: "messages" }

export const FILES: readonly EditableFile[] = [
  { id: "hours", path: "content/hours.json", kind: "content", title: "Orari e chiusure", description: "Orario settimanale e giorni di chiusura straordinaria." },
  { id: "contact", path: "content/contact.json", kind: "content", title: "Contatti", description: "Email, telefono, social e link a Google Maps." },
  { id: "stats", path: "content/stats.json", kind: "content", title: "Numeri della palestra", description: "Anni di attività e titoli dello staff." },
  { id: "staff", path: "content/staff.json", kind: "content", title: "Staff", description: "Istruttori, foto, Instagram e corsi che seguono." },
  { id: "tour", path: "content/tour.json", kind: "content", title: "Foto del tour", description: "Le foto delle sale nel tour della palestra." },
  { id: "workout", path: "content/workout.json", kind: "content", title: "Allenamento della settimana", description: "La scheda della settimana e se è pubblicata." },
  { id: "exercises", path: "content/exercises.json", kind: "content", title: "Guida agli esercizi", description: "Gruppi muscolari, esercizi, spiegazioni e foto." },
  { id: "messages-it", path: "messages/it.json", kind: "messages", title: "Testi del sito (italiano)", description: "Tutti i testi del sito in italiano." },
  { id: "messages-en", path: "messages/en.json", kind: "messages", title: "Testi del sito (inglese)", description: "Tutti i testi del sito in inglese." },
] as const

export function findFile(id: string) {
  return FILES.find((f) => f.id === id)
}

/** The only paths the server will ever read or write as editable JSON. */
export const ALLOWED_PATHS: ReadonlySet<string> = new Set(FILES.map((f) => f.path))
