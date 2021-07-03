<template>
	<div :class="containerClass" @click="onWrapperClick">
		<AppTopBar @menu-toggle="onMenuToggle" @menuitem-click="onMenuItemClick"  />

        <transition name="layout-sidebar">
            <div :class="sidebarClass" @click="onSidebarClick" v-show="isSidebarVisible()">
				<ScrollPanel :style="{ width: '100%', height: '100%'}">
                <div class="layout-logo">
                    <router-link to="/">
                        <img alt="Logo" :src="logo" />
                    </router-link>
                </div>

                <AppProfile />
                <AppMenu :model="menu" @menuitem-click="onMenuItemClick" />
				</ScrollPanel>
            </div>
        </transition>

		<div class="layout-main">
			<router-view />
		</div>

		<AppFooter />
	</div>
</template>

<script lang="ts">
import AppTopBar from './components/App/TopBar.vue';
import AppProfile from './components/App/Profile.vue';
import AppMenu from './components/App/Menu.vue';
import AppFooter from './components/App/Footer.vue';
import ScrollPanel from 'primevue/scrollpanel';
import { MenuItem, MenuItemClickEvent } from './types/Menu';

import { defineComponent } from 'vue';

export default defineComponent({
	data() 
	{
		return {
			layoutMode: 'static',
			layoutColorMode: 'dark',
			staticMenuInactive: false,
			overlayMenuActive: false,
			mobileMenuActive: false,
			menuActive: false,
			menuClick: false,
			menu : <Array<MenuItem>> [
				{ label: 'Stock overview', icon: 'fas fa-box', to: '/'},
				{ label: 'Shopping list', icon: 'fas fa-shopping-cart', to: '/shoppinglist'},
				{ label: 'Recipes', icon: 'fas fa-pizza-slice', to: '/recipes'},
				{ label: 'Meal plan', icon: 'fas fa-map', to: '/mealplan'},
				{ label: 'Chores overview', icon: 'fas fa-home', to: '/choresoverview'},
				{ label: 'Tasks', icon: 'fas fa-tasks', to: '/tasks'},
				{ label: 'Batteries overview', icon: 'fas fa-battery-half', to: '/batteriesoverview'},
				{ label: 'Equipment', icon: 'fas fa-briefcase', to: '/equipment'},
				{ label: 'Calendar', icon: 'fas fa-calendar', to: '/calendar'},
				{ label: 'Purchase', icon: 'fas fa-money-bill-wave', to: '/pruchase'},
				{ label: 'Consume', icon: 'fas fa-utensils', to: '/consume'},
				{ label: 'Transfer', icon: 'fas fa-exchange-alt', to: '/transfer'},
				{ label: 'Inventory', icon: 'fas fa-list', to: '/inventory'},
				{ label: 'Chore tracking', icon: 'fas fa-play', to: '/choretracking'},
				{ label: 'Battrery tracking', icon: 'fas fa-car-battery', to: '/batterytracking'},
				{ label: 'Manage master data', icon: 'fas fa-database', items: [
					{ label: 'Products', icon: 'fas fa-boxes' , to: '/products' },
					{ label: 'Locations', icon: 'fas fa-boxes' , to: '/locations' },
					{ label: 'Stores', icon: 'fas fa-boxes' , to: '/shoppinglocations' },
					{ label: 'Quantity units', icon: 'fas fa-boxes' , to: '/quantityunits' },
					{ label: 'Product groups', icon: 'fas fa-boxes' , to: '/productgroups' },
					{ label: 'Chores', icon: 'fas fa-boxes' , to: '/chores' },
					{ label: 'Batteries', icon: 'fas fa-boxes' , to: '/batteries' },
					{ label: 'Task categories', icon: 'fas fa-boxes' , to: '/taskcategories' },
					{ label: 'Userfields', icon: 'fas fa-boxes' , to: '/userfields' },
					{ label: 'Userentities', icon: 'fas fa-boxes' , to: '/userentities' },
				]},
			],
		};
	},
	watch: {
		$route() 
		{
			this.menuActive = false;
			this.$toast.removeAllGroups();
		}
	},
	methods: {
		onWrapperClick() 
		{
			if (!this.menuClick) 
			{
				this.overlayMenuActive = false;
				this.mobileMenuActive = false;
			}
			this.menuClick = false;
		},
		onMenuToggle(event: Event) 
		{
			this.menuClick = true;
			if (this.isDesktop()) 
			{
				if (this.layoutMode === 'overlay') 
				{
					if(this.mobileMenuActive === true) 
					{
						this.overlayMenuActive = true;
					}
					this.overlayMenuActive = !this.overlayMenuActive;
					this.mobileMenuActive = false;
				}
				else if (this.layoutMode === 'static') 
				{
					this.staticMenuInactive = !this.staticMenuInactive;
				}
			}
			else 
			{
				this.mobileMenuActive = !this.mobileMenuActive;
			}
			event.preventDefault();
		},
		onSidebarClick() 
		{
			this.menuClick = true;
		},
		onMenuItemClick(event : MenuItemClickEvent) 
		{
			if (event.item && !event.item.items) 
			{
				this.overlayMenuActive = false;
				this.mobileMenuActive = false;
			}
		},
		onLayoutChange(layoutMode: string) 
		{
			this.layoutMode = layoutMode;
		},
		onLayoutColorChange(layoutColorMode: string) 
		{
			this.layoutColorMode = layoutColorMode;
		},
		addClass(element: Element, className: string) 
		{
			if (element.classList)
				element.classList.add(className);
			else
				element.className += ' ' + className;
		},
		removeClass(element: Element, className: string) 
		{
			if (element.classList)
				element.classList.remove(className);
			else
				element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		},
		isDesktop() 
		{
			return window.innerWidth > 1024;
		},
		isSidebarVisible() 
		{
			if (this.isDesktop()) 
			{
				if (this.layoutMode === 'static')
					return !this.staticMenuInactive;
				else if (this.layoutMode === 'overlay')
					return this.overlayMenuActive;
				else
					return true;
			}
			else 
			{
				return true;
			}
		},
	},
	computed: {
		containerClass() : Array<(string | object)>
		{
			return ['layout-wrapper', {
				'layout-overlay': this.layoutMode === 'overlay',
				'layout-static': this.layoutMode === 'static',
				'layout-static-sidebar-inactive': this.staticMenuInactive && this.layoutMode === 'static',
				'layout-overlay-sidebar-active': this.overlayMenuActive && this.layoutMode === 'overlay',
				'layout-mobile-sidebar-active': this.mobileMenuActive,
			}];
		},
		sidebarClass() : Array<(string | object)>
		{
			return ['layout-sidebar', {
				'layout-sidebar-dark': this.layoutColorMode === 'dark',
				'layout-sidebar-light': this.layoutColorMode === 'light'
			}];
		},
		logo() : string
		{
			return "/img/not-grocy-white-stencil.svg";
		}
	},
	beforeUpdate() 
	{
		if (this.mobileMenuActive)
			this.addClass(document.body, 'body-overflow-hidden');
		else
			this.removeClass(document.body, 'body-overflow-hidden');
	},
	components: {
		'AppTopBar': AppTopBar,
		'AppProfile': AppProfile,
		'AppMenu': AppMenu,
		'AppFooter': AppFooter,
		'ScrollPanel': ScrollPanel,
	}
});
</script>