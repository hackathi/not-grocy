import { InjectionKey } from 'vue';
import { createStore, useStore as baseUseStore, Store } from 'vuex';
import { Settings, User } from './modules';
import { RootState } from './interfaces';

// define injection key
export const key: InjectionKey<Store<RootState>> = Symbol();

export const store = createStore<RootState>({
	modules: {
		Settings: Settings,
		User: User,
	}
});

export function useStore() : Store<RootState>
{
	return baseUseStore(key);
}