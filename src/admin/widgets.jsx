import { useT } from './ui';

/** Multi-series line chart. series = [{date, a, b…}], keys = [{k, color, label}] */
export function LineChart({ series, keys, height = 220 }) {
  const W = 680, H = height, P = 30;
  const max = Math.max(1, ...series.flatMap((s) => keys.map(({ k }) => s[k] || 0)));
  const x = (i) => P + (i * (W - P * 2)) / Math.max(1, series.length - 1);
  const y = (v) => H - P - (v / max) * (H - P * 2);
  const line = (k) => series.map((s, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(s[k] || 0).toFixed(1)}`).join(' ');
  const step = Math.max(1, Math.round(series.length / 7));
  return (
    <>
      <div className="ad-legend">{keys.map(({ k, color, label }) => <span key={k}><i style={{ background: color }} />{label}</span>)}</div>
      <svg className="ad-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="chart">
        {[0, 0.5, 1].map((g) => <line key={g} x1={P} x2={W - P} y1={y(max * g)} y2={y(max * g)} stroke="var(--line)" />)}
        <text x={4} y={y(max) + 4} fontSize="11" fill="var(--text3)">{max}</text>
        {keys.map(({ k, color }) => <path key={k} d={line(k)} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />)}
        {series.map((s, i) => (i % step === 0 || i === series.length - 1) && <text key={s.date} x={x(i)} y={H - 8} fontSize="10" textAnchor="middle" fill="var(--text3)">{String(s.date).slice(5)}</text>)}
      </svg>
    </>
  );
}

/** Vertical columns (hours of the day etc). items = [{label, a, b?}] ; b is drawn on top in a second colour. */
export function Columns({ items, colors = ['#2563eb', '#e8920c'], height = 150 }) {
  const max = Math.max(1, ...items.map((i) => (i.a || 0) + (i.b || 0)));
  return (
    <div className="ad-cols" style={{ height }} role="img" aria-label="histogram">
      {items.map((i, n) => (
        <div key={n} className="ad-cols__c" title={`${i.label}: ${(i.a || 0) + (i.b || 0)}`}>
          <span className="ad-cols__bar">
            {!!i.b && <i style={{ height: `${(i.b / max) * 100}%`, background: colors[1] }} />}
            <i style={{ height: `${((i.a || 0) / max) * 100}%`, background: colors[0] }} />
          </span>
          <small>{n % 3 === 0 ? i.label : ''}</small>
        </div>
      ))}
    </div>
  );
}

/** Horizontal bars. items = [{label, value}] */
export function HBars({ items, color = 'var(--brand)', empty }) {
  const { t } = useT();
  if (!items.length) return <div className="ad-empty">{empty || t('No data yet', 'لا توجد بيانات بعد')}</div>;
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="ad-hbars">
      {items.map((i, n) => (
        <li key={n}>
          <div className="ad-hbars__row"><span title={i.label}>{i.label}</span><b>{i.value}</b></div>
          <div className="ad-hbars__track"><i style={{ width: `${Math.max(3, (i.value / max) * 100)}%`, background: color }} /></div>
        </li>
      ))}
    </ul>
  );
}

export function Stats({ items }) {
  return (
    <div className="ad-stats">
      {items.map(([label, n, sub]) => (
        <div key={label} className="ad-card ad-stat"><span>{label}</span><b>{n}</b>{sub != null && <i>{sub}</i>}</div>
      ))}
    </div>
  );
}

/** Small hook-free helper: label for a number input that lives in a state object. */
export function NumberField({ label, hint, value, onChange, min, max, placeholder }) {
  return (
    <label className="ad-field">{label}
      <input className="ad-input" type="number" inputMode="numeric" min={min} max={max} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      {hint && <small className="ad-muted">{hint}</small>}
    </label>
  );
}

export function PageHead({ title, sub, actions }) {
  return (
    <div className="ad-pagehead">
      <div><h2>{title}</h2>{sub && <p>{sub}</p>}</div>
      {actions && <div className="ad-pagehead__act">{actions}</div>}
    </div>
  );
}
