﻿var groupsTable = $('#productgroups-table').DataTable({
	'order': [[1, 'asc']],
	'columnDefs': [
		{ 'orderable': false, 'targets': 0 },
		{ 'searchable': false, "targets": 0 }
	].concat($.fn.dataTable.defaults.columnDefs)
});
$('#productgroups-table tbody').removeClass("d-none");
Grocy.FrontendHelpers.InitDataTable(groupsTable);
Grocy.FrontendHelpers.MakeDeleteConfirmBox(
	'Are you sure to delete product group "%s"?',
	'.product-group-delete-button',
	'data-group-name',
	'data-group-id',
	'objects/product_groups/',
	'/productgroups'
);

$(window).on("message", function(e)
{
	var data = e.originalEvent.data;

	if (data.Message === "CloseAllModals")
	{
		window.location.reload();
	}
});
