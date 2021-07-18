import { Module } from "vuex";
import { RootState } from '../interfaces';
import { LOAD_CONFIG, UPDATE_USER_SETTING_NIGHTMODE, UPDATE_USER_SETTING_AUTORELOAD, UPDATE_USER_SETTING_FULLSCREENLOCK, UPDATE_USER_SETTING_SCREENLOCK, UPDATE_USER_SETTING_HEADERCLOCK, UPDATE_USER_SETTING_AUTONIGHTMODE, UPDATE_USER_SETTING_AUTONIGHTMODE_RANGE, UPDATE_USER_SETTING_AUTONIGHTMODE_INVERT, UPDATE_USER_SETTING_UNSAVED_AUTONIGHTMODE_RANGE, UPDATE_USER_SETTING_PREFERRED_BARCODE_CAMERA, DELETE_USER_SETTING_PREFERRED_BARCODE_CAMERA } from "../mutations";
import { SAVE_USER_SETTING_NIGHTMODE, SAVE_USER_SETTING_AUTORELOAD, SAVE_USER_SETTING_FULLSCREENLOCK, SAVE_USER_SETTING_SCREENLOCK, SAVE_USER_SETTING_HEADERCLOCK, SAVE_USER_SETTING_AUTONIGHTMODE, SAVE_USER_SETTING_AUTONIGHTMODE_RANGE, SAVE_USER_SETTING_AUTONIGHTMODE_INVERT} from "../actions";
import api from '../../api';

// removed:
// datatables_* foo.

export interface UserSettingsState {
	NightMode: boolean,
	AutoNightMode: boolean,
	AutoNightModeRange: Array<number>,
	AutoNightModeInvert: boolean,
	KeepScreenOn: boolean,
	KeepScreenOnWhenFullscreen: boolean,
	PresetProductLocation: number,
	PresetProductGroup: number,
	PresetProductQuId: number,
	DecimalPlacesAmount: number,
	DecimalPlacesPrices: number,
	DueSoonDays: number,
	DefaultPurchaseAmount: number,
	DefaultConsumeAmount: number,
	DefaultConsumeAmountUsesQuickConsumeAmount: boolean,
	ScanModeConsume: boolean,
	ScanModePurchase: boolean,
	ShowIconWhenProductOnShoppinglist: boolean,
	ShowPurchasedDateOnPurchase: boolean,
	ShowWarningOnPurchaseWhenDueDateIsEarlierThanNext: boolean,
	ShoppingListToStockWorkflowAutoSubmit: boolean,
	ShoppingListShowCalendar: boolean,
	RecipeIngredientsGroupByProductGroup: boolean,
	ChoresDueSoonDays: number,
	BatteriesDueSoonDays: number,
	TasksDueSoonDays: number,
	AutoReload: boolean,
	HeaderClock: boolean,
	QuaggaWorkers: number,
	QuaggaHalfsample: boolean,
	QuaggaPatchsize: string,
	QuaggaFrequency: number,
	QuaggaDebug: boolean,
	AutoLightTorch: boolean,
	PreferredBarcodeCamera: string | null,

