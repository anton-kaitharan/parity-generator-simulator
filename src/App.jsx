import { useEffect, useMemo, useState } from 'react';

const LABELS = ['A', 'B', 'C', 'D'];
const KEY_HINTS = ['1', '2', '3', '4'];
const xor = (...values) => values.reduce((sum, value) => sum ^ value, 0);
const binary = values => values.join('');

function Icon({ name, size = 16 }) {
  const paths = {
    activity: <path d="M3 12h4l3-8 4 16 3-8h4" />,
    down: <path d="M12 4v15m-6-6 6 6 6-6" />,
    right: <path d="M4 12h15m-6-6 6 6-6 6" />,
    book: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z" />
        <path d="M4 5v14m4-12h8" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    cpu: (
      <>
        <rect x="5" y="5" width="14" height="14" rx="2" />
        <path d="M9 9h6v6H9zM9 1v4m6-4v4M9 19v4m6-4v4M1 9h4m-4 6h4m14-6h4m-4 6h4" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5m0-9h.01" />
      </>
    ),
    radio: (
      <>
        <circle cx="12" cy="12" r="2" />
        <path d="M7.5 7.5a6.5 6.5 0 0 0 0 9m9 0a6.5 6.5 0 0 0 0-9M4 4a11.3 11.3 0 0 0 0 16m16 0a11.3 11.3 0 0 0 0-16" />
      </>
    ),
    reset: (
      <>
        <path d="M3 12a9 9 0 1 0 2.6-6.4L3 8" />
        <path d="M3 3v5h5" />
      </>
    ),
    shuffle: (
      <>
        <path d="m18 14 4 4-4 4m0-20 4 4-4 4M2 18h2.5a5 5 0 0 0 4-2l7-10a5 5 0 0 1 4-2H22M2 6h2.5a5 5 0 0 1 4 2l1 1m4 6 1 1a5 5 0 0 0 4 2H22" />
      </>
    ),
    signal: <path d="M2 20h.01M7 20v-4m5 4V10m5 10V6m5 14V3" />,
    alert: (
      <>
        <path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4m0 4h.01" />
      </>
    ),
    zap: <path d="m13 2-3 9h7l-6 11 2-9H6z" />,
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 4.4 1.6c-1.2 1.1-1.9 1.4-1.9 3m0 3h.01" />
      </>
    ),
    keyboard: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M18 13h.01M9 13h6" />
      </>
    ),
    spark: <path d="M12 3v4m0 10v4M3 12h4m10 0h4m-2.8-6.2-2.8 2.8m-6.8 6.8-2.8 2.8m0-12.4 2.8 2.8m6.8 6.8 2.8 2.8" />
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function Gate({ id, x, y, label, delayTag, out, inA, inB, active, selected, onSelect }) {
  return (
    <g
      className={`gate ${active ? 'gate-on' : ''} ${selected ? 'gate-selected' : ''}`}
      transform={`translate(${x} ${y})`}
      onClick={() => onSelect(selected ? null : id)}
      onMouseEnter={() => onSelect(id)}
      onMouseLeave={() => onSelect(null)}
      style={{ cursor: 'pointer' }}
    >
      <rect className="gate-hit" x="-18" y="-12" width="136" height="130" rx="10" fill="transparent" />
      <path className="gate-glow" d="M0 0 H38 C74 0 82 20 94 43 C82 66 74 86 38 86 H0 Z" />
      <path className="gate-body" d="M0 0 H38 C74 0 82 20 94 43 C82 66 74 86 38 86 H0 Z" />
      <path className="gate-extra" d="M-11 2 C1 23 1 63 -11 84" />
      <path className="gate-inner-arc" d="M0 2 C12 23 12 63 0 84" />
      <text className="gate-symbol" x="42" y="45">=1</text>
      <text className="gate-equation" x="42" y="62">{`${inA}⊕${inB}`}</text>
      <circle className="gate-node" cx="102" cy="43" r="4.5" />
      <text className="gate-name" x="44" y="106">{label}</text>
      <text className="gate-delay" x="44" y="-10">{delayTag}</text>
      <g className="gate-badge" transform="translate(96, 10)">
        <rect x="0" y="0" width="22" height="19" rx="4" />
        <text x="11" y="13">{out}</text>
      </g>
    </g>
  );
}

