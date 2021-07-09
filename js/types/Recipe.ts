import { Product } from './Stock';

export interface Recipe {
	id: number,
	name: string,
	description: string,
	row_created_timestamp: string, // ouch
	picture_file_name: string | null,
	base_servings: number,
	desired_servings: number,
	servings?: number,
	not_check_shoppinglist: boolean,
	type: string,
	product_id: number | null,
	need_fulfilled: true,
	need_fulfilled_with_shoppinglist: true,
	missing_products_count: 0,
	costs: number,
	calories: number,
	ingredients: { [key: string]: Array<Ingredient> },
	subRecipes: Array<Recipe>
}

export interface Ingredient {
	id: number,
	recipe_id: number,
	recipe_pos_id: number,
	product_id: number,
	recipe_amount: number,
	stock_amount: number,
	need_fulfilled: boolean,
	missing_amount: number,
	amount_on_shoppinglist: number,
	need_fulfilled_with_shoppinglist: true,
	qu_id: number,
	costs: number,
	is_nested_recipe_pos: number,
	ingredient_group: string | null,
	product_group: string | null,
	recipe_type: string,
	child_recipe_id: number | null,
	note: string | null,
	recipe_variable_amount: any, // ?? what is this
	only_check_single_unit_in_stock: boolean,
	calories: number,
	product_active: boolean,
	product: Product,
}