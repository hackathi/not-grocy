<template>
	<div>
		<div class="p-d-flex p-jc-between">
			<label for="product" v-tooltip="tooltip">{{ label }}</label>
			<i class="fas fa-barcode" />
		</div>
		<div class="p-d-flex p-ac-stretch p-mt-2">
			<Dropdown v-model="intSelectedProduct" :options="products" optionLabel="name" :editable="true" style="flex-grow: 2; border-radius: 3px 0 0 3px;" @blur="onBlur" />
			<Button class="p-button-info" icon="fas fa-camera" @click="startBarcodeScanner" style="border-radius: 0 3px 3px 0;" />
		</div>
		<!-- eslint-disable vue/no-v-model-argument -->
		<Dialog :header="$t('Create or assign product')" v-model:visible="barcodeAddingDialogOpen" :modal="true">
			<p>{{ $t("\"{string0}\" could not be resolved to a product, how do you want to proceed?", { string0: selectedProduct }) }}</p>
			<template #footer>
                <Button :label="$t('Cancel')" icon="pi pi-times" @click="cancelDialog" class="p-button-text" />
                <Button v-if="allowNewProduct" @click="addUnknownAsNewProduct"><strong>P</strong> {{ $t('Add as new Product') }}</Button>
				<Button v-if="barcodeAddToExistingProduct" @click="addToExistingProduct"><strong>B</strong> {{ $t('Add as barcode to existing product') }}</Button>
				<Button v-if="allowNewProduct" @click="addNewProductPrefillBarcode"><strong>A</strong> {{ $t('Add as new Product and prefill barcode') }}</Button>
				<Button @click="scanAgain"><strong>C</strong><i class="fas fa-camera"></i></Button>
            </template>
		</Dialog>
		<WebcamBarcodeScanner v-model:visible="barcodeScannerOpen" @BarcodeScanned="onBarcodeScanned" />
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useStore } from '../../store';
import { ENSURE_PRODUCTS_LOADED } from '../../store/actions';
import { Product } from '../../types/Stock';
import { decodeGrocycode } from '../../lib/grocycode';
import WebcamBarcodeScanner from './WebcamBarcodeScanner.vue';

export default defineComponent({
	props: {
		label: {
			type: String,
			required: false,
			default: "Product"
		},
		tooltip: {
			type: String,
			required: false,
			default: "Type a new product name or barcode and hit TAB or ENTER to start a workflow"
		},
		barcodeAddToExistingProduct: {
			type: Boolean,
			required: false,
			default: false
		},
		allowNewProduct: {
			type: Boolean,
			required: false,
			default: false
		},
		selectedProduct: {
			type: Object as PropType<Product | null>,
			required: true,
			default: null,
		}
	},
	emits:
	{
		'update:selectedProduct' : (value: Product | null) => true
	},
	data()
	{
		return {
			barcodeAddingDialogOpen: false,
			barcodeScannerOpen: false,
			intSelectedProduct: <Product | string | null>  null,
		};
	},
	setup() 
	{
		const store = useStore();

		return { store };
	},
	mounted()
	{
		this.store.dispatch(ENSURE_PRODUCTS_LOADED);
	},
	computed: 
	{
		products() : Array<Product>
		{
			return this.store.state.Products;
		}
	},
	methods:
	{
		onBlur() : void
		{
			if(this.intSelectedProduct == null) return;
			// did we select a Product already? editable inputs are directly a string.
			if(!(typeof this.intSelectedProduct === "string")) return;
			if(this.intSelectedProduct.trim().length == 0) 
			{
				this.intSelectedProduct = null;
				this.$emit('update:selectedProduct', null);
				return;
			}
			
			const barcode = <string> this.intSelectedProduct;

			const { valid, id } = decodeGrocycode(barcode);

			let candidate = <Product | null> null;

			if(valid) 
			{
				candidate = this.store.getters.getProduct(id) || null;
			}
			else
			{
				// nope, not found. Let's search in product barcodes.
				candidate = this.store.state.Products.find(x => x.barcodes?.find(y => y.barcode == barcode) !== undefined) || null;

				if(candidate === null) 
				{
					this.barcodeAddingDialogOpen = true;
					return;
				}
			}

			this.intSelectedProduct = candidate;
			this.$emit('update:selectedProduct', candidate);
		},
		cancelDialog() : void
		{
			this.barcodeAddingDialogOpen = false;
		},
		startBarcodeScanner() : void
		{
			this.barcodeScannerOpen = true;
		},
		onBarcodeScanned(barcode: string)
		{
			this.barcodeScannerOpen = false;
			this.intSelectedProduct = barcode;
			this.onBlur();
		},
		scanAgain() : void
		{
			this.cancelDialog();
			this.startBarcodeScanner();
		}
	},
	components: {
		'WebcamBarcodeScanner' : WebcamBarcodeScanner,
	}
});
</script>
