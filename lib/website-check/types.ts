export type Check = {
  id: string;
  label: string;
  ok: boolean;
  detail: string; // what we found on this site
  weight: number; // how much it matters for winning customers, 1 to 10
  why: string; // why it costs customers when it fails
  fix: string; // what fixing it looks like
};

export type Report = {
  url: string;
  host: string;
  score: number;
  verdict: string;
  checks: Check[];
  topFixes: Check[];
  loadMs: number;
  sizeKb: number;
  checkedAt: string;
};
