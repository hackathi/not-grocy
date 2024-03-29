//import { $ } from 'jquery';
function usersView(Grocy, scope = null) 
{
	let $scope = $;

	if (scope != null) 
	{
		$scope = selector => $(scope).find(selector);
	}

	const usersTable = $scope('#users-table').DataTable({
		order: [[1, 'asc']],
		columnDefs: [{
			orderable: false,
			targets: 0
		}, {
			searchable: false,
			targets: 0
		}].concat($.fn.dataTable.defaults.columnDefs)
	});
	$scope('#users-table tbody').removeClass('d-none');
	Grocy.FrontendHelpers.InitDataTable(usersTable);
	Grocy.FrontendHelpers.MakeDeleteConfirmBox('Are you sure to delete user "%s"?', '.user-delete-button', 'data-user-username', 'data-user-id', 'users/', '/users');
}

export { usersView };