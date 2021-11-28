// Utilities for generating type-safe CSS.
import { Theme } from './themes';

/**
 * Styling Conventions:
 *
 * - Only use colors from the palette.
 * - Always use `rem` when measuring distance.
 * - Use data attributes to style behavioral permutations.
 */

export function color(id: keyof Theme): string {
  return `var(--color-${id})`;
}

// Use a consistent border radius.
export const radius = '3px';

// Defines breakpoints for device classes.
export const breakpoint = {
  mobile: '576px',
};
