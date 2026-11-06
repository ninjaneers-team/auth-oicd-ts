import type { OpenIdConfiguration } from '../utils/ConfigUtil'

export class ConfigurationService {

  CONFIGURATION_ENDPOINT = '/.well-known/openid-configuration'

  authority: string

  config?: OpenIdConfiguration

  constructor(authority: string) {
    this.authority = authority
  }

  async getAuthEndpoint(): Promise<string | undefined> {
    if (!this.config) {
      await this._load()
    }

    return this.config?.authorization_endpoint
  }

  async getTokenEndpoint(): Promise<string | undefined> {
    if (!this.config) {
      await this._load()
    }

    return this.config?.token_endpoint
  }

  async getUserInfoEndpoint(): Promise<string | undefined> {
    if (!this.config) {
      await this._load()
    }

    return this.config?.userinfo_endpoint
  }

  async getLogoutEndpoint(): Promise<string | undefined> {
    if (!this.config) {
      await this._load()
    }

    return this.config?.end_session_endpoint
  }

  _load(): Promise<void> {
    const url = [this.authority, this.CONFIGURATION_ENDPOINT].join('')

    return fetch(url, { method: 'GET' })
      .then(response => response.json())
      .then((json: OpenIdConfiguration) => {
        this.config = json
      })
  }
}
