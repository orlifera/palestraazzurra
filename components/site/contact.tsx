"use client"

import {
  Call02Icon,
  Location01Icon,
  Mail01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AnimatePresence, motion } from "motion/react"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { ToolLauncher } from "@/components/site/locker"
import { Reveal } from "@/components/motion/reveal"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { contact } from "@/data/site"
import { contactSchema, type ContactField } from "@/lib/contact-schema"
import { cn } from "@/lib/utils"

type Values = {
  name: string
  email: string
  subject: string
  message: string
  consent: boolean
  website: string
}
const EMPTY: Values = {
  name: "",
  email: "",
  subject: "",
  message: "",
  consent: false,
  website: "",
}
const ORDER: ContactField[] = ["name", "email", "subject", "message", "consent"]

const inputCls =
  "h-12 rounded-xl border-2 border-sheet-line bg-background px-4 text-base md:text-base focus-visible:border-primary focus-visible:ring-primary/25"

const ASK = "contact:ask"

type Ask = { subject: string; message?: string }

/** Fills in the form from elsewhere on the page: a course's "Ask about it", the scheda builder. */
export function askAbout(subject: string, message?: string) {
  window.dispatchEvent(
    new CustomEvent<Ask>(ASK, { detail: { subject, message } })
  )
}

