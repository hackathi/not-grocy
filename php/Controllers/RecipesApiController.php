<?php

namespace Grocy\Controllers;

use Grocy\Controllers\Users\User;
use Grocy\Services\RecipesService;

class RecipesApiController extends BaseApiController
{
	public function GetAll(\Psr\Http\Message\ServerRequestInterface $request, \Psr\Http\Message\ResponseInterface $response, array $args)
	{
		// this should be a database select & join,
		// but the schema is fucked, so here we are.

		$recipes = $this->getDatabase()->recipes()->where('type', RecipesService::RECIPE_TYPE_NORMAL)->orderBy('name', 'COLLATE NOCASE');
		$recipesResolved = $this->getRecipesService()->GetRecipesResolved();

		foreach($recipes as $recipe)
		{
			$recipe->need_fulfilled = FindObjectInArrayByPropertyValue($recipesResolved, 'recipe_id', $recipe->id)->need_fulfilled == 1;
			$recipe->need_fulfilled_with_shopping_list = FindObjectInArrayByPropertyValue($recipesResolved, 'recipe_id', $recipe->id)->need_fulfilled_with_shopping_list == 1;
			$recipe->missing_products_count = (int)FindObjectInArrayByPropertyValue($recipesResolved, 'recipe_id', $recipe->id)->missing_products_count;
			$recipe->costs = (float)FindObjectInArrayByPropertyValue($recipesResolved, 'recipe_id', $recipe->id)->costs;
			$recipe->calories = (float)FindObjectInArrayByPropertyValue($recipesResolved, 'recipe_id', $recipe->id)->calories;
		}

		return $this->ApiResponse($response, $recipes);
	}

	public function GetRecipe(\Psr\Http\Message\ServerRequestInterface $request, \Psr\Http\Message\ResponseInterface $response, array $args)
	{
		if (!isset($args['recipeId']))
		{
			return $this->GenericErrorResponse($response, "Recipe Not Found");
		}
		// TODO: Userfields!
		/*
				$renderArray = [
			'userfields' => $this->getUserfieldsService()->GetFields('recipes'),
			'userfieldValues' => $this->getUserfieldsService()->GetAllValues('recipes'),
		];
		*/

		$recipe = $this->getDatabase()->recipes($args['recipeId']);
		if(!$recipe)
		{
			return $this->GenericErrorResponse($response, "Recipe Not Found");
		}
		$recipe = $this->getRecipesService()->clean($recipe);

		$recipesResolved = $this->getRecipesService()->GetRecipesResolved();

		$recipe->need_fulfilled = FindObjectInArrayByPropertyValue($recipesResolved, 'recipe_id', $recipe->id)->need_fulfilled == 1;
		$recipe->need_fulfilled_with_shopping_list = FindObjectInArrayByPropertyValue($recipesResolved, 'recipe_id', $recipe->id)->need_fulfilled_with_shopping_list == 1;
		$recipe->missing_products_count = (int)FindObjectInArrayByPropertyValue($recipesResolved, 'recipe_id', $recipe->id)->missing_products_count;
		$recipe->costs = (float)FindObjectInArrayByPropertyValue($recipesResolved, 'recipe_id', $recipe->id)->costs;
		$recipe->calories = (float)FindObjectInArrayByPropertyValue($recipesResolved, 'recipe_id', $recipe->id)->calories;

		// another thing that should be a join, but is "impossible" to do.
		// n.b. it is possible, but way harder than it should be.
		$products = $this->getDatabase()->select('products')->fetchAll();
		
		$ingredients = $this->getDatabase()->recipes_pos_resolved()->where('recipe_id = :1 AND is_nested_recipe_pos = 0', $recipe->id)->orderBy('ingredient_group', 'ASC', 'product_group', 'ASC');

		$recipe->ingredients = $this->resolveIngredients($ingredients, $products);

		$selectedRecipeSubRecipes = $this->getDatabase()
										->recipes()
										->where('id IN (SELECT includes_recipe_id FROM recipes_nestings_resolved WHERE recipe_id = :1 AND includes_recipe_id != :1)', $recipe->id)
										->orderBy('name', 'COLLATE NOCASE')
										->fetchAll();

		$recipe->subRecipes = [];

		foreach ($selectedRecipeSubRecipes as $subRecipe)
		{
			$id = $subRecipe->id;
			$ingredients = $this->getDatabase()->recipes_pos_resolved()->where('recipe_id = :1 AND is_nested_recipe_pos = 0', $id)->orderBy('ingredient_group', 'ASC', 'product_group', 'ASC');
			foreach ($ingredients as $pos)
			{
				// who the fuck knows. maybe at some point recursive nesting was allowed? But I'm pretty sure that it would break other things.
				if ($id == $recipe->id) continue; 
				
				$pos2 = $this->getDatabase()->recipes_pos_resolved()->where('recipe_id = :1  AND recipe_pos_id = :2 AND is_nested_recipe_pos = 1', $recipe->id, $pos->recipe_pos_id)->fetch();
				$pos->recipe_amount = $pos2->recipe_amount;
				$pos->missing_amount = $pos2->missing_amount;
			}
			$recipe->subRecipes[] = $this->resolveIngredients($ingredients, $products);
		}
		
		return $this->ApiResponse($response, $recipe);
	}

