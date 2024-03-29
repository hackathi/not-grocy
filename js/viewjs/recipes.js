import { __t, U } from '../lib/legacy'; //import { $ } from 'jquery';

function recipesView(Grocy, scope = null) 
{
	let $scope = $;
	const viewport = scope != null ? $(scope) : $(window);
	const top = scope != null ? $(scope) : $(document);

	if (scope != null) 
	{
		$scope = selector => $(scope).find(selector);
	}

	Grocy.Use('numberpicker');
	const recipesTables = $scope('#recipes-table').DataTable({
		order: [[1, 'asc']],
		columnDefs: [{
			orderable: false,
			targets: 0
		}, {
			searchable: false,
			targets: 0
		}, {
			type: 'html-num-fmt',
			targets: 2
		}].concat($.fn.dataTable.defaults.columnDefs),
		select: {
			style: 'single',
			selector: 'tr td:not(:first-child)'
		},
		initComplete: function () 
		{
			this.api().row({
				order: 'current'
			}, 0).select();
		}
	});
	$scope('#recipes-table tbody').removeClass('d-none');
	Grocy.FrontendHelpers.InitDataTable(recipesTables, function () 
	{
		const value = $(this).val();
		recipesTables.search(value).draw();
		$scope('.recipe-gallery-item').removeClass('d-none');
		$scope('.recipe-gallery-item .card-title:not(:contains_case_insensitive(' + value + '))').parent().parent().parent().addClass('d-none');
	}, function () // custom status filter below
	{
		$scope('#search').val('');
		$scope('#status-filter').val('all');
		$scope('#search').trigger('keyup');
		$scope('#status-filter').trigger('change');
	});

	if (typeof Grocy.GetUriParam('tab') !== 'undefined' && Grocy.GetUriParam('tab') === 'gallery' || window.localStorage.getItem('recipes_last_tab_id') == 'gallery-tab') 
	{
		$scope(".nav-tabs a[href='#gallery']").tab('show');
	}

	const recipe = Grocy.GetUriParam('recipe');

	if (typeof recipe !== 'undefined') 
	{
		$scope('#recipes-table tr').removeClass('selected');
		const rowId = '#recipe-row-' + recipe;
		$scope(rowId).addClass('selected');
		const cardId = '#RecipeGalleryCard-' + recipe;
		$scope(cardId).addClass('border-primary');

		if (viewport.width() < 768) 
		{
			// Scroll to recipe card on mobile
			$scope('#selectedRecipeCard')[0].scrollIntoView();
		}
	}

	if (Grocy.GetUriParam('search') !== undefined) 
	{
		$scope('#search').val(Grocy.GetUriParam('search'));
		setTimeout(function () 
		{
			$scope('#search').keyup();
		}, 50);
	}

	$scope("a[data-toggle='tab']").on('shown.bs.tab', function (e) 
	{
		const tabId = $(e.target).attr('id');
		window.localStorage.setItem('recipes_last_tab_id', tabId);
	});
	$scope('#status-filter').on('change', function () 
	{
		let value = $(this).val();

		if (value === 'all') 
		{
			value = '';
		}

		recipesTables.column(5).search(value).draw();
		$scope('.recipe-gallery-item').removeClass('d-none');

		if (value !== '') 
		{
			if (value === 'Xenoughinstock') 
			{
				$scope('.recipe-gallery-item').not('.recipe-enoughinstock').addClass('d-none');
			}
			else if (value === 'enoughinstockwithshoppinglist') 
			{
				$scope('.recipe-gallery-item').not('.recipe-enoughinstockwithshoppinglist').addClass('d-none');
			}

			if (value === 'notenoughinstock') 
			{
				$scope('.recipe-gallery-item').not('.recipe-notenoughinstock').addClass('d-none');
			}
		}
	});
	Grocy.FrontendHelpers.MakeDeleteConfirmBox('Are you sure to delete recipe "%s"?', '.recipe-delete', 'data-recipe-name', 'data-recipe-id', 'objects/recipes/', '/recipes');
	Grocy.FrontendHelpers.MakeYesNoBox(target => 
	{
		const objectName = $(target).attr('data-recipe-name');
		return __t('Are you sure to put all missing ingredients for recipe "%s" on the shopping list?', objectName) + '<br><br>' + __t('Uncheck ingredients to not put them on the shopping list') + ':' + $scope('#missing-recipe-pos-list')[0].outerHTML.replace('d-none', '');
	}, '.recipe-shopping-list', (result, target) => 
	{
		const objectId = $(target).attr('data-recipe-id');

		if (result === true) 
		{
			Grocy.FrontendHelpers.BeginUiBusy();
			const excludedProductIds = new Array();
			$scope('.missing-recipe-pos-product-checkbox:checkbox:not(:checked)').each(function () 
			{
				excludedProductIds.push($(this).data('product-id'));
			});
			Grocy.Api.Post('recipes/' + objectId + '/add-not-fulfilled-products-to-shoppinglist', {
				excludedProductIds: excludedProductIds
			}, function (result) 
			{
				window.location.href = U('/recipes');
			}, function (xhr) 
			{
				Grocy.FrontendHelpers.EndUiBusy();
				console.error(xhr);
			});
		}
	});
	Grocy.FrontendHelpers.MakeYesNoBox(target => 
	{
		const objectName = $(target).attr('data-recipe-name');
		return __t('Are you sure to consume all ingredients needed by recipe "%s" (ingredients marked with "only check if any amount is in stock" will be ignored)?', objectName);
	}, '.recipe-consume', (result, targetElement) => 
	{
		const target = $(targetElement);
		const objectName = target.attr('data-recipe-name');
		const objectId = target.attr('data-recipe-id');

		if (result === true) 
		{
			Grocy.FrontendHelpers.BeginUiBusy();
			Grocy.Api.Post('recipes/' + objectId + '/consume', {}, function (result) 
			{
				Grocy.FrontendHelpers.EndUiBusy();
				toastr.success(__t('Removed all ingredients of recipe "%s" from stock', objectName));
			}, function (xhr) 
			{
				Grocy.FrontendHelpers.EndUiBusy();
				toastr.warning(__t('Not all ingredients of recipe "%s" are in stock, nothing removed', objectName));
				console.error(xhr);
			});
		}
	});
	recipesTables.on('select', function (e, dt, type, indexes) 
	{
		if (type === 'row') 
		{
			const selectedRecipeId = $scope(recipesTables.row(indexes[0]).node()).data('recipe-id');
			const currentRecipeId = window.location.search.split('recipe=')[1];

			if (selectedRecipeId.toString() !== currentRecipeId) 
			{
				window.location.href = U('/recipes?recipe=' + selectedRecipeId.toString());
			}
		}
	});
	$scope('.recipe-gallery-item').on('click', function (e) 
	{
		e.preventDefault();
		window.location.href = U('/recipes?tab=gallery&recipe=' + $(this).data('recipe-id'));
	});
	$scope('.recipe-fullscreen').on('click', function (e) 
	{
		e.preventDefault();
		$scope('#selectedRecipeCard').toggleClass('fullscreen');
		$scope('body').toggleClass('fullscreen-card');
		$scope('#selectedRecipeCard .card-header').toggleClass('fixed-top');
		$scope('#selectedRecipeCard .card-body').toggleClass('mt-5');

		if ($scope('body').hasClass('fullscreen-card')) 
		{
			window.location.hash = '#fullscreen';
		}
		else 
		{
			window.history.replaceState(null, null, ' ');
		}
	});
	$scope('.recipe-print').on('click', function (e) 
	{
		e.preventDefault();
		$scope('#selectedRecipeCard').removeClass('fullscreen');
		$scope('body').removeClass('fullscreen-card');
		$scope('#selectedRecipeCard .card-header').removeClass('fixed-top');
		$scope('#selectedRecipeCard .card-body').removeClass('mt-5');
		window.history.replaceState(null, null, ' ');
		window.print();
	});
	$scope('#servings-scale').keyup(function (event) 
	{
		const data = {};
		data.desired_servings = $(this).val();
		Grocy.Api.Put('objects/recipes/' + $(this).data('recipe-id'), data, function (result) 
		{
			window.location.reload();
		}, function (xhr) 
		{
			console.error(xhr);
		});
	});
	top.on('click', '.missing-recipe-pos-select-button', function (e) 
	{
		e.preventDefault();
		const checkbox = $(this).find('.form-check-input');
		checkbox.prop('checked', !checkbox.prop('checked'));
		$(this).toggleClass('list-group-item-primary');
	});

	if (window.location.hash === '#fullscreen') 
	{
		$scope('#selectedRecipeToggleFullscreenButton').click();
	}
}

export { recipesView };