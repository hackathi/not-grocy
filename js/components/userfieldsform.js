//import { $ } from 'jquery';
import { RandomString } from '../helpers/extensions';
import { LoadImagesLazy } from '../configs/lazy';
import * as uuid from 'uuid';
import { datetimepicker } from './datetimepicker';

class userfieldsform 
{
	constructor(Grocy, scopeSelector = null) 
	{
		this.Grocy = Grocy;
		this.scopeSelector = scopeSelector;
		this.scope = scopeSelector != null ? $(scopeSelector) : $(document);
		const jScope = this.scope;
		this.$ = scopeSelector != null ? selector => jScope.find(selector) : $;
		this.$('.userfield-link').keyup(); // We need to further scope some of the embedded components.
		// Store those instances here.

		this.components = [];
	}

	Save(success, error) 
	{
		if (!this.$('#userfields-form').length) 
		{
			if (success) 
			{
				success();
			}

			return;
		}

		const jsonData = {};
		const self = this;
		this.$('#userfields-form .userfield-input').not('div').each(function () 
		{
			const input = $(this);
			const fieldName = input.attr('data-userfield-name');
			const fieldValue = input.val();

			if (input.attr('type') == 'checkbox') 
			{
				jsonData[fieldName] = '0';

				if (input.is(':checked')) 
				{
					jsonData[fieldName] = '1';
				}
			}
			else if (input.attr('type') == 'file') 
			{
				const oldFile = input.data('old-file');

				if (oldFile) 
				{
					self.Grocy.Api.Delete('files/userfiles/' + oldFile, null, null, function (xhr) 
					{
						self.Grocy.FrontendHelpers.ShowGenericError('Could not delete file', xhr);
					});
					jsonData[fieldName] = '';
				}

				if (input[0].files.length > 0) 
				{
					// Files service requires an extension
					const fileName = RandomString() + '.' + input[0].files[0].name.split('.').reverse()[0];
					jsonData[fieldName] = btoa(fileName) + '_' + btoa(input[0].files[0].name);
					self.Grocy.Api.UploadFile(input[0].files[0], 'userfiles', fileName, function (result) {}, function (xhr) 
					{// When navigating away immediately from the current page, this is maybe a false positive - so ignore this for now
						// Grocy.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response)
					});
				}
			}
			else if ($(this).hasAttr('multiple')) 
			{
				jsonData[fieldName] = $(this).val().join(',');
			}
			else 
			{
				jsonData[fieldName] = fieldValue;
			}
		});
		this.Grocy.Api.Put('userfields/' + $('#userfields-form').data('entity') + '/' + this.Grocy.EditObjectId, jsonData, function (result) 
		{
			if (success) 
			{
				success();
			}
		}, function (xhr) 
		{
			if (error) 
			{
				error();
			}
		});
	}

	Load() 
	{
		if (!this.$('#userfields-form').length) 
		{
			return;
		}

		const self = this;
		this.Grocy.Api.Get('userfields/' + this.$('#userfields-form').data('entity') + '/' + this.Grocy.EditObjectId, function (result) 
		{
			$.each(result, function (key, value) 
			{
				const input = self.$(".userfield-input[data-userfield-name='" + key + "']");

				if (input.attr('type') == 'checkbox' && value == 1) 
				{
					input.prop('checked', true);
				}
				else if (input.hasAttr('multiple')) 
				{
					input.val(value.split(','));
					self.$('.selectpicker').selectpicker('render');
				}
				else if (input.attr('type') == 'file') 
				{
					if (value != null && !value.isEmpty()) 
					{
						const fileName = atob(value.split('_')[1]);
						const fileSrc = value.split('_')[0];
						const formGroup = input.parent().parent().parent();
						formGroup.find('label.custom-file-label').text(fileName);
						formGroup.find('.userfield-file-show').attr('href', self.Grocy.FormatUrl('/files/userfiles/' + value));
						formGroup.find('.userfield-file-show').removeClass('d-none');
						formGroup.find('img.userfield-current-file').attr('src', self.Grocy.FormatUrl('/files/userfiles/' + value + '?force_serve_as=picture&best_fit_width=250&best_fit_height=250'));
						LoadImagesLazy();
						formGroup.find('.userfield-file-delete').click(function () 
						{
							formGroup.find('label.custom-file-label').text(self.Grocy.translate('No file selected'));
							formGroup.find('.userfield-file-show').addClass('d-none');
							input.attr('data-old-file', fileSrc);
						});
						input.on('change', function (e) 
						{
							formGroup.find('.userfield-file-show').addClass('d-none');
						});
					}
				}
				else if (input.attr('data-userfield-type') == 'link') 
				{
					if (!value.isEmpty()) 
					{
						const data = JSON.parse(value);
						const formRow = input.parent().parent();
						formRow.find('.userfield-link-title').val(data.title);
						formRow.find('.userfield-link-link').val(data.link);
						input.val(value);
					}
				}
				else 
				{
					input.val(value);
				}
			});
			const pickers = $('.datetimepicker-wrapper');

			for (const elem of pickers) 
			{
				const picker = $(elem);
				const scopeId = uuid.v4();
				picker.prop('id', scopeId);
				self.components.push(new datetimepicker(self.Grocy, '#' + scopeId));
			}
		}, function (xhr) 
		{
			console.error(xhr);
		});
	}

	onUserfieldInputKeyUp(_this) 
	{
		const formRow = this.$(_this).parent().parent();
		const title = formRow.find('.userfield-link-title').val();
		const link = formRow.find('.userfield-link-link').val();
		const value = {
			title: title,
			link: link
		};
		formRow.find('.userfield-input').val(JSON.stringify(value));
	}

}

export { userfieldsform };