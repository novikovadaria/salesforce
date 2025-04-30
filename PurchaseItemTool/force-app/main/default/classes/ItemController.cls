public with sharing class ItemController {

    @AuraEnabled
    public static Account getAccountInfo(Id accountId) {
        Account acc = [SELECT Name, AccountNumber, Industry FROM Account WHERE Id = '001dL00000z7b0dQAA' LIMIT 1];
        if (acc == null) {
            throw new AuraHandledException('Account not found');
        }
        return acc;
    }
    

    // Получаем все товары
    @AuraEnabled
    public static List<Item__c> getItems() {
        return [
            SELECT Id, Name, Description__c, Price__c, Family__c, Type__c
            FROM Item__c
            ORDER BY CreatedDate ASC
        ];
    }

    @AuraEnabled
    public static List<String> getUniqueFamilies() {
        Set<String> families = new Set<String>();
        for (Item__c item : [SELECT Family__c FROM Item__c WHERE Family__c != null]) {
            families.add(item.Family__c);
        }
        return new List<String>(families);
    }
    
    @AuraEnabled
    public static List<String> getUniqueTypes() {
        Set<String> types = new Set<String>();
        for (Item__c item : [SELECT Type__c FROM Item__c WHERE Type__c != null]) {
            types.add(item.Type__c);
        }
        return new List<String>(types);
    }
    

    // Создаем покупку с товарами
    @AuraEnabled
    public static Id createPurchaseWithLines(List<Map<String, Object>> itemsJson, Id accountId) {
        try {
            Purchase__c newPurchase = new Purchase__c(
                ClientId__c = accountId
            );
            insert newPurchase;

            List<PurchaseLine__c> lines = new List<PurchaseLine__c>();
            for (Map<String, Object> item : itemsJson) {
                lines.add(new PurchaseLine__c(
                    PurchaseId__c = newPurchase.Id,
                    ItemId__c = (Id) item.get('ItemId__c'),
                    Amount__c = (Decimal) item.get('Amount__c'),
                    UnitCost__c = (Decimal) item.get('UnitCost__c')
                ));
            }
            insert lines;

            return newPurchase.Id; 
        } catch (Exception e) {
            throw new AuraHandledException('Ошибка при создании покупки: ' + e.getMessage());
        }
    }
}
