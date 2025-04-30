trigger PurchaseLineTrigger on PurchaseLine__c (after insert, after update, after delete) {
    Set<Id> purchaseIds = new Set<Id>();

    if (Trigger.isInsert || Trigger.isUpdate) {
        for (PurchaseLine__c line : Trigger.new) {
            purchaseIds.add(line.PurchaseId__c);
        }
    }

    if (Trigger.isDelete) {
        for (PurchaseLine__c line : Trigger.old) {
            purchaseIds.add(line.PurchaseId__c);
        }
    }

    List<Purchase__c> purchases = [SELECT Id, TotalItems__c, GrandTotal__c 
                                   FROM Purchase__c 
                                   WHERE Id IN :purchaseIds];

    List<Purchase__c> purchasesToUpdate = new List<Purchase__c>();

    for (Purchase__c purchase : purchases) {
        List<PurchaseLine__c> relatedLines = [SELECT Id, UnitCost__c, Amount__c 
                                              FROM PurchaseLine__c 
                                              WHERE PurchaseId__c = :purchase.Id];

        Integer totalItems = relatedLines.size();
        Decimal grandTotal = 0;

        for (PurchaseLine__c line : relatedLines) {
            if (line.UnitCost__c != null && line.Amount__c != null) {
                grandTotal += line.UnitCost__c * line.Amount__c;
            }
        }

        purchase.TotalItems__c = totalItems;
        purchase.GrandTotal__c = grandTotal;

        purchasesToUpdate.add(purchase);
    }

    update purchasesToUpdate;
}
