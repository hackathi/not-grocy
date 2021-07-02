//import { $ } from 'jquery';
import { RefreshLocaleNumberInput } from '../helpers/numberdisplay';

function usersettingsView(Grocy, scope = null) 
{
	let $scope = $;

	if (scope != null) 
	{
		$scope = selector => $(scope).find(selector);
	}

	$scope('#locale').val(Grocy.UserSettings.locale);
	RefreshLocaleNumberInput();
}

export { usersettingsView };