import { LightningElement, api } from 'lwc';

export default class DetailsModal extends LightningElement {
    @api item; // Этот параметр будет передаваться из родительского компонента.

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}
