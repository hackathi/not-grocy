<template>
	<div class="layout-headerclock p-sm-none">{{ date }} {{ time }}</div>
</template>

<script lang="ts">
import { DateTime } from 'luxon';

import { defineComponent } from 'vue';

export default defineComponent({
	data() 
	{
		return {
			date: "",
			time: "",
			timerHandle: <any> null,
			intervalHandle: <any> null,
		};
	},
	mounted() 
	{
		this.updateClock();
		const now = DateTime.now().toMillis();
		const secs = Math.floor(now / 1000);
		const mins = Math.floor(secs / 60);
		const timeToNextMinute = (1000 * 60) - (now - mins);
		this.timerHandle = setTimeout(this.updateClock, timeToNextMinute);

	},
	unmounted()
	{
		if(this.timerHandle != null) clearTimeout(this.timerHandle);
		if(this.intervalHandle != null) clearTimeout(this.intervalHandle);
	},
	methods: {
		updateClock() : void
		{
			if(this.intervalHandle === null)
			{
				this.intervalHandle = setInterval(this.updateClock, 60 * 1000);
			}

			const now = DateTime.now();
			this.date = now.toLocaleString({ weekday: 'long', month: 'long', day: '2-digit' });
			this.time = now.toLocaleString(DateTime.TIME_SIMPLE);
		}
	},
	components: {

	},
});
</script>