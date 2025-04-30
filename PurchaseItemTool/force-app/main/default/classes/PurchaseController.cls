public with sharing class PurchaseController {
    @AuraEnabled
    public static void createPurchaseWithLines(List<Map<String, Object>> itemsJson) {
        try {
            // Создаем новый объект Purchase
            Purchase__c newPurchase = new Purchase__c(
                Account__c = 'SomeAccountId',  // Замените на реальное значение
                PurchaseDate__c = System.today(),
                TotalItems__c = itemsJson.size(),  // Считаем количество товаров
                GrandTotal__c = 0  // Инициализация общей суммы
            );
            insert newPurchase;

            // Создаем PurchaseLine для каждого элемента в корзине
            List<Purchase_Line__c> purchaseLines = new List<Purchase_Line__c>();
            Decimal grandTotal = 0;

            for (Map<String, Object> itemData : itemsJson) {
                Purchase_Line__c newLine = new Purchase_Line__c(
                    Purchase__c = newPurchase.Id,
                    Item__c = (String) itemData.get('Item__c'),
                    Quantity__c = (Decimal) itemData.get('Quantity__c'),
                    Price__c = (Decimal) itemData.get('Price__c'),
                    TotalPrice__c = (Decimal) itemData.get('TotalPrice__c')
                );
                grandTotal += (Decimal) itemData.get('TotalPrice__c');
                purchaseLines.add(newLine);
            }

            // Вставляем PurchaseLine записи
            insert purchaseLines;

            // Обновляем Purchase запись с общей суммой
            newPurchase.GrandTotal__c = grandTotal;
            update newPurchase;
        } catch (Exception e) {
            throw new AuraHandledException('Error creating purchase: ' + e.getMessage());
        }
    }
}
