import { animateCSS } from '../helpers/extensions';
import { RefreshContextualTimeago } from '../configs/timeago';
import { RefreshLocaleNumberDisplay } from '../helpers/numberdisplay';
import { __t, __n } from '../lib/legacy'; //import { $ } from 'jquery';

function stockoverviewView(Grocy, scope = null) 
{
	let $scope = $;
	const top = scope != null ? $(scope) : $(document);

	if (scope != null) 
	{
		$scope = selector => $(scope).find(selector);
	}

	const productcard = Grocy.Use('productcard'); // preload some views.

	Grocy.PreloadView('stockentries');
	Grocy.PreloadView('shoppinglistitemform');
	Grocy.PreloadView('purchase');
	Grocy.PreloadView('consume');
	Grocy.PreloadView('inventory');
	Grocy.PreloadView('stockjournal');
	Grocy.PreloadView('stockjournalsummary');

	if (Grocy.FeatureFlags.GROCY_FEATURE_FLAG_STOCK_LOCATION_TRACKING) 
	{
		Grocy.PreloadView('transfer');
	}

	const stockOverviewTable = $scope('#stock-overview-table').DataTable({
		order: [[5, 'asc']],
		columnDefs: [{
			orderable: false,
			targets: 0
		}, {
			searchable: false,
			targets: 0
		}, {
			searchable: false,
			targets: 0
		}, {
			visible: false,
			targets: 6
		}, {
			visible: false,
			targets: 7
		}, {
			visible: false,
			targets: 8
		}, {
			visible: false,
			targets: 2
		}, {
			visible: false,
			targets: 4
		}, {
			visible: false,
			targets: 9
		}, {
			visible: false,
			targets: 10
		}, {
			visible: false,
			targets: 11
		}, {
			visible: false,
			targets: 12
		}, {
			visible: false,
			targets: 13
		}, {
			type: 'num',
			targets: 3
		}, {
			type: 'html-num-fmt',
			targets: 9
		}, {
			type: 'html-num-fmt',
			targets: 10
		}, {
			type: 'html',
			targets: 5
		}, {
			type: 'html',
			targets: 11
		}, {
			type: 'html-num-fmt',
			targets: 12
		}, {
			type: 'num',
			targets: 13
		}].concat($.fn.dataTable.defaults.columnDefs)
	});
	$scope('#stock-overview-table tbody').removeClass('d-none');
	Grocy.FrontendHelpers.InitDataTable(stockOverviewTable);
	Grocy.FrontendHelpers.MakeFilterForColumn('#location-filter', 6, stockOverviewTable, null, false, value => 'xx' + value + 'xx');
	Grocy.FrontendHelpers.MakeFilterForColumn('#product-group-filter', 8, stockOverviewTable, null, false, value => 'xx' + value + 'xx');
	Grocy.FrontendHelpers.MakeStatusFilter(stockOverviewTable, 7);
	top.on('click', '.stockentry-grocycode-product-label-print', function (e) 
	{
		e.preventDefault();
		document.activeElement.blur();
		const productId = $scope(e.currentTarget).attr('data-product-id');
		Grocy.Api.Get('stock/products/' + productId + '/printlabel', function (labelData) 
		{
			if (Grocy.Webhooks.labelprinter !== undefined) 
			{
				Grocy.FrontendHelpers.RunWebhook(Grocy.Webhooks.labelprinter, labelData);
			}
		});
	});
	top.on('click', '.product-consume-button', function (e) 
	{
		e.preventDefault(); // Remove the focus from the current button
		// to prevent that the tooltip stays until clicked anywhere else

		document.activeElement.blur();
		Grocy.FrontendHelpers.BeginUiBusy();
		const target = $scope(e.currentTarget);
		const productId = target.attr('data-product-id');
		const consumeAmount = target.attr('data-consume-amount');
		const originalTotalStockAmount = target.attr('data-original-total-stock-amount');
		const wasSpoiled = target.hasClass('product-consume-button-spoiled');
		Grocy.Api.Post('stock/products/' + productId + '/consume', {
			amount: consumeAmount,
			spoiled: wasSpoiled,
			allow_subproduct_substitution: true
		}, function (bookingResponse) 
		{
			Grocy.Api.Get('stock/products/' + productId, function (result) 
			{
				let toastMessage = '';

				if (result.product.enable_tare_weight_handling == 1) 
				{
					toastMessage = __t('Removed %1$s of %2$s from stock', parseFloat(originalTotalStockAmount).toLocaleString({
						minimumFractionDigits: 0,
						maximumFractionDigits: Grocy.UserSettings.stock_decimal_places_amounts
					}) + ' ' + __n(consumeAmount, result.quantity_unit_stock.name, result.quantity_unit_stock.name_plural), result.product.name) + '<br><a class="btn btn-secondary btn-sm mt-2" href="#" onclick="Grocy.UndoStockTransaction(\'' + bookingResponse[0].transaction_id + '\')"><i class="fas fa-undo"></i> ' + __t('Undo') + '</a>';
				}
				else 
				{
					toastMessage = __t('Removed %1$s of %2$s from stock', parseFloat(consumeAmount).toLocaleString({
						minimumFractionDigits: 0,
						maximumFractionDigits: Grocy.UserSettings.stock_decimal_places_amounts
					}) + ' ' + __n(consumeAmount, result.quantity_unit_stock.name, result.quantity_unit_stock.name_plural), result.product.name) + '<br><a class="btn btn-secondary btn-sm mt-2" href="#" onclick="Grocy.UndoStockTransaction(\'' + bookingResponse[0].transaction_id + '\')"><i class="fas fa-undo"></i> ' + __t('Undo') + '</a>';
				}

				if (wasSpoiled) 
				{
					toastMessage += ' (' + __t('Spoiled') + ')';
				}

				Grocy.FrontendHelpers.EndUiBusy();
				toastr.success(toastMessage);
				RefreshStatistics();
				RefreshProductRow(productId);
			}, function (xhr) 
			{
				Grocy.FrontendHelpers.EndUiBusy();
				console.error(xhr);
			});
		}, function (xhr) 
		{
			Grocy.FrontendHelpers.EndUiBusy();
			console.error(xhr);
		});
	});
	top.on('click', '.product-open-button', function (e) 
	{
		e.preventDefault(); // Remove the focus from the current button
		// to prevent that the tooltip stays until clicked anywhere else

		document.activeElement.blur();
		Grocy.FrontendHelpers.BeginUiBusy();
		const button = $scope(e.currentTarget);
		const productId = button.attr('data-product-id');
		const productName = button.attr('data-product-name');
		const productQuName = button.attr('data-product-qu-name');
		const amount = button.attr('data-open-amount');
		Grocy.Api.Post('stock/products/' + productId + '/open', {
			amount: amount,
			allow_subproduct_substitution: true
		}, function (bookingResponse) 
		{
			Grocy.Api.Get('stock/products/' + productId, function (result) 
			{
				if (result.stock_amount == result.stock_amount_opened) 
				{
					button.addClass('disabled');
				}

				Grocy.FrontendHelpers.EndUiBusy();
				toastr.success(__t('Marked %1$s of %2$s as opened', parseFloat(amount).toLocaleString({
					minimumFractionDigits: 0,
					maximumFractionDigits: Grocy.UserSettings.stock_decimal_places_amounts
				}) + ' ' + productQuName, productName) + '<br><a class="btn btn-secondary btn-sm mt-2" href="#" onclick="Grocy.UndoStockTransaction(\'' + bookingResponse[0].transaction_id + '\')"><i class="fas fa-undo"></i> ' + __t('Undo') + '</a>');
				RefreshStatistics();
				RefreshProductRow(productId);
			}, function (xhr) 
			{
				Grocy.FrontendHelpers.EndUiBusy();
				console.error(xhr);
			});
		}, function (xhr) 
		{
			Grocy.FrontendHelpers.EndUiBusy();
			console.error(xhr);
		});
	});
	top.on('click', '.product-name-cell', function (e) 
	{
		productcard.Refresh($(e.currentTarget).attr('data-product-id'));
		$('#stockoverview-productcard-modal').modal('show');
	});

	function RefreshStatistics() 
	{
		Grocy.Api.Get('stock', function (result) 
		{
			if (!Grocy.FeatureFlags.GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING) 
			{
				$('#info-current-stock').text(__n(result.length, '%s Product', '%s Products'));
			}
			else 
			{
				let valueSum = 0;
				result.forEach(element => 
				{
					valueSum += parseFloat(element.value);
				});
				$('#info-current-stock').text(__n(result.length, '%s Product', '%s Products') + ', ' + __t('%s total value', valueSum.toLocaleString(undefined, {
					style: 'currency',
					currency: Grocy.Currency
				})));
			}
		}, function (xhr) 
		{
			console.error(xhr);
		});
		const nextXDays = $scope('#info-duesoon-products').data('next-x-days');
		Grocy.Api.Get('stock/volatile?due_soon_days=' + nextXDays, function (result) 
		{
			$scope('#info-duesoon-products').html('<span class="d-block d-md-none">' + result.due_products.length + ' <i class="fas fa-clock"></i></span><span class="d-none d-md-block">' + __n(result.due_products.length, '%s product is due', '%s products are due') + ' ' + __n(nextXDays, 'within the next day', 'within the next %s days') + '</span>');
			$scope('#info-overdue-products').html('<span class="d-block d-md-none">' + result.overdue_products.length + ' <i class="fas fa-times-circle"></i></span><span class="d-none d-md-block">' + __n(result.overdue_products.length, '%s product is overdue', '%s products are overdue') + '</span>');
			$scope('#info-expired-products').html('<span class="d-block d-md-none">' + result.expired_products.length + ' <i class="fas fa-times-circle"></i></span><span class="d-none d-md-block">' + __n(result.expired_products.length, '%s product is expired', '%s products are expired') + '</span>');
			$scope('#info-missing-products').html('<span class="d-block d-md-none">' + result.missing_products.length + ' <i class="fas fa-exclamation-circle"></i></span><span class="d-none d-md-block">' + __n(result.missing_products.length, '%s product is below defined min. stock amount', '%s products are below defined min. stock amount') + '</span>');
		}, function (xhr) 
		{
			console.error(xhr);
		});
	}

	RefreshStatistics();

	function RefreshProductRow(productId) 
	{
		productId = productId.toString();
		Grocy.Api.Get('stock/products/' + productId, function (result) 
		{
			// Also refresh the parent product, if any
			if (result.product.parent_product_id !== null && !result.product.parent_product_id.toString().isEmpty()) 
			{
				RefreshProductRow(result.product.parent_product_id);
			}

			const productRow = $scope('#product-' + productId + '-row');
			const dueSoonThreshold = moment().add($scope('#info-duesoon-products').data('next-x-days'), 'days');
			const now = moment();
			const nextDueDate = moment(result.next_due_date);
			productRow.removeClass('table-warning');
			productRow.removeClass('table-danger');
			productRow.removeClass('table-secondary');
			productRow.removeClass('table-info');
			productRow.removeClass('d-none');
			productRow.removeAttr('style');

			if (now.isAfter(nextDueDate)) 
			{
				if (result.product.due_type == 1) 
				{
					productRow.addClass('table-secondary');
				}
				else 
				{
					productRow.addClass('table-danger');
				}
			}
			else if (nextDueDate.isBefore(dueSoonThreshold)) 
			{
				productRow.addClass('table-warning');
			}

			if (result.stock_amount == 0 && result.stock_amount_aggregated == 0 && result.product.min_stock_amount == 0) 
			{
				animateCSS('#product-' + productId + '-row', 'fadeOut', function () 
				{
					$scope('#product-' + productId + '-row').tooltip('hide');
					$scope('#product-' + productId + '-row').addClass('d-none');
				});
			}
			else 
			{
				animateCSS('#product-' + productId + '-row td:not(:first)', 'shake');
				$scope('#product-' + productId + '-qu-name').text(__n(result.stock_amount, result.quantity_unit_stock.name, result.quantity_unit_stock.name_plural));
				$scope('#product-' + productId + '-amount').text(result.stock_amount);
				$scope('#product-' + productId + '-consume-all-button').attr('data-consume-amount', result.stock_amount);
				$scope('#product-' + productId + '-value').text(result.stock_value);
				$scope('#product-' + productId + '-next-due-date').text(result.next_due_date);
				$scope('#product-' + productId + '-next-due-date-timeago').attr('datetime', result.next_due_date);
				const openedAmount = result.stock_amount_opened || 0;

				if (openedAmount > 0) 
				{
					$scope('#product-' + productId + '-opened-amount').text(__t('%s opened', openedAmount));
				}
				else 
				{
					$scope('#product-' + productId + '-opened-amount').text('');
				}

				if (result.stock_amount == 0 && result.product.min_stock_amount > 0) 
				{
					productRow.addClass('table-info');
				}
			}

			$scope('#product-' + productId + '-next-due-date').text(result.next_due_date);
			$scope('#product-' + productId + '-next-due-date-timeago').attr('datetime', result.next_due_date + ' 23:59:59');

			if (result.stock_amount_opened > 0) 
			{
				$scope('#product-' + productId + '-opened-amount').text(__t('%s opened', result.stock_amount_opened));
			}
			else 
			{
				$scope('#product-' + productId + '-opened-amount').text('');
			}

			if (parseInt(result.is_aggregated_amount) === 1) 
			{
				$scope('#product-' + productId + '-amount-aggregated').text(result.stock_amount_aggregated);

				if (result.stock_amount_opened_aggregated > 0) 
				{
					$scope('#product-' + productId + '-opened-amount-aggregated').text(__t('%s opened', result.stock_amount_opened_aggregated));
				}
				else 
				{
					$scope('#product-' + productId + '-opened-amount-aggregated').text('');
				}
			} // Needs to be delayed because of the animation above the date-text would be wrong if fired immediately...


			setTimeout(function () 
			{
				RefreshContextualTimeago('#product-' + productId + '-row');
				RefreshLocaleNumberDisplay('#product-' + productId + '-row');
			}, 600);
		}, function (xhr) 
		{
			Grocy.FrontendHelpers.EndUiBusy();
			console.error(xhr);
		});
	}

	$(window).on('message', function (e) 
	{
		const data = e.originalEvent.data;

		if (data.Message === 'ProductChanged') 
		{
			RefreshProductRow(data.Payload);
			RefreshStatistics();
		}
	});
}

export { stockoverviewView };