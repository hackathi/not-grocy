import { __t } from '../lib/legacy'; //import { $ } from 'jquery';

function loginView(Grocy, scope = null) 
{
	let $scope = $;

	if (scope != null) 
	{
		$scope = selector => $(scope).find(selector);
	}

	$scope('#username').focus();

	if (Grocy.GetUriParam('invalid') === 'true') 
	{
		$scope('#login-error').text(__t('Invalid credentials, please try again'));
		$scope('#login-error').removeClass('d-none');
	}
}

export { loginView };