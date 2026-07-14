---
name: Forest & Amber Tactile System
colors:
  surface: '#0f1511'
  surface-dim: '#0f1511'
  surface-bright: '#343b36'
  surface-container-lowest: '#0a100c'
  surface-container-low: '#171d19'
  surface-container: '#1b211d'
  surface-container-high: '#252b27'
  surface-container-highest: '#303632'
  on-surface: '#dee4dd'
  on-surface-variant: '#c0c9c0'
  inverse-surface: '#dee4dd'
  inverse-on-surface: '#2c322d'
  outline: '#8a938b'
  outline-variant: '#404942'
  surface-tint: '#95d4ac'
  primary: '#95d4ac'
  on-primary: '#003920'
  primary-container: '#0f5132'
  on-primary-container: '#84c39b'
  inverse-primary: '#2d6a48'
  secondary: '#77da9f'
  on-secondary: '#00391f'
  secondary-container: '#007b49'
  on-secondary-container: '#a7ffc7'
  tertiary: '#fabd00'
  on-tertiary: '#3f2e00'
  tertiary-container: '#5b4300'
  on-tertiary-container: '#e4ac00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#b0f1c7'
  primary-fixed-dim: '#95d4ac'
  on-primary-fixed: '#002111'
  on-primary-fixed-variant: '#0f5132'
  secondary-fixed: '#93f7ba'
  secondary-fixed-dim: '#77da9f'
  on-secondary-fixed: '#002110'
  on-secondary-fixed-variant: '#00522f'
  tertiary-fixed: '#ffdf9e'
  tertiary-fixed-dim: '#fabd00'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5b4300'
  background: '#0f1511'
  on-background: '#dee4dd'
  surface-variant: '#303632'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
  button-text:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  container-max: 1280px
---

## Brand & Style

This design system utilizes a high-fidelity **Skeuomorphic** aesthetic to bridge the gap between academic formality and professional industrial experience. The brand personality is rooted in stability and prestige, evoking the feeling of a well-crafted physical workspace. 

The visual direction employs "Physical Realism," where UI elements mimic tangible materials: 
- **Emerald Surfaces:** Represented as deep-dyed leather or polished forest-grade resin.
- **Amber Gold:** Treated as brushed metallic accents or illuminated indicators.
- **Depth & Lighting:** All components follow a consistent top-down light source, creating realistic highlights on top edges and soft ambient occlusion shadows below. 

The goal is to provide students and administrators with a sense of "digital permanence" and tactile feedback that makes the SIWES management process feel consequential and high-end.

## Colors

The palette is anchored in a dark, atmospheric environment to allow the skeuomorphic highlights to pop.

- **Background (#121814):** A deep, matte slate-green that acts as the physical "desk" or "floor" of the application.
- **Deep Forest (#0F5132):** Used for primary structural elements like sidebars or recessed containers. It should feature a subtle grain texture.
- **Active Emerald (#198754):** The primary interactive color. It represents "on" states, success, and active status indicators.
- **Amber Gold (#FFC107):** Reserved for high-priority accents, certifications, and "premium" data points. In a skeuomorphic context, this is rendered with a radial gradient to simulate a metallic sheen.

## Typography

The typography maintains high legibility to balance the complex visual style. **Inter** provides a clean, neutral foundation that ensures data remains the focus. 

**JetBrains Mono** is introduced for labels and technical data (like Student IDs or Logbook entries) to reinforce the "industrial" aspect of the scheme. 

To enhance the skeuomorphic effect:
- **Headlines:** Use a very subtle `0 1px 0 rgba(255,255,255,0.1)` drop shadow to look slightly embossed on the dark background.
- **Labels:** Small caps with tracking for a stamped, official document appearance.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop to maintain the integrity of "physical" dashboard panels. Elements are spaced generously to prevent the tactile shadows from overlapping and creating visual clutter.

- **Grid:** 12-column system with 24px gutters.
- **Depth-Based Spacing:** Interactive elements (buttons) should have at least 12px of "breathing room" to allow their outer glow and shadows to be fully visible.
- **Mobile:** Transition to a single-column fluid layout with 16px side margins. Large card-based navigation is preferred over compact lists.

## Elevation & Depth

Depth is the core of this design system. We use three distinct elevation tiers:

1.  **Recessed (Inner Shadow):** Used for input fields and "wells" where data is entered. Use a 2px top-weighted inner shadow `inset 0 2px 4px rgba(0,0,0,0.5)`.
2.  **Surface (Base):** The primary card level. Includes a 1px top highlight (white at 10% opacity) and a soft bottom shadow.
3.  **Raised (Button/Active):** Elements that sit above the surface. These use a "beveled" look with a light top edge and a dark 4px bottom shadow to suggest physical height.

**Gradients:** Use subtle linear gradients (top-to-bottom) for all surfaces. A surface is never a flat hex color; it always ranges from a slightly lighter shade at the top to the base hex at the bottom.

## Shapes

The system uses **Soft (0.25rem)** roundedness for standard elements. This mimics the slightly eased edges of manufactured industrial parts (brushed metal or hard plastic).

- **Standard Elements:** 4px radius.
- **Large Cards:** 8px (rounded-lg).
- **Interactive Nodes:** 12px (rounded-xl) for specific items like "Industrial Supervisor" badges.
- **Outer Borders:** Use a 1px solid border with a color slightly lighter than the background to define the "rim" of the object.

## Components

### Buttons
Buttons must feel like physical switches. 
- **Default:** Linear gradient (Top: #198754 to Bottom: #0F5132), 1px top highlight, 3px bottom shadow.
- **Pressed:** Remove bottom shadow, apply `inset 0 2px 4px rgba(0,0,0,0.3)`, and shift the button down by 1px to simulate travel.

### Cards (The "Industrial Insert")
Cards should resemble plastic or high-grade cardstock inserts. 
- **Styling:** Use the Neutral Dark background with a #0F5132 border. Apply a very subtle noise texture (2-3% opacity) to give the surface "tooth."

### Input Fields
Inputs are always recessed into the UI.
- **Styling:** Darker than the background (#0a0e0b), high-contrast text, and a strong inner shadow. When focused, the Amber Gold (#FFC107) should appear as a "backlit" outer glow.

### Chips & Badges
Small, pill-shaped markers that look like physical LED indicators or embossed Dymo labels.
- **Status Indicators:** Use a radial gradient to create a "glass bulb" effect for active/inactive states.

### List Items
List items should have a "grooved" separator—a 1px dark line with a 1px light highlight underneath—creating a carved effect between rows.