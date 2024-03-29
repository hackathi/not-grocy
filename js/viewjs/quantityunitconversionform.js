import { __t, __n, U } from '../lib/legacy'; //import { $ } from 'jquery';

import { WindowMessageBag } from '../helpers/messagebag';

function quantityunitconversionformView(Grocy, scope = null) 
{
	let $scope = $;

	if (scope != null) 
	{
		$scope = selector => $(scope).find(selector);
	}

	Grocy.Use('numberpicker');
	const userfields = Grocy.Use('userfieldsform');
	$scope('#save-quconversion-button').on('click', function (e) 
	{
		e.preventDefault();

		if ($scope('.combobox-menu-visible').length) 
		{
			return;
		}

		const jsonData = $scope('#quconversion-form').serializeJSON();
		jsonData.from_qu_id = $scope('#from_qu_id').val();
		Grocy.FrontendHelpers.BeginUiBusy('quconversion-form');

		if ($scope('#create_inverse').is(':checked')) 
		{
			var inverse_to_qu_id = $scope('#from_qu_id').val();
			var inverse_from_qu_id = $scope('#to_qu_id').val();
		}

		if (Grocy.EditMode === 'create') 
		{
			Grocy.Api.Post('objects/quantity_unit_conversions', jsonData, function (result) 
			{
				Grocy.EditObjectId = result.created_object_id;
				userfields.Save(function () 
				{
					if ($scope('#create_inverse').is(':checked')) 
					{
						jsonData.to_qu_id = inverse_to_qu_id;
						jsonData.from_qu_id = inverse_from_qu_id;
						jsonData.factor = 1 / jsonData.factor; // Create Inverse

						Grocy.Api.Post('objects/quantity_unit_conversions', jsonData, function (result) 
						{
							Grocy.EditObjectId = result.created_object_id;
							userfields.Save(function () 
							{
								if (typeof Grocy.GetUriParam('qu-unit') !== 'undefined') 
								{
									if (Grocy.GetUriParam('embedded') !== undefined) 
									{
										window.parent.postMessage(WindowMessageBag('Reload'), Grocy.BaseUrl);
									}
									else 
									{
										window.location.href = U('/quantityunit/' + Grocy.GetUriParam('qu-unit'));
									}
								}
								else 
								{
									window.parent.postMessage(WindowMessageBag('ProductQUConversionChanged'), U('/product/' + Grocy.GetUriParam('product')));
									window.parent.postMessage(WindowMessageBag('CloseAllModals'), U('/product/' + Grocy.GetUriParam('product')));
								}
							});
						}, function (xhr) 
						{
							Grocy.FrontendHelpers.EndUiBusy('quconversion-form');
							Grocy.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
						});
					}
					else 
					{
						if (typeof Grocy.GetUriParam('qu-unit') !== 'undefined') 
						{
							if (Grocy.GetUriParam('embedded') !== undefined) 
							{
								window.parent.postMessage(WindowMessageBag('Reload'), Grocy.BaseUrl);
							}
							else 
							{
								window.location.href = U('/quantityunit/' + Grocy.GetUriParam('qu-unit'));
							}
						}
						else 
						{
							window.parent.postMessage(WindowMessageBag('ProductQUConversionChanged'), U('/product/' + Grocy.GetUriParam('product')));
							window.parent.postMessage(WindowMessageBag('CloseAllModals'), U('/product/' + Grocy.GetUriParam('product')));
						}
					}
				});
			}, function (xhr) 
			{
				Grocy.FrontendHelpers.EndUiBusy('quconversion-form');
				Grocy.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			});
		}
		else 
		{
			Grocy.Api.Put('objects/quantity_unit_conversions/' + Grocy.EditObjectId, jsonData, function (result) 
			{
				userfields.Save(function () 
				{
					if (typeof Grocy.GetUriParam('qu-unit') !== 'undefined') 
					{
						if (Grocy.GetUriParam('embedded') !== undefined) 
						{
							window.parent.postMessage(WindowMessageBag('Reload'), Grocy.BaseUrl);
						}
						else 
						{
							window.location.href = U('/quantityunit/' + Grocy.GetUriParam('qu-unit'));
						}
					}
					else 
					{
						window.parent.postMessage(WindowMessageBag('ProductQUConversionChanged'), U('/product/' + Grocy.GetUriParam('product')));
						window.parent.postMessage(WindowMessageBag('CloseAllModals'), U('/product/' + Grocy.GetUriParam('product')));
					}
				});
			}, function (xhr) 
			{
				Grocy.FrontendHelpers.EndUiBusy('quconversion-form');
				Grocy.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			});
		}
	});
	$scope('#quconversion-form input').keyup(function (event) 
	{
		$scope('.input-group-qu').trigger('change');
		Grocy.FrontendHelpers.ValidateForm('quconversion-form');
	});
	$scope('#quconversion-form input').keydown(function (event) 
	{
		if (event.keyCode === 13) // Enter
		{
			event.preventDefault();

			if ($scope('#quconversion-form')[0].checkValidity() === false) // There is at least one validation error
			{
				return false;
			}
			else 
			{
				$scope('#save-quconversion-button').click();
			}
		}
	});
	$scope('#create_inverse').on('change', function () 
	{
		const value = $(this).is(':checked');

		if (value) 
		{
			$scope('#qu-conversion-inverse-info').removeClass('d-none');
		}
		else 
		{
			$scope('#qu-conversion-inverse-info').addClass('d-none');
		}
	});
	$scope('.input-group-qu').on('change', function (e) 
	{
		const fromQuId = $scope('#from_qu_id').val();
		const toQuId = $scope('#to_qu_id').val();
		const factor = $scope('#factor').val();

		if (fromQuId == toQuId) 
		{
			$scope('#to_qu_id').parent().find('.invalid-feedback').text(__t('This cannot be equal to %s', $scope('#from_qu_id option:selected').text()));
			$scope('#to_qu_id')[0].setCustomValidity('error');
		}
		else 
		{
			$scope('#to_qu_id')[0].setCustomValidity('');
		}

		if (fromQuId && toQuId) 
		{
			$scope('#qu-conversion-info').text(__t('This means 1 %1$s is the same as %2$s %3$s', $scope('#from_qu_id option:selected').text(), parseFloat(1 * factor).toLocaleString({
				minimumFractionDigits: 0,
				maximumFractionDigits: Grocy.UserSettings.stock_decimal_places_amounts
			}), __n((1 * factor).toLocaleString({
				minimumFractionDigits: 0,
				maximumFractionDigits: Grocy.UserSettings.stock_decimal_places_amounts
			}), $scope('#to_qu_id option:selected').text(), $scope('#to_qu_id option:selected').data('plural-form'))));
			$scope('#qu-conversion-info').removeClass('d-none');

			if (Grocy.EditMode === 'create') 
			{
				$scope('#qu-conversion-inverse-info').text(__t('This means 1 %1$s is the same as %2$s %3$s', $scope('#to_qu_id option:selected').text(), parseFloat(1 / factor).toLocaleString({
					minimumFractionDigits: 0,
					maximumFractionDigits: Grocy.UserSettings.stock_decimal_places_amounts
				}), __n((1 / factor).toString(), $scope('#from_qu_id option:selected').text(), $scope('#from_qu_id option:selected').data('plural-form'))));
				$scope('#qu-conversion-inverse-info').removeClass('d-none');
			}
		}
		else 
		{
			$scope('#qu-conversion-info').addClass('d-none');
			$scope('#qu-conversion-inverse-info').addClass('d-none');
		}

		Grocy.FrontendHelpers.ValidateForm('quconversion-form');
	});
	userfields.Load();
	$scope('.input-group-qu').trigger('change');
	$scope('#from_qu_id').focus();
	Grocy.FrontendHelpers.ValidateForm('quconversion-form');

	if (Grocy.GetUriParam('qu-unit') !== undefined) 
	{
		$scope('#from_qu_id').attr('disabled', '');
	}
}

export { quantityunitconversionformView };