function Circuit({ bits, mode, result, onToggleBit, pulseKey }) {
  const [a, b, c, d] = bits;
  const x1 = xor(a, b);
  const x2 = xor(x1, c);
  const x3 = xor(x2, d);
  const odd = x3 ^ 1;
  const isOdd = mode === 'odd';
  const [hoveredGate, setHoveredGate] = useState(null);

  const gateDetails = {
    g1: {
      name: 'STAGE 01 · XOR_1',
      expr: `A (${a}) ⊕ B (${b}) = ${x1}`,
      desc: a !== b ? 'Inputs differ → Stage 1 outputs HIGH (1)' : 'Inputs match → Stage 1 outputs LOW (0)',
      delay: 't = 1τ'
    },
    g2: {
      name: 'STAGE 02 · XOR_2',
      expr: `X₁ (${x1}) ⊕ C (${c}) = ${x2}`,
      desc: x1 !== c ? '3-bit running parity is ODD → HIGH (1)' : '3-bit running parity is EVEN → LOW (0)',
      delay: 't = 2τ'
    },
    g3: {
      name: 'STAGE 03 · XOR_3',
      expr: `X₂ (${x2}) ⊕ D (${d}) = ${x3}`,
      desc: x2 !== d ? 'Total 1s in ABCD is ODD → P_even = 1' : 'Total 1s in ABCD is EVEN → P_even = 0',
      delay: 't = 3τ'
    }
  };

  const activeInfo = hoveredGate ? gateDetails[hoveredGate] : null;

  return (
    <div className="circuit-frame">
      <div className="circuit-head">
        <div className="circuit-head-left">
          <span className="circuit-tag">
            <span className="live-dot" />
            INTERACTIVE SCHEMATIC
          </span>
          <span className="circuit-divider" />
          <span className="circuit-note">Click input pins A–D to toggle · Hover gates to inspect</span>
        </div>
        <div className="circuit-timing-badges">
          <span className="timing-chip">3-STAGE CASCADE</span>
          <span className={`timing-chip mode-chip ${isOdd ? 'odd' : 'even'}`}>
            {isOdd ? 'XNOR / ODD TAP' : 'XOR / EVEN TAP'}
          </span>
        </div>
      </div>

      <div className="circuit-scroll">
        <svg
          key={pulseKey}
          className="circuit"
          viewBox="0 0 960 410"
          role="img"
          aria-label="Four input XOR circuit with three cascaded XOR gates"
        >
          <defs>
            <pattern id="minor-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="0.8" fill="rgba(148, 175, 190, 0.14)" />
            </pattern>
            <linearGradient id="gateGradOn" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#102925" />
              <stop offset="100%" stopColor="#0b181b" />
            </linearGradient>
            <linearGradient id="gateGradOff" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#111820" />
              <stop offset="100%" stopColor="#0b1016" />
            </linearGradient>
            <filter id="signalGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <rect width="960" height="410" fill="url(#minor-grid)" />

          {/* Stage zone guide lines */}
          <line className="stage-guide" x1="205" y1="24" x2="205" y2="386" />
          <line className="stage-guide" x1="420" y1="24" x2="420" y2="386" />
          <line className="stage-guide" x1="638" y1="24" x2="638" y2="386" />
          <line className="stage-guide" x1="795" y1="24" x2="795" y2="386" />

          {/* Base wires */}
          <path className={`wire s1 ${a ? 'active' : ''}`} d="M116 90 H168 V116 H216" />
          <path className={`wire s1 ${b ? 'active' : ''}`} d="M116 164 H168 V154 H216" />
          <path className={`wire s2 ${x1 ? 'active' : ''}`} d="M318 135 H374 V188 H430" />
          <path className={`wire s2 ${c ? 'active' : ''}`} d="M116 248 H374 V226 H430" />
          <path className={`wire s3 ${x2 ? 'active' : ''}`} d="M532 207 H590 V272 H648" />
          <path className={`wire s3 ${d ? 'active' : ''}`} d="M116 332 H590 V310 H648" />
          <path className={`wire s4 ${x3 ? 'active' : ''}`} d="M750 291 H796" />

          {/* Output branches */}
          <path className={`wire output-branch ${!isOdd ? 'branch-selected' : ''} ${x3 ? 'active' : ''}`} d="M796 291 V165 H854" />
          <path className={`wire output-branch ${isOdd ? 'branch-selected' : ''} ${odd ? 'active' : ''}`} d="M796 291 V345 H854" />

          {/* Animated current flow overlays for active wires */}
          {Boolean(a) && <path className="wire-flow s1" d="M116 90 H168 V116 H216" />}
          {Boolean(b) && <path className="wire-flow s1" d="M116 164 H168 V154 H216" />}
          {Boolean(x1) && <path className="wire-flow s2" d="M318 135 H374 V188 H430" />}
          {Boolean(c) && <path className="wire-flow s2" d="M116 248 H374 V226 H430" />}
          {Boolean(x2) && <path className="wire-flow s3" d="M532 207 H590 V272 H648" />}
          {Boolean(d) && <path className="wire-flow s3" d="M116 332 H590 V310 H648" />}
          {Boolean(x3) && <path className="wire-flow s4" d="M750 291 H796" />}
          {Boolean(x3) && !isOdd && <path className="wire-flow s4" d="M796 291 V165 H854" />}
          {Boolean(odd) && isOdd && <path className="wire-flow s4" d="M796 291 V345 H854" />}

          {/* Active Parity Tap highlight path */}
          <path
            className={`selection-line ${isOdd ? 'odd' : 'even'}`}
            d={isOdd ? 'M796 291 V345 H854' : 'M796 291 V165 H854'}
          />

          {/* Solder joint node at branch split */}
          <circle className={`branch-joint ${x3 ? 'lit' : ''}`} cx="796" cy="291" r="4" />

          {/* Inverter bubble symbol on Odd branch */}
          <g transform="translate(822, 345)">
            <polygon className={`inv-body ${odd ? 'lit' : ''}`} points="-10,-9 8,0 -10,9" />
            <circle className={`inv-bubble ${odd ? 'lit' : ''}`} cx="12" cy="0" r="3.5" />
            <text className="inv-label" x="0" y="-14">NOT</text>
          </g>

          {/* Interactive Input Terminals */}
          {[
            ['A', a, 0, 90],
            ['B', b, 1, 164],
            ['C', c, 2, 248],
            ['D', d, 3, 332]
          ].map(([name, val, idx, y]) => (
            <g
              key={name}
              className={`svg-input-node ${val ? 'node-on' : ''}`}
              onClick={() => onToggleBit(idx)}
              role="button"
              tabIndex={0}
              aria-label={`Toggle input ${name}`}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onToggleBit(idx);
                }
              }}
            >
              <rect className="input-pill" x="34" y={y - 16} width="82" height="32" rx="7" />
              <text className="wire-label" x="50" y={y + 5}>{name}</text>
              <circle className={`input-led ${val ? 'lit' : ''}`} cx="77" cy={y} r="4.5" />
              <text className={`wire-bit ${val ? 'bit-on' : ''}`} x="94" y={y + 5}>{val}</text>
            </g>
          ))}

          {/* Gates */}
          <Gate
            id="g1"
            x={216}
            y={92}
            label="XOR 01"
            delayTag="STAGE 1 · τ₁"
            out={x1}
            inA={a}
            inB={b}
            active={Boolean(x1)}
            selected={hoveredGate === 'g1'}
            onSelect={setHoveredGate}
          />
          <Gate
            id="g2"
            x={430}
            y={164}
            label="XOR 02"
            delayTag="STAGE 2 · τ₂"
            out={x2}
            inA={x1}
            inB={c}
            active={Boolean(x2)}
            selected={hoveredGate === 'g2'}
            onSelect={setHoveredGate}
          />
          <Gate
            id="g3"
            x={648}
            y={248}
            label="XOR 03"
            delayTag="STAGE 3 · τ₃"
            out={x3}
            inA={x2}
            inB={d}
            active={Boolean(x3)}
            selected={hoveredGate === 'g3'}
            onSelect={setHoveredGate}
          />

          {/* Output Terminals */}
          <g className={`output-terminal ${!isOdd ? 'terminal-selected' : ''}`} transform="translate(854, 137)">
            <rect className="terminal-box" x="0" y="0" width="84" height="56" rx="8" />
            <circle className={`output-led ${x3 ? 'lit' : ''}`} cx="20" cy="28" r="6" />
            <text className="output-title" x="36" y="23">EVEN</text>
            <text className={`output-value ${x3 ? 'val-on' : ''}`} x="36" y="43">{x3}</text>
          </g>

          <g className={`output-terminal ${isOdd ? 'terminal-selected' : ''}`} transform="translate(854, 317)">
            <rect className="terminal-box" x="0" y="0" width="84" height="56" rx="8" />
            <circle className={`output-led ${odd ? 'lit' : ''}`} cx="20" cy="28" r="6" />
            <text className="output-title" x="36" y="23">ODD</text>
            <text className={`output-value ${odd ? 'val-on' : ''}`} x="36" y="43">{odd}</text>
          </g>

          <text className="output-selected" x="936" y="42" textAnchor="end">
            ACTIVE TAP: {isOdd ? 'ODD (P_odd)' : 'EVEN (P_even)'} = {result}
          </text>
        </svg>
      </div>

      <div className="circuit-legend">
        <div className="legend-left">
          <span><i className="legend-dot on" /> HIGH (1) · 5.0V</span>
          <span><i className="legend-dot" /> LOW (0) · 0.0V</span>
          <span><i className="legend-dot parity" /> SELECTED TAP</span>
        </div>
        <div className="legend-inspector">
          {activeInfo ? (
            <span className="inspector-live">
              <strong>{activeInfo.name}</strong>
              <span className="inspector-sep">·</span>
              <code>{activeInfo.expr}</code>
              <span className="inspector-sep">·</span>
              <span>{activeInfo.desc}</span>
            </span>
          ) : (
            <span className="legend-right">
              <span className="mono">P = A ⊕ B ⊕ C ⊕ D{isOdd ? ' ⊕ 1' : ''}</span> · Hover any gate for node analysis
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [bits, setBits] = useState([1, 0, 1, 1]);
  const [mode, setMode] = useState('even');
  const [received, setReceived] = useState([1, 0, 1, 1, 1]);
  const [hasTransmitted, setHasTransmitted] = useState(true);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const [tableFilter, setTableFilter] = useState('all');

  const parityXor = useMemo(() => xor(...bits), [bits]);
  const even = parityXor;
  const odd = parityXor ^ 1;
  const parity = mode === 'even' ? even : odd;
  const ones = bits.reduce((s, b) => s + b, 0);
  const outputData = useMemo(() => [...bits, parity], [bits, parity]);
  const step1 = xor(bits[0], bits[1]);
  const step2 = xor(step1, bits[2]);

  const checkParity = received ? xor(...received) : null;
  const expectedSyndrome = mode === 'even' ? 0 : 1;
  const errorDetected = received ? checkParity !== expectedSyndrome : false;

  // Compare transmitted vs received to know actual bit flips
  const flippedIndices = useMemo(() => {
    if (!received) return [];
    return received.reduce((acc, bit, idx) => (bit !== outputData[idx] ? [...acc, idx] : acc), []);
  }, [received, outputData]);

  const undetectedCollision = !errorDetected && flippedIndices.length > 0;

  const triggerPulse = () => setPulseKey(k => k + 1);

  const toggleBit = index => {
    setBits(old => {
      const next = old.map((bit, i) => (i === index ? bit ^ 1 : bit));
      return next;
    });
    triggerPulse();
  };

  const loadVector = newBits => {
    setBits(newBits);
    const nextParity = mode === 'even' ? xor(...newBits) : xor(...newBits) ^ 1;
    setReceived([...newBits, nextParity]);
    setHasTransmitted(true);
    triggerPulse();
  };

  const transmit = () => {
    setIsTransmitting(true);
    setReceived([...outputData]);
    setHasTransmitted(true);
    setTimeout(() => setIsTransmitting(false), 520);
  };

  const injectErrors = count => {
    const base = [...outputData];
    const indices = [0, 1, 2, 3, 4];
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    for (let k = 0; k < count; k++) {
      base[indices[k]] ^= 1;
    }
    setIsTransmitting(true);
    setReceived(base);
    setHasTransmitted(true);
    setTimeout(() => setIsTransmitting(false), 450);
  };

  const reset = () => {
    setBits([0, 0, 0, 0]);
    setMode('even');
    setReceived([0, 0, 0, 0, 0]);
    setHasTransmitted(true);
    triggerPulse();
  };

  const randomize = () => {
    const nextBits = Array.from({ length: 4 }, () => Math.round(Math.random()));
    const nextP = mode === 'even' ? xor(...nextBits) : xor(...nextBits) ^ 1;
    setBits(nextBits);
    setReceived([...nextBits, nextP]);
    setHasTransmitted(true);
    triggerPulse();
  };

  // Sync parity bit when switching mode if no manual errors are active
  const switchMode = nextMode => {
    setMode(nextMode);
    const nextP = nextMode === 'even' ? even : odd;
    if (flippedIndices.length === 0) {
      setReceived([...bits, nextP]);
    }
    triggerPulse();
  };

  // Keyboard shortcuts for effortless hardware lab feel
  useEffect(() => {
    const onKeyDown = e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const key = e.key.toLowerCase();
      if (key === '1' || key === 'a') toggleBit(0);
      else if (key === '2' || key === 'b') toggleBit(1);
      else if (key === '3' || key === 'c') toggleBit(2);
      else if (key === '4' || key === 'd') toggleBit(3);
      else if (key === 'm') switchMode(mode === 'even' ? 'odd' : 'even');
      else if (key === 'r') randomize();
      else if (key === 't') transmit();
      else if (key === 'e') injectErrors(1);
      else if (key === '0') reset();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const truthRows = useMemo(() => {
    return Array.from({ length: 16 }, (_, n) => {
      const row = [(n >> 3) & 1, (n >> 2) & 1, (n >> 1) & 1, n & 1];
      const active = row.every((v, i) => v === bits[i]);
      const pEven = xor(...row);
      const pOdd = pEven ^ 1;
      const rowOnes = row.reduce((s, v) => s + v, 0);
      return { n, row, active, pEven, pOdd, rowOnes };
    }).filter(item => {
      if (tableFilter === 'even') return item.pEven === 0;
      if (tableFilter === 'odd') return item.pEven === 1;
      return true;
    });
  }, [bits, tableFilter]);

  return (
    <main className="app-shell">
      <div className="ambient-glow" aria-hidden="true" />

      <header className="topbar">
        <a className="brand" href="#top">
          <span className="brand-icon">
            <Icon name="cpu" size={17} />
          </span>
          <span>
            LOGIC<span className="brand-light">LAB</span>
          </span>
          <span className="brand-version">v2.4</span>
        </a>

        <nav className="top-nav" aria-label="Section navigation">
          <a href="#inputs">Inputs</a>
          <a href="#circuit">Schematic</a>
          <a href="#channel">Channel</a>
          <a href="#truth-table">Truth Table</a>
        </nav>

        <div className="top-meta">
          <span className="status-pill">
            <span className="live-dot" />
            REALTIME · 0ms
          </span>
          <span className="top-divider" />
          <span className="course-label">4-BIT PARITY LAB</span>
        </div>
      </header>

      <div id="top" className="content">
        {/* Minimal Hero Header */}
        <section className="hero">
          <div className="eyebrow">
            <span className="eyebrow-pill">
              <Icon name="spark" size={12} /> COMBINATIONAL LOGIC &amp; ERROR DETECTION
            </span>
          </div>
          <h1>
            Parity Generator <span>&amp; Checker</span>
          </h1>
          <p className="hero-subtitle">
            Toggle 4-bit logic signals, trace real-time XOR propagation, and test single vs. multi-bit fault detection across a noisy channel.
          </p>

          <div className="shortcut-bar" aria-label="Keyboard shortcuts">
            <span className="shortcut-item"><kbd>1</kbd>–<kbd>4</kbd> Toggle A–D</span>
            <span className="shortcut-item"><kbd>M</kbd> Mode</span>
            <span className="shortcut-item"><kbd>R</kbd> Random</span>
            <span className="shortcut-item"><kbd>E</kbd> Inject Noise</span>
            <span className="shortcut-item"><kbd>0</kbd> Reset</span>
          </div>
        </section>

        {/* 01: Input Control Stage */}
        <section className="input-section panel" id="inputs">
          <div className="section-top">
            <div>
              <div className="section-kicker">
                01 <span>/</span> INPUT VECTOR
              </div>
              <h2>Data word switches</h2>
            </div>

            <div className="action-buttons">
              <div className="mode-toggle" role="group" aria-label="Parity mode">
                <button
                  className={mode === 'even' ? 'selected' : ''}
                  onClick={() => switchMode('even')}
                >
                  <span className="mode-dot" /> Even Parity
                </button>
                <button
                  className={mode === 'odd' ? 'selected' : ''}
                  onClick={() => switchMode('odd')}
                >
                  <span className="mode-dot" /> Odd Parity
                </button>
              </div>
              <button className="button secondary" onClick={randomize} title="Shortcut: R">
                <Icon name="shuffle" size={14} /> Random
              </button>
              <button className="button secondary" onClick={reset} title="Shortcut: 0">
                <Icon name="reset" size={14} /> Reset
              </button>
            </div>
          </div>

          <div className="controls-row">
            {bits.map((bit, i) => (
              <button
                key={i}
                className={`switch-card ${bit ? 'switch-on' : ''}`}
                onClick={() => toggleBit(i)}
                aria-label={`Toggle ${LABELS[i]} to ${bit ^ 1}`}
                aria-pressed={Boolean(bit)}
              >
                <div className="switch-top">
                  <span className="switch-label">
                    {LABELS[i]}
                    <span className="switch-pin">BIT {3 - i}</span>
                  </span>
                  <kbd className="key-badge">{KEY_HINTS[i]}</kbd>
                </div>

                <div className="switch-bottom">
                  <span className={`switch-state ${bit ? 'state-on' : ''}`}>
                    <span className="state-led" />
                    {bit ? 'HIGH · 5V' : 'LOW · 0V'}
                  </span>
                  <span className="switch-control">
                    <span className="switch-track">
                      <span className="switch-thumb" />
                    </span>
                    <span key={bit} className="switch-value">{bit}</span>
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Live Frame Telemetry Strip */}
          <div className="telemetry-bar">
            <div className="telemetry-group">
              <span className="readout-label">5-BIT FRAME PACKET</span>
              <div className="frame-strip">
                {bits.map((b, i) => (
                  <button
                    key={i}
                    className={`frame-bit ${b ? 'active' : ''}`}
                    onClick={() => toggleBit(i)}
                    title={`Click to toggle ${LABELS[i]}`}
                  >
                    <span className="frame-val">{b}</span>
                    <small>{LABELS[i]}</small>
                  </button>
                ))}
                <span className="frame-sep" aria-hidden="true">+</span>
                <div className={`frame-bit parity-cell ${parity ? 'active' : ''}`}>
                  <span className="frame-val">{parity}</span>
                  <small>P<sub>{mode[0]}</sub></small>
                </div>
              </div>
            </div>

            <div className="telemetry-metrics">
              <div className="metric-box">
                <span className="readout-label">DECIMAL / HEX</span>
                <span className="metric-value">
                  {parseInt(binary(bits), 2)}
                  <small>0x{parseInt(binary(bits), 2).toString(16).toUpperCase()}</small>
                </span>
              </div>
              <div className="metric-box">
                <span className="readout-label">INPUT 1s (WEIGHT)</span>
                <span className="metric-value">
                  {ones}<small> / 4 ({ones % 2 === 0 ? 'EVEN' : 'ODD'})</small>
                </span>
              </div>
              <div className="metric-box highlight-metric">
                <span className="readout-label">GENERATED PARITY</span>
                <span className="metric-value parity-accent">
                  P = {parity}
                  <small>{(ones + parity) % 2 === 0 ? 'Σ EVEN' : 'Σ ODD'}</small>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 02: Interactive Logic Circuit */}
        <section className="circuit-section" id="circuit">
          <Circuit
            bits={bits}
            mode={mode}
            result={parity}
            onToggleBit={toggleBit}
            pulseKey={pulseKey}
          />
        </section>

        {/* Signal Breakdown & Equation Cards */}
        <section className="results-grid">
          <article className="result-card panel">
            <div className="result-head">
              <div>
                <div className="section-kicker">GENERATOR OUTPUT</div>
                <h2>{mode === 'even' ? 'Even' : 'Odd'} Parity Synthesis</h2>
              </div>
              <span className="result-chip">
                P<sub>{mode}</sub> = {parity}
              </span>
            </div>

            <div className="result-main">
              <div key={`${mode}-${parity}`} className={`parity-orb ${parity ? 'orb-high' : 'orb-low'}`}>
                <span className="parity-bit">{parity}</span>
                <span className="orb-sub">{parity ? 'LOGIC HIGH' : 'LOGIC LOW'}</span>
              </div>
              <div className="result-explanation">
                <span className="result-status">
                  <span className="live-dot" />
                  {ones} DATA ONES + {parity} PARITY BIT = {ones + parity} TOTAL ONES
                </span>
                <p>
                  {mode === 'even'
                    ? ones % 2 === 0
                      ? 'Input already has an even number of 1s, so P = 0 preserves even parity.'
                      : 'Input has an odd number of 1s, so P = 1 brings the total 1-count to an even number.'
                    : ones % 2 === 1
                    ? 'Input already has an odd number of 1s, so P = 0 preserves odd parity.'
                    : 'Input has an even number of 1s, so P = 1 brings the total 1-count to an odd number.'}
                </p>
                <div className="boolean-formula">
                  <code>
                    P<sub>{mode}</sub> = {bits[0]} ⊕ {bits[1]} ⊕ {bits[2]} ⊕ {bits[3]}
                    {mode === 'odd' ? ' ⊕ 1' : ''} = <strong>{parity}</strong>
                  </code>
                </div>
              </div>
            </div>
          </article>

          <article className="steps-card panel">
            <div className="result-head">
              <div>
                <div className="section-kicker">PROPAGATION TRACE</div>
                <h2>Gate-by-gate evaluation</h2>
              </div>
              <span className="result-chip subtle-chip">3 XOR LEVELS</span>
            </div>

            <div className="calculation">
              <div className={`calc-row ${step1 ? 'row-high' : ''}`}>
                <span className="calc-number">τ₁</span>
                <span className="calc-label">Stage 1 · A ⊕ B</span>
                <span className="calc-equation">
                  <b>{bits[0]}</b> ⊕ <b>{bits[1]}</b> = <strong>{step1}</strong>
                </span>
              </div>
              <div className={`calc-row ${step2 ? 'row-high' : ''}`}>
                <span className="calc-number">τ₂</span>
                <span className="calc-label">Stage 2 · X₁ ⊕ C</span>
                <span className="calc-equation">
                  <b>{step1}</b> ⊕ <b>{bits[2]}</b> = <strong>{step2}</strong>
                </span>
              </div>
              <div className={`calc-row ${even ? 'row-high' : ''}`}>
                <span className="calc-number">τ₃</span>
                <span className="calc-label">Stage 3 · X₂ ⊕ D</span>
                <span className="calc-equation">
                  <b>{step2}</b> ⊕ <b>{bits[3]}</b> = <strong>{even}</strong>
                </span>
              </div>
              {mode === 'odd' && (
                <div className="calc-row inversion">
                  <span className="calc-number">τ₄</span>
                  <span className="calc-label">Inverter · X̄₃</span>
                  <span className="calc-equation">
                    NOT <b>{even}</b> = <strong>{odd}</strong>
                  </span>
                </div>
              )}
            </div>

            <div className="total-check">
              <span>
                <Icon name="check" size={14} /> FRAME INVARIANT ({mode.toUpperCase()} RULE)
              </span>
              <strong>
                {ones + parity} ONES <small>{(ones + parity) % 2 === 0 ? 'EVEN' : 'ODD'}</small>
              </strong>
            </div>
          </article>
        </section>

        {/* 03: Transmission Channel & Receiver Syndrome Checker */}
        <section className="checker-section panel" id="channel">
          <div className="section-top">
            <div>
              <div className="section-kicker">
                03 <span>/</span> NOISY CHANNEL &amp; SYNDROME CHECKER
              </div>
              <h2>Transmit &amp; inject bit errors</h2>
              <p className="section-desc">
                Click any received bit below to flip it in transit, or use the noise injectors to test single vs. double bit flips.
              </p>
            </div>
            <div className="channel-actions">
              <button className="button secondary" onClick={() => injectErrors(1)} title="Inject 1 random bit error (Shortcut: E)">
                <Icon name="zap" size={14} /> +1 Bit Noise
              </button>
              <button className="button secondary" onClick={() => injectErrors(2)} title="Inject 2 random bit errors (Demonstrates parity blind spot)">
                <Icon name="activity" size={14} /> +2 Bit Noise
              </button>
              <button className="button transmit-button" onClick={transmit} title="Transmit clean frame (Shortcut: T)">
                <Icon name="radio" size={15} /> Sync Clean TX
              </button>
            </div>
          </div>

          {hasTransmitted && received && (
            <div className="channel-content">
              {/* Visual TX -> Channel -> RX Pipeline */}
              <div className="channel-pipeline">
                <div className="pipeline-node tx-node">
                  <span className="node-tag">TX SENDER</span>
                  <code>{binary(outputData)}</code>
                </div>

                <div className={`pipeline-bus ${isTransmitting ? 'bus-animating' : ''} ${flippedIndices.length > 0 ? 'bus-noisy' : ''}`}>
                  <div className="bus-line">
                    <span className="bus-packet" />
                  </div>
                  <span className="bus-caption">
                    {flippedIndices.length === 0
                      ? 'CLEAN CHANNEL · 0 BIT FLIPS'
                      : `${flippedIndices.length} BIT${flippedIndices.length > 1 ? 'S' : ''} CORRUPTED IN TRANSIT`}
                  </span>
                </div>

                <div className={`pipeline-node rx-node ${errorDetected ? 'rx-error' : undetectedCollision ? 'rx-warn' : 'rx-ok'}`}>
                  <span className="node-tag">RX RECEIVER</span>
                  <code>{binary(received)}</code>
                </div>
              </div>

              {/* Interactive RX Bit Flipper */}
              <div className="received-row">
                <div className="received-label">
                  <span className="readout-label">RECEIVED 5-BIT WORD (CLICK ANY BIT TO CORRUPT / REPAIR)</span>
                  <span className="received-sub">
                    Syndrome check: <code>A&apos; ⊕ B&apos; ⊕ C&apos; ⊕ D&apos; ⊕ P&apos; = {checkParity}</code>
                  </span>
                </div>

                <div className="received-bits">
                  {received.map((bit, i) => {
                    const isFlipped = bit !== outputData[i];
                    return (
                      <button
                        key={i}
                        className={`received-bit ${bit ? 'active' : ''} ${i === 4 ? 'parity-cell' : ''} ${isFlipped ? 'bit-corrupted' : ''}`}
                        onClick={() => setReceived(old => old.map((b, n) => (n === i ? b ^ 1 : b)))}
                        aria-label={`Flip received ${i === 4 ? 'parity' : LABELS[i]} bit`}
                      >
                        {isFlipped && <span className="flip-badge">FLIPPED</span>}
                        <span className="rx-bit-val">{bit}</span>
                        <small>{i === 4 ? `P (${mode[0]})` : LABELS[i]}</small>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Receiver Diagnostic Banner */}
              <div
                className={`checker-status ${
                  errorDetected ? 'has-error' : undetectedCollision ? 'has-warning' : 'no-error'
                }`}
              >
                <div className="status-icon-wrap">
                  {errorDetected || undetectedCollision ? (
                    <Icon name="alert" size={20} />
                  ) : (
                    <Icon name="check" size={20} />
                  )}
                </div>
                <div className="status-copy">
                  <strong>
                    {errorDetected
                      ? `Parity Error Detected (Syndrome = ${checkParity})`
                      : undetectedCollision
                      ? `Undetected ${flippedIndices.length}-Bit Error! (Syndrome = ${checkParity})`
                      : `Frame Verified Integrity OK (Syndrome = ${checkParity})`}
                  </strong>
                  <span>
                    {errorDetected
                      ? `Receiver detected ${flippedIndices.length} flipped bit(s) [${flippedIndices
                          .map(i => (i === 4 ? 'P' : LABELS[i]))
                          .join(', ')}]. Total 1s is now ${received.reduce((s, b) => s + b, 0)}, violating ${mode} parity.`
                      : undetectedCollision
                      ? `${flippedIndices.length} bits flipped [${flippedIndices
                          .map(i => (i === 4 ? 'P' : LABELS[i]))
                          .join(', ')}]! Even numbers of bit errors cancel out in XOR, masking the corruption.`
                      : `All 5 received bits match the ${mode} parity invariant. Total 1s = ${received.reduce(
                          (s, b) => s + b,
                          0
                        )}.`}
                  </span>
                </div>
                <span className="status-mode">{mode.toUpperCase()} CHECK</span>
              </div>
            </div>
          )}

          <div className="checker-foot">
            <Icon name="info" size={14} />
            <span>
              <strong>Engineering Note:</strong> Single-bit parity has a Hamming distance of <code>d_min = 2</code>. It catches 100% of odd-bit errors (1, 3, 5 flips), but even-bit errors (2, 4 flips) preserve parity and pass silently.
            </span>
          </div>
        </section>

        {/* 04: Interactive Truth Table */}
        <section className="truth-section" id="truth-table">
          <div className="section-top">
            <div>
              <div className="section-kicker">
                04 <span>/</span> COMPLETE STATE SPACE
              </div>
              <h2>Interactive Truth Table</h2>
              <p className="section-desc">
                Click any of the 16 input combinations below to load that vector directly into the circuit.
              </p>
            </div>

            <div className="table-controls">
              <div className="filter-pills" role="group" aria-label="Filter truth table">
                <button
                  className={tableFilter === 'all' ? 'active' : ''}
                  onClick={() => setTableFilter('all')}
                >
                  All (16)
                </button>
                <button
                  className={tableFilter === 'even' ? 'active' : ''}
                  onClick={() => setTableFilter('even')}
                >
                  P<sub>even</sub> = 0
                </button>
                <button
                  className={tableFilter === 'odd' ? 'active' : ''}
                  onClick={() => setTableFilter('odd')}
                >
                  P<sub>even</sub> = 1
                </button>
              </div>
            </div>
          </div>

          <div className="table-wrap panel">
            <table>
              <thead>
                <tr>
                  <th className="row-id">DEC</th>
                  <th>A</th>
                  <th>B</th>
                  <th>C</th>
                  <th>D</th>
                  <th className="weight-col">1s COUNT</th>
                  <th className={`split-col ${mode === 'even' ? 'col-active' : ''}`}>EVEN (P_even)</th>
                  <th className={mode === 'odd' ? 'col-active' : ''}>ODD (P_odd)</th>
                </tr>
              </thead>
              <tbody>
                {truthRows.map(({ n, row, active, pEven, pOdd, rowOnes }) => (
                  <tr
                    key={n}
                    className={active ? 'current-row' : ''}
                    onClick={() => loadVector(row)}
                    title={`Click to load ABCD = ${row.join('')}`}
                  >
                    <td className="row-id">
                      <span>{String(n).padStart(2, '0')}</span>
                    </td>
                    {row.map((v, i) => (
                      <td key={i} className={v ? 'table-one' : 'table-zero'}>
                        {v}
                      </td>
                    ))}
                    <td className="weight-col">
                      <span className="weight-pill">{rowOnes}</span>
                    </td>
                    <td className={`split-col ${mode === 'even' ? 'col-active' : ''} ${pEven ? 'table-parity-one' : ''}`}>
                      {pEven}
                    </td>
                    <td className={`${mode === 'odd' ? 'col-active' : ''} ${pOdd ? 'table-parity-one' : ''}`}>
                      {pOdd}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 05: Quick Theory Cards */}
        <section className="theory-section">
          <div className="section-top">
            <div>
              <div className="section-kicker">
                05 <span>/</span> ARCHITECTURE NOTES
              </div>
              <h2>Core Principles</h2>
            </div>
            <span className="theory-mark">
              <Icon name="book" size={15} /> IC 74180 / 74280 EQUIVALENT
            </span>
          </div>

          <div className="theory-grid">
            <article className="theory-card">
              <span className="theory-icon">⊕</span>
              <h3>Modulo-2 Addition</h3>
              <p>
                An XOR gate computes addition modulo 2. Cascading <code>N - 1</code> two-input XOR gates extracts the parity of an <code>N</code>-bit bus in <code>O(N)</code> linear or <code>O(log N)</code> tree depth.
              </p>
            </article>
            <article className="theory-card">
              <span className="theory-icon">01</span>
              <h3>Even vs. Odd Selection</h3>
              <p>
                Even parity sets <code>P = A ⊕ B ⊕ C ⊕ D</code>. Odd parity simply inverts the final stage (XNOR), often chosen in synchronous buses to guarantee at least one logic <code>1</code> per frame.
              </p>
            </article>
            <article className="theory-card">
              <span className="theory-icon">
                <Icon name="zap" size={16} />
              </span>
              <h3>Syndrome Verification</h3>
              <p>
                The receiver XORs all 5 bits together: <code>S = A&apos; ⊕ B&apos; ⊕ C&apos; ⊕ D&apos; ⊕ P&apos;</code>. Because <code>X ⊕ X = 0</code>, an intact even-parity frame always yields <code>S = 0</code>.
              </p>
            </article>
            <article className="theory-card">
              <span className="theory-icon">
                <Icon name="activity" size={16} />
              </span>
              <h3>Hardware Applications</h3>
              <p>
                Found in UART serial frames, PCI buses, L1 CPU caches, and RAID arrays. Where error correction is also required, engineers extend parity into Hamming ECC codes.
              </p>
            </article>
          </div>
        </section>

        <footer className="footer">
          <span className="brand">
            <span className="brand-icon">
              <Icon name="cpu" size={15} />
            </span>
            <span>
              LOGIC<span className="brand-light">LAB</span>
            </span>
          </span>
          <span>4-BIT PARITY GENERATOR &amp; SYNDROME CHECKER</span>
          <span>
            DIGITAL ELECTRONICS <span className="footer-dot">·</span> INTERACTIVE LAB
          </span>
        </footer>
      </div>
    </main>
  );
}

export default App;
