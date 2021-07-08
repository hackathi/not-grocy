import { InjectionKey } from 'vue';
import { createStore, useStore as baseUseStore, Store } from 'vuex';
import { Settings, User } from './modules';
import { QuantityUnit, RootState } from './interfaces';
import { LOAD_QUANTITY_UNITS } from './mutations';

// define injection key
export const key: InjectionKey<Store<RootState>> = Symbol();

export const store = createStore<RootState>({
	state()
	{
		return {
			QuantityUnits: Array<QuantityUnit>(0),
		};
	},
	mutations: {
		[LOAD_QUANTITY_UNITS](state, data: Array<QuantityUnit>) : void
		{
			state.QuantityUnits = data;
		}
	},
	getters: {
		getQuantityUnit: (state) => (id: number) =>
		{
			return state.QuantityUnits.find(x => x.id == id);
		}
	},
	modules: {
		Settings: Settings,
		User: User,
	},
});

export function useStore() : Store<RootState>
{
	return baseUseStore(key);
}