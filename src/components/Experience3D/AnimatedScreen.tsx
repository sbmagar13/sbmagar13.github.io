'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type ScreenMode = 'terminal' | 'graph' | 'htop' | 'matrix' | 'logs' | 'pulse';

interface Props {
  position: [number, number, number];
  rotation?: [number, number, number];
  size?: [number, number];
  mode?: ScreenMode;
  accent?: string;
  bg?: string;
  /** Higher = faster scroll/animation */
  speed?: number;
}

/**
 * A small "monitor" face that's actually a CanvasTexture being repainted
 * every frame. Cheap (the canvas itself is tiny, 256×128 by default) and
 * sells the "this rack is doing live work" vibe better than any decal.
 *
 * Six pre-built modes; pick the one that fits the rack's role.
 */
export default function AnimatedScreen({
  position,
  rotation = [0, 0, 0],
  size = [0.4, 0.22],
  mode = 'terminal',
  accent = '#22d3ee',
  bg = '#020617',
  speed = 1,
}: Props) {
  const canvasW = 256;
  const canvasH = Math.round(canvasW * (size[1] / size[0]));

  // Build a deterministic but interesting per-screen state so each canvas
  // looks different even if many are rendered.
  const state = useMemo(() => {
    const lines: string[] = [];
    const baseLines = [
      '$ kubectl get pods',
      '$ tail -f /var/log/app.log',
      '$ docker stats --no-stream',
      'INFO  rqst=GET /api/v1/...',
      'WARN  k8s scheduler: backoff',
      'INFO  deploy ok ✓  v1.4.2',
      'DEBUG tls.handshake done',
      'INFO  prom scrape 200ms',
      'INFO  flushed wal segment',
      'WARN  cpu utilization 78%',
      'INFO  hpa scale 3 → 5',
      '$ ssh ops@bastion',
      'INFO  redis.set key=42',
      'INFO  job 8a3e succeeded',
      'INFO  alert resolved      ',
      'DEBUG tracing span flushed',
    ];
    for (let i = 0; i < 50; i++) lines.push(baseLines[Math.floor(Math.random() * baseLines.length)]);
    return {
      lines,
      offset: 0,
      // For graph/pulse mode — pre-computed sample stream.
      samples: Array.from({ length: 128 }, () => Math.random()),
    };
  }, []);

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasW;
    canvas.height = canvasH;
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [canvasW, canvasH]);

  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const frameCountRef = useRef(0);
  useEffect(() => {
    const canvas = (texture.image as HTMLCanvasElement);
    ctxRef.current = canvas.getContext('2d');
  }, [texture]);

  useFrame((rs) => {
    // Repaint every other frame; the human eye won't notice on a tiny
    // 256-pixel-wide texture, and we avoid 11 GPU texture uploads/frame.
    frameCountRef.current++;
    if (frameCountRef.current % 2 !== 0) return;

    const ctx = ctxRef.current;
    if (!ctx) return;
    const t = rs.clock.elapsedTime * speed;

    // Background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Faint grid lines
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvasW; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasH);
      ctx.stroke();
    }
    for (let y = 0; y < canvasH; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasW, y);
      ctx.stroke();
    }

    if (mode === 'terminal' || mode === 'logs') {
      ctx.font = '8px ui-monospace, SFMono-Regular, monospace';
      ctx.fillStyle = accent;
      const scrollY = (t * 14) % canvasH;
      const lineH = 11;
      for (let i = 0; i < Math.ceil(canvasH / lineH) + 2; i++) {
        const lineIndex =
          (i + Math.floor((t * 14) / lineH)) % state.lines.length;
        const y = i * lineH - (scrollY % lineH) + 8;
        const line = state.lines[lineIndex];
        ctx.fillStyle =
          line.startsWith('WARN') ? '#f59e0b' : line.startsWith('DEBUG') ? '#94a3b8' : accent;
        ctx.fillText(line.slice(0, 36), 6, y);
      }
      // Blinking cursor at bottom
      if (Math.floor(t * 2) % 2 === 0) {
        ctx.fillStyle = accent;
        ctx.fillRect(canvasW - 14, canvasH - 12, 6, 8);
      }
    } else if (mode === 'graph') {
      // Scrolling line chart with a fill
      const samples = state.samples;
      samples.shift();
      samples.push(
        0.4 + 0.3 * Math.sin(t * 2) + 0.2 * Math.random(),
      );
      ctx.strokeStyle = accent;
      ctx.fillStyle = `${accent}30`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      samples.forEach((v, i) => {
        const x = (i / samples.length) * canvasW;
        const y = canvasH - v * (canvasH - 10) - 5;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.lineTo(canvasW, canvasH);
      ctx.lineTo(0, canvasH);
      ctx.closePath();
      ctx.fill();
      // Axis label
      ctx.fillStyle = accent;
      ctx.font = '8px ui-monospace, monospace';
      ctx.fillText('cpu %', 4, 12);
    } else if (mode === 'htop') {
      // Bar chart of "processes"
      const bars = 18;
      const barW = canvasW / bars;
      for (let i = 0; i < bars; i++) {
        const v = 0.3 + 0.5 * Math.abs(Math.sin(t * 1.5 + i * 0.6));
        const h = v * (canvasH - 8);
        const x = i * barW + 1;
        ctx.fillStyle = v > 0.8 ? '#ef4444' : v > 0.6 ? '#f59e0b' : accent;
        ctx.fillRect(x, canvasH - h - 2, barW - 2, h);
      }
      ctx.fillStyle = accent;
      ctx.font = '8px ui-monospace, monospace';
      ctx.fillText('top', 4, 11);
    } else if (mode === 'matrix') {
      // Falling green characters
      ctx.font = '10px ui-monospace, monospace';
      const cols = Math.floor(canvasW / 8);
      for (let c = 0; c < cols; c++) {
        const y = ((t * (60 + c * 7)) % (canvasH + 20)) | 0;
        const ch = String.fromCharCode(33 + ((c * 31 + y) % 90));
        ctx.fillStyle = `rgba(34, 197, 94, ${0.4 + 0.6 * Math.random()})`;
        ctx.fillText(ch, c * 8, y);
      }
    } else if (mode === 'pulse') {
      // Heart-rate-like waveform
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < canvasW; x++) {
        const phase = (x / canvasW) * Math.PI * 6 + t * 4;
        const spike = Math.exp(-Math.pow((x % 64) - 30, 2) / 12) * 25;
        const y = canvasH / 2 + Math.sin(phase) * 4 - spike;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    texture.needsUpdate = true;
  });

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}
