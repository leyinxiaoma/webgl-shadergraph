const icon = {
    onChangeIconProperty: function(newValue) {
        if (this._textField) {
            this._textField.icon = newValue;

            if (!newValue) {
                this.removeAttribute('icon');
            }

            return;
        }

        var icon = this.querySelector('i');

        if (!newValue) {
            if (icon) {
                icon.parentNode.removeChild(icon);
            }

            this.removeAttribute('icon');
        } else {
            if (!icon) {
                icon = this.ownerDocument.createElement('i');

                switch (this.tagName.toLowerCase()) {
                    case 'wc-select':
                        this.querySelector('button').appendChild(icon);
                        break;

                    case 'wc-text-field':
                        this.insertBefore(icon, this.querySelector('input'));
                        break;

                    default:
                        throw new Error('Embedded icon not implemented for ' + this.tagName);
                }
            }

            icon.className = 'fi embedded ' + newValue;
        }
    }
};

window.icon = icon;
