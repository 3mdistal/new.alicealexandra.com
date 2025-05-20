export type IntersectionThresholdPreset =
	| 'elementAppearing'
	| 'elementEntering'
	| 'elementHalfVisible'
	| 'elementMostlyVisible'
	| 'elementAlmostFullyVisible';

const THRESHOLD_PRESET_MAP: Record<IntersectionThresholdPreset, number> = {
	'elementAppearing': 0.1,
	'elementEntering': 0.3,
	'elementHalfVisible': 0.5,
	'elementMostlyVisible': 0.7,
	'elementAlmostFullyVisible': 0.9
};

export type IntersectionRootMarginPreset =
	| 'defaultBoundary'
	| 'anticipateNear'
	| 'anticipateMedium'
	| 'anticipateFar'
	| 'ensureWithinBoundary';

const ROOT_MARGIN_PRESET_MAP: Record<IntersectionRootMarginPreset, string> = {
	'defaultBoundary': "0px",
	'anticipateNear': "100px 0px",
	'anticipateMedium': "250px 0px",
	'anticipateFar': "500px 0px",
	'ensureWithinBoundary': "-50px 0px"
};

type ObserveIntersectionUserOptions = Omit<IntersectionObserverInit, 'threshold' | 'rootMargin'> & {
	thresholdPreset?: IntersectionThresholdPreset;
	rootMarginPreset?: IntersectionRootMarginPreset;
};

export function observeIntersection(
	element: Element,
	callback: (entries: IntersectionObserverEntry[]) => void,
	userOptions?: ObserveIntersectionUserOptions
) {
	const defaultThresholdPreset: IntersectionThresholdPreset = 'elementAppearing';
	const defaultRootMarginPreset: IntersectionRootMarginPreset = 'defaultBoundary';

	const resolvedThresholdPreset = userOptions?.thresholdPreset ?? defaultThresholdPreset;
	const resolvedRootMarginPreset = userOptions?.rootMarginPreset ?? defaultRootMarginPreset;

	const actualThreshold = THRESHOLD_PRESET_MAP[resolvedThresholdPreset];
	const actualRootMargin = ROOT_MARGIN_PRESET_MAP[resolvedRootMarginPreset];

	const { thresholdPreset, rootMarginPreset, ...passThroughOptions } = userOptions ?? {};

	const observer = new IntersectionObserver(callback, {
		...passThroughOptions,
		threshold: actualThreshold,
		rootMargin: actualRootMargin
	});
	observer.observe(element);
	
	return {
		disconnect: () => observer.disconnect()
	};
}
