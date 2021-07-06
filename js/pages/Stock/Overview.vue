<template>
	<div>
		<Card class="with-title-addon">
			<template #title>
				<div class="p-d-flex p-flex-column p-flex-md-row p-jc-between">
					<div>
						{{ $t('Stock overview' )}}
						<span>{{ $t('{count} Product | {count} Products', stock.length ) }}, {{ $t('{string0} total value', { string0: aggregateValue.toLocaleString(undefined, { style: 'currency', currency: currency }) }) }}</span>
					</div>
					<div>
						<Button class="p-button-secondary p-button-outlined p-mr-2" :label="$t('Journal')" />
						<Button class="p-button-secondary p-button-outlined p-mr-2" :label="$t('Stock entries')" />
						<Button class="p-button-secondary p-button-outlined" :label="$t('Location Content Sheet')" />
					</div>
				</div>
			</template>
			<template #content>
				<div class="filter-buttons">
					<Button class="p-button-warning"  @click="setFilterDueSoon">
						<span>
							{{ $t('{count} product expires | {count} products expiring', this.aggregateExpireSoon) }}
							{{ $t('within the next day | within the next {count} days', this.dueSoonDays) }}
						</span>
					</Button>
					<Button class="p-button-secondary" :label="$t('{count} product is overdue | {count} products are overdue', aggregateOverdue)" @click="setFilterOverdue" />
					<Button class="p-button-danger" :label="$t('{count} product is expired | {count} products are expired', aggregateExpired)" @click="setFilterExpired" />
					<Button class="p-button-info" :label="$t('{count} product is below defined min. stock amount | {count} products are below defined min. stock amount', aggregateBelowMinAmount)" @click="setFilterBelowMin" />
				</div>
			</template>
		</Card>
		<!-- eslint-disable vue/no-v-model-argument -->
		<DataTable 
			stripedRows 
			:value="stock" 
			responsiveLayout="scroll"
			class="stock-table p-mt-2 p-shadow-1 p-datatable-sm" 
			contextMenu 
			v-model:contextMenuSelection="selectedProduct" 
			@rowContextmenu="onRowContextMenu"
			:paginator="true" 
			:rows="50"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            :rowsPerPageOptions="[10,20,50,100]"
			sortField="ExpireMillis" 
			:sortOrder="1"
			:rowClass="stockRowClass"
			dataKey="id"
			v-model:filters="stockFilters" 
			filterDisplay="menu"
			:globalFilterFields="['product_name']"
			:loading="changing"
			:reorderableColumns="true"
			stateStorage="local"
			:stateKey="datatableColumnKey"
			>
			<template #header>
				<div class="p-d-flex p-jc-between">
						<Button type="button" icon="pi pi-filter-slash" :label="$t('Clear filter')" class="p-button-outlined" @click="clearAllFilters()"/>
						<MultiSelect :modelValue="selectedColumns" :options="allColumns" optionLabel="header" @update:modelValue="onToggleColumns"
							:placeholder="$t('Select Columns')" style="width: 20em" />
				</div>
			</template>
			<template #loading>
				Loading
			</template>
			<Column field="btns" headerStyle="min-width: 15rem;" :reorderableColumn="false" columnKey="btns">
				<template #header>
					<i class="fas fa-eye"></i>
				</template>
				<template #body="{ data }">
					<span class="p-buttonset" v-if="loaded">
						<Button :label="$n(parseFloat(data.quick_consume_amount), 'avoid-decimal')" icon="fas fa-utensils" class="" />
						<Button :label="$t('All')" icon="fas fa-utensils" class="p-button-danger" />
						<Button :label="$n(parseFloat(data.quick_consume_amount), 'avoid-decimal')" icon="fas fa-box-open" class="" />
					</span>
					<Skeleton v-else></Skeleton>
				</template>
			</Column>
			<Column v-if="columnVisibility.product_name" field="product_name" :sortable="true" :filterMatchModeOptions="stringMatchModeOptions" filterField="product_name" columnKey="product_name">
				<template #header>
					{{ $t('Product') }}
				</template>
				<template #body="{ data }">
					<div v-if="loaded">
						{{ data.product_name }}
					</div>
					<Skeleton v-else></Skeleton>
				</template>
				<template #filter="{filterModel}">
					<InputText type="text" v-model="filterModel.value" class="p-column-filter" placeholder="Search by name"/>
				</template>
				<template #filterclear>
                    <Button type="button" icon="pi pi-times" @click="clearFilter('product_name')" class="p-button-secondary"></Button>
                </template>
				<template #filterapply="{filterCallback}">
					<Button type="button" icon="pi pi-check" @click="filterCallback()" class="p-button-success"></Button>
				</template>
			</Column>
			<Column v-if="columnVisibility.product_group_name" field="product_group_name" :sortable="true" :filterMatchModeOptions="stringMatchModeOptions" filterField="product_group_name" columnKey="product_group_name">
				<template #header>
					{{ $t('Product group') }}
				</template>
				<template #body="{ data }">
					<div v-if="loaded">
						{{ data.product_group_name }}
					</div>
					<Skeleton v-else></Skeleton>
				</template>
				<template #filter="{filterModel}">
					<InputText type="text" v-model="filterModel.value" class="p-column-filter" placeholder="Search by group"/>
				</template>
				<template #filterclear>
                    <Button type="button" icon="pi pi-times" @click="clearFilter('product_group_name')" class="p-button-secondary"></Button>
                </template>
				<template #filterapply="{filterCallback}">
					<Button type="button" icon="pi pi-check" @click="filterCallback()" class="p-button-success"></Button>
				</template>
			</Column>
			<Column v-if="columnVisibility.amount" field="amount" :sortable="true" :filterMatchModeOptions="numberMatchModeOptions" filterField="amount" columnKey="amount">
				<template #header>
					{{ $t('Amount') }}
				</template>
				<template #body="{ data }">
					<div v-if="loaded">
						{{ $n(data.amount, 'avoid-decimal') }} {{ data.amount > 1 ? data.qu_unit_name_plural : data.qu_unit_name }}
						<i18n-t keypath="{string0} opened" v-if="data.amount_opened > 0">
							<template #string0>{{ data.amount_opened }}</template>
						</i18n-t>
						<span v-if="data.amount_aggregated > data.amount">
							Σ {{ $n(data.amount_aggregated, 'avoid-decimal') }} {{ data.amount_aggregated > 1 ? data.qu_unit_name_plural : data.qu_unit_name }}
						</span>
						<i class="fas fa-shopping-cart" v-if="parseInt(data.on_shopping_list) > 0 && showProductOnShoppingList"></i>
					</div>
					<Skeleton v-else></Skeleton>
				</template>
				<template #filter="{filterModel}">
					<InputNumber mode="decimal" v-model="filterModel.value" class="p-column-filter" />
				</template>
				<template #filterapply="{filterCallback}">
					<Button type="button" icon="pi pi-check" @click="filterCallback()" class="p-button-success"></Button>
				</template>
			</Column>
			<Column v-if="columnVisibility.value" :sortable="true" :filterMatchModeOptions="numberMatchModeOptions" filterField="value" columnKey="product_value">
				<template #header>
					{{ $t('Value') }}
				</template>
				<template #body="{ data }">
					<div v-if="loaded">
						{{ $n(data.value, 'currency') }}
					</div>
					<Skeleton v-else></Skeleton>
				</template> 
				<template #filter="{filterModel}">
					<InputNumber v-model="filterModel.value" mode="decimal" :currency="currency" :locale="locale" class="p-column-filter" />
				</template>
				<template #filterclear>
                    <Button type="button" icon="pi pi-times" @click="clearFilter('value')" class="p-button-secondary"></Button>
                </template>
				<template #filterapply="{filterCallback}">
					<Button type="button" icon="pi pi-check" @click="filterCallback()" class="p-button-success"></Button>
				</template>
			</Column>
			<Column v-if="columnVisibility.best_before_date" field="best_before_date" :sortable="true" sortField="ExpireMillis" :filterMatchModeOptions="dateMatchModeOptions" filterField="best_before_date" columnKey="best_before_date">
				<template #header>
					{{ $t('Next due date') }}
				</template>
				<template #body="{ data }">
					<div v-if="loaded">
						{{ data.best_before_date || "" }}
					</div>
					<Skeleton v-else></Skeleton>
				</template>
				<template #filter="{filterModel}">
					<Calendar v-model="filterModel.value" dateFormat="yy-mm-dd" placeholder="yy-mm-dd" />
				</template>
				<template #filterclear>
                    <Button type="button" icon="pi pi-times" @click="clearFilter('best_before_date')" class="p-button-secondary"></Button>
                </template>
				<template #filterapply="{filterCallback}">
					<Button type="button" icon="pi pi-check" @click="filterCallback()" class="p-button-success"></Button>
				</template>
			</Column>
			<Column v-if="columnVisibility.product_calories" field="product_calories" :sortable="true" :filterMatchModeOptions="numberMatchModeOptions" filterField="product_calories" columnKey="product_calories">
				<template #header>
					{{ $t('Calories') }} ({{ $t('Per stock quantity unit') }})
				</template>
				<template #body="{ data }">
					<div v-if="loaded">
						{{ $n(data.product_calories, 'avoid-decimal') }}
					</div>
					<Skeleton v-else></Skeleton>
				</template>
				<template #filter="{filterModel}">
					<InputNumber v-model="filterModel.value" class="p-column-filter" />
				</template>
				<template #filterapply="{filterCallback}">
					<Button type="button" icon="pi pi-check" @click="filterCallback()" class="p-button-success"></Button>
				</template>
			</Column>
			<Column v-if="columnVisibility.calories" field="calories" :sortable="true" :filterMatchModeOptions="numberMatchModeOptions" filterField="calories" columnKey="calories">
				<template #header>
					{{ $t('Calories') }}
				</template>
				<template #body="{ data }">
					<div v-if="loaded">
						{{ $n(data.calories, 'avoid-decimal') }}
					</div>
					<Skeleton v-else></Skeleton>
				</template>
				<template #filter="{filterModel}">
					<InputNumber v-model="filterModel.value" class="p-column-filter" />
				</template>
				<template #filterclear>
                    <Button type="button" icon="pi pi-times" @click="clearFilter('calories')" class="p-button-secondary"></Button>
                </template>
				<template #filterapply="{filterCallback}">
					<Button type="button" icon="pi pi-check" @click="filterCallback()" class="p-button-success"></Button>
				</template>
			</Column>
			<Column v-if="columnVisibility.last_purchased" field="last_purchased" :sortable="true" :filterMatchModeOptions="dateMatchModeOptions" filterField="last_purchased" columnKey="last_purchased">
				<template #header>
					{{ $t('Last purchased') }}
				</template>
				<template #body="{ data }">
					<div v-if="loaded">
						<span v-if="data.last_purchased != null">{{ data.last_purchased }}</span>
					</div>
					<Skeleton v-else></Skeleton>
				</template>
				<template #filter="{filterModel}">
					<Calendar v-model="filterModel.value" dateFormat="yy-mm-dd" placeholder="yy-mm-dd" />
				</template>
				<template #filterclear>
                    <Button type="button" icon="pi pi-times" @click="clearFilter('last_purchased')" class="p-button-secondary"></Button>
                </template>
			</Column>
			<Column v-if="columnVisibility.last_price" field="last_price" :sortable="true" :filterMatchModeOptions="numberMatchModeOptions" filterField="last_price" columnKey="last_price" >
				<template #header>
					{{ $t('Last price') }}
				</template>
				<template #body="{ data }">
					<div v-if="loaded">
						{{ data.last_price ? $n(parseFloat(data.last_price), 'currency') : "" }}
					</div>
					<Skeleton v-else></Skeleton>
				</template>
				<template #filter="{filterModel}">
					<InputNumber v-model="filterModel.value" mode="currency" :currency="currency" :locale="locale" class="p-column-filter" />
				</template>
				<template #filterclear>
                    <Button type="button" icon="pi pi-times" @click="clearFilter('last_price')" class="p-button-secondary"></Button>
                </template>
				<template #filterapply="{filterCallback}">
					<Button type="button" icon="pi pi-check" @click="filterCallback()" class="p-button-success"></Button>
				</template>
			</Column>
			<Column v-if="columnVisibility.min_stock_amount" field="min_stock_amount" :sortable="true" :filterMatchModeOptions="numberMatchModeOptions" filterField="min_stock_amount" columnKey="min_stock_amount">
				<template #header>
					{{ $t('Min. stock amount') }}
				</template>
				<template #body="{ data }">
					<div v-if="loaded">
						{{ $n(data.min_stock_amount, 'avoid-decimal') }}
					</div>
					<Skeleton v-else></Skeleton>
				</template>
				<template #filter="{filterModel}">
					<InputNumber v-model="filterModel.value" class="p-column-filter" />
				</template>
				<template #filterclear>
                    <Button type="button" icon="pi pi-times" @click="clearFilter('min_stock_amount')" class="p-button-secondary"></Button>
                </template>
				<template #filterapply="{filterCallback}">
					<Button type="button" icon="pi pi-check" @click="filterCallback()" class="p-button-success"></Button>
				</template>
			</Column>
		</DataTable>
		<ContextMenu :model="menuModel" ref="cm" class="product-context-menu">
			<template #item="{item}">
				<a :class="{'p-menuitem-link' : true, 'p-disabled' : checkDisabled(item) }" :aria-haspopup="item.items != null" :aria-expanded="item === selectedProduct" role="menuitem" :tabindex="item.disabled ? null : '0'" :target="item.target">
					<span :href="item.url" :class="['p-menuitem-icon', item.icon]"></span><span class="p-menuitem-text">
						<i18n-t :keypath="item.label">
							<template #string1>{{ $n(this.selectedProduct.quick_consume_amount, 'avoid-decimal') }}</template>
							<template #string2>{{ this.selectedProduct.product_name }}</template>
						</i18n-t>
					</span>
				</a>
			</template>
		</ContextMenu>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useStore } from '../../store';
