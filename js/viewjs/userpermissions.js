import { __t } from '../lib/legacy'; //import { $ } from 'jquery';

function userpermissionsView(Grocy, scope = null) 
{
	let $scope = $;

	if (scope != null) 
	{
		$scope = selector => $(scope).find(selector);
	}

	$scope('input.permission-cb').click(function () 
	{
		check_hierachy(this.checked, this.name);
	});

	function check_hierachy(checked, name) 
	{
		const disabled = checked;
		$scope('#permission-sub-' + name).find('input.permission-cb').prop('checked', disabled).attr('disabled', disabled);
	}

	$scope('#permission-save').click(function () 
	{
		const permission_list = $scope('input.permission-cb').filter(function () 
		{
			return $(this).prop('checked') && !$(this).attr('disabled');
		}).map(function () 
		{
			return $(this).data('perm-id');
		}).toArray();
		Grocy.Api.Put('users/' + Grocy.EditObjectId + '/permissions', {
			permissions: permission_list
		}, function (result) 
		{
			toastr.success(__t('Permissions saved'));
		}, function (xhr) 
		{
			toastr.error(JSON.parse(xhr.response).error_message);
		});
	});

	if (Grocy.EditObjectId == Grocy.UserId) 
	{
		$scope('input.permission-cb[name=ADMIN]').click(function () 
		{
			const element = this;

			if (!element.checked) 
			{
				bootbox.confirm({
					message: __t('Are you sure you want to remove full permissions for yourself?'),
					closeButton: false,
					buttons: {
						confirm: {
							label: __t('Yes'),
							className: 'btn-success'
						},
						cancel: {
							label: __t('No'),
							className: 'btn-danger'
						}
					},
					callback: function (result) 
					{
						if (result == false) 
						{
							element.checked = true;
							check_hierachy(element.checked, element.name);
						}
					}
				});
			}
		});
	}
}

export { userpermissionsView };