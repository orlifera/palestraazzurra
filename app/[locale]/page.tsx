import { getTranslations, setRequestLocale } from "next-intl/server"

import { PlanBackdrop } from "@/components/motion/plan-backdrop"
import { LangPrompt, ServiceWorker } from "@/components/site/app-extras"
import { About } from "@/components/site/about"
import { Contact } from "@/components/site/contact"
import { Courses } from "@/components/site/courses"
import { Footer } from "@/components/site/footer"
import { Header } from "@/components/site/header"
import { Hero } from "@/components/site/hero"
import { Lab } from "@/components/site/lab"
import { Locker, LockerProvider } from "@/components/site/locker"
import { Motto } from "@/components/site/motto"
import { Staff } from "@/components/site/staff"
import { WeeklyWorkout } from "@/components/site/workout"
import { Visit } from "@/components/site/visit"
import { gymJsonLd } from "@/lib/json-ld"

export default async function Page({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: "meta" })
  const jsonLd = gymJsonLd(locale, t("description"))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PlanBackdrop />
      <LockerProvider>
        <Header />
        <main id="main" className="overflow-x-clip">
          <Hero />
          <About />
          <Motto />
          <Courses />
          <Lab />
          <Staff />
          <WeeklyWorkout />
          <Locker />
          <Visit />
          <Contact />
        </main>
        <Footer />
      </LockerProvider>
      <LangPrompt />
      <ServiceWorker />
    </>
  )
}
