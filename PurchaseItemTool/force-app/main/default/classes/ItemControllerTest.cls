@isTest
private class ItemControllerTest {

    // Test for deleteItem method
    @isTest
    static void testDeleteItem() {
        // Create test data
        Item__c testItem = new Item__c(Name = 'Test Item');
        insert testItem;

        // Verify item is created
        Item__c insertedItem = [SELECT Id FROM Item__c WHERE Id = :testItem.Id LIMIT 1];
        System.assertNotEquals(insertedItem, null);

        // Call the deleteItem method
        Test.startTest();
        ItemController.deleteItem(testItem.Id);
        Test.stopTest();

        // Verify the item is deleted
        try {
            Item__c deletedItem = [SELECT Id FROM Item__c WHERE Id = :testItem.Id LIMIT 1];
            System.assertEquals(deletedItem, null);
        } catch (QueryException e) {
            // Item is deleted and should not exist
            System.assert(true);
        }
    }

    // Test for createItem method
    @isTest
    static void testCreateItem() {
        Item__c newItem = new Item__c(Name = 'Test Item');
        Test.startTest();
        ItemController.createItem(newItem);
        Test.stopTest();

        // Verify item is created
        Item__c insertedItem = [SELECT Id FROM Item__c WHERE Name = 'Test Item' LIMIT 1];
        System.assertNotEquals(insertedItem, null);
    }

    // Test for getAccountInfo method
    @isTest
    static void testGetAccountInfo() {
        // Create test account data
        Account testAccount = new Account(Name = 'Test Account', AccountNumber = '12345', Industry = 'Technology');
        insert testAccount;

        // Call getAccountInfo method
        Account result = ItemController.getAccountInfo(testAccount.Id);

        // Verify the returned account
        System.assertEquals(result.Name, testAccount.Name);
        System.assertEquals(result.AccountNumber, testAccount.AccountNumber);
    }
}
