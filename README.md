# Test task for the position of Trainee developer (Salesforce)

## Item Purchase Tool
You need to implement a simple one-page application to allow the user to create a purchase.

Requirements:

You need to create Custom Objects according to the Data Model

All requirements represent as User Stories with useful links

You can use only LWC components and Apex classes, Aura component you can use only as a container for LWC components if you need

Cover Apex code by Unit Tests

Create a repo on GitHub, try to commit the changes more often. Send GitHub Repo URL by email when the task was done.

Create Admin user for dev@truesolv.com on Salesforce Dev Instance when the task was done

Create an unmanaged package - Create and Upload an Unmanaged Package

More information and links to documentation you can find in Tools Section

Get started Salesforce development and useful links

## Data Model:

Purchase__c - new custom object

Name - String

ClientId - Lookup to Account object

TotalItems - Number

GrandTotal - Number

PurchaseLine__c - new custom object

PurchaseId - Master-Detail to Purchase__c

ItemId - Master-Detail to Item__c

Amount - Number

UnitCost - Number

Item__c -  new custom object

Name - String

Description - String

Type - Picklist

Family - Picklist

Image - Url - link to image

Price - Number

User - standard object

IsManager - Boolean new custom field

## User stories:
As a user, I can open an Item Purchase Tool page from Account layout (You need to put a button to Account layout that will open an Item Purchase Tool page in separate tab), the Account Object is not the same as the User object

As a user, I can see Account Name, Number, Account Industry on the page

As a user, I can filter the displayed items by Family and Type

As a user, I can see the count of listed items on the screen in the filter section

As a user, I can search for the item by Name and Description

As a user, I can see item details in modal window (Details button on Item Tile), also I can see an image of the item based on the Image URL on the item, link to get below

As a user, I can select an item and add it to Cart (Add button on Item Tile)

As a user, I can see items in the Cart (Cart button will open a modal with selected items in table view)

As a user, I can check out a Cart (Checkout button on Cart Modal) This action will create Purchase and Purchase Line records. 

TotalItems and GrandTotal on Purchase__c object should be calculated automatically in a Trigger based on Purchase Line records.

As a user, after checking out the cart I should be redirected to the standard Purchase layout to see created Purchase and Purchase Line records

As a manager, I should have the ability to create a new item in the modal window. (Create an Item button. The button should be available only for users with IsManager__c = true)
