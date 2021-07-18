<template>
	<div class="layout-menu-container">
		<AppSubmenu :items="model" class="layout-menu" :root="true" @menuitem-click="onMenuItemClick" />
	</div>
</template>

<script lang="ts">
import AppSubmenu from './Submenu.vue';

import { defineComponent } from 'vue';

export default defineComponent({
	props: {
		model: Array
	},
	methods: {
		onMenuItemClick(event: Event) 
		{
			this.$emit('menuitem-click', event);
		}
	},
	components: {
		'AppSubmenu': AppSubmenu,
	},
});
</script>