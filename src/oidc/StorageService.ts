import type { TokenResponse, UserInfo } from '../utils/ConfigUtil'

export class StorageService {

  AUTH = 'active_auth'
  ACTIVE_REDIRECT_URI = 'active_auth_redirect_uri'
  VERIFIER = 'verifier'

  setAuth(auth: TokenResponse): void {
    localStorage.setItem(this.AUTH, JSON.stringify(auth))
  }

  setUserInfo(userInfo: UserInfo): void {
    const session = this._readSession()
    session.user_info = userInfo
    localStorage.setItem(this.AUTH, JSON.stringify(session))
  }

  getAuth(): TokenResponse | undefined {
    return this._readSession()
  }

  getUserInfo(): UserInfo | undefined {
    return this._readSession().user_info
  }

  getUserClaim(claim?: string): unknown {
    if (claim === undefined) {
      return undefined
    }

    return this._readSession().user_info?.[claim]
  }

  getExpiration(): number | undefined {
    return this._readSession().expires_at
  }

  getIdToken(): string | undefined {
    return this._readSession().id_token
  }

  getAccessToken(): string | undefined {
    return this._readSession().access_token
  }

  getRefreshToken(): string | undefined {
    return this._readSession().refresh_token
  }

  removeAuth(): void {
    localStorage.removeItem(this.AUTH)
  }

  setRedirectUri(redirectUri: string): void {
    localStorage.setItem(this.ACTIVE_REDIRECT_URI, redirectUri)
  }

  getRedirectUri(): string | null {
    return localStorage.getItem(this.ACTIVE_REDIRECT_URI)
  }

  removeRedirectUri(): void {
    localStorage.removeItem(this.ACTIVE_REDIRECT_URI)
  }

  setVerifier(verifier: string): void {
    localStorage.setItem(this.VERIFIER, verifier)
  }

  getVerifier(): string | null {
    return localStorage.getItem(this.VERIFIER)
  }

  removeVerifier(): void {
    localStorage.removeItem(this.VERIFIER)
  }

  _readSession(): TokenResponse {
    const raw = localStorage.getItem(this.AUTH)
    return raw ? (JSON.parse(raw) as TokenResponse) : {}
  }
}
