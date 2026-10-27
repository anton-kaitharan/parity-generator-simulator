# Parity Generator Simulator

An interactive, browser-only digital logic lab for a four-bit even/odd parity generator and checker.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To create a production bundle, run `npm run build`.

## Explore

- Toggle A, B, C, and D or use **Random** and **Reset**.
- Select even or odd parity and follow the changing signals through the three XOR gates.
- Review the calculation and the highlighted row in the complete truth table.
- Transmit a message, then click received bits to simulate a channel error.

The app has no backend. The interface uses inline SVG for its logic circuit and icons.
