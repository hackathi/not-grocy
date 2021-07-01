//import { $ } from 'jquery';
function quantityunitsView(Grocy, scope = null) 
{
	let $scope = $;

	if (scope != null) 
	{
		$scope = selector => $(scope).find(selector);
	}

	const quantityUnitsTable = $scope('#quantityunits-table').DataTable({
		order: [[1, 'asc']],
		columnDefs: [{
			orderable: false,
			targets: 0
		}, {
			searchable: false,
			targets: 0
		}].concat($.fn.dataTable.defaults.columnDefs)
	});
	$scope('#quantityunits-table tbody').removeClass('d-none');
	Grocy.FrontendHelpers.InitDataTable(quantityUnitsTable);
	Grocy.FrontendHelpers.MakeDeleteConfirmBox('Are you sure to delete quantity unit "%s"?', '.quantityunit-delete-button', 'data-quantityunit-name', 'data-quantityunit-id', 'objects/quantity_units/', '/quantityunits');
}

export { quantityunitsView };