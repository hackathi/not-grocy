<template>
	<OverlayPanel ref="userSettingsMenu" id="userSettingsMenuDropDown">
		<div class="layout-menu-container">
			<AppSubmenu :items="model" class="layout-menu user-settings-menu" :root="true" @menuitem-click="onMenuItemClick" />
		</div>
	</OverlayPanel>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import OverlayPanel from 'primevue/overlaypanel';
import AppSubmenu from './Submenu.vue';

export default defineComponent({
	props: {
		model: Array
	},
	methods: {
		onMenuItemClick(event: Event) : void
		{
			this.$emit('menuitem-click', event);
		}
	},
	setup() 
	{
		const userSettingsMenu = ref<InstanceType<typeof OverlayPanel>>();

		const toggle = (event: Event) : void => { userSettingsMenu?.value?.toggle(event) };

		return { userSettingsMenu, toggle };
	},
	components: {
		'AppSubmenu': AppSubmenu,
		'OverlayPanel' : OverlayPanel
	},
});
</script>