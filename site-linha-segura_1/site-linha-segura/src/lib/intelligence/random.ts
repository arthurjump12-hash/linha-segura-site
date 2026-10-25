/** Gerador pseudoaleatório determinístico (mulberry32): mesma semente, mesmos dados. */
export function createRandom(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    range: (min: number, max: number) => min + (max - min) * next(),
    int: (min: number, max: number) => Math.floor(min + (max - min + 1) * next()),
    /** Intervalo exponencial com média `mean` */
    exp: (mean: number) => -Math.log(1 - next()) * mean,
    hex: (len: number) =>
      Array.from({ length: len }, () => Math.floor(next() * 16).toString(16))
        .join("")
        .toUpperCase(),
  };
}

export type Random = ReturnType<typeof createRandom>;
