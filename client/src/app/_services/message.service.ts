import { Inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

import { getPaginatedResult, getPaginationHeaders } from './paginationHelper'
import { Message } from '../_models/message'

import { APP_SERVICE_CONFIG } from '../../_appconfig/appconfig.service'
import { AppConfig } from '../../_appconfig/appconfig.interface'

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  constructor(
    private http: HttpClient,
    @Inject(APP_SERVICE_CONFIG) private config: AppConfig
  ) {}

  getMessages(pageNumber: number, pageSize: number, container: string) {
    let params = getPaginationHeaders(pageNumber, pageSize)
    params = params.append('Container', container)
    return getPaginatedResult<Message[]>(this.config.apiUrl + 'messages', params, this.http)
  }

  getMessageThread(username: string) {
    return this.http.get<Message[]>(this.config.apiUrl + 'messages/thread/' + username)
  }

  sendMessage(username: string, content: string) {
    return this.http.post<Message>(this.config.apiUrl + 'messages', {
      recipientUsername: username,
      content
    })
  }

  deleteMessage(id: number) {
    return this.http.delete(this.config.apiUrl + 'messages/' + id)
  }
}
