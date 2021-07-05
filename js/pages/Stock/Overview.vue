<template>
	<div>
		<Card class="with-title-addon">
			<template #title>
				{{ $t('Stock overview' )}}
				<span>{{ $t('{count} Product | {count} Products', stock.length ) }}, {{ $t('{string0} total value', { string0: aggregateValue.toLocaleString(undefined, { style: 'currency', currency: currency }) }) }}</span>
			</template>
			<template #content>
				<div class="filter-buttons">
					<Button class="p-button-warning">
						<span>
							{{ $t('{count} product expires | {count} products expiring', this.aggregateExpireSoon) }}
							{{ $t('within the next day | within the next {count} days', this.dueSoonDays) }}
						</span>
					</Button>
					<Button class="p-button-secondary" :label="$t('{count} product is overdue | {count} products are overdue', aggregateOverdue)" />
					<Button class="p-button-danger" :label="$t('{count} product is expired | {count} products are expired', aggregateExpired)" />
					<Button class="p-button-info" :label="$t('{count} product is below defined min. stock amount | {count} products are below defined min. stock amount', aggregateBelowMinAmount)" />
				</div>
			</template>
		</Card>
		<!-- eslint-disable vue/no-v-model-argument -->
		<DataTable 
			stripedRows 
			:value="stock" 
			:scrollable="true"
			scrollDirection="horizontal"
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
			>
			<Column field="btns" style="width: 200px">
				<template #header>
					<i class="fas fa-eye"></i>
				</template>
				<template #body="{ data }">
					<span class="p-buttonset" v-if="loaded">
						<Button :label="data.quick_consume_amount" icon="fas fa-utensils" class="" />
						<Button :label="$t('All')" icon="fas fa-utensils" class="p-button-danger" />
						<Button :label="data.quick_consume_amount" icon="fas fa-box-open" class="" />
					</span>
					<Skeleton v-else></Skeleton>
				</template>
			</Column>
			<Column field="product" :sortable="true">
				<template #header>
					{{ $t('Product') }}
				</template>
				<template #body="{ data }">
					<div v-if="loaded">
						{{ data.product_name }}
					</div>
					<Skeleton v-else></Skeleton>
				</template>
			</Column>
			<Column field="amount" :sortable="true">
				<template #header>
					{{ $t('Amount') }}
				</template>
				<template #body="{ data }">
					<div v-if="loaded">
						{{ data.amount }} {{ parseFloat(data.amount) > 1 ? data.qu_unit_name_plural : data.qu_unit_name }}
						<i18n-t keypath="{string0} opened" v-if="parseFloat(data.amount_opened) > 0">
							<template #string0>{{ data.amount_opened }}</template>
						</i18n-t>
						<span v-if="parseFloat(data.amount_aggregated) > parseFloat(data.amount)">
							Σ {{ data.amount_aggregated }} {{ parseFloat(data.amount_aggregated) > 1 ? data.qu_unit_name_plural : data.qu_unit_name }}
						</span>
						<i class="fas fa-shopping-cart" v-if="parseInt(data.on_shopping_list) > 0"></i>
					</div>
					<Skeleton v-else></Skeleton>
				</template>
			</Column>
			<Column field="nextDueDate" :sortable="true" sortField="ExpireMillis">
				<template #header>
					{{ $t('Next due date') }}
				</template>
				<template #body="{ data }">
					<div v-if="loaded">
						{{ data.best_before_date || "" }}
					</div>
					<Skeleton v-else></Skeleton>
				</template>
			</Column>
			<Column field="lastPrice" :sortable="true">
				<template #header>
					{{ $t('Last price') }}
				</template>
				<template #body="{ data }">
					<div v-if="loaded">
						{{ data.last_price ? parseFloat(data.last_price).toLocaleString(undefined, { style: "currency", currency }) : "" }}
					</div>
					<Skeleton v-else></Skeleton>
				</template>
			</Column>
		</DataTable>
		<ContextMenu :model="menuModel" ref="cm" class="product-context-menu">
			<template #item="{item}">
				<a :class="{'p-menuitem-link' : true, 'p-disabled' : checkDisabled(item) }" :aria-haspopup="item.items != null" :aria-expanded="item === selectedProduct" role="menuitem" :tabindex="item.disabled ? null : '0'" :target="item.target">
					<span :href="item.url" :class="['p-menuitem-icon', item.icon]"></span><span class="p-menuitem-text">
						<i18n-t :keypath="item.label">
							<template #string1>{{ this.selectedProduct.quick_consume_amount }}</template>
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
			]
		};
	},
	mounted()
	{
		api.Stock.Overview().then((data) =>
		{
			let stock = data.currentStock;
			for(let elem of stock) 
			{
				elem.ExpireMillis = elem.best_before_date != null ? DateTime.fromISO(elem.best_before_date).toMillis() : DateTime.fromISO("2999-12-31").toMillis();
			}

			this.stock = stock;
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
			if(item.ExpireMillis < now && parseInt(item.due_type) == 1) return "row-overdue";
			if(item.ExpireMillis < now && parseInt(item.due_type) == 2) return "row-expired";
			if(item.ExpireMillis > now && item.ExpireMillis <= due) return "row-due-soon";
			if(parseInt(item.on_shopping_list)) return "row-on-shoppinglist";

			return null;
		}
	},
	computed: {
		currency() : string
		{
			return this.store.state.Settings.Currency;
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
			this.stock.forEach(x => sum += (parseFloat(x.amount_aggregated) < parseFloat(x.min_stock_amount) ? 1 : 0));
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
