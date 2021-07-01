import { RefreshLocaleNumberInput } from '../helpers/numberdisplay'; //import { $ } from 'jquery';

import { BoolVal } from '../helpers/extensions';

function shoppinglistsettingsView(Grocy, scope = null) 
{
	let $scope = $;

	if (scope != null) 
	{
		$scope = selector => $(scope).find(selector);
	}

	if (BoolVal(Grocy.UserSettings.shopping_list_to_stock_workflow_auto_submit_when_prefilled)) 
	{
		$scope('#shopping-list-to-stock-workflow-auto-submit-when-prefilled').prop('checked', true);
	}

	if (BoolVal(Grocy.UserSettings.shopping_list_show_calendar)) 
	{
		$scope('#shopping-list-show-calendar').prop('checked', true);
	}

	RefreshLocaleNumberInput();
}

export { shoppinglistsettingsView };