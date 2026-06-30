---
name: Academic Excellence System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#43474e'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#455f88'
  primary: '#002045'
  on-primary: '#ffffff'
  primary-container: '#1a365d'
  on-primary-container: '#86a0cd'
  inverse-primary: '#adc7f7'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#1b2127'
  on-tertiary: '#ffffff'
  tertiary-container: '#30363c'
  on-tertiary-container: '#989fa6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#adc7f7'
  on-primary-fixed: '#001b3c'
  on-primary-fixed-variant: '#2d476f'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#dde3eb'
  tertiary-fixed-dim: '#c1c7cf'
  on-tertiary-fixed: '#161c22'
  on-tertiary-fixed-variant: '#41474e'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
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
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max-width: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

This design system is built for high-stakes academic and research environments. The brand personality is authoritative yet accessible, prioritizing clarity and trust to reduce cognitive load during complex application processes. 

The style utilizes a **Modern Corporate** approach with a focus on institutional reliability. It features a sophisticated "high-fidelity" feel through the use of soft elevation, generous negative space, and a refined color palette. The UI evokes a sense of prestige and structural integrity, ensuring that researchers and administrators feel they are working within a stable, world-class ecosystem.

Key brand attributes:
- **Rigorous:** Precision in alignment and typography.
- **Supportive:** Clear feedback loops and accessible form structures.
- **Institutional:** A color story rooted in traditional academic excellence.

## Colors

The palette is anchored by **Institutional Blue (#1A365D)**, used for primary actions, headers, and key brand moments. This is complemented by a scale of **Slate Grays** to manage secondary information and structural borders without creating visual noise.

- **Primary:** Used for the "Call to Action" (Cuerpo de la acción), active states, and navigation headers.
- **Secondary (Slate):** Used for supporting text, icons, and non-primary buttons.
- **Neutral/Background:** A clean white (#FFFFFF) is the primary workspace color, with Slate-50 (#F8FAFC) used for section grounding and "Surface" containers.
- **Functional Colors:** Localized status colors for validation (Éxito, Error, Advertencia).

## Typography

The design system uses **Inter** exclusively to ensure maximum legibility and a systematic, utilitarian aesthetic suitable for research data. 

**Hierarchical Rules:**
- **Encabezados (Headlines):** Use semi-bold (600) weights with tighter letter spacing for a compact, professional look.
- **Cuerpo (Body):** Maintain a comfortable 1.5 line-height for long-form research descriptions.
- **Etiquetas (Labels):** Always use Medium (500) weight to distinguish form field descriptors from user input.
- **Localization:** Ensure all typography supports Spanish character sets (accents, tildes, opening punctuation).

## Layout & Spacing

The layout utilizes a **Fixed-Fluid Hybrid Grid**. On desktop, content is centered within a 1280px container to prevent line lengths from becoming unreadable. On smaller screens, the layout becomes a fluid 4-column system.

- **Vertical Rhythm:** A strict 4px baseline shift is used. Form elements should be separated by `stack-md` (16px), while distinct sections of an application should use `stack-lg` (32px).
- **Safe Areas:** Generous internal padding (24px to 40px) within cards ensures that dense research data feels airy and manageable.
- **Form Layouts:** Use a single-column layout for standard forms to improve completion rates, switching to two columns only for related short fields (e.g., Código Postal and Ciudad).

## Elevation & Depth

To maintain an institutional and professional feel, depth is created through **Tonal Layers** and **Ambient Shadows**.

- **Level 0 (Base):** Surface-50 (#F8FAFC) - Background for the entire application.
- **Level 1 (Cards):** White (#FFFFFF) with a 1px Slate-200 border and a "shadow-sm" (0 1px 2px 0 rgba(0, 0, 0, 0.05)). Used for primary content sections.
- **Level 2 (Interactive):** White (#FFFFFF) with "shadow-md" (0 4px 6px -1px rgba(0, 0, 0, 0.1)). Used for dropdowns, modals (diálogos), and active hover states on cards.
- **Focus States:** 2px solid ring of Primary Institutional Blue with a 4px offset to ensure WCAG 2.1 compliance.

## Shapes

The shape language is modern and approachable. The system leans on **Rounded (2)** settings to soften the inherent "dryness" of institutional forms.

- **Standard Elements (Inputs, Buttons):** 0.5rem (8px) border radius.
- **Surface Containers (Cards):** Use `rounded-xl` (1rem / 16px) for main content blocks.
- **Modals and Hero Sections:** Use `rounded-2xl` (1.5rem / 24px) to create a distinct visual hierarchy for high-level containers.
- **Chips/Badges:** Pill-shaped (9999px) to contrast against the structured rectangular grid of forms.

## Components

### Buttons (Botones)
- **Primary:** Institutional Blue background, White text. High-contrast, semi-bold.
- **Secondary:** White background, Slate-700 text, Slate-300 border.
- **States:** Hover should darken the background by 10%. Disabled states use Slate-200 background with Slate-400 text.

### Form Fields (Campos de Formulario)
- **Label:** Title-md, Slate-900.
- **Input:** 12px vertical padding, 16px horizontal. Slate-300 border.
- **Focus State:** Blue-600 border with a 3px soft blue glow (Alpha 10%).
- **Error State:** Red-600 border. Include a "Texto de ayuda" (Help text) below the field in Red-600.

### Chips (Etiquetas de Estado)
- Used for "Estado de la Solicitud" (Application Status). Use low-saturation background tints of the status colors (e.g., Light Green background with Dark Green text for "Aprobado").

### Progress Indicator (Indicador de Progreso)
- A vertical stepper for desktop and a horizontal bar for mobile. Each step should clearly label the "Sección" (Section) currently being edited.

### Data Cards (Tarjetas de Datos)
- Used for summarizing research team members or publication lists. Use a subtle Slate-50 background on hover to indicate interactivity.