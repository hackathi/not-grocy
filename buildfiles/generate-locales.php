<?php
use Grocy\Services\LocalizationService;

/* This file statically generates json to handle
 * frontend translations.
 */
const REPO_BASE = __DIR__ . '/..';
define("GROCY_DATAPATH", REPO_BASE .'/data');

// Load composer dependencies
require_once REPO_BASE .'/vendor/autoload.php';
// Load config files
if(file_exists(GROCY_DATAPATH . '/config.php')) {
	require_once GROCY_DATAPATH . '/config.php';
}
require_once REPO_BASE .'/php/config-dist.php'; // For not in own config defined values we use the default ones

echo "Searching for localizations in " . REPO_BASE .'/localization/* \n';

$translations = array_filter(glob(REPO_BASE .'/localization/*'), 'is_dir');

// ensure the target directory is there
if(!is_dir(REPO_BASE .'/public/js/locales/grocy/')) {
	mkdir(REPO_BASE .'/public/js/locales/grocy/', 0777, true);
}

foreach($translations as $lang) {
	$culture = basename($lang);
	echo "Generating " . $culture . "...\n";
	$ls = LocalizationService::getInstance($culture, true);
	$ls->LoadLocalizations(false);
	file_put_contents(REPO_BASE .'/public/js/locales/grocy/'.$culture.'.json', $ls->GetPoAsJsonString());
}
