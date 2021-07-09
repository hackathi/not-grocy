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
							<ProductPicker 
								:tooltip="$t('When a product is selected, one unit (per serving in stock quantity unit) will be added to stock on consuming this recipe')"
								:label="$t('Produces product')"
							/>
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
				<template #title>
					<div class="p-d-flex p-jc-between">
						<span>{{ $t('Ingredients list') }}</span>
						<Button class="p-button-outlined" :label="$t('Add')" @click="addIngredient()" />
					</div>
				</template>
				<template #content>
					<!-- eslint-disable vue/no-v-model-argument -->
					<DataTable 
					stripedRows 
					:value="ingredientsList" 
					responsiveLayout="scroll"
					rowGroupMode="subheader"
					groupRowsBy="ingredient_group"
					class="p-datatable-sm"
					v-model:expandedRows="expandedRowsIngredients"
					dataKey="id"
					>
					<template #empty>
						<p style="text-align: center">{{ $t('No ingredients in this recipe.') }}</p>
					</template>
					<template #groupheader="slotProps">
						{{ slotProps.data.ingredient_group }}
					</template>
					<Column :expander="true" headerStyle="width: 3rem" />
					<Column field="product.name" columnKey="product_name" :header="$t('Product')" sortable></Column>
					<Column columnKey="amount" :header="$t('Amount')" sortable>
						<template #body="{ data }">
							{{ data.recipe_amount }} {{ getQuantityUnitName(data.qu_id, data.recipe_amount) }}
						</template>
					</Column>
					<Column field="btns" columnKey="btns" :reorderableColumn="false" headerStyle="width: 6rem;">
						<template #header>
							<div class="p-d-flex p-jc-center p-ac-center" style="width: 100%;"><i class="fas fa-eye"></i></div>
						</template>
						<template #body="{ data }">
								<Button icon="pi pi-pencil" class="p-button-secondary p-button-text p-button-sm p-button-rounded" @click="editIngredient(data)" />
								<Button icon="pi pi-trash" class="p-button-danger p-button-text p-button-rounded" @click="deleteIngredient(data)" />
						</template>
					</Column>
					<template #expansion="{ data }">
						<div v-if="data.note != null">{{ $t('Note') }}: <span class="ingredient-note">{{ data.note }}</span></div>
						<div v-else><span class="ingredient note">{{ $t('No Note') }}</span></div>
					</template>
					</DataTable>
				</template>
			</Card>
			<Card class="p-mb-3">
				<template #title>
					<div class="p-d-flex p-jc-between">
						<span>{{ $t('Included recipes') }}</span>
						<Button class="p-button-outlined" :label="$t('Add')" @click="addIngredient()" />
					</div>
				</template>
				<template #content>
					<DataTable
					stripedRows 
					:value="recipe.subRecipes"
					responsiveLayout="scroll"
					class="p-datatable-sm"
					dataKey="id"
					>
					<template #empty>
						<p style="text-align: center">{{ $t('No recipes included in this recipe.') }}</p>
					</template>
					<Column field="name" columnKey="name" :header="$t('Recipe')" sortable></Column>
					<Column field="servings" columnKey="servings" :header="$t('Servings')" sortable></Column>
					<Column field="btns" columnKey="btns" :reorderableColumn="false" headerStyle="width: 6rem;">
						<template #header>
							<div class="p-d-flex p-jc-center p-ac-center" style="width: 100%;"><i class="fas fa-eye"></i></div>
						</template>
						<template #body="{ data }">
								<Button icon="pi pi-pencil" class="p-button-secondary p-button-text p-button-sm p-button-rounded" @click="editIncludedRecipe(data)" />
								<Button icon="pi pi-trash" class="p-button-danger p-button-text p-button-rounded" @click="deleteIncludedRecipe(data)" />
						</template>
					</Column>
					</DataTable>
				</template>
			</Card>
			<Card class="p-mb-3">
				<template #title>{{ $t('Picture') }}</template>
				<template #content>
					<FileUpload name="demo[]" url="./upload" accept="image/*">
					<template #empty>
						<p v-if="recipe.picture_file_name == null">{{ $t('Drag and drop an image to here to upload.') }}</p>
						<div v-else>
							<Button class="p-button-rounded p-button-danger p-button-raised" icon="pi pi-trash" style="position: relative; top: 2rem; right: 2rem; float:right;" />
							<img :src="getRecipePictureUrl(recipe.picture_file_name)" style="max-width: 100%; height: auto; margin-top: -2rem;" v-tooltip="$t('Drag and drop an image to here to replace.')"/>
						</div>
					</template>
				</FileUpload>
				</template>
			</Card>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import api from '../../api';

import { Ingredient, Recipe } from '../../types/Recipe';
import ProductPicker from '../../components/Stock/Productpicker.vue';

import Editor from 'primevue/editor';
import FileUpload from 'primevue/fileupload';

import { useStore } from '../../store';
import { QuantityUnit } from '../../store/interfaces';

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
			expandedRowsIngredients: <Array<Ingredient>> [],
		};
	},
	mounted() 
	{
		api.Recipes.Get(this.recipeId).then(fetched => 
		{
			this.recipe = fetched;
			this.expandedRowsIngredients = this.ingredientsList.filter(x => x.note != null);
		});
	},
	setup()
	{
		const store = useStore();
		return { store };
	},
	computed: {
		ingredientsList() : Array<Ingredient> 
		{
			let ret = <Array<Ingredient>> [];

			for(const group in this.recipe.ingredients)
			{
				ret = ret.concat(this.recipe.ingredients[group]);
			}

			return ret;
		}
	},
	methods: {
		addIngredient() : void
		{

		},
		editIngredient(ingredient: Ingredient) : void
		{
			
		},
		deleteIngredient(ingredient: Ingredient) : void
		{

		},
		getQuantityUnitName(id: number, recipeAmount: number) : QuantityUnit
		{
			const qu = this.store.getters.getQuantityUnit(id);
			return  recipeAmount != 1 && qu.name_plural != null ? qu.name_plural : qu.name;
		},
		getRecipePictureUrl(filename: string, thumbnail: boolean = false, css: boolean = false) : string
		{
			let url = '/api/files/recipepictures/' + btoa(filename) + '?force_serve_as=picture';

			if(thumbnail)
				url += '&best_fit_width=400';

			if(css)
				url = 'url("' + url + '")';

			return url;
		},
	},
	components: {
		'Editor' : Editor,
		'ProductPicker' : ProductPicker,
		'FileUpload' : FileUpload,
	}
});
</script>