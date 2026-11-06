import { vi } from 'vitest'
import type { BrowserService } from '../../../src/auth/BrowserService'

export const mockBrowserService = {
  pageLoaded: vi.fn(),
}

vi.mock(import('../../../src/auth/BrowserService.ts'), () => ({
  BrowserService: vi.fn(function () {
    return mockBrowserService
  }) as unknown as typeof BrowserService,
}))
