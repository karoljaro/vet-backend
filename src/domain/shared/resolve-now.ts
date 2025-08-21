export type TimeDeps = { now?: () => Date } | undefined;

export function resolveNow(deps: TimeDeps): Date {
  return deps?.now ? deps.now() : new Date();
}
