import { LightningElement, track } from 'lwc';

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
    
    @track filteredItems = this.items; // Фильтрованные товары
    @track selectedFamily = ''; // Выбранное семейство для фильтрации
    @track selectedType = ''; // Выбранный тип для фильтрации
    @track isModalOpen = false; // Состояние модального окна
    @track selectedItem = {}; // Выбранный товар для отображения в модальном окне

    // Фильтрационные опции для типов и семейств товаров
    typeOptions = [
        { label: 'Type 1', value: 'Type1' },
        { label: 'Type 2', value: 'Type2' },
        { label: 'Type 3', value: 'Type3' }
    ];

    familyOptions = [
        { label: 'Family A', value: 'FamilyA' },
        { label: 'Family B', value: 'FamilyB' },
        { label: 'Family C', value: 'FamilyC' }
    ];

    // Обработчик изменения фильтра
    handleFilterChange(event) {
        const filterType = event.target.name;
        const filterValue = event.target.value;

        if (filterType === 'family') {
            this.selectedFamily = filterValue;
        } else if (filterType === 'type') {
            this.selectedType = filterValue;
        }

        this.applyFilters();
    }

    // Применяем фильтры
    applyFilters() {
        this.filteredItems = this.items.filter(item => {
            const matchFamily = this.selectedFamily ? item.Family__c === this.selectedFamily : true;
            const matchType = this.selectedType ? item.Type__c === this.selectedType : true;
            return matchFamily && matchType;
        });
    }

    // Открытие модального окна с деталями товара
    handleOpenItemDetails(event) {
        const itemId = event.target.dataset.id;
        this.selectedItem = this.items.find(item => item.Id === itemId);
        this.isModalOpen = true;
    }

    // Закрытие модального окна
    handleCloseModal() {
        this.isModalOpen = false;
    }

    // Добавление товара в корзину
    handleAddToCart(event) {
        const itemId = event.target.dataset.id;
        const item = this.items.find(item => item.Id === itemId);
        const cartEvent = new CustomEvent('addtocart', {
            detail: item
        });
        this.dispatchEvent(cartEvent);
    }
}
