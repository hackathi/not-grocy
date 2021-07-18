import { computed, onMounted, onUnmounted, ref, ComputedRef } from "vue";

interface ViewportSize { width: ComputedRef<number>, height: ComputedRef<number>, breakpoint: ComputedRef<"xs" | "sm" | "md" | "lg" | "xl"> }

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
		if (windowWidth.value > 576 && windowWidth.value <= 768) return 'sm';
		if (windowWidth.value > 768 && windowWidth.value <= 992) return 'md';
		if (windowWidth.value > 992 && windowWidth.value <= 1200) return 'lg';
		if (windowWidth.value > 1200) return 'xl';
		return 'xs';
	});

	const width = computed(() => windowWidth.value);
	const height = computed(() => windowHeight.value);

	return { width, height, breakpoint };
}

export { ViewportSize };