export const GROCYCODE_PRODUCT = 'p';
export const GROCYCODE_CHORE = 'c';
export const GROCYCODE_BATTERY = 'b';

export const allGrocycodes = [GROCYCODE_PRODUCT, GROCYCODE_CHORE, GROCYCODE_BATTERY];

export function decodeGrocycode(code: string) : { valid: boolean, type?: string, id?: number, extraData?: Array<string> }
{
	const parts = code.split(':');

	if (parts[0] != "grcy") return { valid: false };
	if (!allGrocycodes.includes(parts[1])) return { valid: false };
	if (!parts[2].match(/\d+/i)) return { valid: false };
	
	return { valid: true, type: parts[1], id: parseInt(parts[2]), extraData: parts.slice(3) };
}