trigger PurchaseLineTrigger on Purchase_Line__c (after insert, after update, after delete) {
    List<Purchase__c> purchasesToUpdate = new List<Purchase__c>();
    Set<Id> purchaseIds = new Set<Id>();

    if (Trigger.isInsert || Trigger.isUpdate) {
        for (Purchase_Line__c line : Trigger.new) {
            purchaseIds.add(line.Purchase__c);
        }
    }

    if (Trigger.isDelete) {
        for (Purchase_Line__c line : Trigger.old) {
            purchaseIds.add(line.Purchase__c);
        }
    }

    List<Purchase__c> purchases = [SELECT Id, TotalItems__c, GrandTotal__c 
                                    FROM Purchase__c 
                                    WHERE Id IN :purchaseIds];
    
    for (Purchase__c purchase : purchases) {
        List<Purchase_Line__c> relatedLines = [SELECT Id, TotalPrice__c 
                                                FROM Purchase_Line__c 
                                                WHERE Purchase__c = :purchase.Id];
        
        Integer totalItems = relatedLines.size();
        Decimal grandTotal = 0;
        
        for (Purchase_Line__c line : relatedLines) {
            grandTotal += line.TotalPrice__c;
        }

        purchase.TotalItems__c = totalItems;
        purchase.GrandTotal__c = grandTotal;

        purchasesToUpdate.add(purchase);
    }

    update purchasesToUpdate;
}
