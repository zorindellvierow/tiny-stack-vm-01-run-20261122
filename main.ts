import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const ID = process.env.MAKEFUN_INPUT_DIR ?? "/input";
const OD = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
function run(p: Uint8Array, inp: Uint8Array) {
  const n = p.length, D = new Int32Array(256), C = new Int32Array(64), M = new Int32Array(256), out = new Uint8Array(65536);
  let sp = 0, csp = 0, ol = 0, ip = 0, pc = 0, st = 0;
  const ret = (c: number) => ({ c, out, ol });
  for (;;) {
    if (st === 1000000) return ret(10);
    if (pc < 0 || pc >= n) return ret(9);
    const op = p[pc];
    let im = 0, po = 0, pu = 0;
    switch (op) {
      case 0: break;
      case 1: im = 1; pu = 1; break;
      case 2: im = 4; pu = 1; break;
      case 3: po = 1; break;
      case 4: po = 1; pu = 2; break;
      case 5: po = 2; pu = 2; break;
      case 6: po = 2; pu = 3; break;
      case 7: po = 3; pu = 3; break;
      case 16: case 17: case 18: case 19: case 20: case 21: case 22:
      case 24: case 25: case 26: case 28: case 29: case 30:
      case 32: case 33: case 34: po = 2; pu = 1; break;
      case 23: case 27: po = 1; pu = 1; break;
      case 48: im = 2; break;
      case 49: case 50: im = 2; po = 1; break;
      case 51: im = 2; break;
      case 52: break;
      case 64: po = 1; pu = 1; break;
      case 65: po = 2; break;
      case 80: case 81: po = 1; break;
      case 82: pu = 1; break;
      case 83: po = 1; break;
      default: return ret(5);
    }
    if (pc + im >= n) return ret(9);
    st++;
    if (sp < po) return ret(2);
    if (sp - po + pu > 256) return ret(3);
    const nx = pc + 1 + im;
    switch (op) {
      case 0: return ret(0);
      case 1: D[sp++] = (p[pc + 1] << 24) >> 24; pc = nx; break;
      case 2: D[sp++] = (p[pc + 1] | (p[pc + 2] << 8) | (p[pc + 3] << 16) | (p[pc + 4] << 24)) | 0; pc = nx; break;
      case 3: sp--; pc = nx; break;
      case 4: D[sp] = D[sp - 1]; sp++; pc = nx; break;
      case 5: { const t = D[sp - 1]; D[sp - 1] = D[sp - 2]; D[sp - 2] = t; pc = nx; break; }
      case 6: D[sp] = D[sp - 2]; sp++; pc = nx; break;
      case 7: { const a = D[sp - 3], b = D[sp - 2], c = D[sp - 1]; D[sp - 3] = b; D[sp - 2] = c; D[sp - 1] = a; pc = nx; break; }
      case 16: case 17: case 18: case 19: case 20: case 21: case 22:
      case 24: case 25: case 26: case 28: case 29: case 30:
      case 32: case 33: case 34: {
        const a = D[sp - 2], b = D[sp - 1];
        let r = 0;
        if (op === 16) r = (a + b) | 0;
        else if (op === 17) r = (a - b) | 0;
        else if (op === 18) r = Math.imul(a, b);
        else if (op === 19) { if (b === 0) return ret(4); r = a === -2147483648 && b === -1 ? a : (a / b) | 0; }
        else if (op === 20) { if (b === 0) return ret(4); r = b === -1 ? 0 : (a % b) | 0; }
        else if (op === 21) { if (b === 0) return ret(4); r = Math.floor((a >>> 0) / (b >>> 0)) | 0; }
        else if (op === 22) { if (b === 0) return ret(4); r = ((a >>> 0) % (b >>> 0)) | 0; }
        else if (op === 24) r = a & b;
        else if (op === 25) r = a | b;
        else if (op === 26) r = a ^ b;
        else if (op === 28) r = a << (b & 31);
        else if (op === 29) r = a >> (b & 31);
        else if (op === 30) r = (a >>> (b & 31)) | 0;
        else if (op === 32) r = a === b ? 1 : 0;
        else if (op === 33) r = a < b ? 1 : 0;
        else r = (a >>> 0) < (b >>> 0) ? 1 : 0;
        sp--; D[sp - 1] = r; pc = nx; break;
      }
      case 23: D[sp - 1] = (-D[sp - 1]) | 0; pc = nx; break;
      case 27: D[sp - 1] = ~D[sp - 1]; pc = nx; break;
      case 48: { let rel = p[pc + 1] | (p[pc + 2] << 8); if (rel & 0x8000) rel -= 0x10000; pc = nx + rel; break; }
      case 49: case 50: {
        const v = D[sp - 1]; sp--;
        let rel = p[pc + 1] | (p[pc + 2] << 8); if (rel & 0x8000) rel -= 0x10000;
        pc = (op === 49 ? v === 0 : v !== 0) ? nx + rel : nx; break;
      }
      case 51: {
        const t = p[pc + 1] | (p[pc + 2] << 8);
        if (csp === 64) return ret(7);
        C[csp++] = nx; pc = t; break;
      }
      case 52: if (csp === 0) return ret(8); pc = C[--csp]; break;
      case 64: { const a = D[sp - 1]; if (a < 0 || a > 255) return ret(6); D[sp - 1] = M[a]; pc = nx; break; }
      case 65: { const a = D[sp - 1], v = D[sp - 2]; if (a < 0 || a > 255) return ret(6); M[a] = v; sp -= 2; pc = nx; break; }
      case 80: {
        const v = D[sp - 1]; sp--;
        const s = String(v);
        if (ol + s.length > 65536) return ret(11);
        for (let i = 0; i < s.length; i++) out[ol++] = s.charCodeAt(i);
        pc = nx; break;
      }
      case 81: { const v = D[sp - 1]; sp--; if (ol + 1 > 65536) return ret(11); out[ol++] = v & 255; pc = nx; break; }
      case 82: D[sp++] = ip < inp.length ? inp[ip++] : -1; pc = nx; break;
      case 83: return ret(D[sp - 1] & 255);
    }
  }
}
for (const id of readdirSync(ID).sort()) {
  const r = run(readFileSync(join(ID, id, "program.bin")), readFileSync(join(ID, id, "input.bin")));
  const od = join(OD, id);
  mkdirSync(od, { recursive: true });
  writeFileSync(join(od, "stdout.bin"), r.out.subarray(0, r.ol));
  writeFileSync(join(od, "exit.txt"), r.c + "\n");
}
