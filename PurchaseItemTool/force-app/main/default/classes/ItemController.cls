public with sharing class ItemController {

    // API for fetching photos from Unsplash
    private static final String UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos?query=';
    private static final String ACCESS_KEY = 'X4rb7gM7ZEO-DRVUAtlY6jlAK04FvtrFwjg69sB5Ld8'; // Замените на ваш реальный Access Key

    // Deleting item from detail window
    @AuraEnabled
    public static void deleteItem(Id itemId) {
        delete [SELECT Id FROM Item__c WHERE Id = :itemId LIMIT 1];
    }

    // Adding image to created item
    @AuraEnabled
    public static void createItemWithImage(Item__c newItem) {
        
        String imageUrl = fetchImageFromUnsplash(newItem.Name);
        
        if (imageUrl != null) {
            newItem.Image__c = imageUrl;
        }

        insert newItem;
    }

    // Getting image from Unsplash
    @AuraEnabled
    public static String fetchImageFromUnsplash(String itemName) {
        String url = UNSPLASH_API_URL + EncodingUtil.urlEncode(itemName, 'UTF-8') + '&client_id=' + ACCESS_KEY;
    
        HttpRequest req = new HttpRequest();
        req.setEndpoint(url);
        req.setMethod('GET');
    
        Http http = new Http();
        HttpResponse res = http.send(req);
    
        if (res.getStatusCode() == 200) {
            Map<String, Object> response = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            List<Object> results = (List<Object>) response.get('results');
    
            if (!results.isEmpty()) {
                Map<String, Object> firstResult = (Map<String, Object>) results[0];
                Map<String, Object> urls = (Map<String, Object>) firstResult.get('urls');
                String imageUrl = (String) urls.get('regular');
                return imageUrl;
            }
        } else {
            System.debug('Error while getting the image from Unsplash: ' + res.getStatus());
        }
    
        return null;
    }    

    // Insert item
    @AuraEnabled
    public static void createItem(Item__c item) {
        insert item;
    }

    // Get IsManager__c from User
    @AuraEnabled
    public static Boolean isCurrentUserManager() {
        return [SELECT IsManager__c FROM User WHERE Id = :UserInfo.getUserId()].IsManager__c;
    }    
    
    // Get acc info
    @AuraEnabled
    public static Account getAccountInfo(Id accountId) {
        return [SELECT Name, AccountNumber, Industry FROM Account WHERE Id =:accountId LIMIT 1];
    }
    
    // Get all items
    @AuraEnabled
    public static List<Item__c> getItems() {
        return [
            SELECT Id, Name, Description__c, Price__c, Family__c, Type__c, Image__c
            FROM Item__c
            ORDER BY CreatedDate ASC
        ];
    }

    // Get all families
    @AuraEnabled
    public static List<String> getUniqueFamilies() {
        Set<String> families = new Set<String>();
        for (Item__c item : [SELECT Family__c FROM Item__c WHERE Family__c != null]) {
            families.add(item.Family__c);
        }
        return new List<String>(families);
    }
    
    // Get all types
    @AuraEnabled
    public static List<String> getUniqueTypes() {
        Set<String> types = new Set<String>();
        for (Item__c item : [SELECT Type__c FROM Item__c WHERE Type__c != null]) {
            types.add(item.Type__c);
        }
        return new List<String>(types);
    }
    

    // Create PurchaseLine__c
    @AuraEnabled
    public static Id createPurchaseWithLines(List<Map<String, Object>> itemsJson, Id accountId) {

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
    }
}
