<template>
	<ul v-if="items">
		<template v-for="(item,i) of items">
			<li v-if="visible(item) && !item.separator" :key="i" :class="[{'active-menuitem': activeIndex === i && !item.to && !item.disabled}]" role="none">
				<div v-if="item.items && root===true" class='arrow'></div>
				<router-link v-if="item.to" :to="item.to" :class="[item.class, 'p-ripple',{'active-route': activeIndex === i, 'p-disabled': item.disabled}]" :style="item.style"
							@click="onMenuItemClick($event,item,i)" :target="item.target" exact role="menuitem">
					<i :class="item.icon"></i>
					<span>{{ $t(item.label) }}</span>
					<i v-if="item.items" class="pi pi-fw pi-angle-down menuitem-toggle-icon"></i>
					<span v-if="item.badge" class="menuitem-badge">{{item.badge}}</span>
				</router-link>
				<a v-if="!item.to" :href="item.url||'#'" :style="item.style" :class="[item.class, 'p-ripple', {'p-disabled': item.disabled}]"
					@click="onMenuItemClick($event,item,i)" :target="item.target" role="menuitem">
					<i :class="item.icon"></i>
					<span>{{ $t(item.label) }}</span>
					<i v-if="item.items" class="pi pi-fw pi-angle-down menuitem-toggle-icon"></i>
					<span v-if="item.badge" class="menuitem-badge">{{ item.badge }}</span>
				</a>
				<transition name="layout-submenu-wrapper">
					<appsubmenu v-show="activeIndex === i" :items="visible(item) && item.items" @menuitem-click="$emit('menuitem-click', $event)"></appsubmenu>
				</transition>
			</li>
			<li class="p-menu-separator" :style="item.style" v-if="visible(item) && item.separator" :key="'separator' + i" role="separator"></li>
		</template>
	</ul>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { MenuItem, MenuItemClickEvent } from '../../types/Menu';

export default defineComponent({
	name: 'appsubmenu',
	props: {
		items: Array,
		root: {
			type: Boolean,
			default: false
		}
	},
	data() 
	{
		return {
			activeIndex : <Number|null> null
		};
	},
	emits: {
		menuitemClick(payload: MenuItemClickEvent) 
		{
			return true;
		},
	},
	methods: {
		onMenuItemClick(event:Event, item: MenuItem, index : Number) 
		{
			if (item.disabled) 
			{
				event.preventDefault();
				return;
			}
			if (!item.to && !item.url) 
			{
				event.preventDefault();
			}
			//execute command
			if (item.command) 
			{
				item.command({originalEvent: event, item: item});
			}
			this.activeIndex = index === this.activeIndex ? null : index;
			this.$emit('menuitemClick', {
				originalEvent: event,
				item: item
			});
		},
		visible(item : MenuItem) 
		{
			return (typeof item.visible === 'function' ? item.visible() : item.visible !== false);
		}
	}
});
</script>