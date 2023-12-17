import { Inject, Injectable } from '@angular/core'
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr'
import { ToastrService } from 'ngx-toastr'
import { AppConfig } from 'src/_appconfig/appconfig.interface'
import { APP_SERVICE_CONFIG } from 'src/_appconfig/appconfig.service'

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  private hubConnection?: HubConnection
  constructor(
    @Inject(APP_SERVICE_CONFIG) private config: AppConfig,
    private toastr: ToastrService
  ) {}

  createHubConnection(user: any) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.config.hubUrl + 'presence', {
        accessTokenFactory: () => user.token
      })
      .withAutomaticReconnect()
      .build()

    this.hubConnection.start().catch(error => console.log(error))

    this.hubConnection.on('UserIsOnline', username => {
      this.toastr.info(username + ' has connected')
    })

    this.hubConnection.on('UserIsOffline', username => {
      this.toastr.warning(username + ' has disconnected')
    })
  }

  stopHubConnection() {
    this.hubConnection?.stop().catch(error => console.log(error))
  }
}
