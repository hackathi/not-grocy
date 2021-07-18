import { Module } from "vuex";
import { RootState } from '../interfaces';
import { LOAD_CONFIG } from "../mutations";

// omitted for now:
// Permissions

export interface UserState {
	Id: number;
	Username: string;
	PictureFileName: string | null;
}

const User: Module<UserState, RootState> = {
	state()
	{
		return {
			Id: -1,
			Username: "",
			PictureFileName: null
		};
	},
	mutations: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		[LOAD_CONFIG](state, newConfig: any)
		{
			state.Id = newConfig.User.Id;
			state.Username = newConfig.User.Username;
			state.PictureFileName = newConfig.User.PictureFileName;
		}
	}
};

export { User };