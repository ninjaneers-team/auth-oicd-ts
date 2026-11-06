import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { mockOIDCService } from '../mocks/oidc/OIDCService.mock'
import { mockStorageService } from '../mocks/oidc/StorageService.mock'
import { mockConfigUtils } from '../mocks/utils/ConfigUtil.mock'
import '../mocks/auth/BrowserService.mock'

// Dynamic import is intentional: mock modules must be evaluated (registering vi.mock) before the unit loads.
const { AuthService } = await import('../../src/auth/AuthService')

const oidcConfig = {
  authority: 'https://auth.com/123',
  clientId: '123',
}
const config = {
  authority: 'https://auth.com/123',
  clientId: '123',
  autoLogin: false,
  errorHandler: mockConfigUtils.defaultErrorHandler,
}

let unit: InstanceType<typeof AuthService>

beforeAll(() => {
  global.window = {
    location: {
      href: 'https://site.com/',
    },
  } as unknown as typeof window
})

beforeEach(() => {
  mockConfigUtils.populateDefaults.mockReturnValue(config)
  unit = new AuthService(oidcConfig)
  vi.clearAllMocks()
})

afterAll(() => {
  Reflect.deleteProperty(globalThis, 'window')
})

describe('AuthService login', function () {

  it('nominal', async function () {
    // GIVEN
    mockOIDCService.signInRedirect.mockResolvedValue(undefined)

    // WHEN
    await unit.login()

    // THEN
    expect(mockOIDCService.signInRedirect).toHaveBeenCalledTimes(1)
    expect(mockOIDCService.signInRedirect).toHaveBeenCalledWith(window.location.href)
  })

  it('with URL', async function () {
    // GIVEN
    const url = 'https://app.com/page'
    mockOIDCService.signInRedirect.mockResolvedValue(undefined)

    // WHEN
    await unit.login(url)

    // THEN
    expect(mockOIDCService.signInRedirect).toHaveBeenCalledTimes(1)
    expect(mockOIDCService.signInRedirect).toHaveBeenCalledWith(url)
  })

  it('with config URL', async function () {
    // GIVEN
    const url = 'https://app.com/page'
    mockConfigUtils.populateDefaults.mockReturnValue({ ...config, callbackUrl: url })
    unit = new AuthService(oidcConfig)
    mockOIDCService.signInRedirect.mockResolvedValue(undefined)

    // WHEN
    await unit.login()

    // THEN
    expect(mockOIDCService.signInRedirect).toHaveBeenCalledTimes(1)
    expect(mockOIDCService.signInRedirect).toHaveBeenCalledWith(url)
  })

  it('failed', async function () {
    // GIVEN
    mockOIDCService.signInRedirect.mockRejectedValue(undefined)

    // WHEN
    await unit.login()

    // THEN
    expect(mockOIDCService.signInRedirect).toHaveBeenCalledTimes(1)
    expect(mockOIDCService.signInRedirect).toHaveBeenCalledWith(window.location.href)
    expect(mockConfigUtils.defaultErrorHandler).toHaveBeenCalledTimes(1)
  })
})

describe('AuthService logout', function () {

  it('nominal', async function () {
    // GIVEN
    mockOIDCService.signOutRedirect.mockResolvedValue(undefined)

    // WHEN
    await unit.logout()

    // THEN
    expect(mockOIDCService.signOutRedirect).toHaveBeenCalledTimes(1)
    expect(mockOIDCService.signOutRedirect).toHaveBeenCalledWith(window.location.href)
  })

  it('with URL', async function () {
    // GIVEN
    const url = 'https://app.com/page'
    mockOIDCService.signOutRedirect.mockResolvedValue(undefined)

    // WHEN
    await unit.logout(url)

    // THEN
    expect(mockOIDCService.signOutRedirect).toHaveBeenCalledTimes(1)
    expect(mockOIDCService.signOutRedirect).toHaveBeenCalledWith(url)
  })

  it('with config URL', async function () {
    // GIVEN
    const url = 'https://app.com/page'
    mockConfigUtils.populateDefaults.mockReturnValue({ ...config, callbackUrl: url })
    unit = new AuthService(oidcConfig)
    mockOIDCService.signOutRedirect.mockResolvedValue(undefined)

    // WHEN
    await unit.logout()

    // THEN
    expect(mockOIDCService.signOutRedirect).toHaveBeenCalledTimes(1)
    expect(mockOIDCService.signOutRedirect).toHaveBeenCalledWith(url)
  })

  it('failed', async function () {
    // GIVEN
    mockOIDCService.signOutRedirect.mockRejectedValue(undefined)

    // WHEN
    await unit.logout()

    // THEN
    expect(mockOIDCService.signOutRedirect).toHaveBeenCalledTimes(1)
    expect(mockOIDCService.signOutRedirect).toHaveBeenCalledWith(window.location.href)
    expect(mockConfigUtils.defaultErrorHandler).toHaveBeenCalledTimes(1)
  })
})

