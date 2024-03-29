import { __t } from '../lib/legacy'; //import { $ } from 'jquery';

import { WindowMessageBag } from '../helpers/messagebag';

function stockentryformView(Grocy, scope = null) 
{
	let $scope = $;

	if (scope != null) 
	{
		$scope = selector => $(scope).find(selector);
	}

	const datetimepicker = Grocy.Use('datetimepicker');
	const datetimepicker2 = Grocy.Use('datetimepicker2');
	const locationpicker = Grocy.Use('locationpicker');
	Grocy.Use('numberpicker');
	const shoppinglocationpicker = Grocy.Use('shoppinglocationpicker');
	$scope('#save-stockentry-button').on('click', function (e) 
	{
		e.preventDefault();

		if ($scope('.combobox-menu-visible').length) 
		{
			return;
		}

		const jsonForm = $scope('#stockentry-form').serializeJSON();
		Grocy.FrontendHelpers.BeginUiBusy('stockentry-form');
		const jsonData = {};

		if (!jsonForm.price.toString().isEmpty()) 
		{
			jsonData.price = parseFloat(jsonForm.price).toFixed(Grocy.UserSettings.stock_decimal_places_prices);
		}

		jsonData.amount = jsonForm.amount;
		jsonData.best_before_date = datetimepicker.GetValue();
		jsonData.purchased_date = datetimepicker2.GetValue();

		if (Grocy.FeatureFlags.GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING) 
		{
			jsonData.shopping_location_id = shoppinglocationpicker.GetValue();
		}

		if (Grocy.FeatureFlags.GROCY_FEATURE_FLAG_STOCK_LOCATION_TRACKING) 
		{
			jsonData.location_id = locationpicker.GetValue();
		}
		else 
		{
			jsonData.location_id = 1;
		}

		jsonData.open = $scope('#open').is(':checked');
		Grocy.Api.Put('stock/entry/' + Grocy.EditObjectId, jsonData, function (result) 
		{
			const successMessage = __t('Stock entry successfully updated') + '<br><a class="btn btn-secondary btn-sm mt-2" href="#" onclick="Grocy.UndoStockBookingEntry(\'' + result[0].id + '\',\'' + Grocy.EditObjectId + '\')"><i class="fas fa-undo"></i> ' + __t('Undo') + '</a>';
			window.parent.postMessage(WindowMessageBag('StockEntryChanged', Grocy.EditObjectId), Grocy.BaseUrl);
			window.parent.postMessage(WindowMessageBag('ShowSuccessMessage', successMessage), Grocy.BaseUrl);
			window.parent.postMessage(WindowMessageBag('Ready'), Grocy.BaseUrl);
			window.parent.postMessage(WindowMessageBag('CloseAllModals'), Grocy.BaseUrl);
		}, function (xhr) 
		{
			Grocy.FrontendHelpers.EndUiBusy('stockentry-form');
			console.error(xhr);
		});
	});
	Grocy.FrontendHelpers.ValidateForm('stockentry-form');
	$scope('#stockentry-form input').keyup(function (event) 
	{
		Grocy.FrontendHelpers.ValidateForm('stockentry-form');
	});
	$scope('#stockentry-form input').keydown(function (event) 
	{
		if (event.keyCode === 13) // Enter
		{
			event.preventDefault();

			if ($scope('#stockentry-form')[0].checkValidity() === false) // There is at least one validation error
			{
				return false;
			}
			else 
			{
				$scope('#save-stockentry-button').click();
			}
		}
	});
	datetimepicker.GetInputElement().on('change', function (e) 
	{
		Grocy.FrontendHelpers.ValidateForm('stockentry-form');
	});
	datetimepicker.GetInputElement().on('keypress', function (e) 
	{
		Grocy.FrontendHelpers.ValidateForm('stockentry-form');
	});
	datetimepicker2.GetInputElement().on('change', function (e) 
	{
		Grocy.FrontendHelpers.ValidateForm('stockentry-form');
	});
	datetimepicker2.GetInputElement().on('keypress', function (e) 
	{
		Grocy.FrontendHelpers.ValidateForm('stockentry-form');
	});
	Grocy.Api.Get('stock/products/' + Grocy.EditObjectProductId, function (productDetails) 
	{
		$scope('#amount_qu_unit').text(productDetails.quantity_unit_stock.name);
	}, function (xhr) 
	{
		console.error(xhr);
	});
	$scope('#amount').on('focus', function (e) 
	{
		$(this).select();
	});
	$scope('#amount').focus();
	Grocy.FrontendHelpers.ValidateForm('stockentry-form');
}

export { stockentryformView };