import BaseApi from './BaseApi';
import SettingsApi from './SettingsApi';
import SystemApi from './SystemApi';
import StockApi from './StockApi';

class GrocyApi extends BaseApi
{
	fetchOptions: RequestInit;
	Settings: SettingsApi;
	System: SystemApi;
	Stock: StockApi;

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

		this.Settings = new SettingsApi(baseUrl);
		this.System = new SystemApi(baseUrl);
		this.Stock = new StockApi(baseUrl);
	}

	SetBase(newBase: string) : void
	{
		super.SetBase(newBase);
		this.Settings.SetBase(newBase);
		this.System.SetBase(newBase);
		this.Stock.SetBase(newBase);
	}
}

const api = new GrocyApi('/api');

export default api;
export { GrocyApi, SettingsApi, SystemApi };