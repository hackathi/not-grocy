import { SettingsState } from './modules/settings';
import { UserState } from './modules/user';

// define your typings for the store state
export interface RootState {
	Settings: SettingsState,
	User: UserState,
}

