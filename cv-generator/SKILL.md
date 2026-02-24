---
name: cv-generator
description: Generate tailored CVs from verified experience data. Use when asked to create, tailor, or update a CV/résumé for job applications. Enforces accuracy-first workflow - proposes content as text before generating LaTeX/PDF. Source of truth is references/master-cv.md.
---

# CV Generator

## Critical Rules

1. **NEVER fabricate** - Only use information from `references/master-cv.md`
2. **ASK, don't assume** - If information is missing, ask the user
3. **Propose before generating** - Show content as text/markdown before creating .tex/.pdf
4. **Follow CDYF guidelines** - See `references/cdyf-guidelines.md` for writing rules

## Workflow

### Step 1: Analyse Role
- Read job description
- Identify key requirements, technologies, skills
- Check `references/master-cv.md` for matching experience

### Step 2: Propose Content
Show the user:
```
## Proposed CV Content

**Tailoring rationale:** [Why these choices]

**Include:**
- [Experience/projects to include]

**Emphasise:**
- [What to highlight]

**Omit:**
- [What to leave out]

**Sections:**
1. Education: [modules to list - NO grades]
2. Experience: [entries]
3. Projects: [entries - ongoing projects first]
4. Hackathons & Awards: [check master CV for ALL relevant entries]
5. Technical Skills: [categories - ALWAYS last section]
```

Wait for approval before proceeding.

### Step 3: Generate (After Approval Only)
- Select appropriate template (see Template Selection below)
- Compile with pdflatex
- Provide both .tex and .pdf

## Template Selection

| Company Type | Template | Why |
|--------------|----------|-----|
| Large tech (Cisco, Google, Microsoft, etc.) | `ats-template.tex` | ATS-friendly, clean, fits more content |
| Startups | `ats-template.tex` | Clean and modern |
| Traditional/Corporate | `moderncv-template.tex` | More formal appearance |

**Default:** Use `ats-template.tex` unless user specifies otherwise or company type suggests formal template.

**Template location:** `assets/ats-template.tex`

## Writing Rules

### Section Structure
| Section | Rules |
|---------|-------|
| Education | List relevant modules WITHOUT grades |
| Experience | Not "Professional Experience" - just "Experience" |
| Projects | No category labels (e.g., "Open Source", "DevOps Project") - just project name |
| Hackathons & Awards | Check master CV for ALL hackathons, awards, competitions |
| Technical Skills | ALWAYS the last section |

### Do NOT Include
- Module grades (list modules only)
- Repository/demo/video links (recruiters won't click them)
- Project category labels before project names
- "Additional Information" section (visa status etc. - they'll ask)

### C.A.R.E. Framework for Every Entry

Every bullet point should show Context, Action, Result, Evidence. For projects specifically:

**First bullet MUST be Context/Purpose:**
- What is it?
- Who is it for?
- Why does it exist/matter?

**Then Action/Technical details:**
- What you built
- Technologies used
- Implementation specifics

**Then Results (if applicable):**
- Measurable outcomes
- Impact

❌ **Wrong order:**
```
○ Built with Astro, TypeScript, TailwindCSS; deployed via GitHub Actions
○ Implemented CI/CD pipeline with Vitest unit tests
○ Created open-source learning platform for EEE students
```

✅ **Correct order:**
```
○ Created open-source interactive learning platform helping EEE students navigate their degree with curated resources and progress tracking across 50+ topics
○ Built with Astro, TypeScript, TailwindCSS; deployed via GitHub Actions to Cloudflare Pages
○ Implemented CI/CD pipeline with Vitest unit tests, Playwright E2E tests, and automated link validation
```

### Team Projects - Required Information

For ANY team/group project, ALWAYS include:
- Team size (e.g., "team of 5")
- Your specific role (e.g., "technical lead", "led technical development")
- What YOU contributed (e.g., "primary contributor to codebase and deployment pipeline")

❌ **Missing team context:**
```
○ Developed real-time spatial audio VR application using Unity and Steam Audio
○ Redesigned ML pipeline GUI using PyQt6 with debugging tools
```

✅ **With team context:**
```
○ Led technical development in team of 5, coordinating Unity VR application, ML pipeline, and evaluation workstreams; primary contributor to codebase and deployment pipeline
○ Developed real-time spatial audio VR application using Unity and Steam Audio
```

### Project Ordering

Within the Projects section:
1. Ongoing projects (marked "Present") go near the top
2. Then reverse chronological order

### Bullet Writing Rules (from CDYF)

- Start every bullet with past-tense action verb
- Use specific numbers: "team of 5", "30% to 85%", "50+ topics"
- No pronouns (I, me, my, we, our)
- No vague words (many, various, multiple, several, large)
- No passive voice

## If Information is Missing

Say: "I don't have [X] in the master CV. Can you provide details about:
- Context (where/when/team size)
- What you did (specific actions)
- Results (measurable outcomes)"

Then ask if they want to add it to master-cv.md for future use.

## Pre-Generation Checklist

Before generating LaTeX, verify:

- [ ] Modules listed WITHOUT grades?
- [ ] No repository/demo/video links?
- [ ] Every project's first bullet explains what it is and why?
- [ ] All team projects have: team size, your role, your contribution?
- [ ] Ongoing projects near top of Projects section?
- [ ] Technical Skills is the LAST section?
- [ ] No "Additional Information" section?
- [ ] No project category labels?
- [ ] Checked master CV for ALL relevant hackathons/awards?
- [ ] All bullets start with action verbs?
- [ ] No pronouns?

### Incomplete / Exploratory Projects

The master CV includes a section of incomplete/abandoned projects. Rules:

- **NEVER** feature these as standalone project entries on a CV
- **CAN** mention skills learned from them in the Technical Skills section (e.g., "Chrome Extension APIs" from Blaze Prompt)
- **CAN** reference briefly in a bullet point of another entry if directly relevant (e.g., mentioning Stripe integration experience)
- **CAN** mention the VibeCoding framework as evidence of AI-assisted development experience
- When mentioning, frame honestly: "explored", "prototyped", "experimented with" — not "built" or "developed"

## Quick Reference

- **Writing guidelines:** See `references/cdyf-guidelines.md`
- **All experience data:** See `references/master-cv.md`
- **Default template:** `assets/ats-template.tex`

## Tailoring Quick Guide

| Role Type | Lead With | Emphasise | De-emphasise |
|-----------|-----------|-----------|--------------|
| Software/DevOps | Audioscenic | CI/CD, Docker, testing | Hardware, circuits |
| Mobile | Claude Refresher Orb, Food Wars | Flutter, Dart, local notifications, mobile-first UI | Hardware, circuits |
| Embedded/Hardware | Research Assistant | Sensors, microcontrollers | Web frameworks |
| VR/XR | Research Assistant, AVVR | Unity, spatial audio | DevOps |
| AI/ML | Research Assistant, EMG | Python ML, signal processing | Pure web dev |
| Frontend/Web | EEE Roadmap, Food Wars, Portfolio Hall | React, TypeScript, Tailwind, Babylon.js, CI/CD | Hardware, circuits |
| Graduate Scheme | Show breadth | Cross-disciplinary, hackathons | Nothing specific |
