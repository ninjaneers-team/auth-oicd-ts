import { vi } from 'vitest'
import type { ErrorHandler } from '../../../src/utils/ConfigUtil'

export const mockConfigUtils = {
  populateDefaults: vi.fn(),
  defaultErrorHandler: vi.fn() as unknown as ErrorHandler,
}

vi.mock(import('../../../src/utils/ConfigUtil.ts'), () => mockConfigUtils)
