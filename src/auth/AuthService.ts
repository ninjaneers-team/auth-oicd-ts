import { populateDefaults } from '../utils/ConfigUtil'
import type { AuthConfig, ResolvedConfig } from '../utils/ConfigUtil'
import { OIDCService } from '../oidc/OIDCService'
import { StorageService } from '../oidc/StorageService'
import { BrowserService } from './BrowserService'

export class AuthService {

  config: ResolvedConfig
  oidcService: OIDCService
  storageService: StorageService

  constructor(userConfig: Partial<AuthConfig>) {
    this.config = populateDefaults(userConfig) as ResolvedConfig

    this.oidcService = new OIDCService(this.config.authority, this.config.clientId)
    this.storageService = new StorageService()

    const browserService = new BrowserService(this.config.errorHandler, this.config.autoLogin, this.oidcService,
      this.isLoggedIn.bind(this), this.login.bind(this))

    browserService.pageLoaded()
  }

  login(callbackUrl?: string): void {
    this.oidcService.signInRedirect(callbackUrl ?? this.config.callbackUrl ?? window.location.href)
      .catch(() => this.config.errorHandler('Auth failed: cant perform login redirect'))
  }

  logout(callbackUrl?: string): void {
    this.oidcService.signOutRedirect(callbackUrl ?? this.config.callbackUrl ?? window.location.href)
      .catch(() => this.config.errorHandler('Auth failed: cant perform logout redirect'))
  }

  isLoggedIn(): boolean {
    return this.oidcService.isLoggedIn()
  }

  getUserInfo(claim?: string): unknown {
    if (!this.isLoggedIn()) {
      throw new Error('No active auth or auth is in progress')
    }

    return this.storageService.getUserClaim(claim)
  }

  getToken(): string | undefined {
    if (!this.isLoggedIn()) {
      throw new Error('No active auth or auth is in progress')
    }

    return this.storageService.getAccessToken()
  }

  async tryToRefresh(): Promise<void> {
    if (!this.isLoggedIn()) {
      throw new Error('No active auth or auth is in progress')
    }

    await this.oidcService.signInSilent()
  }
}
