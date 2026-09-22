# PRESSÉ WEBSITE — BUILD PROMPTS FOR CLAUDE CODE

---

## SETUP & MODEL RECOMMENDATIONS

### Model
Use **Claude Sonnet 4** (claude-sonnet-4-20250514) — it's the best balance of speed and capability for code generation. If you have access to Opus, that works too but will be slower.

### Settings
- In Claude Code, make sure you're in the project directory before starting
- Have your assets folder set up before pasting the prompt

### Project Setup (run these first)
```bash
mkdir -p presse-website/assets/images
mkdir -p presse-website/assets/logo
mkdir -p presse-website/css
mkdir -p presse-website/js
```

Then copy your files into the assets folders:
- `assets/images/nail-hero.jpg` — your wide hand photo (the only photograph the experience uses)
- `assets/logo/logo-dark.svg` (or .png) — dark text version for light backgrounds
- `assets/logo/logo-light.svg` (or .png) — light/white text version for dark backgrounds
- `assets/logo/logo-transparent.png` — transparent background version

### How to Use These Prompts
1. Paste PHASE 1 into Claude Code first
2. Wait for it to build everything
3. Review the result in your browser
4. If adjustments are needed, ask Claude Code directly (e.g. "make the zoom slower" or "change the background colour")
5. Once Phase 1 feels right, paste PHASE 2
6. Continue through each phase

---

## PHASE 1 — CINEMATIC SCROLL EXPERIENCE

Paste this entire block into Claude Code:

---

