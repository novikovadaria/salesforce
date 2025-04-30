import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish, MessageContext } from 'lightning/messageService';
import CART_MESSAGE from '@salesforce/messageChannel/CartMessageChannel__c';

export default class ItemListWithFilter extends LightningElement {
    @track items = [
        { Id: '1', Name: 'Item 1', Description: 'Description for Item 1', Price: 100, Family__c: 'FamilyA', Type__c: 'Type1', ImageUrl: 'https://via.placeholder.com/150' },
        { Id: '2', Name: 'Item 2', Description: 'Description for Item 2', Price: 150, Family__c: 'FamilyB', Type__c: 'Type2', ImageUrl: 'https://via.placeholder.com/150' },
        { Id: '3', Name: 'Item 3', Description: 'Description for Item 3', Price: 200, Family__c: 'FamilyC', Type__c: 'Type3', ImageUrl: 'https://via.placeholder.com/150' },
        { Id: '4', Name: 'Item 4', Description: 'Description for Item 4', Price: 250, Family__c: 'FamilyA', Type__c: 'Type1', ImageUrl: 'https://via.placeholder.com/150' },
        { Id: '5', Name: 'Item 5', Description: 'Description for Item 5', Price: 300, Family__c: 'FamilyB', Type__c: 'Type2', ImageUrl: 'https://via.placeholder.com/150' },
        { Id: '6', Name: 'Item 6', Description: 'Description for Item 6', Price: 350, Family__c: 'FamilyC', Type__c: 'Type3', ImageUrl: 'https://via.placeholder.com/150' },
        { Id: '7', Name: 'Item 7', Description: 'Description for Item 7', Price: 400, Family__c: 'FamilyA', Type__c: 'Type1', ImageUrl: 'https://via.placeholder.com/150' },
        { Id: '8', Name: 'Item 8', Description: 'Description for Item 8', Price: 450, Family__c: 'FamilyB', Type__c: 'Type2', ImageUrl: 'https://via.placeholder.com/150' },
        { Id: '9', Name: 'Item 9', Description: 'Description for Item 9', Price: 500, Family__c: 'FamilyC', Type__c: 'Type3', ImageUrl: 'https://via.placeholder.com/150' },
        { Id: '10', Name: 'Item 10', Description: 'Description for Item 10', Price: 550, Family__c: 'FamilyA', Type__c: 'Type1', ImageUrl: 'https://via.placeholder.com/150' }
    ];

    @track filteredItems = this.items;
    @track isCartModalOpen = false;
    @track isModalOpen = false;
    @track selectedItem = {};

    @wire(MessageContext)
    messageContext;

    columns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Price', fieldName: 'Price', type: 'currency' },
        { label: 'Description', fieldName: 'Description' },
        {
            label: 'Remove',
            type: 'button',
            typeAttributes: {
                label: 'Remove',
                name: 'remove',
                variant: 'destructive'
            }
        }
    ];

    handleAddToCart(event) {
        const itemId = event.target.dataset.id;
        const item = this.filteredItems.find(item => item.Id === itemId);
    
        if (item) {
            publish(this.messageContext, CART_MESSAGE, { item: item });
        }
    }

    handleOpenItemDetails(event) {
        const itemId = event.target.dataset.id;
        this.selectedItem = this.items.find(item => item.Id === itemId);
        this.isModalOpen = true;
    }

    handleCloseModal() {
        this.isModalOpen = false;
    }

    // Функция для отображения уведомления (тост)
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event);
    }
}
