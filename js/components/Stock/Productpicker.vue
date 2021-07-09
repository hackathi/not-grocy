<template>
	<div>
		<div class="p-d-flex p-jc-between">
			<label for="product" v-tooltip="tooltip">{{ label }}</label>
			<i class="fas fa-barcode" />
		</div>
		<div class="p-d-flex p-ac-stretch p-mt-2">
			<Dropdown v-model="selectedProduct" :options="products" optionLabel="product" :editable="true" style="flex-grow: 2;" />
			<Button class="p-button-info" icon="fas fa-camera" />
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	props: {
		label: String,
		tooltip: String
	},
	data()
	{
		return {
			selectedProduct: <any> null,
			products: <Array<any>> []
		};
	}
});
</script>
