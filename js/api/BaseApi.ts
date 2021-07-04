class BaseApi
{
	baseUrl: string;


	constructor(baseUrl: string)
	{
		this.baseUrl = baseUrl;
	}

	SetBase(newBase: string) : void
	{
		this.baseUrl = newBase;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async execute(endpoint: string, options: RequestInit) : Promise<any>
	{
		const resp = await fetch(endpoint, options);

		if (!resp.ok)
		{
			// throw!
			throw new Error('Not OK status code received from ' + endpoint);
		}

		// API mostly returns 204 No Content
		// when a Call was successful.
		if (resp.status == 204)
			return new Promise((resolve) => { resolve({}) });
		
		return resp.json();
	}
}

export default BaseApi;