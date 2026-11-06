import { vi, describe, it, expect, afterAll, beforeEach, beforeAll } from 'vitest'

import { mockLocalStorage } from '../mocks/LocalStorage.mock'
import { StorageService } from '../../src/oidc/StorageService'
import type { TokenResponse, UserInfo } from '../../src/utils/ConfigUtil'

const redirectUri = 'https://app.com/'
const verifier = 'abc'
const auth: TokenResponse = {
  access_token: 'access-token',
  refresh_token: 'refresh_token',
  id_token: 'id-token',
  expires_at: 123,
  user_info: { roles: ['ROLE_ADMIN'] },
}

let unit: StorageService

beforeAll(() => {
  global.localStorage = mockLocalStorage as unknown as typeof localStorage
})

beforeEach(() => {
  unit = new StorageService()
  vi.clearAllMocks()
})

afterAll(() => {
  Reflect.deleteProperty(globalThis, 'localStorage')
})

describe('StorageService', function () {

  it('setAuth', function () {
    // WHEN
    unit.setAuth(auth)

    // THEN
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(unit.AUTH, JSON.stringify(auth))
  })

  it('setUserInfo', function () {
    // GIVEN
    const newUserInfo: UserInfo = { roles: ['ROLE_STUDENT'] }
    const expectedAuth = { ...auth, user_info: newUserInfo }

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(auth))

    // WHEN
    unit.setUserInfo(newUserInfo)

    // THEN
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(unit.AUTH, JSON.stringify(expectedAuth))
  })

  it('getAuth', function () {
    // GIVEN
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(auth))

    // WHEN
    const actualResult = unit.getAuth()

    // THEN
    expect(actualResult).toEqual(auth)
    expect(mockLocalStorage.getItem).toHaveBeenCalledTimes(1)
  })

  it('getUserInfo', function () {
    // GIVEN
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(auth))

    // WHEN
    const actualResult = unit.getUserInfo()

    // THEN
    expect(actualResult).toEqual(auth.user_info)
    expect(mockLocalStorage.getItem).toHaveBeenCalledTimes(1)
  })

  it('getUserClaim', function () {
    // GIVEN
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(auth))

    // WHEN
    const actualResult = unit.getUserClaim('roles')

    // THEN
    expect(actualResult).toEqual(auth.user_info?.roles)
    expect(mockLocalStorage.getItem).toHaveBeenCalledTimes(1)
  })

  it('getExpiration', function () {
    // GIVEN
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(auth))

    // WHEN
    const actualResult = unit.getExpiration()

    // THEN
    expect(actualResult).toEqual(auth.expires_at)
    expect(mockLocalStorage.getItem).toHaveBeenCalledTimes(1)
  })

  it('getIdToken', function () {
    // GIVEN
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(auth))

    // WHEN
    const actualResult = unit.getIdToken()

    // THEN
    expect(actualResult).toEqual(auth.id_token)
    expect(mockLocalStorage.getItem).toHaveBeenCalledTimes(1)
  })

  it('getAccessToken', function () {
    // GIVEN
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(auth))

    // WHEN
    const actualResult = unit.getAccessToken()

    // THEN
    expect(actualResult).toEqual(auth.access_token)
    expect(mockLocalStorage.getItem).toHaveBeenCalledTimes(1)
  })

  it('getRefreshToken', function () {
    // GIVEN
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(auth))

    // WHEN
    const actualResult = unit.getRefreshToken()

    // THEN
    expect(actualResult).toEqual(auth.refresh_token)
    expect(mockLocalStorage.getItem).toHaveBeenCalledTimes(1)
  })

  it('removeAuth', function () {
    // WHEN
    unit.removeAuth()

    // THEN
    expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(1)
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(unit.AUTH)
  })

  it('setRedirectUri', function () {
    // WHEN
    unit.setRedirectUri(redirectUri)

    // THEN
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(unit.ACTIVE_REDIRECT_URI, redirectUri)
  })

  it('getRedirectUri', function () {
    // GIVEN
    mockLocalStorage.getItem.mockReturnValue(redirectUri)

    // WHEN
    const actualResult = unit.getRedirectUri()

    // THEN
    expect(actualResult).toEqual(redirectUri)
    expect(mockLocalStorage.getItem).toHaveBeenCalledTimes(1)
  })

  it('removeRedirectUri', function () {
    // WHEN
    unit.removeRedirectUri()

    // THEN
    expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(1)
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(unit.ACTIVE_REDIRECT_URI)
  })

  it('setVerifier', function () {
    // WHEN
    unit.setVerifier(verifier)

    // THEN
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(unit.VERIFIER, verifier)
  })

  it('getVerifier', function () {
    // GIVEN
    mockLocalStorage.getItem.mockReturnValue(verifier)

    // WHEN
    const actualResult = unit.getVerifier()

    // THEN
    expect(actualResult).toEqual(verifier)
    expect(mockLocalStorage.getItem).toHaveBeenCalledTimes(1)
  })

  it('removeVerifier', function () {
    // WHEN
    unit.removeVerifier()

    // THEN
    expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(1)
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(unit.VERIFIER)
  })
})
