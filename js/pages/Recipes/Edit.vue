<template>
	<div class="p-grid">
		<div class="p-col-12 p-lg-7">
			<Card>
				<template #title>
					{{ $t('Edit recipe') }}
				</template>
				<template #content>
					<div class="p-fluid">
						<div class="p-field">
							<label for="recipe_name">{{ $t('Name') }}</label>
							<InputText id="recipe_name" type="text" v-model="recipe.name" />
						</div>
						<div class="p-field">
							<label for="servings" v-tooltip="$t('The ingredients listed here result in this amount of servings')">{{ $t('Servings') }}</label>
							<InputNumber id="servings" v-model="recipe.base_servings" showButtons buttonLayout="horizontal" :step="1" decrementButtonClass="p-button-secondary" incrementButtonClass="p-button-secondary" incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus" />
						</div>
						<div class="p-field-checkbox">
							<InputSwitch id="no-check-shoppinglist" type="text" v-model="recipe.not_check_shoppinglist" />
							<label for="no-check-shoppinglist" v-tooltip="$t(noCheckShoppinglistTooltip)">{{ $t('Do not check against the shopping list when adding missing items to it') }}</label>
						</div>
						<div class="p-field">
							<label for="product_produced" v-tooltip="$t('When a product is selected, one unit (per serving in stock quantity unit) will be added to stock on consuming this recipe')">{{ $t('Produces product') }}</label>
							<ProductPicker />
						</div>
						<div class="p-field">
							<label for="preperation">{{ $t('Preperation') }}</label>
							<Editor v-model="recipe.description" editorStyle="height: 320px"/>
						</div>
					</div>
					<Button :label="$t('Save & continue')" class="p-mr-2" />
					<Button :label="$t('Save & return to recipes')" class="p-button-info" />
				</template>
			</Card>
		</div>
		<div class="p-col-12 p-lg-5">
			<Card class="p-mb-3">
				<template #title>{{ $t('Ingredients list') }}</template>
				<template #content> </template>
			</Card>
			<Card class="p-mb-3">
				<template #title>{{ $t('Included recipes') }}</template>
				<template #content> </template>
			</Card>
			<Card class="p-mb-3">
				<template #title>{{ $t('Picture') }}</template>
				<template #content> </template>
			</Card>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import api from '../../api';

import { Recipe } from '../../types/Recipe';
import ProductPicker from '../../components/Stock/Productpicker.vue';

import Editor from 'primevue/editor';

export default defineComponent({
	props: {
		recipeId:
		{
			type: Number,
			required: true,
		},
	},
	data()
	{
		return {
			recipe: <Recipe> {},
			noCheckShoppinglistTooltip: "By default the amount to be added to the shopping list is \"needed amount - stock amount - shopping list amount\" - when this is enabled, it is only checked against the stock amount, not against what is already on the shopping list",
		};
	},
	mounted() 
	{
		api.Recipes.Get(this.recipeId).then(fetched => 
		{
			this.recipe = fetched;
		});
	},
	components: {
		'Editor' : Editor,
		'ProductPicker' : ProductPicker,
	}
});
</script>