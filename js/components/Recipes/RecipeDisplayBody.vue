<template>
<div class="p-grid">
	<div class="p-col-12 p-d-flex p-jc-between">
		<div v-tooltip="$t('per serving')">
			<p>{{ $t('Energy (kcal)') }}</p>
			<p class="h3">{{ $n(fetchedRecipe.calories, 'avoid-decimal') }}</p>
		</div>
		<div v-tooltip="$t(priceTooltip)">
			<p>{{ $t('Costs') }}</p>
			<p class="h3">{{ $n(fetchedRecipe.costs, 'currency') }}</p>
		</div>
		<div>
			<p v-tooltip="$t('Base: {string0}', { string0: recipeServings })">{{ $t('Desired servings') }}</p>
			<p><InputNumber id="horizontal" v-model="recipeServings" showButtons buttonLayout="horizontal" :step="1" decrementButtonClass="p-button-secondary" incrementButtonClass="p-button-secondary" incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus" /></p>
		</div>
	</div>
	<TabView class="p-col-12">
		<TabPanel :header="$t('Ingredients')">
			<ul class="ingredient-group-list">
				<li v-for="ingredients, group in fetchedRecipe.ingredients" :key="group"> 
					<p class="ingredient-group-name h3" v-if="group != 'default'">{{ group }}</p>
					<ul class="ingredient-list">
						<li v-for="ingredient in ingredients" :key="ingredient.recipe_pos_id" class="p-mb-3">
							<div class="p-d-flex p-jc-between p-mb-2">
								<div>{{ $n(ingredient.recipe_amount, 'avoid-decimal') }} {{ getQuantityUnit(ingredient.qu_id).name }} {{ ingredient.product.name }}</div>
								<div>
									<span v-if="ingredient.need_fulfilled && ingredient.costs != null">{{ $n(ingredient.costs, 'currency') }}</span>
									<span v-if="ingredient.product.calories != null && ingredient.product.calories > 0">{{ $n(ingredient.product.calories, 'avoid-decimal') }} {{ $t('Calories') }}</span>
								</div>
							</div>
							<div>
								<StockFulfillmentStatus :data="ingredient" mode='amount' class="text-small" />
							</div>
						</li>
					</ul>
				</li>
			</ul>
		</TabPanel>
		<TabPanel :header="$t('Preparation')">
			<div v-html="fetchedRecipe.description"></div>
		</TabPanel>
	</TabView>
</div>
</template>

<script lang="ts">
import StockFulfillmentStatus from './StockFulfillmentStatus.vue';

import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

import { defineComponent } from 'vue';
import { QuantityUnit } from '../../store/interfaces';
import { useStore } from '../../store';

export default defineComponent({
	props: {
		fetchedRecipe: {
			type: Object,
			required: true
		},
	},
	data()
	{
		return {
			priceTooltip: "Based on the prices of the default consume rule which is \"Opened first, then first due first, then first in first out\"",
		};
	},
	setup()
	{
		const store = useStore();

		return { store };
	},
	computed: {
		recipeServings:
		{
			get() :number
			{
				return this.fetchedRecipe.desired_servings;
			},
			set(newValue: number)
			{
				this.$emit('recipe-servings-changed', newValue);
			}
		}
	},
	methods: {
		getQuantityUnit(id: number) : QuantityUnit
		{
			return this.store.getters.getQuantityUnit(id);
		},
	},
	components: {
		'StockFulfillmentStatus': StockFulfillmentStatus,
		'TabView' : TabView,
		'TabPanel' : TabPanel,
	}
});
</script>