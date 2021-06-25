
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update$1(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update$1($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    // Unique ID creation requires a high quality random # generator. In the browser we therefore
    // require the crypto API and do not support built-in fallback to lower quality random number
    // generators (like Math.random()).
    var getRandomValues;
    var rnds8 = new Uint8Array(16);
    function rng() {
      // lazy load so that environments that need to polyfill have a chance to do so
      if (!getRandomValues) {
        // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
        // find the complete implementation of crypto (msCrypto) on IE11.
        getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);

        if (!getRandomValues) {
          throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
        }
      }

      return getRandomValues(rnds8);
    }

    var REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

    function validate(uuid) {
      return typeof uuid === 'string' && REGEX.test(uuid);
    }

    /**
     * Convert array of 16 byte values to UUID string format of the form:
     * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
     */

    var byteToHex = [];

    for (var i = 0; i < 256; ++i) {
      byteToHex.push((i + 0x100).toString(16).substr(1));
    }

    function stringify(arr) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      // Note: Be careful editing this code!  It's been tuned for performance
      // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
      var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
      // of the following:
      // - One or more input array values don't map to a hex octet (leading to
      // "undefined" in the uuid)
      // - Invalid input values for the RFC `version` or `variant` fields

      if (!validate(uuid)) {
        throw TypeError('Stringified UUID is invalid');
      }

      return uuid;
    }

    function v4(options, buf, offset) {
      options = options || {};
      var rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

      rnds[6] = rnds[6] & 0x0f | 0x40;
      rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

      if (buf) {
        offset = offset || 0;

        for (var i = 0; i < 16; ++i) {
          buf[offset + i] = rnds[i];
        }

        return buf;
      }

      return stringify(rnds);
    }

    /* src\components\Checkbox.svelte generated by Svelte v3.38.2 */
    const file$3 = "src\\components\\Checkbox.svelte";

    function create_fragment$3(ctx) {
    	let label;
    	let input;
    	let t;
    	let svg;
    	let symbol;
    	let path0;
    	let defs;
    	let mask;
    	let use0;
    	let use1;
    	let path1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t = space();
    			svg = svg_element("svg");
    			symbol = svg_element("symbol");
    			path0 = svg_element("path");
    			defs = svg_element("defs");
    			mask = svg_element("mask");
    			use0 = svg_element("use");
    			use1 = svg_element("use");
    			path1 = svg_element("path");
    			attr_dev(input, "type", "checkbox");
    			input.checked = /*checked*/ ctx[1];
    			attr_dev(input, "class", "svelte-1x32vhm");
    			add_location(input, file$3, 10, 4, 171);
    			attr_dev(path0, "d", "M5.22003 7.26C5.72003 7.76 7.57 9.7 8.67 11.45C12.2 6.05 15.65 3.5 19.19 1.69");
    			attr_dev(path0, "fill", "none");
    			attr_dev(path0, "stroke-width", "2.25");
    			attr_dev(path0, "stroke-linecap", "round");
    			attr_dev(path0, "stroke-linejoin", "round");
    			add_location(path0, file$3, 17, 12, 406);
    			attr_dev(symbol, "id", "tick-path-" + /*id*/ ctx[2]);
    			attr_dev(symbol, "viewBox", "0 0 21 18");
    			attr_dev(symbol, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(symbol, file$3, 12, 8, 265);
    			attr_dev(use0, "class", "tick mask svelte-1x32vhm");
    			attr_dev(use0, "href", "#tick-path-" + /*id*/ ctx[2]);
    			add_location(use0, file$3, 27, 16, 751);
    			attr_dev(mask, "id", "tick_" + /*id*/ ctx[2]);
    			add_location(mask, file$3, 26, 12, 713);
    			add_location(defs, file$3, 25, 8, 694);
    			attr_dev(use1, "class", "tick svelte-1x32vhm");
    			attr_dev(use1, "href", "#tick-path-" + /*id*/ ctx[2]);
    			attr_dev(use1, "stroke", "currentColor");
    			add_location(use1, file$3, 30, 8, 844);
    			attr_dev(path1, "fill", "white");
    			attr_dev(path1, "mask", "url(#tick_" + /*id*/ ctx[2] + ")");
    			attr_dev(path1, "d", "M18 9C18 10.4464 17.9036 11.8929 17.7589 13.1464C17.5179 15.6054 15.6054 17.5179 13.1625 17.7589C11.8929 17.9036 10.4464 18 9 18C7.55357 18 6.10714 17.9036 4.85357 17.7589C2.39464 17.5179 0.498214 15.6054 0.241071 13.1464C0.0964286 11.8929 0 10.4464 0 9C0 7.55357 0.0964286 6.10714 0.241071 4.8375C0.498214 2.39464 2.39464 0.482143 4.85357 0.241071C6.10714 0.0964286 7.55357 0 9 0C10.4464 0 11.8929 0.0964286 13.1625 0.241071C15.6054 0.482143 17.5179 2.39464 17.7589 4.8375C17.9036 6.10714 18 7.55357 18 9Z");
    			add_location(path1, file$3, 31, 8, 918);
    			attr_dev(svg, "viewBox", "0 0 21 18");
    			attr_dev(svg, "class", "svelte-1x32vhm");
    			add_location(svg, file$3, 11, 4, 231);
    			attr_dev(label, "class", "checkbox svelte-1x32vhm");
    			add_location(label, file$3, 9, 0, 142);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			append_dev(label, t);
    			append_dev(label, svg);
    			append_dev(svg, symbol);
    			append_dev(symbol, path0);
    			append_dev(svg, defs);
    			append_dev(defs, mask);
    			append_dev(mask, use0);
    			append_dev(svg, use1);
    			append_dev(svg, path1);

    			if (!mounted) {
    				dispose = listen_dev(
    					input,
    					"change",
    					function () {
    						if (is_function(/*onCheck*/ ctx[0])) /*onCheck*/ ctx[0].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*checked*/ 2) {
    				prop_dev(input, "checked", /*checked*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Checkbox", slots, []);
    	let { onCheck } = $$props;
    	let { checked = false } = $$props;
    	let id = v4();
    	const writable_props = ["onCheck", "checked"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Checkbox> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("onCheck" in $$props) $$invalidate(0, onCheck = $$props.onCheck);
    		if ("checked" in $$props) $$invalidate(1, checked = $$props.checked);
    	};

    	$$self.$capture_state = () => ({ onCheck, checked, uuidv4: v4, id });

    	$$self.$inject_state = $$props => {
    		if ("onCheck" in $$props) $$invalidate(0, onCheck = $$props.onCheck);
    		if ("checked" in $$props) $$invalidate(1, checked = $$props.checked);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [onCheck, checked, id];
    }

    class Checkbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { onCheck: 0, checked: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Checkbox",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*onCheck*/ ctx[0] === undefined && !("onCheck" in props)) {
    			console.warn("<Checkbox> was created without expected prop 'onCheck'");
    		}
    	}

    	get onCheck() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onCheck(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checked() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Todo.svelte generated by Svelte v3.38.2 */
    const file$2 = "src\\components\\Todo.svelte";

    function create_fragment$2(ctx) {
    	let div1;
    	let p;
    	let t0;
    	let t1;
    	let checkbox;
    	let t2;
    	let div0;
    	let svg;
    	let path;
    	let div1_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	checkbox = new Checkbox({
    			props: {
    				onCheck: /*stateHandler*/ ctx[3],
    				checked: /*done*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			p = element("p");
    			t0 = text(/*description*/ ctx[0]);
    			t1 = space();
    			create_component(checkbox.$$.fragment);
    			t2 = space();
    			div0 = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(p, "class", "description svelte-km9w7a");
    			add_location(p, file$2, 10, 4, 242);
    			attr_dev(path, "class", "close-x svelte-km9w7a");
    			attr_dev(path, "d", "M 10,10 L 30,30 M 30,10 L 10,30");
    			add_location(path, file$2, 18, 12, 453);
    			attr_dev(svg, "viewBox", "0 0 40 40");
    			add_location(svg, file$2, 17, 8, 414);
    			attr_dev(div0, "class", "suppr svelte-km9w7a");
    			add_location(div0, file$2, 16, 4, 364);
    			attr_dev(div1, "class", div1_class_value = "todo-item " + (/*done*/ ctx[1] ? "done" : "todo") + " svelte-km9w7a");
    			add_location(div1, file$2, 9, 0, 188);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p);
    			append_dev(p, t0);
    			append_dev(div1, t1);
    			mount_component(checkbox, div1, null);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, svg);
    			append_dev(svg, path);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					div0,
    					"click",
    					function () {
    						if (is_function(/*onClicked*/ ctx[2])) /*onClicked*/ ctx[2].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (!current || dirty & /*description*/ 1) set_data_dev(t0, /*description*/ ctx[0]);
    			const checkbox_changes = {};
    			if (dirty & /*stateHandler*/ 8) checkbox_changes.onCheck = /*stateHandler*/ ctx[3];
    			if (dirty & /*done*/ 2) checkbox_changes.checked = /*done*/ ctx[1];
    			checkbox.$set(checkbox_changes);

    			if (!current || dirty & /*done*/ 2 && div1_class_value !== (div1_class_value = "todo-item " + (/*done*/ ctx[1] ? "done" : "todo") + " svelte-km9w7a")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checkbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(checkbox);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Todo", slots, []);
    	let { description } = $$props;
    	let { done = false } = $$props;
    	let { onClicked } = $$props;
    	let { stateHandler } = $$props;
    	const writable_props = ["description", "done", "onClicked", "stateHandler"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Todo> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("description" in $$props) $$invalidate(0, description = $$props.description);
    		if ("done" in $$props) $$invalidate(1, done = $$props.done);
    		if ("onClicked" in $$props) $$invalidate(2, onClicked = $$props.onClicked);
    		if ("stateHandler" in $$props) $$invalidate(3, stateHandler = $$props.stateHandler);
    	};

    	$$self.$capture_state = () => ({
    		Checkbox,
    		description,
    		done,
    		onClicked,
    		stateHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ("description" in $$props) $$invalidate(0, description = $$props.description);
    		if ("done" in $$props) $$invalidate(1, done = $$props.done);
    		if ("onClicked" in $$props) $$invalidate(2, onClicked = $$props.onClicked);
    		if ("stateHandler" in $$props) $$invalidate(3, stateHandler = $$props.stateHandler);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [description, done, onClicked, stateHandler];
    }

    class Todo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			description: 0,
    			done: 1,
    			onClicked: 2,
    			stateHandler: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Todo",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*description*/ ctx[0] === undefined && !("description" in props)) {
    			console.warn("<Todo> was created without expected prop 'description'");
    		}

    		if (/*onClicked*/ ctx[2] === undefined && !("onClicked" in props)) {
    			console.warn("<Todo> was created without expected prop 'onClicked'");
    		}

    		if (/*stateHandler*/ ctx[3] === undefined && !("stateHandler" in props)) {
    			console.warn("<Todo> was created without expected prop 'stateHandler'");
    		}
    	}

    	get description() {
    		throw new Error("<Todo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<Todo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get done() {
    		throw new Error("<Todo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set done(value) {
    		throw new Error("<Todo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClicked() {
    		throw new Error("<Todo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClicked(value) {
    		throw new Error("<Todo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stateHandler() {
    		throw new Error("<Todo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stateHandler(value) {
    		throw new Error("<Todo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\TodoInput.svelte generated by Svelte v3.38.2 */

    const file$1 = "src\\components\\TodoInput.svelte";

    function create_fragment$1(ctx) {
    	let div1;
    	let input;
    	let t0;
    	let div0;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			input = element("input");
    			t0 = space();
    			div0 = element("div");
    			div0.textContent = "CONFIRM";
    			attr_dev(input, "placeholder", "Do something...");
    			attr_dev(input, "class", "svelte-1u5l302");
    			add_location(input, file$1, 7, 4, 109);
    			attr_dev(div0, "class", "confirm svelte-1u5l302");
    			add_location(div0, file$1, 8, 4, 179);
    			attr_dev(div1, "class", "todo-input svelte-1u5l302");
    			add_location(div1, file$1, 6, 0, 79);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, input);
    			set_input_value(input, /*description*/ ctx[1]);
    			append_dev(div1, t0);
    			append_dev(div1, div0);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[2]),
    					listen_dev(div0, "click", /*click_handler*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*description*/ 2 && input.value !== /*description*/ ctx[1]) {
    				set_input_value(input, /*description*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TodoInput", slots, []);
    	let { onConfirm } = $$props;
    	let description = "";
    	const writable_props = ["onConfirm"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TodoInput> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		description = this.value;
    		$$invalidate(1, description);
    	}

    	const click_handler = () => onConfirm(description);

    	$$self.$$set = $$props => {
    		if ("onConfirm" in $$props) $$invalidate(0, onConfirm = $$props.onConfirm);
    	};

    	$$self.$capture_state = () => ({ onConfirm, description });

    	$$self.$inject_state = $$props => {
    		if ("onConfirm" in $$props) $$invalidate(0, onConfirm = $$props.onConfirm);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [onConfirm, description, input_input_handler, click_handler];
    }

    class TodoInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { onConfirm: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TodoInput",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*onConfirm*/ ctx[0] === undefined && !("onConfirm" in props)) {
    			console.warn("<TodoInput> was created without expected prop 'onConfirm'");
    		}
    	}

    	get onConfirm() {
    		throw new Error("<TodoInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onConfirm(value) {
    		throw new Error("<TodoInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const getAll = async () => {
      return JSON.parse(localStorage.getItem('todos') || '[]');
    };

    const create = async (todo) => {
      persist([...(await getAll()), todo]);
      return todo;
    };

    const update = async (id, todo) => {
      const todos = (await getAll())
        .filter(t => t.id !== id);
      persist([...todos, todo]);
      return todo;
    };

    const remove = async (id) => {
      persist((await getAll()).filter(t => t.id !== id));
      return {};
    };

    const persist = (todos) => {
      localStorage.setItem('todos', JSON.stringify(todos));
    };

    var todoService = { 
      getAll, 
      create, 
      update,
    	remove
    };

    /* src\App.svelte generated by Svelte v3.38.2 */
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i].description;
    	child_ctx[8] = list[i].done;
    	child_ctx[9] = list[i].id;
    	return child_ctx;
    }

    // (56:3) {#each todos as { description, done, id }}
    function create_each_block(ctx) {
    	let todo;
    	let current;

    	function func() {
    		return /*func*/ ctx[4](/*id*/ ctx[9]);
    	}

    	function func_1() {
    		return /*func_1*/ ctx[5](/*id*/ ctx[9]);
    	}

    	todo = new Todo({
    			props: {
    				description: /*description*/ ctx[7],
    				done: /*done*/ ctx[8],
    				onClicked: func,
    				stateHandler: func_1
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(todo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(todo, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const todo_changes = {};
    			if (dirty & /*todos*/ 1) todo_changes.description = /*description*/ ctx[7];
    			if (dirty & /*todos*/ 1) todo_changes.done = /*done*/ ctx[8];
    			if (dirty & /*todos*/ 1) todo_changes.onClicked = func;
    			if (dirty & /*todos*/ 1) todo_changes.stateHandler = func_1;
    			todo.$set(todo_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(todo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(todo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(todo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(56:3) {#each todos as { description, done, id }}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let div2;
    	let div0;
    	let todoinput;
    	let t2;
    	let div1;
    	let current;

    	todoinput = new TodoInput({
    			props: { onConfirm: /*onTodoCreate*/ ctx[2] },
    			$$inline: true
    		});

    	let each_value = /*todos*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Bonsoir à tous";
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			create_component(todoinput.$$.fragment);
    			t2 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "title svelte-16fve2h");
    			add_location(h1, file, 48, 1, 941);
    			attr_dev(div0, "class", "top_panel svelte-16fve2h");
    			add_location(div0, file, 50, 2, 1011);
    			attr_dev(div1, "class", "main_panel svelte-16fve2h");
    			add_location(div1, file, 54, 2, 1089);
    			attr_dev(div2, "class", "page_container svelte-16fve2h");
    			add_location(div2, file, 49, 1, 980);
    			add_location(main, file, 47, 0, 933);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, div2);
    			append_dev(div2, div0);
    			mount_component(todoinput, div0, null);
    			append_dev(div2, t2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*todos, onTodoSuppr, switchTodoState*/ 11) {
    				each_value = /*todos*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(todoinput.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(todoinput.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(todoinput);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let todos = [];

    	const sortTodos = () => {
    		$$invalidate(0, todos = todos.sort((a, b) => a.done - b.done === 0 ? b.id - a.id : a.done - b.done));
    	};

    	todoService.getAll().then(data => {
    		$$invalidate(0, todos = data);
    		sortTodos();
    	});

    	async function onTodoSuppr(id) {
    		await todoService.remove(id);
    		$$invalidate(0, todos = todos.filter(t => t.id !== id));
    	}

    	async function onTodoCreate(description) {
    		const res = await todoService.create({ description });
    		$$invalidate(0, todos = [res, ...todos]);
    	}

    	async function switchTodoState(id) {
    		let todo = todos.find(t => t.id === id);
    		const data = await todoService.update(id, { done: !todo.done });

    		$$invalidate(0, todos = todos.map(t => {
    			if (t.id === id) {
    				return data;
    			}

    			return t;
    		}));

    		setTimeout(sortTodos, 200);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const func = id => onTodoSuppr(id);
    	const func_1 = id => switchTodoState(id);

    	$$self.$capture_state = () => ({
    		Todo,
    		TodoInput,
    		todoService,
    		todos,
    		sortTodos,
    		onTodoSuppr,
    		onTodoCreate,
    		switchTodoState
    	});

    	$$self.$inject_state = $$props => {
    		if ("todos" in $$props) $$invalidate(0, todos = $$props.todos);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [todos, onTodoSuppr, onTodoCreate, switchTodoState, func, func_1];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
