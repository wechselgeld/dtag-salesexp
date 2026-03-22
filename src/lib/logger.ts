import { createConsola } from 'consola';
import pc from 'picocolors';

export const logger = createConsola({
  level: 3,
  formatOptions: {
    date: true,
    colors: true,
    compact: false,
  },
});

export const dbLogger = logger.withTag('DB');
export const cacheLogger = logger.withTag('CACHE');
export const httpLogger = logger.withTag('HTTP');

export const formatDuration = (ms: number) => {
  if (ms < 50) {
    return pc.green(`${ms}ms`);
  }
  if (ms < 200) {
    return pc.yellow(`${ms}ms`);
  }
  return pc.red(`${ms}ms`);
};

export const formatStatus = (status: number) => {
  if (status < 300) {
    return pc.green(status.toString());
  }
  if (status < 400) {
    return pc.cyan(status.toString());
  }
  return pc.red(status.toString());
};

export const formatQuery = (query: string) => {
  return query
    .replace(/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|JOIN|ORDER BY|GROUP BY|HAVING|LIMIT|OFFSET|SET|VALUES|AND|OR|IN|AS|ON|DISTINCT|NOT|NULL|IS)\b/g, (match) => pc.cyan(pc.bold(match)))
    .replace(/\b(prisma|Prisma|Client)\b/g, (match) => pc.magenta(match))
    .replace(/"(\w+)"/g, (match) => pc.white(match));
};
