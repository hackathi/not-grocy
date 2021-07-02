import * as timeago from 'timeago.js';
/* global __t */

function RefreshContextualTimeago(rootSelector = '#page-content') 
{
	$(rootSelector + ' time.timeago').each(function () 
	{
		const element = $(this);

		if (!element.hasAttr('datetime')) 
		{
			element.text('');
			return;
		}

		const timestamp = element.attr('datetime');

		if (timestamp.isEmpty()) 
		{
			element.text('');
			return;
		}

		const isNever = timestamp && timestamp.substring(0, 10) == '2999-12-31';
		const isToday = timestamp && timestamp.substring(0, 10) == moment().format('YYYY-MM-DD');
		const isDateWithoutTime = element.hasClass('timeago-date-only');

		if (isNever) 
		{
			element.prev().text(__t('Never'));
			element.text('');
		}
		else if (isToday) 
		{
			element.text(__t('Today'));
		}
		else 
		{
			element.text(timeago.format(timestamp, __t("timeago_locale")));
		}

		if (isDateWithoutTime) 
		{
			element.prev().text(element.prev().text().substring(0, 10));
		}
	});
}

export { RefreshContextualTimeago };