```
I'm building a website for my press-on nail brand called **pressé** (lowercase, with an accent on the é). The tagline is **the nail edit**.

This is NOT a standard ecommerce website. The opening experience should feel like a luxury beauty campaign — a cinematic, scroll-controlled animation that tells a visual story before the user ever sees a product grid or navigation bar.

The project folder is already set up with assets in `assets/images/` and `assets/logo/`. Check what's there before starting.

---

# WHAT TO BUILD IN THIS PHASE

Build ONLY the cinematic scroll experience — the opening section of index.html. Do not build the navigation, product grid, shop, or any standard website sections yet. That comes later.

---

# THE SCROLL NARRATIVE

The user's scroll controls everything. No autoplay. The experience should flow like this:

**SCROLL 0% — THE INTRO**
- Minimal screen. Lots of negative space.
- The brand logo (pressé) sits in the centre, use the light version from `assets/logo/`.
- Below or near it, the tagline "the nail edit" in tiny, widely-spaced sans-serif uppercase.
- A photograph of nails (`assets/images/nail-hero.jpg`) appears relatively small in the centre — like a photograph in a luxury magazine.
- A very subtle scroll indicator at the bottom — either a small animated chevron or the word "scroll" in light, understated type. This disappears once the user begins scrolling.
- The overall feel: mysterious, premium, minimal. NO navigation bar. NO product cards. NO busy text.

**SCROLL 0–40% — THE ZOOM**
- As the user scrolls, the photograph progressively zooms in.
- The scroll CONTROLS the zoom — not a simple scroll-past animation.
- The photograph grows larger, filling more and more of the viewport.
- The zoom should feel like a camera physically moving toward the nails.
- The logo and tagline fade out as the zoom begins.
- The scroll indicator disappears immediately.
- The zoom should be smooth and continuous — avoid any jerky jumps.
- Use CSS transforms (scale + translate) for GPU-friendly animation.
- The zoom should move toward a specific nail in the image. Make this configurable:

```js
const nailFocus = {
  x: 45, // percentage from left — adjust to target a specific nail
  y: 50  // percentage from top
};
```

**SCROLL 40–58% — ZOOM PAST RECOGNITION**
- Keep zooming the hero photograph further IN — well past the point of recognition (scale ~400–500%).
- Simultaneously ramp blur from 0 to ~35px and lift the image toward a pale nude tone.
- By the end the screen is nothing but a soft wash of warm nude/pink colour — no recognisable detail. Only the hero photo is ever used.

**SCROLL 58–60% — THE INVISIBLE SWAP**
- While the screen is just abstract colour, hide the hero photo (opacity 0, display none) and stand the illustrated SVG nail in its place — also blurred ~35px and scaled up to match, so it looks identical to the wash already on screen.
- A warm-nude tint fills the screen for these frames so both layers read as exactly the same colour; the swap cannot be seen.

**SCROLL 60–70% — REVEAL THE ILLUSTRATED NAIL**
- Zoom back out (scale ~400% → 100%) while reducing blur (35px → 0) — the camera pulls back and the illustration comes into sharp focus.
- In its place, a clean, vector-illustrated nail shape appears.
- This nail should be:
  - Almond-shaped (matching the nails in the photos)
  - Nude/blush pink with a glossy shine effect
  - Slightly stylised but still realistic — NOT cartoonish
  - Floating in space with no finger or skin — just the nail as a product
  - Created in SVG or CSS so it's crisp at any size
- The illustrated nail should be centred in the viewport.
- This transition marks the shift from "beauty campaign" to "product blueprint."

**SCROLL 65–90% — DISSECT THE NAIL**
- The illustrated nail remains centred.
- As the user continues scrolling, annotation labels appear around it one by one.
- Each annotation consists of:
  - A thin, elegant line (SVG) drawing outward from a specific point on the nail
  - A label that fades into position at the end of the line
  - A short description underneath the label in smaller text

- The annotations should appear sequentially, timed to scroll progress:
  - ~65%: First annotation appears (line draws out, then label fades in)
  - ~72%: Second annotation
  - ~79%: Third annotation
  - ~86%: Fourth annotation
  - ~90%: All annotations visible, nail is fully "dissected"

- Use these placeholder annotations (easy to edit later):

  1. **BIAB BASE** — "A strong structured base for durability"
     Position: bottom of the nail
  
  2. **HIGH-SHINE FINISH** — "A glossy salon-inspired finish"
     Position: top/surface of the nail
  
  3. **PRECISION SHAPE** — "Carefully shaped for a refined look"
     Position: side/edge of the nail
  
  4. **DURABLE DESIGN** — "Built to withstand everyday wear"
     Position: opposite side of the nail

- The overall aesthetic should feel like a luxury product blueprint — thin lines, understated typography, elegant spacing. NOT a PowerPoint. NOT a biology textbook.

**SCROLL 90–100% — HOLD**
- All annotations are visible.
- The complete "nail breakdown" holds on screen.
- This is a pause before the next phase (transition into the main website, which will be built later).

---

# TECHNICAL REQUIREMENTS

**Animation Library:**
Use GSAP with ScrollTrigger. Load from CDN:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
```

**Scroll Pinning:**
The cinematic experience should be pinned — the viewport content stays fixed while the user's scroll drives the animation progress. Use ScrollTrigger's `pin` feature. The scroll distance should be long enough that the animation feels cinematic, not rushed. Aim for roughly 5–6x the viewport height of scroll distance.

**Performance:**
- All animations via CSS transforms (scale, translate, opacity) — no layout thrashing
- Use `will-change: transform` on animated elements
- Debounce or throttle any scroll handlers outside of GSAP
- The hero image should be preloaded

**Preloader:**
Before the experience begins, show a minimal branded preloader:
- Display "pressé" in the brand typeface, centred on screen
- Once the hero image has fully loaded, fade the preloader out and reveal the intro
- This prevents the user from scrolling before the image is ready

**Responsive:**
- Must work on desktop, tablet, and mobile
- On mobile, adapt the zoom framing — the nail focus point should still work
- The annotation diagram should reflow for narrower screens (labels may need to stack differently)

