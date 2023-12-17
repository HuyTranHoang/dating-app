import {
  Directive,
  Input,
  OnInit,
  TemplateRef,
  ViewContainerRef
} from '@angular/core'
import { User } from '../_models/user'
import { AccountService } from '../_services/account.service'
import { take } from 'rxjs'

@Directive({
  selector: '[appHasRole]' // *appHasRole="['Admin', 'User']"
})
export class HasRoleDirective implements OnInit {
  @Input() appHasRole: string[] = []
  user: User | null = null

  constructor(
    private viewContainerRef: ViewContainerRef,
    private templateRef: TemplateRef<any>,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    // get user from account service
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe(user => (this.user = user))

    // clear view if no roles
    if (!this.user?.roles || this.user == null) {
      this.viewContainerRef.clear()
      return
    }

    // if user has role need then render element
    if (this.user?.roles.some(r => this.appHasRole.includes(r))) {
      this.viewContainerRef.createEmbeddedView(this.templateRef)
    } else {
      this.viewContainerRef.clear()
    }
  }
}
