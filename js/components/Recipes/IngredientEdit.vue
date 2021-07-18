<template>
	<!-- eslint-disable vue/no-v-model-argument -->
	<Dialog v-model:visible="intDialogOpen" :header="targetIngredient.id == NaN ? $t('Add recipe ingredient') : $t('Edit recipe ingredient')" @hide="onHide" :modal="true" style="width: 50vh;">
		<div class="p-fluid">
			<div class="p-field">
				<ProductPicker v-model:selectedProduct="selectedProduct" />
			</div>
			<div class="p-field-checkbox">
				<CheckBox id="singleUnitInStock" name="singleUnitInStock" v-model="targetIngredient.only_check_single_unit_in_stock" />
				<label for="singleUnitInStock" v-tooltip="$t('A different amount/unit can then be used below while for stock fulfillment checking it is sufficient when any amount of the product in stock')">{{ $t('Only check if any amount is in stock') }} <i class="fas fa-question-circle"></i></label>
			</div>
			<ProductAmountPicker v-model:amount="targetIngredient.recipe_amount" v-model:quantityUnitId="targetIngredient.qu_id" :quantityUnits="quantityUnitsForProduct" />
		</div>
		<template #footer>
			<Button class="p-button p-button-success" @click="saveIngredient">{{ $t('Save') }}</Button>
			<Button class="p-button-outlined p-button-secondary" @click="cancelIngredientDialog">{{ $t('Cancel') }}</Button>
		</template>
	</Dialog>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Ingredient } from '../../types/Recipe';
import { cloneDeep } from 'lodash';
import ProductPicker from '../../components/Stock/Productpicker.vue';
import ProductAmountPicker from '../../components/Stock/Productamountpicker.vue';

import { useStore } from '../../store';
import { Product } from '../../types/Stock';

export default defineComponent({
	props: {
		ingredient: {
			type: Object as PropType<Ingredient>,
			required: true,
		},
		visible: Boolean,
	},
	emits: {
		'update:visible' : (payload: boolean) => true,
		'save' : (ingredient: Ingredient) => true,
		'hide' : (event: Event) => true,
	},
	watch: {
		visible: function(newValue) 
		{
			if(newValue) this.showDialog();
			else this.hideDialog();
		}
	},
	data()
	{
		return {
			targetIngredient: <Ingredient> { id: NaN },
			intDialogOpen: false,
			dirty: false,
		};
	},
	setup()
	{
		const store = useStore();

		return { store };
	},
	computed: {
		dialogOpen: {
			get() : boolean
			{
				return this.intDialogOpen;
			},
			set(newValue: boolean) : void
			{
				this.intDialogOpen = newValue;
				this.$emit('update:visible', newValue);
			}
		},
		selectedProduct: {
			get() : Product | null
			{
				return this.targetIngredient.product;
			},
			set(newValue: Product)
			{
				this.targetIngredient.product = newValue;
				this.targetIngredient.product_id = newValue.id;
			}
		}
	},
	methods: {
		showDialog() : void
		{
			this.targetIngredient = cloneDeep(this.ingredient);
			this.dialogOpen = true;
		},
		hideDialog() : void
		{
			this.dialogOpen = false;
		},
		saveIngredient() : void
		{
			this.dirty = true;
			this.$emit('save', this.targetIngredient);
			this.hideDialog();
		},
		cancelIngredientDialog() : void
		{
			this.targetIngredient = cloneDeep(this.ingredient);
			this.hideDialog();
		},
		onHide(event: Event) : void
		{
			this.$emit('hide', event);
		}
	},
	components: {
		'ProductPicker' : ProductPicker,
		'ProductAmountPicker' : ProductAmountPicker,
	}
});
</script>