import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { mockOIDCService } from '../mocks/oidc/OIDCService.mock'
import { mockConfigUtils } from '../mocks/utils/ConfigUtil.mock'

// Dynamic import is intentional: mock modules must be evaluated (registering vi.mock) before the unit loads.
const { BrowserService } = await import('../../src/auth/BrowserService')

const isLoggedIn = vi.fn()
const login = vi.fn()
const replaceStateMock = vi.fn()

let unit: InstanceType<typeof BrowserService>

beforeAll(() => {
  global.window = {
    location: {
      href: 'https://site.com/',
    },
    history: {
      replaceState: replaceStateMock,
    },
  } as unknown as typeof window
})

beforeEach(() => {
  unit = new BrowserService(mockConfigUtils.defaultErrorHandler, true, mockOIDCService, isLoggedIn, login)
  vi.clearAllMocks()
})

afterAll(() => {
  Reflect.deleteProperty(globalThis, 'window')
})

describe('BrowserService pageLoaded', function () {

  it('nominal', function () {
    // GIVEN
    mockOIDCService.isLoggingIn.mockReturnValue(false)
    isLoggedIn.mockReturnValue(false)

    // WHEN
    unit.pageLoaded()

    // THEN
    expect(login).toHaveBeenCalledTimes(1)
  })

  it('failed', function () {
    // GIVEN
    mockOIDCService.isLoggingIn.mockReturnValue(true)
    window.location.href = 'https://site.com?error=123&error_description=123'

    // WHEN
    unit.pageLoaded()

    // THEN
    expect(mockOIDCService.cancelLogin).toHaveBeenCalledTimes(1)
    expect(replaceStateMock).toHaveBeenCalledTimes(1)
    expect(replaceStateMock).toHaveBeenCalledWith({}, '', 'https://site.com/')
    expect(login).toHaveBeenCalledTimes(1)
  })

  it('code', async function () {
    // GIVEN
    mockOIDCService.isLoggingIn.mockReturnValue(true)
    window.location.href = 'https://site.com?code=123'

    mockOIDCService.signInRedirectCallback.mockResolvedValue(undefined)

    // WHEN
    await unit.pageLoaded()

    // THEN
    expect(mockOIDCService.signInRedirectCallback).toHaveBeenCalledTimes(1)
    expect(mockOIDCService.signInRedirectCallback).toHaveBeenCalledWith('123')
    expect(mockOIDCService.cancelLogin).toHaveBeenCalledTimes(1)
    expect(window.location.href).toEqual('https://site.com/')
  })

  it('code failed', async function () {
    // GIVEN
    mockOIDCService.isLoggingIn.mockReturnValue(true)
    window.location.href = 'https://site.com?code=123'

    mockOIDCService.signInRedirectCallback.mockRejectedValue(undefined)

    // WHEN
    await unit.pageLoaded()

    // THEN
    expect(mockOIDCService.signInRedirectCallback).toHaveBeenCalledTimes(1)
    expect(mockOIDCService.signInRedirectCallback).toHaveBeenCalledWith('123')
    expect(mockOIDCService.cancelLogin).toHaveBeenCalledTimes(1)
    expect(replaceStateMock).toHaveBeenCalledTimes(1)
    expect(replaceStateMock).toHaveBeenCalledWith({}, '', 'https://site.com/')
    expect(mockConfigUtils.defaultErrorHandler).toHaveBeenCalledTimes(1)
    expect(mockConfigUtils.defaultErrorHandler).toHaveBeenCalledWith('Auth failed: cant obtain token')
  })
})
