import { vi } from 'vitest'
import type { ExpirationService } from '../../../src/oidc/ExpirationService'

export const mockExpirationService = {
  watchExpiration: vi.fn(),
}

vi.mock(import('../../../src/oidc/ExpirationService.ts'), () => ({
  ExpirationService: vi.fn(function () {
    return mockExpirationService
  }) as unknown as typeof ExpirationService,
}))