export function Contact() {
  const t = useTranslations("contact")
  const l = useTranslations("locker")
  const locale = useLocale()
  const [values, setValues] = useState<Values>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>(
    {}
  )
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle")
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const onAsk = (e: Event) => {
      const { subject, message } = (e as CustomEvent<Ask>).detail
      setValues((v) => ({ ...v, subject, message: message ?? v.message }))
      setErrors((e) => ({
        ...e,
        subject: undefined,
        message: message ? undefined : e.message,
      }))
      setStatus("idle")
    }
    window.addEventListener(ASK, onAsk)
    return () => window.removeEventListener(ASK, onAsk)
  }, [])

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    if (errors[key as ContactField])
      setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const focusFirst = (errs: Partial<Record<ContactField, string>>) => {
    const first = ORDER.find((f) => errs[f])
    if (first)
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = contactSchema.safeParse({ ...values, locale })
    if (!parsed.success) {
      const errs = Object.fromEntries(
        parsed.error.issues.map((i) => [String(i.path[0]), i.message])
      )
      setErrors(errs)
      focusFirst(errs)
      return
    }

    setStatus("sending")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, locale }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        error?: string
        fields?: Record<string, string>
      }
      if (res.ok && data.ok) {
        setStatus("sent")
        setValues(EMPTY)
        return
      }
      if (data.fields) {
        setErrors(data.fields)
        focusFirst(data.fields)
      } else {
        toast.error(t(data.error === "rate" ? "errors.rate" : "errors.server"))
      }
    } catch {
      toast.error(t("errors.server"))
    }
    setStatus("idle")
  }

  const err = (f: ContactField) =>
    errors[f] ? t(`errors.${errors[f]}` as "errors.name") : undefined

  return (
    <section
      id="contatti"
      aria-labelledby="contatti-title"
      className="mx-auto max-w-[90rem] px-4 py-16 sm:px-6 sm:py-24 lg:px-10 lg:py-36"
    >
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
        <Reveal className="lg:col-span-5">
          <h2
            id="contatti-title"
            className="font-display text-[clamp(2.5rem,6.2vw,6.25rem)] break-words"
          >
            {t("title")}
          </h2>
          <p className="mt-6 font-stamp text-xl text-balance text-primary sm:text-2xl">
            {t("intro")}
          </p>

          <dl className="mt-12 space-y-6">
            <Line icon={Location01Icon} label={t("addressLabel")}>
              <a
                href={contact.maps}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                via G. Rossini 1 - 58022 Follonica (GR)
              </a>
            </Line>
            <Line icon={Mail01Icon} label={t("emailLabel")}>
              <a
                href={`mailto:${contact.email}`}
                className="break-all hover:text-primary"
              >
                {contact.email}
              </a>
            </Line>
            <Line icon={Call02Icon} label={t("phoneLabel")}>
              <a
                href={contact.phoneHref}
                className="tabular hover:text-primary"
              >
                {contact.phone}
              </a>
            </Line>
          </dl>
          <ToolLauncher
            id="builder"
            lead={l("items.builder")}
            action={l("fill")}
            className="mt-12"
          />
        </Reveal>

        <Reveal className="lg:col-span-7" delay={0.06}>
          <div className="relative overflow-hidden rounded-[var(--radius)] border-2 border-foreground bg-card">
            <div className="flex flex-wrap items-baseline justify-between gap-2 bg-foreground px-5 py-3 text-background sm:px-7">
              <span className="font-stamp text-lg">
                Scheda
                <span className="ml-2 font-semibold tracking-normal normal-case opacity-80">
                  {values.name.trim() ? `· ${values.name.trim()}` : ""}
                </span>
              </span>
              <span className="font-stamp text-xs opacity-80">
                Palestra Azzurra
              </span>
            </div>

            <form
              ref={formRef}
              noValidate
              onSubmit={onSubmit}
              className="grid gap-6 p-5 sm:grid-cols-2 sm:p-7"
              aria-busy={status === "sending"}
            >
              <Field data-invalid={!!errors.name || undefined}>
                <FieldLabel htmlFor="c-name" className="font-stamp text-sm">
                  {t("name")} <Req label={t("required")} />
                </FieldLabel>
                <Input
                  id="c-name"
                  name="name"
                  autoComplete="name"
                  value={values.name}
                  onChange={(e) => set("name", e.target.value)}
                  aria-invalid={!!errors.name || undefined}
                  aria-describedby={errors.name ? "c-name-err" : undefined}
                  className={inputCls}
                />
                <FieldError id="c-name-err">{err("name")}</FieldError>
              </Field>

              <Field data-invalid={!!errors.email || undefined}>
                <FieldLabel htmlFor="c-email" className="font-stamp text-sm">
                  {t("email")} <Req label={t("required")} />
                </FieldLabel>
                <Input
                  id="c-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(e) => set("email", e.target.value)}
                  aria-invalid={!!errors.email || undefined}
                  aria-describedby={errors.email ? "c-email-err" : undefined}
                  className={inputCls}
                />
                <FieldError id="c-email-err">{err("email")}</FieldError>
              </Field>

              <Field
                data-invalid={!!errors.subject || undefined}
                className="sm:col-span-2"
              >
                <FieldLabel htmlFor="c-subject" className="font-stamp text-sm">
                  {t("subject")} <Req label={t("required")} />
                </FieldLabel>
                <Input
                  id="c-subject"
                  name="subject"
                  value={values.subject}
                  onChange={(e) => set("subject", e.target.value)}
                  aria-invalid={!!errors.subject || undefined}
                  aria-describedby={
                    errors.subject ? "c-subject-err" : undefined
                  }
                  className={inputCls}
                />
                <FieldError id="c-subject-err">{err("subject")}</FieldError>
              </Field>

              <Field
                data-invalid={!!errors.message || undefined}
                className="sm:col-span-2"
              >
                <FieldLabel htmlFor="c-message" className="font-stamp text-sm">
                  {t("message")} <Req label={t("required")} />
                </FieldLabel>
                <Textarea
                  id="c-message"
                  name="message"
                  rows={6}
                  value={values.message}
                  onChange={(e) => set("message", e.target.value)}
                  aria-invalid={!!errors.message || undefined}
                  aria-describedby={
                    errors.message ? "c-message-err" : undefined
                  }
                  className={cn(
                    inputCls,
                    "h-auto min-h-40 py-3 leading-relaxed"
                  )}
                />
                <FieldError id="c-message-err">{err("message")}</FieldError>
              </Field>

              {/* Honeypot */}
              <div
                aria-hidden
                className="absolute -left-[9999px] h-px w-px overflow-hidden"
              >
                <label htmlFor="c-website">Website</label>
                <input
                  id="c-website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={values.website}
                  onChange={(e) => set("website", e.target.value)}
                />
              </div>

              <fieldset
                className="rounded-xl border-2 border-sheet-line p-4 sm:col-span-2"
                data-invalid={!!errors.consent || undefined}
              >
                <legend className="px-1 font-stamp text-sm">
                  {t("consentTitle")} <Req label={t("required")} />
                </legend>
                <Field orientation="horizontal" className="items-start gap-3">
                  <Checkbox
                    id="c-consent"
                    name="consent"
                    checked={values.consent}
                    onCheckedChange={(v) => set("consent", v === true)}
                    aria-invalid={!!errors.consent || undefined}
                    aria-describedby="c-consent-text"
                    className="mt-0.5 size-5 border-2 border-foreground/50 bg-background"
                  />
                  <div>
                    <FieldLabel
                      htmlFor="c-consent"
                      className="font-stamp text-sm"
                    >
                      {t("consentLabel")}
                    </FieldLabel>
                    <FieldDescription
                      id="c-consent-text"
                      className="mt-1 text-xs leading-relaxed text-foreground/75"
                    >
                      {t("consentText")}
                    </FieldDescription>
                  </div>
                </Field>
                <FieldError className="mt-2">{err("consent")}</FieldError>
              </fieldset>

              <div className="sm:col-span-2">
                <Button
                  type="submit"
                  disabled={status === "sending"}
                  className="h-14 w-full rounded-full font-stamp text-base tracking-[0.08em]"
                >
                  {status === "sending" ? t("sending") : t("submit")}
                </Button>
              </div>
            </form>

            <AnimatePresence>
              {status === "sent" ? (
                <motion.div
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 bg-card/95 p-8 text-center backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  role="status"
                >
                  <motion.div
                    className="flex size-36 items-center justify-center rounded-full border-[6px] border-primary text-primary"
                    initial={{ scale: 1.1, rotate: -6, opacity: 0 }}
                    animate={{ scale: 1, rotate: -6, opacity: 1 }}
                    transition={{
                      duration: 0.35,
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.1,
                    }}
                  >
                    <HugeiconsIcon
                      icon={Tick02Icon}
                      strokeWidth={3}
                      className="size-16"
                    />
                  </motion.div>
                  <p className="font-display text-5xl">{t("sentTitle")}</p>
                  <p className="max-w-sm text-lg">{t("sentBody")}</p>
                  <Button
                    variant="outline"
                    className="h-11 rounded-full px-5"
                    onClick={() => setStatus("idle")}
                  >
                    {t("again")}
                  </Button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Req({ label }: { label: string }) {
  return (
    <span className="text-primary" aria-hidden title={label}>
      *
    </span>
  )
}

function Line({
  icon,
  label,
  children,
}: {
  icon: typeof Call02Icon
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-4">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <HugeiconsIcon icon={icon} className="size-5" />
      </span>
      <div>
        <dt className="font-stamp text-sm text-foreground/70">{label}</dt>
        <dd className="mt-0.5 text-lg font-semibold">{children}</dd>
      </div>
    </div>
  )
}
