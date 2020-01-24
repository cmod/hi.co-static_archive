
(function($){
    var HiModalZoomer, win = $(window);

    HiModalZoomer = (function(){
        function HiModalZoomer(element, trigger_element){
            this.setElement(element);
            this.setTrigger(trigger_element||element);

            this.binded_open = _.bind(this.open, this);
            this.binded_close = _.bind(this.close, this);

            this.setOpenable();            
        }

        HiModalZoomer.prototype.setElement = function(elem){
            this.element = elem;
        }
        HiModalZoomer.prototype.getElement = function(){
            return this.element;
        }

        HiModalZoomer.prototype.setTrigger = function(trig){
            this.trigger = trig;
        }
        HiModalZoomer.prototype.getTrigger = function(){
            return this.trigger;
        }


        HiModalZoomer.prototype.open = function(){
            this.cancelAllEvents()

            // make sure all previous elements are destroyed

            // create new elements (image/div and background)
            // place new_elements

            // calc scale and translations

            // animate
        }

        HiModalZoomer.prototype.close = function(){
            this.cancelAllEvents()
            
        }

        HiModalZoomer.prototype.setOpenable = function(){
            this.trigger.on("click", this.binded_open);
        }

        HiModalZoomer.prototype.setClosable = function(){

        }

        HiModalZoomer.prototype.cancelAllEvents = function(){
            this.trigger.off("click", this.binded_open);
            this.trigger.off("click", this.binded_close);
        }


        return ModalZoomer;
    })()
    
    window.Hi = window.Hi||{}
    window.Hi.tools = window.Hi.tools||{}
    window.Hi.tools.HiModalZoomer = HiModalZoomer;
})(jQuery)