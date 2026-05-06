import { confirm } from '@inquirer/prompts';
import { execSync } from 'child_process';

async function run(): Promise<void> {
  // Args: 2: targetScript, 3: default (yes/no), 4: timeoutMs
  const [,, targetScript, defaultChoice = 'yes', timeoutStr = '5000'] = process.argv;

  if (!targetScript) {
    console.error('Usage: node ask.ts <script-name> [default: yes|no] [timeoutMs]');
    process.exit(1);
  }

  const isDefaultYes = defaultChoice.toLowerCase() !== 'no'; // Defaults to true unless 'no' is explicit
  const timeoutMs = parseInt(timeoutStr, 10);

  let answer: boolean;

  try {
    answer = await confirm(
      { 
        message: `Run "npm run ${targetScript}"?`, 
        default: isDefaultYes 
      },
      { signal: AbortSignal.timeout(timeoutMs) }
    );
  } catch (err: any) {
    answer = isDefaultYes;
    console.log(`\nTimeout (${timeoutMs}ms): Defaulting to ${answer ? 'Yes' : 'No'}`);
  }

  if (answer) {
    console.log(`Executing: npm run ${targetScript}\n`);
    try {
      execSync(`npm run ${targetScript}`, { stdio: 'inherit' });
    } catch (e) {
      process.exit(1);
    }
  } else {
    console.log('Aborted.');
  }
}

run();