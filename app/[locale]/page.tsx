import { setRequestLocale } from "next-intl/server"

import { PlanBackdrop } from "@/components/motion/plan-backdrop"
import { About } from "@/components/site/about"
import { Contact } from "@/components/site/contact"
import { Courses } from "@/components/site/courses"
import { Footer } from "@/components/site/footer"
import { Header } from "@/components/site/header"
import { Hero } from "@/components/site/hero"
import { Lab } from "@/components/site/lab"
import { Motto } from "@/components/site/motto"
import { Staff } from "@/components/site/staff"
import { Visit } from "@/components/site/visit"

export default async function Page({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <>
      <PlanBackdrop />
      <Header />
      <main id="main" className="overflow-x-clip">
        <Hero />
        <About />
        <Motto />
        <Courses />
        <Lab />
        <Staff />
        <Visit />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
