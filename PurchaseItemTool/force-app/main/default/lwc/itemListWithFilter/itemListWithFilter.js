import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createPurchaseWithLines from '@salesforce/apex/PurchaseController.createPurchaseWithLines';

export default class itemListWithFilter extends LightningElement {
    @track isManager = true;
    @track account = {
        Name: 'Test Account',
        AccountNumber: '12345',
        Industry: 'Technology'
    };

    @track isCartOpen = false;
    @track cartItems = [];

    @track selectedFamily = '';
    @track selectedType = '';
    @track searchText = '';

    @track isItemModalOpen = false;
    @track selectedItem = {};


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

    get familyOptions() {
        return [
            { label: 'All', value: '' },
            { label: 'FamilyA', value: 'FamilyA' },
            { label: 'FamilyB', value: 'FamilyB' },
            { label: 'FamilyC', value: 'FamilyC' }
        ];
    }

    get typeOptions() {
        return [
            { label: 'All', value: '' },
            { label: 'Type1', value: 'Type1' },
            { label: 'Type2', value: 'Type2' },
            { label: 'Type3', value: 'Type3' }
        ];
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

    handleCreateItem() {
        this.showToast('Action', 'Create Item clicked', 'info');
    }

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
        this.filteredItems = this.items.filter(item => {
            const matchesFamily = !this.selectedFamily || item.Family__c === this.selectedFamily;
            const matchesType = !this.selectedType || item.Type__c === this.selectedType;
            const matchesSearch =
                !this.searchText ||
                item.Name.toLowerCase().includes(this.searchText) ||
                item.Description.toLowerCase().includes(this.searchText);
            return matchesFamily && matchesType && matchesSearch;
        });
    }

    handleAddToCart(event) {
        const itemId = event.target.dataset.id;
        const item = this.items.find(i => i.Id === itemId);
        if (!item) return;

        const existing = this.cartItems.find(ci => ci.Id === item.Id);
        if (existing) {
            existing.Quantity = (existing.Quantity || 1) + 1;
            existing.TotalPrice = existing.Quantity * existing.Price;
        } else {
            this.cartItems = [
                ...this.cartItems,
                { ...item, Quantity: 1, TotalPrice: item.Price }
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
        this.selectedItem = this.items.find(item => item.Id === itemId);
        this.isItemModalOpen = true;
    }
    
    handleCloseItemModal() {
        this.isItemModalOpen = false;
    }    

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    // Обработчик для завершения покупки (checkout)
    handleCheckout() {
        const items = this.cartItems.map(item => ({
            Item__c: item.Id,
            Quantity__c: item.Quantity,
            Price__c: item.Price,
            TotalPrice__c: item.TotalPrice
        }));

        createPurchaseWithLines({ itemsJson: JSON.stringify(items) })
            .then(result => {
                this.cartItems = [];
                this.isCartOpen = false;
                this.showToast('Success', 'Purchase created successfully!', 'success');
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    // Метод для отображения сообщений toast
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
    
}
