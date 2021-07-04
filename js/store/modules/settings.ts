import { Module } from "vuex";
import { RootState } from '../interfaces';
import { UserSettings, UserSettingsState } from "./usersettings";
import { LOAD_CONFIG  } from "../mutations";

// removed:
// UserSettings
// FeatureFlags
// QuantityUnits
// QuantityUnitConversions

export interface SettingsState {
	CalendarShowWeekNumbers: boolean;
	CalendarFirstDayOfWeek: string;
	MealPlanFirstDayOfWeek: string;
	Currency: string;
	Locale: string;
	Version: string;
	User?: UserSettingsState; // ???
}

const Settings: Module<SettingsState, RootState> = {
	state()
	{
		return {
			CalendarShowWeekNumbers: true,
			CalendarFirstDayOfWeek: "",
			Currency: "",
			MealPlanFirstDayOfWeek: "",
			Locale: "",
			Version: ""
		};
	},
	mutations: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		[LOAD_CONFIG](state, newConfig: any)
		{
			state.CalendarFirstDayOfWeek = newConfig.CalendarFirstDayOfWeek;
			state.CalendarShowWeekNumbers = newConfig.CalendarShowWeekNumbers;
			state.MealPlanFirstDayOfWeek = newConfig.MealPlanFirstDayOfWeek;
			state.Currency = newConfig.Currency;
			state.Locale = newConfig.Locale;
			state.Version = newConfig.Version;
		}
	},
	modules: {
		User: UserSettings
	}

};

export { Settings };