import { HttpClient } from '@angular/common/http'
import { Inject, Injectable } from '@angular/core'
import { BehaviorSubject, map } from 'rxjs'
import { User } from '../_models/user'
import { APP_SERVICE_CONFIG } from '../../_appconfig/appconfig.service'
import { AppConfig } from '../../_appconfig/appconfig.interface'

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private currentUserSource = new BehaviorSubject<User | null>(null)
  currentUser$ = this.currentUserSource.asObservable()

  constructor(
    private http: HttpClient,
    @Inject(APP_SERVICE_CONFIG) private config: AppConfig
  ) {}

  login(model: any) {
    return this.http
      .post<User>(this.config.apiUrl + 'account/login', model)
      .pipe(
        map((user: User) => {
          if (user) this.setCurrentUser(user)
        })
      )
  }

  register(model: any) {
    return this.http
      .post<User>(this.config.apiUrl + 'account/register', model)
      .pipe(
        map((user: User) => {
          if (user) this.setCurrentUser(user)
        })
      )
  }

  setCurrentUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user))
    this.currentUserSource.next(user)
  }

  logout() {
    localStorage.removeItem('user')
    this.currentUserSource.next(null)
  }
}
