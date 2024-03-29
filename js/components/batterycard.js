//import { $ } from 'jquery';
import { EmptyElementWhenMatches } from '../helpers/extensions';
import { RefreshContextualTimeago } from '../configs/timeago';

class batterycard 
{
	constructor(Grocy, scopeSelector = null) 
	{
		this.Grocy = Grocy;
		this.scopeSelector = scopeSelector;
		this.scope = scopeSelector != null ? $(scopeSelector) : $(document);
		const jScope = this.scope;
		this.$ = scopeSelector != null ? selector => jScope.find(selector) : $;
		this.Grocy.PreloadView('batteriesjournal');
	}

	Refresh(batteryId) 
	{
		const self = this;
		this.Grocy.Api.Get('batteries/' + batteryId, function (batteryDetails) 
		{
			self.$('#batterycard-battery-name').text(batteryDetails.battery.name);
			self.$('#batterycard-battery-used_in').text(batteryDetails.battery.used_in);
			self.$('#batterycard-battery-last-charged').text(batteryDetails.last_charged || self.Grocy.translate('never'));
			self.$('#batterycard-battery-last-charged-timeago').attr('datetime', batteryDetails.last_charged || '');
			self.$('#batterycard-battery-charge-cycles-count').text(batteryDetails.charge_cycles_count || '0');
			self.$('#batterycard-battery-edit-button').attr('href', self.Grocy.FormatUrl('/battery/' + batteryDetails.battery.id.toString()));
			self.$('#batterycard-battery-journal-button').attr('href', self.Grocy.FormatUrl('/batteriesjournal?embedded&battery=' + batteryDetails.battery.id.toString()));
			self.$('#batterycard-battery-edit-button').removeClass('disabled');
			self.$('#batterycard-battery-journal-button').removeClass('disabled');
			EmptyElementWhenMatches(self.$('#batterycard-battery-last-charged-timeago'), self.Grocy.translate('timeago_nan')); // ToDo: Unscoped

			RefreshContextualTimeago('.batterycard');
		}, function (xhr) 
		{
			console.error(xhr);
		});
	}

}

export { batterycard };