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
    
    function UpdateMap(location_name)
    {
        map_folder_name = "/wp-content/uploads/2025/04/"
        map_image = $("#map");
        
        //dictionary containing images that indicate which aisle is currently picked.
        const aisle_map = 
        { 
            aisle_one: "Grocery_Map_Aisle_One.png", 
            aisle_two: "Grocery_Map_Aisle_Two.png", 
            aisle_three: "Grocery_Map_Aisle_Three.png",  
            aisle_four: "Grocery_Map_Aisle_Four.png",  
            aisle_five: "Grocery_Map_Aisle_Five.png",  
            aisle_six: "Grocery_Map_Aisle_Six.png",  
            aisle_seven: "Grocery_Map_Aisle_Seven.png",  
            aisle_eight: "Grocery_Map_Aisle_Eight.png",  
            aisle_nine: "Grocery_Map_Aisle_Nine.png",  
            aisle_ten: "Grocery_Map_Aisle_Ten.png",  
            aisle_eleven: "Grocery_Map_Aisle_Eleven.png",  
            aisle_twelve: "Grocery_Map_Aisle_Twelve.png",  
            aisle_thirteen: "Grocery_Map_Aisle_Thirteen.png",  
            aisle_fourteen: "Grocery_Map_Aisle_Fourteen.png",  
            aisle_fifteen: "Grocery_Map_Aisle_Fifteen.png",  
            aisle_sixteen: "Grocery_Map_Aisle_Sixteen.png",  
            aisle_seventeen: "Grocery_Map_Aisle_Seventeen.png",  
            aisle_eighteen: "Grocery_Map_Aisle_Eighteen.png",  
            aisle_nineteen: "Grocery_Map_Aisle_Nineteen.png",  
            aisle_twenty: "Grocery_Map_Aisle_Twenty.png",
            bakery: "Grocery_Map_Bakery.png",
            meat: "Grocery_Map_Meat.png",
            seafood: "Grocery_Map_Seafood.png",
            pharmacy: "Grocery_Map_Pharmacy.png",
            frozen_food: "Grocery_Map_Frozen_Food.png",
            produce: "Grocery_Map_Produce.png",
            frozen_food: "Grocery_Map_Frozen_Food.png",
        };
        
        //get image name
        const image_name = aisle_map[location_name] || "Grocery_Map.png"; //default image has no aisle markers on it.
        
        //update the image using the image_name.
        //map_image.attr("src", map_folder_name + image_name);
        full_path = map_folder_name + image_name;
        
        // Set the background image
        map_image.css("background-image", "url('" + full_path + "')");
        
    }


    function ScrollToMap()
    {
        //description: this code just scrolls the page to the location of the map, so that the user can view the aisle location.

        let scroll_timer = 300; //how long to scroll the web page for.
        let scroll_offset = 100; //offset of the position on the web page to scroll to. (the map in this case)

        requestAnimationFrame(function() {
            $("html, body").animate({
                scrollTop: (map_location.offset().top - scroll_offset)
            }, scroll_timer, "linear");
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
                //update map image, using the name of location as parameter
                UpdateMap(map_location_text);
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

