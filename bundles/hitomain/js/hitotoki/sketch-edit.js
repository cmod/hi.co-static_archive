
$(function(){
    
    var edit_text_link = $(".open_edit_text_link"),
        header = $(".moment_head h1"),
        wordcount = $("#SketchTextEditWordcount"),
        date_container = $(".edit-date-container"),
        date_h3 = $("h3.moment_date"),
        save_btn = date_container.find(".done"),
        cancel_btn = date_container.find(".cancel"),
        backup_title = header.text();


    if(!wordcount[0]){
        wordcount = $("<div></div>")
            .attr("id", "SketchTextEditWordcount")
            .attr("class", "wordcount" )
            .text("0 word")
            .hide()
        ;

        header.after(wordcount);
    }


    header.on("mouseover", function(){
        $(this).addClass("hover")
    }).on("mouseout", function(){
        $(this).removeClass("hover")
    }).on("keyup", update_wordcount)

    header[0].contentEditable = true;

    edit_text_link.on("click", start_edit_text)
    header.on("click", start_edit_text)
    save_btn.on("click", save_edit)
    cancel_btn.on("click", cancel_edit)



    function start_edit_text(e){

        if(e && e.preventDefault){
            e.preventDefault();
        }

        var hx = e.pageX - header.offset().left,
            hy = e.pageY - header.offset().top;

        backup_title = header.text();
        update_wordcount()
        
        // edit_text_link.text("done")
        // edit_text_link.off("click", start_edit_text)
        // edit_text_link.on("click", save_edit)
        header.addClass("edit");

        update_date_form();
        edit_text_link.hide();

        
        $("#editDateYear").prop("disabled", false)
        $("#editDateMonth").prop("disabled", false)
        $("#editDateDay").prop("disabled", false)
        $("#editDateHour").prop("disabled", false)
        $("#editDateMin").prop("disabled", false)

        setTimeout(function(){
            date_container.show();
            date_h3.hide();

            
            wordcount.show();
        }, 50)

        return false
    }

    function update_date_form(e){
        if(e && e.preventDefault){
            e.preventDefault();
        }

        var d = new Date(date_h3.data("stamp")*1000);
        console.info(d.toUTCString())

        $("#editDateMonth").val( date_h3.data("month") );
        $("#editDateDay").val( Number(date_h3.data("day")) );
        $("#editDateYear").val( date_h3.data("year") );
        $("#editDateHour").val( date_h3.data("hour") );
        $("#editDateMin").val( date_h3.data("min") );
        $("#editDateAmpm").val( date_h3.data("ampm") );
    }

    function get_date_form_timestamp(e){

        var year  = Number($("#editDateYear").val()),
            month = Number($("#editDateMonth").val()),
            day   = Number($("#editDateDay").val()),
            hour  = Number($("#editDateHour").val()),
            min   = Number($("#editDateMin").val()),
            d     = new Date();
        if( $("#editDateAmpm").val() == "pm" ){
            hour+=12;
            if(hour==24){
                hour = 0;
            }
        }

        d.setUTCFullYear(year);
        d.setUTCMonth(month-1);
        d.setUTCDate(day);
        d.setUTCHours(hour);
        d.setUTCMinutes(min);
        d.setUTCSeconds(0);

        return Math.round( d.getTime()/1000 );
    }

    function cancel_edit(e){

        wordcount.hide();
        header.removeClass("edit");

        date_container.hide();
        date_h3.show();

        header.text(backup_title);

        edit_text_link.show();
    }

    function save_edit(e){

        if(e && e.preventDefault){
            e.preventDefault();
        }

        save_btn.prop("disabled", true).innerload();

        var data = {
                date: get_date_form_timestamp(),
                text: header.text()
            };

        // edit_text_link.off("click", save_edit)
        // edit_text_link.on("click", start_edit_text)
        // edit_text_link.text("edit")

        $("#editDateYear").prop("disabled", true)
        $("#editDateMonth").prop("disabled", true)
        $("#editDateDay").prop("disabled", true)
        $("#editDateHour").prop("disabled", true)
        $("#editDateMin").prop("disabled", true)

        $.ajax({
            url: $(".open_edit_text_link").data("url"),
            //url: "/api/moments/"+window.current_sketch.id,
            contentType: 'application/json',
            dataType: 'json',
            type: "PATCH",
            data: JSON.stringify(data)
        }).done(function(d,s,xhr){
            save_btn.prop("disabled", false).innerload("kill");

            header.text( data.text ).show();
            date_h3.text( moment(data.date*1000).utc().format("MMMM Do, YYYY, ha") );

            backup_title = header.text();
            cancel_edit()

        }).fail(function(){
            save_btn.prop("disabled", false).innerload("kill");

            cancel_edit()
        })

        
        
    }

    function update_wordcount(e){
        if(e && e.preventDefault){
            e.preventDefault();
        }

        var cnt = header.text().match(/\S+/g).length
            s = cnt>1?"s":"";

        wordcount.text(cnt+" word"+s)
    }

    


    
})