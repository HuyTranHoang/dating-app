import { Inject, Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Member } from '../_models/member'
import { map, of, take } from 'rxjs'
import { APP_SERVICE_CONFIG } from '../../_appconfig/appconfig.service'
import { AppConfig } from '../../_appconfig/appconfig.interface'
import { PaginatedResult } from '../_models/pagination'
import { UserParams } from '../_models/userParams'
import { AccountService } from './account.service'
import { User } from '../_models/user'
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper'
import { PresenceService } from './presence.service'

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  members: Member[] = []
  memberCache = new Map()
  user: User | undefined
  userParams: UserParams | undefined

  constructor(
    private http: HttpClient,
    @Inject(APP_SERVICE_CONFIG) private config: AppConfig,
    private accountService: AccountService
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => {
        if (user) {
          this.user = user
          this.userParams = new UserParams(user)
        }
      }
    })
  }

  getUserParams() {
    return this.userParams
  }

  setUserParams(params: UserParams) {
    this.userParams = params
  }

  resetUserParams() {
    if (this.user) {
      this.userParams = new UserParams(this.user)
      return this.userParams
    }

    return
  }

  getMembers(userParams: UserParams) {
    const response = this.memberCache.get(Object.values(userParams).join('-'))

    if (response) {
      return of(response)
    }

    let params = getPaginationHeaders(
      userParams.pageNumber,
      userParams.pageSize
    )

    params = params.append('minAge', userParams.minAge)
    params = params.append('maxAge', userParams.maxAge)
    params = params.append('gender', userParams.gender)
    params = params.append('orderBy', userParams.orderBy)

    return getPaginatedResult<Member[]>(
      this.config.apiUrl + 'users',
      params,
      this.http
    ).pipe(
      map(response => {
        this.memberCache.set(Object.values(userParams).join('-'), response)
        return response
      })
    )
  }

  getMember(username: string) {
    const member = [...this.memberCache.values()]
      .reduce((arr, elem) => arr.concat(elem.result), [])
      .find((member: Member) => member.userName === username)

    if (member) {
      return of(member)
    }

    return this.http.get<Member>(this.config.apiUrl + 'users/' + username)
  }

  updateMember(member: Member) {
    return this.http.put(this.config.apiUrl + 'users', member).pipe(
      map(() => {
        const index = this.members.indexOf(member)
        this.members[index] = { ...this.members[index], ...member }
      })
    )
  }

  setMainPhoto(photoId: number) {
    return this.http.put(
      this.config.apiUrl + 'users/set-main-photo/' + photoId,
      {}
    )
  }

  deletePhoto(photoId: number) {
    return this.http.delete(
      this.config.apiUrl + 'users/delete-photo/' + photoId
    )
  }

  addLike(username: string) {
    return this.http.post(this.config.apiUrl + 'likes/' + username, {})
  }

  getLikes(predicate: string, pageNumber: number, pageSize: number) {
    let params = getPaginationHeaders(pageNumber, pageSize)
    params = params.append('predicate', predicate)

    return getPaginatedResult<Member[]>(
      this.config.apiUrl + 'likes',
      params,
      this.http
    )
  }
}
