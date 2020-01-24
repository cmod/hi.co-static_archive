//innerload


(function($){
    $.fn.innerload = function(method) {
        var size, template;

        size = this.data("loader-size");
        if(!size) size = "m";

        template = '<div class="circleG_Loader '+size+'"><div class="circleG_1 circleG"></div><div class="circleG_2 circleG"></div><div class="circleG_3 circleG"></div></div>';

        switch(method){
            case "kill":
            case "destroy":
            case "close":
                this.find( ".circleG_Loader" ).remove();
                break

            default:
                this.append( template );
                break;
        }
        return this;
    };
}(jQuery))