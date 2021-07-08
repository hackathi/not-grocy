<template>
	<Dropdown v-model="selectedProduct" :options="products" optionLabel="product" :editable="true"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	data()
	{
		return {
			selectedProduct: <any> null,
			products: <Array<any>> []
		};
	}
});
</script>
