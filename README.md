# Scientific Calci

A browser-based scientific calculator with unit converters, click sounds, keyboard support, and an animated floating math background.

## Features

- Scientific calculator with `sin`, `cos`, `tan`, `sqrt`, `log`, `ln`, powers, parentheses, percent, `pi`, and `e`
- `DEG` / `RAD` angle mode toggle
- Keyboard input for digits, operators, parentheses, `Enter`, `Backspace`, `Escape`, and `%`
- Optional click sounds with a `Sound` / `Muted` toggle
- Unit converters for temperature, weight, length, area, volume, speed, time, and currency
- Currency conversion uses Frankfurter live rates when available, with offline fallback estimates
- Responsive glass-style UI with floating background symbols
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
sin(30) = 0.5   when DEG mode is selected
sqrt(16) = 4
2^3 + pi
50% * 200
```

Use `AC` to reset the calculator and `DEL` to remove the last input.

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
