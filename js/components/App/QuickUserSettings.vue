<template>
		<OverlayPanel ref="quickUserSettings" id="userSettingsDropDown">
			<div class="p-field p-grid p-ai-center">
				<InputSwitch v-model="autoReload" id="userSettingsAutoReload" class="p-col-fixed" /> 
				<div class="p-col"><label for="userSettingsAutoReload">{{ $t('Automatically reload data') }}</label></div>
			</div>
			<div class="p-field p-grid p-ai-center">
				<InputSwitch v-model="headerClock" id="userSettingsHeaderClock" class="p-col-fixed" /> 
				<div class="p-col"><label for="userSettingsHeaderClock">{{ $t('Show clock in header') }}</label></div>
			</div>
			<hr>
			<div class="p-grid p-field p-ai-center nested-grid">
				<div class="p-md-8">
					<div class="p-grid p-ai-center">
						<InputSwitch v-model="nightMode" id="userSettingsNightMode" class="p-col-fixed" /> 
						<div class="p-col"><label for="userSettingsNightMode">{{ $t('Night mode') }}</label></div>
					</div>
				</div>
				<div class="p-md-4">
					<div class="p-grid p-ai-center">
						<CheckBox v-model="autoNightMode" :binary="true" id="userSettingsAutoNightMode" :class="{'p-disabled' : nightMode }"/>
						<div class="p-col"><label for="userSettingsAutoNightMode">{{ $t('Auto') }}</label></div>
					</div>
				</div>
			</div>
			<div class="p-fluid">
				<div class="p-field">
					<div class="p-grid p-ai-center nested-grid">
						<div class="p-col-8">
							<div class="p-grid p-ai-center">
								<div class="p-col"><label for="userSettingsAutoNightModeRange">{{ $t('Automatic night mode range') }}</label></div>
							</div>
						</div>
						<div class="p-col-4">
							<div class="p-grid p-ai-center">
								<CheckBox v-model="flipNightModeRange" :binary="true" id="userSettingsAutoNightModeRangeFlipped" />
								<div class="p-col"><label for="userSettingsAutoNightModeRangeFlipped">{{ $t('Invert') }}</label></div>
							</div>
						</div>
					</div>
					<Slider v-model="autoNightModeRange" :range="true" :step="0.25" :min="0" :max="24" id="userSettingsAutoNightModeRange" />
					<div class="p-mt-3 p-text-help" style="height: 3em;">
						<i18n-t keypath='This activates night mode between {start} and {end} the next day.' v-if="flipNightModeRange" tag="span">
							<template v-slot:start><span>{{ nightModeStart }}</span></template>
							<template v-slot:end><span>{{ nightModeEnd }}</span></template>
						</i18n-t>
						<i18n-t keypath='This activates night mode between {start} and {end} the same day.' v-else tag="span">
							<template v-slot:start><span>{{ nightModeStart }}</span></template>
							<template v-slot:end><span>{{ nightModeEnd }}</span></template>
						</i18n-t>
						<ProgressSpinner v-if="isSaving" />
					</div>
				</div>
			</div>
			<hr>
			<div class="p-field p-grid p-ai-center">
				<InputSwitch v-model="keepScreenOn" class="p-col-fixed" />
				<div class="p-col"><label for="userSettingsKeepScreenOn">{{ $t('Keep screen on') }}</label></div>
			</div>
			<div class="p-field p-grid p-ai-center">
				<InputSwitch v-model="fullscreenScreenLock" :class="{ 'p-col-fixed': true, 'p-disabled': keepScreenOn }" />
				<div class="p-col"><label for="userSettingsKeepScreenOn">{{ $t('Keep screen on while displaying fullscreen content') }}</label></div>
			</div>
		</OverlayPanel>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import OverlayPanel from 'primevue/overlaypanel';
import Slider from 'primevue/slider';
import ProgressSpinner from 'primevue/progressspinner';
import { DateTime } from 'luxon';

import { useStore } from '../../store';
import { SAVE_USER_SETTING_NIGHTMODE, SAVE_USER_SETTING_AUTORELOAD, SAVE_USER_SETTING_FULLSCREENLOCK, SAVE_USER_SETTING_SCREENLOCK, SAVE_USER_SETTING_HEADERCLOCK, SAVE_USER_SETTING_AUTONIGHTMODE_RANGE, SAVE_USER_SETTING_AUTONIGHTMODE, SAVE_USER_SETTING_AUTONIGHTMODE_INVERT } from '../../store/actions';
import { UPDATE_USER_SETTING_UNSAVED_AUTONIGHTMODE_RANGE } from '../../store/mutations';

