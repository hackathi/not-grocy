import { createRouter, createWebHashHistory } from 'vue-router';
import StockOverview from './pages/Stock/Overview.vue';
import RecipesOverview from './pages/Recipes/Recipes.vue';
import RecipesEdit from './pages/Recipes/Edit.vue';

const routes = [
	{
		path: '/',
		name: 'Home',
		component: StockOverview
	},
	{
		path: '/recipes/:recipeId(\\d+)*',
		name: 'Recipes',
		component: RecipesOverview,
		props: true,
	},
	{
		path: '/recipes/:recipeId(\\d+)/edit',
		name: 'RecipesEdit',
		component: RecipesEdit,
		props: true,
	}

];
const router = createRouter({
	history: createWebHashHistory(),
	routes
});
export default router;