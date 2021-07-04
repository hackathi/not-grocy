import BaseApi from "./BaseApi";

class StockApi extends BaseApi
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
	async GetAll(): Promise<any>
	{
		// I'm sure there is a way, I just don't know it.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const options = <any>{};
		Object.assign(options, this.fetchOptions);
		options.method = "GET";

		const endpoint = this.baseUrl + '/stock';

		return this.execute(endpoint, options);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async Overview(): Promise<any>
	{
		// I'm sure there is a way, I just don't know it.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const options = <any>{};
		Object.assign(options, this.fetchOptions);
		options.method = "GET";

		const endpoint = this.baseUrl + '/stock/overview';

		return this.execute(endpoint, options);
	}
}

export default StockApi;