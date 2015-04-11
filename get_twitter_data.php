<?php
/**
 * Created by PhpStorm.
 * User: WILLIAM
 * Date: 10/13/14
 * Time: 6:11 AM
 */
header('Access-Control-Allow-Origin: *');
$config = array(
    "oauth_access_key" => " 333934038-d6MB5lKgamTfawsW0AXXZVi3jVtJzHYecPNoZOGQ",
    "oauth_access_token_secret" => "6luhBgIDuu7GHKkJEXPCcJ2oKNkIxufWpEQntAFoVCree",
    "consumer_key" => " rrnlttdgRIQVPKzkAm0S8qaA9",
    "consumer_secret" => "SzUvCsXO3MZ13WZxmWjj6IRqOs8Mbp7sDi3MsscUaZ7Z4NWyim",
    "base_url" => "https://api.twitter.com/1.1/"

);

// Get url
if(!isset($_GET['url'])){
    echo "No url provided";
}
$url = $_GET['url'];

$url_parts = parse_url($url);
parse_str($url_parts['query'],$url_arguments);

$full_url = $config['base_url'];
$base_url = $config['base_url'].$url_parts['path'];

function buildBaseUrl($baseUri,$method,$params){
        $r = array();
    ksort($params);
    foreach($params as $key => $value){
        $r[] = "$key=".urlencode($value);
    }
    return $method."&".rawurldecode(implode('&',$r));
}
function buildAuthorizationHeader($oauth){
    $r = 'Authorization: OAuth ';
    $values = array();
    foreach($oauth as $key=>$value)
        $values[] = "$key=\"" . rawurlencode($value) . "\"";
    $r .= implode(', ', $values);
    return $r;
}
// Set up the oauth Authorization array
$oauth = array(
    'oauth_consumer_key' => $config['consumer_key'],
    'oauth_nonce' => time(),
    'oauth_signature_method' => 'HMAC-SHA1',
    'oauth_token' => $config['oauth_access_token'],
    'oauth_timestamp' => time(),
    'oauth_version' => '1.0'
);
$base_info = buildBaseString($base_url, 'GET', array_merge($oauth, $url_arguments));
$composite_key = rawurlencode($config['consumer_secret']) . '&' . rawurlencode($config['oauth_access_token_secret']);
$oauth_signature = base64_encode(hash_hmac('sha1', $base_info, $composite_key, true));
$oauth['oauth_signature'] = $oauth_signature;

// Make Requests
$header = array(
    buildAuthorizationHeader($oauth),
    'Expect:'
);
$options = array(
    CURLOPT_HTTPHEADER => $header,
//CURLOPT_POSTFIELDS => $postfields,
    CURLOPT_URL => $full_url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_SSL_VERIFYPEER => false
);

$feed = curl_init();
curl_setopt_array($feed, $options);
$result = curl_exec($feed);
$info = curl_getinfo($feed);
curl_close($feed);

// Send suitable headers to the end user.
if(isset($info['content_type']) && isset($info['size_download'])){
    header('Content-Type: '.$info['content_type']);
    header('Content-Length: '.$info['size_download']);
}


echo($result);
?>