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
    spark: <path d="M12 3v4m0 10v4M3 12h4m10 0h4m-2.8-6.2-2.8 2.8m-6.8 6.8-2.8 2.8m0-12.4 2.8 2.8m6.8 6.8 2.8 2.8" />
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function LogicCube({ bits, parity, size = 56 }) {
  const [a, b, c, d] = bits;
  const palette = [
    a ? '#ff0055' : '#e2e8f0',
    b ? '#00d84a' : '#ffffff',
    c ? '#2563eb' : '#f1f5f9',
    d ? '#fff200' : '#e2e8f0',
    parity ? '#b86bff' : '#ffffff',
    (a ^ b) ? '#ff7a00' : '#f1f5f9',
    (c ^ d) ? '#00d84a' : '#e2e8f0',
    (b ^ c) ? '#ff00ff' : '#ffffff',
    parity ? '#2563eb' : '#cbd5e1'
  ];

  const transforms = [
    'translateZ(var(--half))',
    'rotateY(180deg) translateZ(var(--half))',
    'rotateY(90deg) translateZ(var(--half))',
    'rotateY(-90deg) translateZ(var(--half))',
    'rotateX(90deg) translateZ(var(--half))',
    'rotateX(-90deg) translateZ(var(--half))'
  ];

  return (
    <div
      className="logic-cube-wrap"
      style={{ '--cube-size': `${size}px` }}
      role="img"
      aria-label="3D rotating logic cube"
    >
      <div className="logic-cube">
        {transforms.map((transform, faceIdx) => (
          <div
            key={faceIdx}
            className="logic-cube-face"
            style={{ transform }}
          >
            {palette.map((color, cellIdx) => (
              <div
                key={cellIdx}
                className="logic-cube-cell"
                style={{
                  background: palette[(cellIdx + faceIdx * 2) % palette.length]
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
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
        <rect x="0" y="0" width="22" height="19" rx="6" />
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
            LIVE LOGIC DIAGRAM
          </span>
          <span className="circuit-divider" />
          <span className="circuit-note">Click input pins A–D to toggle · Hover any XOR gate to inspect</span>
        </div>
        <div className="circuit-timing-badges">
          <span className="timing-chip">3-STAGE CASCADE</span>
          <span className={`timing-chip mode-chip ${isOdd ? 'odd' : 'even'}`}>
            {isOdd ? 'XNOR · ODD TAP' : 'XOR · EVEN TAP'}
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
              <circle cx="12" cy="12" r="1.1" fill="rgba(148, 163, 184, 0.28)" />
            </pattern>
            <linearGradient id="gateGradOn" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f3e8ff" />
              <stop offset="100%" stopColor="#e0e7ff" />
            </linearGradient>
            <linearGradient id="gateGradOff" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f8fafc" />
            </linearGradient>
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
              <rect className="input-pill" x="34" y={y - 16} width="82" height="32" rx="16" />
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
            <rect className="terminal-box" x="0" y="0" width="84" height="56" rx="14" />
            <circle className={`output-led ${x3 ? 'lit' : ''}`} cx="20" cy="28" r="6" />
            <text className="output-title" x="36" y="23">EVEN</text>
            <text className={`output-value ${x3 ? 'val-on' : ''}`} x="36" y="43">{x3}</text>
          </g>

          <g className={`output-terminal ${isOdd ? 'terminal-selected' : ''}`} transform="translate(854, 317)">
            <rect className="terminal-box" x="0" y="0" width="84" height="56" rx="14" />
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

  const flippedIndices = useMemo(() => {
    if (!received) return [];
    return received.reduce((acc, bit, idx) => (bit !== outputData[idx] ? [...acc, idx] : acc), []);
  }, [received, outputData]);

  const undetectedCollision = !errorDetected && flippedIndices.length > 0;

  const triggerPulse = () => setPulseKey(k => k + 1);

  const toggleBit = index => {
    setBits(old => old.map((bit, i) => (i === index ? bit ^ 1 : bit)));
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

  const switchMode = nextMode => {
    setMode(nextMode);
    const nextP = nextMode === 'even' ? even : odd;
    if (flippedIndices.length === 0) {
      setReceived([...bits, nextP]);
    }
    triggerPulse();
  };

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
      <div className="ambient-blob blob-blue" aria-hidden="true" />
      <div className="ambient-blob blob-purple" aria-hidden="true" />
      <div className="ambient-blob blob-mint" aria-hidden="true" />

      <header className="topbar">
        <a className="brand" href="#top">
          <LogicCube bits={bits} parity={parity} size={28} />
          <span className="brand-word">logiclab</span>
          <span className="brand-version">4-bit</span>
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
            SIMULATOR ONLINE
          </span>
        </div>
      </header>

      <div id="top" className="content">
        <section className="hero">
          <div className="hero-cube-row">
            <LogicCube bits={bits} parity={parity} size={74} />
          </div>

          <h1>
            Parity Generator{' '}
            <span className="highlight-wrap">
              <span className="highlight-text">&amp; Checker</span>
              <span className="highlight-bar" aria-hidden="true" />
            </span>
          </h1>

          <p className="hero-subtitle">
            Toggle 4-bit signals, watch XOR gates cascade in real time, and see how a single parity bit catches transmission noise.
          </p>

          <div className="learning-contrast" aria-label="Learning approach">
            <span className="contrast-old">Dry truth tables, Rote formulas, Guessing</span>
            <span className="contrast-arrow">→</span>
            <span className="contrast-new">
              Interactive switches, Visual signals,{' '}
              <span className="highlight-wrap inline-highlight">
                <span className="highlight-text">Intuition</span>
                <span className="highlight-bar small-bar" aria-hidden="true" />
              </span>
            </span>
          </div>

          <div className="shortcut-bar" aria-label="Keyboard shortcuts">
            <span className="shortcut-item"><kbd>1</kbd>–<kbd>4</kbd> Toggle A–D</span>
            <span className="shortcut-item"><kbd>M</kbd> Even/Odd</span>
            <span className="shortcut-item"><kbd>R</kbd> Randomize</span>
            <span className="shortcut-item"><kbd>E</kbd> Inject Noise</span>
            <span className="shortcut-item"><kbd>0</kbd> Reset</span>
          </div>
        </section>

        {/* 01: Input Control Stage */}
        <section className="input-section panel" id="inputs">
          <div className="section-top">
            <div>
              <div className="section-kicker">
                01 <span>·</span> INPUT STAGE
              </div>
              <h2>Set your 4-bit input word</h2>
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
                    <span className="switch-pin">PIN {3 - i}</span>
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
                <span className="readout-label">DEC / HEX</span>
                <span className="metric-value">
                  {parseInt(binary(bits), 2)}
                  <small>0x{parseInt(binary(bits), 2).toString(16).toUpperCase()}</small>
                </span>
              </div>
              <div className="metric-box">
                <span className="readout-label">ONES COUNT</span>
                <span className="metric-value">
                  {ones}<small> / 4 ({ones % 2 === 0 ? 'EVEN' : 'ODD'})</small>
                </span>
              </div>
              <div className="metric-box highlight-metric">
                <span className="readout-label">PARITY BIT</span>
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
                <div className="section-kicker">GENERATED OUTPUT</div>
                <h2>{mode === 'even' ? 'Even' : 'Odd'} parity synthesis</h2>
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
                      ? 'Input already has an even number of 1s, so P = 0 keeps the total count even.'
                      : 'Input has an odd number of 1s, so P = 1 brings the total count of 1s to an even number.'
                    : ones % 2 === 1
                    ? 'Input already has an odd number of 1s, so P = 0 keeps the total count odd.'
                    : 'Input has an even number of 1s, so P = 1 brings the total count of 1s to an odd number.'}
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
                <div className="section-kicker">SIGNAL BREAKDOWN</div>
                <h2>Step-by-step XOR cascade</h2>
              </div>
              <span className="result-chip subtle-chip">3 GATES</span>
            </div>

            <div className="calculation">
              <div className={`calc-row ${step1 ? 'row-high' : ''}`}>
                <span className="calc-number">01</span>
                <span className="calc-label">Stage 1 · A ⊕ B</span>
                <span className="calc-equation">
                  <b>{bits[0]}</b> ⊕ <b>{bits[1]}</b> = <strong>{step1}</strong>
                </span>
              </div>
              <div className={`calc-row ${step2 ? 'row-high' : ''}`}>
                <span className="calc-number">02</span>
                <span className="calc-label">Stage 2 · X₁ ⊕ C</span>
                <span className="calc-equation">
                  <b>{step1}</b> ⊕ <b>{bits[2]}</b> = <strong>{step2}</strong>
                </span>
              </div>
              <div className={`calc-row ${even ? 'row-high' : ''}`}>
                <span className="calc-number">03</span>
                <span className="calc-label">Stage 3 · X₂ ⊕ D</span>
                <span className="calc-equation">
                  <b>{step2}</b> ⊕ <b>{bits[3]}</b> = <strong>{even}</strong>
                </span>
              </div>
              {mode === 'odd' && (
                <div className="calc-row inversion">
                  <span className="calc-number">04</span>
                  <span className="calc-label">Inverter · NOT X₃</span>
                  <span className="calc-equation">
                    NOT <b>{even}</b> = <strong>{odd}</strong>
                  </span>
                </div>
              )}
            </div>

            <div className="total-check">
              <span>
                <Icon name="check" size={14} /> TOTAL ONES AFTER PARITY
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
                03 <span>·</span> TRANSMISSION CHANNEL
              </div>
              <h2>
                Test the{' '}
                <span className="highlight-wrap">
                  <span className="highlight-text">parity checker</span>
                  <span className="highlight-bar" aria-hidden="true" />
                </span>
              </h2>
              <p className="section-desc">
                Click any received bit below to flip it in transit, or inject 1-bit vs. 2-bit noise to see how the receiver responds.
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
                <Icon name="radio" size={15} /> Transmit Clean
              </button>
            </div>
          </div>

          {hasTransmitted && received && (
            <div className="channel-content">
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
                      : `${flippedIndices.length} BIT${flippedIndices.length > 1 ? 'S' : ''} FLIPPED IN TRANSIT`}
                  </span>
                </div>

                <div className={`pipeline-node rx-node ${errorDetected ? 'rx-error' : undetectedCollision ? 'rx-warn' : 'rx-ok'}`}>
                  <span className="node-tag">RX RECEIVER</span>
                  <code>{binary(received)}</code>
                </div>
              </div>

              <div className="received-row">
                <div className="received-label">
                  <span className="readout-label">RECEIVED 5-BIT MESSAGE (CLICK ANY BIT TO FLIP IT)</span>
                  <span className="received-sub">
                    Receiver XOR check: <code>A&apos; ⊕ B&apos; ⊕ C&apos; ⊕ D&apos; ⊕ P&apos; = {checkParity}</code>
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
                      ? `Parity Error Detected! (Syndrome = ${checkParity})`
                      : undetectedCollision
                      ? `Undetected ${flippedIndices.length}-Bit Collision! (Syndrome = ${checkParity})`
                      : `No Error Detected — Message Verified (Syndrome = ${checkParity})`}
                  </strong>
                  <span>
                    {errorDetected
                      ? `Flipped bit(s): [${flippedIndices
                          .map(i => (i === 4 ? 'P' : LABELS[i]))
                          .join(', ')}]. Total 1s is now ${received.reduce((s, b) => s + b, 0)}, which violates ${mode} parity.`
                      : undetectedCollision
                      ? `${flippedIndices.length} bits flipped [${flippedIndices
                          .map(i => (i === 4 ? 'P' : LABELS[i]))
                          .join(', ')}]! Because an even number of bits flipped, the parity remains unchanged and the error slips through.`
                      : `Received bits satisfy the ${mode} parity rule with ${received.reduce(
                          (s, b) => s + b,
                          0
                        )} total 1s.`}
                  </span>
                </div>
                <span className="status-mode">{mode.toUpperCase()} CHECK</span>
              </div>
            </div>
          )}

          <div className="checker-foot">
            <Icon name="info" size={14} />
            <span>
              Parity detects any <strong>odd number</strong> of bit flips (1, 3, 5). An <strong>even number</strong> of errors cancels out in modulo-2 addition.
            </span>
          </div>
        </section>

        {/* 04: Interactive Truth Table */}
        <section className="truth-section" id="truth-table">
          <div className="section-top">
            <div>
              <div className="section-kicker">
                04 <span>·</span> COMPLETE STATE SPACE
              </div>
              <h2>Interactive truth table</h2>
              <p className="section-desc">
                Click any row below to load that 4-bit combination into the simulator.
              </p>
            </div>

            <div className="table-controls">
              <div className="filter-pills" role="group" aria-label="Filter truth table">
                <button
                  className={tableFilter === 'all' ? 'active' : ''}
                  onClick={() => setTableFilter('all')}
                >
                  All 16 States
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
                  <th className="row-id">#</th>
                  <th>A</th>
                  <th>B</th>
                  <th>C</th>
                  <th>D</th>
                  <th className="weight-col">ONES</th>
                  <th className={`split-col ${mode === 'even' ? 'col-active' : ''}`}>EVEN PARITY</th>
                  <th className={mode === 'odd' ? 'col-active' : ''}>ODD PARITY</th>
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
                      <span>{String(n + 1).padStart(2, '0')}</span>
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

        <section className="theory-section">
          <div className="section-top">
            <div>
              <div className="section-kicker">
                05 <span>·</span> QUICK THEORY
              </div>
              <h2>
                How{' '}
                <span className="highlight-wrap">
                  <span className="highlight-text">parity works</span>
                  <span className="highlight-bar" aria-hidden="true" />
                </span>
              </h2>
            </div>
            <span className="theory-mark">
              <Icon name="book" size={15} /> THE ESSENTIALS
            </span>
          </div>

          <div className="topic-pills">
            <span className="topic-pill">⚡ Exclusive-OR (XOR)</span>
            <span className="topic-pill">🔢 Modulo-2 Arithmetic</span>
            <span className="topic-pill">📡 UART Serial Frames</span>
            <span className="topic-pill">🛡️ Single-Error Detection</span>
            <span className="topic-pill">🧮 Hamming Distance d=2</span>
            <span className="topic-pill">🔌 IC 74180 / 74280</span>
            <span className="topic-pill">💾 Memory Parity Bus</span>
          </div>

          <div className="theory-grid">
            <article className="theory-card">
              <span className="theory-icon">⊕</span>
              <h3>Parity &amp; parity bit</h3>
              <p>
                A lightweight error-checking method. One extra bit is appended to a binary word so the total count of <code>1</code>s always obeys a chosen rule.
              </p>
            </article>
            <article className="theory-card">
              <span className="theory-icon">01</span>
              <h3>Even vs. odd rule</h3>
              <p>
                Even parity makes the total count of <code>1</code>s even. Odd parity makes the total count odd, guaranteeing at least one transition per frame.
              </p>
            </article>
            <article className="theory-card">
              <span className="theory-icon">
                <Icon name="zap" size={16} />
              </span>
              <h3>Why XOR gates?</h3>
              <p>
                XOR outputs <code>1</code> when its inputs differ. Cascading 3 XOR gates computes <code>A ⊕ B ⊕ C ⊕ D</code>, flagging an odd number of input <code>1</code>s.
              </p>
            </article>
            <article className="theory-card">
              <span className="theory-icon">
                <Icon name="activity" size={16} />
              </span>
              <h3>Uses &amp; limits</h3>
              <p>
                Used in UART links, CPU caches, and RAID arrays. Parity catches any odd number of bit flips, though even-count flips cancel out.
              </p>
            </article>
          </div>
        </section>

        <footer className="footer">
          <div className="footer-brand">
            <LogicCube bits={bits} parity={parity} size={24} />
            <span className="brand-word">logiclab</span>
          </div>
          <div className="footer-meta">
            <span>4-BIT PARITY GENERATOR &amp; CHECKER</span>
            <span>·</span>
            <span>DIGITAL ELECTRONICS · 2026</span>
          </div>
        </footer>
      </div>
    </main>
  );
}

export default App;
