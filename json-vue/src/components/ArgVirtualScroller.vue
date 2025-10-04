<template>
    <!-- The @scroll listener is now managed in the script for more flexibility -->
    <div
        ref="containerRef"
        class="virtual-scroller-container"
    >
        <!-- Sizer element to establish the full scrollable height -->
        <div
            class="virtual-scroller-sizer"
            :style="{ height: `${totalHeight}px` }"
        />

        <!-- Content wrapper for the recycled view elements -->
        <div class="virtual-scroller-content w-full flex-1  relative">
            <div
                v-for="view in visiblePool"
                :key="view.id"
                :style="{
                  transform: `translateY(${view.top}px)`,
                  height: `${itemSize}px`,
                  visibility: isItemHidden(view.itemIndex) ? 'hidden' : 'visible'
                }"
            >
                <template v-if="view.itemIndex >= 0 && items[view.itemIndex]">
                    <slot :item="items[view.itemIndex]" :index="view.itemIndex"></slot>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts" generic="Item extends {id: number | string}">
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from 'vue';

const props = withDefaults(defineProps<{
    /** The complete list of items to virtualize. */
    items: Item[];
    /** The fixed height of each item in pixels. This is crucial for calculations. */
    itemSize: number;
    /** The field in each item object to use as a unique key. This is now required. */
    keyField: keyof Item;
    /** A string to identify the type of content. Changing this will scroll to the top. */
    type?: string;
    /** The number of extra items to render on either side of the viewport. */
    buffer?: number;
    /** If an item is being edited, its index can be passed here. The item immediately following it will be hidden. */
    editingIndex?: number;
}>(), {
    buffer: 16,
    editingIndex: -1,
    type: '',
});

defineSlots<{
    /** The default slot for rendering each item. */
    default(props: { item: Item; index: number }): any
}>();

const containerRef = ref<HTMLDivElement | null>(null);
const scrollTop = ref(0);
const containerHeight = ref(0);
// The pool now only holds stable IDs for the v-for key.
const pool = ref<{ id: number; }[]>([]);

const scrollElement = ref<HTMLElement | null>(null);

const totalHeight = computed(() => props.items.length * props.itemSize);

const startIndex = computed(() => {
    const start = Math.floor(scrollTop.value / props.itemSize);
    return Math.max(0, start - Math.floor(props.buffer / 2));
});

const resetScroll = () => {
    nextTick(() => {
        if (scrollElement.value) {
            // Reset the actual DOM scroll position to the top.
            scrollElement.value.scrollTop = 0;
        }
        // Force-update our internal scroll state.
        scrollTop.value = 0;

        // Re-initialize the view pool and recalculate dimensions.
        initializePool();
    });
};

watch(() => props.type, resetScroll);
watch(() => props.items.length, () => initializePool());


const visiblePool = computed(() => {
    const currentStartIndex = startIndex.value;
    return pool.value.map((view, indexInPool) => {
        const itemIndex = currentStartIndex + indexInPool;

        if (itemIndex < props.items.length) {
            // This view corresponds to a valid item.
            return {
                id: view.id,
                itemIndex: itemIndex,
                top: itemIndex * props.itemSize,
            };
        } else {
            // This view is not needed, so it's marked as invalid and moved out of sight.
            return {
                id: view.id,
                itemIndex: -1,
                top: -9999,
            };
        }
    });
});


const handleScroll = () => {
    if (scrollElement.value) {
        scrollTop.value = scrollElement.value.scrollTop;
    }
};

const isItemHidden = (itemIndex: number): boolean => {
    if (itemIndex < 0) return true;
    return props.editingIndex !== -1 && itemIndex === props.editingIndex + 1;
};

const findScrollableParent = (element: HTMLElement | null): HTMLElement => {
    if (!element || element === document.body) {
        return document.scrollingElement as HTMLElement || document.documentElement;
    }
    const style = window.getComputedStyle(element);
    const isScrollable = style.overflowY === 'auto' || style.overflowY === 'scroll';
    if (isScrollable && element.scrollHeight > element.clientHeight) {
        return element;
    } else {
        return findScrollableParent(element.parentElement);
    }
};

const initializePool = () => {
    if (!scrollElement.value) return;
    containerHeight.value = scrollElement.value.clientHeight;

    const poolSize = Math.ceil(containerHeight.value / props.itemSize) + props.buffer;

    if (pool.value.length !== poolSize) {
        // The pool now only needs stable IDs.
        pool.value = Array.from({length: poolSize}, (_, id) => ({id}));
    }
};

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
    nextTick(() => {
        scrollElement.value = findScrollableParent(containerRef.value);
        if (scrollElement.value) {
            const target = scrollElement.value === document.documentElement ? window : scrollElement.value;
            target.addEventListener('scroll', handleScroll, {passive: true});
            initializePool();
            resizeObserver = new ResizeObserver(initializePool);
            resizeObserver.observe(scrollElement.value);
        }
    });
});

onUnmounted(() => {
    if (scrollElement.value) {
        const target = scrollElement.value === document.documentElement ? window : scrollElement.value;
        target.removeEventListener('scroll', handleScroll);
        if (resizeObserver) {
            resizeObserver.unobserve(scrollElement.value);
        }
    }
});

</script>

<style>
.virtual-scroller-container {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    position: relative;
    -webkit-overflow-scrolling: touch;
}

.virtual-scroller-sizer {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    z-index: -1;
}

.virtual-scroller-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.virtual-scroller-content > div {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    flex-shrink: 0;
    box-sizing: border-box;
    display: flex;
    align-items: start;
    gap: 0.5rem;
    will-change: transform;
}
</style>
