/**
 * Generated using the following settings:
 * - mass: 1
 * - stiffness: 100
 * - damping: 20
 * - velocity: 0
 *
 * Reference: https://linear-easing-generator.netlify.app/
 */
export const springLinear = `linear(
    0, 0.002, 0.01 3.6%, 0.034, 0.074 9.1%, 0.128 11.4%, 0.194 13.4%, 0.271 15%,
    0.344 16.1%, 0.544, 0.66 20.6%, 0.717 22.4%, 0.765 24.6%, 0.808 27.3%,
    0.845 30.4%, 0.883 35.1%, 0.916 40.6%, 0.942 47.2%, 0.963 55%, 0.979 64%,
    0.991 74.4%, 0.998 86.4%, 1
  )`;

/**
 * The snapshot bounding box state of an element
 */
type Rect = {
	el: HTMLElement;
	x: number;
	y: number;
	top: number;
	right: number;
	bottom: number;
	left: number;
	width: number;
	height: number;
	bound: Bound;
};

/**
 * The absolute bounding box state of an element from its relative ancestor.
 */
type Bound = {
	x: number;
	y: number;
	top: number;
	right: number;
	bottom: number;
	left: number;
	width: number;
	height: number;
};

/**
 * Options for the Flip animation.
 */
export type Options = {
	/**
	 * The duration of the animation in milliseconds.
	 */
	duration: number;

	/**
	 * The delay before the animation starts in milliseconds.
	 */
	delay?: number;

	/**
	 * The delay between each element in milliseconds.
	 */
	stagger?: number;

	/**
	 * The easing function to use for the animation.
	 */
	easing?: string;

	/**
	 * The CSS properties to animate.
	 */
	props?: {
		absolute?: boolean;
		width?: boolean;
		height?: boolean;
		transform?: boolean;
	};

	/**
	 * A callback function to be executed when the animation completes.
	 */
	onComplete?: () => void;
};

declare global {
	interface HTMLElement {
		/**
		 * The Flip animation instance for the element.
		 */
		_flipAnimation?: Animation;
	}

	interface Animation {
		/**
		 * Interrupt the animation and clean up.
		 */
		_interrupt?: () => void;
	}
}

/**
 * A class to create and manage Flip animations.
 */
export class Flip {
	/**
	 * The elements to animate.
	 */
	private elements: HTMLElement[];

	/**
	 * The initial state of the elements.
	 */
	private from: Rect[];

	/**
	 * A function to unlock the body scroll.
	 * Defined by this.bodyLockScroll().
	 */
	private bodyUnlockScroll?: () => void;

	constructor(
		selector: string | HTMLElement | (string | HTMLElement)[],
		root: HTMLElement = document.body
	) {
		let elements: HTMLElement[];
		if (typeof selector === 'string') {
			elements = Array.from(root.querySelectorAll(selector));
		} else if (selector instanceof HTMLElement) {
			elements = [selector];
		} else if (Array.isArray(selector)) {
			elements = [];
			for (let index = 0; index < selector.length; index++) {
				const item = selector[index];
				if (typeof item === 'string') {
					elements.push(...Array.from<HTMLElement>(root.querySelectorAll(item)));
				} else if (item instanceof HTMLElement) {
					elements.push(item);
				}
			}
		} else {
			throw new Error('Unsupported selector type.');
		}

		if (elements.length === 0) {
			throw new Error('No elements found.');
		}

		this.elements = elements;
		this.bodyLockScroll();
		this.from = Flip._measure(elements);

		// Interrupt any existing animations.
		for (let index = 0; index < elements.length; index++) {
			const element = elements[index];
			if (element._flipAnimation?._interrupt) {
				element._flipAnimation._interrupt();
			}
		}

		Flip._matrix(this.from);
	}

	/**
	 * Create a new Flip instance and capture the initial state of the elements.
	 * @param selector - A CSS selector, an HTMLElement, or an array of CSS selectors and/or HTMLElements.
	 * @param root - The root element to query the selector from. (Only used if selector is a string or an array of strings.)
	 * @returns A new Flip instance.
	 */
	static getState(
		selector: string | HTMLElement | (string | HTMLElement)[],
		root: HTMLElement = document.body
	) {
		return new Flip(selector, root);
	}

