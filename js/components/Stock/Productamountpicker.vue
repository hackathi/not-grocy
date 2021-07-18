<template>
	<div class="p-grid">
		<div class="p-col-12 p-md-6 p-field">
			<label for="productAmount">{{ $t('Amount') }}</label>
			<InputNumber id="productAmount" v-model="value" showButtons buttonLayout="horizontal"
    decrementButtonClass="p-button-secondary" incrementButtonClass="p-button-secondary" incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus" mode="decimal" />
		</div>
		<div class="p-col-12 p-md-6 p-field">
			<Dropdown v-model="selectedQuantityUnit" :options="quantityUnits" optionLabel="name" />
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { QuantityUnit } from '../../types/Stock';

export default defineComponent({
	props: {
		amount: {
			type: Number,
			required: true,
		},
		quantityUnitId: {
			type: Number,
			required: true,
		},
		quantityUnits: {
			type: Array as PropType<Array<QuantityUnit>>,
			required: true,
		}
	},
	emits: {
		'update:amount': (amount: Number) => true,
		'update:quantityUnitId': (quId: Number) => true,
	},
	computed: {
		value: {
			get() : Number
			{
				return this.amount;
			},
			set(newValue: Number)
			{
				this.$emit('update:amount', newValue);
			}
		},
		selectedQuantityUnit: {
			get() : QuantityUnit
			{
				return <QuantityUnit> this.quantityUnits.find(x => x.id == this.quantityUnitId) || null;
			},
			set(newValue: QuantityUnit)
			{
				this.$emit('update:quantityUnitId', newValue.id);
			}
		}
	}
});
</script>