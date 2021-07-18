import { RefreshLocaleNumberInput, RefreshLocaleNumberDisplay } from '../helpers/numberdisplay';
import { LoadImagesLazy } from '../configs/lazy';
import { __t, __n, U } from '../lib/legacy'; //import { $ } from 'jquery';

import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import momentPlugin, { toMoment } from '@fullcalendar/moment/main';
import '@fullcalendar/core/main.css';
import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/bootstrap/main.css';

function mealplanView(Grocy, scope = null) 
{
	let $scope = $;
	const top = scope != null ? $(scope) : $(document);
	const viewport = scope != null ? $(scope) : $(window);

	if (scope != null) 
	{
		$scope = selector => $(scope).find(selector);
	}

	Grocy.Use('numberpicker');
	const productamountpicker = Grocy.Use('productamountpicker');
	const recipepicker = Grocy.Use('recipepicker');
	const productpicker = Grocy.Use('productpicker');
	let setLocale = false;

	if (__t('fullcalendar_locale').replace(' ', '') !== '' && __t('fullcalendar_locale') != 'x') 
	{
		setLocale = true;
		$.getScript(U('/js/locales/fullcalendar-core/' + __t('fullcalendar_locale') + '.js'));
	}

	let firstRender = true;
	Grocy.IsMealPlanEntryEditAction = false;
	Grocy.MealPlanEntryEditObjectId = -1;
	let firstDay = null;

	if (!Grocy.CalendarFirstDayOfWeek.isEmpty()) 
	{
		firstDay = parseInt(Grocy.CalendarFirstDayOfWeek);
	}

	if (!Grocy.MealPlanFirstDayOfWeek.isEmpty()) 
	{
		firstDay = parseInt(Grocy.MealPlanFirstDayOfWeek);
	}

	var calendar = new Calendar($scope('#calendar')[0], {
		plugins: [dayGridPlugin, bootstrapPlugin, momentPlugin],
		themeSystem: 'bootstrap',
		header: {
			left: 'title',
			center: '',
			right: 'prev,today,next'
		},
		weekNumbers: false,
		eventLimit: false,
		events: Grocy.fullcalendarEventSources,
		defaultView: viewport.width() < 768 ? 'dayGridDay' : 'dayGridWeek',
		firstDay: firstDay,
		height: 'auto',
		datesRender: function (info) 
		{
			const view = info.view;
			const start = toMoment(view.activeStart, calendar);

			if (firstRender) 
			{
				firstRender = false;
			}
			else 
			{
				Grocy.UpdateUriParam('week', start.format('YYYY-MM-DD'));
			}

			$scope('.fc-day-header').prepend('\
				<div class="btn-group mr-2 my-1"> \
					<button type="button" class="btn btn-outline-dark btn-xs add-recipe-button""><i class="fas fa-plus"></i></a></button> \
					<button type="button" class="btn btn-outline-dark btn-xs dropdown-toggle dropdown-toggle-split" data-toggle="dropdown"></button> \
					<div class="dropdown-menu"> \
						<a class="dropdown-item add-note-button" href="#">' + __t('Add note') + '</a> \
						<a class="dropdown-item add-product-button" href="#">' + __t('Add product') + '</a> \
					</div> \
				</div>');
			const weekRecipeName = start.year() + '-' + (start.week() - 1).toString().padStart(2, '0').toString();
			const weekRecipe = Grocy.internalRecipes.find(elem => elem.name == weekRecipeName);
			let weekCosts = 0;
			let weekRecipeOrderMissingButtonHtml = '';
			let weekRecipeConsumeButtonHtml = '';
			let weekCostsHtml = '';

			if (weekRecipe !== null && weekRecipe !== undefined) // Array.prototype.find returns undefined if not found.
			{
				const recipes = Grocy.recipesResolved.find(elem => elem.recipe_id == weekRecipe.id);

				if (Grocy.FeatureFlags.GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING) 
				{
					weekCosts = recipes.costs;
					weekCostsHtml = __t('Week costs') + ': <span class="locale-number locale-number-currency">' + weekCosts.toString() + '</span> ';
				}

				let weekRecipeOrderMissingButtonDisabledClasses = '';

				if (recipes.need_fulfilled_with_shopping_list == 1) 
				{
					weekRecipeOrderMissingButtonDisabledClasses = 'disabled';
				}

				let weekRecipeConsumeButtonDisabledClasses = '';

				if (recipes.need_fulfilled == 0 || weekCosts == 0) 
				{
					weekRecipeConsumeButtonDisabledClasses = 'disabled';
				}

				weekRecipeOrderMissingButtonHtml = '<a class="ml-1 btn btn-outline-primary btn-xs recipe-order-missing-button ' + weekRecipeOrderMissingButtonDisabledClasses + '" href="#" data-toggle="tooltip" title="' + __t('Put missing products on shopping list') + '" data-recipe-id="' + weekRecipe.id.toString() + '" data-recipe-name="' + weekRecipe.name + '" data-recipe-type="' + weekRecipe.type + '"><i class="fas fa-cart-plus"></i></a>';
				weekRecipeConsumeButtonHtml = '<a class="ml-1 btn btn-outline-success btn-xs recipe-consume-button ' + weekRecipeConsumeButtonDisabledClasses + '" href="#" data-toggle="tooltip" title="' + __t('Consume all ingredients needed by this weeks recipes or products') + '" data-recipe-id="' + weekRecipe.id.toString() + '" data-recipe-name="' + weekRecipe.name + '" data-recipe-type="' + weekRecipe.type + '"><i class="fas fa-utensils"></i></a>';
			}

			$scope('.fc-header-toolbar .fc-center').html('<h4>' + weekCostsHtml + weekRecipeOrderMissingButtonHtml + weekRecipeConsumeButtonHtml + '</h4>');
		},
		eventRender: function (info) 
		{
			const event = info.event.extendedProps;
			const element = $(info.el);
			element.removeClass('fc-event');
			element.addClass('text-center');
			element.attr('data-meal-plan-entry', event.mealPlanEntry);
			const mealPlanEntry = JSON.parse(event.mealPlanEntry);
			let costsAndCaloriesPerDay = '';

			if (event.type != 'note') 
			{
				const dayRecipeName = toMoment(info.event.start, calendar).format('YYYY-MM-DD');
				const dayRecipe = Grocy.internalRecipes.find(elem => elem.name == dayRecipeName);
				const dayRecipeResolved = Grocy.recipesResolved.find(elem => elem.recipe_id == dayRecipe.id);

				if (!$scope('#day-summary-' + dayRecipeName).length) // This runs for every event/recipe, so maybe multiple times per day, so only add the day summary once
				{
					if (dayRecipe != null) 
					{
						if (Grocy.FeatureFlags.GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING) 
						{
							costsAndCaloriesPerDay = '<h5 class="small text-truncate"><span class="locale-number locale-number-currency">' + dayRecipeResolved.costs + '</span> / <span class="locale-number locale-number-generic">' + dayRecipeResolved.calories + '</span> kcal ' + __t('per day') + '<h5>';
						}
						else 
						{
							costsAndCaloriesPerDay = '<h5 class="small text-truncate"><span class="locale-number locale-number-generic">' + dayRecipeResolved.calories + '</span> kcal ' + __t('per day') + '<h5>';
						}

						$scope(".fc-day-header[data-date='" + dayRecipeName + "']").append('<h5 id="day-summary-' + dayRecipeName + '" class="small text-truncate border-top pt-1 pb-0">' + costsAndCaloriesPerDay + '</h5>');
					}
				}
			}

			if (event.type == 'recipe') 
			{
				const recipe = JSON.parse(event.recipe);

				if (recipe === null || recipe === undefined) 
				{
					return false;
				}

				const resolvedRecipe = Grocy.recipesResolved.find(elem => elem.recipe_id == recipe.id);
				element.attr('data-recipe', event.recipe);
				let recipeOrderMissingButtonDisabledClasses = '';

				if (resolvedRecipe.need_fulfilled_with_shopping_list == 1) 
				{
					recipeOrderMissingButtonDisabledClasses = 'disabled';
				}

				let recipeConsumeButtonDisabledClasses = '';

				if (resolvedRecipe.need_fulfilled == 0) 
				{
					recipeConsumeButtonDisabledClasses = 'disabled';
				}

				var fulfillmentInfoHtml = __t('Enough in stock');

				var fulfillmentIconHtml = '<i class="fas fa-check text-success"></i>';

				if (resolvedRecipe.need_fulfilled != 1) 
				{
					fulfillmentInfoHtml = __t('Not enough in stock');
					fulfillmentIconHtml = '<i class="fas fa-times text-danger"></i>';
				}

				var costsAndCaloriesPerServing = '';

				if (Grocy.FeatureFlags.GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING) 
				{
					costsAndCaloriesPerServing = '<h5 class="small text-truncate"><span class="locale-number locale-number-currency">' + resolvedRecipe.costs + '</span> / <span class="locale-number locale-number-generic">' + resolvedRecipe.calories + '</span> kcal ' + __t('per serving') + '<h5>';
				}
				else 
				{
					costsAndCaloriesPerServing = '<h5 class="small text-truncate"><span class="locale-number locale-number-generic">' + resolvedRecipe.calories + '</span> kcal ' + __t('per serving') + '<h5>';
				}

				if (!Grocy.FeatureFlags.GROCY_FEATURE_FLAG_STOCK) 
				{
					fulfillmentIconHtml = '';
					fulfillmentInfoHtml = '';
				}

				element.html('\
					<div> \
						<h5 class="text-truncate">' + recipe.name + '<h5> \
						<h5 class="small text-truncate">' + __n(mealPlanEntry.recipe_servings, '%s serving', '%s servings') + '</h5> \
						<h5 class="small timeago-contextual text-truncate">' + fulfillmentIconHtml + ' ' + fulfillmentInfoHtml + '</h5> \
						' + costsAndCaloriesPerServing + ' \
						<h5> \
							<a class="ml-1 btn btn-outline-info btn-xs edit-meal-plan-entry-button" href="#" data-toggle="tooltip" title="' + __t('Edit this item') + '"><i class="fas fa-edit"></i></a> \
							<a class="ml-1 btn btn-outline-danger btn-xs remove-recipe-button" href="#" data-toggle="tooltip" title="' + __t('Delete this item') + '"><i class="fas fa-trash"></i></a> \
							<a class="ml-1 btn btn-outline-primary btn-xs recipe-order-missing-button ' + recipeOrderMissingButtonDisabledClasses + '" href="#" data-toggle="tooltip" title="' + __t('Put missing products on shopping list') + '" data-recipe-id="' + recipe.id.toString() + '" data-mealplan-servings="' + mealPlanEntry.recipe_servings + '" data-recipe-name="' + recipe.name + '" data-recipe-type="' + recipe.type + '"><i class="fas fa-cart-plus"></i></a> \
							<a class="ml-1 btn btn-outline-success btn-xs recipe-consume-button ' + recipeConsumeButtonDisabledClasses + '" href="#" data-toggle="tooltip" title="' + __t('Consume all ingredients needed by this recipe') + '" data-recipe-id="' + recipe.id.toString() + '" data-mealplan-servings="' + mealPlanEntry.recipe_servings + '" data-recipe-name="' + recipe.name + '" data-recipe-type="' + recipe.type + '"><i class="fas fa-utensils"></i></a> \
							<a class="ml-1 btn btn-outline-secondary btn-xs recipe-popup-button" href="#" data-toggle="tooltip" title="' + __t('Display recipe') + '" data-recipe-id="' + recipe.id.toString() + '" data-recipe-name="' + recipe.name + '" data-mealplan-servings="' + mealPlanEntry.recipe_servings + '" data-recipe-type="' + recipe.type + '"><i class="fas fa-eye"></i></a> \
						</h5> \
					</div>');

				if (recipe.picture_file_name && !recipe.picture_file_name.isEmpty()) 
				{
					element.html(element.html() + '<div class="mx-auto"><img data-src="' + U('/api/files/recipepictures/') + btoa(recipe.picture_file_name) + '?force_serve_as=picture&best_fit_width=400" class="img-fluid lazy"></div>');
				}
			}

			if (event.type == 'product') 
			{
				const productDetails = JSON.parse(event.productDetails);

				if (productDetails === null || productDetails === undefined) 
				{
					return false;
				}

				if (productDetails.last_price === null) 
				{
					productDetails.last_price = 0;
				}

				element.attr('data-product-details', event.productDetails);
				let productOrderMissingButtonDisabledClasses = 'disabled';

				if (parseFloat(productDetails.stock_amount_aggregated) < parseFloat(mealPlanEntry.product_amount)) 
				{
					productOrderMissingButtonDisabledClasses = '';
				}

				let productConsumeButtonDisabledClasses = 'disabled';

				if (parseFloat(productDetails.stock_amount_aggregated) >= parseFloat(mealPlanEntry.product_amount)) 
				{
					productConsumeButtonDisabledClasses = '';
				}

				fulfillmentInfoHtml = __t('Not enough in stock');
				fulfillmentIconHtml = '<i class="fas fa-times text-danger"></i>';

				if (parseFloat(productDetails.stock_amount_aggregated) >= parseFloat(mealPlanEntry.product_amount)) 
				{
					fulfillmentInfoHtml = __t('Enough in stock');
					fulfillmentIconHtml = '<i class="fas fa-check text-success"></i>';
				}

				if (Grocy.FeatureFlags.GROCY_FEATURE_FLAG_STOCK_PRICE_TRACKING) 
				{
					costsAndCaloriesPerServing = '<h5 class="small text-truncate"><span class="locale-number locale-number-currency">' + productDetails.last_price * mealPlanEntry.product_amount + '</span> / <span class="locale-number locale-number-generic">' + productDetails.product.calories * mealPlanEntry.product_amount + '</span> kcal ' + '<h5>';
				}
				else 
				{
					costsAndCaloriesPerServing = '<h5 class="small text-truncate"><span class="locale-number locale-number-generic">' + productDetails.product.calories * mealPlanEntry.product_amount + '</span> kcal ' + '<h5>';
				}

				element.html('\
					<div> \
						<h5 class="text-truncate">' + productDetails.product.name + '<h5> \
						<h5 class="small text-truncate"><span class="locale-number locale-number-quantity-amount">' + mealPlanEntry.product_amount + '</span> ' + __n(mealPlanEntry.product_amount, productDetails.quantity_unit_stock.name, productDetails.quantity_unit_stock.name_plural) + '</h5> \
						<h5 class="small timeago-contextual text-truncate">' + fulfillmentIconHtml + ' ' + fulfillmentInfoHtml + '</h5> \
						' + costsAndCaloriesPerServing + ' \
						<h5> \
							<a class="ml-1 btn btn-outline-danger btn-xs remove-product-button" href="#" data-toggle="tooltip" title="' + __t('Delete this item') + '"><i class="fas fa-trash"></i></a> \
							<a class="ml-1 btn btn-outline-info btn-xs edit-meal-plan-entry-button" href="#" data-toggle="tooltip" title="' + __t('Edit this item') + '"><i class="fas fa-edit"></i></a> \
							<a class="ml-1 btn btn-outline-success btn-xs product-consume-button ' + productConsumeButtonDisabledClasses + '" href="#" data-toggle="tooltip" title="' + __t('Consume %1$s of %2$s', parseFloat(mealPlanEntry.product_amount).toLocaleString() + ' ' + __n(mealPlanEntry.product_amount, productDetails.quantity_unit_stock.name, productDetails.quantity_unit_stock.name_plural), productDetails.product.name) + '" data-product-id="' + productDetails.product.id.toString() + '" data-product-name="' + productDetails.product.name + '" data-product-amount="' + mealPlanEntry.product_amount + '"><i class="fas fa-utensils"></i></a> \
							<a class="ml-1 btn btn-outline-primary btn-xs show-as-dialog-link ' + productOrderMissingButtonDisabledClasses + '" href="' + U('/shoppinglistitem/new?embedded&updateexistingproduct&product=') + mealPlanEntry.product_id + '&amount=' + mealPlanEntry.product_amount + '" data-toggle="tooltip" title="' + __t('Add to shopping list') + '" data-product-id="' + productDetails.product.id.toString() + '" data-product-name="' + productDetails.product.name + '" data-product-amount="' + mealPlanEntry.product_amount + '"><i class="fas fa-cart-plus"></i></a> \
						</h5> \
					</div>');

				if (productDetails.product.picture_file_name && !productDetails.product.picture_file_name.isEmpty()) 
				{
					element.html(element.html() + '<div class="mx-auto"><img data-src="' + U('/api/files/productpictures/') + btoa(productDetails.product.picture_file_name) + '?force_serve_as=picture&best_fit_width=400" class="img-fluid lazy"></div>');
				}
			}
			else if (event.type == 'note') 
			{
				element.html('\
					<div> \
						<h5 class="text-wrap text-break">' + mealPlanEntry.note + '<h5> \
						<h5> \
							<a class="ml-1 btn btn-outline-danger btn-xs remove-note-button" href="#" data-toggle="tooltip" title="' + __t('Delete this item') + '"><i class="fas fa-trash"></i></a> \
							<a class="ml-1 btn btn-outline-info btn-xs edit-meal-plan-entry-button" href="#" data-toggle="tooltip" title="' + __t('Delete this item') + '"><i class="fas fa-edit"></i></a> \
						</h5> \
					</div>');
			}
		},
		eventPositioned: function (info) 
		{
			// this callback is called once a event is rendered.
			// try to limit DOM operations as much as possible
			// to the rendered element.
			const elem = $(info.el);
			RefreshLocaleNumberDisplay();
			LoadImagesLazy();
			elem.find('[data-toggle="tooltip"]').tooltip();

			if (!Grocy.FeatureFlags.GROCY_FEATURE_FLAG_STOCK) 
			{
				elem.find('.recipe-order-missing-button').addClass('d-none');
				elem.find('.recipe-consume-button').addClass('d-none');
			}
		}
	}); // render the calendar.

	calendar.render();

	if (setLocale) 
	{
		calendar.setOption('locale', __t('fullcalendar_locale'));
	} // this triggers a re-render, so we can't do that in the callback;
	// but it works here no problem.


	if (Grocy.GetUriParam('week') !== undefined) 
	{
		calendar.gotoDate(Grocy.GetUriParam('week'));
	}

	top.on('click', '.add-recipe-button', function (e) 
	{
		const day = $(this).parent().parent().data('date');
		$scope('#add-recipe-modal-title').text(__t('Add recipe on %s', day.toString()));
		$scope('#day').val(day.toString());
		recipepicker.Clear();
		$scope('#add-recipe-modal').modal('show');
		Grocy.FrontendHelpers.ValidateForm('add-recipe-form');
		Grocy.IsMealPlanEntryEditAction = false;
	});
	top.on('click', '.add-note-button', function (e) 
	{
		const day = $(this).parent().parent().parent().data('date');
		$scope('#add-note-modal-title').text(__t('Add note on %s', day.toString()));
		$scope('#day').val(day.toString());
		$scope('#note').val('');
		$scope('#add-note-modal').modal('show');
		Grocy.FrontendHelpers.ValidateForm('add-note-form');
		Grocy.IsMealPlanEntryEditAction = false;
	});
	top.on('click', '.add-product-button', function (e) 
	{
		const day = $(this).parent().parent().parent().data('date');
		$scope('#add-product-modal-title').text(__t('Add product on %s', day.toString()));
		$scope('#day').val(day.toString());
		productpicker.Clear();
		$scope('#add-product-modal').modal('show');
		Grocy.FrontendHelpers.ValidateForm('add-product-form');
		Grocy.IsMealPlanEntryEditAction = false;
	});
	top.on('click', '.edit-meal-plan-entry-button', function (e) 
	{
		const mealPlanEntry = JSON.parse($(this).parents('.fc-h-event:first').attr('data-meal-plan-entry'));

		if (mealPlanEntry.type == 'recipe') 
		{
			$scope('#add-recipe-modal-title').text(__t('Edit recipe on %s', mealPlanEntry.day.toString()));
			$scope('#day').val(mealPlanEntry.day.toString());
			$scope('#recipe_servings').val(mealPlanEntry.recipe_servings);
			recipepicker.SetId(mealPlanEntry.recipe_id);
			$scope('#add-recipe-modal').modal('show');
			Grocy.FrontendHelpers.ValidateForm('add-recipe-form');
		}
		else if (mealPlanEntry.type == 'product') 
		{
			$scope('#add-product-modal-title').text(__t('Edit product on %s', mealPlanEntry.day.toString()));
			$scope('#day').val(mealPlanEntry.day.toString());
			productpicker.SetId(mealPlanEntry.product_id);
			$scope('#add-product-modal').modal('show');
			Grocy.FrontendHelpers.ValidateForm('add-product-form');
			productpicker.GetPicker().trigger('change');
		}
		else if (mealPlanEntry.type == 'note') 
		{
			$scope('#add-note-modal-title').text(__t('Edit note on %s', mealPlanEntry.day.toString()));
			$scope('#day').val(mealPlanEntry.day.toString());
			$scope('#note').val(mealPlanEntry.note);
			$scope('#add-note-modal').modal('show');
			Grocy.FrontendHelpers.ValidateForm('add-note-form');
		}

		Grocy.IsMealPlanEntryEditAction = true;
		Grocy.MealPlanEntryEditObjectId = mealPlanEntry.id;
	});
	$scope('#add-recipe-modal').on('shown.bs.modal', function (e) 
	{
		recipepicker.GetInputElement().focus();
	});
	$scope('#add-note-modal').on('shown.bs.modal', function (e) 
	{
		$scope('#note').focus();
	});
	$scope('#add-product-modal').on('shown.bs.modal', function (e) 
	{
		productpicker.GetInputElement().focus();
	});
	top.on('click', '.remove-recipe-button, .remove-note-button, .remove-product-button', function (e) 
	{
		const mealPlanEntry = JSON.parse($(this).parents('.fc-h-event:first').attr('data-meal-plan-entry'));
		Grocy.Api.Delete('objects/meal_plan/' + mealPlanEntry.id.toString(), {}, function (result) 
		{
			window.location.reload();
		}, function (xhr) 
		{
			Grocy.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
		});
	});
	$scope('#save-add-recipe-button').on('click', function (e) 
	{
		e.preventDefault();

		if ($scope('.combobox-menu-visible').length) 
		{
			return;
		}

		if ($scope('#add-recipe-form')[0].checkValidity() === false) // There is at least one validation error
		{
			return false;
		}

		if (Grocy.IsMealPlanEntryEditAction) 
		{
			Grocy.Api.Put('objects/meal_plan/' + Grocy.MealPlanEntryEditObjectId.toString(), $scope('#add-recipe-form').serializeJSON(), function (result) 
			{
				window.location.reload();
			}, function (xhr) 
			{
				Grocy.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			});
		}
		else 
		{
			Grocy.Api.Post('objects/meal_plan', $scope('#add-recipe-form').serializeJSON(), function (result) 
			{
				window.location.reload();
			}, function (xhr) 
			{
				Grocy.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			});
		}
	});
	$scope('#save-add-note-button').on('click', function (e) 
	{
		e.preventDefault();

		if ($scope('.combobox-menu-visible').length) 
		{
			return;
		}

		if ($scope('#add-note-form')[0].checkValidity() === false) // There is at least one validation error
		{
			return false;
		}

		const jsonData = $scope('#add-note-form').serializeJSON();
		jsonData.day = $scope('#day').val();

		if (Grocy.IsMealPlanEntryEditAction) 
		{
			Grocy.Api.Put('objects/meal_plan/' + Grocy.MealPlanEntryEditObjectId.toString(), jsonData, function (result) 
			{
				window.location.reload();
			}, function (xhr) 
			{
				Grocy.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			});
		}
		else 
		{
			Grocy.Api.Post('objects/meal_plan', jsonData, function (result) 
			{
				window.location.reload();
			}, function (xhr) 
			{
				Grocy.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			});
		}
	});
	$scope('#save-add-product-button').on('click', function (e) 
	{
		e.preventDefault();

		if ($scope('.combobox-menu-visible').length) 
		{
			return;
		}

		if ($scope('#add-product-form')[0].checkValidity() === false) // There is at least one validation error
		{
			return false;
		}

		const jsonData = $scope('#add-product-form').serializeJSON();
		jsonData.day = $scope('#day').val();
		delete jsonData.display_amount;
		jsonData.product_amount = jsonData.amount;
		delete jsonData.amount;
		jsonData.product_qu_id = jsonData.qu_id;
		delete jsonData.qu_id;

		if (Grocy.IsMealPlanEntryEditAction) 
		{
			Grocy.Api.Put('objects/meal_plan/' + Grocy.MealPlanEntryEditObjectId.toString(), jsonData, function (result) 
			{
				window.location.reload();
			}, function (xhr) 
			{
				Grocy.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			});
		}
		else 
		{
			Grocy.Api.Post('objects/meal_plan', jsonData, function (result) 
			{
				window.location.reload();
			}, function (xhr) 
			{
				Grocy.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			});
		}
	});
	$scope('#add-recipe-form input').keydown(function (event) 
	{
		if (event.keyCode === 13) // Enter
		{
			event.preventDefault();

			if ($scope('#add-recipe-form')[0].checkValidity() === false) // There is at least one validation error
			{
				return false;
			}
			else 
			{
				$scope('#save-add-recipe-button').click();
			}
		}
	});
	$scope('#add-product-form input').keydown(function (event) 
	{
		if (event.keyCode === 13) // Enter
		{
			event.preventDefault();

			if ($scope('#add-product-form')[0].checkValidity() === false) // There is at least one validation error
			{
				return false;
			}
			else 
			{
				$scope('#save-add-product-button').click();
			}
		}
	});
	top.on('keydown', '#servings', function (event) 
	{
		if (event.key === 13) // Enter
		{
			event.preventDefault();

			if ($scope('#add-recipe-form')[0].checkValidity() === false) // There is at least one validation error
			{
				return false;
			}
			else 
			{
				$scope('#save-add-recipe-button').click();
			}
		}
	});
	top.on('click', '.recipe-order-missing-button', function (e) 
	{
		// Remove the focus from the current button
		// to prevent that the tooltip stays until clicked anywhere else
		document.activeElement.blur();
		const objectName = $scope(e.currentTarget).attr('data-recipe-name');
		const objectId = $scope(e.currentTarget).attr('data-recipe-id');
		const button = $(this);
		const servings = $scope(e.currentTarget).attr('data-mealplan-servings');
		bootbox.confirm({
			message: __t('Are you sure to put all missing ingredients for recipe "%s" on the shopping list?', objectName),
			closeButton: false,
			buttons: {
				confirm: {
					label: __t('Yes'),
					className: 'btn-success'
				},
				cancel: {
					label: __t('No'),
					className: 'btn-danger'
				}
			},
			callback: function (result) 
			{
				if (result === true) 
				{
					Grocy.FrontendHelpers.BeginUiBusy(); // Set the recipes desired_servings so that the "recipes resolved"-views resolve correctly based on the meal plan entry servings

					Grocy.Api.Put('objects/recipes/' + objectId, {
						desired_servings: servings
					}, function (result) 
					{
						Grocy.Api.Post('recipes/' + objectId + '/add-not-fulfilled-products-to-shoppinglist', {}, function (result) 
						{
							if (button.attr('data-recipe-type') == 'normal') 
							{
								button.addClass('disabled');
								Grocy.FrontendHelpers.EndUiBusy();
							}
							else 
							{
								window.location.reload();
							}
						}, function (xhr) 
						{
							Grocy.FrontendHelpers.EndUiBusy();
							console.error(xhr);
						});
					}, function (xhr) 
					{
						console.error(xhr);
					});
				}
			}
		});
	});
	top.on('click', '.product-consume-button', function (e) 
	{
		e.preventDefault(); // Remove the focus from the current button
		// to prevent that the tooltip stays until clicked anywhere else

		document.activeElement.blur();
		Grocy.FrontendHelpers.BeginUiBusy();
		const productId = $scope(e.currentTarget).attr('data-product-id');
		const consumeAmount = parseFloat($scope(e.currentTarget).attr('data-product-amount'));
		Grocy.Api.Post('stock/products/' + productId + '/consume', {
			amount: consumeAmount,
			spoiled: false
		}, function (bookingResponse) 
		{
			Grocy.Api.Get('stock/products/' + productId, function (result) 
			{
				const toastMessage = __t('Removed %1$s of %2$s from stock', consumeAmount.toString() + ' ' + __n(consumeAmount, result.quantity_unit_stock.name, result.quantity_unit_stock.name_plural), result.product.name) + '<br><a class="btn btn-secondary btn-sm mt-2" href="#" onclick="Grocy.UndoStockTransaction(\'' + bookingResponse[0].transaction_id + '\')"><i class="fas fa-undo"></i> ' + __t('Undo') + '</a>';
				Grocy.FrontendHelpers.EndUiBusy();
				toastr.success(toastMessage);
				window.location.reload();
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
	top.on('click', '.recipe-consume-button', function (e) 
	{
		// Remove the focus from the current button
		// to prevent that the tooltip stays until clicked anywhere else
		document.activeElement.blur();
		const objectName = $scope(e.currentTarget).attr('data-recipe-name');
		const objectId = $scope(e.currentTarget).attr('data-recipe-id');
		const servings = $scope(e.currentTarget).attr('data-mealplan-servings');
		bootbox.confirm({
			message: __t('Are you sure to consume all ingredients needed by recipe "%s" (ingredients marked with "only check if any amount is in stock" will be ignored)?', objectName),
			closeButton: false,
			buttons: {
				confirm: {
					label: __t('Yes'),
					className: 'btn-success'
				},
				cancel: {
					label: __t('No'),
					className: 'btn-danger'
				}
			},
			callback: function (result) 
			{
				if (result === true) 
				{
					Grocy.FrontendHelpers.BeginUiBusy(); // Set the recipes desired_servings so that the "recipes resolved"-views resolve correctly based on the meal plan entry servings

					Grocy.Api.Put('objects/recipes/' + objectId, {
						desired_servings: servings
					}, function (result) 
					{
						Grocy.Api.Post('recipes/' + objectId + '/consume', {}, function (result) 
						{
							Grocy.FrontendHelpers.EndUiBusy();
							toastr.success(__t('Removed all ingredients of recipe "%s" from stock', objectName));
							window.location.reload();
						}, function (xhr) 
						{
							toastr.warning(__t('Not all ingredients of recipe "%s" are in stock, nothing removed', objectName));
							Grocy.FrontendHelpers.EndUiBusy();
							console.error(xhr);
						});
					}, function (xhr) 
					{
						console.error(xhr);
					});
				}
			}
		});
	});
	top.on('click', '.recipe-popup-button', function (e) 
	{
		// Remove the focus from the current button
		// to prevent that the tooltip stays until clicked anywhere else
		document.activeElement.blur();
		const objectId = $scope(e.currentTarget).attr('data-recipe-id');
		const servings = $scope(e.currentTarget).attr('data-mealplan-servings'); // Set the recipes desired_servings so that the "recipes resolved"-views resolve correctly based on the meal plan entry servings

		Grocy.Api.Put('objects/recipes/' + objectId, {
			desired_servings: servings
		}, function (result) 
		{
			bootbox.dialog({
				message: '<iframe height="650px" class="embed-responsive" src="' + U('/recipes?embedded&recipe=') + objectId + '#fullscreen"></iframe>',
				size: 'extra-large',
				backdrop: true,
				closeButton: false,
				buttons: {
					cancel: {
						label: __t('Close'),
						className: 'btn-secondary responsive-button',
						callback: function () 
						{
							bootbox.hideAll();
						}
					}
				}
			});
		}, function (xhr) 
		{
			console.error(xhr);
		});
	});
	$(window).one('resize', function () 
	{
		// Automatically switch the calendar to "basicDay" view on small screens
		// and to "basicWeek" otherwise
		if (viewport.width() < 768) 
		{
			calendar.changeView('dayGridDay');
		}
		else 
		{
			calendar.changeView('dayGridWeek');
		}
	});
	productpicker.GetPicker().on('change', function (e) 
	{
		const productId = $scope(e.target).val();

		if (productId) 
		{
			Grocy.Api.Get('stock/products/' + productId, function (productDetails) 
			{
				productamountpicker.Reload(productDetails.product.id, productDetails.quantity_unit_stock.id);
				$scope('#display_amount').val(1);
				RefreshLocaleNumberInput();
				$scope('.input-group-productamountpicker').trigger('change');
				$scope('#display_amount').focus();
				$scope('#display_amount').select();
				$scope('.input-group-productamountpicker').trigger('change');
				Grocy.FrontendHelpers.ValidateForm('add-product-form');
			}, function (xhr) 
			{
				console.error(xhr);
			});
		}
	});
	recipepicker.GetPicker().on('change', function (e) 
	{
		const recipeId = $scope(e.target).val();

		if (recipeId) 
		{
			Grocy.Api.Get('objects/recipes/' + recipeId, function (recipe) 
			{
				$scope('#recipe_servings').val(recipe.base_servings);
				$scope('#recipe_servings').focus();
				$scope('#recipe_servings').select();
			}, function (xhr) 
			{
				console.error(xhr);
			});
		}
	});
}

export { mealplanView };