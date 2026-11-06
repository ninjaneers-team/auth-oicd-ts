import { vi } from 'vitest'
import type { StorageService } from '../../../src/oidc/StorageService'

export const mockStorageService = {
  setRedirectUri: vi.fn(),
  getRedirectUri: vi.fn(),
  setAuth: vi.fn(),
  getAccessToken: vi.fn(),
  setUserInfo: vi.fn(),
  getRefreshToken: vi.fn(),
  getUserInfo: vi.fn(),
  getUserClaim: vi.fn(),
  removeAuth: vi.fn(),
  getIdToken: vi.fn(),
  getAuth: vi.fn(),
  removeRedirectUri: vi.fn(),
  getExpiration: vi.fn(),
  setVerifier: vi.fn(),
  getVerifier: vi.fn(),
  removeVerifier: vi.fn(),
}

vi.mock(import('../../../src/oidc/StorageService.ts'), () => ({
  StorageService: vi.fn(function () {
    return mockStorageService
  }) as unknown as typeof StorageService,
}))
