<?php

    $clientID = $_POST["client_id"];
    $clientPassword = $_POST["client_secret"];
    $pbxUsername = $_POST["username"];
    $pbxPassword = $_POST["password"];
    $domain = $_POST["domain"];
    $grandType = "password";

    //POST data
    $postValues = array(
        "client_id" => $clientID,
        "client_secret" => $clientPassword,
        "username" => $pbxUsername,
        "password" => $pbxPassword,
        "grant_type" => $grandType
    );

    //Initialize CURL session
    $ch = curl_init();

    //Set URL
    curl_setopt($ch, CURLOPT_URL, "https://pbx.skyswitch.com/ns-api/oauth2/token/");

    //Set POST data
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postValues);

    //return the transfer as a string instead of outputting it directly
    //curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

    //Store the output
    //$output = curl_exec($ch);
    curl_exec($ch);
    //Store the details of the connection result
    $curlInfo = curl_getinfo($ch);

    //Check if any error ocurred
    if (curl_errno($ch)) {
        echo "Curl error: " . curl_error($ch);
    } else if ($curlInfo["http_code"] !== 200) {
        echo "HTTP error. URL: " . $curlInfo["url"] . " HTTP error code: " .  $curlInfo["http_code"];
    }

    //Close curl resource to free up system resources
    curl_close($ch);

    //echo $output;
?>