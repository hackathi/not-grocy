import BaseApi from "./BaseApi";

class SettingsApi extends BaseApi
{
	fetchOptions: RequestInit;

	constructor(baseUrl: string)
	{
		super(baseUrl);
		this.fetchOptions = {
			cache: 'no-cache',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			redirect: 'follow',
			referrerPolicy: 'no-referrer'
		};
	}

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
	async SaveUserSetting(key: string, value: any): Promise<any>
	{
		// I'm sure there is a way, I just don't know it.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const options = <any>{};
		Object.assign(options, this.fetchOptions);
		options.method = "PUT";
		options.body = JSON.stringify({ "value": value });
		
		const endpoint = this.baseUrl + '/user/settings/' + key;

		return this.execute(endpoint, options);
	}
}

export default SettingsApi;