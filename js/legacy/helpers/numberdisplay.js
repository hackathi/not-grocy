//import { $ } from 'jquery';

/* global Grocy */
function RefreshLocaleNumberDisplay(rootSelector = '#page-content') 
{
	$(rootSelector + ' .locale-number.locale-number-currency').each(function () 
	{
		const elem = $(this);
		const text = elem.text();

		if (isNaN(text) || text.isEmpty()) 
		{
			return;
		}

		const value = parseFloat(text);
		elem.text(value.toLocaleString(undefined, {
			style: 'currency',
			currency: Grocy.Currency,
			minimumFractionDigits: Grocy.UserSettings.stock_decimal_places_prices,
			maximumFractionDigits: Grocy.UserSettings.stock_decimal_places_prices
		}));
	});
	$(rootSelector + ' .locale-number.locale-number-quantity-amount').each(function () 
	{
		const elem = $(this);
		const text = elem.text();

		if (isNaN(text) || text.isEmpty()) 
		{
			return;
		}

		const value = parseFloat(text);
		elem.text(value.toLocaleString(undefined, {
			minimumFractionDigits: 0,
			maximumFractionDigits: Grocy.UserSettings.stock_decimal_places_amounts
		}));
	});
	$(rootSelector + ' .locale-number.locale-number-generic').each(function () 
	{
		const elem = $(this);
		const text = elem.text();

		if (isNaN(text) || text.isEmpty()) 
		{
			return;
		}

		const value = parseFloat(text);
		elem.text(value.toLocaleString(undefined, {
			minimumFractionDigits: 0,
			maximumFractionDigits: 2
		}));
	});
}

function RefreshLocaleNumberInput(rootSelector = '#page-content') 
{
	$(rootSelector + ' .locale-number-input.locale-number-currency').each(function () 
	{
		const value = $(this).val();

		if (isNaN(value) || value.toString().isEmpty()) 
		{
			return;
		}

		$(this).val(parseFloat(value).toLocaleString('en', {
			minimumFractionDigits: Grocy.UserSettings.stock_decimal_places_prices,
			maximumFractionDigits: Grocy.UserSettings.stock_decimal_places_prices,
			useGrouping: false
		}));
	});
	$(rootSelector + ' .locale-number-input.locale-number-quantity-amount').each(function () 
	{
		const value = $(this).val();

		if (isNaN(value) || value.toString().isEmpty()) 
		{
			return;
		}

		$(this).val(parseFloat(value).toLocaleString('en', {
			minimumFractionDigits: 0,
			maximumFractionDigits: Grocy.UserSettings.stock_decimal_places_amounts,
			useGrouping: false
		}));
	});
	$(rootSelector + ' .locale-number-input.locale-number-generic').each(function () 
	{
		const value = $(this).val();

		if (isNaN(value) || value.toString().isEmpty()) 
		{
			return;
		}

		$(this).val(value.toLocaleString('en', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
			useGrouping: false
		}));
	});
}

export { RefreshLocaleNumberDisplay, RefreshLocaleNumberInput };