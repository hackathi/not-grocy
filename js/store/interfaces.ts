import { SettingsState } from './modules/settings';
import { UserState } from './modules/user';

// define your typings for the store state
export interface RootState {
	Settings?: SettingsState,
	User?: UserState,
	QuantityUnits: Array<QuantityUnit>
}

export interface QuantityUnit {
	id: number;
	name: string;
	description: string | null;
	name_plural: string | null,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	plural_forms: any; // wat?
	// TODO: type userfields better.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	userfields: any;
}