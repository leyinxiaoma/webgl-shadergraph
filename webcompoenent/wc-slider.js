;(function(window){
    function calculateChange(e, _a, container){
        e.preventDefault();
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const x = typeof e.pageX === 'number' ? e.pageX : e.touches[0].pageX;
        const y = typeof e.pageY === 'number' ? e.pageY : e.touches[0].pageY;
        const left = x - (container.getBoundingClientRect().left + window.pageXOffset);
        const top = y - (container.getBoundingClientRect().top + window.pageYOffset);
        var a;
        if (left < 0) {
            a = 0
        } else if (left > containerWidth) {
            a = 1
        } else {
            a = Math.round((left * 100) / containerWidth) / 100
        }

        if (_a !== a) {
            return {
                a:a
            }
        }
    }


    customElements.define('wc-slider',class  extends UIComponent {
        constructor(){
            super();
        }
        init() {
            super.init();

            this.setupProperties({

                normalizeValue:{
                    default: 0,
                    type: Number,
                    change: function(newValue,oldValue) {
                        if(newValue != oldValue){
                            var a = Number(newValue);
                            this._nodes[0].style.left =  a * 100 + '%';
                        }
                    }
                },
                value:{
                    default: 0,
                    type: Number,
                    change: function(newValue,oldValue) {
                        if(newValue != oldValue){
                            var a = Number(newValue);
                            this.normalizeValue =  (a - this.min) / (this.max - this.min);
                        }
                    }
                },
                min:{
                    default: 0,
                    type: Number
                },
                max:{
                    default: 1,
                    type: Number
                },
                name:{
                    default: "",
                    type: String
                }


            })


        }

        preRender(){
            this.template = () => `<div class="wc-slider">
<div class="slider-checkboard">
   <div class="slider-checkboard-renderbg"></div>
</div>

<div class="slider-handle-container">
    <div class="slider-handle">
    </div>
</div>

</div>`;
        }

        postRender(){
            super.postRender();
            var self = this;
            this._nodes = [];
            var pointer  = this.querySelector('.slider-handle');
            this._nodes.push(pointer);

            var _container = self.querySelector('.slider-handle-container')
            self.handleMouseDown = function (e) {
                self.handleChange(e, true);
                window.addEventListener('mousemove', self.handleChange)
                window.addEventListener('mouseup',   self.handleMouseUp)
            }

            self.handleChange = function (e, skip){
                var hsl = self.hsl
                var obj = calculateChange(e, skip, _container);
                self.normalizeValue = Number(obj.a);
                self.value = self.min + self.normalizeValue * (self.max - self.min);
                pointer.style.left = `${ obj.a * 100 }%`;
                self.emit('change')
            }

            self.handleMouseUp = function(){
                self.unbindEventListeners()
            }


            this.listenTo(_container,'mousedown',self.handleMouseDown)
            this.listenTo(_container,'touchmove',self.handleChange)
            this.listenTo(_container,'touchstart',self.handleChange)

        }

        disconnectedCallback() {
            this.unbindEventListeners()
        }

        unbindEventListeners() {
            window.removeEventListener('mousemove', this.handleChange)
            window.removeEventListener('mouseup', this.handleMouseUp)
        }


    })

})(window);