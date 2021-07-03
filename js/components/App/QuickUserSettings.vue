<template>
		<OverlayPanel ref="quickUserSettings" id="userSettingsDropDown">
			<div class="p-field p-grid p-ai-center">
				<InputSwitch v-model="autoReload" id="userSettingsAutoReload" class="p-col-fixed" /> 
				<div class="p-col"><label for="userSettingsAutoReload">Automatically reload data</label></div>
			</div>
			<div class="p-field p-grid p-ai-center">
				<InputSwitch v-model="headerClock" id="userSettingsHeaderClock" class="p-col-fixed" /> 
				<div class="p-col"><label for="userSettingsHeaderClock">Show clock in header</label></div>
			</div>
			<hr>
			<div class="p-grid p-field p-ai-center nested-grid">
				<div class="p-md-9">
					<div class="p-grid p-ai-center">
						<InputSwitch v-model="nightMode" id="userSettingsNightMode" class="p-col-fixed" /> 
						<div class="p-col"><label for="userSettingsNightMode">Night mode</label></div>
					</div>
				</div>
				<div class="p-md-3">
					<div class="p-grid p-ai-center">
						<CheckBox v-model="autoNightMode" :binary="true" id="userSettingsAutoNightMode" />
						<div class="p-col"><label for="userSettingsAutoNightMode">Auto</label></div>
					</div>
				</div>
			</div>
			<div class="p-fluid">
				<div class="p-field">
					<div class="p-grid p-ai-center nested-grid">
						<div class="p-col-9">
							<div class="p-grid p-ai-center">
								<div class="p-col"><label for="userSettingsAutoNightModeRange">Automatic night mode range</label></div>
							</div>
						</div>
						<div class="p-col-3">
							<div class="p-grid p-ai-center">
								<CheckBox v-model="flipNightModeRange" :binary="true" id="userSettingsAutoNightModeRangeFlipped" />
								<div class="p-col"><label for="userSettingsAutoNightModeRangeFlipped">Invert</label></div>
							</div>
						</div>
					</div>
					<Slider v-model="autoNightModeTimeRange" :range="true" :step="0.25" :min="0" :max="24" id="userSettingsAutoNightModeRange" />
					<div class="p-mt-3 p-text-help" style="height: 3em;">This activates night mode between {{ nightModeStart }} and {{ nightModeEnd }} the <span v-if="flipNightModeRange">next</span><span v-else>same</span> day.</div>
				</div>
			</div>
			<hr>
			<div class="p-field p-grid p-ai-center">
				<InputSwitch v-model="keepScreenOn" class="p-col-fixed" />
				<div class="p-col"><label for="userSettingsKeepScreenOn">Keep screen on</label></div>
			</div>
			<div class="p-field p-grid p-ai-center">
				<InputSwitch v-model="fullscreenScreenLock" :class="{ 'p-col-fixed': true, 'p-disabled': keepScreenOn }" />
				<div class="p-col"><label for="userSettingsKeepScreenOn">Keep screen on while displaying fullscreen content</label></div>
			</div>
		</OverlayPanel>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import OverlayPanel from 'primevue/overlaypanel';
import Slider from 'primevue/slider';
import { DateTime } from 'luxon';

export default defineComponent({
	data() 
	{
		return {
			autoReload: false,
			headerClock: false,
			nightModeSetting: false,
			autoNightMode: false,
			autoNightModeTimeRange: [8, 20],
			flipNightModeRange: true,
			keepScreenOn: false,
			keepScreenOnWhileInFullscreen: true,
		};
	},
	setup() 
	{
		const quickUserSettings = ref<InstanceType<typeof OverlayPanel>>();

		const toggle = (event: Event) : void => { quickUserSettings?.value?.toggle(event) };

		return { quickUserSettings, toggle };
	},
	computed: {
		nightModeStart() : string
		{
			const idx = this.flipNightModeRange ? 1 : 0;
			// hours * minutes * seconds * milliseconds
			const dt = DateTime.fromMillis(this.autoNightModeTimeRange[idx] * 60 * 60 * 1000, { zone: 'utc'});
			return dt.toLocaleString(DateTime.TIME_SIMPLE);
		},
		nightModeEnd() : string
		{
			const idx = this.flipNightModeRange ? 0 : 1;
			// hours * minutes * seconds * milliseconds
			const dt = DateTime.fromMillis(this.autoNightModeTimeRange[idx] * 60 * 60 * 1000, { zone: 'utc'});
			return dt.toLocaleString(DateTime.TIME_SIMPLE);
		},
		fullscreenScreenLock: 
		{
			get() : boolean
			{
				return this.keepScreenOn || this.keepScreenOnWhileInFullscreen;
			},
			set(newValue) : void
			{
				if(!this.keepScreenOn) this.keepScreenOnWhileInFullscreen = newValue;
			}
		},
		nightMode:
		{
			get() : boolean
			{
				return this.nightModeSetting;
			},
			set(newValue) : void
			{
				document.body.classList.toggle("theme-night");
				document.body.classList.toggle("theme-day");
				this.nightModeSetting = newValue;
			}
		}
	},
	
	components: {
		'OverlayPanel': OverlayPanel,
		'Slider': Slider,
	}
});
</script>
