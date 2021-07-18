<template>
	<Dialog :header="$t('Scan a barcode')" @hide="StopScanning" :modal="true" :closable="false" :visible="dialogVisible" @show="StartScanning">
		<div class="p-grid">
			<div ref="scannerContainer" class="p-col-12 p-grid">
				<div ref="livestreamContainer" class="p-col-12"></div>
				<div id="debug" class="p-col-12"></div>
			</div>
			<div class="p-col-12" v-if="availableCameras.length > 1">
				<div class="p-field">
					<label for="fieldId">{{ $t('Select a camera') }}</label>
					<Dropdown v-model="selectedCamera" :options="availableCameras" optionLabel="text" />
				</div>
			</div>
		</div>
		<template #footer>
			<Button class="p-button-outlined p-button-danger" @click="closeDialog">{{ $t('Cancel') }}</Button>
			<Button v-if="showTorchButton" :class="{ 'p-button-outlined': !isTorchOn , 'p-button-warning': true }" @click="toggleTorch"><i class="far fa-lightbulb"></i></Button>
		</template>
	</Dialog>
</template>

<script lang="ts">
import Quagga, { QuaggaJSResultObject } from '@ericblade/quagga2';
import { defineComponent, ref } from 'vue';
import { useStore } from '../../store';
import { DELETE_USER_SETTING_PREFERRED_BARCODE_CAMERA, UPDATE_USER_SETTING_PREFERRED_BARCODE_CAMERA } from '../../store/mutations';
import { ERROR_TOAST_LIFETIME } from '../../types/Frontend';

interface CameraOption { text: string, value: string }

