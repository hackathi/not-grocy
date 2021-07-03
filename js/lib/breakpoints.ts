import { computed, onMounted, onUnmounted, ref, ComputedRef } from "vue";

interface ViewportSize { width: ComputedRef<number>, height: ComputedRef<number>, breakpoint: ComputedRef<"xs" | "md" | "lg" | "unknown"> }

export default function () : ViewportSize
{
	const windowWidth = ref(window.innerWidth);
	const windowHeight = ref(window.innerHeight);

	const sizeChanged = () => 
	{
		windowWidth.value = window.innerWidth;
		windowHeight.value = window.innerHeight;
	};

	onMounted(() => window.addEventListener('resize', sizeChanged));
	onUnmounted(() => window.removeEventListener('resize', sizeChanged));

	// TODO: check breakpoints
	const breakpoint = computed(() => 
	{
		if (windowWidth.value < 550) return 'xs';
		if (windowWidth.value > 549 && windowWidth.value < 1200) return 'md';
		if (windowWidth.value > 1199) return 'lg';
		return 'unknown';
	});

	const width = computed(() => windowWidth.value);
	const height = computed(() => windowHeight.value);

	return { width, height, breakpoint };
}

export { ViewportSize };