	// For throtteling
	UnsavedAutoNightModeRange: Array<number>
}
const STORAGE_PREFERRED_CAMERA = 'cameraId';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ensureBool(whatever: any, fallback  = false): boolean
{
	if (typeof whatever === "string") 
	{
		return whatever === "1";
	}
	if (typeof whatever === "boolean") 
	{
		return whatever;
	}
	if (typeof whatever === "number") 
	{
		return whatever > 0;
	}

	return fallback;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ensureInt(whatever: any, fallback  = 0): number
{
	if (typeof whatever === "string") 
	{
		return parseInt(whatever);
	}
	if (typeof whatever === "number") 
	{
		return whatever;
	}
	
	return fallback;
}

const UserSettings: Module<UserSettingsState, RootState> = {
	state(): UserSettingsState
	{
		return {
			NightMode: false,
			AutoNightMode: true,
			AutoNightModeRange: [8.0, 20.0],
			UnsavedAutoNightModeRange: [8.0, 20.0],
			AutoNightModeInvert: true,
			KeepScreenOn: false,
			KeepScreenOnWhenFullscreen: true,
			PresetProductLocation: -1,
			PresetProductGroup: -1,
			PresetProductQuId: -1,
			DecimalPlacesAmount: 4,
			DecimalPlacesPrices: 2,
			DueSoonDays: 5,
			DefaultPurchaseAmount: 0,
			DefaultConsumeAmount: 1,
			DefaultConsumeAmountUsesQuickConsumeAmount: true,
			ScanModeConsume: false,
			ScanModePurchase: false,
			ShowIconWhenProductOnShoppinglist: true,
			ShowPurchasedDateOnPurchase: false,
			ShowWarningOnPurchaseWhenDueDateIsEarlierThanNext: true,
			ShoppingListToStockWorkflowAutoSubmit: false,
			ShoppingListShowCalendar: false,
			RecipeIngredientsGroupByProductGroup: false,
			ChoresDueSoonDays: 5,
			BatteriesDueSoonDays: 5,
			TasksDueSoonDays: 5,
			AutoReload: true,
			HeaderClock: false,
			QuaggaWorkers: 4,
			QuaggaHalfsample: false,
			QuaggaPatchsize: "medium",
			QuaggaFrequency: 10,
			QuaggaDebug: true,
			AutoLightTorch: false,
			PreferredBarcodeCamera: null,
		};
	},
	mutations: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		[LOAD_CONFIG](state, newConfig: any)
		{
			state.NightMode = ensureBool(newConfig.User.Settings.night_mode_enabled);
			state.AutoNightMode = ensureBool(newConfig.User.Settings.auto_night_mode_enabled);

			const from: Array<string> = newConfig.User.Settings.auto_night_mode_time_range_from.split(":");
			const to: Array<string> = newConfig.User.Settings.auto_night_mode_time_range_to.split(":");
			let start: number, end: number;
			start = parseFloat(from[0]) + parseFloat(from[1]) / 60;
			end = parseFloat(to[0]) + parseFloat(to[1]) / 60;
			if (end < start)
			{
				const tmp = start;
				start = end;
				end = tmp;
			}

			state.AutoNightModeRange = [start, end];
			state.UnsavedAutoNightModeRange = [start, end];
			state.AutoNightModeInvert = ensureBool(newConfig.User.Settings.auto_night_mode_time_range_goes_over_midnight);
			state.KeepScreenOn = newConfig.User.Settings.keep_screen_on;
			state.KeepScreenOnWhenFullscreen = newConfig.User.Settings.keep_screen_on_when_fullscreen_card;
			state.PresetProductLocation = newConfig.User.Settings.product_presets_location_id;
			state.PresetProductGroup = newConfig.User.Settings.product_presets_product_group_id;
			state.PresetProductQuId = newConfig.User.Settings.product_presets_qu_id;
			state.DecimalPlacesAmount = newConfig.User.Settings.stock_decimal_places_amounts;
			state.DecimalPlacesPrices = newConfig.User.Settings.stock_decimal_places_prices;
			state.DueSoonDays = newConfig.User.Settings.stock_due_soon_days;
			state.DefaultPurchaseAmount = newConfig.User.Settings.stock_default_purchase_amount;
			state.DefaultConsumeAmount = ensureInt(newConfig.User.Settings.stock_default_consume_amount);
			state.DefaultConsumeAmountUsesQuickConsumeAmount = ensureBool(newConfig.User.Settings.stock_default_consume_amount_use_quick_consume_amount);
			state.ScanModeConsume = ensureBool(newConfig.User.Settings.scan_mode_consume_enabled);
			state.ScanModePurchase = ensureBool(newConfig.User.Settings.scan_mode_purchase_enabled);
			state.ShowIconWhenProductOnShoppinglist = newConfig.User.Settings.show_icon_on_stock_overview_page_when_product_is_on_shopping_list;
			state.ShowPurchasedDateOnPurchase = newConfig.User.Settings.show_purchased_date_on_purchase;
			state.ShowWarningOnPurchaseWhenDueDateIsEarlierThanNext = newConfig.User.Settings.show_warning_on_purchase_when_due_date_is_earlier_than_next;
			state.ShoppingListToStockWorkflowAutoSubmit = newConfig.User.Settings.shopping_list_to_stock_workflow_auto_submit_when_prefilled;
			state.ShoppingListShowCalendar = newConfig.User.Settings.shopping_list_show_calendar;
			state.RecipeIngredientsGroupByProductGroup = newConfig.User.Settings.recipe_ingredients_group_by_product_group;
			state.ChoresDueSoonDays = newConfig.User.Settings.chores_due_soon_days;
			state.BatteriesDueSoonDays = newConfig.User.Settings.batteries_due_soon_days;
			state.TasksDueSoonDays = newConfig.User.Settings.tasks_due_soon_days;
			state.AutoReload = newConfig.User.Settings.auto_reload_on_db_change;
			state.HeaderClock = ensureBool(newConfig.User.Settings.show_clock_in_header);
			state.QuaggaWorkers = newConfig.User.Settings.quagga2_numofworkers;
			state.QuaggaHalfsample = newConfig.User.Settings.quagga2_halfsample;
			state.QuaggaPatchsize = newConfig.User.Settings.quagga2_patchsize;
			state.QuaggaFrequency = newConfig.User.Settings.quagga2_frequency;
			state.QuaggaDebug = newConfig.User.Settings.quagga2_debug;

			if (window !== undefined)
			{
				const storage = window.localStorage;
				state.PreferredBarcodeCamera = storage.getItem(STORAGE_PREFERRED_CAMERA);
			}
		},
		[UPDATE_USER_SETTING_PREFERRED_BARCODE_CAMERA](state, newValue: string)
		{
			state.PreferredBarcodeCamera = newValue;
			
			if (window !== undefined)
			{
				const storage = window.localStorage;
				storage.setItem(STORAGE_PREFERRED_CAMERA, newValue);
			}
		},
		[DELETE_USER_SETTING_PREFERRED_BARCODE_CAMERA](state)
		{
			state.PreferredBarcodeCamera = null;

			if (window !== undefined)
			{
				const storage = window.localStorage;
				storage.removeItem(STORAGE_PREFERRED_CAMERA);
			}
		},
		[UPDATE_USER_SETTING_NIGHTMODE](state, newValue: boolean)
		{
			state.NightMode = newValue;
		},
		[UPDATE_USER_SETTING_AUTORELOAD](state, newValue: boolean)
		{
			state.AutoReload = newValue;
		},
		[UPDATE_USER_SETTING_FULLSCREENLOCK](state, newValue: boolean)
		{
			state.KeepScreenOnWhenFullscreen = newValue;
		},
		[UPDATE_USER_SETTING_AUTONIGHTMODE_RANGE](state, newValue: Array<number>)
		{
			state.AutoNightModeRange[0] = newValue[0];
			state.AutoNightModeRange[1] = newValue[1];
		},
		[UPDATE_USER_SETTING_AUTONIGHTMODE_INVERT](state, newValue: boolean)
		{
			state.AutoNightModeInvert = newValue;
		},
		[UPDATE_USER_SETTING_AUTONIGHTMODE](state, newValue: boolean)
		{
			state.AutoNightMode = newValue;
		},
		[UPDATE_USER_SETTING_FULLSCREENLOCK](state, newValue: boolean)
		{
			state.KeepScreenOnWhenFullscreen = newValue;
		},
		[UPDATE_USER_SETTING_SCREENLOCK](state, newValue: boolean)
		{
			state.KeepScreenOn = newValue;
		},
		[UPDATE_USER_SETTING_HEADERCLOCK](state, newValue: boolean)
		{
			state.HeaderClock = newValue;
		},
		[UPDATE_USER_SETTING_UNSAVED_AUTONIGHTMODE_RANGE](state, newValue: Array<number>)
		{
			state.UnsavedAutoNightModeRange[0] = newValue[0];
			state.UnsavedAutoNightModeRange[1] = newValue[1];
		}
	},
	actions: {
		[SAVE_USER_SETTING_NIGHTMODE](state, newValue: boolean)
		{
			const oldValue = state.state.NightMode;
			state.commit(UPDATE_USER_SETTING_NIGHTMODE, newValue);

			return api.Settings.SaveUserSetting('night_mode_enabled', newValue).catch(() =>
			{
				state.commit(UPDATE_USER_SETTING_NIGHTMODE, oldValue);
			});
		},
		[SAVE_USER_SETTING_AUTONIGHTMODE](state, newValue: boolean)
		{
			const oldValue = state.state.AutoNightMode;
			state.commit(UPDATE_USER_SETTING_AUTONIGHTMODE, newValue);
			return api.Settings.SaveUserSetting('auto_night_mode_enabled', newValue).catch(() =>
			{
				state.commit(UPDATE_USER_SETTING_AUTONIGHTMODE, oldValue);
			});
		},
		[SAVE_USER_SETTING_AUTONIGHTMODE_RANGE](state, newValue: Array<number> | null)
		{
			let target: Array<number>;

			if (newValue != null)
				target = newValue;
			else
				target = state.state.UnsavedAutoNightModeRange;

			const oldValue = state.state.AutoNightModeRange;
			state.commit(UPDATE_USER_SETTING_AUTONIGHTMODE_RANGE, target);

			// some processing is required for the API.
			const fromHours = Math.floor(target[0]);
			const fromMinutes = Math.floor((target[0] - fromHours) * 60);
			const toHours = Math.floor(target[1]);
			const toMinutes = Math.floor((target[1] - toHours) * 60);
			const fromString = `${fromHours}:${fromMinutes}`;
			const toStr = `${toHours}:${toMinutes}`;

			// requires two calls. if either of them fail, restore old state.
			const afrom = api.Settings.SaveUserSetting('auto_night_mode_time_range_from', fromString).catch(() =>
			{
				state.commit(UPDATE_USER_SETTING_AUTONIGHTMODE_RANGE, oldValue);
			});
			const ato = api.Settings.SaveUserSetting('auto_night_mode_time_range_to', toStr).catch(() =>
			{
				state.commit(UPDATE_USER_SETTING_AUTONIGHTMODE_RANGE, oldValue);
			});

			return Promise.all([afrom, ato]);
		},
		[SAVE_USER_SETTING_AUTONIGHTMODE_INVERT](state, newValue: boolean)
		{
			const oldValue = state.state.AutoNightModeInvert;
			state.commit(UPDATE_USER_SETTING_AUTONIGHTMODE_INVERT, newValue);
			return api.Settings.SaveUserSetting('auto_night_mode_time_range_goes_over_midnight', newValue).catch(() =>
			{
				state.commit(UPDATE_USER_SETTING_AUTONIGHTMODE_INVERT, oldValue);
			});
		},
		[SAVE_USER_SETTING_AUTORELOAD](state, newValue: boolean)
		{
			const oldValue = state.state.AutoReload;
			state.commit(UPDATE_USER_SETTING_AUTORELOAD, newValue);
			api.Settings.SaveUserSetting('auto_reload_on_db_change', newValue).catch(() =>
			{
				state.commit(UPDATE_USER_SETTING_AUTORELOAD, oldValue);
			});
		},
		[SAVE_USER_SETTING_FULLSCREENLOCK](state, newValue: boolean)
		{
			const oldValue = state.state.KeepScreenOnWhenFullscreen;
			state.commit(UPDATE_USER_SETTING_FULLSCREENLOCK, newValue);
			api.Settings.SaveUserSetting('keep_screen_on_when_fullscreen_card', newValue).catch(() => 
			{
				state.commit(UPDATE_USER_SETTING_FULLSCREENLOCK, oldValue);
			});
		},
		[SAVE_USER_SETTING_SCREENLOCK](state, newValue: boolean)
		{
			const oldValue = state.state.AutoReload;
			state.commit(UPDATE_USER_SETTING_SCREENLOCK, newValue);
			api.Settings.SaveUserSetting('keep_screen_on', newValue).catch(() => 
			{
				state.commit(UPDATE_USER_SETTING_SCREENLOCK, oldValue);
			});
		},
		[SAVE_USER_SETTING_HEADERCLOCK](state, newValue: boolean)
		{
			const oldValue = state.state.KeepScreenOn;
			state.commit(UPDATE_USER_SETTING_HEADERCLOCK, newValue);
			return api.Settings.SaveUserSetting('show_clock_in_header', newValue).catch(() =>
			{
				state.commit(UPDATE_USER_SETTING_HEADERCLOCK, oldValue);
			});
		},

	}

};

export { UserSettings };