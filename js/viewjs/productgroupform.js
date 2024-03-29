import { U } from '../lib/legacy'; //import { $ } from 'jquery';

import { WindowMessageBag } from '../helpers/messagebag';

function productgroupformView(Grocy, scope = null) 
{
	let $scope = $;

	if (scope != null) 
	{
		$scope = selector => $(scope).find(selector);
	}

	const userfields = Grocy.Use('userfieldsform');
	$scope('#save-product-group-button').on('click', function (e) 
	{
		e.preventDefault();

		if ($scope('.combobox-menu-visible').length) 
		{
			return;
		}

		const jsonData = $scope('#product-group-form').serializeJSON();
		Grocy.FrontendHelpers.BeginUiBusy('product-group-form');

		if (Grocy.EditMode === 'create') 
		{
			Grocy.Api.Post('objects/product_groups', jsonData, function (result) 
			{
				Grocy.EditObjectId = result.created_object_id;
				userfields.Save(function () 
				{
					window.parent.postMessage(WindowMessageBag('CloseAllModals'), U('/productgroups'));
				});
			}, function (xhr) 
			{
				Grocy.FrontendHelpers.EndUiBusy('product-group-form');
				Grocy.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			});
		}
		else 
		{
			Grocy.Api.Put('objects/product_groups/' + Grocy.EditObjectId, jsonData, function (result) 
			{
				userfields.Save(function () 
				{
					window.parent.postMessage(WindowMessageBag('CloseAllModals'), U('/productgroups'));
				});
			}, function (xhr) 
			{
				Grocy.FrontendHelpers.EndUiBusy('product-group-form');
				Grocy.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			});
		}
	});
	$scope('#product-group-form input').keyup(function (event) 
	{
		Grocy.FrontendHelpers.ValidateForm('product-group-form');
	});
	$scope('#product-group-form input').keydown(function (event) 
	{
		if (event.keyCode === 13) // Enter
		{
			event.preventDefault();

			if ($scope('#product-group-form')[0].checkValidity() === false) // There is at least one validation error
			{
				return false;
			}
			else 
			{
				$scope('#save-product-group-button').click();
			}
		}
	});
	userfields.Load();
	$scope('#name').focus();
	Grocy.FrontendHelpers.ValidateForm('product-group-form');
}

export { productgroupformView };