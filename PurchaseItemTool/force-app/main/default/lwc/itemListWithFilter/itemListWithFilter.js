import { LightningElement, track } from 'lwc';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

import isCurrentUserManager from '@salesforce/apex/ItemController.isCurrentUserManager';
import createItemWithImage from '@salesforce/apex/ItemController.createItemWithImage';
import getItems from '@salesforce/apex/ItemController.getItems';
import getUniqueFamilies from '@salesforce/apex/ItemController.getUniqueFamilies';
import getUniqueTypes from '@salesforce/apex/ItemController.getUniqueTypes';
import createPurchaseWithLines from '@salesforce/apex/ItemController.createPurchaseWithLines';
import deleteItem from '@salesforce/apex/ItemController.deleteItem';

export default class ItemListWithFilter extends NavigationMixin(LightningElement) {

    //#region Properties

    @track accountId = '001dL00000z7b0dQAA';

    @track isManagerMode = true;
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

    
    @track account = { Name: '', AccountNumber: '', Industry : '' };

    @track isCreateModalOpen = false;
    @track newItem = {
        Name: '',
        Description__c: '',
        Type__c: '',
        Family__c: '',
        Image__c: '', 
        Price__c: 0
    };

    columns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Quantity', fieldName: 'Quantity', type: 'number' },
        { label: 'Unit Price', fieldName: 'Price', type: 'currency' },
        { label: 'Total', fieldName: 'TotalPrice', type: 'currency' },
        {
            type: 'button-icon',
            fixedWidth: 50,
            typeAttributes: {
                iconName: 'utility:delete',
                name: 'delete',
                title: 'Delete',
                variant: 'border-filled',
                alternativeText: 'Delete'
            }
        }
    ];    

    //#endregion
    
    // Load initial data when component is connected
    connectedCallback() {
        this.loadAccountInfo();
        this.loadUniqueFamilies();
        this.loadUniqueTypes();
        this.loadItems();
        this.checkManagerStatus();
    }

    // Toggle manager mode (for development)
    handleManagerToggle(event) {
        this.isManagerMode = event.target.checked;
    }

    // Reset all applied filters
    handleResetFilter() {
        this.selectedFamily = '';
        this.selectedType = '';
        this.applyFilters(); 
    }

    // Delete selected item
    async handleDeleteItem() {
        try {
            await deleteItem({ itemId: this.selectedItem.Id });
            this.showToast('Success', 'Item deleted successfully', 'success');
            this.handleCloseItemModal();
            this.loadItems();
        } catch (error) {
            this.showToast('Error', 'Failed to delete item: ' + error.body.message, 'error');
        }
    }

    // Save new item with image
    async handleSaveItem() {
        try {
            await createItemWithImage({ newItem: this.newItem });

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Item created successfully!',
                    variant: 'success'
                })
            );

            this.handleCloseCreateModal();
            this.loadItems();
        } catch (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Error creating item: ' + error.body.message,
                    variant: 'error'
                })
            );
        }
    }

    // Open item creation window
    handleCreateItem() {
        this.isCreateModalOpen = true;
    }

    // Close item creation window and reset fields
    handleCloseCreateModal() {
        this.isCreateModalOpen = false;
        this.resetNewItem();
    }

    // Handle input changes for new item
    handleInputChange(event) {
        const field = event.target.dataset.field;
        this.newItem[field] = event.target.value;
    }

    // Reset new item fields
    resetNewItem() {
        this.newItem = {
            Name: '',
            Description__c: '',
            Type__c: '',
            Family__c: '',
            Image__c: '',
            Price__c: 0
        };
    }

    // Load account data
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

    // Load all items from server
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
                Image: item.Image__c 
            }));
            this.applyFilters();
        } catch (error) {
            this.showToast('Error', 'Failed to load items: ' + error.body.message, 'error');
        }
    }

    // Load unique families for filtering
    async loadUniqueFamilies() {
        try {
            const families = await getUniqueFamilies(); 
            this.familyOptions = families.map(fam => ({ label: fam, value: fam }));
        } catch (error) {
            this.showToast('Error', 'Failed to load families: ' + error.body.message, 'error');
        }
    }

    // Load unique types for filtering
    async loadUniqueTypes() {
        try {
            const types = await getUniqueTypes();
            this.typeOptions = types.map(t => ({ label: t, value: t }));
        } catch (error) {
            this.showToast('Error', 'Failed to load types: ' + error.body.message, 'error');
        }
    }

    // Check if current user is a manager
    async checkManagerStatus() {
        try {
            this.isManager = await isCurrentUserManager({ accountId: this.accountId });
        } catch (error) {
            this.isManager = false;
            this.showToast('Error', 'Unable to determine manager status: ' + error.body.message, 'error');
        }
    }

    // Handle filter dropdown changes
    handleFilterChange(event) {
        const { name, value } = event.target;
        if (name === 'family') {
            this.selectedFamily = value;
        } else if (name === 'type') {
            this.selectedType = value;
        }
        this.applyFilters();
    }

    // Handle search input change
    handleSearchChange(event) {
        this.searchText = event.target.value.toLowerCase();
        this.applyFilters();
    }

    // Apply filters when Enter is pressed
    handleSearchKeyUp(event) {
        if (event.keyCode === 13) {
            this.applyFilters();
        }
    }

    // Apply family, type, and text filters to item list
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

    // Add item to cart
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

        this.showToast('Success', 'Item added to cart!', 'success');
    }

    // Remove item from cart
    handleRemoveFromCart(event) {
        const itemId = event.detail.row.Id;
        this.cartItems = this.cartItems.filter(item => item.Id !== itemId);
        this.showToast('Success', 'Item removed from cart', 'success');
    }

    // Open cart window
    handleOpenCart() {
        this.isCartOpen = true;
    }

    // Close cart window
    handleCloseCart() {
        this.isCartOpen = false;
    }

    // Open item details window
    handleOpenItemDetails(event) {
        const itemId = event.target.dataset.id;
        this.selectedItem = this.allItems.find(item => item.Id === itemId);
        this.isItemModalOpen = true;
    }

    // Close item details window
    handleCloseItemModal() {
        this.isItemModalOpen = false;
    }

    // Finalize checkout and create purchase record
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
                    error?.body?.message || error?.message || 'Unknown error during purchase creation';
                this.showToast('Error', message, 'error');
            });
    }

    // Redirect to newly created purchase record
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

    // Show toast notification
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

}
