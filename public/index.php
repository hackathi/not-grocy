<?php

// Definitions for embedded mode

const REPO_BASE = __DIR__ . '/..';

if (file_exists(REPO_BASE . '/embedded.txt'))
{
	define('GROCY_IS_EMBEDDED_INSTALL', true);
	define('GROCY_DATAPATH', file_get_contents(REPO_BASE . '/embedded.txt'));
	define('GROCY_USER_ID', 1);
}
else
{
	define('GROCY_IS_EMBEDDED_INSTALL', false);

	$datapath = 'data';

	if (getenv('GROCY_DATAPATH') !== false)
	{
		$datapath = getenv('GROCY_DATAPATH');
	}
	elseif (array_key_exists('GROCY_DATAPATH', $_SERVER))
	{
		$datapath = $_SERVER['GROCY_DATAPATH'];
	}

	if ($datapath[0] != '/')
	{
		$datapath = REPO_BASE . '/' . $datapath;
	}

	define('GROCY_DATAPATH', $datapath);
}

require_once REPO_BASE . '/php/Helpers/PrerequisiteChecker.php';

try
{
	(new PrerequisiteChecker())->checkRequirements();
}
catch (ERequirementNotMet $ex)
{
	exit('Unable to run grocy: ' . $ex->getMessage());
}

require_once REPO_BASE . '/php/app.php';
