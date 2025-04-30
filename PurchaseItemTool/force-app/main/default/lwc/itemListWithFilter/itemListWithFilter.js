import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getItems from '@salesforce/apex/ItemController.getItems';
import getUniqueFamilies from '@salesforce/apex/ItemController.getUniqueFamilies';
import getUniqueTypes from '@salesforce/apex/ItemController.getUniqueTypes';
import createPurchaseWithLines from '@salesforce/apex/ItemController.createPurchaseWithLines';
import { NavigationMixin } from 'lightning/navigation';

export default class ItemListWithFilter extends NavigationMixin(LightningElement) {
    @track isManager = true;
    @track accountId = '001dL00000z7b0dQAA';

    @track isCartOpen = false;
    @track cartItems = [];

    @track selectedFamily = '';
    @track selectedType = '';
    @track searchText = '';

    @track isItemModalOpen = false;
    @track selectedItem = {};

    @track allItems = [];
    @track filteredItems = [];
    @track familyOptions = [];
    @track typeOptions = [];

    // Данные для account
    @track account = { Name: '', AccountNumber: '', Industry : '' };
    isManager = true;

    // Загружаем информацию о аккаунте асинхронно
    async loadAccountInfo() {
        try {
            const accountData = await getAccountInfo({ accountId: this.accountId });

            this.account = {
                ...this.account,
                Name: accountData.Name,
                AccountNumber: accountData.AccountNumber,
                Industry: accountData.Industry
            }
            
        } catch (error) {
            this.showToast('Error', 'Failed to load account data: ' + error.body.message, 'error');
        }
    }

    async loadItems() {
        try {
            const items = await getItems(); 
            this.allItems = items.map(item => ({
                ...item,
                Name: item.Name, 
                Family: item.Family__c, 
                Type: item.Type__c, 
                Price: item.Price__c,
                Description: item.Description__c,
                ImageUrl: 'https://via.placeholder.com/150' 
            }));
            
            this.applyFilters();
        } catch (error) {
            this.showToast('Error', 'Failed to load items: ' + error.body.message, 'error');
        }
    }

    async loadUniqueFamilies() {
        try {
            const families = await getUniqueFamilies(); 
            this.familyOptions = families.map(fam => ({ label: fam, value: fam }));
        } catch (error) {
            this.showToast('Error', 'Failed to load families: ' + error.body.message, 'error');
        }
    }    

    async loadUniqueTypes() {
        try {
            const types = await getUniqueTypes();
            this.typeOptions = types.map(t => ({ label: t, value: t }));
        } catch (error) {
            this.showToast('Error', 'Failed to load types: ' + error.body.message, 'error');
        }
    }    

    connectedCallback() {
        this.loadAccountInfo();
        this.loadUniqueFamilies();
        this.loadUniqueTypes();
        this.loadItems();
    }

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

    handleFilterChange(event) {
        const { name, value } = event.target;
        if (name === 'family') {
            this.selectedFamily = value;
        } else if (name === 'type') {
            this.selectedType = value;
        }
        this.applyFilters();
    }

    handleSearchChange(event) {
        this.searchText = event.target.value.toLowerCase();
        this.applyFilters();
    }

    handleSearchKeyUp(event) {
        if (event.keyCode === 13) {
            this.applyFilters();
        }
    }

    applyFilters() {
        this.filteredItems = this.allItems.filter(item => {
            const matchesFamily = !this.selectedFamily || item.Family === this.selectedFamily;
            const matchesType = !this.selectedType || item.Type === this.selectedType;
            const matchesSearch =
                !this.searchText ||
                item.Name.toLowerCase().includes(this.searchText) ||
                item.Description.toLowerCase().includes(this.searchText);
    
            return matchesFamily && matchesType && matchesSearch;
        });
    }

    handleAddToCart(event) {
        const itemId = event.target.dataset.id;
        const item = this.allItems.find(i => i.Id === itemId);
        if (!item) return;

        const existing = this.cartItems.find(ci => ci.Id === item.Id);
        if (existing) {
            existing.Quantity = (existing.Quantity || 1) + 1;
            existing.TotalPrice = existing.Quantity * existing.Price;
        } else {
            this.cartItems = [
                ...this.cartItems,
                {
                    ...item,
                    Quantity: 1,
                    TotalPrice: item.Price,
                    Amount__c: item.Price,
                    UnitCost__c: item.Price
                }
            ];
        }

        this.showToast('Success', 'Item added to cart', 'success');
    }

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

    handleOpenItemDetails(event) {
        const itemId = event.target.dataset.id;
        this.selectedItem = this.allItems.find(item => item.Id === itemId);
        this.isItemModalOpen = true;
    }

    handleCloseItemModal() {
        this.isItemModalOpen = false;
    }

    handleCheckout() {
        const items = this.cartItems.map(item => ({
            ItemId__c: item.Id,
            Amount__c: item.Quantity,
            UnitCost__c: item.Price
        }));
    
        createPurchaseWithLines({ itemsJson: items, accountId: this.accountId })
            .then(purchaseId => {
                this.cartItems = [];
                this.isCartOpen = false;
                this.showToast('Success', 'Purchase created!', 'success');
                this.redirectToPurchase(purchaseId);
            })
            .catch(error => {
                const message =
                    error?.body?.message || error?.message || 'Неизвестная ошибка при создании покупки';
                this.showToast('Ошибка', message, 'error');
            });
    }

    redirectToPurchase(purchaseId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: purchaseId,
                objectApiName: 'Purchase__c',
                actionName: 'view'
            }
        });
    }    
    
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}