	// the ingredients are grouped, maybe, maybe not. who the fuck knows, really.
	// Because SQL doing SQL things, we have to resolve that correctly here.
	// that shit *should* be sorted and this resolving function *should* preserve that.
	function resolveIngredients($ingredients, $products) 
	{
		$ret = [];

		foreach($ingredients as $ingredient)
		{
			$ing = $this->getRecipesService()->CleanIngredient($ingredient);
			$key = $ing->ingredient_group;
			$ing->product = $this->findProduct($ing->product_id, $products);
			if($key == null) $key = "default";

			if(!isset($ret[$key])) $ret[$key] = [];

			$ret[$key][] = $ing;
		}
		
		return $ret;
	}

	// fuck it.
	function findProduct($productId, $products)
	{
		foreach($products as $product)
		{
			if($product['id'] == $productId)
			{
				return $this->getStockService()->CleanProduct($product);
			}
		}
	}

	public function AddNotFulfilledProductsToShoppingList(\Psr\Http\Message\ServerRequestInterface $request, \Psr\Http\Message\ResponseInterface $response, array $args)
	{
		User::checkPermission($request, User::PERMISSION_SHOPPINGLIST_ITEMS_ADD);

		$requestBody = $this->GetParsedAndFilteredRequestBody($request);
		$excludedProductIds = null;

		if ($requestBody !== null && array_key_exists('excludedProductIds', $requestBody))
		{
			$excludedProductIds = $requestBody['excludedProductIds'];
		}

		$this->getRecipesService()->AddNotFulfilledProductsToShoppingList($args['recipeId'], $excludedProductIds);
		return $this->EmptyApiResponse($response);
	}

	public function ConsumeRecipe(\Psr\Http\Message\ServerRequestInterface $request, \Psr\Http\Message\ResponseInterface $response, array $args)
	{
		User::checkPermission($request, User::PERMISSION_STOCK_CONSUME);

		try
		{
			$this->getRecipesService()->ConsumeRecipe($args['recipeId']);
			return $this->EmptyApiResponse($response);
		}
		catch (\Exception $ex)
		{
			return $this->GenericErrorResponse($response, $ex->getMessage());
		}
	}

	public function GetRecipeFulfillment(\Psr\Http\Message\ServerRequestInterface $request, \Psr\Http\Message\ResponseInterface $response, array $args)
	{
		try
		{
			if (!isset($args['recipeId']))
			{
				return $this->FilteredApiResponse($response, $this->getRecipesService()->GetRecipesResolved(), $request->getQueryParams());
			}

			$recipeResolved = FindObjectInArrayByPropertyValue($this->getRecipesService()->GetRecipesResolved(), 'recipe_id', $args['recipeId']);

			if (!$recipeResolved)
			{
				throw new \Exception('Recipe does not exist');
			}
			else
			{
				return $this->ApiResponse($response, $recipeResolved);
			}
		}
		catch (\Exception $ex)
		{
			return $this->GenericErrorResponse($response, $ex->getMessage());
		}
	}

	public function __construct(\DI\Container $container)
	{
		parent::__construct($container);
	}
}
