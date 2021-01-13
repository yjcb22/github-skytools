<?php

$headersApi = apache_request_headers();
$authenticationHeader = array();
$authenticationHeader[] = 'Authorization:'.$headersApi['Authorization'];


//echo $headersApi;
//echo implode("|",$headersApi);
//echo implode("|",$authenticationHeader);
//echo http_build_query($headersApi);

//Initialize CURL session
$ch = curl_init();

//Set URL
curl_setopt($ch, CURLOPT_URL, "https://pbx.skyswitch.com/ns-api/");

//Set POST data
curl_setopt($ch, CURLOPT_POSTFIELDS, $_POST);

curl_setopt($ch, CURLOPT_HTTPHEADER,$authenticationHeader);

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
