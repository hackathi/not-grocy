function __t(text, ...placeholderValues) 
{
	if (window.Grocy === undefined) 
	{
		console.error("Root Grocy not found, can't translate.");
	}

	return window.Grocy.translate(text, ...placeholderValues);
}

function __n(number, singularForm, pluralForm) 
{
	if (window.Grocy === undefined) 
	{
		console.error("Root Grocy not found, can't translate.");
	}

	return window.Grocy.translaten(number, singularForm, pluralForm);
}

function U(path) 
{
	return window.Grocy.FormatUrl(path);
}

export { __t, __n, U };