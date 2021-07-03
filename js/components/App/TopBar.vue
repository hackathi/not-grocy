<template>
		<div class="layout-topbar">
			<button class="p-link layout-menu-button" @click="onMenuToggle">
				<div>
					<span class="pi pi-bars"></span>
					<img src="/img/not-grocy-white-stencil.svg" :class="{ showing: showLogo }">
				</div>
			</button>
			<div class="layout-topbar-icons">
				<button class="p-link" @click="toggleUserSettings">
					<span class="layout-topbar-item-text">User Settings</span>
					<span class="layout-topbar-icon pi pi-sliders-h"></span><span class="pi pi-angle-down"></span>
				</button>
				<button class="p-link" @click="toggleUserSettingsMenu">
					<span class="layout-topbar-item-text">Settings</span>
					<span class="layout-topbar-icon pi pi-cog"></span><span class="pi pi-angle-down"></span>
				</button>
			</div>
			<QuickUserSettings ref="userSettings" />
			<UserSettingsMenu ref="userSettingsMenu" :model="menu" @menuitem-click="onMenuItemClick" />
		</div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import QuickUserSettings from './QuickUserSettings.vue';
import UserSettingsMenu from './UserSettingsMenu.vue';

import { MenuItem } from '../../types/Menu';

export default defineComponent({
	data() 
	{
		return {
			showLogo: false,
			menu: <Array<MenuItem>> [
				{ label: 'Stock settings', icon: 'fas fa-boxes', to: '/settings/stock'},
				{ label: 'Shopping list settings', icon: 'fas fa-shopping-cart', to: '/settings/shoppinglist'},
				{ label: 'Recipes settings', icon: 'fas fa-pizza-slice', to: '/settings/recipes'},
				{ label: 'Chores settings', icon: 'fas fa-home', to: '/settings/chores'},
				{ label: 'Batteries settings', icon: 'fas fa-battery-half', to: '/settings/batteries'},
				{ label: 'Tasks settings', icon: 'fas fa-tasks', to: '/settings/tasks'},
				{ label: 'User settings', icon: 'fas fa-user-cog', to: '/settings/user'},
				{ label: 'Manage users', icon: 'fas fa-users', to: '/settings/users'},
				{ label: 'Manage API keys', icon: 'fas fa-key', to: '/settings/apikeys'},
				{ label: 'REST API Documentation', icon: 'fas fa-user-cog', url: '/api'},
				{ label: 'Test barcode scanner', icon: 'fas fa-barcode', to: '/barcodescannertesting'},
				{ label: 'About not-grocy', icon: 'fas fa-info-circle', to: '/about'},
			],
		};
	},
	methods: {
		onMenuToggle(event: Event) : void
		{
			this.showLogo = !this.showLogo;
			this.$emit('menu-toggle', event);
		},
		onMenuItemClick(event: Event) : void
		{
			this.$emit('menuitem-click', event);
		}
	},
	setup() 
	{
		const userSettings = ref<InstanceType<typeof QuickUserSettings>>();
		const toggleUserSettings = (event: Event) : void => { userSettings.value?.toggle(event) } ;

		const userSettingsMenu = ref<InstanceType<typeof UserSettingsMenu>>();
		const toggleUserSettingsMenu = (event: Event) : void => { userSettingsMenu.value?.toggle(event) } ;

		return { userSettings, userSettingsMenu, toggleUserSettings, toggleUserSettingsMenu };
	},
	components: {
		'QuickUserSettings': QuickUserSettings,
		'UserSettingsMenu' : UserSettingsMenu,
	}
});
</script>
