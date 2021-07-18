import { RefreshLocaleNumberInput } from '../helpers/numberdisplay'; //import { $ } from 'jquery';

function taskssettingsView(Grocy, scope = null) 
{
	let $scope = $;

	if (scope != null) 
	{
		$scope = selector => $(scope).find(selector);
	}

	Grocy.Use('numberpicker');
	$scope('#tasks_due_soon_days').val(Grocy.UserSettings.tasks_due_soon_days);
	RefreshLocaleNumberInput();
}

export { taskssettingsView };