**Accessibility:**
- Respect `prefers-reduced-motion` — users with this preference should see a simplified, static version (show the nail photo, then the annotated nail, without scroll-driven animation)
- Use semantic HTML
- Add appropriate alt text to images
- Ensure contrast ratios meet WCAG standards

---

# DESIGN LANGUAGE

**Backgrounds:** Cream (#FAF7F2), ivory, warm off-white. NOT pure white. NOT pink.
**Text:** Deep brown/almost-black (#1A1714). NOT pure black.
**Accent colours:** Muted nude/blush for the illustrated nail.
**Typography:**
- Logo/headings: Playfair Display (Google Fonts) — serif, elegant
- Body/tagline/annotations: A clean sans-serif — Montserrat, Inter, or similar
- Annotation labels: Small, uppercase, widely letter-spaced
- Annotation descriptions: Even smaller, regular weight, sentence case

**Overall feel:** Luxury beauty campaign + editorial fashion + interactive digital experience. Lots of negative space. Thin lines. Subtle shadows. Slow, smooth movement.

---

# FILE STRUCTURE

```
index.html
css/
  style.css        — global styles, typography, colours
  cinematic.css    — all cinematic scroll experience styles
  responsive.css   — responsive breakpoints
js/
  main.js          — preloader, general setup
  cinematic.js     — all GSAP scroll animation logic
assets/
  images/
    nail-hero.jpg          — the only photograph used
  logo/
    (logo files)
```

Keep the cinematic code isolated from future standard website code.

---

# IMPORTANT

- The scroll MUST control the animation. The user should feel like their scrolling is moving a camera.
- The zoom must feel smooth and cinematic — not like an image simply getting bigger.
- The handoff from the blurred photograph to the blurred illustration must be invisible.
- The illustrated nail must look premium, not cartoonish.
- The annotation diagram must feel editorial and intentional, not like a labelled school diagram.
- When you think you're done, review the experience and ask: "does this feel like an ordinary website?" If yes, refine it.

Build this now.
```

---

## PHASE 2 — TRANSITION INTO MAIN WEBSITE

Paste this after Phase 1 is working:

---

```
The cinematic scroll experience is now built. Next, build the transition from the cinematic experience into the main pressé website.

This transition is critical — I don't want "animation ends → suddenly a normal webpage appears."

**What should happen after scroll 90% (where the annotated nail currently holds):**

SCROLL 90–95%:
- The annotation labels and lines gradually fade out
- The illustrated nail slightly scales down

SCROLL 95–100%:
- The nail fades away
- The background transitions from the cinematic cream to the main website's header area
- The pressé navigation bar fades in at the top:
  - Logo (pressé) on the left
  - Nav links: Home, Shop, About, How It Works, Sizing, FAQs, Contact
  - Cart icon on the right
  - On mobile: hamburger menu
- Below the nav, a hero section for the main website fades in — this could be a large editorial image or a "BEAUTIFUL NAILS, WITHOUT THE APPOINTMENT." headline with elegant typography

The transition should feel like moving from a Pressé campaign film into the Pressé store.

**Navigation styling:**
- Clean, minimal, lots of space
- Logo in Playfair Display
- Nav links in small, uppercase, letter-spaced sans-serif
- Thin bottom border or no border — very subtle
- Sticky on scroll once it appears
- Mobile menu should be sophisticated — full-screen overlay with elegant typography, not a basic dropdown

**After the transition, the page should scroll normally** — no more pinned scroll animations. Standard vertical scrolling from this point on.

Build this now, integrating it with the existing cinematic experience.
```

---

## PHASE 3 — HOMEPAGE SECTIONS

```
The cinematic experience and transition are working. Now build the homepage content sections that appear after the navigation. These should scroll naturally (no pinned animations) but can have subtle entrance animations as sections come into view.

Build these sections in order:

**1. FEATURED COLLECTION**
- Headline: "The Collection"
- Show 4 featured nail sets in a grid
- Each product card should contain: product image (use placeholder), product name, price, short description, "View" link
- Style these editorially — large images, minimal text, lots of breathing room
- Do NOT make these look like generic Shopify cards
- Use this placeholder product data:

```js
const featuredProducts = [
  { id: 1, name: "Nude Glow", price: "£14.99", description: "A warm nude with a glossy finish", shape: "Almond", length: "Medium" },
  { id: 2, name: "Cherry Bomb", price: "£14.99", description: "A rich cherry red with high shine", shape: "Almond", length: "Medium" },
  { id: 3, name: "Espresso", price: "£14.99", description: "A deep brown with a creamy finish", shape: "Square", length: "Short" },
  { id: 4, name: "Milky French", price: "£15.99", description: "A soft milky French tip design", shape: "Almond", length: "Long" }
];
```

**2. BRAND STORY**
- Large editorial image on one side (use placeholder)
- Text on the other side:
  - Headline: "Beautiful nails, without the appointment."
  - Body: 2–3 sentences about pressé — premium press-on nails designed for effortless beauty. Placeholder text that's easy to edit.
- This section should feel like a magazine spread

**3. HOW IT WORKS**
- Four steps displayed elegantly:
  - 01 — CHOOSE — "Pick your perfect set"
  - 02 — SIZE — "Find your fit with our sizing guide"
  - 03 — APPLY — "Press on in minutes"
  - 04 — WEAR — "Enjoy salon-quality nails for up to two weeks"
- Subtle entrance animation as each step enters the viewport
- Use numbered typography — large elegant numbers with small text

**4. SIZING PREVIEW**
- A brief sizing section with a CTA to the full sizing guide
- Show the sizes: XS, S, M, L, XL
- "Find your perfect fit" link to sizing page

**5. FOOTER**
- pressé logo
- Quick links: Shop, About, How It Works, Sizing, FAQs, Contact
- Social media links (placeholder icons for Instagram, TikTok)
- "© 2026 pressé — the nail edit"
- Newsletter signup: "Join the edit" with email input and submit button
- Keep it clean and minimal

All sections should use the same design language: cream backgrounds, deep brown text, Playfair Display for headings, clean sans-serif for body, lots of negative space.

Build these now.
```

---

## PHASE 4 — SHOP & PRODUCT PAGES

```
Now build the shop and product detail pages.

**SHOP PAGE (shop.html)**

- Include the pressé navigation (same as homepage, sticky)
- Page title: "Shop All"
- Product filtering by: Shape (Almond, Square, Coffin, Oval), Length (Short, Medium, Long)
- Sorting by: Price low to high, Price high to low, Newest
- Product grid showing all products
- Each product card: image (placeholder), name, price, shape, length
- Clicking a product goes to the product detail page

Use this central product data in a separate `js/products.js` file:

```js
const products = [
  { id: 1, name: "Nude Glow", price: 14.99, image: "assets/images/products/nude-glow.jpg", images: ["assets/images/products/nude-glow.jpg"], shape: "Almond", length: "Medium", collection: "Essentials", tags: ["nude", "glossy", "classic"], description: "A warm nude with a glossy finish. Our bestselling shade for effortless everyday elegance.", inStock: true },
  { id: 2, name: "Cherry Bomb", price: 14.99, image: "assets/images/products/cherry-bomb.jpg", images: ["assets/images/products/cherry-bomb.jpg"], shape: "Almond", length: "Medium", collection: "Bold Edit", tags: ["red", "bold", "classic"], description: "A rich cherry red with high shine. Statement nails for when you mean business.", inStock: true },
  { id: 3, name: "Espresso", price: 14.99, image: "assets/images/products/espresso.jpg", images: ["assets/images/products/espresso.jpg"], shape: "Square", length: "Short", collection: "Essentials", tags: ["brown", "neutral", "classic"], description: "A deep brown with a creamy finish. Rich, warm, and endlessly versatile.", inStock: true },
  { id: 4, name: "Milky French", price: 15.99, image: "assets/images/products/milky-french.jpg", images: ["assets/images/products/milky-french.jpg"], shape: "Almond", length: "Long", collection: "French Edit", tags: ["french", "white", "elegant"], description: "A soft milky French tip design. The modern take on a timeless classic.", inStock: true },
  { id: 5, name: "Rose Quartz", price: 15.99, image: "assets/images/products/rose-quartz.jpg", images: ["assets/images/products/rose-quartz.jpg"], shape: "Almond", length: "Medium", collection: "Essentials", tags: ["pink", "shimmer", "soft"], description: "A delicate pink with a subtle shimmer. Soft, feminine, and effortlessly pretty.", inStock: true },
  { id: 6, name: "Glazed Donut", price: 15.99, image: "assets/images/products/glazed-donut.jpg", images: ["assets/images/products/glazed-donut.jpg"], shape: "Oval", length: "Medium", collection: "Trending", tags: ["chrome", "trendy", "glossy"], description: "The viral glazed finish. Pearlescent chrome that catches every light.", inStock: true },
  { id: 7, name: "Deep Plum", price: 14.99, image: "assets/images/products/deep-plum.jpg", images: ["assets/images/products/deep-plum.jpg"], shape: "Coffin", length: "Long", collection: "Bold Edit", tags: ["purple", "bold", "dark"], description: "A moody plum with a glossy depth. Dark, dramatic, and completely addictive.", inStock: true },
  { id: 8, name: "Vanilla Latte", price: 14.99, image: "assets/images/products/vanilla-latte.jpg", images: ["assets/images/products/vanilla-latte.jpg"], shape: "Square", length: "Short", collection: "Essentials", tags: ["cream", "neutral", "soft"], description: "A creamy vanilla with a warm undertone. Your everyday go-to shade.", inStock: true }
];
```

**PRODUCT DETAIL PAGE (product.html)**

- Loaded dynamically based on URL parameter (e.g. product.html?id=1)
- Large product image on the left (placeholder)
- Product info on the right:
  - Product name (Playfair Display)
  - Price
  - Description
  - Shape and Length info
  - Size selection: XS, S, M, L, XL (selectable buttons)
  - "Add to Cart" button — styled elegantly, not a generic button
  - Link to sizing guide
- Below: "You may also like" section showing 3–4 related products

**CART (js/cart.js)**

- Cart stored in localStorage
- Cart drawer that slides in from the right when cart icon is clicked
- Shows: product name, size, quantity (adjustable), price, remove button
- Subtotal at the bottom
- "Checkout" button (non-functional for now — just a styled button)
- Empty cart state: "Your cart is empty" with link to shop

Same design language throughout. Same navigation. Same footer. Build these now.
```

---

## PHASE 5 — REMAINING PAGES

```
Build the remaining pages. Each should include the same navigation and footer as the homepage and shop.

**ABOUT PAGE (about.html)**
- Large hero image (placeholder)
- Brand story with elegant typography
- Headline: "The Story"
- Placeholder body text about pressé — 2–3 paragraphs about the brand's mission, quality, and approach
- Keep it editorial — large text, lots of space, magazine-style layout

**HOW IT WORKS PAGE (how-it-works.html)**
- Expanded version of the homepage section
- Four steps with larger visuals and more detail:
  - 01 CHOOSE — Pick your set from our collection
  - 02 SIZE — Use our sizing guide to find your perfect fit
  - 03 APPLY — Clean, prep, and press on in under 10 minutes
  - 04 WEAR — Enjoy up to 2 weeks of salon-quality nails
- Include tips for application and removal

**SIZING GUIDE (sizing.html)**
- Clear sizing chart:
  - XS: 5–9mm width
  - S: 10–12mm width
  - M: 13–15mm width
  - L: 16–18mm width
  - XL: 19–22mm width
  (Placeholder measurements — easy to edit)
- Instructions for how to measure your natural nails
- Visual guide showing how to measure nail width
- "Not sure? Most people are a size M" helper text

**FAQ PAGE (faq.html)**
- Accordion-style FAQ
- Placeholder questions:
  - How long do pressé nails last?
  - How do I apply my nails?
  - How do I remove my nails?
  - What sizes are available?
  - Do the nails damage my natural nails?
  - Can I reuse my pressé nails?
  - What's included in each set?
  - How long does delivery take?
- Answers should be placeholder text, easy to edit
- Smooth accordion animation

**CONTACT PAGE (contact.html)**
- Simple, elegant contact form: Name, Email, Message, Submit button
- Email link: hello@shoppresse.co.uk (placeholder)
- Social links: Instagram, TikTok (placeholder URLs)
- Keep it minimal

Build all of these now with consistent styling.
```

---

## PHASE 6 — POLISH & RESPONSIVE

```
The full website is now built. This phase is about polishing everything.

**RESPONSIVE DESIGN:**
- Test and fix all pages at: 1440px, 1024px, 768px, 480px, 375px
- The cinematic scroll experience must feel intentional on mobile — not just a scaled-down desktop version
- Navigation should switch to hamburger menu below 768px
- Product grids should go from 4 columns → 2 columns → 1 column
- Annotation diagram labels should reflow for small screens
- Typography should scale down appropriately
- Touch scrolling on the cinematic section must feel smooth

**MICRO-INTERACTIONS:**
- Subtle hover effects on product cards (slight scale or shadow)
- Smooth page transitions if possible
- Button hover states (colour shift or subtle animation)
- Cart icon should show item count badge
- Smooth scroll for any anchor links
- Image lazy loading for everything outside the cinematic intro

**TYPOGRAPHY POLISH:**
- Ensure consistent font sizes across all pages
- Heading hierarchy: h1 → h2 → h3 with clear visual distinction
- Body text line height should be comfortable (1.6–1.7)
- Letter spacing on uppercase text should be consistent

**FINAL QUALITY CHECK:**
Review every page and ask:
- Does this feel like a premium beauty brand website?
- Does the cinematic intro feel smooth and intentional?
- Does the photo-to-illustration handoff feel invisible?
- Does the transition into the main website feel seamless?
- Is there enough negative space?
- Are there any elements that feel generic or template-like?
- Does the mobile experience feel considered, not just responsive?

Fix anything that doesn't meet the bar.
```

---

## TROUBLESHOOTING TIPS

If Claude Code gets confused or the output isn't right:

- **"The scroll animation is jerky"** → Ask it to increase the scroll distance (scrub area) and check that animations use transforms only
- **"The zoom doesn't focus on the right nail"** → Adjust the `nailFocus` x and y values
- **"The photo-to-illustration swap is visible"** → Push the peak blur higher, hold the nude tint fully opaque for longer across the swap frames
- **"The illustrated nail looks cartoonish"** → Ask for more subtle gradients, realistic proportions, and muted colours
- **"It looks like a template"** → Ask it to increase negative space, reduce font sizes, thin out borders, and remove any rounded card styling
- **"Mobile doesn't work"** → Ask it to specifically test at 375px width and fix overflow issues

---

## QUICK REFERENCE

| Element | Detail |
|---|---|
| Brand name | pressé (lowercase, accent on é) |
| Tagline | the nail edit |
| Primary background | #FAF7F2 (warm cream) |
| Primary text | #1A1714 (deep brown/almost-black) |
| Secondary text | #8A7F73 (muted brown) |
| Heading font | Playfair Display (Google Fonts) |
| Body font | Montserrat or Inter (Google Fonts) |
| Nail shape in photos | Almond |
| Domain (placeholder) | shoppresse.co.uk |
| Email (placeholder) | hello@shoppresse.co.uk |
