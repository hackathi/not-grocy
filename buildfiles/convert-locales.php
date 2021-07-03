<?php
use Grocy\Services\LocalizationService;

function clean($in) {
	$out = $in;
	$out = str_replace("%s", "{string0}", $out);
	$out = preg_replace('/%([0-9])\$s/', '{string${1}}', $out);
	$out = str_replace('"', '\"', $out);
	$out = str_replace("%d", "{num0}", $out);
	$out = str_replace("\n", "", $out);
	return $out;
}

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

echo "Searching for localizations in " . REPO_BASE ."/localization/* \n";

$translations = array_filter(glob(REPO_BASE .'/localization/*'), 'is_dir');

foreach($translations as $lang) {
	
	$culture = basename($lang);
	
	echo "Generating " . $culture . "...\n";
	$ls = LocalizationService::getInstance($culture, true);
	$ls->LoadLocalizations(false);

	$lf = fopen(REPO_BASE . "/locale/" . $culture . ".json", "w");

	fwrite($lf, "{\n");
	
	$isFirst = true;
	foreach($ls->Po as $translation) {
		if(!$isFirst) {
			fwrite($lf, ",\n");
		}
		$isFirst = false;
		$orig = clean($translation->getOriginal());
		$hasPlural = $translation->hasPlural();
		if($hasPlural) {
			$orig .= ' | ' . clean($translation->getPlural());
		}

		$trans = clean($translation->getTranslation());
		if($hasPlural) {
			$plTrans = $translation->getPluralTranslations();
			foreach($plTrans as $pTrans) {
				$trans .= ' | ' . clean($pTrans);
			}
		}

		fwrite($lf, '     "'.$orig.'" : "'.$trans.'"');
	}
	fwrite($lf, "\n}\n");
}
