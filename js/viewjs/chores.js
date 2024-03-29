import { U } from '../lib/legacy'; //import { $ } from 'jquery';

function choresView(Grocy, scope = null) 
{
	let $scope = $;

	if (scope != null) 
	{
		$scope = selector => $(scope).find(selector);
	}

	const choresTable = $scope('#chores-table').DataTable({
		order: [[1, 'asc']],
		columnDefs: [{
			orderable: false,
			targets: 0
		}, {
			searchable: false,
			targets: 0
		}].concat($.fn.dataTable.defaults.columnDefs)
	});
	$scope('#chores-table tbody').removeClass('d-none');
	Grocy.FrontendHelpers.InitDataTable(choresTable, null, function () 
	{
		$scope('#search').val('');
		choresTable.search('').draw();
		$scope('#show-disabled').prop('checked', false);
	});
	Grocy.FrontendHelpers.MakeDeleteConfirmBox('Are you sure to delete chore "%s"?', '.core-delete-button', 'data-chore-name', 'data-chore-id', 'objects/chores/', '/chroes');
	$('#show-disabled').change(function () 
	{
		if (this.checked) 
		{
			window.location.href = U('/chores?include_disabled');
		}
		else 
		{
			window.location.href = U('/chores');
		}
	});

	if (Grocy.GetUriParam('include_disabled')) 
	{
		$scope('#show-disabled').prop('checked', true);
	}
}

export { choresView };