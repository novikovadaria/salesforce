public with sharing class ItemController {

    @AuraEnabled(cacheable=true)
    public static List<Item__c> getItems(String familyFilter, String typeFilter, String searchKey) {
        String baseQuery = 'SELECT Id, Name, Description__c, Type__c, Family__c, Price__c, Image__c FROM Item__c WHERE Id != null';
        
        if (String.isNotBlank(familyFilter)) {
            baseQuery += ' AND Family__c = :familyFilter';
        }

        if (String.isNotBlank(typeFilter)) {
            baseQuery += ' AND Type__c = :typeFilter';
        }

        if (String.isNotBlank(searchKey)) {
            baseQuery += ' AND (Name LIKE :searchPattern OR Description__c LIKE :searchPattern)';
        }

        String searchPattern = '%' + searchKey + '%';

        return Database.query(baseQuery);
    }
}
