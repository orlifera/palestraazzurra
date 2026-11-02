/** Italian labels for the keys the staff see in the editor. Safe for client components. */

const LABELS: Record<string, string> = {
  // hours
  weekly: "Orario settimanale",
  monday: "Lunedì",
  tuesday: "Martedì",
  wednesday: "Mercoledì",
  thursday: "Giovedì",
  friday: "Venerdì",
  saturday: "Sabato",
  sunday: "Domenica",
  open: "Apertura",
  close: "Chiusura",
  closed: "Chiuso tutto il giorno",
  closures: "Chiusure straordinarie",
  from: "Dal",
  to: "Al",
  note: "Nota",
  // contact
  email: "Email",
  phone: "Telefono",
  instagram: "Instagram (link)",
  facebook: "Facebook (link)",
  maps: "Google Maps (link)",
  // stats
  years: "Anni di attività",
  degrees: "Titoli e certificazioni dello staff",
  // staff
  id: "Codice (solo minuscole, numeri e trattini)",
  name: "Nome",
  photo: "Foto",
  courses: "Corsi",
  // tour
  photos: "Foto",
  entrance: "Ingresso",
  weights: "Sala pesi",
  dumbbells: "Manubri",
  classes: "Sala corsi",
  lab: "Azzurra Lab",
  sea: "Il mare",
  // workout
  published: "Pubblicato",
  week: "Settimana",
  title: "Titolo",
  notes: "Note",
  exercises: "Esercizi",
  sets: "Serie",
  reps: "Ripetizioni",
  rest: "Recupero (secondi)",
  // exercises
  groups: "Gruppi muscolari",
  how: "Come si esegue",
  // common
  description: "Descrizione",
  body: "Testo",
  text: "Testo",
  label: "Etichetta",
  items: "Voci",
  cta: "Pulsante",
  subtitle: "Sottotitolo",
  eyebrow: "Occhiello",
  heading: "Titolo",
}

/** What one item of a list is called, for "Aggiungi …" buttons and item headings. */
const ITEM_NAMES: Record<string, string> = {
  closures: "chiusura",
  exercises: "esercizio",
  groups: "gruppo",
  staff: "persona",
}

export function humanise(key: string) {
  const spaced = key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z0-9])/g, "$1 $2")
    .toLowerCase()
    .trim()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

export function labelFor(key: string, { messages = false } = {}) {
  // In the message files keys are code names, not concepts: humanise only.
  if (messages) return humanise(key)
  return LABELS[key] ?? humanise(key)
}

export function itemName(key: string) {
  return ITEM_NAMES[key] ?? "elemento"
}

export const LONG_TEXT_KEYS = new Set(["how", "notes", "body", "description", "text"])