import api from '../../api';
import  ContextMenu  from 'primevue/contextmenu';
import { DateTime, Duration } from 'luxon';

import Skeleton from 'primevue/skeleton';
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import * as Filters from '../../lib/filters';
import * as localStorageKeys from '../../lib/localstorage';


export default defineComponent({
	data()
	{
		return {
			stock: Array(5),
			loaded: false,
			selectedProduct: <any> null,
			// TODO: this needs a type
			menuModel: <any> [
				{label: 'Add to shopping list', icon: 'fas fa-shopping-cart', command: () => {}},
				{ separator: true },
				{label: 'Purchase', icon: 'fas fa-cart-plus', command: () => {}},
				{label: 'Consume', icon: 'fas fa-utensils', command: () => {}, disabledKey: "consume"},
				{label: 'Transfer', icon: 'fas fa-exchange-alt', command: () => {}, disabledKey: "transfer"},
				{label: 'Inventory', icon: 'fas fa-list', command: () => {}},
				{ separator: true },
				{label: 'Consume {string1} of {string2} as spoiled', command: () => {}},
				{label: 'Search for recipes containing this product', command: () => {}},
				{ separator: true },
				{label: 'Product overview', command: () => {}},
				{label: 'Stock entries', command: () => {}},
				{label: 'Stock journal', command: () => {}},
				{label: 'Stock journal summary', command: () => {}},
				{label: 'Edit product', command: () => {}},
				{ separator: true },
				{label: 'Download product grocycode', command: () => {}},
			],
			stockFilters: <any> null,
			stringMatchModeOptions: [
				{ label: this.$t('Starts With'), value: FilterMatchMode.STARTS_WITH },
				{ label: this.$t('Ends With'), value: FilterMatchMode.ENDS_WITH },
				{ label: this.$t('Equals'), value: FilterMatchMode.EQUALS },
				{ label: this.$t('Not Equals'), value: FilterMatchMode.NOT_EQUALS },
				{ label: this.$t('Contains'), value: FilterMatchMode.CONTAINS },
				{ label: this.$t('Not Contains'), value: FilterMatchMode.NOT_CONTAINS },
			],
			numberMatchModeOptions: [
				{ label: this.$t("Less Than"), value: FilterMatchMode.LESS_THAN },
				{ label: this.$t("Less Than Or Equal"), value: FilterMatchMode.LESS_THAN_OR_EQUAL_TO },
				{ label: this.$t("Equals"), value: FilterMatchMode.EQUALS },
				{ label: this.$t('Not Equals'), value: FilterMatchMode.NOT_EQUALS },
				{ label: this.$t("Greater Than Or Equal"), value: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO },
				{ label: this.$t("Greater Than"), value: FilterMatchMode.GREATER_THAN },
			],
			dateMatchModeOptions: [
				{ label: this.$t("Before"), value: Filters.LUXON_DATE_BEFORE },
				{ label: this.$t("Before Or On"), value: Filters.LUXON_DATE_BEFORE_OR_EQUAL},
				{ label: this.$t("On Day"), value: Filters.LUXON_DATE_EQUAL_DAY },
				{ label: this.$t("Not On Day"), value: Filters.LUXON_DATE_NOT_EQUAL_DAY },
				{ label: this.$t("After Or On"), value: Filters.LUXON_DATE_AFTER_OR_EQUAL },
				{ label: this.$t("After"), value: Filters.LUXON_DATE_AFTER },
			],
			initialFilters: <any> {
				'global' : { value: null, matchMode: FilterMatchMode.CONTAINS },
				'product_name' : { operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.STARTS_WITH}] },
				'product_group_name' : { operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.CONTAINS}] },
				'amount' : { operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.EQUALS}] },
				'value' : { operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.EQUALS}] },
				'best_before_date' : { operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.CONTAINS}] },
				'product_calories' : { operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.EQUALS}] },
				'calories' : { operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.EQUALS}] },
				'last_pruchased' : { operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.CONTAINS}] },
				'last_price' : { operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.EQUALS}] },
				'min_stock_amount' : { operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.EQUALS}] },
				'isBelowMin' : { value: null, matchMode: FilterMatchMode.EQUALS },
				'due_type' : { value: null, matchMode: FilterMatchMode.EQUALS }
			},
			selectedColumns: <Array<any>> Array(0),
			allColumns: <Array<any>> Array(0),
			columnVisibility: <any> {
				product_name : true,
				product_group_name : true,
				amount : true,
				value : true,
				best_before_date : true,
				product_calories : true,
				calories : true,
				last_pruchased : true,
				last_price : true,
				min_stock_amount : true,
			},
			changing: false,
		};
	},
	mounted()
	{
		this.clearAllFilters();
		api.Stock.Overview().then((data) =>
		{
			let stock = data.currentStock;

			// I have absolutely no words for this; and this is the absolute wrong place
			// to fix it. But for the time being, don't break the backend.
			for(let elem of stock) 
			{
				elem.ExpireMillis = elem.best_before_date != null ? DateTime.fromISO(elem.best_before_date).toMillis() : DateTime.fromISO("2999-12-31").toMillis();
				elem.amount_aggregated = parseFloat(elem.amount_aggregated);
				elem.amount = parseFloat(elem.amount);
				elem.amount_opened = parseFloat(elem.amount_opened);
				elem.quick_consume_amount = parseFloat(elem.quick_consume_amount);
				elem.value = parseFloat(elem.value);
				elem.calories = parseFloat(elem.calories);
				elem.calories_aggregated = parseFloat(elem.calories_aggregated);
				elem.product_calories = parseFloat(elem.product_calories);
				elem.min_stock_amount = parseFloat(elem.min_stock_amount);
				const amount = parseInt(elem.is_aggregated_amount) > 0 ? elem.amount_aggregated : elem.amount;
				elem.isBelowMin = amount < elem.min_stock_amount;
				elem.due_type = parseInt(elem.due_type);
			}

			this.stock = stock;
			this.clearAllFilters();
			this.resetColumnVisiblity();
			this.loaded = true;
		});
	},
	setup()
	{
		const store = useStore();
		const cm = ref<InstanceType<typeof ContextMenu>>();

		const onRowContextMenu = (event: any) => 
		{
			cm?.value?.show(event.originalEvent);
		};

		return { store, cm, onRowContextMenu };
	},
	methods: {
		setFilterDueSoon() : void
		{
			this.stockFilters.best_before_date.constraints.splice(0, this.stockFilters.best_before_date.constraints);
			this.stockFilters.best_before_date.constraints.push({ value: DateTime.now().startOf('day').toJSDate(), matchMode: Filters.LUXON_DATE_AFTER_OR_EQUAL });
			this.stockFilters.best_before_date.constraints.push({ value: DateTime.now().startOf('day').plus(Duration.fromObject({ days: this.dueSoonDays })).toJSDate(), matchMode: Filters.LUXON_DATE_BEFORE_OR_EQUAL });
		},
		setFilterExpired() : void
		{
			this.stockFilters.best_before_date.constraints.splice(0, this.stockFilters.best_before_date.constraints);
			this.stockFilters.best_before_date.constraints.push({ value: DateTime.now().startOf('day').toJSDate(), matchMode: Filters.LUXON_DATE_BEFORE });
			this.stockFilters.due_type.value = 2;
		},
		setFilterOverdue() : void
		{
			this.stockFilters.best_before_date.constraints.splice(0, this.stockFilters.best_before_date.constraints);
			this.stockFilters.best_before_date.constraints.push({ value: DateTime.now().startOf('day').toJSDate(), matchMode: Filters.LUXON_DATE_BEFORE });
			this.stockFilters.due_type.value = 1;
		},
		setFilterBelowMin() : void
		{
			this.stockFilters.isBelowMin.value = true;
		},
		resetColumnVisiblity() : void
		{
			this.allColumns = [
				{field: 'product_name', header: this.$t('Product')},
				{field: 'product_group_name', header: this.$t('Product group') },
				{field: 'amount', header: this.$t('Amount')},
				{field: 'value', header: this.$t('Value')},
				{field: 'best_before_date', header: this.$t('Next due date')},
				{field: 'product_calories', header: this.$t('Calories') + " " + this.$t('Per stock quantity unit')},
				{field: 'calories', header: this.$t('Calories')},
				{field: 'last_purchased', header: this.$t('Last purchased')},
				{field: 'last_price', header: this.$t('Last price')},
				{field: 'min_stock_amount', header: this.$t('Min. stock amount')},
			];

			// TODO: make option to sync this across browsers
			// TODO2: restore from old format
			const storage = window.localStorage;
			const savedColumns = storage.getItem(localStorageKeys.STOCKOVERVIEW_COLUMN_STATE);
			if(savedColumns != null)
			{
				const selected = JSON.parse(savedColumns);
				for(const column of this.allColumns)
				{
					if (selected.find((x: { field?: string; }) => x.field === column.field) !== undefined)
						this.selectedColumns.push(column);
				}
				this.updateColumnVisibility(this.selectedColumns);
			}
			else 
			{
				this.allColumns.map(x => this.selectedColumns.push(x));
			}
		},
		updateColumnVisibility(val: Array<any>) : void
		{
			this.allColumns.map(x => { const newval = val.includes(x); if(this.columnVisibility[x.field] != newval) this.columnVisibility[x.field] = newval; } );
		},
		onToggleColumns(val: Array<any>) : void
		{
			this.updateColumnVisibility(val);
			this.selectedColumns = this.allColumns.filter(x => val.includes(x));

			const storage = window.localStorage;

			storage.setItem(localStorageKeys.STOCKOVERVIEW_COLUMN_STATE, JSON.stringify(this.selectedColumns));
		},
		clearAllFilters() : void 
		{	
			this.stockFilters = {};
			Object.assign(this.stockFilters, JSON.parse(JSON.stringify(this.initialFilters)));
		},
		clearFilter(key: string) : void
		{
			this.stockFilters[key] = JSON.parse(JSON.stringify(this.initialFilters[key]));
		},
		checkDisabled(item: any) : boolean 
		{
			if(item.disabledKey !== undefined && this.selectedProduct !== null)
			{
				if(item.disabledKey == "consume") return parseFloat(item.amount_aggregated) == 0;
				if(item.disabledKey == "transfer") return parseFloat(item.amount) == 0;
			}
			return false;
		},
		stockRowClass(item: any) : string | null
		{
			if(item == undefined || item.ExpireMillis == undefined) return null;

			const now = DateTime.now().toMillis();
			const dueMillis = Duration.fromObject({ days: this.dueSoonDays }).toMillis();
			const due = now + dueMillis;
			if(item.ExpireMillis < now && (item.due_type) == 1) return "row-overdue";
			if(item.ExpireMillis < now && (item.due_type) == 2) return "row-expired";
			if(item.ExpireMillis > now && item.ExpireMillis <= due) return "row-due-soon";
			if(parseInt(item.on_shopping_list)) return "row-on-shoppinglist";

			return null;
		}
	},
	computed: {
		datatableColumnKey() : string
		{
			return localStorageKeys.STOCKOVERVIEW_DATATABLE_STATE;
		},
		locale() : string
		{
			return this.store.state.Settings.Locale;
		},
		currency() : string
		{
			return this.store.state.Settings.Currency;
		},
		showProductOnShoppingList() : boolean | undefined
		{
			return this.store.state.Settings.User?.ShowIconWhenProductOnShoppinglist;
		},
		aggregateValue() : number
		{
			let sum = 0;
			this.stock.map(x => sum += parseFloat(x.value));
			return sum;
		},
		aggregateExpireSoon() : number
		{
			let sum = 0;
			const now = DateTime.now().toMillis();
			const due = Duration.fromObject({ days: this.dueSoonDays }).toMillis();
			this.stock.forEach(x => sum += ((x.ExpireMillis <= now + due) && x.ExpireMillis > now ? 1 : 0));
			return sum;
		},
		aggregateOverdue() : number
		{
			let sum = 0;
			const now = DateTime.now().toMillis();
			this.stock.forEach(x => sum += (parseInt(x.due_type) == 1 && x.ExpireMillis < now ? 1 : 0));
			return sum;
		},
		aggregateExpired() : number
		{
			let sum = 0;
			this.stock.forEach(x => sum += (parseInt(x.due_type) == 2 && x.ExpireMillis < DateTime.now().toMillis() ? 1 : 0));
			return sum;
		},
		aggregateBelowMinAmount() : number
		{
			let sum = 0;
			this.stock.forEach(x => sum += ((parseInt(x.is_aggregated_amount) ? x.amount_aggregated : x.amount) < parseFloat(x.min_stock_amount) ? 1 : 0));
			return sum;
		},
		dueSoonDays() : number
		{
			return this.store.state.Settings.User?.DueSoonDays || 5;
		},
	},
	components: {
		'Skeleton': Skeleton,
	}
});
</script>