	/**
	 * Flip the elements from the initial state to the final state.
	 * @param options - The options for the animation.
	 * @returns
	 */
	flip(options: Options): Animation[] {
		const { duration, delay = 0, stagger = 0, easing = springLinear, props, onComplete } = options;
		const count = this.from.length;
		const animations: Animation[] = Array(count);
		const cleanups: (() => void)[] = Array(count);

		requestAnimationFrame(() => {
			const to = Flip._measure(this.elements);
			Flip._matrix(to);

			if (!this.bodyUnlockScroll)
				throw new Error('Expected bodyUnlockScroll to be defined by Flip.getState().');
			this.bodyUnlockScroll();

			if (this.elements.length !== this.from.length && this.from.length !== to.length) {
				throw new Error('The number of elements have changed between states.');
			}
			for (let i = 0; i < count; i++) {
				if (this.elements[i] !== this.from[i].el && this.from[i].el !== to[i].el) {
					throw new Error('The elements have changed between states.');
				}
			}

			// Create the flip animations.
			const totalDuration = duration + stagger * (to.length - 1) + delay;
			for (let i = 0; i < count; i++) {
				const staggerDelay = i * stagger + delay;

				const { animation, cleanup } = Flip._invert(this.from[i], to[i], {
					duration: duration,
					delay: staggerDelay,
					easing,
					props
				});

				animations[i] = animation;
				cleanups[i] = cleanup;
			}

			const timeout = setTimeout(() => {
				// Clean up the flip animation after all animations have completed.
				for (let i = 0; i < count; i++) {
					cleanups[i]();
				}

				if (onComplete) onComplete();
			}, totalDuration);

			const interrupt = () => {
				clearTimeout(timeout);
				for (let i = 0; i < count; i++) {
					// Remove the flip animation from the element.
					this.from[i].el._flipAnimation = undefined;
					cleanups[i]();
				}
			};

			for (let i = 0; i < count; i++) {
				// Inject the flip animation into the element.
				this.from[i].el._flipAnimation = animations[i];

				// Inject the cleanup function into the flip animation.
				animations[i]._interrupt = interrupt;
			}
		});

		return animations;
	}

	/**
	 * Lock the body scroll to prevent scrolling during measurements.
	 * Cases:
	 * 1. The last element of the page becomes absolute, causing the body to shrink upwards.
	 * 2. The scroll bar disappears, causing the body to expand outwards. (Not on Firefox :> It's the best!)
	 * @returns
	 */
	bodyLockScroll() {
		if (this.bodyUnlockScroll) return;
		const body = document.body;
		this.bodyUnlockScroll = Flip._saveUpdateStyle(
			body,
			'style',
			`width: ${body.clientWidth}px; height: ${body.clientHeight}px; overflow: hidden;`
		);
	}

	/**
	 * Invert the element from the initial state to the final state.
	 * @param from - The initial state of the element.
	 * @param to - The final state of the element.
	 * @param options - The options for the animation.
	 * @param waitDuration - The duration to wait before cleaning up the animation.
	 * @returns The flip animation and its cleanup function.
	 */
	private static _invert(
		from: Rect,
		to: Rect,
		options: Options
	): { animation: Animation; cleanup: () => void } {
		const { duration, delay, easing, props } = options;
		const { absolute = true, width = true, height = true, transform = true } = props ?? {};

		const restoreStyle = absolute ? Flip._absolute(from.el) : undefined;

		const animation = from.el.animate(
			[
				{
					width: width ? `${from.width}px` : undefined,
					height: height ? `${from.height}px` : undefined,
					transform: transform
						? `translate(${from.left - from.bound.left}px, ${from.top - from.bound.top}px)`
						: undefined
				},
				{
					width: width ? `${to.width}px` : undefined,
					height: height ? `${to.height}px` : undefined,
					transform: transform
						? `translate(${to.left - to.bound.left}px, ${to.top - to.bound.top}px)`
						: undefined
				}
			],
			{ duration, delay, easing, fill: 'both' }
		);

		let hasCleanedUp = false;
		const cleanup = () => {
			if (hasCleanedUp) return;
			hasCleanedUp = true;
			if (restoreStyle) restoreStyle();
			animation.cancel();
		};

		return { animation, cleanup };
	}

	/**
	 * Measure the current bounding box state of the elements.
	 * @returns
	 */
	private static _measure(elements: HTMLElement[]): Rect[] {
		const size = elements.length;
		const rects = Array(size);

		for (let index = 0; index < size; index++) {
			const el = elements[index];
			const rect = el.getBoundingClientRect().toJSON();
			rect.el = el;
			rects[index] = rect;
		}

		return rects;
	}

	/**
	 * Capture the absolute bounding box state of the elements from their relative ancestors.
	 * @param rects - The elements to capture the state from and mutate.
	 * @returns
	 */
	private static _matrix(rects: Rect[]): Rect[] {
		for (let index = 0; index < rects.length; index++) {
			const rect = rects[index];

			// Get the matrix from its closest relative ancestor.
			const restoreStyle = Flip._saveUpdateStyle(
				rect.el,
				'style',
				'position: absolute; top: 0px; left: 0px; transform: none; transition: none;'
			);
			const matrix = rect.el.getBoundingClientRect().toJSON();

			restoreStyle();
			rect.bound = matrix;
		}

		return rects;
	}

	/**
	 * Update the style of an element to absolute positioning.
	 * @param el - The element to update.
	 * @returns A function to restore the original style.
	 */
	private static _absolute(el: HTMLElement) {
		return Flip._saveUpdateStyle(el, 'style', 'position: absolute; top: 0px; left: 0px;');
	}

	/**
	 * Update the style of an element and return a function to restore the original style.
	 * @param el - The element to update.
	 * @param qualifiedName - The name of the attribute to update.
	 * @param value - The new value of the attribute.
	 * @returns A function to restore the original style.
	 */
	private static _saveUpdateStyle(el: HTMLElement, qualifiedName: string, value: string) {
		const style = el.style.cssText;

		el.setAttribute(qualifiedName, value);

		return () => {
			el.style.cssText = style;
		};
	}
}
