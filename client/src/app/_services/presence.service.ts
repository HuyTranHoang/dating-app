import { Inject, Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr'
import { ToastrService } from 'ngx-toastr'
import { BehaviorSubject, take } from 'rxjs'
import { AppConfig } from 'src/_appconfig/appconfig.interface'
import { APP_SERVICE_CONFIG } from 'src/_appconfig/appconfig.service'

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  private hubConnection?: HubConnection
  private onlineUsersSource = new BehaviorSubject<string[]>([])
  onlineUsers$ = this.onlineUsersSource.asObservable()

  constructor(
    @Inject(APP_SERVICE_CONFIG) private config: AppConfig,
    private toastr: ToastrService,
    private router: Router
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
      this.onlineUsers$.pipe(take(1)).subscribe(usernames => {
        this.onlineUsersSource.next([...usernames, username])
      })
    })

    this.hubConnection.on('UserIsOffline', username => {
      this.onlineUsers$.pipe(take(1)).subscribe(usernames => {
        this.onlineUsersSource.next([...usernames.filter(x => x !== username)])
      })
    })

    this.hubConnection.on('GetOnlineUsers', (usernames: string[]) => {
      console.log(usernames)
      this.onlineUsersSource.next(usernames)
    })

    this.hubConnection.on('NewMessageReceived', ({ username, knownAs }) => {
      this.toastr
        .info(knownAs + ' has sent you a new message! Click me to see it')
        .onTap.pipe(take(1))
        .subscribe({
          next: () =>
            this.router.navigateByUrl('/members/' + username + '?tab=Messages')
        })
    })
  }

  stopHubConnection() {
    this.hubConnection?.stop().catch(error => console.log(error))
  }
}
