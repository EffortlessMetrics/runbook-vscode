import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Lightweight Gherkin parser — no external deps, runs inside extension host
// ---------------------------------------------------------------------------

export interface GherkinScenario {
  name: string;
  steps: GherkinStep[];
}

export interface GherkinFeature {
  name: string;
  description: string;
  scenarios: GherkinScenario[];
}

export interface GherkinStep {
  keyword: 'Given' | 'When' | 'Then' | 'And' | 'But';
  text: string;
}

const STEP_KW = /^\s*(Given|When|Then|And|But)\s+(.+)$/;
const FEATURE_KW = /^\s*Feature:\s*(.+)$/;
const SCENARIO_KW = /^\s*Scenario:\s*(.+)$/;

export function parseFeatureFile(filePath: string): GherkinFeature {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return parseFeatureText(raw);
}

export function parseFeatureText(text: string): GherkinFeature {
  const lines = text.split(/\r?\n/);
  let featureName = '';
  const descLines: string[] = [];
  const scenarios: GherkinScenario[] = [];
  let current: GherkinScenario | null = null;

  for (const line of lines) {
    const featureMatch = line.match(FEATURE_KW);
    if (featureMatch) {
      featureName = featureMatch[1].trim();
      continue;
    }

    const scenarioMatch = line.match(SCENARIO_KW);
    if (scenarioMatch) {
      current = { name: scenarioMatch[1].trim(), steps: [] };
      scenarios.push(current);
      continue;
    }

    const stepMatch = line.match(STEP_KW);
    if (stepMatch && current) {
      current.steps.push({
        keyword: stepMatch[1] as GherkinStep['keyword'],
        text: stepMatch[2].trim()
      });
      continue;
    }

    // Collect description lines between Feature and first Scenario
    if (featureName && !current && line.trim() && !line.trim().startsWith('#')) {
      descLines.push(line.trim());
    }
  }

  return { name: featureName, description: descLines.join(' '), scenarios };
}

// ---------------------------------------------------------------------------
// Step registry — register steps with pattern matching
// ---------------------------------------------------------------------------

type StepFn = (...args: any[]) => Promise<void> | void;

interface RegisteredStep {
  pattern: RegExp;
  fn: StepFn;
}

const stepRegistry: RegisteredStep[] = [];

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function patternToRegex(pattern: string): RegExp {
  // Convert Cucumber-style {string}, {int}, {float} to capture groups
  let regexStr = escapeRegex(pattern);
  regexStr = regexStr.replace(/\\{string\\}/g, '"([^"]*)"');
  regexStr = regexStr.replace(/\\{int\\}/g, '(\\d+)');
  regexStr = regexStr.replace(/\\{float\\}/g, '([\\d.]+)');
  return new RegExp('^' + regexStr + '$');
}

export function Given(pattern: string, fn: StepFn) {
  stepRegistry.push({ pattern: patternToRegex(pattern), fn });
}

export function When(pattern: string, fn: StepFn) {
  stepRegistry.push({ pattern: patternToRegex(pattern), fn });
}

export function Then(pattern: string, fn: StepFn) {
  stepRegistry.push({ pattern: patternToRegex(pattern), fn });
}

export function After(fn: () => Promise<void> | void) {
  // Store afterHooks separately
  afterHooks.push(fn);
}

const afterHooks: Array<() => Promise<void> | void> = [];

export function findStep(text: string): { fn: StepFn; args: string[] } | null {
  for (const step of stepRegistry) {
    const match = text.match(step.pattern);
    if (match) {
      return { fn: step.fn, args: match.slice(1) };
    }
  }
  return null;
}

export function getAfterHooks() {
  return afterHooks;
}

export function clearRegistry() {
  stepRegistry.length = 0;
  afterHooks.length = 0;
}

// ---------------------------------------------------------------------------
// Discover .feature files in a directory
// ---------------------------------------------------------------------------

export function discoverFeatures(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) { return results; }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...discoverFeatures(full));
    } else if (entry.name.endsWith('.feature')) {
      results.push(full);
    }
  }
  return results;
}
