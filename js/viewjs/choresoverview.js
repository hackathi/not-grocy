import { animateCSS } from '../helpers/extensions';
import { RefreshContextualTimeago } from '../configs/timeago';
import { __t, __n } from '../lib/legacy'; //import { $ } from 'jquery';

function choresoverviewView(Grocy, scope = null) 
{
	let $scope = $;
	const top = scope != null ? $(scope) : $(document);

	if (scope != null) 
	{
		$scope = selector => $(scope).find(selector);
	}

	const chorecard = Grocy.Use('chorecard'); // preload some views.

	Grocy.PreloadView('choresjournal');
	const choresOverviewTable = $scope('#chores-overview-table').DataTable({
		order: [[2, 'asc']],
		columnDefs: [{
			orderable: false,
			targets: 0
		}, {
			searchable: false,
			targets: 0
		}, {
			type: 'html',
			targets: 5
		}, {
			type: 'html',
			targets: 2
		}, {
			type: 'html',
			targets: 3
		}].concat($.fn.dataTable.defaults.columnDefs)
	});
	$scope('#chores-overview-table tbody').removeClass('d-none');
	Grocy.FrontendHelpers.InitDataTable(choresOverviewTable);
	Grocy.FrontendHelpers.MakeValueFilter('status', 5, choresOverviewTable);
	Grocy.FrontendHelpers.MakeValueFilter('user', 6, choresOverviewTable, '');
	$scope('#user-filter').on('change', function () 
	{
		const user = $(this).val();

		if (user !== null && !user.isEmpty()) 
		{
			Grocy.UpdateUriParam('user', $scope('#user-filter option:selected').data('user-id'));
		}
		else 
		{
			Grocy.RemoveUriParam('user');
		}
	});
	top.on('click', '.track-chore-button', function (e) 
	{
		e.preventDefault(); // Remove the focus from the current button
		// to prevent that the tooltip stays until clicked anywhere else

		document.activeElement.blur();
		Grocy.FrontendHelpers.BeginUiBusy();
		const choreId = $scope(e.currentTarget).attr('data-chore-id');
		const choreName = $scope(e.currentTarget).attr('data-chore-name');
		Grocy.Api.Get('objects/chores/' + choreId, function (chore) 
		{
			let trackedTime = moment().format('YYYY-MM-DD HH:mm:ss');

			if (chore.track_date_only == 1) 
			{
				trackedTime = moment().format('YYYY-MM-DD');
			}

			Grocy.Api.Post('chores/' + choreId + '/execute', {
				tracked_time: trackedTime
			}, function () 
			{
				Grocy.Api.Get('chores/' + choreId, function (result) 
				{
					const choreRow = $scope('#chore-' + choreId + '-row');
					const nextXDaysThreshold = moment().add($scope('#info-due-chores').data('next-x-days'), 'days');
					const now = moment();
					const nextExecutionTime = moment(result.next_estimated_execution_time);
					choreRow.removeClass('table-warning');
					choreRow.removeClass('table-danger');
					$scope('#chore-' + choreId + '-due-filter-column').html('');

					if (nextExecutionTime.isBefore(now)) 
					{
						choreRow.addClass('table-danger');
						$scope('#chore-' + choreId + '-due-filter-column').html('overdue');
					}
					else if (nextExecutionTime.isBefore(nextXDaysThreshold)) 
					{
						choreRow.addClass('table-warning');
						$scope('#chore-' + choreId + '-due-filter-column').html('duesoon');
					}

					animateCSS('#chore-' + choreId + '-row td:not(:first)', 'shake');
					$scope('#chore-' + choreId + '-last-tracked-time').text(trackedTime);
					$scope('#chore-' + choreId + '-last-tracked-time-timeago').attr('datetime', trackedTime);

					if (result.chore.period_type == 'dynamic-regular') 
					{
						$scope('#chore-' + choreId + '-next-execution-time').text(result.next_estimated_execution_time);
						$scope('#chore-' + choreId + '-next-execution-time-timeago').attr('datetime', result.next_estimated_execution_time);
					}

					if (result.chore.next_execution_assigned_to_user_id != null) 
					{
						$scope('#chore-' + choreId + '-next-execution-assigned-user').text(result.next_execution_assigned_user.display_name);
					}

					Grocy.FrontendHelpers.EndUiBusy();
					toastr.success(__t('Tracked execution of chore %1$s on %2$s', choreName, trackedTime));
					RefreshStatistics(); // Delay due to delayed/animated set of new timestamps above

					setTimeout(function () 
					{
						RefreshContextualTimeago('#chore-' + choreId + '-row'); // Refresh the DataTable to re-apply filters

						choresOverviewTable.rows().invalidate().draw(false);
						$scope('.input-group-filter').trigger('change');
					}, 550);
				}, function (xhr) 
				{
					Grocy.FrontendHelpers.EndUiBusy();
					console.error(xhr);
				});
			}, function (xhr) 
			{
				Grocy.FrontendHelpers.EndUiBusy();
				console.error(xhr);
			});
		}, function (xhr) 
		{
			Grocy.FrontendHelpers.EndUiBusy('choretracking-form');
			console.error(xhr);
		});
	});
	top.on('click', '.chore-name-cell', function (e) 
	{
		chorecard.Refresh($scope(e.currentTarget).attr('data-chore-id'));
		$scope('#choresoverview-chorecard-modal').modal('show');
	});

	function RefreshStatistics() 
	{
		const nextXDays = $scope('#info-due-chores').data('next-x-days');
		Grocy.Api.Get('chores', function (result) 
		{
			let dueCount = 0;
			let overdueCount = 0;
			let assignedToMeCount = 0;
			const now = moment();
			const nextXDaysThreshold = moment().add(nextXDays, 'days');
			result.forEach(element => 
			{
				const date = moment(element.next_estimated_execution_time);

				if (date.isBefore(now)) 
				{
					overdueCount++;
				}
				else if (date.isBefore(nextXDaysThreshold)) 
				{
					dueCount++;
				}

				if (parseInt(element.next_execution_assigned_to_user_id) == Grocy.UserId) 
				{
					assignedToMeCount++;
				}
			});
			$scope('#info-due-chores').html('<span class="d-block d-md-none">' + dueCount + ' <i class="fas fa-clock"></i></span><span class="d-none d-md-block">' + __n(dueCount, '%s chore is due to be done', '%s chores are due to be done') + ' ' + __n(nextXDays, 'within the next day', 'within the next %s days'));
			$scope('#info-overdue-chores').html('<span class="d-block d-md-none">' + overdueCount + ' <i class="fas fa-times-circle"></i></span><span class="d-none d-md-block">' + __n(overdueCount, '%s chore is overdue to be done', '%s chores are overdue to be done'));
			$scope('#info-assigned-to-me-chores').html('<span class="d-block d-md-none">' + assignedToMeCount + ' <i class="fas fa-exclamation-circle"></i></span><span class="d-none d-md-block">' + __n(assignedToMeCount, '%s chore is assigned to me', '%s chores are assigned to me'));
		}, function (xhr) 
		{
			console.error(xhr);
		});
	}

	if (Grocy.GetUriParam('user') !== undefined) 
	{
		$scope('#user-filter').val('xx' + Grocy.GetUriParam('user') + 'xx');
		$scope('#user-filter').trigger('change');
	}

	RefreshStatistics();
}

export { choresoverviewView };