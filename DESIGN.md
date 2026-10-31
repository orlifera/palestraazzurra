---
name: Palestra Azzurra
description: A lifting platform with the member's scheda clipped to it; white ground, rubber-black bands, azure bumper plates.
colors:
  azure-plate: "oklch(0.6723 0.1606 244.9955)"
  platform-ink: "oklch(0.1884 0.0128 248.5103)"
  ground-white: "oklch(1 0 0)"
  chalk-card: "oklch(0.9784 0.0011 197.1387)"
  chalk-muted: "oklch(0.9222 0.0013 286.3737)"
  azure-wash: "oklch(0.9392 0.0166 250.8453)"
  hairline: "oklch(0.9317 0.0118 231.6594)"
  sheet-line: "oklch(0.8 0.03 244.99)"
  platform-muted: "oklch(0.78 0.012 248.5)"
  platform-line: "oklch(0.3 0.014 248.5)"
  steel: "oklch(0.72 0.006 248.5)"
  steel-dark: "oklch(0.48 0.008 248.5)"
  focus-ring: "oklch(0.6818 0.1584 243.354)"
  destructive: "oklch(0.6188 0.2376 25.7658)"
typography:
  display:
    fontFamily: "Open Sans, sans-serif"
    fontSize: "clamp(4.6rem, min(12vw, 15svh), 12rem)"
    fontWeight: 800
    lineHeight: 0.88
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 75"
  headline:
    fontFamily: "Open Sans, sans-serif"
    fontSize: "clamp(4rem, 9vw, 8.5rem)"
    fontWeight: 800
    lineHeight: 0.88
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 75"
  title:
    fontFamily: "Open Sans, sans-serif"
    fontSize: "clamp(2.4rem, 4.6vw, 4rem)"
    fontWeight: 800
    lineHeight: 0.88
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 75"
  stamp:
    fontFamily: "Open Sans, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.33
    letterSpacing: "0.06em"
    fontVariation: "'wdth' 75"
  body:
    fontFamily: "Open Sans, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Open Sans, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.43
    letterSpacing: "0.06em"
    fontVariation: "'wdth' 75"
rounded:
  sm: "calc(1.3rem - 4px)"
  md: "calc(1.3rem - 2px)"
  lg: "1.3rem"
  xl: "calc(1.3rem + 4px)"
  platform: "2.6rem"
  full: "9999px"
spacing:
  unit: "0.25rem"
  gutter-mobile: "1rem"
  gutter-tablet: "1.5rem"
  gutter-desktop: "2.5rem"
  grid-gap: "2.5rem"
  section-mobile: "6rem"
  section-desktop: "9rem"
  container: "90rem"
components:
  button-primary:
    backgroundColor: "{colors.azure-plate}"
    textColor: "{colors.ground-white}"
    rounded: "{rounded.full}"
    padding: "0 28px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.azure-plate}"
  button-outline:
    backgroundColor: "{colors.ground-white}"
    textColor: "{colors.platform-ink}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "52px"
  button-outline-hover:
    backgroundColor: "{colors.chalk-muted}"
  nav-link:
    textColor: "{colors.platform-ink}"
    rounded: "{rounded.full}"
    padding: "8px 12px"
  nav-link-hover:
    backgroundColor: "{colors.azure-wash}"
    textColor: "{colors.azure-plate}"
  header-bar:
    backgroundColor: "{colors.ground-white}"
    rounded: "{rounded.lg}"
    height: "56px"
  input:
    backgroundColor: "{colors.ground-white}"
    textColor: "{colors.platform-ink}"
    rounded: "{rounded.xl}"
    padding: "0 16px"
    height: "48px"
  scheda-header:
    backgroundColor: "{colors.platform-ink}"
    textColor: "{colors.ground-white}"
    typography: "{typography.label}"
    padding: "12px 28px"
  role-chip:
    textColor: "{colors.azure-plate}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  platform-band:
    backgroundColor: "{colors.platform-ink}"
    textColor: "{colors.ground-white}"
    rounded: "{rounded.platform}"
---

# Design System: Palestra Azzurra

## Overview

**Creative North Star: "The Loaded Platform"**

