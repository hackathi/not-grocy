import BaseApi from "./BaseApi";

class SystemApi extends BaseApi
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

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async GetConfig(): Promise<any> 
	{
		// I'm sure there is a way, I just don't know it.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const options = <any>{};
		Object.assign(options, this.fetchOptions);
		options.method = "GET";

		const endpoint = this.baseUrl + '/system/config/grocy';

		return this.execute(endpoint, options);
	}
}

export default SystemApi;