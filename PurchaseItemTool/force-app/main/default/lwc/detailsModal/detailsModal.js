import { LightningElement, api } from 'lwc';

export default class DetailsModal extends LightningElement {
    @api item;
    @api isManager;

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleDelete() {
        this.dispatchEvent(new CustomEvent('delete'));
    }
}
