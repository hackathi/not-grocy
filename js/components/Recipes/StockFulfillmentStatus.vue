<template>
	<div>
		<span v-if="data.need_fulfilled">
			<i class="fas fa-check text-success"></i> {{ $t('Enough in stock') }}
		</span>
		<span v-if="!data.need_fulfilled && data.need_fulfilled_with_shopping_list">
			<i class="fas fa-exclamation text-warning"></i> {{ getOnShippinglist }}
		</span>
		<span v-if="!data.need_fulfilled && !data.need_fulfilled_with_shopping_list">
			<i class="fas fa-times text-warning"></i> {{ getMissingString }}
		</span>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	props: {
		data: {
			type: Object,
			required: true
		},
		mode: {
			type: String,
			default: 'count'
		}
	},
	computed: {
		getMissing() : number
		{
			if(this.mode == 'amount')
			{
				return parseFloat(this.data.missing_amount);
			}
			return this.data.missing_products_count;
		},
		getOnShippinglist() : string
		{
			if(this.mode == 'amount')
			{
				return this.$t('Not enough in stock (not included in costs), {string1} missing, {string2} already on shopping list', {
					string1 : this.$n(this.getMissing, 'avoid-decimal'),
					string2 : this.$n(parseFloat(this.data.amount_on_shopping_list))
				});
			}
			return this.$t('Not enough in stock, {count} ingredient missing but already on the shopping list | Not enough in stock, {count} ingredients missing but already on the shopping list', this.getMissing);
		},
		getMissingString() : string
		{
			if(this.mode == 'amount')
				return this.$t('Not enough in stock (not included in costs), {count} ingredient missing | Not enough in stock (not included in costs), {count} ingredients missing', this.getMissing);

			return this.$t('Not enough in stock, {count} ingredient missing | Not enough in stock, {count} ingredients missing', this.getMissing);
		}
	}
});
</script>