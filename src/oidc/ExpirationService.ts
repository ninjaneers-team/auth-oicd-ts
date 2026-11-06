import type { WatcherActions } from '../utils/ConfigUtil'

export class ExpirationService {

  actions: WatcherActions

  constructor(actions: WatcherActions) {
    this.actions = actions
  }

  watchExpiration(): void {
    this._checkExpiration()
    setInterval(this._checkExpiration, 5000)
  }

  _checkExpiration = async (): Promise<void> => {
    if (!this.actions.checkExpiration()) {
      delete this.actions.reload
      return
    }

    return this.actions.refresh()
      .then(() => this.actions.reload && this.actions.reload())
      .catch((e) => {
        if ((e as Error).message !== 'Failed to fetch') {
          this.actions.forgetSession()
        }
      })
  }
}
