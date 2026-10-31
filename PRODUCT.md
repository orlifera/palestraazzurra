# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three audiences, all primary:

- Follonica residents of every age deciding where to train, including people the course list explicitly serves (seniors, pregnancy, post-injury rehab).
- Young lifters looking for a serious weights floor (bodybuilding, functional circuits, athletic prep).
- Personal-training clients, sold through Azzurra Lab, the first personal training studio in Follonica.
- Summer visitors: the gym is 200 m from the sea, hence the English locale.

The job: decide this is the gym, find the hours and address, and get in touch.

## Product Purpose

The website of Palestra Azzurra, a gym in Follonica (GR) run by a 23-year-old owner. It replaces a dated WordPress/Elementor site (palestraazzurra.it) and keeps its content and photography. Success means visitors contact the gym through the form, by phone or by WhatsApp, or simply walk in.

## Positioning

- A long-standing local institution ("un'istituzione del benessere a Follonica", 17 years of experience).
- A credentialed staff (24 degrees and diplomas) that follows every member personally ("non ti sentirai mai solo").
- Azzurra Lab, the town's first personal training studio.
- Located 200 m from the sea.
- Equipment from Technogym, Toorx, Panatta and Sidea.

## Operating Context

- Hours:
  - Monday to Friday 7:30–21:30, open all day
  - Saturday 9:00–17:00
  - Sunday 8:30–12:30
- Address: via G. Rossini 1, 58022 Follonica (GR).
- Contact: palestraazzurra.fit@gmail.com, tel. +39 0566 469433, Instagram @palestraazzurra.

## Capabilities and Constraints

- Stack: Next.js 16 (App Router), React 19, Tailwind v4, shadcn (base-nova, Base UI), React Bits registry, Hugeicons. Conventions are mirrored from the sibling project parkito-web:
  - motion-based animation components
  - a same-origin route handler for forms, with a honeypot and a rate limit
- Contact form: posts to a Next route handler that emails the message to palestraazzurra.fit@gmail.com via Resend (`RESEND_API_KEY`). It must collect GDPR consent for data processing, as the current form does.
- Languages: Italian (default) and English, via next-intl.
- Deploy target: undecided.

## Brand Commitments

- Name: Palestra Azzurra. Sub-brand: Azzurra Lab.
- Existing logos (black and white) are in `public/brand/`.
- Pinned palette, supplied by the user: azure primary oklch(0.6723 0.1606 244.9955), near-black ink oklch(0.1884 0.0128 248.5103), white and black grounds, Open Sans, 1.3rem radius, flat shadows. It has light and dark variants.
- Voice: direct, motivational and Italian ("Il movimento è vita", "Mai arrendersi", "Credi in te stesso"). Keep the existing copy.

## Evidence on Hand

- All copy from the current site's Home, Staff, Azzurra Lab and Contatti pages.
- Counters: 17 years of experience, 24 degrees and diplomas.
- Staff of five, with their credentials:
  - Lorenzo Bonucci
  - Lorenzo Giannoni
  - Ettore Camici
  - Giada Mangani
  - Marco Giannoni
- Real gym photography (DSF43xx series, slide1, studio, reception), staff portraits and equipment-brand logos. All sourced from palestraazzurra.it and stored in `public/images/`.
- No testimonials, prices or membership plans exist. Do not invent them.

## Product Principles

1. Real people, real floor: show the actual staff and the actual gym. No stock fantasy.
2. Everyone belongs: serious lifting energy that never excludes seniors, pregnancy or rehab members.
3. Contact is one step away: hours, phone, WhatsApp and the form are always reachable.
4. Keep the gym's own words; redesign the stage, not the script.

## Accessibility & Inclusion

The audience includes older adults, so text must be legible and contrast generous, and the site must respect reduced motion.