The page is a lifting platform with the member's training card (the scheda) clipped to it. White is the gym floor under strip light; near-black is the rubber platform, laid down as full-bleed rounded bands; azure is the bumper-plate colour and the stamp ink. Every recurring device is a piece of the weight room drawn literally: a knurled steel bar, plates as slabs with the system radius, programme rows ruled on hairlines and ticked with a rubber stamp.

Density is low and heavy. Sections stack as blocks with deep gaps (6rem, 9rem on desktop), headlines are condensed stamped caps at very large sizes, and lists are rows on a sheet rather than tiles. Rank is shown by scale: the two numbers the gym owns (17 years, 24 degrees) are stamped huge on rolling plate faces, never set in a stat band. State is shown by a mark, not a hue change: a stamped tick means done, a folded azure tab means "you are here".

Motion is reserved for authored moments that belong to the world: plates slamming onto the hero bar and the press, the header rail loading one plate per section with a running kg tally, plate faces rolling with scroll, the balance bar settling level, stamps landing on scheda rows. Section content otherwise renders static and visible; there is no generic fade-up entrance. Under reduced motion everything is shown in its end state.

**Key Characteristics:**
- Pinned tweakcn palette: azure primary, near-black ink, white and black grounds, flat shadows, 1.3rem radius.
- Condensed (wdth 75) Open Sans in caps as the only display voice; Open Sans regular for reading.
- Rubber-black platform bands with fine grain alternate with white ground.
- Rows on hairline grids instead of card grids.
- Physical, spring-driven motion only where a weight-room object moves.

## Colors

One loud accent on a black-and-white floor: azure does the work of plates, stamps and calls to action; everything readable is ink or white.

