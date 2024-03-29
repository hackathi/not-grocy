//import { $ } from 'jquery';
import { ResizeResponsiveEmbeds } from '../helpers/embeds';
import { IsTouchInputDevice } from '../helpers/input';
import { BoolVal, GetFileNameFromPath } from '../helpers/extensions'; // This function sets some global state and adds some global event listeners.

function setInitialGlobalState(Grocy) 
{
	// __t isn't set in global context yet, make one locally.
	const __t = function (key, ...placeholder) 
	{
		return Grocy.translate(key, ...placeholder);
	};

	if (!Grocy.ActiveNav.isEmpty()) 
	{
		const menuItem = $('#sidebarResponsive').find("[data-nav-for-page='" + Grocy.ActiveNav + "']");
		menuItem.addClass('active-page');

		if (menuItem.length) 
		{
			const parentMenuSelector = menuItem.data('sub-menu-of');

			if (typeof parentMenuSelector !== 'undefined') 
			{
				const pMenu = $(parentMenuSelector);
				pMenu.collapse('show');
				pMenu.prev('.nav-link-collapse').addClass('active-page');
				pMenu.on('shown.bs.collapse', function () 
				{
					if (!menuItem.isVisibleInViewport(75)) 
					{
						menuItem[0].scrollIntoView();
					}
				});
			}
			else 
			{
				if (!menuItem.isVisibleInViewport(75)) 
				{
					menuItem[0].scrollIntoView();
				}
			}
		}
	}

	const observer = new MutationObserver(function (mutations) 
	{
		mutations.forEach(function (mutation) 
		{
			if (mutation.attributeName === 'class') 
			{
				const attributeValue = $(mutation.target).prop(mutation.attributeName);

				if (attributeValue.contains('sidenav-toggled')) 
				{
					window.localStorage.setItem('sidebar_state', 'collapsed');
				}
				else 
				{
					window.localStorage.setItem('sidebar_state', 'expanded');
				}
			}
		});
	});
	observer.observe(document.body, {
		attributes: true
	});

	if (window.localStorage.getItem('sidebar_state') === 'collapsed') 
	{
		$('#sidenavToggler').click();
	}

	window.toastr.options = {
		toastClass: 'alert',
		closeButton: true,
		timeOut: 20000,
		extendedTimeOut: 5000
	};
	window.FontAwesomeConfig = {
		searchPseudoElements: true
	};
	$(window).on('resize', function () 
	{
		ResizeResponsiveEmbeds($('body').hasClass('fullscreen-card'));
	});
	$('iframe').on('load', function () 
	{
		ResizeResponsiveEmbeds($('body').hasClass('fullscreen-card'));
	}); // Don't show tooltips on touch input devices

	if (IsTouchInputDevice()) 
	{
		const css = document.createElement('style');
		css.innerHTML = '.tooltip { display: none; }';
		document.body.appendChild(css);
	}

	$(document).on('keyup paste change', 'input, textarea', function () 
	{
		$(this).closest('form').addClass('is-dirty');
	});
	$(document).on('click', 'select', function () 
	{
		$(this).closest('form').addClass('is-dirty');
	}); // Auto saving user setting controls

	$(document).on('change', '.user-setting-control', function () 
	{
		const element = $(this);
		const settingKey = element.attr('data-setting-key');

		if (!element[0].checkValidity()) 
		{
			return;
		}

		let inputType = 'unknown';

		if (typeof element.attr('type') !== typeof undefined && element.attr('type') !== false) 
		{
			inputType = element.attr('type').toLowerCase();
		}

		if (inputType === 'checkbox') 
		{
			value = element.is(':checked');
		}
		else 
		{
			var value = element.val();
		}

		Grocy.FrontendHelpers.SaveUserSetting(settingKey, value);
	}); // Show file name Bootstrap custom file input

	$('input.custom-file-input').on('change', function () 
	{
		$(this).next('.custom-file-label').html(GetFileNameFromPath($(this).val()));
	}); // Translation of "Browse"-button of Bootstrap custom file input

	if ($('.custom-file-label').length > 0) 
	{
		$('<style>').html('.custom-file-label::after { content: "' + __t('Select file') + '"; }').appendTo('head');
	} // Add border around anchor link section


	if (window.location.hash) 
	{
		$(window.location.hash).addClass('p-2 border border-info rounded');
	}

	$('#about-dialog-link').on('click', function () 
	{
		bootbox.alert({
			message: '<iframe height="400px" class="embed-responsive" src="' + Grocy.FormatUrl('/about?embedded') + '"></iframe>',
			closeButton: false,
			size: 'large'
		});
	});
	$(document).on('click', '.easy-link-copy-textbox', function () 
	{
		$(this).select();
	});
	$('textarea.wysiwyg-editor').summernote({
		minHeight: '300px',
		lang: __t('summernote_locale')
	});
	$(window).on('message', function (e) 
	{
		const data = e.originalEvent.data;

		if (data.Message === 'ShowSuccessMessage') 
		{
			toastr.success(data.Payload);
		}
		else if (data.Message === 'CloseAllModals') 
		{
			bootbox.hideAll();
		}
	});
	$(document).on('click', '.show-as-dialog-link', function (e) 
	{
		e.preventDefault();
		const link = $(e.currentTarget).attr('href');
		Grocy.OpenSubView(link);
	}); // serializeJSON defaults

	$.serializeJSON.defaultOptions.checkboxUncheckedValue = '0';
	$('a.link-return').not('.btn').each(function () 
	{
		const base = $(this).data('href');

		if (base.contains('?')) 
		{
			$(this).attr('href', base + '&returnto' + encodeURIComponent(window.location.pathname));
		}
		else 
		{
			$(this).attr('href', base + '?returnto=' + encodeURIComponent(window.location.pathname));
		}
	});
	$(document).on('click', 'a.btn.link-return', function (e) 
	{
		e.preventDefault();
		const link = Grocy.GetUriParam('returnto');

		if (!link || !link.length > 0) 
		{
			window.location.href = $(e.currentTarget).attr('href');
		}
		else 
		{
			window.location.href = Grocy.FormatUrl(link);
		}
	});
	$('.dropdown-item').has('.form-check input[type=checkbox]').on('click', function (e) 
	{
		if ($(e.target).is('div.form-check') || $(e.target).is('div.dropdown-item')) 
		{
			$(e.target).find('input[type=checkbox]').click();
		}
	});
	$(window).on('message', function (e) 
	{
		const data = e.originalEvent.data;

		if (data.Message === 'Reload') 
		{
			window.location.reload();
		}
	});
	$('.change-table-columns-visibility-button').on('click', function (e) 
	{
		e.preventDefault();
		const dataTableSelector = $(e.currentTarget).attr('data-table-selector');
		const dataTable = $(dataTableSelector).DataTable();
		let columnCheckBoxesHtml = '';
		let rowGroupRadioBoxesHtml = '';
		const rowGroupDefined = typeof dataTable.rowGroup === 'function';

		if (rowGroupDefined) 
		{
			const rowGroupChecked = dataTable.rowGroup().enabled() ? '' : 'checked';
			rowGroupRadioBoxesHtml = ' \
			<div class="custom-control custom-radio custom-control-inline"> \
				<input ' + rowGroupChecked + ' class="custom-control-input change-table-columns-rowgroup-toggle" \
					type="radio" \
					name="column-rowgroup" \
					id="column-rowgroup-none" \
					data-table-selector="' + dataTableSelector + '" \
					data-column-index="-1" \
				> \
				<label class="custom-control-label font-italic" \
					for="column-rowgroup-none">' + __t('None') + ' \
				</label > \
			</div>';
		}

		dataTable.columns().every(function () 
		{
			const index = this.index();
			const title = $(this.header()).text();
			const visible = this.visible();

			if (title.isEmpty() || title.startsWith('Hidden')) 
			{
				return;
			}

			let checked = 'checked';

			if (!visible) 
			{
				checked = '';
			}

			columnCheckBoxesHtml += ' \
			<div class="custom-control custom-checkbox"> \
				<input ' + checked + ' class="form-check-input custom-control-input change-table-columns-visibility-toggle" \
					type="checkbox" \
					id="column-' + index.toString() + '" \
					data-table-selector="' + dataTableSelector + '" \
					data-column-index="' + index.toString() + '" \
					value="1"> \
				<label class="form-check-label custom-control-label" \
					for="column-' + index.toString() + '">' + title + ' \
				</label> \
			</div>';

			if (rowGroupDefined) 
			{
				let rowGroupChecked = '';

				if (dataTable.rowGroup().enabled() && dataTable.rowGroup().dataSrc() == index) 
				{
					rowGroupChecked = 'checked';
				}

				rowGroupRadioBoxesHtml += ' \
			<div class="custom-control custom-radio"> \
				<input ' + rowGroupChecked + ' class="custom-control-input change-table-columns-rowgroup-toggle" \
					type="radio" \
					name="column-rowgroup" \
					id="column-rowgroup-' + index.toString() + '" \
					data-table-selector="' + dataTableSelector + '" \
					data-column-index="' + index.toString() + '" \
				> \
				<label class="custom-control-label" \
					for="column-rowgroup-' + index.toString() + '">' + title + ' \
				</label > \
			</div>';
			}
		});
		let message = '<div class="text-center"><h5>' + __t('Table options') + '</h5><hr><h5 class="mb-0">' + __t('Hide/view columns') + '</h5><div class="text-left form-group">' + columnCheckBoxesHtml + '</div></div>';

		if (rowGroupDefined) 
		{
			message += '<div class="text-center mt-1"><h5 class="pt-3 mb-0">' + __t('Group by') + '</h5><div class="text-left form-group">' + rowGroupRadioBoxesHtml + '</div></div>';
		}

		bootbox.dialog({
			message: message,
			size: 'small',
			backdrop: true,
			closeButton: false,
			buttons: {
				reset: {
					label: __t('Reset'),
					className: 'btn-outline-danger float-left responsive-button',
					callback: function () 
					{
						bootbox.confirm({
							message: __t('Are you sure to reset the table options?'),
							buttons: {
								cancel: {
									label: 'No',
									className: 'btn-danger'
								},
								confirm: {
									label: 'Yes',
									className: 'btn-success'
								}
							},
							callback: function (result) 
							{
								if (result) 
								{
									const dataTable = $(dataTableSelector).DataTable();
									const tableId = dataTable.settings()[0].sTableId; // Delete rowgroup settings

									Grocy.FrontendHelpers.DeleteUserSetting('datatables_rowGroup_' + tableId); // Delete state settings

									dataTable.state.clear();
								}

								bootbox.hideAll();
							}
						});
					}
				},
				ok: {
					label: __t('OK'),
					className: 'btn-primary responsive-button',
					callback: function () 
					{
						bootbox.hideAll();
					}
				}
			}
		});
	});
	$(document).on('click', '.change-table-columns-visibility-toggle', function () 
	{
		const dataTableSelector = $(this).attr('data-table-selector');
		const columnIndex = $(this).attr('data-column-index');
		const dataTable = $(dataTableSelector).DataTable();
		dataTable.columns(columnIndex).visible(this.checked);
	});
	$(document).on('click', '.change-table-columns-rowgroup-toggle', function () 
	{
		const dataTableSelector = $(this).attr('data-table-selector');
		const columnIndex = $(this).attr('data-column-index');
		const dataTable = $(dataTableSelector).DataTable();
		let rowGroup;

		if (columnIndex == -1) 
		{
			rowGroup = {
				enable: false
			};
			dataTable.rowGroup().enable(false); // Remove fixed order

			dataTable.order.fixed({});
		}
		else 
		{
			rowGroup = {
				enable: true,
				dataSrc: columnIndex
			};
			dataTable.rowGroup().enable(true);
			dataTable.rowGroup().dataSrc(columnIndex); // Apply fixed order for group column

			const fixedOrder = {
				pre: [columnIndex, 'asc']
			};
			dataTable.order.fixed(fixedOrder);
		}

		const settingKey = 'datatables_rowGroup_' + dataTable.settings()[0].sTableId;
		Grocy.FrontendHelpers.SaveUserSetting(settingKey, JSON.stringify(rowGroup));
		dataTable.draw();
	});
	$(document).on('change', '#show-clock-in-header', function () 
	{
		Grocy.HeaderClock.CheckHeaderClockEnabled();
	});

	if (Grocy.UserId !== -1 && BoolVal(Grocy.UserSettings.auto_reload_on_db_change)) 
	{
		$('#auto-reload-enabled').prop('checked', true);
	}
}

export { setInitialGlobalState };