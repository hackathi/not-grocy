function WindowMessageBag(message, payload = null) 
{
	const obj = {};
	obj.Message = message;
	obj.Payload = payload;
	return obj;
}

export { WindowMessageBag };