import { LightningElement, track, wire } from 'lwc';
import { MessageContext } from 'lightning/messageService';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { subscribe, unsubscribe, APPLICATION_SCOPE } from 'lightning/messageService';
import CART_MESSAGE from '@salesforce/messageChannel/CartMessageChannel__c';

export default class ItemPurchaseTool extends LightningElement {

    @wire(MessageContext)
    messageContext;

    @track isManager = true;
    @track account = {
        Name: 'Test Account',
        AccountNumber: '12345',
        Industry: 'Technology'
    };

    @track cartItems = [];
    @track isCartOpen = false;

    columns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Price', fieldName: 'Price', type: 'currency' },
        { label: 'Description', fieldName: 'Description' },
        {
            type: 'button',
            typeAttributes: {
                label: 'Remove',
                name: 'remove',
                title: 'Remove',
                variant: 'destructive'
            }
        }
    ];

    // Подписка на сообщения от другого компонента (для добавления товара в корзину)
    connectedCallback() {
        this.subscription = subscribe(
            this,
            CART_MESSAGE,
            (message) => this.handleMessage(message),
            { scope: APPLICATION_SCOPE }
        );
    }

    // Обработка сообщений от другого компонента (для добавления товара в корзину)
    handleMessage(message) {
        if (message.item) {
            const existing = this.cartItems.find(ci => ci.Id === message.item.Id);
            if (existing) {
                existing.Quantity += 1;
                existing.TotalPrice = existing.Quantity * existing.Price;
            } else {
                this.cartItems = [...this.cartItems, { ...message.item, Quantity: 1, TotalPrice: message.item.Price }];
            }
        }
    }

    // Удаление товара из корзины
    handleRemoveFromCart(event) {
        const itemId = event.detail.row.Id;
        this.cartItems = this.cartItems.filter(item => item.Id !== itemId);
        this.showToast('Success', 'Item removed from cart', 'success');
    }

    handleOpenCart() {
        this.isCartOpen = true;
    }

    handleCloseCart() {
        this.isCartOpen = false;
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    // Отписка от канала при уничтожении компонента
    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }
}
