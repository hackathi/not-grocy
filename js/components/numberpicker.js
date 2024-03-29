//import { $ } from 'jquery';
class numberpicker 
{
	constructor(Grocy, scopeSelector = null) 
	{
		this.Grocy = Grocy;
		this.scopeSelector = scopeSelector;
		this.scope = scopeSelector != null ? $(scopeSelector) : $(document);
		const jScope = this.scope;
		this.$ = scopeSelector != null ? selector => jScope.find(selector) : $;
		const self = this;
		this.$('.numberpicker-down-button').unbind('click').on('click', function () 
		{
			self.valueDownHandler(this);
		});
		this.$('.numberpicker-up-button').unbind('click').on('click', function () 
		{
			self.valueUpHandler(this);
		});
		this.$('.numberpicker').on('keyup', function () 
		{
			const $this = $(this);

			if ($this.attr('data-not-equal') && !$this.attr('data-not-equal').toString().isEmpty() && $this.attr('data-not-equal') == $this.val()) 
			{
				$this[0].setCustomValidity('error');
			}
			else 
			{
				$this[0].setCustomValidity('');
			}
		});
		this.$('.numberpicker').on('keydown', function (e) 
		{
			if (e.key == 'ArrowUp') 
			{
				e.preventDefault();
				$(this).parent().find('.numberpicker-up-button').click();
			}
			else if (e.key == 'ArrowDown') 
			{
				e.preventDefault();
				$(this).parent().find('.numberpicker-down-button').click();
			}
		});
		this.observer = new MutationObserver(mutations => 
		{
			for (const mutation of mutations) 
			{
				self.handleObservedChange(mutation);
			}
		});
		const elements = this.$('.numberpicker');

		for (const element of elements) 
		{
			this.observer.observe(element, {
				attributes: true
			});
		}

		this.$('.numberpicker').attr('data-initialised', 'true'); // Dummy change to trigger MutationObserver above once
	}

	Unload() 
	{
		this.observer.disconnect();
	}

	modifyValueHandler(_this, newValue) 
	{
		const inputElement = this.$(_this).parent().parent().find('input[type="number"]');

		if (newValue instanceof Function) 
		{
			newValue = newValue(_this, inputElement);
		}

		inputElement.val(newValue);
		inputElement.trigger('keyup').trigger('change');
	}

	valueUpHandler(_this) 
	{
		this.modifyValueHandler(_this, (_this, inputElement) => 
		{
			return parseFloat(inputElement.val() || 0) + 1;
		});
	}

	valueDownHandler(_this) 
	{
		this.modifyValueHandler(_this, (_this, inputElement) => 
		{
			return parseFloat(inputElement.val() || 1) - 1;
		});
	}

	handleObservedChange(mutation) 
	{
		if (mutation.type == 'attributes' && (mutation.attributeName == 'min' || mutation.attributeName == 'max' || mutation.attributeName == 'data-not-equal' || mutation.attributeName == 'data-initialised')) 
		{
			const element = $(mutation.target);
			const min = element.attr('min');
			const decimals = element.attr('data-decimals');
			let max = '';

			if (element.hasAttr('max')) 
			{
				max = element.attr('max');
			}

			if (element.hasAttr('data-not-equal')) 
			{
				const notEqual = element.attr('data-not-equal');

				if (notEqual != 'NaN') 
				{
					if (max.isEmpty()) 
					{
						element.parent().find('.invalid-feedback').text(this.Grocy.translate('This cannot be lower than %1$s or equal %2$s and needs to be a valid number with max. %3$s decimal places', parseFloat(min).toLocaleString(undefined, {
							minimumFractionDigits: 0,
							maximumFractionDigits: decimals
						}), parseFloat(notEqual).toLocaleString(undefined, {
							minimumFractionDigits: 0,
							maximumFractionDigits: decimals
						}), decimals));
					}
					else 
					{
						element.parent().find('.invalid-feedback').text(this.Grocy.translate('This must be between %1$s and %2$s, cannot equal %3$s and needs to be a valid number with max. %4$s decimal places', parseFloat(min).toLocaleString(undefined, {
							minimumFractionDigits: 0,
							maximumFractionDigits: decimals
						}), parseFloat(max).toLocaleString(undefined, {
							minimumFractionDigits: 0,
							maximumFractionDigits: decimals
						}), parseFloat(notEqual).toLocaleString(undefined, {
							minimumFractionDigits: decimals,
							maximumFractionDigits: decimals
						}), decimals));
					}

					return;
				}
			}

			if (max.isEmpty()) 
			{
				element.parent().find('.invalid-feedback').text(this.Grocy.translate('This cannot be lower than %1$s and needs to be a valid number with max. %2$s decimal places', parseFloat(min).toLocaleString(undefined, {
					minimumFractionDigits: 0,
					maximumFractionDigits: decimals
				}), decimals));
			}
			else 
			{
				element.parent().find('.invalid-feedback').text(this.Grocy.translate('This must between %1$s and %2$s and needs to be a valid number with max. %3$s decimal places', parseFloat(min).toLocaleString(undefined, {
					minimumFractionDigits: 0,
					maximumFractionDigits: decimals
				}), parseFloat(max).toLocaleString(undefined, {
					minimumFractionDigits: 0,
					maximumFractionDigits: decimals
				}), decimals));
			}
		}
	}

}

export { numberpicker };