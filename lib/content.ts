import { z } from "zod"

import contactJson from "@/content/contact.json"
import exercisesJson from "@/content/exercises.json"
import hoursJson from "@/content/hours.json"
import staffJson from "@/content/staff.json"
import statsJson from "@/content/stats.json"
import tourJson from "@/content/tour.json"
import workoutJson from "@/content/workout.json"

/**
 * The content the staff edit from /admin, as JSON under content/, and the
 * shape each file must keep. The site parses every file at build time, and
 * the editor checks an edit against the same schema before it commits it,
 * so a slip in the editor can't take the site down.
 */

/** The course ids, in the order of the scheda. Their names live in the messages. */
export const COURSES = [
  "pt",
  "weight",
  "pregnancy",
  "rehab",
  "anamnesis",
  "bodybuilding",
  "posture",
  "seniors",
] as const

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Ora nel formato HH:MM, es. 07:30")
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data nel formato AAAA-MM-GG, es. 2026-12-25")
const both = z.object({ it: z.string(), en: z.string() })
const filled = z.object({ it: z.string().min(1, "Scrivi il testo in italiano"), en: z.string().min(1, "Scrivi il testo in inglese") })
const path = z.string().regex(/^(|\/[\w./-]+)$/, "Percorso di un'immagine del sito, es. /images/gym/bench.webp")
const url = z.union([z.literal(""), z.url("Indirizzo web completo, es. https://...")])

const day = z
  .object({ closed: z.boolean(), open: time, close: time })
  .refine((d) => d.closed || d.open < d.close, "L'apertura deve venire prima della chiusura")

export const schemas = {
  hours: z.object({
    weekly: z.object({
      monday: day,
      tuesday: day,
      wednesday: day,
      thursday: day,
      friday: day,
      saturday: day,
      sunday: day,
    }),
    closures: z.array(
      z
        .object({ from: date, to: z.union([z.literal(""), date]).optional(), note: both.optional() })
        .refine((c) => !c.to || c.to >= c.from, "La fine non può venire prima dell'inizio")
    ),
  }),
  contact: z.object({
    email: z.email("Indirizzo email valido"),
    phone: z.string().regex(/^\+?[\d ]{6,20}$/, "Numero di telefono, es. +39 0566 469433"),
    instagram: url,
    facebook: url,
    maps: url,
  }),
  stats: z.object({
    years: z.number().int().min(0).max(200),
    degrees: z.number().int().min(0).max(500),
  }),
  staff: z.array(
    z.object({
      id: z.string().regex(/^[a-z0-9-]+$/, "Solo lettere minuscole, numeri e trattini"),
      name: z.string().min(2),
      photo: path,
      instagram: url,
      courses: z.array(z.enum(COURSES)),
    })
  ),
  tour: z.object({
    photos: z.object({
      entrance: path,
      weights: path,
      dumbbells: path,
      classes: path,
      lab: path,
      sea: path,
    }),
  }),
  workout: z.object({
    published: z.boolean(),
    week: z.union([z.literal(""), date]),
    title: filled,
    notes: both,
    exercises: z.array(
      z.object({
        name: filled,
        sets: z.number().int().min(1).max(20),
        reps: z.string().min(1).max(20),
        rest: z.number().int().min(0).max(600),
      })
    ),
  }),
  exercises: z.object({
    groups: z.array(
      z.object({
        id: z.string().regex(/^[a-z0-9-]+$/),
        name: filled,
        exercises: z.array(z.object({ name: filled, how: filled, photo: path })),
      })
    ),
  }),
} as const

export type ContentFile = keyof typeof schemas

export const hours = schemas.hours.parse(hoursJson)
export const contactInfo = schemas.contact.parse(contactJson)
export const stats = schemas.stats.parse(statsJson)
export const staff = schemas.staff.parse(staffJson)
export const tour = schemas.tour.parse(tourJson)
export const workout = schemas.workout.parse(workoutJson)
export const exercises = schemas.exercises.parse(exercisesJson)
