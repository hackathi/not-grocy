import { U } from '../lib/legacy'; //import { $ } from 'jquery';

function batteriesView(Grocy, scope = null) 
{
	let $scope = $;

	if (scope != null) 
	{
		$scope = selector => $(scope).find(selector);
	} // preload some views.


	Grocy.PreloadView('batteryform');
	const batteriesTable = $scope('#batteries-table').DataTable({
		order: [[1, 'asc']],
		columnDefs: [{
			orderable: false,
			targets: 0
		}, {
			searchable: false,
			targets: 0
		}, {
			type: 'num',
			targets: 4
		}].concat($.fn.dataTable.defaults.columnDefs)
	});
	$scope('#batteries-table tbody').removeClass('d-none');
	Grocy.FrontendHelpers.InitDataTable(batteriesTable, null, function () 
	{
		$scope('#search').val('');
		batteriesTable.search('').draw();
		$scope('#show-disabled').prop('checked', false);
	});
	Grocy.FrontendHelpers.MakeDeleteConfirmBox('Are you sure to delete battery "%s"?', '.battery-delete-button', 'data-battery-name', 'data-battery-id', 'objects/batteries/', '/batteries');
	$scope('#show-disabled').change(function () 
	{
		if (this.checked) 
		{
			window.location.href = U('/batteries?include_disabled');
		}
		else 
		{
			window.location.href = U('/batteries');
		}
	});

	if (Grocy.GetUriParam('include_disabled')) 
	{
		$scope('#show-disabled').prop('checked', true);
	}
}

export { batteriesView };