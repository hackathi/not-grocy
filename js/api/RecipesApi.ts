import BaseApi from "./BaseApi";

class RecipesApi extends BaseApi 
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

		const endpoint = this.baseUrl + '/recipes';

		return this.execute(endpoint, options);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async Get(id: number): Promise<any>
	{
		// I'm sure there is a way, I just don't know it.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const options = <any>{};
		Object.assign(options, this.fetchOptions);
		options.method = "GET";

		const endpoint = this.baseUrl + `/recipes/${id}/get`;

		return this.execute(endpoint, options);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async UpdateRecipe(id: number, fields: unknown): Promise<any>
	{
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const options = <any>{};
		Object.assign(options, this.fetchOptions);
		options.method = "PUT";
		options.body = JSON.stringify(fields);

		const endpoint = this.baseUrl + `/recipes/${id}/edit`;

		return this.execute(endpoint, options);
	}
}

export default RecipesApi;