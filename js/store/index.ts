import { InjectionKey } from 'vue';
import { createStore, useStore as baseUseStore, Store } from 'vuex';
import { Settings, User } from './modules';
import { RootState } from './interfaces';
import { LOAD_QUANTITY_UNITS, LOAD_PRODUCTS } from './mutations';
import { ENSURE_PRODUCTS_LOADED } from './actions';
import { QuantityUnit, Product } from '../types/Stock';
import api from '../api';
import { datetimepicker } from '../legacy/components';

// define injection key
export const key: InjectionKey<Store<RootState>> = Symbol();

export const store = createStore<RootState>({
	state()
	{
		return {
			QuantityUnits: Array<QuantityUnit>(0),
			Products: Array<Product>(0)
		};
	},
	mutations: {
		[LOAD_QUANTITY_UNITS](state, data: Array<QuantityUnit>) : void
		{
			state.QuantityUnits = data;
		},
		[LOAD_PRODUCTS](state, data: Array<Product>) : void
		{
			state.Products = data;
		}
	},
	actions: {
		[ENSURE_PRODUCTS_LOADED](state)
		{
			// TODO: do changed handling correctly. At the moment, this sometimes
			// unneccessarily reloads products.
			api.Stock.GetProducts().then(data =>
			{
				state.commit(LOAD_PRODUCTS, data);
			});
		}
	},
	getters: {
		getQuantityUnit: (state) => (id: number) =>
		{
			return state.QuantityUnits.find(x => x.id == id);
		},
		getProduct: (state) => (id: number) =>
		{
			return state.Products.find(x => x.id == id);
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