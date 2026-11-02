/**
 * Author: Domonick Mack
 * Date: 2026-11-02
 * Description: Custom theme hook resolving dynamic Apple HIG colors based on active color scheme.
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? 'dark' : 'light';

  return Colors[theme];
}
