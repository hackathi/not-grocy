import { RefreshLocaleNumberInput } from '../helpers/numberdisplay'; //import { $ } from 'jquery';

import { BoolVal } from '../helpers/extensions';

function recipessettingsView(Grocy, scope = null) 
{
	let $scope = $;

	if (scope != null) 
	{
		$scope = selector => $(scope).find(selector);
	}

	if (BoolVal(Grocy.UserSettings.recipe_ingredients_group_by_product_group)) 
	{
		$scope('#recipe_ingredients_group_by_product_group').prop('checked', true);
	}

	RefreshLocaleNumberInput();
}

export { recipessettingsView };