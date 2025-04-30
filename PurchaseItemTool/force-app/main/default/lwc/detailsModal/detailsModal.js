import { LightningElement, api } from 'lwc';

export default class DetailsModal extends LightningElement {
    @api item; 
    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}
