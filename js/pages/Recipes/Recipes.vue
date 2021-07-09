<template>
	<div class="p-grid">
		<div :class="{'p-d-none': !listVisible, 'p-col-12': true, 'p-lg-6': true}">
			<Card>
				<template #title>
					<div class="p-d-flex p-flex-column p-flex-md-row p-jc-between">
						<div>
							{{ $t('Recipes') }}
						</div>
						<div>
							<Button :label="$t('Add')" />
						</div>
					</div>
				</template>
				<template #content>
					<div class="p-grid p-jc-between">
						<div class="p-col-12 p-md-4 p-flex p-flex-nowrap">
							<div class="p-inputgroup">
								<span class="p-inputgroup-addon">
									<i class="pi pi-search"></i>
								</span>
								<InputText :placeholder="$t('Search')" @keyup="onSearchKeyUp" v-model="keywordSearch" />
								<span class="p-inputgroup-addon" style="background:transparent;border:0;">
									<i :class="{pi:true, 'pi-spin':isKeywordSearching, 'pi-spinner':isKeywordSearching}"></i>
								</span>
							</div>
						</div>
						<div class="p-col-12 p-md-4">
							<div class="p-inputgroup">
								<span class="p-inputgroup-addon">
									<i class="pi pi-filter"></i>
								</span>
								<Dropdown v-model="status" :options="statuses" optionLabel="name" :placeholder="$t('Select a status')" />
							</div>
						</div>
					</div>
				</template>
			</Card>

			<DataView :value="recipes" :layout="layout" class="p-mt-2 p-shadow-1">
				<template #header>
					<div class="p-d-flex p-jc-between">
						<DataViewLayoutOptions v-model="layout"></DataViewLayoutOptions>
						<Button type="button" icon="pi pi-filter-slash" :label="$t('Clear filter')" class="p-button-outlined" @click="clearAllFilters()"/>
					</div>
				</template>
				<template #list="slotProps" >
					<div class="p-col-12 p-p-2 recipes-list" @click="onRecipeGridClick(slotProps.data)">
						<div class="p-grid p-nogutter">
							<div class="p-d-md p-md-2 recipe-image" :style="{ backgroundImage: getRecipePictureUrl(slotProps.data.picture_file_name, true, true) }"></div>
							<div class="p-col-12 p-md-10 p-grid p-pl-2">
								<div class="p-col-12 p-d-flex p-jc-between">
									<h5 class="p-pr-2">{{slotProps.data.name}}</h5>
									<span class="p-buttonset">
										<Button icon="pi pi-pencil" class="p-button-text p-button-sm p-button-rounded" @click="editRecipe($event, slotProps.data)"/>
										<Button icon="pi pi-trash" class="p-button-danger p-button-text p-button-sm p-button-rounded" @click="removeRecipe($event, slotProps.data)"/>
									</span>
								</div>
								<div class="p-col-12 p-md-3">{{ $t('{count} serving | {count} servings', slotProps.data.desired_servings) }}</div>
								<div class="p-col-12 p-md-9">
									<StockFulfillmentStatus :data="slotProps.data" />
								</div>
							</div>
						</div>
					</div>
				</template>
				<template #grid="slotProps">
					<div class="recipes-masonry p-p-2">
						<Card @click="onRecipeGridClick(slotProps.data)">
							<template #header>
								<img v-if="slotProps.data.picture_file_name" :src="getRecipePictureUrl(slotProps.data.picture_file_name, true)">
							</template>
							<template #title>
								<div class="p-d-flex p-jc-between">
									<h5 class="p-pr-2">{{slotProps.data.name}}</h5>
									<span class="p-buttonset">
										<Button icon="pi pi-pencil" class="p-button-text p-button-sm p-button-rounded" @click="editRecipe($event, slotProps.data)"/>
										<Button icon="pi pi-trash" class="p-button-danger p-button-text p-button-sm p-button-rounded" @click="removeRecipe($event, slotProps.data)"/>
									</span>
								</div>
							</template>
							<template #content>
								<div class="p-grid">
									<div class="p-col-12 p-md-3">{{ $t('{count} serving | {count} servings', slotProps.data.desired_servings) }}</div>
									<div class="p-col-12 p-md-9">
										<StockFulfillmentStatus :data="slotProps.data" />
									</div>
								</div>
							</template>
						</Card>
					</div>
				</template>
			</DataView>
		</div>
		<div :class="{'p-d-none': !recipeVisible, 'p-col-12': true, 'p-lg-6': true}">
			<Card :class="{'recipe-display': true, 'recipe-fullscreen': recipeFullscreen }">
				<template #header>
					<div v-if="selectedRecipe != null" class="recipe-image" :style="{backgroundImage: getRecipePictureUrl(selectedRecipe.picture_file_name, false, true) }" />
				</template>
				<template #title>
					<h5 v-if="selectedRecipe == null">{{ $t('Choose a recipe to start.') }}</h5>
					<div v-else class="p-d-flex p-jc-between">
						<h2>{{ selectedRecipe.name }}</h2>
						<span class="p-buttonset">
							<Button icon="fas fa-arrow-left" class="p-button-secondary p-button-text p-d-lg-none" @click="closeRecipe()" :label="$t('Back to the list')" />
							<Button icon="fas fa-utensils" class="p-button-secondary p-button-text p-button-rounded p-button-lg" @click="consumeRecipe(selectedRecipe)" v-tooltip="$t('Consume all ingredients needed by this recipe')"/>
							<Button icon="fas fa-cart-plus" class="p-button-secondary p-button-text p-button-lg p-button-rounded" @click="shopRecipe(selectedRecipe)" v-tooltip="$t('Put missing products on shopping list')" />
							<Button icon="fas fa-expand-arrows-alt" class="p-button-secondary p-button-text p-button-lg p-button-rounded" @click="toggleFullscreen()" v-tooltip="$t('Expand to fullscreen')" />
							<Button icon="fas fa-print" class="p-button-secondary p-button-text p-button-lg p-button-rounded" @click="printRecipe(selectedRecipe)" v-tooltip="$t('Print')"/>
						</span>
					</div>
				</template>
				<template #content>
					<ProgressSpinner v-if="recipeLoading" />
					<RecipeDisplayBody v-if="!recipeLoading && fetchedRecipe != null" :fetchedRecipe="fetchedRecipe" @recipe-servings-changed="onRecipeServingsChanged" />
				</template>
			</Card>
		</div>
		<!-- eslint-disable-next-line vue/no-v-model-argument -->
		<Dialog v-model:visible="recipeFullscreen" :draggable="false" :dismissableMask="false" :closeOnEscape="true" :closable="false" class="recipes-fullscreen p-dialog-maximized">
			<template #header>
				<div v-if="selectedRecipe != null" class="recipe-image" :style="{backgroundImage: getRecipePictureUrl(selectedRecipe.picture_file_name, false, true) }" />
				<h5 v-if="selectedRecipe == null">{{ $t('Choose a recipe to start.') }}</h5>
					<div v-else class="p-d-flex p-jc-between">
						<h2>{{ selectedRecipe.name }}</h2>
						<span class="p-buttonset">
							<Button icon="fas fa-arrow-left" class="p-button-secondary p-button-text p-d-lg-none" @click="closeRecipe()" :label="$t('Back to the list')" />
							<Button icon="fas fa-utensils" class="p-button-secondary p-button-text p-button-rounded p-button-lg" @click="consumeRecipe(selectedRecipe)" v-tooltip="$t('Consume all ingredients needed by this recipe')"/>
							<Button icon="fas fa-cart-plus" class="p-button-secondary p-button-text p-button-lg p-button-rounded" @click="shopRecipe(selectedRecipe)" v-tooltip="$t('Put missing products on shopping list')" />
							<Button icon="fas fa-expand-arrows-alt" class="p-button-secondary p-button-text p-button-lg p-button-rounded" @click="toggleFullscreen()" v-tooltip="$t('Expand to fullscreen')" />
							<Button icon="fas fa-print" class="p-button-secondary p-button-text p-button-lg p-button-rounded" @click="printRecipe(selectedRecipe)" v-tooltip="$t('Print')"/>
						</span>
					</div>
			</template>
			<RecipeDisplayBody v-if="!recipeLoading && fetchedRecipe != null" :fetchedRecipe="fetchedRecipe" @recipe-servings-changed="onRecipeServingsChanged" />
		</Dialog>
	</div>
