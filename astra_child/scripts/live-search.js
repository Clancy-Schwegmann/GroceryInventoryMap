/*
Program Name: Live Search Map
Program Description: This program contains a series of functions used to retrieve the SQL data from the ajax response on WordPress, if the user types the name
of an item that exists in the database, the data will be shown as an unordered list item in a dropdown. Additionally, if the item is found and clicked on, it will
then see where the item exists on the map.
*/


jQuery(document).ready(function ($) {
    //declare important live-search variables.

    let search_input = $("#search-bar"); //input entered into search bar
    let search_output = $("#search-results"); //dropdown items
    let map_location = $("#map-container"); //map image on the web page.

    function ScrollToMap()
    {
        //description: this code just scrolls the page to the location of the map, so that the user can view the aisle location.

        let scroll_timer = 300; //how long to scroll the web page for.
        let scroll_offset = 50; //offset of the position on the web page to scroll to. (the map in this case)

        requestAnimationFrame(function() {
            $("html, body").animate({
                scrollTop: (map_location.offset().top - scroll_offset)
            }, scroll_timer, "linear"); // Smooth scroll in 800ms
        });
    }

    
    function ShowItemLocation(search)
    {
    /*
        description: this function performs a query that checks which aisle the item is located at, it then
        displays this information to the user.

        parameters: search-result dropdown item (as an object)
        return: none
    */
        let search_text = $(search).text().split(" ").join("_");
        $.ajax({
            url: ajaxurl.ajaxurl,
            type: "POST",
            data: { 
                action: "find_aisle",
                item_name: search_text
        },
        dataType: "json",
        success: function (response) 
        {
            if (response.success) 
            {
                let map_text = $("#map-output");
                let map_location_text = response.data.location;
                let map_item_text = $(search).text();
                //replace underscores with spaces.
                map_location_text = map_location_text.split("_").join(" ");
                //display where item is located at.
                map_text.text("\"" + map_item_text + "\"" + " is located in " + map_location_text + ".");
            } else 
            {
                console.error(response.data.error);
            }
        },
        error: function () 
        {
            console.error("Error retrieving location data.");
        }
        });
    }

    function FetchItems(query = "") 
    {
    /*
        description: this function runs everytime a new letter is typed in the search bar, as long as you have typed at least 2 letters. 
    Items are then stored as an array and returned as the response.

        parameters: search query, this is typed in the search bar, by default it's just a string containing no characters.
        return: none
    */


        //begin sending ajax request.
        $.ajax({
            url: ajaxurl.ajaxurl,
            type: "POST", //type of ajax action to make, post is common since it requires sending data.
            data: {
                action: "live_search", //perform live_search action in the php script.
                search_query: query
            },
            beforeSend: function () {
                //We can output something to user while waiting for a response, currently this function does nothing though.
                return;
            },
            success: function (response) {
                if (response.success) {
                    //store php response as variable.
                    let items = response.data; 
                
                    //begin creating html elements using the returned results.
                    let output = "<ul class='dropdown-list'>";
                    //concatenate items to drop-down output as list, replacing underscores with spaces.
                    items.forEach(item => {
                        output += `<li class="dropdown-item">${item.name.split("_").join(" ")}</li>`;
                    }); 
                    //closing tag.
                    output += "</ul>";
                    //output dropdown items as html elements.
                    search_output.html(output).show();
                } 
            },
        });
    }

    //perform live-search
    search_input.on("keyup", function () {
        //store user input as a "query", trimming empty characters
        let query = $(this).val().trim();
        

        //check if at least 2 characters are entered
        if (query.length > 1) {
            FetchItems(query);
        }
        else //otherwise clear results
        {
            search_output.html("");
        }
        return;
    });

    //hide drop-down menu when clicking outside it. (works similar to google search)
    $(document).on("click", function (event) {
        if (!search_input.is(event.target) && !search_output.is(event.target)) {
            search_output.hide();
        }
    });

    //click on item to auto-complete and execute functions
    search_output.on("click", ".dropdown-item", function(e) {
        e.preventDefault()
        //scroll to map portion of the web page
        ScrollToMap();
        //show product location, via text
        ShowItemLocation(this);
        search_input.val($(this).text());
        search_output.hide();
    });
});

