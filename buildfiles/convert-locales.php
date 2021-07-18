<?php
use Grocy\Services\LocalizationService;

function clean($in, $pluralMode) {
	$out = $in;
	$varname = $pluralMode ? "{count}" : "{string0}";

	$out = str_replace("%s", $varname, $out);
	$out = preg_replace('/%([0-9])\$s/', '{string${1}}', $out);
	$out = str_replace('"', '\"', $out);
	$out = str_replace("%d", $varname, $out);
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
		$hasPlural = $translation->hasPlural();
		if(!$isFirst) {
			fwrite($lf, ",\n");
		}
		$isFirst = false;
		$orig = clean($translation->getOriginal(), $hasPlural);
		if($hasPlural) {
			$orig .= ' | ' . clean($translation->getPlural(), $hasPlural);
		}

		$trans = clean($translation->getTranslation(), $hasPlural);
		if($hasPlural) {
			$plTrans = $translation->getPluralTranslations();
			foreach($plTrans as $pTrans) {
				$trans .= ' | ' . clean($pTrans, $hasPlural);
			}
		}

		fwrite($lf, '     "'.$orig.'" : "'.$trans.'"');
	}
	fwrite($lf, "\n}\n");
}
