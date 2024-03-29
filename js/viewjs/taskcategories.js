//import { $ } from 'jquery';
function taskcategoriesView(Grocy, scope = null) 
{
	let $scope = $;

	if (scope != null) 
	{
		$scope = selector => $(scope).find(selector);
	} // preload some views.


	Grocy.PreloadView('taskcategoryform');
	const categoriesTable = $scope('#taskcategories-table').DataTable({
		order: [[1, 'asc']],
		columnDefs: [{
			orderable: false,
			targets: 0
		}, {
			searchable: false,
			targets: 0
		}].concat($.fn.dataTable.defaults.columnDefs)
	});
	$scope('#taskcategories-table tbody').removeClass('d-none');
	Grocy.FrontendHelpers.InitDataTable(categoriesTable);
	Grocy.FrontendHelpers.MakeDeleteConfirmBox('Are you sure to delete task category "%s"?', '.task-category-delete-button', 'data-category-name', 'data-category-id', 'objects/task_categories/', '/taskcategories');
}

export { taskcategoriesView };