export default defineComponent({
	data() 
	{
		return {
			intervalHandle: <any> null,
			isSaving: false,
		};
	},
	setup() 
	{
		const quickUserSettings = ref<InstanceType<typeof OverlayPanel>>();

		const toggle = (event: Event) : void => { quickUserSettings?.value?.toggle(event) };

		const store = useStore();

		return { store, quickUserSettings, toggle };
	},
	methods: {
		saveTimeout() : void
		{ 
			
			if(this.store.state.Settings?.User !== undefined)
			{
				if(
					this.store.state.Settings?.User.UnsavedAutoNightModeRange[0] != this.store.state.Settings?.User.AutoNightModeRange[0] ||
					this.store.state.Settings?.User.UnsavedAutoNightModeRange[1] != this.store.state.Settings?.User.AutoNightModeRange[1]
				) 
				{
					this.isSaving = true;
					this.store.dispatch(SAVE_USER_SETTING_AUTONIGHTMODE_RANGE, null).finally(() => 
					{
						this.$emit('check-nightmode');
						this.isSaving = false;
					});
				}
			}
		}
	},
	created()
	{
		this.intervalHandle = setInterval(this.saveTimeout, 1000);
	},
	unmounted()
	{
		clearInterval(this.intervalHandle);
		this.saveTimeout();
	},
	computed: {
		nightModeStart() : string | undefined
		{
			if(this.autoNightModeRange !== undefined) 
			{
				const idx = this.flipNightModeRange ? 1 : 0;
				// hours * minutes * seconds * milliseconds
				const dt = DateTime.fromMillis(this.autoNightModeRange[idx] * 60 * 60 * 1000, { zone: 'utc'});
				return dt.toLocaleString(DateTime.TIME_SIMPLE);
			}
			return this.autoNightModeRange;
		},
		nightModeEnd() : string | undefined
		{
			if(this.autoNightModeRange !== undefined) 
			{
				const idx = this.flipNightModeRange ? 0 : 1;
				// hours * minutes * seconds * milliseconds
				const dt = DateTime.fromMillis(this.autoNightModeRange[idx] * 60 * 60 * 1000, { zone: 'utc'});
				return dt.toLocaleString(DateTime.TIME_SIMPLE);
			}
			return this.autoNightModeRange;
		},
		fullscreenScreenLock: 
		{
			get() : boolean | undefined
			{
				let screenOn = this.store.state.Settings?.User?.KeepScreenOn;
				let fullscreen = this.store.state.Settings?.User?.KeepScreenOnWhenFullscreen;
				

				return screenOn || fullscreen;
			},
			set(newValue) : void
			{
				if(!this.store.state.Settings?.User?.KeepScreenOn)
				{
					this.store.dispatch(SAVE_USER_SETTING_FULLSCREENLOCK, newValue);
				}
			}
		},
		keepScreenOn:
		{
			get() : boolean | undefined
			{
				return this.store.state.Settings?.User?.KeepScreenOn || false;
			},
			set(newValue) : void
			{
				this.store.dispatch(SAVE_USER_SETTING_SCREENLOCK, newValue);
			}
		},
		nightMode:
		{
			get() : boolean | undefined
			{

				return this.store.state.Settings?.User?.NightMode || false;
			},
			set(newValue) : void
			{
				this.store.dispatch(SAVE_USER_SETTING_NIGHTMODE, newValue).finally(() => this.$emit('check-nightmode'));
			}
		},
		autoReload: 
		{
			get() : boolean | undefined
			{
				return this.store.state.Settings?.User?.AutoReload || false;
			},
			set(newValue) : void
			{
				this.store.dispatch(SAVE_USER_SETTING_AUTORELOAD, newValue);
			}
		},
		headerClock:
		{
			get() : boolean | undefined
			{
				return this.store.state.Settings?.User?.HeaderClock;
			},
			set(newValue) : void
			{
				this.store.dispatch(SAVE_USER_SETTING_HEADERCLOCK, newValue);
			}
		},
		autoNightMode:
		{
			get() : boolean | undefined
			{
				return this.store.state.Settings?.User?.AutoNightMode;
			},
			set(newValue) : void
			{
				this.store.dispatch(SAVE_USER_SETTING_AUTONIGHTMODE, newValue).finally(() => this.$emit('check-nightmode'));
			}
		},
		autoNightModeRange:
		{
			get() : Array<number> | undefined
			{
				return this.store.state.Settings?.User?.UnsavedAutoNightModeRange;
			},
			set(newValue) : void
			{
				this.store.commit(UPDATE_USER_SETTING_UNSAVED_AUTONIGHTMODE_RANGE, newValue);
			}
		},
		flipNightModeRange:
		{
			get() : boolean | undefined
			{
				return this.store.state.Settings?.User?.AutoNightModeInvert;
			},
			set(newValue) : void
			{
				this.store.dispatch(SAVE_USER_SETTING_AUTONIGHTMODE_INVERT, newValue).finally(() => this.$emit('check-nightmode'));
			}
		}
	},
	
	components: {
		'OverlayPanel': OverlayPanel,
		'Slider': Slider,
		'ProgressSpinner' : ProgressSpinner,
	}
});
</script>
