import { animateCSS } from '../helpers/extensions';
import { __t, U } from '../lib/legacy'; //import { $ } from 'jquery';

import { QrCodeImgHtml } from '../helpers/qrcode';

function manageapikeysView(Grocy, scope = null) 
{
	let $scope = $;

	if (scope != null) 
	{
		$scope = selector => $(scope).find(selector);
	}

	const apiKeysTable = $scope('#apikeys-table').DataTable({
		order: [[4, 'desc']],
		columnDefs: [{
			orderable: false,
			targets: 0
		}, {
			searchable: false,
			targets: 0
		}].concat($.fn.dataTable.defaults.columnDefs)
	});
	$scope('#apikeys-table tbody').removeClass('d-none');
	Grocy.FrontendHelpers.InitDataTable(apiKeysTable);
	const createdApiKeyId = Grocy.GetUriParam('CreatedApiKeyId');

	if (createdApiKeyId !== undefined) 
	{
		animateCSS('#apiKeyRow_' + createdApiKeyId, 'pulse');
	}

	Grocy.FrontendHelpers.MakeDeleteConfirmBox('Are you sure to delete API key "%s"?', '.apikey-delete-button', 'data-apikey-apikey', 'data-apikey-id', 'objects/api_keys/', '/manageapikeys');

	function QrCodeForApiKey(apiKeyType, apiKey) 
	{
		let content = U('/api') + '|' + apiKey;

		if (apiKeyType === 'special-purpose-calendar-ical') 
		{
			content = U('/api/calendar/ical?secret=' + apiKey);
		}

		return QrCodeImgHtml(content);
	}

	$scope('.apikey-show-qr-button').on('click', function () 
	{
		const qrcodeHtml = QrCodeForApiKey($(this).data('apikey-type'), $(this).data('apikey-key'));
		bootbox.alert({
			title: __t('API key'),
			message: "<p class='text-center'>" + qrcodeHtml + '</p>',
			closeButton: false
		});
	});
}

export { manageapikeysView };