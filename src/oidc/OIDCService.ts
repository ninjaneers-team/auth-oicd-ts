import { ConfigurationService } from './ConfigurationService'
import { ExpirationService } from './ExpirationService'
import { StorageService } from './StorageService'
import type { TokenResponse, UserInfo, WatcherActions } from '../utils/ConfigUtil'

export class OIDCService {

  CLIENT_ID_PARAMETER = 'client_id'
  REDIRECT_URI_PARAMETER = 'redirect_uri'
  POST_LOGOUT_REDIRECT_URI_PARAMETER = 'post_logout_redirect_uri'
  ID_TOKEN_HINT_URI_PARAMETER = 'id_token_hint'
  RESPONSE_TYPE_PARAMETER = 'response_type'
  SCOPE_URI_PARAMETER = 'scope'
  CODE_CHALLENGE = 'code_challenge'
  CHALLENGE_METHOD = 'code_challenge_method'

  CODE = 'code'
  OPEN_ID = 'openid'
  S256 = 'S256'
  PLAIN = 'plain'

  WATCHER_ACTIONS: WatcherActions = {
    checkExpiration: (): boolean => {
      if (!this.isLoggedIn()) {
        return false
      }

      const expiration = this.storageService.getExpiration()
      return expiration !== undefined && expiration < Date.now() + 30000
    },
    forgetSession: (): void => {
      this.storageService.removeAuth()
      window.location.reload()
    },
    reload: (): void => {
      window.location.reload()
    },
    refresh: async (): Promise<void> => {
      await this.signInSilent()
    },
  }

  clientId: string
  configurationService: ConfigurationService
  expirationWatcher: ExpirationService
  storageService: StorageService

  constructor(authority: string, clientId: string) {
    if (!authority || !clientId) {
      throw new Error('Wrong configuration')
    }

    this.clientId = clientId

    this.configurationService = new ConfigurationService(authority)
    this.expirationWatcher = new ExpirationService(this.WATCHER_ACTIONS)
    this.storageService = new StorageService()

    this.expirationWatcher.watchExpiration()
  }

  async signInRedirect(redirectUri: string): Promise<void> {
    const endpoint = await this.configurationService.getAuthEndpoint()

    if (!endpoint) {
      throw new Error('Cant obtain endpoint')
    }

    const codeVerifier = this._generateCodeVerifier()
    const codeChallenge = await this._generateCodeChallenge(codeVerifier)
    const challengeMethod = window.crypto.subtle ? this.S256 : this.PLAIN

    const parameters = [
      this._constructParam(this.CLIENT_ID_PARAMETER, this.clientId),
      this._constructParam(this.REDIRECT_URI_PARAMETER, encodeURIComponent(redirectUri)),
      this._constructParam(this.RESPONSE_TYPE_PARAMETER, this.CODE),
      this._constructParam(this.SCOPE_URI_PARAMETER, this.OPEN_ID),
      this._constructParam(this.CODE_CHALLENGE, codeChallenge),
      this._constructParam(this.CHALLENGE_METHOD, challengeMethod),
    ].join('&')

    const href = [endpoint, '?', parameters].join('')

    this.storageService.setRedirectUri(redirectUri)
    this.storageService.setVerifier(codeVerifier)
    window.location.replace(href)
  }

  async signInRedirectCallback(code: string): Promise<void> {
    const endpoint = await this.configurationService.getTokenEndpoint()

    if (!endpoint) {
      throw new Error('Cant obtain endpoint')
    }

    const response = await fetch(endpoint,
      {
        method: 'POST',
        body: new URLSearchParams({
          code,
          grant_type: 'authorization_code',
          client_id: this.clientId,
          redirect_uri: this.storageService.getRedirectUri() ?? '',
          code_verifier: this.storageService.getVerifier() ?? '',
        }),
      })

    const json = await response.json() as TokenResponse

    if (!json.expires_in) {
      throw new Error('Cant obtain token')
    }

    json.expires_at = Date.now() + json.expires_in * 1000

    this.storageService.setAuth(json)

    await this._getUserInfo()
  }

  async signInSilent(): Promise<void> {
    const endpoint = await this.configurationService.getTokenEndpoint()

    if (!endpoint) {
      throw new Error('Cant obtain endpoint')
    }

    const response = await fetch(endpoint,
      {
        method: 'POST',
        body: new URLSearchParams({
          refresh_token: this.storageService.getRefreshToken() ?? '',
          grant_type: 'refresh_token',
          client_id: this.clientId,
        }),
      })

    const json = await response.json() as TokenResponse

    if (!json.expires_in) {
      throw new Error('Cant refresh token')
    }

    json.expires_at = Date.now() + json.expires_in * 1000
    json.userInfo = this.storageService.getUserInfo()

    this.storageService.setAuth(json)

    await this._getUserInfo()
  }

  async signOutRedirect(redirectUri: string): Promise<void> {
    const endpoint = await this.configurationService.getLogoutEndpoint()

    if (!endpoint) {
      throw new Error('Cant obtain endpoint')
    }

    const parameters = [
      this._constructParam(this.POST_LOGOUT_REDIRECT_URI_PARAMETER, encodeURIComponent(redirectUri)),
      this._constructParam(this.ID_TOKEN_HINT_URI_PARAMETER, this.storageService.getIdToken() ?? ''),
    ].join('&')

    const href = [endpoint, '?', parameters].join('')

    this.storageService.removeAuth()

    window.location.replace(href)
  }

  isLoggedIn(): boolean {
    return !!this.storageService.getAuth() && !!this.storageService.getUserInfo()
  }

  isLoggingIn(): boolean {
    return !!this.storageService.getRedirectUri()
  }

  cancelLogin(): void {
    this.storageService.removeRedirectUri()
    this.storageService.removeVerifier()
  }

  async _getUserInfo(): Promise<void> {
    const endpoint = await this.configurationService.getUserInfoEndpoint()

    if (!endpoint) {
      throw new Error('Cant obtain endpoint')
    }

    const response = await fetch(endpoint,
      {
        method: 'GET',
        headers: [['Authorization', 'Bearer ' + this.storageService.getAccessToken()]],
      })

    const json = await response.json() as UserInfo

    if (!json.sub) {
      throw new Error('Cant get user info')
    }

    this.storageService.setUserInfo(json)
  }

  _generateCodeVerifier(): string {
    const randomBytes = window.crypto.getRandomValues(new Uint8Array(64))
    return this._base64UrlEncode(randomBytes.buffer)
  }

  async _generateCodeChallenge(codeVerifier: string): Promise<string> {
    if (window.crypto.subtle) {
      const encoder = new TextEncoder()
      const data = encoder.encode(codeVerifier)
      const digest = await window.crypto.subtle.digest('SHA-256', data)

      return this._base64UrlEncode(digest)
    }

    return codeVerifier
  }

  _base64UrlEncode(arrayBuffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  _constructParam(name: string, value: string): string {
    return name.concat('=')
      .concat(value)
  }
}
