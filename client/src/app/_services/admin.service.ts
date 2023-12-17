import { HttpClient } from '@angular/common/http'
import { Inject, Injectable } from '@angular/core'
import { AppConfig } from 'src/_appconfig/appconfig.interface'
import { APP_SERVICE_CONFIG } from 'src/_appconfig/appconfig.service'
import { User } from '../_models/user'

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(
    private http: HttpClient,
    @Inject(APP_SERVICE_CONFIG) private config: AppConfig
  ) {}

  getUsersWithRoles() {
    return this.http.get<User[]>(this.config.apiUrl + 'admin/users-with-roles')
  }

  updateUserRoles(username: string, roles: string[]) {
    return this.http.post<string[]>(
      this.config.apiUrl + 'admin/edit-roles/' + username + '?roles=' + roles,
      {}
    )
  }
}
