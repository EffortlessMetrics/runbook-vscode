import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Lightweight Gherkin parser — no external deps, runs inside extension host
// Supports: Feature, Background, Scenario, Scenario Outline + Examples,
//           Given/When/Then/And/But, # comments
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
const OUTLINE_KW = /^\s*Scenario Outline:\s*(.+)$/;
const EXAMPLES_KW = /^\s*Examples:\s*$/;

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
  let backgroundSteps: GherkinStep[] = [];
  let inBackground = false;

  // Scenario Outline state
  let outlineName = '';
  let outlineSteps: GherkinStep[] = [];
  let inOutline = false;
  let inExamples = false;
  let exampleHeaders: string[] = [];

  function flushOutline() {
    // nothing to flush if no outline
    outlineName = '';
    outlineSteps = [];
    inOutline = false;
    inExamples = false;
    exampleHeaders = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip comments and empty lines in examples context
    if (trimmed.startsWith('#')) { continue; }

    // --- Feature ---
    const featureMatch = line.match(FEATURE_KW);
    if (featureMatch) {
      featureName = featureMatch[1].trim();
      inBackground = false;
      flushOutline();
      continue;
    }

    // --- Background ---
    const backgroundMatch = line.match(/^\s*Background:\s*(.*)$/);
    if (backgroundMatch) {
      inBackground = true;
      inOutline = false;
      inExamples = false;
      current = null;
      continue;
    }

    // --- Scenario Outline ---
    const outlineMatch = line.match(OUTLINE_KW);
    if (outlineMatch) {
      inBackground = false;
      inOutline = true;
      inExamples = false;
      outlineName = outlineMatch[1].trim();
      outlineSteps = [];
      current = null;
      continue;
    }

    // --- Examples: (table header + rows) ---
    if (EXAMPLES_KW.test(line)) {
      inExamples = true;
      exampleHeaders = [];
      continue;
    }

    // --- Table rows under Examples ---
    if (inExamples && trimmed.startsWith('|')) {
      const cells = trimmed.split('|').map(c => c.trim()).filter(c => c.length > 0);
      if (exampleHeaders.length === 0) {
        exampleHeaders = cells;
      } else {
        // Instantiate a scenario from the outline
        const row: Record<string, string> = {};
        cells.forEach((val, i) => { row[exampleHeaders[i]] = val; });
        const expandedSteps = outlineSteps.map(s => ({
          keyword: s.keyword,
          text: s.text.replace(/<([^>]+)>/g, (_, key) => row[key] ?? `<${key}>`)
        }));
        const scenarioName = outlineName.replace(/<([^>]+)>/g, (_, key) => row[key] ?? `<${key}>`);
        scenarios.push({
          name: scenarioName,
          steps: [...backgroundSteps, ...expandedSteps]
        });
      }
      continue;
    }

    // If we encounter a new Scenario / Scenario Outline, end examples parsing
    if (inExamples && !trimmed.startsWith('|') && trimmed.length > 0) {
      inExamples = false;
    }

    // --- Regular Scenario ---
    const scenarioMatch = line.match(SCENARIO_KW);
    if (scenarioMatch) {
      flushOutline();
      inBackground = false;
      current = { name: scenarioMatch[1].trim(), steps: [...backgroundSteps] };
      scenarios.push(current);
      continue;
    }

    // --- Step lines ---
    const stepMatch = line.match(STEP_KW);
    if (stepMatch) {
      const step: GherkinStep = {
        keyword: stepMatch[1] as GherkinStep['keyword'],
        text: stepMatch[2].trim()
      };

      if (inBackground) {
        backgroundSteps.push(step);
      } else if (inOutline && !inExamples) {
        outlineSteps.push(step);
      } else if (current) {
        current.steps.push(step);
      }
      continue;
    }

    // Collect description lines between Feature and first Scenario/Background
    if (featureName && !current && !inBackground && !inOutline && trimmed) {
      descLines.push(trimmed);
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
  regexStr = regexStr.replace(/\\{int\\}/g, '(-?\\d+)');
  regexStr = regexStr.replace(/\\{float\\}/g, '(-?[\\d.]+)');
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
