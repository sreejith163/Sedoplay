import { ProfileCurr } from './profile-curr.model';
import { ProfileCredential } from './profile-credential.model';
import { ProfileInfo } from './profile-info.model';
import { Beneficiary } from './beneficiary.model';
import { Transfer } from '../../reports/shared/models/transfer.model';

export class DataContent {
    acc?: ProfileCurr;
    credential?: ProfileCredential;
    docs?: any;
    info?: ProfileInfo;
    accounts?: Array<any>;
    key?: string;
    viewCur?: Array<string>;
    benef?: Array<Beneficiary> = [];
    transfer?: Array<Transfer> = [];

    constructor(acc?: ProfileCurr, credential?: ProfileCredential, docs?: any, info?: ProfileInfo,
        accounts?: Array<Object>, key?: string, viewCur?: Array<string>, benef?: Array<Beneficiary>,
        transfer?: Array<Transfer>) {
        this.acc = acc;
        this.credential = credential;
        this.docs = docs;
        this.info = info;
        this.accounts = accounts;
        this.key = key;
        this.viewCur = viewCur;
        this.benef = benef;
        this.transfer = transfer;
    }
}
