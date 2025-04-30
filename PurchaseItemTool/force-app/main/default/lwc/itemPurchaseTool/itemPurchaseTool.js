import { LightningElement, api, wire, track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import IS_MANAGER_FIELD from '@salesforce/schema/User.IsManager__c';
import USER_ID from '@salesforce/user/Id';
import { getRecord as getUserRecord } from 'lightning/uiRecordApi';

const ACCOUNT_FIELDS = ['Account.Name', 'Account.AccountNumber', 'Account.Industry'];

export default class ItemPurchaseTool extends LightningElement {
    @track isManager = true; // <--- ЗАХАРДКОЖЕННЫЙ МЕНЕДЖЕР
    @track account = {
        Name: 'Test Account',
        AccountNumber: '12345',
        Industry: 'Technology'
    };

    handleCreateItem() {
        console.log('Create Item clicked');
    }

    handleOpenCart() {
        console.log('Cart clicked');
    }
}
