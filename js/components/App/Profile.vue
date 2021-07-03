<template>
	<div class="layout-profile">
		<button class="p-link layout-profile-link" @click="onClick">
			<div class="p-grid p-ai-center">
				<div class="p-col-4">
					<img src="/img/not-grocy-user-white.svg" alt="" class="profile-picture">
				</div>
				<div class="p-col-8">
					<span class="username">Claire Williams</span><i class="pi pi-fw pi-cog"></i>
				</div>
			</div>
		</button>
        <transition name="layout-submenu-wrapper">
            <ul v-show="expanded">
                <li><button class="p-link"><i class="pi pi-fw pi-user-edit"></i><span>Change Password</span></button></li>
                <li><button class="p-link"><i class="pi pi-fw pi-power-off"></i><span>Logout</span></button></li>
            </ul>
        </transition>
		
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	data()
	{
		return {
			expanded: false,
		};
	},
	methods: {
		onClick(event: Event) 
		{
			this.expanded = !this.expanded;
			event.preventDefault();
		}
	},
});
</script>