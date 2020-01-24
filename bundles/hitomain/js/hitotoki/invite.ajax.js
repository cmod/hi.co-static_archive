$(function(){

    var form = $("#invitation_form");
    if(form[0]){
        form.submit(function(e){
            if(e&&e.preventDefault){ e.preventDefault(); }

            $.ajax({
                url: form.attr("action"),
                method: "post",
                data: form.serialize()
            }).done(function(d){
                var ret = $(d),
                    err = ret.find("#invitation_form ul");

                form.find("ul").remove();
                if(err[0]){
                    form.prepend(err.detach());
                }else{
                    //alert("Thanks, we'll get in touch!");
                    form.prepend('<h4>Thanks, we\'ll be in touch. :)</h4>');
                    setTimeout(function(){
                        form.slideUp()
                    }, 3000);
                }
            })

        })
    }

})