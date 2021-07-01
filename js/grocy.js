// todo: axe some stuff from here for better tree-shaking. also brr, side effects.
import './vendor';
import { GrocyApi } from './lib/api';
import { RefreshContextualTimeago } from './configs/timeago';
import { setDatatableDefaults } from './configs/datatable';
import { GrocyFrontendHelpers } from './helpers/frontend';
import { setInitialGlobalState } from './configs/globalstate';
import { WakeLock } from './lib/WakeLock';
import { UISound } from './lib/UISound';
import { Nightmode } from './lib/nightmode';
import { HeaderClock } from './helpers/clock';
import { BoolVal } from './helpers/extensions';
import Translator from 'gettext-translator';
import { register as timeagoRegisterLang } from 'timeago.js';
import * as timeagoLangs from 'timeago.js/lib/lang';
import { WindowMessageBag } from './helpers/messagebag';
import * as components from './components';
import * as uuid from 'uuid';
import * as views from './viewjs';
import { GrocyProxy } from './lib/proxy'; //import { $ } from 'jquery';

import moment from 'moment';
import './helpers/string';

class GrocyClass 
{
	constructor(config) 
	{
		// set up properties from config
		this.UserSettings = config.UserSettings;
		this.Mode = config.Mode;
		this.UserId = config.UserId;
		this.ActiveNav = config.ActiveNav;
		this.CalendarFirstDayOfWeek = config.CalendarFirstDayOfWeek;
		this.DatabaseChangedTime = null;
		this.IdleTime = 0;
		this.BaseUrl = config.BaseUrl;
		this.CurrentUrlRelative = config.CurrentUrlRelative;
		this.Currency = config.Currency;
		this.FeatureFlags = config.FeatureFlags;
		this.QuantityUnits = config.QuantityUnits;
		this.QuantityUnitConversionsResolved = config.QuantityUnitConversionsResolved || [];
		this.QuantityUnitEditFormRedirectUri = config.QuantityUnitEditFormRedirectUri;
		this.MealPlanFirstDayOfWeek = config.MealPlanFirstDayOfWeek;
		this.EditMode = config.EditMode;
		this.EditObjectId = config.EditObjectId;
		this.DefaultMinAmount = config.DefaultMinAmount;
		this.UserPictureFileName = config.UserPictureFileName;
		this.EditObjectParentId = config.EditObjectParentId;
		this.EditObjectParentName = config.EditObjectParentName;
		this.EditObject = config.EditObject;
		this.EditObjectProduct = config.EditObjectProduct;
		this.EditObjectProductId = config.EditObjectProductId;
		this.RecipePictureFileName = config.RecipePictureFileName;
		this.InstructionManualFileNameName = config.InstructionManualFileNameName;
		this.Locale = config.Locale;
		this.fullcalendarEventSources = config.fullcalendarEventSources;
		this.internalRecipes = config.internalRecipes;
		this.recipesResolved = config.recipesResolved;
		this.Version = config.Version;
		this.Components = {};
		this.initComponents = [];
		this.RootGrocy = null;
		this.documentReady = false;
		this.preloadViews = []; // Init some classes

		this.Api = new GrocyApi(this); // Merge dynamic and static locales

		let strings = this.Api.LoadLanguageSync(this.Locale);

		if (strings == null) 
		{
			console.error('Could not load locale ' + this.Locale + ', fallback to en.');
			strings = this.Api.LoadLanguageSync('en');
		}

		Object.assign(strings.messages[''], config.GettextPo.messages['']);
		this.strings = strings;
		this.Translator = new Translator(strings);
		this.FrontendHelpers = new GrocyFrontendHelpers(this, this.Api);
		this.WakeLock = new WakeLock(this);
		this.UISound = new UISound(this);
		this.Nightmode = new Nightmode(this);
		this.HeaderClock = new HeaderClock(this);
		const self = this; // defer some stuff until DOM content has loaded
		// TODO: make this a dynamic import, like seriously.

		if (Object.prototype.hasOwnProperty.call(timeagoLangs, this.translate('timeago_locale'))) 
		{
			timeagoRegisterLang(this.translate('timeago_locale'), timeagoLangs[this.translate('timeago_locale')]);
		}

		if (this.translate('summernote_locale').trim() != "" && this.translate('summernote_locale') != 'x') 
		{
			$.getScript(this.FormatUrl('/js/locales/summernote/summernote-' + this.translate('summernote_locale') + '.js?v=' + this.Verison));
		}

		if (this.translate('bootstrap-select_locale').trim() != "" && this.translate('bootstrap-select_locale') != 'x') 
		{
			$.getScript(this.FormatUrl('/js/locales/bootstrap-select/defaults-' + this.translate('bootstrap-select_locale') + '.js?v=' + this.Version));
		}

		document.addEventListener('DOMContentLoaded', function () 
		{
			self.Nightmode.Initialize();
			self.Nightmode.StartWatchdog();
		});
		window.addEventListener('load', function () 
		{
			if (self.documentReady) return; // DB Changed Handling

			if (self.UserId !== -1) 
			{
				self.Api.Get('system/db-changed-time', function (result) 
				{
					self.DatabaseChangedTime = moment(result.changed_time);
					setInterval(self.CheckDatabase(), 60000); // Increase the idle time once every second
					// On any interaction it will be reset to 0 (see above)

					setInterval(self.IncrementIdleTime(), 1000);
				}, function (xhr) 
				{
					console.error(xhr);
				});
			}
		}); // save the config

		this.config = config;

		if (!this.CalendarFirstDayOfWeek.isEmpty()) 
		{
			moment.updateLocale(moment.locale(), {
				week: {
					dow: this.CalendarFirstDayOfWeek
				}
			});
		}
	}

