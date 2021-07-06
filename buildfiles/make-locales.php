<?php

if($argc !== 3)
{
	echo "Usage: " . $argv[0] . " INPUT OUTPUT\n";
	exit(1);
}

$in = json_decode(file_get_contents($argv[1], $argv[2]), true);

$out = array_filter($in, function ($k, $v) { return !empty($v); }, ARRAY_FILTER_USE_BOTH );

file_put_contents($argv[2], json_encode($out));