describe('AuthService isLoggedIn', function () {

  it('nominal', function () {
    // GIVEN
    mockOIDCService.isLoggedIn.mockReturnValue(true)

    // WHEN
    expect(unit.isLoggedIn()).toBeTruthy()

    // THEN
    expect(mockOIDCService.isLoggedIn).toHaveBeenCalledTimes(1)
  })

  it('not logged in', function () {
    // GIVEN
    mockOIDCService.isLoggedIn.mockReturnValue(false)

    // WHEN
    expect(unit.isLoggedIn()).toBeFalsy()

    // THEN
    expect(mockOIDCService.isLoggedIn).toHaveBeenCalledTimes(1)
  })
})

describe('AuthService getUserInfo', function () {

  it('nominal', function () {
    // GIVEN
    mockOIDCService.isLoggedIn.mockReturnValue(true)
    mockStorageService.getUserClaim.mockReturnValue('info')

    // WHEN
    expect(unit.getUserInfo()).toEqual('info')

    // THEN
    expect(mockOIDCService.isLoggedIn).toHaveBeenCalledTimes(1)
    expect(mockStorageService.getUserClaim).toHaveBeenCalledTimes(1)
  })

  it('not logged in', function () {
    // GIVEN
    mockOIDCService.isLoggedIn.mockReturnValue(false)

    // WHEN
    expect(unit.getUserInfo.bind(unit)).toThrow(new Error('No active auth or auth is in progress'))

    // THEN
    expect(mockOIDCService.isLoggedIn).toHaveBeenCalledTimes(1)
  })
})

describe('AuthService getToken', function () {

  it('nominal', function () {
    // GIVEN
    mockOIDCService.isLoggedIn.mockReturnValue(true)
    mockStorageService.getAccessToken.mockReturnValue('token')

    // WHEN
    expect(unit.getToken()).toEqual('token')

    // THEN
    expect(mockOIDCService.isLoggedIn).toHaveBeenCalledTimes(1)
    expect(mockStorageService.getAccessToken).toHaveBeenCalledTimes(1)
  })

  it('not logged in', function () {
    // GIVEN
    mockOIDCService.isLoggedIn.mockReturnValue(false)

    // WHEN
    expect(unit.getToken.bind(unit)).toThrow(new Error('No active auth or auth is in progress'))

    // THEN
    expect(mockOIDCService.isLoggedIn).toHaveBeenCalledTimes(1)
  })
})

describe('AuthService tryToRefresh', function () {

  it('nominal', async function () {
    // GIVEN
    mockOIDCService.isLoggedIn.mockReturnValue(true)

    // WHEN
    await unit.tryToRefresh()

    // THEN
    expect(mockOIDCService.isLoggedIn).toHaveBeenCalledTimes(1)
    expect(mockOIDCService.signInSilent).toHaveBeenCalledTimes(1)
  })

  it('not logged in', async function () {
    expect.assertions(2)
    mockOIDCService.isLoggedIn.mockReturnValue(false)

    // WHEN
    await expect(unit.tryToRefresh())
      .rejects
      .toThrow('No active auth or auth is in progress')

    // THEN
    expect(mockOIDCService.isLoggedIn).toHaveBeenCalledTimes(1)
  })
})
