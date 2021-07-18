<template>
	<div class="layout-footer">
		<span class="footer-text" style="margin-right: 5px">
			<i18n-t keypath='{project_link} made with ❤️ and ☕ by {contributors}' tag="span">
				<template v-slot:project_link><a href="https://github.com/mistressofjellyfish/not-grocy"><i class="pi pi-github"></i> not-grocy</a> </template>
				<template v-slot:contributors> <a href="https://github.com/mistressofjellyfish/not-grocy/graphs/contributors">{{ $t('many awesome people.') }}</a></template>
			</i18n-t>
		</span>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: "AppFooter"
});
</script>