export default defineComponent({
	props: {
		visible: {
			type: Boolean,
			required: true
		},
		readers: {
			type: Array,
			required: false,
			default: () => ['ean_reader', 'ean_8_reader', 'code_128_reader'],
		}
	},
	emits: {
		// No validation, just type annotation.
		'update:visible' : (payload: boolean) => true,
		'BarcodeScanned' : (payload: string) => true,
	},
	data()
	{
		return {
			DecodedCodesCount: 0,
			DecodedCodesErrorCount: 0,
			isTorchOn: false,
			availableCameras: <Array<CameraOption>> [],
			intSelectedCamera: <CameraOption | null> null,
			showTorchButton: false,
			LiveVideoSizeAdjusted: false,
			quaggaOptions: <any> null,
		};
	},
	setup()
	{
		const store = useStore();
		const scannerContainer = ref<InstanceType<typeof HTMLDivElement>>();
		const livestreamContainer = ref<InstanceType<typeof HTMLDivElement>>();


		return { store, scannerContainer, livestreamContainer };
	},
	async mounted() 
	{
		Quagga.onDetected(this.onResultDetected);
		Quagga.onProcessed(this.onResultProcessed);

		const cameras = await Quagga.CameraAccess.enumerateVideoDevices();
		for(const camera of cameras) 
		{
			const option = {
				text: camera.label ? camera.label : camera.deviceId, // Use camera label if it exists, else show device id
				value: camera.deviceId
			};
			this.availableCameras.push(option);
		} 
		
		// Set initial value to preferred camera if one exists - and if not, start out empty
		const preferredCamera = this.store.state.Settings?.User?.PreferredBarcodeCamera;
		if(preferredCamera != null) 
		{
			this.intSelectedCamera = this.availableCameras.find(x => x.value == preferredCamera) || null;
		}
	},
	unmounted()
	{
		Quagga.offDetected(this.onResultDetected);
		Quagga.offProcessed(this.onResultProcessed);
	},
	computed: {
		selectedCamera: {
			get() : CameraOption | null
			{
				return this.intSelectedCamera;
			},
			set(newValue: CameraOption)
			{
				this.intSelectedCamera = newValue;

				// Update preferred Camera in local storage
				this.store.commit(UPDATE_USER_SETTING_PREFERRED_BARCODE_CAMERA, this.intSelectedCamera.value);

				this.StopScanning();
				this.StartScanning();
			}
		},
		dialogVisible: {
			get() : boolean
			{
				return this.visible;
			},
			set(newValue: boolean) : void
			{
				this.$emit('update:visible', newValue);
			}
		},
		torchOn: {
			get(): boolean
			{
				return this.isTorchOn;
			},
			set(newValue: boolean) : void
			{
				this.isTorchOn = newValue;
				const track = Quagga.CameraAccess.getActiveTrack();
				if (track !== null) 
				{
					track.applyConstraints(<any> {
						advanced: [{
							torch: newValue
						}]
					});
				}
			}
		}
	},
	methods: {
		getQuaggaOptions() : any
		{
			const debugEnabled = this.store.state.Settings?.User?.QuaggaDebug;

			return {
				inputStream: {
					name: 'Live',
					type: 'LiveStream',
					target: this.livestreamContainer,
					// If preferred cameraId is set, request to use that specific camera
					constraints: {
						facingMode: 'environment',
						...(this.intSelectedCamera != null && {
							deviceId: this.intSelectedCamera.value
						}) 

					}
				},
				locator: {
					patchSize: this.store.state.Settings?.User?.QuaggaPatchsize,
					halfSample: this.store.state.Settings?.User?.QuaggaHalfsample,
					debug: {
						showCanvas: debugEnabled,
						showPatches: debugEnabled,
						showFoundPatches: debugEnabled,
						showSkeleton: debugEnabled,
						showLabels: debugEnabled,
						showPatchLabels: debugEnabled,
						showRemainingPatchLabels: debugEnabled,
						boxFromPatches: {
							showTransformed: debugEnabled,
							showTransformedBox: debugEnabled,
							showBB: debugEnabled
						}
					}
				},
				numOfWorkers: this.store.state.Settings?.User?.QuaggaWorkers,
				frequency: this.store.state.Settings?.User?.QuaggaFrequency,
				decoder: {
					readers: this.readers,
					debug: {
						showCanvas: debugEnabled,
						showPatches: debugEnabled,
						showFoundPatches: debugEnabled,
						showSkeleton: debugEnabled,
						showLabels: debugEnabled,
						showPatchLabels: debugEnabled,
						showRemainingPatchLabels: debugEnabled,
						boxFromPatches: {
							showTransformed: debugEnabled,
							showTransformedBox: debugEnabled,
							showBB: debugEnabled
						}
					}
				},
				locate: true,
			};
		},
		closeDialog() : void
		{
			this.dialogVisible = false;
		},
		toggleTorch() : void
		{
			this.isTorchOn = !this.isTorchOn;
		},
		StartScanning() : void
		{
			this.DecodedCodesCount = 0;
			this.DecodedCodesErrorCount = 0;

			Quagga.init(this.getQuaggaOptions(), (error) =>
			{
				// error *needs* to be logged here, otherwise the stack trace is lying.
				console.error(error);

				if (error) 
				{
					this.$toast.add({ severity: 'error', summary: this.$t('Error while initializing the barcode scanning library'), detail: error.message, life: ERROR_TOAST_LIFETIME});
					this.$toast.add({ severity: 'warning', summary: this.$t('Permission required'), detail: this.$t('Camera access is only possible when supported and allowed by your browser and when grocy is served via a secure (https://) connection'), life: ERROR_TOAST_LIFETIME});
					
					this.store.commit(DELETE_USER_SETTING_PREFERRED_BARCODE_CAMERA);

					return;
				}

				this.CheckCapabilities();
				Quagga.start();
			});
		},
		StopScanning() : void
		{
			Quagga.stop();
			this.DecodedCodesCount = 0;
			this.DecodedCodesErrorCount = 0;
		},
		async CheckCapabilities() 
		{
			const track = Quagga.CameraAccess.getActiveTrack();
			if(track == null) return;
			if (typeof track.getCapabilities !== 'function') return;

			// Strong typing is not supported because MediaTrackCapabilities
			// Object is not typed correctly (see MDN).
			let capabilities = <any> track.getCapabilities();
			
			const canTorch = typeof capabilities.torch === 'boolean' && capabilities.torch; // Remove the torch button, if either the device can not torch or AutoTorchOn is set.

			if(canTorch) // && this.Grocy.FeatureFlags.GROCY_FEATURE_FLAG_AUTO_TORCH_ON_WITH_CAMERA (should be a usersetting anyways)
			{
				this.showTorchButton = true;

				// If AutoTorchOn is set, turn on the torch.
				if(this.store.state.Settings?.User?.AutoLightTorch)
				{
					this.torchOn = true;
				}
			}

			if (!this.LiveVideoSizeAdjusted) 
			{
				this.AdjustVideoSize(track);
				this.LiveVideoSizeAdjusted = true;
			}
		},
		AdjustVideoSize(track: MediaStreamTrack) :void
		{
			if(this.scannerContainer === undefined || this.livestreamContainer === undefined) return;

			const bcAspectRatio = this.scannerContainer.offsetWidth / this.scannerContainer.offsetHeight;

			// Strong typing is not supported because MediaTrackCapabilities
			// Object is not typed correctly (see MDN).
			const settings = <any> track.getSettings();

			if (bcAspectRatio > settings.aspectRatio) 
			{
				let v = this.livestreamContainer.querySelector('video');
				const c = this.livestreamContainer.querySelector('canvas');

				if (v !== null && c !== null) 
				{
					const newWidth = v.clientWidth / bcAspectRatio * settings.aspectRatio + 'px';
					v.style.width = newWidth;
					c.style.width = newWidth;
				}
			}
		},
		onResultDetected(result: QuaggaJSResultObject) : void
		{
			for(const code of result.codeResult.decodedCodes)
			{
				if(code.error !== undefined)
				{
					this.DecodedCodesCount++;
					this.DecodedCodesErrorCount += code.error;
				}
			}
			// Where is this 0.15 limit from?
			if (this.DecodedCodesErrorCount / this.DecodedCodesCount < 0.15 && result.codeResult.code !== null) 
			{
				this.StopScanning();
				this.$emit('BarcodeScanned', result.codeResult.code);
			}
		},
		onResultProcessed(result: QuaggaJSResultObject) : void
		{
			if(result == null) return;

			const drawingCtx = Quagga.canvas.ctx.overlay;
			const drawingCanvas = Quagga.canvas.dom.overlay;

			if (result.boxes) 
			{
				drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute('width') || "0"), parseInt(drawingCanvas.getAttribute('height') || "0"));
				const boxes = result.boxes.filter(box => box !== result.box);

				for(const box of boxes)
				{
					Quagga.ImageDebug.drawPath(
						box, 
						{ x: 0,	y: 1 }, 
						drawingCtx, 
						{ color: 'yellow', lineWidth: 4	}
					);
				}
			}

			if (result.box) 
			{
				Quagga.ImageDebug.drawPath(
					result.box, 
					{ x: 0,	y: 1 }, 
					drawingCtx, 
					{ color: 'green', lineWidth: 4	}
				);
			}

			if (result.codeResult && result.codeResult.code) 
			{
				Quagga.ImageDebug.drawPath(
					result.line, 
					{ x: 'x', y: 'y' }, 
					drawingCtx, 
					{ color: 'red', lineWidth: 4 }
				);
			}
		}
	}
});

</script>