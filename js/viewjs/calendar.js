import { __t, U } from '../lib/legacy'; //import { $ } from 'jquery';

import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import { QrCodeImgHtml } from '../helpers/qrcode';
import '@fullcalendar/core/main.css';
import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/timegrid/main.css';
import '@fullcalendar/list/main.css';
import '@fullcalendar/bootstrap/main.css';

function calendarView(Grocy, scope = null) 
{
	let $scope = $;
	let $viewport = $(window);

	if (scope != null) 
	{
		$scope = selector => $(scope).find(selector);

		$viewport = $(scope);
	}

	const calendarOptions = {
		plugins: [bootstrapPlugin, dayGridPlugin, listPlugin, timeGridPlugin],
		themeSystem: 'bootstrap',
		header: {
			left: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
			center: 'title',
			right: 'prev,next'
		},
		weekNumbers: Grocy.CalendarShowWeekNumbers,
		defaultView: $viewport.width() < 768 ? 'timeGridDay' : 'dayGridMonth',
		firstDay: firstDay,
		eventLimit: false,
		height: 'auto',
		events: Grocy.fullcalendarEventSources,
		// fullcalendar 4 doesn't translate the default view names (?)
		// so we have to supply our own.
		views: {
			dayGridMonth: {
				buttonText: __t('Month')
			},
			timeGridWeek: {
				buttonText: __t('Week')
			},
			timeGridDay: {
				buttonText: __t('Day')
			},
			listWeek: {
				buttonText: __t('List')
			}
		},
		eventClick: function (info) 
		{
			window.location.href = info.link;
		}
	};

	if (__t('fullcalendar_locale').replace(' ', '') !== '' && __t('fullcalendar_locale') != 'x') 
	{
		$.getScript(U('/js/locales/fullcalendar-core/' + __t('fullcalendar_locale') + '.js'));
		calendarOptions.locale = __t('fullcalendar_locale');
	}

	var firstDay = null;

	if (!Grocy.CalendarFirstDayOfWeek.isEmpty()) 
	{
		firstDay = parseInt(Grocy.CalendarFirstDayOfWeek);
	}

	const calendar = new Calendar($scope('#calendar')[0], calendarOptions);
	calendar.render();
	$scope('#ical-button').on('click', function (e) 
	{
		e.preventDefault();
		Grocy.Api.Get('calendar/ical/sharing-link', function (result) 
		{
			bootbox.alert({
				title: __t('Share/Integrate calendar (iCal)'),
				message: __t('Use the following (public) URL to share or integrate the calendar in iCal format') + '<input type="text" class="form-control form-control-sm mt-2 easy-link-copy-textbox" value="' + result.url + '"><p class="text-center mt-4">' + QrCodeImgHtml(result.url) + '</p>',
				closeButton: false
			});
		}, function (xhr) 
		{
			console.error(xhr);
		});
	});
	$(window).one('resize', function () 
	{
		// Automatically switch the calendar to "basicDay" view on small screens
		// and to "month" otherwise
		if ($viewport.width() < 768) 
		{
			calendar.changeView('timeGridDay');
		}
		else 
		{
			calendar.changeView('dayGridMonth');
		}
	});
}

export { calendarView };