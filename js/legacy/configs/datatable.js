//import { $ } from 'jquery';
import { IsJsonString } from '../helpers/extensions';

function setDatatableDefaults(Grocy) 
{
	// Default DataTables initialisation settings
	const collapsedGroups = {};
	$.extend(true, $.fn.dataTable.defaults, {
		paginate: false,
		deferRender: true,
		language: IsJsonString(Grocy.translate('datatables_localization')) ? JSON.parse(Grocy.translate('datatables_localization')) : {},
		scrollY: false,
		scrollX: true,
		colReorder: true,
		stateSave: true,
		stateSaveParams: function (settings, data) 
		{
			data.search.search = '';
			data.columns.forEach(column => 
			{
				column.search.search = '';
			});
		},
		stateSaveCallback: function (settings, data) 
		{
			const settingKey = 'datatables_state_' + settings.sTableId;

			if ($.isEmptyObject(data)) 
			{
				// state.clear was called and unfortunately the table is not refresh, so we are reloading the page
				Grocy.FrontendHelpers.DeleteUserSetting(settingKey, true);
			}
			else 
			{
				const stateData = JSON.stringify(data);
				Grocy.FrontendHelpers.SaveUserSetting(settingKey, stateData);
			}
		},
		stateLoadCallback: function (settings) 
		{
			const settingKey = 'datatables_state_' + settings.sTableId;

			if (Grocy.UserSettings[settingKey] == undefined) 
			{
				return null;
			}
			else 
			{
				return JSON.parse(Grocy.UserSettings[settingKey]);
			}
		},
		preDrawCallback: function (settings) 
		{
			// Currently it is not possible to save the state of rowGroup via saveState events
			const api = new $.fn.dataTable.Api(settings);

			if (typeof api.rowGroup === 'function') 
			{
				const settingKey = 'datatables_rowGroup_' + settings.sTableId;

				if (Grocy.UserSettings[settingKey] !== undefined) 
				{
					const rowGroup = JSON.parse(Grocy.UserSettings[settingKey]); // Check if there way changed. the draw event is called often therefore we have to check if it's really necessary

					if (rowGroup.enable !== api.rowGroup().enabled() || 'dataSrc' in rowGroup && rowGroup.dataSrc !== api.rowGroup().dataSrc()) 
					{
						api.rowGroup().enable(rowGroup.enable);

						if ('dataSrc' in rowGroup) 
						{
							api.rowGroup().dataSrc(rowGroup.dataSrc); // Apply fixed order for group column

							const fixedOrder = {
								pre: [rowGroup.dataSrc, 'asc']
							};
							api.order.fixed(fixedOrder);
						}
					}
				}
			}
		},
		columnDefs: [{
			type: 'chinese-string',
			targets: '_all'
		}],
		rowGroup: {
			enable: false,
			startRender: function (rows, group) 
			{
				const collapsed = !!collapsedGroups[group];
				const toggleClass = collapsed ? 'fa-caret-right' : 'fa-caret-down';
				rows.nodes().each(function (row) 
				{
					row.style.display = collapsed ? 'none' : '';
				});
				return $('<tr/>').append('<td colspan="' + rows.columns()[0].length + '">' + group + ' <span class="fa fa-fw d-print-none ' + toggleClass + '"/></td>').attr('data-name', group).toggleClass('collapsed', collapsed);
			}
		}
	});
	$(document).on('click', 'tr.dtrg-group', function () 
	{
		const name = $(this).data('name');
		collapsedGroups[name] = !collapsedGroups[name];
		$('table').DataTable().draw();
	});
}

export { setDatatableDefaults };