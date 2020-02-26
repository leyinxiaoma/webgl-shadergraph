;(function(window){

    var wcUtils = window.wcUtils;

    var a11y = wcUtils.a11y;


    customElements.define('wc-checkbox',class  extends UIComponent {
        constructor(){
            super();
        }
        init() {
            super.init();
        this.setupProperties({
            name: {
                default: '',
                change: function(newValue) {
                    this._nodes.input.name = newValue;
                }
            },
            disabled: {
                default: false,
                type: Boolean,
                change: function(newValue) {
                    this._nodes.input.disabled = newValue;
                }
            },
            checked: {
                default: false,
                type: Boolean,
                change: function(newValue) {
                    if (this._nodes.input.checked !== newValue) {
                        this._nodes.input.checked = newValue;
                    }
                    this.emit('change');
                }
            },
            value: {
                default: 'on',
                change: function(newValue) {
                    this._nodes.input.value = newValue;
                }
            },
            label: {
                default: '',
                change: function(newValue) {
                    var label = this._nodes.label;

                    label.textContent = newValue;
                    if (!this.ariaLabel) {
                        this.ariaLabel = label.textContent;
                    }

                    if (!newValue) {
                        this.removeAttribute('label');
                    }
                }
            },
            indeterminate: {
                default: false,
                type: Boolean,
                change: function(newValue) {
                    var checkbox = this.querySelector('input');
                    checkbox.indeterminate = newValue;
                }

            },
            ariaLabel: {
                default: '',
                change: function(newValue) {
                    var childInput = this.querySelector('input');
                    if (newValue) {
                        childInput.setAttribute('aria-label', newValue);
                    } else {
                        childInput.removeAttribute('aria-label');
                    }
                }
            }
        });
    }

    postRender() {
        super.postRender(this);
        this._nodes = {};

        var input = this.querySelector('input'),
            label,
            id;

        if (!input) {
            input = this.ownerDocument.createElement('input');
            input.type = 'checkbox';
            this.appendChild(input);
        }
        id = 'wc-checkbox-' + this.componentId;
        input.id = id;
        this._nodes.input = input;

        label = this.querySelector('label');
        if (!label) {
            label = this.ownerDocument.createElement('label');
            this.appendChild(label);
        }
        label.htmlFor = id;
        this._nodes.label = label;

        if (!this.ariaLabel) {
            if (this.label) {
                this.ariaLabel = this.label;
            }
        }

        this.listenTo(input, 'click', function(evt) {
            evt.stopImmediatePropagation();
            this.checked = evt.target.checked;
            this.emit('click');
        }.bind(this));

        this.on('click', function(event) {
            event.preventDefault();
        });

        this.listenTo(input, 'change', function(evt) {
            evt.stopPropagation();
        }.bind(this));

        this.listenTo(label, 'click', function(evt) {
            evt.stopPropagation();
        });

        this.listenTo(input, 'blur', function() {
            this.emit('blur');
        }.bind(this));

        this.listenTo(input, 'focus', function() {
            this.emit('focus');
        }.bind(this));

        a11y.addA11yFocus(this);
    }
});

})(window);