//import { $ } from 'jquery';
import { DetachedDropdown } from './dropdown';

class GrocyFrontendHelpers 
{
	constructor(Grocy, Api, scope = null) 
	{
		this.Grocy = Grocy;
		this.Api = Api;
		this.scopeSelector = scope;

		if (scope != null) 
		{
			this.scope = $(scope);
			const jScope = this.scope;

			this.$scope = selector => jScope.find(selector);
		}
		else 
		{
			this.$scope = $;
			this.scope = $(document);
		}

		this.dropdowns = {};
		this.dataTables = [];
		this.InitDropdowns();
		this.deferredPutCalls = [];
		const self = this;
		window.addEventListener('load', function () 
		{
			if (self.Grocy.documentReady && self.deferredPutCalls.length == 0) return; // save user settings

			let putcall = self.deferredPutCalls.pop();

			while (putcall !== undefined) 
			{
				self.Api.Put(putcall.uri, putcall.data, function (result) 
				{// Nothing to do...
				}, function (xhr) 
				{
					if (!xhr.statusText.isEmpty()) 
					{
						this.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
					}
				});
				putcall = self.deferredPutCalls.pop();
			}
		});
	}

	_ApplyTemplate(data, template) 
	{
		for (const key in data) 
		{
			// transforms data-product-id to PRODUCT_ID
			const param = key.replace('data-', '').toUpperCase().replaceAll('-', '_');
			template = template.replaceAll(param, data[key]);
		}

		return template.replace('RETURNTO', '?returnto=' + encodeURIComponent(window.location.pathname));
	}

	InitDropdowns() 
	{
		const self = this;
		this.$scope('[data-toggle="dropdown-detached"]').on('click', function (event) 
		{
			event.preventDefault();
			event.stopPropagation();
			const button = this;
			const selector = button.getAttribute('data-target');
			const $dropdown = self.$scope(selector);
			let dropper = self.dropdowns[button.id];

			if (dropper !== undefined) 
			{
				if (dropper.isActive()) 
				{
					dropper.hide();

					if (dropper.target.id == button.id) 
					{
						return;
					}
				}
			}

			const elements = $dropdown.find('*');
			const source_data = {};

			for (let i = button.attributes.length - 1; i >= 0; i--) 
			{
				const attr = button.attributes[i];

				if (attr.name.startsWith('data-')) 
				{
					source_data[attr.name] = attr.value;
				}
			}

			for (const elem of elements) 
			{
				for (let i = elem.attributes.length - 1; i >= 0; i--) 
				{
					// copy over data-* attributes
					const attr = elem.attributes[i];

					if (source_data[attr.name] !== undefined) 
					{
						elem.setAttribute(attr.name, source_data[attr.name]);
					}
				}

				if (elem.hasAttribute('data-href')) 
				{
					elem.setAttribute('href', self._ApplyTemplate(source_data, elem.getAttribute('data-href')));
				}

				if (elem.hasAttribute('data-compute')) 
				{
					const tArgs = JSON.parse(self._ApplyTemplate(source_data, elem.getAttribute('data-compute')));
					elem.innerText = self.Grocy.translate(...tArgs);
				}

				if (elem.hasAttribute('data-disable') && source_data['data-' + elem.getAttribute('data-disable')] !== undefined && source_data['data-' + elem.getAttribute('data-disable')] === '1') 
				{
					elem.classList.add('disabled');
				}
				else 
				{
					elem.classList.remove('disabled');
				}
			}

			if (dropper === undefined) 
			{
				dropper = new DetachedDropdown(button, null, this.scopeSelector);
				self.dropdowns[button.id] = dropper;
			}

			dropper.toggle();
		});
	}

	Delay(callable, delayMilliseconds) 
	{
		let timer = 0;
		return function () 
		{
			const context = this;
			const args = arguments;
			clearTimeout(timer);
			timer = setTimeout(function () 
			{
				callable.apply(context, args);
			}, delayMilliseconds || 0);
		};
	}

	ValidateForm(formId) 
	{
		let form = null;
		let ret = false;

		if (formId instanceof $) 
		{
			form = formId;
		}
		else 
		{
			form = this.$scope('#' + formId);
		}

		if (form.length == 0) 
		{
			return;
		}

		if (form[0].checkValidity() === true) 
		{
			form.find(':submit').removeClass('disabled');
			ret = true;
		}
		else 
		{
			form.find(':submit').addClass('disabled');
		}

		form.addClass('was-validated');
		return ret;
	}

