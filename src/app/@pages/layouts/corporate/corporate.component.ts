import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RootLayout } from '../root/root.component';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../shared/services/authentication.service';
import { pagesToggleService } from '../../services/toggler.service';
import { GenericService } from '../../../shared/services/generic.service';
import { SedolpayStateManagerService } from '../../../shared/services/sedolpay-state-manager.service';
import { Ims } from '../../../shared/models/ims.model';
import { RequestResponse } from '../../../shared/models/request-response.model';
import { Header } from '../../../shared/models/header.model';
import { ProfileService } from '../../../shared/services/profile.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { DataHeader } from '../../../shared/models/data-header.model';
import { DataContent } from '../../../shared/models/data-content.model';
import { Content } from '../../../shared/models/content.model';


@Component({
  selector: 'app-corporate-layout',
  templateUrl: './corporate.component.html',
  styleUrls: ['./corporate.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CorporateLayoutComponent extends RootLayout implements OnInit {
  menuLinks = [
    {
      label: 'Home',
      routerLink: 'dashboard',
      iconType: 'fa',
      iconName: 'home',
      thumbNailClass: 'text-white'
    },
    {
      label: 'My Profile',
      routerLink: 'my-profile',
      iconType: 'fa',
      iconName: 'user',
      thumbNailClass: 'text-white'
    },
    {
      label: 'Manage Accounts',
      iconType: 'fa',
      iconName: 'database',
      toggle: 'close',
      submenu: [
        {
          label: 'Account Portfolio',
          routerLink: 'manage-accounts/account-portfolio',

        },
        {
          label: 'Statements',
          routerLink: 'manage-accounts/statements',

        },
        {
          label: 'Apply Additional Accounts',
          routerLink: 'manage-accounts/',

        }
      ]
    },
    {
      label: 'Manage Beneficiaries',
      routerLink: 'manage-beneficiaries',
      iconType: 'fa',
      iconName: 'users',
      thumbNailClass: 'text-white'
    },
    {
      label: 'Payment Requests',
      iconType: 'fa',
      iconName: 'hand-holding-usd',
      toggle: 'close',
      submenu: [
        {
          label: 'Own Account Transfer',
          routerLink: 'payment-requests/own-account-transfer',

        },
        {
          label: 'Internal Transfer',
          routerLink: 'payment-requests/internal-transfer',

        },
        {
          label: 'External Transfer',
          routerLink: 'payment-requests/external-transfer',
        },
        {
          label: 'Pay From Card',
          routerLink: 'payment-requests/pay-from-card',
        }
      ]
    },
    {
      label: 'Track Payments',
      routerLink: 'track-payments',
      iconType: 'fa',
      iconName: 'search-dollar',
      thumbNailClass: 'text-white'
    },
    {
      label: 'Reports',
      iconType: 'fa',
      iconName: 'file-chart-line',
      toggle: 'close',
      submenu: [
        {
          label: 'Payment Status',
          routerLink: 'reports/payment-status',
        },
        {
          label: 'Transaction History',
          routerLink: 'reports/transaction-history',
        },
      ]
    },
    {
      label: 'Contact Us',
      routerLink: 'contact-us',
      iconType: 'fa',
      iconName: 'envelope',
      thumbNailClass: 'text-white'
    },

  ];
  name: String = '';

  constructor(
    public toggler: pagesToggleService,
    public router: Router,
    private authService: AuthenticationService,
    private profileService: ProfileService,
    private toastr: ToastrManager,
    private sedolpayStateManagerService: SedolpayStateManagerService,
    private genericService: GenericService) {
    super(toggler, router);
  }

  ngOnInit() {
    this.changeLayout('menu-pin');
    this.changeLayout('menu-behind');
    this.autoHideMenuPin();
    this.loadProfile();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['login']);
  }

  private loadProfile() {
    const request = this.getImsRequestFormatForProfile('PROFILE', 'VIEW');
    this.profileService.getProfileDetails(request).subscribe((data: Ims) => {
      if (data.ims !== undefined) {
        this.name = data.ims.content.data.info.firstName + ' ' + data.ims.content.data.info.lastName;
      } else {
        this.toastr.errorToastr('Failed to load the user details');
      }
    });
    this.loadCurrencies();
    this.loadCountries();
    this.loadTimezones();
  }

  private loadCurrencies() {
    const immRequest = this.getImsRequestFormat('CURRENCY');
    this.genericService.getCurrencies(immRequest).subscribe((data: Ims) => {
      if (data !== undefined) {
        const currencies = data.ims.data.currencies;
        this.sedolpayStateManagerService.setCurrencies(null);
      }
    });
  }

  private loadCountries() {
    const immRequest = this.getImsRequestFormat('COUNTRY');
    this.genericService.getCountries(immRequest).subscribe((data: Ims) => {
      if (data !== undefined) {
        const countries = data.ims.data.countries;
        this.sedolpayStateManagerService.setCountries(countries);
      }
    });
  }

  private loadTimezones() {
    const immRequest = this.getImsRequestFormat('TIMEZONE');
    this.genericService.getTimezone(immRequest).subscribe((data: Ims) => {
      if (data !== undefined) {
        const timezones = data.ims.data.timezones;
        this.sedolpayStateManagerService.setTimeZones(timezones);
      }
    });
  }

  private getCustomerId(): any {
    const custId = this.authService.getCustomerId();
    if (custId !== null && custId !== undefined && custId !== '') {
      return custId;
    } else {
      this.router.navigate(['login']);
    }
  }

  private getImsRequestFormat( mode: string) {
    const imsRequest = new Ims();
    imsRequest.ims = new RequestResponse();
    imsRequest.ims.header = new Header('2', 'USER', mode);

    return imsRequest;
  }

  private getImsRequestFormatForProfile(type: string, mode: string) {
    const imsRequest = new Ims();
    const header = new Header('2', type, mode);
    const dataHeader = new DataHeader(this.getCustomerId());
    dataHeader.portalUserid = '';
    const dataContent = new DataContent();
    dataContent.docs = [];

    const content = new Content(dataHeader, dataContent);
    const request = new RequestResponse(header, content);
    imsRequest.ims = request;

    return imsRequest;
  }
}