export interface Product {
	id: number,
	name: string,
	description: string | null,
	product_group_id: number,
	active: boolean,
	location_id: number,
	shopping_location_id: number | null,
	qu_id_purchase: number,
	qu_id_stock: number,
	qu_factor_purchase_to_stock: number,
	min_stock_amount: number,
	default_best_before_days: number,
	default_best_before_days_after_open: number,
	default_best_before_days_after_freezing: number,
	default_best_before_days_after_thawing: number,
	picture_file_name: string | null,
	enable_tare_weight_handling: boolean,
	tare_weight: number,
	not_check_stock_fulfillment_for_recipes: boolean,
	parent_product_id: number | null,
	calories: number,
	cumulate_min_stock_amount_of_sub_products: boolean,
	due_type: number,
	quick_consume_amount: number,
	hide_on_stock_overview: boolean,
	row_created_timestamp: string, // sigh...
	default_print_stock_label: boolean,
	allow_label_per_unit: boolean
	barcodes?: Array<Barcode>
	// userfields.
}

export interface Barcode {
	id: number,
	product_id: number | null,
	barcode: string,
	qu_id: number | null,
	amount: number | null,
	shopping_location_id: number | null,
	last_price: number | null,
	row_created_timestamp: string,
	note: string | null,
	// userfields.
}

export interface QuantityUnit {
	id: number;
	name: string;
	description: string | null;
	name_plural: string | null,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	plural_forms: any; // wat?
	// TODO: type userfields better.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	userfields: any;
}

export interface QuantityUnitConversion {
	id: number;
	from_qu_id: number;
	to_qu_id: number;
	factor: number;
	product_id: number;
	row_created_timestamp: string;
}