	static createSingleton(config, view) 
	{
		if (window.Grocy === undefined) 
		{
			const grocy = new GrocyClass(config);
			window.Grocy = grocy; // Check if the database has changed once a minute

			window.onmousemove = grocy.ResetIdleTime;
			window.onmousedown = grocy.ResetIdleTime;
			window.onclick = grocy.ResetIdleTime;
			window.onscroll = grocy.ResetIdleTime;
			window.onkeypress = grocy.ResetIdleTime;

			window.U = path => grocy.FormatUrl(path); // Some Helpers still need this


			window.__t = (str, ...placeholderValues) => grocy.translate(str, ...placeholderValues);

			setInitialGlobalState(grocy);
			RefreshContextualTimeago();
			setDatatableDefaults(grocy); // load the view

			grocy.LoadView(view);
		}

		return window.Grocy;
	}

	translate(text, ...placeholderValues) 
	{
		this.logTranslation(text);
		return this.Translator.__(text, ...placeholderValues);
	}

	translaten(number, singularForm, pluralForm) 
	{
		this.logTranslation(singularForm);
		return this.Translator.n__(singularForm, pluralForm, number, number);
	}

	logTranslation(key) 
	{
		if (this.Mode === 'dev') 
		{
			if (!(key in this.strings.messages[''])) 
			{
				this.Api.Post('system/log-missing-localization', {
					"text": key
				});
			}
		}
	}

	FormatUrl(relativePath) 
	{
		return this.BaseUrl.replace(/\/$/, '') + relativePath;
	} // If a change is detected, reload the current page, but only if already idling for at least 50 seconds,
	// when there is no unsaved form data and when the user enabled auto reloading


