import { loadConfiguration, loadSupport, runCucumber } from '@cucumber/cucumber/api';
import * as path from 'path';

export async function run(): Promise<void> {
  const bddRoot = path.resolve(__dirname, '..', '..', '..', 'src', 'test', 'bdd');
  
  const { runConfiguration } = await loadConfiguration({
    provided: {
      paths: [path.join(bddRoot, 'features/**/*.feature')],
      require: [path.join(__dirname, 'steps/**/*.js')],
      formatOptions: { snippetInterface: 'async-await' }
    }
  });

  const support = await loadSupport(runConfiguration);
  const { success } = await runCucumber({ ...runConfiguration, support });

  if (!success) {
    throw new Error('Cucumber tests failed.');
  }
}
