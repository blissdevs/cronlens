export interface CronOutput {
  expression: string;
  preset?: string;
  humanReadable: string;
  nextRuns: string[];
}

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';

function colorize(text: string, color: string): string {
  const noColor = process.env.NO_COLOR || process.env.CI;
  return noColor ? text : `${color}${text}${RESET}`;
}

export function formatOutput(output: CronOutput): void {
  console.log();
  console.log(
    colorize('Expression:', BOLD),
    colorize(output.expression, CYAN)
  );

  if (output.preset) {
    console.log(
      colorize('Preset:    ', BOLD),
      colorize(`@${output.preset}`, YELLOW)
    );
  }

  console.log(
    colorize('Schedule:  ', BOLD),
    colorize(output.humanReadable, GREEN)
  );

  console.log();
  console.log(colorize('Next runs:', BOLD));
  output.nextRuns.forEach((run, i) => {
    const prefix = colorize(`  ${i + 1}.`, DIM);
    console.log(`${prefix} ${run}`);
  });
  console.log();
}