	BeginUiBusy(formId = null) 
	{
		$('body').addClass('cursor-busy');

		if (formId !== null) 
		{
			this.$scope('#' + formId + ' :input').attr('disabled', true);
		}
	}

	EndUiBusy(formId = null) 
	{
		$('body').removeClass('cursor-busy');

		if (formId !== null) 
		{
			this.$scope('#' + formId + ' :input').attr('disabled', false);
		}
	}

	ShowGenericError(message, exception) 
	{
		const self = this;
		toastr.error(this.Grocy.translate(message) + '<br><br>' + this.Grocy.translate('Click to show technical details'), '', {
			onclick: function () 
			{
				bootbox.alert({
					title: self.Grocy.translate('Error details'),
					message: '<pre class="my-0"><code>' + JSON.stringify(exception, null, 4) + '</code></pre>',
					closeButton: false
				});
			}
		});
		console.error(exception);
	}

	SaveUserSetting(settingsKey, value) 
	{
		this.Grocy.UserSettings[settingsKey] = value;
		const jsonData = {};
		jsonData.value = value;
		const api = 'user/settings/' + settingsKey;

		if (!this.Grocy.documentReady) 
		{
			this.deferredPutCalls.push({
				uri: api,
				data: jsonData
			});
			return;
		}

		this.Api.Put(api, jsonData, function (result) 
		{// Nothing to do...
		}, function (xhr) 
		{
			if (!xhr.statusText.isEmpty()) 
			{
				this.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		});
	}

	DeleteUserSetting(settingsKey, reloadPageOnSuccess = false) 
	{
		delete this.Grocy.UserSettings[settingsKey];
		this.Delete('user/settings/' + settingsKey, {}, function (result) 
		{
			if (reloadPageOnSuccess) 
			{
				window.location.reload();
			}
		}, function (xhr) 
		{
			if (!xhr.statusText.isEmpty()) 
			{
				this.ShowGenericError('Error while deleting, please retry', xhr.response);
			}
		});
	}

	RunWebhook(webhook, data, repetitions = 1) 
	{
		Object.assign(data, webhook.extra_data);
		let hasAlreadyFailed = false;

		for (let i = 0; i < repetitions; i++) 
		{
			$.post(webhook.hook, data).fail(function (req, status, errorThrown) 
			{
				if (!hasAlreadyFailed) 
				{
					hasAlreadyFailed = true;
					this.ShowGenericError(this.Grocy.translate('Error while executing WebHook', {
						status: status,
						errorThrown: errorThrown
					}));
				}
			});
		}
	}

	InitDataTable(dataTable, searchFunction = null, clearFunction = null) 
	{
		this.dataTables.push(dataTable);
		dataTable.columns.adjust().draw();
		const self = this;

		const defaultSearchFunction = function () 
		{
			let value = $(this).val();

			if (value === 'all') 
			{
				value = '';
			}

			dataTable.search(value).draw();
		};

		const defaultClearFunction = function () 
		{
			self.$scope('#search').val('');
			dataTable.search('').draw();
		};

		self.$scope('#search').on('keyup', self.Delay(searchFunction || defaultSearchFunction, 200));
		self.$scope('#clear-filter-button').on('click', clearFunction || defaultClearFunction);
	} // This method is called if this FrontendHelper is scoped to a modal
	// and the modal is acutally shown.


	OnShown() 
	{
		for (const table of this.dataTables) 
		{
			table.columns.adjust();
		}
	}

	MakeFilterForColumn(selector, column, table, filterFunction = null, transferCss = false, valueMod = null) 
	{
		const self = this;
		this.$scope(selector).on('change', filterFunction || function () 
		{
			let value = $(this).val();
			let text = self.$scope(selector + ' option:selected').text();

			if (value === 'all') 
			{
				text = '';
			}
			else 
			{
				value = valueMod != null ? valueMod(value) : value;
			}

			if (transferCss) 
			{
				// Transfer CSS classes of selected element to dropdown element (for background)
				$(this).attr('class', self.$scope('#' + $(this).attr('id') + " option[value='" + value + "']").attr('class') + ' form-control');
			}

			table.column(column).search(text).draw();
		});
		self.$scope('#clear-filter-button').on('click', () => 
		{
			self.$scope(selector).val('');
			table.column(column).search('').draw();
		});
	}

	MakeStatusFilter(dataTable, column) 
	{
		return this.MakeValueFilter('status', column, dataTable);
	}

	MakeValueFilter(key, column, dataTable, resetValue = 'all') 
	{
		const self = this;
		this.$scope('#' + key + '-filter').on('change', function () 
		{
			let value = $(this).val();

			if (value === 'all') 
			{
				value = '';
			} // Transfer CSS classes of selected element to dropdown element (for background)


			$(this).attr('class', self.$scope('#' + $(this).attr('id') + " option[value='" + value + "']").attr('class') + ' form-control');
			dataTable.column(column).search(value).draw();
		});
		this.$scope('.' + key + '-filter-message').on('click', function () 
		{
			const value = $(this).data(key + '-filter');
			self.$scope('#' + key + '-filter').val(value);
			self.$scope('#' + key + '-filter').trigger('change');
		});
		this.$scope('#clear-filter-button').on('click', function () 
		{
			self.$scope('#' + key + '-filter').val(resetValue);
			self.$scope('#' + key + '-filter').trigger('change');
		});
	}

	MakeYesNoBox(message, selector, cb) 
	{
		const self = this;
		this.scope.on('click', selector, function (e) 
		{
			const target = e.currentTarget;
			message = message instanceof Function ? message(target) : message;
			bootbox.confirm({
				message: message,
				closeButton: false,
				buttons: {
					confirm: {
						label: self.Grocy.translate('Yes'),
						className: 'btn-success'
					},
					cancel: {
						label: self.Grocy.translate('No'),
						className: 'btn-danger'
					}
				},
				callback: result => cb(result, target)
			});
		});
	}

	MakeDeleteConfirmBox(message, selector, attrName, attrId, apiEndpoint, redirectUrl) 
	{
		if (!apiEndpoint.endsWith('/')) 
		{
			apiEndpoint += '/';
		}

		if (redirectUrl instanceof String && !redirectUrl.startsWith('/')) 
		{
			redirectUrl = '/' + redirectUrl;
		}

		const self = this;
		this.scope.on('click', selector, function (e) 
		{
			const target = $(e.currentTarget);
			const objectName = attrName instanceof Function ? attrName(target) : target.attr(attrName);
			const objectId = attrId instanceof Function ? attrId(target) : target.attr(attrId);
			message = message instanceof Function ? message(objectId, objectName) : self.Grocy.translate(message, objectName);
			bootbox.confirm({
				message: message,
				closeButton: false,
				buttons: {
					confirm: {
						label: self.Grocy.translate('Yes'),
						className: 'btn-success'
					},
					cancel: {
						label: self.Grocy.translate('No'),
						className: 'btn-danger'
					}
				},
				callback: function (result) 
				{
					if (result === true) 
					{
						self.Api.Delete(apiEndpoint + objectId, {}, function (result) 
						{
							if (redirectUrl instanceof Function) 
							{
								redirectUrl(result, objectId, objectName);
							}
							else 
							{
								window.location.href = self.Grocy.FormatUrl(redirectUrl);
							}
						}, function (xhr) 
						{
							console.error(xhr);
						});
					}
				}
			});
		});
	}

	ScanModeSubmit(singleUnit = true) 
	{
		if (singleUnit) 
		{
			this.$scope('#display_amount').val(1);
			this.$scope('.input-group-productamountpicker').trigger('change');
		}

		const form = this.$scope('form[data-scanmode="enabled"]');

		if (form.length == 0) 
		{
			console.warn('ScanModeSubmit was triggered but no form[data-scanmode="enabled"] was found in scope ' + this.scopeSelector);
			return;
		}

		if (this.ValidateForm(form) === true) 
		{
			form.find('button[data-scanmode="submit"]').click();
		}
		else 
		{
			toastr.warning(this.translate('Scan mode is on but not all required fields could be populated automatically'));
			this.UISound.Error();
		}
	}

}

export { GrocyFrontendHelpers };