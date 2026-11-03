import React, { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import { Eraser, Undo2 } from 'lucide-react';

const INK = '#1d1830';

// Les traits sont stockés en coordonnées normalisées (0..1) : ils survivent
// aux rotations d'écran et aux redimensionnements.
function drawStroke(ctx, stroke, w, h, lw) {
  if (!stroke.length) return;
  ctx.beginPath();
  const p = (i) => [stroke[i][0] * w, stroke[i][1] * h];
  if (stroke.length === 1) {
    const [x, y] = p(0);
    ctx.arc(x, y, lw / 2, 0, Math.PI * 2);
    ctx.fillStyle = INK;
    ctx.fill();
    return;
  }
  let [x0, y0] = p(0);
  ctx.moveTo(x0, y0);
  for (let i = 1; i < stroke.length - 1; i++) {
    const [x1, y1] = p(i);
    const [x2, y2] = p(i + 1);
    ctx.quadraticCurveTo(x1, y1, (x1 + x2) / 2, (y1 + y2) / 2);
  }
  const [xl, yl] = p(stroke.length - 1);
  ctx.lineTo(xl, yl);
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = INK;
  ctx.stroke();
}

const SignaturePad = forwardRef(function SignaturePad({ onChange }, ref) {
  const wrap = useRef(null);
  const canvas = useRef(null);
  const strokes = useRef([]);
  const current = useRef(null);
  const size = useRef({ w: 1, h: 1 });
  const [hasInk, setHasInk] = useState(false);
  const [touched, setTouched] = useState(false);

  const redraw = useCallback(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const { w, h } = size.current;
    ctx.clearRect(0, 0, c.width, c.height);
    const dpr = c.width / w;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const lw = Math.max(2.4, w / 220);
    strokes.current.forEach((s) => drawStroke(ctx, s, w, h, lw));
    if (current.current) drawStroke(ctx, current.current, w, h, lw);
  }, []);

  const resize = useCallback(() => {
    const el = wrap.current;
    const c = canvas.current;
    if (!el || !c) return;
    const r = el.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    size.current = { w: r.width, h: r.height };
    c.width = Math.round(r.width * dpr);
    c.height = Math.round(r.height * dpr);
    redraw();
  }, [redraw]);

  useEffect(() => {
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap.current);
    return () => ro.disconnect();
  }, [resize]);

  const pt = (e) => {
    const r = canvas.current.getBoundingClientRect();
    return [Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))];
  };

  const exportImage = useCallback(() => {
    const { w, h } = size.current;
    const all = strokes.current.flat();
    if (!all.length) return null;
    let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9, len = 0;
    strokes.current.forEach((s) => {
      for (let i = 0; i < s.length; i++) {
        const x = s[i][0] * w, y = s[i][1] * h;
        minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        if (i) len += Math.hypot(x - s[i - 1][0] * w, y - s[i - 1][1] * h);
      }
    });
    const bw = maxX - minX, bh = maxY - minY;
    if (len < 90 || Math.max(bw, bh) < 45) return null; // trop petit : pas une vraie signature
    const OUT_W = 560, OUT_H = 200, PAD = 12;
    const scale = Math.min((OUT_W - PAD * 2) / Math.max(bw, 1), (OUT_H - PAD * 2) / Math.max(bh, 1), 3);
    const out = document.createElement('canvas');
    out.width = OUT_W; out.height = OUT_H;
    const ctx = out.getContext('2d');
    const ox = (OUT_W - bw * scale) / 2 - minX * scale;
    const oy = (OUT_H - bh * scale) / 2 - minY * scale;
    ctx.setTransform(scale, 0, 0, scale, ox, oy);
    const lw = Math.max(2.4, w / 220);
    // épaisseur constante dans l'image finale (≈ 3.2 px)
    const flw = 3.2 / scale;
    strokes.current.forEach((s) => drawStroke(ctx, s, w, h, Math.max(flw, lw * 0.5)));
    return out.toDataURL('image/png');
  }, []);

  const emit = useCallback(() => {
    const img = exportImage();
    setHasInk(!!img);
    onChange?.(img);
  }, [exportImage, onChange]);

  const down = (e) => {
    e.preventDefault();
    canvas.current.setPointerCapture?.(e.pointerId);
    setTouched(true);
    current.current = [pt(e)];
    redraw();
  };
  const move = (e) => {
    if (!current.current) return;
    const evs = e.nativeEvent.getCoalescedEvents ? e.nativeEvent.getCoalescedEvents() : [e.nativeEvent];
    (evs.length ? evs : [e.nativeEvent]).forEach((ev) => current.current.push(pt(ev)));
    redraw();
  };
  const up = () => {
    if (!current.current) return;
    strokes.current.push(current.current);
    current.current = null;
    redraw();
    emit();
  };

  const doClear = () => { strokes.current = []; current.current = null; setTouched(false); redraw(); emit(); };
  const doUndo = () => { strokes.current.pop(); if (!strokes.current.length) setTouched(false); redraw(); emit(); };
  useImperativeHandle(ref, () => ({ clear: doClear, undo: doUndo }));

  return (
    <div className="sig-wrap">
      <div className="sig-board" ref={wrap}>
        <div className="sig-line" />
        <span className="sig-x">✕</span>
        <div className="sig-ph" style={{ opacity: touched || hasInk ? 0 : 1 }}>Signez ici avec le doigt ou la souris</div>
        <canvas ref={canvas} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up} aria-label="Zone de signature" />
      </div>
      <div className="sig-actions">
        <button type="button" className="btn ghost small" onClick={doUndo}><Undo2 size={16} /> Annuler le trait</button>
        <button type="button" className="btn ghost small" onClick={doClear}><Eraser size={16} /> Tout effacer</button>
      </div>
    </div>
  );
});

export default SignaturePad;
