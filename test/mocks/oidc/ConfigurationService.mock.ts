import { vi } from 'vitest'
import type { ConfigurationService } from '../../../src/oidc/ConfigurationService'

export const mockConfigurationService = {
  getAuthEndpoint: vi.fn(),
  getTokenEndpoint: vi.fn(),
  getUserInfoEndpoint: vi.fn(),
  getLogoutEndpoint: vi.fn(),
}

vi.mock(import('../../../src/oidc/ConfigurationService.ts'), () => ({
  ConfigurationService: vi.fn(function () {
    return mockConfigurationService
  }) as unknown as typeof ConfigurationService,
}))
