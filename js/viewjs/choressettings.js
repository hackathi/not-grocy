import { RefreshLocaleNumberInput } from '../helpers/numberdisplay'; //import { $ } from 'jquery';

function choressettingsView(Grocy, scope = null) 
{
	let $scope = $;

	if (scope != null) 
	{
		$scope = selector => $(scope).find(selector);
	}

	Grocy.Use('numberpicker');
	$scope('#chores_due_soon_days').val(Grocy.UserSettings.chores_due_soon_days);
	RefreshLocaleNumberInput();
}

export { choressettingsView };