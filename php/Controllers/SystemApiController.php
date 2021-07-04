<?php
namespace Grocy\Controllers;

use Grocy\Controllers\Users\User;

class SystemApiController extends BaseApiController
{
	public function GetConfig(\Psr\Http\Message\ServerRequestInterface $request, \Psr\Http\Message\ResponseInterface $response, array $args)
	{
		try
		{
			$constants = get_defined_constants();

			// Some GROCY_* constants are not really config settings and therefore should not be exposed
			unset($constants['GROCY_AUTHENTICATED'], $constants['GROCY_DATAPATH'], $constants['GROCY_IS_EMBEDDED_INSTALL'], $constants['GROCY_USER_ID']);

			$returnArray = [];

			foreach ($constants as $constant => $value)
			{
				if (substr($constant, 0, 6) === 'GROCY_')
				{
					$returnArray[substr($constant, 6)] = $value;
				}
			}

			return $this->ApiResponse($response, $returnArray);
		}
		catch (\Exception $ex)
		{
			return $this->GenericErrorResponse($response, $ex->getMessage());
		}
	}

	public function GetGrocyConfig(\Psr\Http\Message\ServerRequestInterface $request, \Psr\Http\Message\ResponseInterface $response, array $args) 
	{
		// locales
		$ls = $this->getLocalizationService();

		// featureflags
		$flags = get_defined_constants();
		foreach ($flags as $constant => $value)
		{
			if (substr($constant, 0, 19) !== 'GROCY_FEATURE_FLAG_')
			{
				unset($flags[$constant]);
			}
		}

		$GrocyConfig = [
			"Culture" => GROCY_LOCALE,
			"Currency" => GROCY_CURRENCY,
			"CalendarFirstDayOfWeek" => GROCY_CALENDAR_FIRST_DAY_OF_WEEK,
			"CalendarShowWeekNumbers" => GROCY_CALENDAR_SHOW_WEEK_OF_YEAR,
			"MealPlanFirstDayOfWeek" => GROCY_MEAL_PLAN_FIRST_DAY_OF_WEEK,
			"Locale" => $ls->Culture,
			"FeatureFlags" => $flags,

			"Webhooks" => [],
			"User" => [
				"Settings" => [],
				"Id" => -1,
				"Permissions" => []
			]
		];

		if(GROCY_FEATURE_FLAG_LABELPRINTER && !GROCY_LABEL_PRINTER_RUN_SERVER) {
			$GrocyConfig["Webhooks"] = array_merge($GrocyConfig["Webhooks"], [
				"labelprinter" => [
					"hook" => GROCY_LABEL_PRINTER_WEBHOOK,
					"extra_data" => GROCY_LABEL_PRINTER_PARAMS
				]
				]);
		}
		if(GROCY_AUTHENTICATED) {
			$user = $this->getSessionService()->GetDefaultUser();
			$GrocyConfig["User"]["Settings"] = array_merge($GrocyConfig["User"]["Settings"], $this->getUsersService()->GetUserSettings($user->id));
			$perms = User::PermissionList();
			foreach($perms as $value)
				$GrocyConfig["User"]["Permissions"][$value->permission_name] = $value->has_permission;

			
			$GrocyConfig["User"]["Id"] = $user->id;

			$GrocyConfig["User"] = array_merge($GrocyConfig["User"], [
				"Username" => $user->username,
				"PictureFileName" => $user->picture_file_name,
			]);
		}
		return $this->ApiResponse($response, $GrocyConfig);
	}

	public function GetQuantitiyUnitConfig(\Psr\Http\Message\ServerRequestInterface $request, \Psr\Http\Message\ResponseInterface $response, array $args)
	{
		// this probably doesn't align too well with vuex? but we'll see.
		return $this->ApiResponse($response, [
			'QuantityUnits' => $this->getDatabase()->quantity_units()->orderBy('name', 'COLLATE NOCASE'),
			'QuantityUnitConversionsResolved' => $this->getDatabase()->quantity_unit_conversions_resolved()
		]);
	}

	public function GetDbChangedTime(\Psr\Http\Message\ServerRequestInterface $request, \Psr\Http\Message\ResponseInterface $response, array $args)
	{
		return $this->ApiResponse($response, [
			'changed_time' => $this->getDatabaseService()->GetDbChangedTime()
		]);
	}

	public function GetSystemInfo(\Psr\Http\Message\ServerRequestInterface $request, \Psr\Http\Message\ResponseInterface $response, array $args)
	{
		return $this->ApiResponse($response, $this->getApplicationService()->GetSystemInfo());
	}

	public function GetSystemTime(\Psr\Http\Message\ServerRequestInterface $request, \Psr\Http\Message\ResponseInterface $response, array $args)
	{
		try
		{
			$offset = 0;
			$params = $request->getQueryParams();
			if (isset($params['offset']))
			{
				if (filter_var($params['offset'], FILTER_VALIDATE_INT) === false)
				{
					throw new \Exception('Query parameter "offset" is not a valid integer');
				}

				$offset = $params['offset'];
			}

			return $this->ApiResponse($response, $this->getApplicationService()->GetSystemTime($offset));
		}
		catch (\Exception $ex)
		{
			return $this->GenericErrorResponse($response, $ex->getMessage());
		}
	}

	public function LogMissingLocalization(\Psr\Http\Message\ServerRequestInterface $request, \Psr\Http\Message\ResponseInterface $response, array $args)
	{
		if (GROCY_MODE === 'dev')
		{
			try
			{
				$requestBody = $this->GetParsedAndFilteredRequestBody($request);

				$this->getLocalizationService()->CheckAndAddMissingTranslationToPot($requestBody['text']);
				file_put_contents("php://stderr", print_r($requestBody['text'], true));
				return $this->EmptyApiResponse($response);
			}
			catch (\Exception $ex)
			{
				return $this->GenericErrorResponse($response, $ex->getMessage());
			}
		}
	}

	public function __construct(\DI\Container $container)
	{
		parent::__construct($container);
	}
}
