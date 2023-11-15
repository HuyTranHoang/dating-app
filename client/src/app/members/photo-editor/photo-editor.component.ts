import { Component, Inject, Input, OnInit } from '@angular/core'
import { Member } from '../../_models/member'
import { FileUploader } from 'ng2-file-upload'
import { APP_SERVICE_CONFIG } from '../../../_appconfig/appconfig.service'
import { AppConfig } from '../../../_appconfig/appconfig.interface'
import { User } from '../../_models/user'
import { AccountService } from '../../_services/account.service'
import { take } from 'rxjs'
import { MembersService } from 'src/app/_services/members.service'

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css'],
})
export class PhotoEditorComponent implements OnInit {
  @Input() member: Member | undefined
  uploader: FileUploader | undefined
  hasBaseDropZoneOver = false
  user: User | undefined

  constructor(
    @Inject(APP_SERVICE_CONFIG) private config: AppConfig,
    private accountService: AccountService,
    private memberService: MembersService
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => {
        if (user) this.user = user
      },
    })
  }

  ngOnInit(): void {
    this.initializeUploader()
  }

  fileOverBase(e: any) {
    this.hasBaseDropZoneOver = e
  }

  setMainPhoto(photo: any) {
    this.memberService.setMainPhoto(photo.id).subscribe({
      next: () => {
        if (this.user && this.member) {
          this.user.photoUrl = photo.url
          this.accountService.setCurrentUser(this.user)
          this.member.photoUrl = photo.url
          this.member.photos.forEach(p => {
            if (p.isMain) p.isMain = false
            if (p.id === photo.id) p.isMain = true
          })
        }
      },
    })
  }

  deletePhoto(PhotoId: number) {
    this.memberService.deletePhoto(PhotoId).subscribe({
      next: () => {
        if (this.member) {
          this.member.photos = this.member.photos.filter(x => x.id !== PhotoId)
        }
      },
    })
  }

  initializeUploader() {
    this.uploader = new FileUploader({
      url: this.config.apiUrl + 'users/add-photo',
      authToken: 'Bearer ' + this.user?.token,
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024,
    })

    this.uploader.onAfterAddingFile = file => {
      file.withCredentials = false
    }

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      if (response) {
        const photo = JSON.parse(response)
        this.member?.photos.push(photo)
      }
    }
  }
}