	CheckDatabase() 
	{
		const self = this;
		this.Api.Get('system/db-changed-time', function (result) 
		{
			const newDbChangedTime = moment(result.changed_time);

			if (newDbChangedTime.isAfter(self.DatabaseChangedTime)) 
			{
				if (self.IdleTime >= 50) 
				{
					if (BoolVal(self.UserSettings.auto_reload_on_db_change) && $('form.is-dirty').length === 0 && !$('body').hasClass('fullscreen-card')) 
					{
						window.location.reload();
					}
				}

				self.DatabaseChangedTime = newDbChangedTime;
			}
		}, function (xhr) 
		{
			console.error(xhr);
		});
	}

	ResetIdleTime() 
	{
		this.IdleTime = 0;
	}

	IncrementIdleTime() 
	{
		this.IdleTime += 1;
	}

	Use(componentName, scope = null) 
	{
		const scopeName = scope || ''; // initialize Components only once per scope

		if (this.initComponents.find(elem => elem === componentName + scopeName)) 
		{
			return this.Components[componentName + scopeName];
		}

		if (Object.prototype.hasOwnProperty.call(components, componentName)) 
		{
			// add-then-init to resolve circular dependencies
			this.initComponents.push(componentName + scopeName);
			const component = new components[componentName](this, scope);
			this.Components[componentName + scopeName] = component;
			return component;
		}
		else 
		{
			console.error('Unable to find component ' + componentName);
		}
	}

	LoadView(viewName, scope = null, grocy = null) 
	{
		if (Object.prototype.hasOwnProperty.call(views, viewName + 'View')) 
		{
			if (scope != null && grocy == null) 
			{
				console.warn('scoped view set but non-scoped grocy is used. Results are undefined!');
			}

			if (scope == null) 
			{
				grocy = this;
			}

			views[viewName + 'View'](grocy, scope);
		}
		else 
		{
			console.error('Could not load view ' + viewName + ', not loaded yet.');
		}
	}

	PreloadView(viewName, loadCSS = false, cb = () => {}) 
	{
		if (loadCSS) 
		{
			$('<link/>', {
				rel: 'stylesheet',
				type: 'text/css',
				href: this.FormatUrl('/css/viewcss/' + viewName + '.css')
			}).appendTo('head');
		}
	}

	OpenSubView(link) 
	{
		const self = this;
		console.log('loading subview ' + link);
		$.ajax({
			dataType: 'json',
			url: link,
			success: data => 
			{
				const scopeId = uuid.v4();
				const grocyProxy = new GrocyProxy(this, '#' + scopeId, data.config, link);
				const proxy = new Proxy(grocyProxy, {
					get: function (target, prop, receiver) 
					{
						if (prop in grocyProxy) 
						{
							return grocyProxy[prop];
						}
						else 
						{
							return self[prop];
						}
					},
					apply: function (target, thisArg, args) 
					{
						if (target in grocyProxy) 
						{
							return grocyProxy[target](...args);
						}
						else 
						{
							return self[target](...args);
						}
					},
					ownKeys: function (oTarget, sKey) 
					{
						const root = Reflect.ownKeys(self);
						Array.concat(root, Reflect.ownKeys(grocyProxy));
						return root;
					},
					has: function (oTarget, sKey) 
					{
						return sKey in self || sKey in grocyProxy;
					}
				});
				const dialog = bootbox.dialog({
					message: '<div class="embedded" id="' + scopeId + '">' + data.template + '</div>',
					size: 'large',
					backdrop: true,
					closeButton: false,
					buttons: {
						cancel: {
							label: self.translate('Close'),
							className: 'btn-secondary responsive-button',
							callback: function () 
							{
								dialog.modal('hide');
							}
						}
					},
					onShow: e => 
					{
						if ($(e.target).find('#' + scopeId).length) 
						{
							// dialog div is alive, init view.
							// this occurs before the view is shown.
							grocyProxy.Initialize(proxy);
							self.LoadView(data.viewJsName, '#' + scopeId, proxy);
						}
					},
					onShown: e => 
					{
						if ($(e.target).find('#' + scopeId).length) 
						{
							grocyProxy.FrontendHelpers.OnShown();
						}
					},
					onHide: e => 
					{
						if ($(e.target).find('#' + scopeId).length) 
						{
							grocyProxy.Unload();
						}
					},
					onHidden: e => 
					{
						if ($(e.target).find('#' + scopeId).length) 
						{
							self.FrontendHelpers.EndUiBusy();
						}
					}
				});
			},
			error: (xhr, text, data) => 
			{
				console.error(text);
			}
		});
	}