### Primary
- **Bumper Azure** (azure-plate, about #1e9df1): primary buttons, the 20/25 kg plates, the large plate face, stamp ticks, the scheda flag, role chips, the "today" tag, focus and selection, the scrollbar thumb. On the rubber platform it is also a text colour (6.3:1 against platform ink). Against white it measures 2.9:1, so on white grounds it is a fill and mark colour, not a reading colour.

### Neutral
- **Platform Ink** (platform-ink, about #0f1419): all body text and display type on white; the fill of every platform band (hero equipment strip, method, Azzurra Lab, hours, footer, mobile menu); the printed header of the scheda; the 15 kg plate.
- **Ground White** (ground-white): the page ground and text on platform bands.
- **Chalk Card** (chalk-card) and **Chalk Muted** (chalk-muted): the contact scheda body and image placeholders; outline-button hover.
- **Azure Wash** (azure-wash): hover fill for nav links and linked scheda rows.
- **Hairline** (hairline): default component borders.
- **Sheet Line** (sheet-line): the ruled lines of a scheda (course rows, roster rows) and input strokes. A faint azure-grey, like the printed grid on a training card.
- **Platform Muted** (platform-muted) and **Platform Line** (platform-line): secondary text and rules on rubber bands.
- **Steel** (steel) and **Steel Dark** (steel-dark): the bar, knurl hatching, 5/10 kg plates, plate insert rings, the closed-state status dot.
- **Focus Ring** (focus-ring): the 2px focus outline, offset 3px.

Dark mode inverts the ground to black, lifts ink to a pale grey, and moves the platform to a cool charcoal (oklch(0.2097 0.008 274.5332)) so bands still read as rubber on the black floor. Steel and sheet-line darken with it.

### Named Rules
**The Plate Colour Rule.** Azure is reserved for things that would be azure in the gym: plates, stamp ink, the call to action, the current marker. It is never a section background.

**The Ink Reads Rule.** Text meant to be read on a white ground sits in platform ink. Azure text is legible only on the rubber platform.

## Typography

**Display Font:** Open Sans variable at wdth 75, weight 800, uppercase (with sans-serif)
**Body Font:** Open Sans regular (with sans-serif)
**Label Font:** Open Sans at wdth 75, weight 700, uppercase, tracked 0.06em (the "stamp" voice)

**Character:** One family pulled two ways. Condensed heavy caps read as lettering moulded into a bumper plate; the regular cut at reading sizes stays plain and generous for an audience that includes older adults.

### Hierarchy
- **Display** (800, clamp(4.6rem, min(12vw, 15svh), 12rem), 0.88): the hero name only. The barbell sits inside the heading between the two words.
- **Headline** (800, clamp(4rem, 9vw, 8.5rem), 0.88): section titles (Corsi, Staff, Orari). Narrower sections step down the same clamp shape (Contatti clamp(3.4rem, 6.2vw, 6.25rem); Chi siamo clamp(2.8rem, 6.4vw, 6rem)). The footer tagline and scroll-velocity marquees run at the same voice up to 12rem.
- **Title** (800, clamp(2.4rem, 4.6vw, 4rem), 0.88): coach names, course rows (clamp(1.6rem, 3.4vw, 2.75rem), line-height 1), "Dove siamo".
- **Stamp** (700, 1.25rem to 1.5rem, tracked 0.06em, caps): the motto under the hero and the one-line lead under a section title.
- **Body** (400, 1.125rem, 1.625): running text, capped at 48 to 62ch. Lead paragraphs step to 1.25 to 1.5rem semibold.
- **Label** (700, 0.75rem to 0.875rem, tracked 0.06em, caps): field labels, scheda column heads, chips, footer column heads, the kg tally.

Numbers that matter (hours, phone, row numbers, the kg tally, plate counters) use tabular numerals.

### Named Rules
**The Stamped Caps Rule.** Every heading is condensed 800 caps at line-height 0.88. There is no second display face and no sentence-case heading.

**The Scale Is Rank Rule.** Importance is expressed by size, not by boxes: the gym's numbers are stamped on plates at clamp(3.5rem, 9vw, 7.5rem), hours are set as display numerals at clamp(3rem, 7vw, 6rem).

## Layout

A centred container of 90rem with side gutters of 1rem, 1.5rem from 640px and 2.5rem from 1024px. Sections use a 12-column grid with a 2.5rem gap on desktop, almost always split asymmetrically (4/8, 5/7, 6/5 with an empty column, 7/4). Vertical rhythm is deliberately heavy: 6rem section padding on phones, 9rem on desktop.

Platform bands break the container: they run full-bleed, with a 2.6rem top radius where they rise out of the page (method, footer) and fully rounded with a 0.75rem side inset on desktop where they float as slabs (Azzurra Lab, hours). Their content returns to the 90rem container.

The hero fills the first viewport on desktop (100svh, minimum 44rem) as a 1.4fr/1fr split of headline and tall photo, closed by the rubber equipment strip. On phones it stacks: headline, actions, photo, then the strip.

The header floats 12px from the top as a 56px bar inside the container, with a translucent white fill and backdrop blur; anchors scroll with a 5.5rem offset to clear it.

## Elevation & Depth

Flat. Every shadow token in the pinned theme resolves to zero opacity, and nothing in the build adds one. Depth comes from material: the rubber grain on platform bands (a 5px radial dot grid at 4.5% white), the knurl cross-hatch on steel, overlapping plate faces, and the translucent blurred header over the page.

### Named Rules
**The Flat Floor Rule.** No box shadows. Separation is a change of material (white ground, rubber band, steel) or a 2px ink rule, never a drop shadow.

## Shapes

One radius governs the slabs: 1.3rem on photos, the header bar, the scheda cards and the side-view plates, so every block reads as a plate. Platform bands double it (2.6rem). Interactive controls are full pills: buttons, nav links, chips, the "Lab" tag, icon buttons. Inputs and the consent box sit between at the xl step (1.3rem plus 4px).

Lines are ruled, not boxed: scheda cards and the staff roster open with a 2px ink rule and divide rows with 1px sheet-line hairlines. Platform bands rule with platform-line. The bar is a fully rounded 0.75rem knurled strip.

## Components

### Buttons
Heavy, rounded and short of words.
- **Shape:** full pill.
- **Primary:** azure fill, white label in bold 1rem, 52px tall with 28px side padding in the hero; 40px tall in the header; 56px full-width with stamp caps on the form submit.
- **Hover / Focus:** fill drops to 80 to 85% azure; focus is a 2px ring outline offset 3px; press nudges down 1px.
- **Outline:** white fill, hairline border, ink label; used for the phone number beside the primary action. Hover fills chalk muted.
- **Ghost:** no fill; the language switch (stamp caps) and theme and menu icon buttons in the header.
- **Text link:** semibold with a 2px azure underline offset 4px.

### Chips
- **Role chip:** 2px azure outline pill, azure stamp caps at 0.75rem. Used for coach roles and the "200 m from the sea" note.
- **Filled tag:** azure pill with white stamp caps, for the "Personal training" tag on the Lab photo and the "more" tag on a course row.
- **Today tag:** a 2px azure outlined tag rotated -6 degrees on the current day's hours row, like a hand stamp.

### Cards / Containers
- **The scheda:** the only card. 1.3rem radius, 2px ink border, white (courses) or chalk card (contact form) body, and an ink header strip printed with stamp caps (title left, gym name right). Rows are a three-column grid (number, item, tick) on sheet-line hairlines.
- **Photos:** 1.3rem radius, chalk muted placeholder, object-fit cover.

### Inputs / Fields
- **Style:** 48px tall, 2px sheet-line stroke, white fill, xl radius, 1rem text; labels above in stamp caps with an azure asterisk for required.
- **Focus:** stroke turns azure with a soft azure ring.
- **Error:** handled by the shared field component (destructive border and message).
- **Consent:** a fieldset in the same 2px sheet-line stroke and xl radius, legend in stamp caps.

### Navigation
- **Desktop:** the floating header bar holds the logo, semibold 0.875rem pill links (hover: azure wash fill with azure text), the loading barbell rail with its kg tally, the language and theme switches, and the primary "Scrivici" pill.
- **Mobile:** a call pill and a menu icon. The menu opens as a full-height rubber sheet from the right with links in display caps at 3rem, the loaded barbell and a full-width call button at the foot.

### Barbell (signature)
A side-view SVG bar: knurled shaft, steel sleeves and collars, plates drawn to real proportions (bumpers at 10 kg and up share one diameter; 25/20 kg azure, 15 kg ink, 10 kg steel dark, 5 and 2.5 kg steel). Plates slide on with a spring, the ends whip down on each landing (the clank), and the hero bar presses up with the headline. The header carries a compact unstamped copy that loads one plate per section passed.

### Plate Face
A bumper plate seen face-on, azure or ink, with the label set around the rim in stamp caps, a steel insert ring, and a counting number in display type at the centre. It rotates with scroll (about 70 degrees across its pass).

### Stamp
An azure rubber-stamp tick: double ring and check with a displaced, worn ink edge. It lands once in view (from 2.2x scale, rotated, settling at -7 to -13 degrees) on a stiff spring. The form's sent state uses a large version of the same gesture.

### Scheda Flag
A narrow azure tab, folded at the top corner, that slides between course rows to mark the row crossing the middle of the viewport.

### Open Status
A live open/closed line computed from the real hours in Europe/Rome time: a 10px dot (azure and pinging when open, steel dark when closed), semibold state, and the next change in regular weight.

### Platform Band
Rubber-grain ink slab with white text, platform-muted secondary text and platform-line rules. Carries the equipment strip, the method, Azzurra Lab, the hours and the footer.

## Do's and Don'ts

### Do:
- **Do** set every heading in condensed 800 caps (wdth 75) at line-height 0.88.
- **Do** keep the 1.3rem radius on every slab (photos, cards, plates, header) and use full pills for controls.
- **Do** present lists as rows on a scheda: ink top rule, sheet-line hairlines, a number column and a mark column.
- **Do** show completion with a stamp and position with the folded flag, not with a colour change alone.
- **Do** alternate white ground with rubber platform bands to pace the page.
- **Do** use tabular numerals for hours, phone numbers, counters and the kg tally.
- **Do** give motion physical causes (plates landing, a bar settling, a stamp hitting paper) and show the end state under reduced motion.

### Don't:
- **Don't** add box shadows; the theme is flat by decision.
- **Don't** set reading text in azure on a white ground (2.9:1); keep it in ink.
- **Don't** lay content out as equal card grids or stat bands; use rows, plates and scale.
- **Don't** add generic fade-up or scroll-reveal entrances to section content.
- **Don't** introduce a second display face or set headings in sentence case.
- **Don't** use azure as a section background; the rubber platform is the only dark band.
