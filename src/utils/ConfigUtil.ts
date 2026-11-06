export type ErrorHandler = (error: string) => void

export interface AuthConfig {
  authority: string
  clientId: string
  callbackUrl?: string
  autoLogin?: boolean
  errorHandler?: ErrorHandler
}

export interface ResolvedConfig {
  authority: string
  clientId: string
  callbackUrl?: string
  autoLogin: boolean
  errorHandler: ErrorHandler
}

export interface TokenResponse {
  expires_in?: number
  expires_at?: number
  access_token?: string
  refresh_token?: string
  id_token?: string
  user_info?: UserInfo
  userInfo?: UserInfo
  [key: string]: unknown
}

export interface UserInfo {
  sub?: string
  [claim: string]: unknown
}

export interface OpenIdConfiguration {
  authorization_endpoint?: string
  token_endpoint?: string
  userinfo_endpoint?: string
  end_session_endpoint?: string
}

export interface WatcherActions {
  checkExpiration: () => boolean
  forgetSession: () => void
  reload?: () => void
  refresh: () => Promise<unknown>
}

export function populateDefaults(config: Partial<AuthConfig>): Partial<ResolvedConfig> {
  return {
    ...config,
    autoLogin: config.autoLogin ?? false,
    errorHandler: config.errorHandler ?? defaultErrorHandler,
  }
}

export function defaultErrorHandler(error: string): void {
  console.log(error)
}
