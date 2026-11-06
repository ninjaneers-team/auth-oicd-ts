import { vi } from 'vitest'
import type { OIDCService } from '../../../src/oidc/OIDCService'

export const mockOIDCService = {
  signInRedirect: vi.fn(),
  signInRedirectCallback: vi.fn(),
  signInSilent: vi.fn(),
  signOutRedirect: vi.fn(),
  isLoggedIn: vi.fn(),
  isLoggingIn: vi.fn(),
  cancelLogin: vi.fn(),
}

vi.mock(import('../../../src/oidc/OIDCService.ts'), () => ({
  OIDCService: vi.fn(function () {
    return mockOIDCService
  }) as unknown as typeof OIDCService,
}))
