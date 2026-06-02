# CoverPhoto UX Improvement Plan

## Problems Identified

1. **No persistent step indicator after sign-in** — LandingSteps shows 3 steps on the landing page but vanishes once authenticated. Users have no guidance on where they are in the workflow.

2. **Mobile panels are hidden** — RefPanel and BuilderPanel are behind edge buttons with vertical text ("📷 REFERENCE" and "✦ BUILD") that users must discover. This is invisible to new mobile users.

3. **Empty state is text-heavy** — The center empty state explains the workflow in a paragraph, but users don't read instructions.

4. **Workbench vs Library confusion** — Two carousels side-by-side with unclear relationship. "Dismiss" sounds negative for removing a portrait you don't want.

5. **No first-run onboarding** — Confetti fires but no guided walkthrough.

## Implementation Phases

### Phase 1: WorkflowWizard (persistent step indicator)
- New component `WorkflowWizard.tsx`
- Shows 4-5 steps horizontally at top of workbench area
- Current step highlights; completed steps show checkmark
- Steps: Step 1 "Upload Photos" → Step 2 "Pick Styles" → Step 3 "Generate" → Step 4 "Review" → Step 5 "Library"

### Phase 2: Mobile Bottom Tab Navigation
- Replace hidden edge slide-in panels with a fixed bottom tab bar
- 3 tabs: "📷 Photos", "✦ Styles", "🖼 Results"
- Standard mobile UX pattern — users instinctively tap bottom tabs
- Each tab shows its panel full-screen inset above the tab bar
- Remove the old edge-button system

### Phase 3: Guided Empty State
- Replace particles + paragraph with visual diagram
- Gold arrow pointing left: "📷 Upload photos"
- Gold arrow pointing right: "✦ Pick your styles"
- Center: "⚡ Then tap Generate"
- Minimal, scannable, actionable

### Phase 4: Library/Workbench Clarity on Mobile
- On mobile: show only the carousel with the most relevant content
- Workbench portraits shown first with "✓ Keep" and "✕ Skip" buttons
- Library shown as a separate section below workbench
- Rename "Dismiss" to "Skip" (less negative)

### Phase 5: First-Run Onboarding (lightweight)
- Quick 2-step tooltip sequence on first visit
- Points to the Photos tab, then the Styles tab
- Dismissable, never repeats