	RegisterUnload(cb) {}

	Unload() 
	{// root grocy instances never get unloaded.
	}

	UndoStockBooking(bookingId) 
	{
		const self = this;
		this.Api.Post('stock/bookings/' + bookingId.toString() + '/undo', {}, function () 
		{
			toastr.success(self.translate('Booking successfully undone'));
			self.Api.Get('stock/transactions/' + bookingId.toString(), function (result) 
			{
				if (result[0].product_id !== undefined) 
				{
					window.postMessage(WindowMessageBag('ProductChanged', result[0].product_id), self.BaseUrl);
				}
			}, function (xhr) 
			{
				console.error(xhr);
			});
		}, function (xhr) 
		{
			console.error(xhr);
		});
	}

	UndoStockTransaction(transactionId) 
	{
		const self = this;
		this.Api.Post('stock/transactions/' + transactionId.toString() + '/undo', {}, function () 
		{
			toastr.success(self.translate('Transaction successfully undone'));
			self.Api.Get('stock/transactions/' + transactionId.toString(), function (result) 
			{
				if (result[0].product_id !== undefined) 
				{
					window.postMessage(WindowMessageBag('ProductChanged', result[0].product_id), self.BaseUrl);
				}
			}, function (xhr) 
			{
				console.error(xhr);
			});
		}, function (xhr) 
		{
			console.error(xhr);
		});
	}

	UndoChoreExecution(executionId) 
	{
		const self = this;
		this.Api.Post('chores/executions/' + executionId.toString() + '/undo', {}, function () 
		{
			toastr.success(self.translate('Chore execution successfully undone'));
		}, function (xhr) 
		{
			console.error(xhr);
		});
	}

	UndoChargeCycle(chargeCycleId) 
	{
		const self = this;
		this.Api.Post('batteries/charge-cycles/' + chargeCycleId.toString() + '/undo', {}, function () 
		{
			toastr.success(self.translate('Charge cycle successfully undone'));
		}, function (xhr) 
		{
			console.error(xhr);
		});
	}

	UndoStockBookingEntry(bookingId, stockRowId) 
	{
		const self = this;
		this.Api.Post('stock/bookings/' + bookingId.toString() + '/undo', {}, function () 
		{
			window.postMessage(WindowMessageBag('StockEntryChanged', stockRowId), self.BaseUrl);
			toastr.success(self.translate('Booking successfully undone'));
		}, function (xhr) 
		{
			console.error(xhr);
		});
	}

	GetUriParam(key) 
	{
		const currentUri = window.location.search.substring(1);
		const vars = currentUri.split('&');

		for (let i = 0; i < vars.length; i++) 
		{
			const currentParam = vars[i].split('=');

			if (currentParam[0] === key) 
			{
				return currentParam[1] === undefined ? true : decodeURIComponent(currentParam[1]);
			}
		}

		return undefined;
	}

	UpdateUriParam(key, value) 
	{
		const queryParameters = new URLSearchParams(window.location.search);
		queryParameters.set(key, value);
		window.history.replaceState({}, '', decodeURIComponent(`${window.location.pathname}?${queryParameters}`));
	}

	RemoveUriParam(key) 
	{
		const queryParameters = new URLSearchParams(window.location.search);
		queryParameters.delete(key);
		window.history.replaceState({}, '', decodeURIComponent(`${window.location.pathname}?${queryParameters}`));
	}

} // also set on the Window object, just because.


window.GrocyClass = GrocyClass;
export default GrocyClass;