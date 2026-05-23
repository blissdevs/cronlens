# cronlens

> Human-readable cron expression parser and scheduler visualizer with next-run previews

---

## Installation

```bash
npm install cronlens
```

---

## Usage

```typescript
import { cronlens } from 'cronlens';

const job = cronlens('0 9 * * 1-5');

console.log(job.describe());
// → "At 09:00 AM, Monday through Friday"

console.log(job.nextRuns(5));
// → [
//     "Mon, Jan 13 2025 09:00:00",
//     "Tue, Jan 14 2025 09:00:00",
//     "Wed, Jan 15 2025 09:00:00",
//     "Thu, Jan 16 2025 09:00:00",
//     "Fri, Jan 17 2025 09:00:00"
//   ]

console.log(job.isValid());
// → true
```

### Visualize a schedule

```typescript
import { visualize } from 'cronlens';

visualize('*/15 * * * *');
// → Runs every 15 minutes
// → Next run in: 7 minutes 42 seconds
// → ████████████░░░░ 75% through current interval
```

---

## API

| Method | Description |
|---|---|
| `cronlens(expr)` | Parse a cron expression |
| `.describe()` | Returns a human-readable description |
| `.nextRuns(n)` | Returns the next `n` scheduled run times |
| `.isValid()` | Validates the cron expression |
| `visualize(expr)` | Prints a visual schedule summary |

---

## License

MIT © cronlens contributors