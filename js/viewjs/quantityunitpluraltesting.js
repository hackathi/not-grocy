import { animateCSS } from '../helpers/extensions';
import { __n } from '../lib/legacy'; //import { $ } from 'jquery';

function quantityunitpluraltestingView(Grocy, scope = null) 
{
	let $scope = $;

	if (scope != null) 
	{
		$scope = selector => $(scope).find(selector);
	}

	Grocy.Use('numberpicker');
	$scope('#qu_id').change(function (event) 
	{
		RefreshQuPluralTestingResult();
	});
	$scope('#amount').keyup(function (event) 
	{
		RefreshQuPluralTestingResult();
	});
	$scope('#amount').change(function (event) 
	{
		RefreshQuPluralTestingResult();
	});

	function RefreshQuPluralTestingResult() 
	{
		const singularForm = $scope('#qu_id option:selected').data('singular-form');
		const pluralForm = $scope('#qu_id option:selected').data('plural-form');
		const amount = $scope('#amount').val();

		if (singularForm.toString().isEmpty() || amount.toString().isEmpty()) 
		{
			return;
		}

		animateCSS('h2', 'shake');
		$scope('#result').text(__n(amount, singularForm, pluralForm));
	}

	if (Grocy.GetUriParam('qu') !== undefined) 
	{
		$scope('#qu_id').val(Grocy.GetUriParam('qu'));
		$scope('#qu_id').trigger('change');
	}

	$scope('#amount').focus();
}

export { quantityunitpluraltestingView };