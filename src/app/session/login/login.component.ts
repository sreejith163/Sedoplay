import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Ims } from '../../models/ims.model';
import { Header } from '../../models/header.model';
import { DataHeader } from '../../models/data-header.model';
import { DataContent } from '../../models/data-content.model';
import { Content } from '../../models/content.model';
import { RequestResponse } from '../../models/request-response.model';
import { ProfileCredential } from '../../models/profile/profile-credential.model';
import { ProfileCurr } from '../../models/profile/profile-curr.model';
import { UserService } from '../shared/services/user.service';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ProfileInfo } from '../../models/profile/profile-info.model';
import { EncrDecrService } from '../../shared/services/encr-decr.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  validationForm: FormGroup;

  requiredBorder = {
    'border-color': 'red',
  };

  optionalBorder = {
    'border-color': 'rgba(0, 0, 0, 0.07)',
  };

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private authService: AuthenticationService,
    private encrDecrService: EncrDecrService,
    private toastr: ToastrManager,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    this.createValidationForm();
    this.route.queryParams.subscribe(data => {
      if (data !== undefined && data['key'] !== undefined) {
        const userName = this.encrDecrService.decrypt( data['key']);
        const request = this.getImsRequestFormatForActivation(userName);
        this.userService.register(request).subscribe((data1: Ims) => {
          this.toastr.successToastr('Email verification has been completed. You can login.', 'Email verification completed');
        });
      }
    });
  }

  login() {
    const request = this.getImsRequestFormat();
    this.userService.login(request).subscribe((data: Ims) => {
      if (data.ims.content.dataheader.status === 'SUCCESS') {
        this.authService.setloginCookies(data.ims.header.token.toString(), data.ims.header.userId.toString(),
                                         data.ims.content.dataheader.custId);
        this.toastr.successToastr('Login Successfull');
        this.router.navigate(['corporate/dashboard']);
      } else {
        this.toastr.errorToastr('Login Failed!');
      }}, error => {
        this.toastr.errorToastr('Login Failed!');
      });
  }

  register() {
    this.router.navigate(['register']);
  }

  forgotPass() {
    this.router.navigate(['forgotpass']);
  }

  getControlBorderColour(control: string): any {
    return this.validationForm.controls[control].touched &&
           this.validationForm.controls[control].invalid ? this.requiredBorder : this.optionalBorder;
  }

  private getImsRequestFormat() {
    const imsRequest = new Ims();
    const header = new Header('2', 'USER', 'AUTH', '');
    const dataHeader = new DataHeader('');
    const dataContent = new DataContent();
    dataContent.credential = this.getCredentialForLogin();

    const content = new Content(dataHeader, dataContent);
    const request = new RequestResponse(header, content);
    imsRequest.ims = request;

    return imsRequest;
  }

  private getImsRequestFormatForActivation(userName: string) {
    const imsRequest = new Ims();
    const header = new Header('2', 'USER', 'SIGNUP', '');
    const dataHeader = new DataHeader('');
    const dataContent = new DataContent();
    dataContent.credential = this.getCredentialForActivation(userName);
    dataContent.info = this.getProfileInfo();

    const content = new Content(dataHeader, dataContent);
    const request = new RequestResponse(header, content);
    imsRequest.ims = request;

    return imsRequest;
  }

  private getProfileInfo(): ProfileInfo {
    const profile = new ProfileInfo();
    profile.active = 'Y';

    return profile;
  }

  private getCredentialForLogin(): ProfileCredential {
    const credential = new ProfileCredential();
    credential.userName = this.validationForm.controls['userName'].value;
    credential.password = this.encrDecrService.encrypt(this.validationForm.controls['password'].value);

    return credential;
  }

  private getCredentialForActivation(userName: string): ProfileCredential {
    const credential = new ProfileCredential();
    credential.userName = userName;

    return credential;
  }

  private createValidationForm() {
    this.validationForm = this.formBuilder.group({
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });
  }
}
