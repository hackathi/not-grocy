import { SettingsState } from './modules/settings';
import { UserState } from './modules/user';
import { QuantityUnit, Product } from '../types/Stock';

// define your typings for the store state
export interface RootState {
	Settings?: SettingsState,
	User?: UserState,
	QuantityUnits: Array<QuantityUnit>,
	Products: Array<Product>
}