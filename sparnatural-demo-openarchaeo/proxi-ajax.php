<?php
header('Content-Type: application/json; charset=ISO-8859-1');
// proxyAjax.php
// ... validation of params
// and checking of url against whitelist would happen here ...
// assume that $url now contains "http://stackoverflow.com/10m"
//var_dump($_GET) ;
echo file_get_contents($_GET['url']);