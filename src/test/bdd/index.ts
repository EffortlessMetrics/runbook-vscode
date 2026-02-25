import * as path from 'path';
import Mocha from 'mocha';
import {
  parseFeatureFile,
  discoverFeatures,
  findStep,
  getAfterHooks,
  clearRegistry
} from './framework';

// Step definitions must be imported to register themselves
import './steps/all.steps';

export async function run(): Promise<void> {
  const mocha = new Mocha({ ui: 'tdd', color: true, timeout: 10000 });

  // Discover all .feature files from source (not dist)
  const featuresDir = path.resolve(__dirname, '..', '..', '..', 'src', 'test', 'bdd', 'features');
  const featureFiles = discoverFeatures(featuresDir);

  if (featureFiles.length === 0) {
    console.warn('No .feature files found in', featuresDir);
    return;
  }

  // For each feature, dynamically generate Mocha suites/tests
  // We use a virtual test file approach: add a single file that creates suites at runtime.
  const virtualTestFile = path.resolve(__dirname, '__bdd_generated__.js');

  // Write a module that Mocha can load — but actually we'll use suiteSetup directly.
  // Mocha's programmatic API lets us define tests via the root suite.
  const rootSuite = mocha.suite;

  for (const featureFile of featureFiles) {
    const feature = parseFeatureFile(featureFile);

    const featureSuite = Mocha.Suite.create(rootSuite, `Feature: ${feature.name}`);

    for (const scenario of feature.scenarios) {
      featureSuite.addTest(new Mocha.Test(`Scenario: ${scenario.name}`, async () => {
        for (const step of scenario.steps) {
          const match = findStep(step.text);
          if (!match) {
            throw new Error(`No step definition found for: "${step.keyword} ${step.text}"`);
          }
          // Convert {int} captures from string to number
          const args = match.args.map(a => /^-?\d+$/.test(a) ? parseInt(a, 10) : a);
          await match.fn(...args);
        }
      }));
    }

    // Add after hook to each feature suite
    const hooks = getAfterHooks();
    if (hooks.length > 0) {
      featureSuite.afterEach('BDD After Hook', async function () {
        for (const hook of hooks) {
          await hook();
        }
      });
    }
  }

  return new Promise((resolve, reject) => {
    mocha.run(failures => {
      if (failures > 0) {
        reject(new Error(`${failures} BDD tests failed.`));
      } else {
        resolve();
      }
    });
  });
}
