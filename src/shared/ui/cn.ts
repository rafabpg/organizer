/** Junta classes CSS ignorando valores falsos: cn('a', cond && 'b') */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}
