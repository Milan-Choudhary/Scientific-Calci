# Scientific Calci

A browser-based scientific calculator with unit converters, click sounds, keyboard support, and an animated floating math background.

## ✨ What's New

The calculator just got a big upgrade — more math power and a fresh, lovable interface:

- **Inverse & extra functions** — `sin⁻¹`, `cos⁻¹`, `tan⁻¹`, `eˣ`, `10ˣ`, `x²`, `|x|` (absolute value), `1/x` (reciprocal), `n!` (factorial), and `mod`
- **`2nd` function key** — flip the trig, log and root keys to their inverse forms in one tap
- **Memory keys** — `MC`, `MR`, `M+`, `M−`, `MS` with an on-screen `M` indicator
- **`Ans` key** — instantly reuse your previous result in a new calculation
- **Calculation history** — a collapsible panel of recent calculations; click any entry to reuse its result, or clear them all (saved across reloads)
- **Light / Dark theme toggle** — pick the look you love, remembered next time
- **Copy to clipboard** — tap the display (or the `Copy` chip) to copy the current value, with a friendly toast
- **Persistent settings** — angle mode, sound, theme, memory and history all survive a page refresh
- **Refreshed "lovely" UI** — animated gradient backdrop, button ripple/lift feedback, glass panels, and toast notifications

## Features

- Scientific calculator with `sin`, `cos`, `tan`, inverse trig, `sqrt`, `cbrt`, `log`, `ln`, `eˣ`, `10ˣ`, powers, `x²`, factorial `n!`, `mod`, `|x|`, `1/x`, parentheses, percent, `pi`, and `e`
- `2nd` toggle to access inverse functions, plus `Ans`, memory keys (`MC`, `MR`, `M+`, `M−`, `MS`)
- Persistent calculation history panel — click an entry to reuse it
- `DEG` / `RAD` angle mode toggle and a Light / Dark theme toggle
- Keyboard input for digits, operators, parentheses, `!`, `Enter`, `Backspace`, `Escape`, and `%`
- Optional click sounds with a `Sound` / `Muted` toggle
- Copy the current value to the clipboard from the display
- Unit converters for temperature, weight, length, area, volume, speed, time, and currency
- Currency conversion uses Frankfurter live rates when available, with offline fallback estimates
- Responsive glass-style UI with an animated gradient and floating background symbols
- Settings (angle mode, theme, sound, memory, history) persist via `localStorage`
- Works by opening `index.html` directly, or through the included local dev server

## Run Locally

Open `index.html` directly in your browser.

Or run the local server:

```bash
node dev-server.cjs
```

Then visit:

```text
http://127.0.0.1:5173/index.html
```

## How To Use

### Calculator

Use the on-screen buttons or keyboard.

Examples:

```text
sin(30) = 0.5         when DEG mode is selected
asin(0.5) = 30        tap 2nd, then sin
sqrt(16) = 4
2^3 + pi
5! = 120              the x! key
1/x of 4 = 0.25       the 1/x key
17 mod 5 = 2
50% * 200
```

- Use `AC` to reset the calculator and `DEL` to remove the last input.
- Tap `2nd` to switch `sin`/`cos`/`tan` to inverse trig, `ln`→`eˣ`, `log`→`10ˣ`, and `√`→`x²`.
- Tap `Ans` to drop your previous result into a new expression.
- Use `MS` to store a value, `MR` to recall it, `M+`/`M−` to add/subtract, and `MC` to clear; an `M` badge shows when memory holds a value.
- Open the `History` panel to revisit recent calculations — click one to reuse its result.
- Use the theme toggle to switch between Dark and Light, and click the display (or `Copy`) to copy the current value.

### Converters

1. Choose a quantity type, such as Temperature, Weight, Length, or Currency.
2. Enter an amount.
3. Select the source and target units.
4. Use `Swap` to reverse the selected units.

For currency, the app tries to fetch live exchange rates from Frankfurter. If the network is unavailable, it uses built-in fallback estimates.

## Project Structure

```text
.
├── index.html          # App markup
├── style.css           # UI, layout, and animations
├── dev-server.cjs      # Simple local static server
└── src
    ├── main.js         # UI events, sounds, converters
    ├── operations.js   # Scientific expression parser/evaluator
    └── state.js        # Shared app state
```

## Tech Used

- HTML
- CSS
- Vanilla JavaScript
- Web Audio API for click sounds
- Frankfurter API for live currency rates

## Notes

- No build step is required.
- No API key is required for currency conversion.
- The currency fallback values are estimates and should not be used for financial decisions.
