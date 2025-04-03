<?php
/*
Program name: functions.php
Program description: This program is a series of functions used to interact with and retreive data from wordpress.
More specifically, it's used to determine which items are to be displayed in the search results dropdown list, and check which aisle they are found in.
*/

//load live search JavaScript file for wordpress.
function enqueue_live_search_script() {
    wp_enqueue_script("live-search", get_stylesheet_directory_uri() . "/scripts/live-search.js", array("jquery"), null, true);
    wp_localize_script("live-search", "ajaxurl", array("ajaxurl" => admin_url("admin-ajax.php"))); //make sure we can pass-in variables to JavaScript as well.
}


function find_aisle()
{
    /*
    description: this function runs once a dropdown menu item is clicked, and simply checks the wordpress database if the searched item name matches with a name found in the database.
    If there is a match, the location of the aisle that contains that item is returned with the request. 

    parameters: none
    return: none
    */

    global $wpdb;

    //check item_name in the ajax request.
    if (isset($_POST['item_name'])) {
        $item_name = sanitize_text_field($_POST['item_name']); //declare item_name variable, while removing unwanted characters for security reasons.

        // Query to fetch location based on item_name
        $table_name = $wpdb->prefix . "grocery_map";
        $location = $wpdb->get_var($wpdb->prepare("SELECT item_location FROM $table_name WHERE item_name = %s", $item_name)); //search items containing the text in any part of the item name.

        //return results

        if ($location) {
            wp_send_json_success(["location" => $location]);
        } else {
            wp_send_json_error(["error" => "Location not found"]);
        }
    } else {
        wp_send_json_error(["error" => "No item selected"]);
    }

    wp_die(); //end request
}

function GetSearchResults() 
{
    /*
    description: this function runs everytime a new letter is typed in the search bar. 
    Items are then stored as an array and returned as the response.

    parameters: none
    return: none
    */


    global $wpdb;

    //store data from POST method as a search query
    $search_query = isset($_POST['search_query']) ? sanitize_text_field($_POST['search_query']) : '';

    //sql statement to retreieve items
    $sql = "SELECT item_name FROM wp_grocery_map";

    //query gets filtered to include only matches similar to what you've typed
    if (!empty($search_query)) {
        $sql .= " WHERE item_name LIKE %s";
        $prepared_query = $wpdb->prepare($sql, '%' . $wpdb->esc_like($search_query) . '%');
    } else {
        $prepared_query = $sql; //returns all items
    }

    $items = $wpdb->get_results($prepared_query);

    if ($items) {
        $response = []; //store response as list of items containing the id and name of product
        foreach ($items as $item) { //loop through each returned result, getting the id and name.
            $response[] = [
                "id"   => $item->item_id,
                "name" => $item->item_name
            ];
        }
        wp_send_json_success($response);
    } else {
        wp_send_json_error(["message" => "No items found."]);
    }

    wp_die(); //end request
}

//make sure live-search works for different types of users

add_action("wp_ajax_find_aisle", "find_aisle");
add_action("wp_ajax_nopriv_find_aisle", "find_aisle");

add_action("wp_ajax_live_search", "GetSearchResults");
add_action("wp_ajax_nopriv_live_search", "GetSearchResults");

add_action("wp_enqueue_scripts", "enqueue_live_search_script");