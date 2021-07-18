<?php

namespace Grocy\Services;

use LessQL\Result;

class RecipesService extends BaseService
{
	const RECIPE_TYPE_MEALPLAN_DAY = 'mealplan-day';

	const RECIPE_TYPE_MEALPLAN_WEEK = 'mealplan-week';

	const RECIPE_TYPE_NORMAL = 'normal';

	public function AddNotFulfilledProductsToShoppingList($recipeId, $excludedProductIds = null)
	{
		$recipe = $this->getDataBase()->recipes($recipeId);

		$recipePositions = $this->GetRecipesPosResolved();

		foreach ($recipePositions as $recipePosition)
		{
			if ($recipePosition->recipe_id == $recipeId && !in_array($recipePosition->product_id, $excludedProductIds))
			{
				$product = $this->getDataBase()->products($recipePosition->product_id);

				$toOrderAmount = round(($recipePosition->missing_amount - $recipePosition->amount_on_shopping_list), 2);

				if ($recipe->not_check_shoppinglist == 1)
				{
					$toOrderAmount = round($recipePosition->missing_amount, 2);
				}

				if ($toOrderAmount > 0)
				{
					$shoppinglistRow = $this->getDataBase()->shopping_list()->createRow([
						'product_id' => $recipePosition->product_id,
						'amount' => $toOrderAmount,
						'note' => $this->getLocalizationService()->__t('Added for recipe %s', $recipe->name)
					]);
					$shoppinglistRow->save();
				}
			}
		}
	}

	public function ConsumeRecipe($recipeId)
	{
		if (!$this->RecipeExists($recipeId))
		{
			throw new \Exception('Recipe does not exist');
		}

		$transactionId = uniqid();
		$recipePositions = $this->getDatabase()->recipes_pos_resolved()->where('recipe_id', $recipeId)->fetchAll();

		foreach ($recipePositions as $recipePosition)
		{
			if ($recipePosition->only_check_single_unit_in_stock == 0)
			{
				$this->getStockService()->ConsumeProduct($recipePosition->product_id, $recipePosition->recipe_amount, false, StockService::TRANSACTION_TYPE_CONSUME, 'default', $recipeId, null, $transactionId, true, true);
			}
		}

		$recipeRow = $this->getDatabase()->recipes()->where('id = :1', $recipeId)->fetch();
		if (!empty($recipeRow->product_id))
		{
			$recipeResolvedRow = $this->getDatabase()->recipes_resolved()->where('recipe_id = :1', $recipeId)->fetch();
			$this->getStockService()->AddProduct($recipeRow->product_id, floatval($recipeRow->desired_servings), null, StockService::TRANSACTION_TYPE_SELF_PRODUCTION, date('Y-m-d'), floatval($recipeResolvedRow->costs));
		}
	}

	public function Clean($recipe) 
	{
		$recipe = (object)$recipe;
		$recipe->id = (int)$recipe->id;
		$recipe->base_servings = (int)$recipe->base_servings;
		$recipe->desired_servings = (int)$recipe->desired_servings;
		$recipe->not_check_shoppinglist = (int)$recipe->not_check_shoppinglist > 0;
		$recipe->product_id = $recipe->product_id != null ? (int)$recipe->product_id : null;

		return $recipe;
 	}

	public function CleanIngredient($ingredient)
	{
		$ingredient = (object)$ingredient;
		$ingredient->recipe_id = (int)$ingredient->recipe_id;
		$ingredient->recipe_pos_id = (int)$ingredient->recipe_pos_id;
		$ingredient->product_id = (int)$ingredient->product_id;
		$ingredient->recipe_amount = (double)$ingredient->recipe_amount;
		$ingredient->stock_amount = (double)$ingredient->stock_amount;
		$ingredient->missing_amount = (double)$ingredient->missing_amount;
		$ingredient->amount_on_shoppinglist = (double)$ingredient->amount_on_shoppinglist;
		$ingredient->qu_id = (int)$ingredient->qu_id;
		$ingredient->costs = (double)$ingredient->costs; // more rounding errors woohooo!
		$ingredient->is_nested_recipe_pos = (int)$ingredient->is_nested_recipe_pos > 0;
		$ingredient->id = (int)$ingredient->id;
		$ingredient->child_recipe_id = (int)$ingredient->child_recipe_id;
		$ingredient->only_check_single_unit_in_stock = (int)$ingredient->only_check_single_unit_in_stock > 0;
		$ingredient->calories = (double)$ingredient->calories;
		$ingredient->product_active = (int)$ingredient->product_active > 0;
		$ingredient->need_fulfilled = (int)$ingredient->need_fulfilled > 0;
		$ingredient->need_fulfilled_with_shopping_list = (int)$ingredient->need_fulfilled_with_shopping_list > 0;

		return $ingredient;
	}

	public function GetRecipesPosResolved()
	{
		$sql = 'SELECT * FROM recipes_pos_resolved';
		return $this->getDataBaseService()->ExecuteDbQuery($sql)->fetchAll(\PDO::FETCH_OBJ);
	}

	public function GetRecipesResolved(): Result
	{
		return $this->getDatabase()->recipes_resolved();
	}

	public function __construct()
	{
		parent::__construct();
	}

	private function RecipeExists($recipeId)
	{
		$recipeRow = $this->getDataBase()->recipes()->where('id = :1', $recipeId)->fetch();
		return $recipeRow !== null;
	}
}
