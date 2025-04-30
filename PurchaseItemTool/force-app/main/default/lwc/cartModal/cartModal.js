import { LightningElement, api } from 'lwc';

export default class CartModal extends LightningElement {
    @api cartItems = [];
    @api columns = [];

    // Закрытие модального окна
    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    // Обработка кнопки "Remove"
    handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;

        if (action.name === 'remove') {
            this.dispatchEvent(new CustomEvent('remove', {
                detail: { row }
            }));
        }
    }
}