</template>
<script lang="ts">
import DataView from 'primevue/dataview';
import DataViewLayoutOptions from 'primevue/dataviewlayoutoptions';
import api from '../../api';
import { debounce } from 'lodash';

import { useStore } from '../../store';
import { defineComponent } from 'vue';
import { QuantityUnit } from '../../store/interfaces';
import { Recipe } from '../../types/Recipe';
import ViewportSize from '../../lib/breakpoints';

import StockFulfillmentStatus from '../../components/Recipes/StockFulfillmentStatus.vue';
import RecipeDisplayBody from '../../components/Recipes/RecipeDisplayBody.vue';

const RECIPESLIST_LAYOUT = 'recipeslist-layout';
const RECIPE_MODE = 'mode-recipe';
const LIST_MODE = 'mode-list';

export default defineComponent({
	props: {
		recipeId:
		{
			type: Number,
			required: false,
			default: null,
		}
	},
	data() 
	{
		return {
			recipes: <Array<any>> [],
			allRecipes: <Array<any>> [],
			intLayout: "list",
			fetchedRecipe: <any> null,
			selectedRecipe: <any> null,
			recipeLoading: false,
			recipeFullscreen: false,
			statuses: <Array<any>> [],
			intStatus: <any> null,
			intKeywordSearch: "",
			isKeywordSearching: false,
			mode: 'list',
			isMobileLayout: false,
		};
	},
	setup()
	{
		const store = useStore();
		const viewportSize = ViewportSize();


		return { store, viewportSize };
	},
	mounted() 
	{
		api.Recipes.GetAll().then(data => 
		{
			const recipes : Array<any> = data;

			for(const recipe of recipes)
			{
				recipe.desired_servings = parseInt(recipe.desired_servings);
				recipe.base_servings = parseInt(recipe.base_servings);
			}

			this.recipes = recipes;
			this.allRecipes = recipes;
			if(this.$route.params.recipeId != null) 
			{
				const recipe = recipes.find(x => x.id == this.$route.params.recipeId);
				this.onRecipeGridClick(recipe);
			}
		});


		const storage = window.localStorage;
		const layout = storage.getItem(RECIPESLIST_LAYOUT);
		if(layout != null)
			this.layout = layout;

		this.statuses = [
			{name: this.$t('All'), code: 'all'},
			{name: this.$t('Enough in stock'), code: 'enough'},
			{name: this.$t('Not enough in stock, but already on the shopping list'), code: 'enough_with_shopping_list'},
			{name: this.$t('Not enough in stock'), code: 'not_enough'},
		];
		this.status = this.statuses[0];

		
		this.handleResize();
		window.addEventListener('resize', this.handleResize);
	},
	beforeUnmount() 
	{
		window.removeEventListener('resize', this.handleResize);
	},
	computed: {
		listVisible() :boolean
		{
			return !this.isMobileLayout || this.mode == LIST_MODE;
		},
		recipeVisible() : boolean
		{
			return !this.isMobileLayout || this.mode == RECIPE_MODE;
		},
		keywordSearch: {
			get() : string
			{
				return this.intKeywordSearch;
			},
			set(newValue: string) 
			{
				this.intKeywordSearch = newValue;
				this.isKeywordSearching = true;
			}
		},
		layout: {
			get() :string
			{
				return this.intLayout;
			},
			set(newValue:string)
			{
				const storage = window.localStorage;

				storage.setItem(RECIPESLIST_LAYOUT, newValue);
				this.intLayout = newValue;
			}
		},
		status: {
			get() :any
			{
				return this.intStatus;
			},
			set(newValue: any)
			{
				this.intStatus = newValue;
				this.recipes = this.allRecipes.filter(elem => 
				{
					if(newValue.code == 'all') return true;
					if(newValue.code == 'enough') return elem.need_fulfilled || false;
					if(newValue.code == 'enough_with_shopping_list') return (!elem.need_fulfilled && elem.need_fulfilled_with_shopping_list) || false;
					if(newValue.code == 'not_enough') return !(elem.need_fulfilled || elem.need_fulfilled_with_shopping_list) || false;
					console.warn("(recipes) Unknwon filter " + newValue.code);
					return false;
				});
			}
		},
		recipeServings: {
			get() : number | undefined
			{
				return this.selectedRecipe?.desired_servings;
			},
			set(newValue: number) : void
			{
				const oldValue = this.selectedRecipe.desired_servings;
				this.selectedRecipe.desired_servings = newValue;
				this.fetchedRecipe.desired_servings = newValue;

				api.Recipes.UpdateRecipe(this.selectedRecipe.id, { desired_servings: newValue })
					.then((data) => 
					{
						if(data.desired_servings != this.selectedRecipe.desired_servings)
							return;

						this.selectedRecipe.need_fulfilled = data.need_filfilled;
						this.selectedRecipe.need_fulfilled_with_shopping_list = data.need_fulfilled_with_shopping_list;
						this.selectedRecipe.missing_products_count = data.missing_products_count;
						this.fetchedRecipe.ingredients = data.ingredients;
						this.fetchedRecipe.subRecipes = data.subRecipes;
					})
					.catch((fail) =>
					{
						this.$toast.add({severity: 'error', summary: this.$t('Server error'), detail: this.$t('Error while saving {recipeName} – see developer console for details.', { recipeName: this.selectedRecipe.name }) });
						console.error(fail);
						this.selectedRecipe.desired_servings = oldValue;
						this.fetchedRecipe.desired_servings = oldValue;
					});
			}
		}
	},
	methods: {
		onRecipeServingsChanged(newValue: number)
		{
			this.recipeServings = newValue;
		},
		handleResize() : void
		{
			this.isMobileLayout = !(this.viewportSize.breakpoint.value != 'sm' && this.viewportSize.breakpoint.value != 'xs' && this.viewportSize.breakpoint.value != 'md');
		},
		clearAllFilters() :void
		{
			this.keywordSearch = "";
			this.isKeywordSearching = false;
			this.recipes = this.allRecipes;
			this.status = this.statuses[0];
		},
		onSearchKeyUp: debounce(function(this: any)
		{
			const searchTerm = this.keywordSearch;
			this.recipes = this.allRecipes.filter((elem: Recipe) => 
			{
				if(elem.name.toLowerCase().includes(searchTerm.toLowerCase())) return true;

				return false;
			});
			this.isKeywordSearching = false;
		}, 250),
		getQuantityUnit(id: number) : QuantityUnit
		{
			return this.store.getters.getQuantityUnit(id);
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
		onRecipeGridClick(data: any) : void
		{
			this.mode = RECIPE_MODE;
			if(data.id != this.recipeId)
				this.$router.push({name: "Recipes", params: { recipeId: data.id }});

			this.recipeLoading = true;
			api.Recipes.Get(data.id).then(fetched => 
			{
				this.fetchedRecipe = fetched;
				this.selectedRecipe = data;
				this.recipeLoading = false;
			});
		},
		closeRecipe() : void 
		{
			this.mode = LIST_MODE;
			this.$router.push({name: "Recipes" });
			this.selectedRecipe = null;
			this.fetchedRecipe = null;
		},
		editRecipe(event: Event, data:any) :void
		{
			event.preventDefault();
			event.stopPropagation();
			this.$router.push({name: "RecipesEdit", params: { recipeId: data.id }});
		},
		removeRecipe(event: Event, data:any) :void
		{
			event.preventDefault();
			event.stopPropagation();
		},
		toggleFullscreen() : void
		{
			this.recipeFullscreen = !this.recipeFullscreen;
			document.body.classList.toggle('p-overflow-hidden');
		}
	},
	components: {
		'DataView' : DataView,
		'DataViewLayoutOptions' : DataViewLayoutOptions,
		'StockFulfillmentStatus' : StockFulfillmentStatus,
		'RecipeDisplayBody' : RecipeDisplayBody
	}
});
</script>