
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
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
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
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
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
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
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
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
        else if (callback) {
            callback();
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
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
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.49.0' }, detail), { bubbles: true }));
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

    /* src\components\Footer.svelte generated by Svelte v3.49.0 */

    const file$B = "src\\components\\Footer.svelte";

    function create_fragment$D(ctx) {
    	let footer;
    	let div;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div = element("div");
    			div.textContent = "Copyright 2022";
    			attr_dev(div, "class", "copyright svelte-rqxxpk");
    			add_location(div, file$B, 1, 4, 14);
    			attr_dev(footer, "class", "svelte-rqxxpk");
    			add_location(footer, file$B, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$D.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$D($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$D, create_fragment$D, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$D.name
    		});
    	}
    }

    /* src\components\Header.svelte generated by Svelte v3.49.0 */

    const file$A = "src\\components\\Header.svelte";

    function create_fragment$C(ctx) {
    	let main;
    	let h1;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Hello";
    			add_location(h1, file$A, 5, 4, 37);
    			add_location(main, file$A, 4, 0, 25);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$C.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$C($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$C, create_fragment$C, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$C.name
    		});
    	}
    }

    /* src\components\shared\Card.svelte generated by Svelte v3.49.0 */

    const file$z = "src\\components\\shared\\Card.svelte";

    function create_fragment$B(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "card svelte-lny2t5");
    			add_location(div, file$z, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$B.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$B($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Card', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Card$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$B, create_fragment$B, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$B.name
    		});
    	}
    }

    /* src\components\shared\Tabs.svelte generated by Svelte v3.49.0 */
    const file$y = "src\\components\\shared\\Tabs.svelte";

    function get_each_context$e(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (12:8) {#each items as item}
    function create_each_block$e(ctx) {
    	let li;
    	let div;
    	let t0_value = /*item*/ ctx[4] + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*item*/ ctx[4]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", "svelte-1r5azkr");
    			toggle_class(div, "active", /*item*/ ctx[4] === /*activeItem*/ ctx[1]);
    			add_location(div, file$y, 13, 16, 318);
    			attr_dev(li, "class", "svelte-1r5azkr");
    			add_location(li, file$y, 12, 12, 251);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div);
    			append_dev(div, t0);
    			append_dev(li, t1);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*items*/ 1 && t0_value !== (t0_value = /*item*/ ctx[4] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*items, activeItem*/ 3) {
    				toggle_class(div, "active", /*item*/ ctx[4] === /*activeItem*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$e.name,
    		type: "each",
    		source: "(12:8) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$A(ctx) {
    	let div;
    	let ul;
    	let each_value = /*items*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$e(get_each_context$e(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-1r5azkr");
    			add_location(ul, file$y, 10, 4, 202);
    			attr_dev(div, "class", "tabs svelte-1r5azkr");
    			add_location(div, file$y, 9, 0, 178);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dispatch, items, activeItem*/ 7) {
    				each_value = /*items*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$e(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$e(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$A.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$A($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tabs', slots, []);
    	const dispatch = createEventDispatcher();
    	let { items } = $$props;
    	let { activeItem } = $$props;
    	const writable_props = ['items', 'activeItem'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tabs> was created with unknown prop '${key}'`);
    	});

    	const click_handler = item => dispatch('tabChange', item);

    	$$self.$$set = $$props => {
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    		if ('activeItem' in $$props) $$invalidate(1, activeItem = $$props.activeItem);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		items,
    		activeItem
    	});

    	$$self.$inject_state = $$props => {
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    		if ('activeItem' in $$props) $$invalidate(1, activeItem = $$props.activeItem);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [items, activeItem, dispatch, click_handler];
    }

    class Tabs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$A, create_fragment$A, safe_not_equal, { items: 0, activeItem: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs",
    			options,
    			id: create_fragment$A.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*items*/ ctx[0] === undefined && !('items' in props)) {
    			console.warn("<Tabs> was created without expected prop 'items'");
    		}

    		if (/*activeItem*/ ctx[1] === undefined && !('activeItem' in props)) {
    			console.warn("<Tabs> was created without expected prop 'activeItem'");
    		}
    	}

    	get items() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeItem() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeItem(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var bind$1 = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    // utils is a library of generic helper functions non-specific to axios

    var toString$1 = Object.prototype.toString;

    // eslint-disable-next-line func-names
    var kindOf$1 = (function(cache) {
      // eslint-disable-next-line func-names
      return function(thing) {
        var str = toString$1.call(thing);
        return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
      };
    })(Object.create(null));

    function kindOfTest$1(type) {
      type = type.toLowerCase();
      return function isKindOf(thing) {
        return kindOf$1(thing) === type;
      };
    }

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray$1(val) {
      return Array.isArray(val);
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined$1(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is a Buffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer$1(val) {
      return val !== null && !isUndefined$1(val) && val.constructor !== null && !isUndefined$1(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    var isArrayBuffer$1 = kindOfTest$1('ArrayBuffer');


    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView$1(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (isArrayBuffer$1(val.buffer));
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString$1(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber$1(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject$1(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a plain Object
     *
     * @param {Object} val The value to test
     * @return {boolean} True if value is a plain Object, otherwise false
     */
    function isPlainObject$1(val) {
      if (kindOf$1(val) !== 'object') {
        return false;
      }

      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }

    /**
     * Determine if a value is a Date
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    var isDate$1 = kindOfTest$1('Date');

    /**
     * Determine if a value is a File
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    var isFile$1 = kindOfTest$1('File');

    /**
     * Determine if a value is a Blob
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    var isBlob$1 = kindOfTest$1('Blob');

    /**
     * Determine if a value is a FileList
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    var isFileList$1 = kindOfTest$1('FileList');

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction$1(val) {
      return toString$1.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream$1(val) {
      return isObject$1(val) && isFunction$1(val.pipe);
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} thing The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData$1(thing) {
      var pattern = '[object FormData]';
      return thing && (
        (typeof FormData === 'function' && thing instanceof FormData) ||
        toString$1.call(thing) === pattern ||
        (isFunction$1(thing.toString) && thing.toString() === pattern)
      );
    }

    /**
     * Determine if a value is a URLSearchParams object
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    var isURLSearchParams$1 = kindOfTest$1('URLSearchParams');

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim$1(str) {
      return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv$1() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach$1(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray$1(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge$1(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject$1(result[key]) && isPlainObject$1(val)) {
          result[key] = merge$1(result[key], val);
        } else if (isPlainObject$1(val)) {
          result[key] = merge$1({}, val);
        } else if (isArray$1(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach$1(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend$1(a, b, thisArg) {
      forEach$1(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind$1(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     * @return {string} content value without BOM
     */
    function stripBOM$1(content) {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    }

    /**
     * Inherit the prototype methods from one constructor into another
     * @param {function} constructor
     * @param {function} superConstructor
     * @param {object} [props]
     * @param {object} [descriptors]
     */

    function inherits$1(constructor, superConstructor, props, descriptors) {
      constructor.prototype = Object.create(superConstructor.prototype, descriptors);
      constructor.prototype.constructor = constructor;
      props && Object.assign(constructor.prototype, props);
    }

    /**
     * Resolve object with deep prototype chain to a flat object
     * @param {Object} sourceObj source object
     * @param {Object} [destObj]
     * @param {Function} [filter]
     * @returns {Object}
     */

    function toFlatObject$1(sourceObj, destObj, filter) {
      var props;
      var i;
      var prop;
      var merged = {};

      destObj = destObj || {};

      do {
        props = Object.getOwnPropertyNames(sourceObj);
        i = props.length;
        while (i-- > 0) {
          prop = props[i];
          if (!merged[prop]) {
            destObj[prop] = sourceObj[prop];
            merged[prop] = true;
          }
        }
        sourceObj = Object.getPrototypeOf(sourceObj);
      } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

      return destObj;
    }

    /*
     * determines whether a string ends with the characters of a specified string
     * @param {String} str
     * @param {String} searchString
     * @param {Number} [position= 0]
     * @returns {boolean}
     */
    function endsWith$1(str, searchString, position) {
      str = String(str);
      if (position === undefined || position > str.length) {
        position = str.length;
      }
      position -= searchString.length;
      var lastIndex = str.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    }


    /**
     * Returns new array from array like object
     * @param {*} [thing]
     * @returns {Array}
     */
    function toArray$1(thing) {
      if (!thing) return null;
      var i = thing.length;
      if (isUndefined$1(i)) return null;
      var arr = new Array(i);
      while (i-- > 0) {
        arr[i] = thing[i];
      }
      return arr;
    }

    // eslint-disable-next-line func-names
    var isTypedArray$1 = (function(TypedArray) {
      // eslint-disable-next-line func-names
      return function(thing) {
        return TypedArray && thing instanceof TypedArray;
      };
    })(typeof Uint8Array !== 'undefined' && Object.getPrototypeOf(Uint8Array));

    var utils$1 = {
      isArray: isArray$1,
      isArrayBuffer: isArrayBuffer$1,
      isBuffer: isBuffer$1,
      isFormData: isFormData$1,
      isArrayBufferView: isArrayBufferView$1,
      isString: isString$1,
      isNumber: isNumber$1,
      isObject: isObject$1,
      isPlainObject: isPlainObject$1,
      isUndefined: isUndefined$1,
      isDate: isDate$1,
      isFile: isFile$1,
      isBlob: isBlob$1,
      isFunction: isFunction$1,
      isStream: isStream$1,
      isURLSearchParams: isURLSearchParams$1,
      isStandardBrowserEnv: isStandardBrowserEnv$1,
      forEach: forEach$1,
      merge: merge$1,
      extend: extend$1,
      trim: trim$1,
      stripBOM: stripBOM$1,
      inherits: inherits$1,
      toFlatObject: toFlatObject$1,
      kindOf: kindOf$1,
      kindOfTest: kindOfTest$1,
      endsWith: endsWith$1,
      toArray: toArray$1,
      isTypedArray: isTypedArray$1,
      isFileList: isFileList$1
    };

    function encode$1(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL$1 = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils$1.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils$1.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils$1.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils$1.forEach(val, function parseValue(v) {
            if (utils$1.isDate(v)) {
              v = v.toISOString();
            } else if (utils$1.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode$1(key) + '=' + encode$1(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager$1() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager$1.prototype.use = function use(fulfilled, rejected, options) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected,
        synchronous: options ? options.synchronous : false,
        runWhen: options ? options.runWhen : null
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager$1.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager$1.prototype.forEach = function forEach(fn) {
      utils$1.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1$1 = InterceptorManager$1;

    var normalizeHeaderName$1 = function normalizeHeaderName(headers, normalizedName) {
      utils$1.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [config] The config.
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    function AxiosError$1(message, code, config, request, response) {
      Error.call(this);
      this.message = message;
      this.name = 'AxiosError';
      code && (this.code = code);
      config && (this.config = config);
      request && (this.request = request);
      response && (this.response = response);
    }

    utils$1.inherits(AxiosError$1, Error, {
      toJSON: function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code,
          status: this.response && this.response.status ? this.response.status : null
        };
      }
    });

    var prototype$1 = AxiosError$1.prototype;
    var descriptors$1 = {};

    [
      'ERR_BAD_OPTION_VALUE',
      'ERR_BAD_OPTION',
      'ECONNABORTED',
      'ETIMEDOUT',
      'ERR_NETWORK',
      'ERR_FR_TOO_MANY_REDIRECTS',
      'ERR_DEPRECATED',
      'ERR_BAD_RESPONSE',
      'ERR_BAD_REQUEST',
      'ERR_CANCELED'
    // eslint-disable-next-line func-names
    ].forEach(function(code) {
      descriptors$1[code] = {value: code};
    });

    Object.defineProperties(AxiosError$1, descriptors$1);
    Object.defineProperty(prototype$1, 'isAxiosError', {value: true});

    // eslint-disable-next-line func-names
    AxiosError$1.from = function(error, code, config, request, response, customProps) {
      var axiosError = Object.create(prototype$1);

      utils$1.toFlatObject(error, axiosError, function filter(obj) {
        return obj !== Error.prototype;
      });

      AxiosError$1.call(axiosError, error.message, code, config, request, response);

      axiosError.name = error.name;

      customProps && Object.assign(axiosError, customProps);

      return axiosError;
    };

    var AxiosError_1$1 = AxiosError$1;

    var transitional$1 = {
      silentJSONParsing: true,
      forcedJSONParsing: true,
      clarifyTimeoutError: false
    };

    /**
     * Convert a data object to FormData
     * @param {Object} obj
     * @param {?Object} [formData]
     * @returns {Object}
     **/

    function toFormData$1(obj, formData) {
      // eslint-disable-next-line no-param-reassign
      formData = formData || new FormData();

      var stack = [];

      function convertValue(value) {
        if (value === null) return '';

        if (utils$1.isDate(value)) {
          return value.toISOString();
        }

        if (utils$1.isArrayBuffer(value) || utils$1.isTypedArray(value)) {
          return typeof Blob === 'function' ? new Blob([value]) : Buffer.from(value);
        }

        return value;
      }

      function build(data, parentKey) {
        if (utils$1.isPlainObject(data) || utils$1.isArray(data)) {
          if (stack.indexOf(data) !== -1) {
            throw Error('Circular reference detected in ' + parentKey);
          }

          stack.push(data);

          utils$1.forEach(data, function each(value, key) {
            if (utils$1.isUndefined(value)) return;
            var fullKey = parentKey ? parentKey + '.' + key : key;
            var arr;

            if (value && !parentKey && typeof value === 'object') {
              if (utils$1.endsWith(key, '{}')) {
                // eslint-disable-next-line no-param-reassign
                value = JSON.stringify(value);
              } else if (utils$1.endsWith(key, '[]') && (arr = utils$1.toArray(value))) {
                // eslint-disable-next-line func-names
                arr.forEach(function(el) {
                  !utils$1.isUndefined(el) && formData.append(fullKey, convertValue(el));
                });
                return;
              }
            }

            build(value, fullKey);
          });

          stack.pop();
        } else {
          formData.append(parentKey, convertValue(data));
        }
      }

      build(obj);

      return formData;
    }

    var toFormData_1$1 = toFormData$1;

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle$1 = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(new AxiosError_1$1(
          'Request failed with status code ' + response.status,
          [AxiosError_1$1.ERR_BAD_REQUEST, AxiosError_1$1.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
          response.config,
          response.request,
          response
        ));
      }
    };

    var cookies$1 = (
      utils$1.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils$1.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils$1.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils$1.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL$1 = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs$1 = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     * @returns {string} The combined full path
     */
    var buildFullPath$1 = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL$1(requestedURL)) {
        return combineURLs$1(baseURL, requestedURL);
      }
      return requestedURL;
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf$1 = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders$1 = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils$1.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils$1.trim(line.substr(0, i)).toLowerCase();
        val = utils$1.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf$1.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin$1 = (
      utils$1.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils$1.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    /**
     * A `CanceledError` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function CanceledError$1(message) {
      // eslint-disable-next-line no-eq-null,eqeqeq
      AxiosError_1$1.call(this, message == null ? 'canceled' : message, AxiosError_1$1.ERR_CANCELED);
      this.name = 'CanceledError';
    }

    utils$1.inherits(CanceledError$1, AxiosError_1$1, {
      __CANCEL__: true
    });

    var CanceledError_1$1 = CanceledError$1;

    var parseProtocol$1 = function parseProtocol(url) {
      var match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
      return match && match[1] || '';
    };

    var xhr$1 = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;
        var responseType = config.responseType;
        var onCanceled;
        function done() {
          if (config.cancelToken) {
            config.cancelToken.unsubscribe(onCanceled);
          }

          if (config.signal) {
            config.signal.removeEventListener('abort', onCanceled);
          }
        }

        if (utils$1.isFormData(requestData) && utils$1.isStandardBrowserEnv()) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        var fullPath = buildFullPath$1(config.baseURL, config.url);

        request.open(config.method.toUpperCase(), buildURL$1(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        function onloadend() {
          if (!request) {
            return;
          }
          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders$1(request.getAllResponseHeaders()) : null;
          var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
            request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle$1(function _resolve(value) {
            resolve(value);
            done();
          }, function _reject(err) {
            reject(err);
            done();
          }, response);

          // Clean up request
          request = null;
        }

        if ('onloadend' in request) {
          // Use onloadend if available
          request.onloadend = onloadend;
        } else {
          // Listen for ready state to emulate onloadend
          request.onreadystatechange = function handleLoad() {
            if (!request || request.readyState !== 4) {
              return;
            }

            // The request errored out and we didn't get a response, this will be
            // handled by onerror instead
            // With one exception: request that using file: protocol, most browsers
            // will return status as 0 even though it's a successful request
            if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
              return;
            }
            // readystate handler is calling before onerror or ontimeout handlers,
            // so we should call onloadend on the next 'tick'
            setTimeout(onloadend);
          };
        }

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(new AxiosError_1$1('Request aborted', AxiosError_1$1.ECONNABORTED, config, request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(new AxiosError_1$1('Network Error', AxiosError_1$1.ERR_NETWORK, config, request, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
          var transitional = config.transitional || transitional$1;
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(new AxiosError_1$1(
            timeoutErrorMessage,
            transitional.clarifyTimeoutError ? AxiosError_1$1.ETIMEDOUT : AxiosError_1$1.ECONNABORTED,
            config,
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils$1.isStandardBrowserEnv()) {
          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin$1(fullPath)) && config.xsrfCookieName ?
            cookies$1.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils$1.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (!utils$1.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (responseType && responseType !== 'json') {
          request.responseType = config.responseType;
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken || config.signal) {
          // Handle cancellation
          // eslint-disable-next-line func-names
          onCanceled = function(cancel) {
            if (!request) {
              return;
            }
            reject(!cancel || (cancel && cancel.type) ? new CanceledError_1$1() : cancel);
            request.abort();
            request = null;
          };

          config.cancelToken && config.cancelToken.subscribe(onCanceled);
          if (config.signal) {
            config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
          }
        }

        if (!requestData) {
          requestData = null;
        }

        var protocol = parseProtocol$1(fullPath);

        if (protocol && [ 'http', 'https', 'file' ].indexOf(protocol) === -1) {
          reject(new AxiosError_1$1('Unsupported protocol ' + protocol + ':', AxiosError_1$1.ERR_BAD_REQUEST, config));
          return;
        }


        // Send the request
        request.send(requestData);
      });
    };

    // eslint-disable-next-line strict
    var _null$1 = null;

    var DEFAULT_CONTENT_TYPE$1 = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset$1(headers, value) {
      if (!utils$1.isUndefined(headers) && utils$1.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter$1() {
      var adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr$1;
      } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr$1;
      }
      return adapter;
    }

    function stringifySafely$1(rawValue, parser, encoder) {
      if (utils$1.isString(rawValue)) {
        try {
          (parser || JSON.parse)(rawValue);
          return utils$1.trim(rawValue);
        } catch (e) {
          if (e.name !== 'SyntaxError') {
            throw e;
          }
        }
      }

      return (encoder || JSON.stringify)(rawValue);
    }

    var defaults$1 = {

      transitional: transitional$1,

      adapter: getDefaultAdapter$1(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName$1(headers, 'Accept');
        normalizeHeaderName$1(headers, 'Content-Type');

        if (utils$1.isFormData(data) ||
          utils$1.isArrayBuffer(data) ||
          utils$1.isBuffer(data) ||
          utils$1.isStream(data) ||
          utils$1.isFile(data) ||
          utils$1.isBlob(data)
        ) {
          return data;
        }
        if (utils$1.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils$1.isURLSearchParams(data)) {
          setContentTypeIfUnset$1(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }

        var isObjectPayload = utils$1.isObject(data);
        var contentType = headers && headers['Content-Type'];

        var isFileList;

        if ((isFileList = utils$1.isFileList(data)) || (isObjectPayload && contentType === 'multipart/form-data')) {
          var _FormData = this.env && this.env.FormData;
          return toFormData_1$1(isFileList ? {'files[]': data} : data, _FormData && new _FormData());
        } else if (isObjectPayload || contentType === 'application/json') {
          setContentTypeIfUnset$1(headers, 'application/json');
          return stringifySafely$1(data);
        }

        return data;
      }],

      transformResponse: [function transformResponse(data) {
        var transitional = this.transitional || defaults$1.transitional;
        var silentJSONParsing = transitional && transitional.silentJSONParsing;
        var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
        var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

        if (strictJSONParsing || (forcedJSONParsing && utils$1.isString(data) && data.length)) {
          try {
            return JSON.parse(data);
          } catch (e) {
            if (strictJSONParsing) {
              if (e.name === 'SyntaxError') {
                throw AxiosError_1$1.from(e, AxiosError_1$1.ERR_BAD_RESPONSE, this, null, this.response);
              }
              throw e;
            }
          }
        }

        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      env: {
        FormData: _null$1
      },

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      },

      headers: {
        common: {
          'Accept': 'application/json, text/plain, */*'
        }
      }
    };

    utils$1.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults$1.headers[method] = {};
    });

    utils$1.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults$1.headers[method] = utils$1.merge(DEFAULT_CONTENT_TYPE$1);
    });

    var defaults_1$1 = defaults$1;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData$1 = function transformData(data, headers, fns) {
      var context = this || defaults_1$1;
      /*eslint no-param-reassign:0*/
      utils$1.forEach(fns, function transform(fn) {
        data = fn.call(context, data, headers);
      });

      return data;
    };

    var isCancel$1 = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    /**
     * Throws a `CanceledError` if cancellation has been requested.
     */
    function throwIfCancellationRequested$1(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }

      if (config.signal && config.signal.aborted) {
        throw new CanceledError_1$1();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest$1 = function dispatchRequest(config) {
      throwIfCancellationRequested$1(config);

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData$1.call(
        config,
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils$1.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );

      utils$1.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults_1$1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested$1(config);

        // Transform response data
        response.data = transformData$1.call(
          config,
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel$1(reason)) {
          throwIfCancellationRequested$1(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData$1.call(
              config,
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig$1 = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      function getMergedValue(target, source) {
        if (utils$1.isPlainObject(target) && utils$1.isPlainObject(source)) {
          return utils$1.merge(target, source);
        } else if (utils$1.isPlainObject(source)) {
          return utils$1.merge({}, source);
        } else if (utils$1.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      // eslint-disable-next-line consistent-return
      function mergeDeepProperties(prop) {
        if (!utils$1.isUndefined(config2[prop])) {
          return getMergedValue(config1[prop], config2[prop]);
        } else if (!utils$1.isUndefined(config1[prop])) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function valueFromConfig2(prop) {
        if (!utils$1.isUndefined(config2[prop])) {
          return getMergedValue(undefined, config2[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function defaultToConfig2(prop) {
        if (!utils$1.isUndefined(config2[prop])) {
          return getMergedValue(undefined, config2[prop]);
        } else if (!utils$1.isUndefined(config1[prop])) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function mergeDirectKeys(prop) {
        if (prop in config2) {
          return getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      var mergeMap = {
        'url': valueFromConfig2,
        'method': valueFromConfig2,
        'data': valueFromConfig2,
        'baseURL': defaultToConfig2,
        'transformRequest': defaultToConfig2,
        'transformResponse': defaultToConfig2,
        'paramsSerializer': defaultToConfig2,
        'timeout': defaultToConfig2,
        'timeoutMessage': defaultToConfig2,
        'withCredentials': defaultToConfig2,
        'adapter': defaultToConfig2,
        'responseType': defaultToConfig2,
        'xsrfCookieName': defaultToConfig2,
        'xsrfHeaderName': defaultToConfig2,
        'onUploadProgress': defaultToConfig2,
        'onDownloadProgress': defaultToConfig2,
        'decompress': defaultToConfig2,
        'maxContentLength': defaultToConfig2,
        'maxBodyLength': defaultToConfig2,
        'beforeRedirect': defaultToConfig2,
        'transport': defaultToConfig2,
        'httpAgent': defaultToConfig2,
        'httpsAgent': defaultToConfig2,
        'cancelToken': defaultToConfig2,
        'socketPath': defaultToConfig2,
        'responseEncoding': defaultToConfig2,
        'validateStatus': mergeDirectKeys
      };

      utils$1.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
        var merge = mergeMap[prop] || mergeDeepProperties;
        var configValue = merge(prop);
        (utils$1.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
      });

      return config;
    };

    var data$1 = {
      "version": "0.27.2"
    };

    var VERSION$1 = data$1.version;


    var validators$3 = {};

    // eslint-disable-next-line func-names
    ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
      validators$3[type] = function validator(thing) {
        return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
      };
    });

    var deprecatedWarnings$1 = {};

    /**
     * Transitional option validator
     * @param {function|boolean?} validator - set to false if the transitional option has been removed
     * @param {string?} version - deprecated version / removed since version
     * @param {string?} message - some message with additional info
     * @returns {function}
     */
    validators$3.transitional = function transitional(validator, version, message) {
      function formatMessage(opt, desc) {
        return '[Axios v' + VERSION$1 + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
      }

      // eslint-disable-next-line func-names
      return function(value, opt, opts) {
        if (validator === false) {
          throw new AxiosError_1$1(
            formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
            AxiosError_1$1.ERR_DEPRECATED
          );
        }

        if (version && !deprecatedWarnings$1[opt]) {
          deprecatedWarnings$1[opt] = true;
          // eslint-disable-next-line no-console
          console.warn(
            formatMessage(
              opt,
              ' has been deprecated since v' + version + ' and will be removed in the near future'
            )
          );
        }

        return validator ? validator(value, opt, opts) : true;
      };
    };

    /**
     * Assert object's properties type
     * @param {object} options
     * @param {object} schema
     * @param {boolean?} allowUnknown
     */

    function assertOptions$1(options, schema, allowUnknown) {
      if (typeof options !== 'object') {
        throw new AxiosError_1$1('options must be an object', AxiosError_1$1.ERR_BAD_OPTION_VALUE);
      }
      var keys = Object.keys(options);
      var i = keys.length;
      while (i-- > 0) {
        var opt = keys[i];
        var validator = schema[opt];
        if (validator) {
          var value = options[opt];
          var result = value === undefined || validator(value, opt, options);
          if (result !== true) {
            throw new AxiosError_1$1('option ' + opt + ' must be ' + result, AxiosError_1$1.ERR_BAD_OPTION_VALUE);
          }
          continue;
        }
        if (allowUnknown !== true) {
          throw new AxiosError_1$1('Unknown option ' + opt, AxiosError_1$1.ERR_BAD_OPTION);
        }
      }
    }

    var validator$1 = {
      assertOptions: assertOptions$1,
      validators: validators$3
    };

    var validators$2 = validator$1.validators;
    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios$1(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1$1(),
        response: new InterceptorManager_1$1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios$1.prototype.request = function request(configOrUrl, config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof configOrUrl === 'string') {
        config = config || {};
        config.url = configOrUrl;
      } else {
        config = configOrUrl || {};
      }

      config = mergeConfig$1(this.defaults, config);

      // Set config.method
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = 'get';
      }

      var transitional = config.transitional;

      if (transitional !== undefined) {
        validator$1.assertOptions(transitional, {
          silentJSONParsing: validators$2.transitional(validators$2.boolean),
          forcedJSONParsing: validators$2.transitional(validators$2.boolean),
          clarifyTimeoutError: validators$2.transitional(validators$2.boolean)
        }, false);
      }

      // filter out skipped interceptors
      var requestInterceptorChain = [];
      var synchronousRequestInterceptors = true;
      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
          return;
        }

        synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

        requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      var responseInterceptorChain = [];
      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
      });

      var promise;

      if (!synchronousRequestInterceptors) {
        var chain = [dispatchRequest$1, undefined];

        Array.prototype.unshift.apply(chain, requestInterceptorChain);
        chain = chain.concat(responseInterceptorChain);

        promise = Promise.resolve(config);
        while (chain.length) {
          promise = promise.then(chain.shift(), chain.shift());
        }

        return promise;
      }


      var newConfig = config;
      while (requestInterceptorChain.length) {
        var onFulfilled = requestInterceptorChain.shift();
        var onRejected = requestInterceptorChain.shift();
        try {
          newConfig = onFulfilled(newConfig);
        } catch (error) {
          onRejected(error);
          break;
        }
      }

      try {
        promise = dispatchRequest$1(newConfig);
      } catch (error) {
        return Promise.reject(error);
      }

      while (responseInterceptorChain.length) {
        promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
      }

      return promise;
    };

    Axios$1.prototype.getUri = function getUri(config) {
      config = mergeConfig$1(this.defaults, config);
      var fullPath = buildFullPath$1(config.baseURL, config.url);
      return buildURL$1(fullPath, config.params, config.paramsSerializer);
    };

    // Provide aliases for supported request methods
    utils$1.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios$1.prototype[method] = function(url, config) {
        return this.request(mergeConfig$1(config || {}, {
          method: method,
          url: url,
          data: (config || {}).data
        }));
      };
    });

    utils$1.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/

      function generateHTTPMethod(isForm) {
        return function httpMethod(url, data, config) {
          return this.request(mergeConfig$1(config || {}, {
            method: method,
            headers: isForm ? {
              'Content-Type': 'multipart/form-data'
            } : {},
            url: url,
            data: data
          }));
        };
      }

      Axios$1.prototype[method] = generateHTTPMethod();

      Axios$1.prototype[method + 'Form'] = generateHTTPMethod(true);
    });

    var Axios_1$1 = Axios$1;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken$1(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;

      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;

      // eslint-disable-next-line func-names
      this.promise.then(function(cancel) {
        if (!token._listeners) return;

        var i;
        var l = token._listeners.length;

        for (i = 0; i < l; i++) {
          token._listeners[i](cancel);
        }
        token._listeners = null;
      });

      // eslint-disable-next-line func-names
      this.promise.then = function(onfulfilled) {
        var _resolve;
        // eslint-disable-next-line func-names
        var promise = new Promise(function(resolve) {
          token.subscribe(resolve);
          _resolve = resolve;
        }).then(onfulfilled);

        promise.cancel = function reject() {
          token.unsubscribe(_resolve);
        };

        return promise;
      };

      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new CanceledError_1$1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `CanceledError` if cancellation has been requested.
     */
    CancelToken$1.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Subscribe to the cancel signal
     */

    CancelToken$1.prototype.subscribe = function subscribe(listener) {
      if (this.reason) {
        listener(this.reason);
        return;
      }

      if (this._listeners) {
        this._listeners.push(listener);
      } else {
        this._listeners = [listener];
      }
    };

    /**
     * Unsubscribe from the cancel signal
     */

    CancelToken$1.prototype.unsubscribe = function unsubscribe(listener) {
      if (!this._listeners) {
        return;
      }
      var index = this._listeners.indexOf(listener);
      if (index !== -1) {
        this._listeners.splice(index, 1);
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken$1.source = function source() {
      var cancel;
      var token = new CancelToken$1(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1$1 = CancelToken$1;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread$1 = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    var isAxiosError$1 = function isAxiosError(payload) {
      return utils$1.isObject(payload) && (payload.isAxiosError === true);
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance$1(defaultConfig) {
      var context = new Axios_1$1(defaultConfig);
      var instance = bind$1(Axios_1$1.prototype.request, context);

      // Copy axios.prototype to instance
      utils$1.extend(instance, Axios_1$1.prototype, context);

      // Copy context to instance
      utils$1.extend(instance, context);

      // Factory for creating new instances
      instance.create = function create(instanceConfig) {
        return createInstance$1(mergeConfig$1(defaultConfig, instanceConfig));
      };

      return instance;
    }

    // Create the default instance to be exported
    var axios$3 = createInstance$1(defaults_1$1);

    // Expose Axios class to allow class inheritance
    axios$3.Axios = Axios_1$1;

    // Expose Cancel & CancelToken
    axios$3.CanceledError = CanceledError_1$1;
    axios$3.CancelToken = CancelToken_1$1;
    axios$3.isCancel = isCancel$1;
    axios$3.VERSION = data$1.version;
    axios$3.toFormData = toFormData_1$1;

    // Expose AxiosError class
    axios$3.AxiosError = AxiosError_1$1;

    // alias for CanceledError for backward compatibility
    axios$3.Cancel = axios$3.CanceledError;

    // Expose all/spread
    axios$3.all = function all(promises) {
      return Promise.all(promises);
    };
    axios$3.spread = spread$1;

    // Expose isAxiosError
    axios$3.isAxiosError = isAxiosError$1;

    var axios_1$1 = axios$3;

    // Allow use of default import syntax in TypeScript
    var _default$1 = axios$3;
    axios_1$1.default = _default$1;

    var axios$2 = axios_1$1;

    /* src\components\shared\Button.svelte generated by Svelte v3.49.0 */

    const file$x = "src\\components\\shared\\Button.svelte";

    function create_fragment$z(ctx) {
    	let button;
    	let button_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*type*/ ctx[0]) + " svelte-vdmmk6"));
    			toggle_class(button, "flat", /*flat*/ ctx[1]);
    			toggle_class(button, "inverse", /*inverse*/ ctx[2]);
    			add_location(button, file$x, 6, 0, 120);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*type*/ 1 && button_class_value !== (button_class_value = "" + (null_to_empty(/*type*/ ctx[0]) + " svelte-vdmmk6"))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*type, flat*/ 3) {
    				toggle_class(button, "flat", /*flat*/ ctx[1]);
    			}

    			if (dirty & /*type, inverse*/ 5) {
    				toggle_class(button, "inverse", /*inverse*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$z.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$z($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, ['default']);
    	let { type = 'primary' } = $$props;
    	let { flat = false } = $$props;
    	let { inverse = false } = $$props;
    	const writable_props = ['type', 'flat', 'inverse'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('type' in $$props) $$invalidate(0, type = $$props.type);
    		if ('flat' in $$props) $$invalidate(1, flat = $$props.flat);
    		if ('inverse' in $$props) $$invalidate(2, inverse = $$props.inverse);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ type, flat, inverse });

    	$$self.$inject_state = $$props => {
    		if ('type' in $$props) $$invalidate(0, type = $$props.type);
    		if ('flat' in $$props) $$invalidate(1, flat = $$props.flat);
    		if ('inverse' in $$props) $$invalidate(2, inverse = $$props.inverse);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [type, flat, inverse, $$scope, slots, click_handler];
    }

    class Button$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$z, create_fragment$z, safe_not_equal, { type: 0, flat: 1, inverse: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$z.name
    		});
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flat() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flat(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inverse() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inverse(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Customer.svelte generated by Svelte v3.49.0 */

    const { console: console_1$g } = globals;
    const file$w = "src\\components\\Customer.svelte";

    // (56:4) <Button>
    function create_default_slot$d(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Submit");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$d.name,
    		type: "slot",
    		source: "(56:4) <Button>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$y(ctx) {
    	let form;
    	let table;
    	let tr0;
    	let th0;
    	let t1;
    	let td0;
    	let input0;
    	let t2;
    	let tr1;
    	let th1;
    	let t4;
    	let td1;
    	let input1;
    	let t5;
    	let tr2;
    	let th2;
    	let t7;
    	let td2;
    	let input2;
    	let t8;
    	let tr3;
    	let th3;
    	let t10;
    	let td3;
    	let input3;
    	let t11;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button$1({
    			props: {
    				$$slots: { default: [create_default_slot$d] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			form = element("form");
    			table = element("table");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Name";
    			t1 = space();
    			td0 = element("td");
    			input0 = element("input");
    			t2 = space();
    			tr1 = element("tr");
    			th1 = element("th");
    			th1.textContent = "Address";
    			t4 = space();
    			td1 = element("td");
    			input1 = element("input");
    			t5 = space();
    			tr2 = element("tr");
    			th2 = element("th");
    			th2.textContent = "Name";
    			t7 = space();
    			td2 = element("td");
    			input2 = element("input");
    			t8 = space();
    			tr3 = element("tr");
    			th3 = element("th");
    			th3.textContent = "Email";
    			t10 = space();
    			td3 = element("td");
    			input3 = element("input");
    			t11 = space();
    			create_component(button.$$.fragment);
    			add_location(th0, file$w, 37, 12, 917);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "name");
    			attr_dev(input0, "placeholder", "Name");
    			attr_dev(input0, "class", "form-control");
    			add_location(input0, file$w, 38, 16, 948);
    			add_location(td0, file$w, 38, 12, 944);
    			add_location(tr0, file$w, 36, 8, 899);
    			add_location(th1, file$w, 41, 12, 1094);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "name", "address");
    			attr_dev(input1, "placeholder", "Address");
    			attr_dev(input1, "class", "form-control");
    			add_location(input1, file$w, 42, 16, 1128);
    			add_location(td1, file$w, 42, 12, 1124);
    			add_location(tr1, file$w, 40, 8, 1076);
    			add_location(th2, file$w, 45, 12, 1284);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "name", "phone");
    			attr_dev(input2, "placeholder", "Phone Number");
    			attr_dev(input2, "class", "form-control");
    			add_location(input2, file$w, 46, 16, 1315);
    			add_location(td2, file$w, 46, 12, 1311);
    			add_location(tr2, file$w, 44, 8, 1266);
    			add_location(th3, file$w, 49, 12, 1475);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "name", "email");
    			attr_dev(input3, "placeholder", "Email Address");
    			attr_dev(input3, "class", "form-control");
    			add_location(input3, file$w, 50, 16, 1507);
    			add_location(td3, file$w, 50, 12, 1503);
    			add_location(tr3, file$w, 48, 8, 1457);
    			attr_dev(table, "class", "table table=bordered");
    			add_location(table, file$w, 35, 4, 853);
    			add_location(form, file$w, 34, 0, 802);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, table);
    			append_dev(table, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, td0);
    			append_dev(td0, input0);
    			set_input_value(input0, /*postData*/ ctx[0].name);
    			append_dev(table, t2);
    			append_dev(table, tr1);
    			append_dev(tr1, th1);
    			append_dev(tr1, t4);
    			append_dev(tr1, td1);
    			append_dev(td1, input1);
    			set_input_value(input1, /*postData*/ ctx[0].address);
    			append_dev(table, t5);
    			append_dev(table, tr2);
    			append_dev(tr2, th2);
    			append_dev(tr2, t7);
    			append_dev(tr2, td2);
    			append_dev(td2, input2);
    			set_input_value(input2, /*postData*/ ctx[0].phone_no);
    			append_dev(table, t8);
    			append_dev(table, tr3);
    			append_dev(tr3, th3);
    			append_dev(tr3, t10);
    			append_dev(tr3, td3);
    			append_dev(td3, input3);
    			set_input_value(input3, /*postData*/ ctx[0].email);
    			append_dev(form, t11);
    			mount_component(button, form, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[2]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[3]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[4]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[5]),
    					listen_dev(form, "submit", prevent_default(/*formHandler*/ ctx[1]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*postData*/ 1 && input0.value !== /*postData*/ ctx[0].name) {
    				set_input_value(input0, /*postData*/ ctx[0].name);
    			}

    			if (dirty & /*postData*/ 1 && input1.value !== /*postData*/ ctx[0].address) {
    				set_input_value(input1, /*postData*/ ctx[0].address);
    			}

    			if (dirty & /*postData*/ 1 && input2.value !== /*postData*/ ctx[0].phone_no) {
    				set_input_value(input2, /*postData*/ ctx[0].phone_no);
    			}

    			if (dirty & /*postData*/ 1 && input3.value !== /*postData*/ ctx[0].email) {
    				set_input_value(input3, /*postData*/ ctx[0].email);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			destroy_component(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$y.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$y($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Customer', slots, []);
    	let dispatch = createEventDispatcher();

    	const postData = {
    		name: '',
    		address: '',
    		phone_no: '',
    		email: ''
    	};

    	let result;

    	const formHandler = async () => {
    		const res = await fetch('http://localhost:8000/guest/', {
    			method: 'POST',
    			headers: { "content-type": "application/json" },
    			body: JSON.stringify(postData)
    		});

    		const json = await res.json();
    		result = JSON.stringify(json);
    		let guest = JSON.parse(result);
    		console.log(guest);
    		dispatch('add', guest);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$g.warn(`<Customer> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		postData.name = this.value;
    		$$invalidate(0, postData);
    	}

    	function input1_input_handler() {
    		postData.address = this.value;
    		$$invalidate(0, postData);
    	}

    	function input2_input_handler() {
    		postData.phone_no = this.value;
    		$$invalidate(0, postData);
    	}

    	function input3_input_handler() {
    		postData.email = this.value;
    		$$invalidate(0, postData);
    	}

    	$$self.$capture_state = () => ({
    		axios: axios$2,
    		Button: Button$1,
    		createEventDispatcher,
    		dispatch,
    		postData,
    		result,
    		formHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ('dispatch' in $$props) dispatch = $$props.dispatch;
    		if ('result' in $$props) result = $$props.result;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		postData,
    		formHandler,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler
    	];
    }

    class Customer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$y, create_fragment$y, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Customer",
    			options,
    			id: create_fragment$y.name
    		});
    	}
    }

    /* src\components\shared\Modal.svelte generated by Svelte v3.49.0 */

    const file$v = "src\\components\\shared\\Modal.svelte";

    // (5:0) {#if showModal}
    function create_if_block$5(ctx) {
    	let div1;
    	let div0;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "modal svelte-c4yp3y");
    			add_location(div0, file$v, 8, 4, 110);
    			attr_dev(div1, "class", "backdrop svelte-c4yp3y");
    			add_location(div1, file$v, 7, 0, 82);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(5:0) {#if showModal}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$x(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*showModal*/ ctx[0] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showModal*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showModal*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$x.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$x($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modal', slots, ['default']);
    	let { showModal = false } = $$props;
    	const writable_props = ['showModal'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('showModal' in $$props) $$invalidate(0, showModal = $$props.showModal);
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ showModal });

    	$$self.$inject_state = $$props => {
    		if ('showModal' in $$props) $$invalidate(0, showModal = $$props.showModal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showModal, $$scope, slots];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$x, create_fragment$x, safe_not_equal, { showModal: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$x.name
    		});
    	}

    	get showModal() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showModal(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* ..\admin-dashboard\src\components\shared\Button.svelte generated by Svelte v3.49.0 */

    const file$u = "..\\admin-dashboard\\src\\components\\shared\\Button.svelte";

    function create_fragment$w(ctx) {
    	let button;
    	let button_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*type*/ ctx[0]) + " svelte-vdmmk6"));
    			toggle_class(button, "flat", /*flat*/ ctx[1]);
    			toggle_class(button, "inverse", /*inverse*/ ctx[2]);
    			add_location(button, file$u, 6, 0, 120);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*type*/ 1 && button_class_value !== (button_class_value = "" + (null_to_empty(/*type*/ ctx[0]) + " svelte-vdmmk6"))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*type, flat*/ 3) {
    				toggle_class(button, "flat", /*flat*/ ctx[1]);
    			}

    			if (dirty & /*type, inverse*/ 5) {
    				toggle_class(button, "inverse", /*inverse*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$w.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$w($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, ['default']);
    	let { type = 'primary' } = $$props;
    	let { flat = false } = $$props;
    	let { inverse = false } = $$props;
    	const writable_props = ['type', 'flat', 'inverse'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('type' in $$props) $$invalidate(0, type = $$props.type);
    		if ('flat' in $$props) $$invalidate(1, flat = $$props.flat);
    		if ('inverse' in $$props) $$invalidate(2, inverse = $$props.inverse);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ type, flat, inverse });

    	$$self.$inject_state = $$props => {
    		if ('type' in $$props) $$invalidate(0, type = $$props.type);
    		if ('flat' in $$props) $$invalidate(1, flat = $$props.flat);
    		if ('inverse' in $$props) $$invalidate(2, inverse = $$props.inverse);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [type, flat, inverse, $$scope, slots, click_handler];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$w, create_fragment$w, safe_not_equal, { type: 0, flat: 1, inverse: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$w.name
    		});
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flat() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flat(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inverse() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inverse(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ..\admin-dashboard\src\components\shared\Card.svelte generated by Svelte v3.49.0 */

    const file$t = "..\\admin-dashboard\\src\\components\\shared\\Card.svelte";

    function create_fragment$v(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "card svelte-1396plb");
    			add_location(div, file$t, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$v.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$v($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Card', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$v, create_fragment$v, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$v.name
    		});
    	}
    }

    /* ..\admin-dashboard\src\components\RoomTypeForm.svelte generated by Svelte v3.49.0 */

    const { console: console_1$f } = globals;
    const file$s = "..\\admin-dashboard\\src\\components\\RoomTypeForm.svelte";

    // (72:8) <Button>
    function create_default_slot$c(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Add");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$c.name,
    		type: "slot",
    		source: "(72:8) <Button>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$u(ctx) {
    	let div;
    	let form;
    	let table;
    	let tr0;
    	let th0;
    	let t1;
    	let td0;
    	let input0;
    	let t2;
    	let tr1;
    	let th1;
    	let t4;
    	let td1;
    	let textarea;
    	let t5;
    	let tr2;
    	let th2;
    	let t7;
    	let td2;
    	let input1;
    	let t8;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot$c] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			form = element("form");
    			table = element("table");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Title";
    			t1 = space();
    			td0 = element("td");
    			input0 = element("input");
    			t2 = space();
    			tr1 = element("tr");
    			th1 = element("th");
    			th1.textContent = "Description";
    			t4 = space();
    			td1 = element("td");
    			textarea = element("textarea");
    			t5 = space();
    			tr2 = element("tr");
    			th2 = element("th");
    			th2.textContent = "Cost";
    			t7 = space();
    			td2 = element("td");
    			input1 = element("input");
    			t8 = space();
    			create_component(button.$$.fragment);
    			add_location(th0, file$s, 58, 16, 1310);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "title");
    			attr_dev(input0, "placeholder", "Title");
    			attr_dev(input0, "class", "form-control svelte-1myn5kf");
    			add_location(input0, file$s, 59, 20, 1346);
    			add_location(td0, file$s, 59, 16, 1342);
    			add_location(tr0, file$s, 57, 12, 1288);
    			add_location(th1, file$s, 62, 16, 1511);
    			attr_dev(textarea, "cols", "50");
    			attr_dev(textarea, "rows", "5");
    			attr_dev(textarea, "name", "description");
    			attr_dev(textarea, "class", "form-control svelte-1myn5kf");
    			attr_dev(textarea, "placeholder", "Description");
    			add_location(textarea, file$s, 63, 20, 1553);
    			add_location(td1, file$s, 63, 16, 1549);
    			add_location(tr1, file$s, 61, 12, 1489);
    			add_location(th2, file$s, 66, 16, 1753);
    			attr_dev(input1, "name", "cost");
    			attr_dev(input1, "class", "form-control svelte-1myn5kf");
    			attr_dev(input1, "placeholder", "Cost");
    			add_location(input1, file$s, 67, 20, 1788);
    			add_location(td2, file$s, 67, 16, 1784);
    			add_location(tr2, file$s, 65, 12, 1731);
    			attr_dev(table, "class", "table table=bordered");
    			add_location(table, file$s, 56, 8, 1238);
    			add_location(form, file$s, 55, 4, 1183);
    			attr_dev(div, "class", "table-responsive");
    			add_location(div, file$s, 54, 0, 1147);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, form);
    			append_dev(form, table);
    			append_dev(table, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, td0);
    			append_dev(td0, input0);
    			set_input_value(input0, /*postData*/ ctx[0].room_type);
    			append_dev(table, t2);
    			append_dev(table, tr1);
    			append_dev(tr1, th1);
    			append_dev(tr1, t4);
    			append_dev(tr1, td1);
    			append_dev(td1, textarea);
    			set_input_value(textarea, /*postData*/ ctx[0].description);
    			append_dev(table, t5);
    			append_dev(table, tr2);
    			append_dev(tr2, th2);
    			append_dev(tr2, t7);
    			append_dev(tr2, td2);
    			append_dev(td2, input1);
    			set_input_value(input1, /*postData*/ ctx[0].cost);
    			append_dev(form, t8);
    			mount_component(button, form, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[2]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[3]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[4]),
    					listen_dev(form, "submit", prevent_default(/*formHandler*/ ctx[1]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*postData*/ 1 && input0.value !== /*postData*/ ctx[0].room_type) {
    				set_input_value(input0, /*postData*/ ctx[0].room_type);
    			}

    			if (dirty & /*postData*/ 1) {
    				set_input_value(textarea, /*postData*/ ctx[0].description);
    			}

    			if (dirty & /*postData*/ 1 && input1.value !== /*postData*/ ctx[0].cost) {
    				set_input_value(input1, /*postData*/ ctx[0].cost);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$u.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$u($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RoomTypeForm', slots, []);
    	let postData = { room_type: '', description: '', cost: '' };
    	let valid = false;
    	let errors = { room_type: '', cost: '' };
    	let result = null;

    	const formHandler = async () => {
    		if (postData.room_type.trim().length < 1) {
    			valid = false;
    			errors.room_type = 'Room Type Cannot Be Empty';
    		} else {
    			errors.room_type = '';
    		}

    		if (postData.cost.trim().length < 1) {
    			valid = false;
    			errors.cost = 'Cost Cannot Be Empty';
    		} else if (typeof postData === 'number' && !Number.isNaN(postData)) {
    			valid = false;
    			errors.cost = 'Cost must be a Number';
    		} else {
    			errors.cost = '';
    		}

    		const res = await fetch('http://localhost:8000/room-type/', {
    			method: 'POST',
    			headers: { "content-type": "application/json" },
    			body: JSON.stringify(postData)
    		});

    		const json = await res.json();
    		result = JSON.stringify(json);
    		console.log(postData);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$f.warn(`<RoomTypeForm> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		postData.room_type = this.value;
    		$$invalidate(0, postData);
    	}

    	function textarea_input_handler() {
    		postData.description = this.value;
    		$$invalidate(0, postData);
    	}

    	function input1_input_handler() {
    		postData.cost = this.value;
    		$$invalidate(0, postData);
    	}

    	$$self.$capture_state = () => ({
    		Button,
    		Card,
    		postData,
    		valid,
    		errors,
    		result,
    		formHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ('postData' in $$props) $$invalidate(0, postData = $$props.postData);
    		if ('valid' in $$props) valid = $$props.valid;
    		if ('errors' in $$props) errors = $$props.errors;
    		if ('result' in $$props) result = $$props.result;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		postData,
    		formHandler,
    		input0_input_handler,
    		textarea_input_handler,
    		input1_input_handler
    	];
    }

    class RoomTypeForm$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$u, create_fragment$u, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RoomTypeForm",
    			options,
    			id: create_fragment$u.name
    		});
    	}
    }

    var bind = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    // eslint-disable-next-line func-names
    var kindOf = (function(cache) {
      // eslint-disable-next-line func-names
      return function(thing) {
        var str = toString.call(thing);
        return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
      };
    })(Object.create(null));

    function kindOfTest(type) {
      type = type.toLowerCase();
      return function isKindOf(thing) {
        return kindOf(thing) === type;
      };
    }

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return Array.isArray(val);
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is a Buffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    var isArrayBuffer = kindOfTest('ArrayBuffer');


    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a plain Object
     *
     * @param {Object} val The value to test
     * @return {boolean} True if value is a plain Object, otherwise false
     */
    function isPlainObject(val) {
      if (kindOf(val) !== 'object') {
        return false;
      }

      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }

    /**
     * Determine if a value is a Date
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    var isDate = kindOfTest('Date');

    /**
     * Determine if a value is a File
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    var isFile = kindOfTest('File');

    /**
     * Determine if a value is a Blob
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    var isBlob = kindOfTest('Blob');

    /**
     * Determine if a value is a FileList
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    var isFileList = kindOfTest('FileList');

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction(val) {
      return toString.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} thing The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(thing) {
      var pattern = '[object FormData]';
      return thing && (
        (typeof FormData === 'function' && thing instanceof FormData) ||
        toString.call(thing) === pattern ||
        (isFunction(thing.toString) && thing.toString() === pattern)
      );
    }

    /**
     * Determine if a value is a URLSearchParams object
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    var isURLSearchParams = kindOfTest('URLSearchParams');

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
          result[key] = merge(result[key], val);
        } else if (isPlainObject(val)) {
          result[key] = merge({}, val);
        } else if (isArray(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     * @return {string} content value without BOM
     */
    function stripBOM(content) {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    }

    /**
     * Inherit the prototype methods from one constructor into another
     * @param {function} constructor
     * @param {function} superConstructor
     * @param {object} [props]
     * @param {object} [descriptors]
     */

    function inherits(constructor, superConstructor, props, descriptors) {
      constructor.prototype = Object.create(superConstructor.prototype, descriptors);
      constructor.prototype.constructor = constructor;
      props && Object.assign(constructor.prototype, props);
    }

    /**
     * Resolve object with deep prototype chain to a flat object
     * @param {Object} sourceObj source object
     * @param {Object} [destObj]
     * @param {Function} [filter]
     * @returns {Object}
     */

    function toFlatObject(sourceObj, destObj, filter) {
      var props;
      var i;
      var prop;
      var merged = {};

      destObj = destObj || {};

      do {
        props = Object.getOwnPropertyNames(sourceObj);
        i = props.length;
        while (i-- > 0) {
          prop = props[i];
          if (!merged[prop]) {
            destObj[prop] = sourceObj[prop];
            merged[prop] = true;
          }
        }
        sourceObj = Object.getPrototypeOf(sourceObj);
      } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

      return destObj;
    }

    /*
     * determines whether a string ends with the characters of a specified string
     * @param {String} str
     * @param {String} searchString
     * @param {Number} [position= 0]
     * @returns {boolean}
     */
    function endsWith(str, searchString, position) {
      str = String(str);
      if (position === undefined || position > str.length) {
        position = str.length;
      }
      position -= searchString.length;
      var lastIndex = str.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    }


    /**
     * Returns new array from array like object
     * @param {*} [thing]
     * @returns {Array}
     */
    function toArray(thing) {
      if (!thing) return null;
      var i = thing.length;
      if (isUndefined(i)) return null;
      var arr = new Array(i);
      while (i-- > 0) {
        arr[i] = thing[i];
      }
      return arr;
    }

    // eslint-disable-next-line func-names
    var isTypedArray = (function(TypedArray) {
      // eslint-disable-next-line func-names
      return function(thing) {
        return TypedArray && thing instanceof TypedArray;
      };
    })(typeof Uint8Array !== 'undefined' && Object.getPrototypeOf(Uint8Array));

    var utils = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isPlainObject: isPlainObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      extend: extend,
      trim: trim,
      stripBOM: stripBOM,
      inherits: inherits,
      toFlatObject: toFlatObject,
      kindOf: kindOf,
      kindOfTest: kindOfTest,
      endsWith: endsWith,
      toArray: toArray,
      isTypedArray: isTypedArray,
      isFileList: isFileList
    };

    function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + '=' + encode(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected,
        synchronous: options ? options.synchronous : false,
        runWhen: options ? options.runWhen : null
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [config] The config.
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    function AxiosError(message, code, config, request, response) {
      Error.call(this);
      this.message = message;
      this.name = 'AxiosError';
      code && (this.code = code);
      config && (this.config = config);
      request && (this.request = request);
      response && (this.response = response);
    }

    utils.inherits(AxiosError, Error, {
      toJSON: function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code,
          status: this.response && this.response.status ? this.response.status : null
        };
      }
    });

    var prototype = AxiosError.prototype;
    var descriptors = {};

    [
      'ERR_BAD_OPTION_VALUE',
      'ERR_BAD_OPTION',
      'ECONNABORTED',
      'ETIMEDOUT',
      'ERR_NETWORK',
      'ERR_FR_TOO_MANY_REDIRECTS',
      'ERR_DEPRECATED',
      'ERR_BAD_RESPONSE',
      'ERR_BAD_REQUEST',
      'ERR_CANCELED'
    // eslint-disable-next-line func-names
    ].forEach(function(code) {
      descriptors[code] = {value: code};
    });

    Object.defineProperties(AxiosError, descriptors);
    Object.defineProperty(prototype, 'isAxiosError', {value: true});

    // eslint-disable-next-line func-names
    AxiosError.from = function(error, code, config, request, response, customProps) {
      var axiosError = Object.create(prototype);

      utils.toFlatObject(error, axiosError, function filter(obj) {
        return obj !== Error.prototype;
      });

      AxiosError.call(axiosError, error.message, code, config, request, response);

      axiosError.name = error.name;

      customProps && Object.assign(axiosError, customProps);

      return axiosError;
    };

    var AxiosError_1 = AxiosError;

    var transitional = {
      silentJSONParsing: true,
      forcedJSONParsing: true,
      clarifyTimeoutError: false
    };

    /**
     * Convert a data object to FormData
     * @param {Object} obj
     * @param {?Object} [formData]
     * @returns {Object}
     **/

    function toFormData(obj, formData) {
      // eslint-disable-next-line no-param-reassign
      formData = formData || new FormData();

      var stack = [];

      function convertValue(value) {
        if (value === null) return '';

        if (utils.isDate(value)) {
          return value.toISOString();
        }

        if (utils.isArrayBuffer(value) || utils.isTypedArray(value)) {
          return typeof Blob === 'function' ? new Blob([value]) : Buffer.from(value);
        }

        return value;
      }

      function build(data, parentKey) {
        if (utils.isPlainObject(data) || utils.isArray(data)) {
          if (stack.indexOf(data) !== -1) {
            throw Error('Circular reference detected in ' + parentKey);
          }

          stack.push(data);

          utils.forEach(data, function each(value, key) {
            if (utils.isUndefined(value)) return;
            var fullKey = parentKey ? parentKey + '.' + key : key;
            var arr;

            if (value && !parentKey && typeof value === 'object') {
              if (utils.endsWith(key, '{}')) {
                // eslint-disable-next-line no-param-reassign
                value = JSON.stringify(value);
              } else if (utils.endsWith(key, '[]') && (arr = utils.toArray(value))) {
                // eslint-disable-next-line func-names
                arr.forEach(function(el) {
                  !utils.isUndefined(el) && formData.append(fullKey, convertValue(el));
                });
                return;
              }
            }

            build(value, fullKey);
          });

          stack.pop();
        } else {
          formData.append(parentKey, convertValue(data));
        }
      }

      build(obj);

      return formData;
    }

    var toFormData_1 = toFormData;

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(new AxiosError_1(
          'Request failed with status code ' + response.status,
          [AxiosError_1.ERR_BAD_REQUEST, AxiosError_1.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
          response.config,
          response.request,
          response
        ));
      }
    };

    var cookies = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     * @returns {string} The combined full path
     */
    var buildFullPath = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    /**
     * A `CanceledError` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function CanceledError(message) {
      // eslint-disable-next-line no-eq-null,eqeqeq
      AxiosError_1.call(this, message == null ? 'canceled' : message, AxiosError_1.ERR_CANCELED);
      this.name = 'CanceledError';
    }

    utils.inherits(CanceledError, AxiosError_1, {
      __CANCEL__: true
    });

    var CanceledError_1 = CanceledError;

    var parseProtocol = function parseProtocol(url) {
      var match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
      return match && match[1] || '';
    };

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;
        var responseType = config.responseType;
        var onCanceled;
        function done() {
          if (config.cancelToken) {
            config.cancelToken.unsubscribe(onCanceled);
          }

          if (config.signal) {
            config.signal.removeEventListener('abort', onCanceled);
          }
        }

        if (utils.isFormData(requestData) && utils.isStandardBrowserEnv()) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        var fullPath = buildFullPath(config.baseURL, config.url);

        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        function onloadend() {
          if (!request) {
            return;
          }
          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
            request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(function _resolve(value) {
            resolve(value);
            done();
          }, function _reject(err) {
            reject(err);
            done();
          }, response);

          // Clean up request
          request = null;
        }

        if ('onloadend' in request) {
          // Use onloadend if available
          request.onloadend = onloadend;
        } else {
          // Listen for ready state to emulate onloadend
          request.onreadystatechange = function handleLoad() {
            if (!request || request.readyState !== 4) {
              return;
            }

            // The request errored out and we didn't get a response, this will be
            // handled by onerror instead
            // With one exception: request that using file: protocol, most browsers
            // will return status as 0 even though it's a successful request
            if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
              return;
            }
            // readystate handler is calling before onerror or ontimeout handlers,
            // so we should call onloadend on the next 'tick'
            setTimeout(onloadend);
          };
        }

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(new AxiosError_1('Request aborted', AxiosError_1.ECONNABORTED, config, request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(new AxiosError_1('Network Error', AxiosError_1.ERR_NETWORK, config, request, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
          var transitional$1 = config.transitional || transitional;
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(new AxiosError_1(
            timeoutErrorMessage,
            transitional$1.clarifyTimeoutError ? AxiosError_1.ETIMEDOUT : AxiosError_1.ECONNABORTED,
            config,
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
            cookies.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (responseType && responseType !== 'json') {
          request.responseType = config.responseType;
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken || config.signal) {
          // Handle cancellation
          // eslint-disable-next-line func-names
          onCanceled = function(cancel) {
            if (!request) {
              return;
            }
            reject(!cancel || (cancel && cancel.type) ? new CanceledError_1() : cancel);
            request.abort();
            request = null;
          };

          config.cancelToken && config.cancelToken.subscribe(onCanceled);
          if (config.signal) {
            config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
          }
        }

        if (!requestData) {
          requestData = null;
        }

        var protocol = parseProtocol(fullPath);

        if (protocol && [ 'http', 'https', 'file' ].indexOf(protocol) === -1) {
          reject(new AxiosError_1('Unsupported protocol ' + protocol + ':', AxiosError_1.ERR_BAD_REQUEST, config));
          return;
        }


        // Send the request
        request.send(requestData);
      });
    };

    // eslint-disable-next-line strict
    var _null = null;

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr;
      }
      return adapter;
    }

    function stringifySafely(rawValue, parser, encoder) {
      if (utils.isString(rawValue)) {
        try {
          (parser || JSON.parse)(rawValue);
          return utils.trim(rawValue);
        } catch (e) {
          if (e.name !== 'SyntaxError') {
            throw e;
          }
        }
      }

      return (encoder || JSON.stringify)(rawValue);
    }

    var defaults = {

      transitional: transitional,

      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');

        if (utils.isFormData(data) ||
          utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }

        var isObjectPayload = utils.isObject(data);
        var contentType = headers && headers['Content-Type'];

        var isFileList;

        if ((isFileList = utils.isFileList(data)) || (isObjectPayload && contentType === 'multipart/form-data')) {
          var _FormData = this.env && this.env.FormData;
          return toFormData_1(isFileList ? {'files[]': data} : data, _FormData && new _FormData());
        } else if (isObjectPayload || contentType === 'application/json') {
          setContentTypeIfUnset(headers, 'application/json');
          return stringifySafely(data);
        }

        return data;
      }],

      transformResponse: [function transformResponse(data) {
        var transitional = this.transitional || defaults.transitional;
        var silentJSONParsing = transitional && transitional.silentJSONParsing;
        var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
        var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

        if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
          try {
            return JSON.parse(data);
          } catch (e) {
            if (strictJSONParsing) {
              if (e.name === 'SyntaxError') {
                throw AxiosError_1.from(e, AxiosError_1.ERR_BAD_RESPONSE, this, null, this.response);
              }
              throw e;
            }
          }
        }

        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      env: {
        FormData: _null
      },

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      },

      headers: {
        common: {
          'Accept': 'application/json, text/plain, */*'
        }
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      var context = this || defaults_1;
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn.call(context, data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    /**
     * Throws a `CanceledError` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }

      if (config.signal && config.signal.aborted) {
        throw new CanceledError_1();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData.call(
        config,
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults_1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData.call(
          config,
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData.call(
              config,
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      function getMergedValue(target, source) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge(target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      // eslint-disable-next-line consistent-return
      function mergeDeepProperties(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(config1[prop], config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function valueFromConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(undefined, config2[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function defaultToConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(undefined, config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function mergeDirectKeys(prop) {
        if (prop in config2) {
          return getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      var mergeMap = {
        'url': valueFromConfig2,
        'method': valueFromConfig2,
        'data': valueFromConfig2,
        'baseURL': defaultToConfig2,
        'transformRequest': defaultToConfig2,
        'transformResponse': defaultToConfig2,
        'paramsSerializer': defaultToConfig2,
        'timeout': defaultToConfig2,
        'timeoutMessage': defaultToConfig2,
        'withCredentials': defaultToConfig2,
        'adapter': defaultToConfig2,
        'responseType': defaultToConfig2,
        'xsrfCookieName': defaultToConfig2,
        'xsrfHeaderName': defaultToConfig2,
        'onUploadProgress': defaultToConfig2,
        'onDownloadProgress': defaultToConfig2,
        'decompress': defaultToConfig2,
        'maxContentLength': defaultToConfig2,
        'maxBodyLength': defaultToConfig2,
        'beforeRedirect': defaultToConfig2,
        'transport': defaultToConfig2,
        'httpAgent': defaultToConfig2,
        'httpsAgent': defaultToConfig2,
        'cancelToken': defaultToConfig2,
        'socketPath': defaultToConfig2,
        'responseEncoding': defaultToConfig2,
        'validateStatus': mergeDirectKeys
      };

      utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
        var merge = mergeMap[prop] || mergeDeepProperties;
        var configValue = merge(prop);
        (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
      });

      return config;
    };

    var data = {
      "version": "0.27.2"
    };

    var VERSION = data.version;


    var validators$1 = {};

    // eslint-disable-next-line func-names
    ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
      validators$1[type] = function validator(thing) {
        return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
      };
    });

    var deprecatedWarnings = {};

    /**
     * Transitional option validator
     * @param {function|boolean?} validator - set to false if the transitional option has been removed
     * @param {string?} version - deprecated version / removed since version
     * @param {string?} message - some message with additional info
     * @returns {function}
     */
    validators$1.transitional = function transitional(validator, version, message) {
      function formatMessage(opt, desc) {
        return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
      }

      // eslint-disable-next-line func-names
      return function(value, opt, opts) {
        if (validator === false) {
          throw new AxiosError_1(
            formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
            AxiosError_1.ERR_DEPRECATED
          );
        }

        if (version && !deprecatedWarnings[opt]) {
          deprecatedWarnings[opt] = true;
          // eslint-disable-next-line no-console
          console.warn(
            formatMessage(
              opt,
              ' has been deprecated since v' + version + ' and will be removed in the near future'
            )
          );
        }

        return validator ? validator(value, opt, opts) : true;
      };
    };

    /**
     * Assert object's properties type
     * @param {object} options
     * @param {object} schema
     * @param {boolean?} allowUnknown
     */

    function assertOptions(options, schema, allowUnknown) {
      if (typeof options !== 'object') {
        throw new AxiosError_1('options must be an object', AxiosError_1.ERR_BAD_OPTION_VALUE);
      }
      var keys = Object.keys(options);
      var i = keys.length;
      while (i-- > 0) {
        var opt = keys[i];
        var validator = schema[opt];
        if (validator) {
          var value = options[opt];
          var result = value === undefined || validator(value, opt, options);
          if (result !== true) {
            throw new AxiosError_1('option ' + opt + ' must be ' + result, AxiosError_1.ERR_BAD_OPTION_VALUE);
          }
          continue;
        }
        if (allowUnknown !== true) {
          throw new AxiosError_1('Unknown option ' + opt, AxiosError_1.ERR_BAD_OPTION);
        }
      }
    }

    var validator = {
      assertOptions: assertOptions,
      validators: validators$1
    };

    var validators = validator.validators;
    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(configOrUrl, config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof configOrUrl === 'string') {
        config = config || {};
        config.url = configOrUrl;
      } else {
        config = configOrUrl || {};
      }

      config = mergeConfig(this.defaults, config);

      // Set config.method
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = 'get';
      }

      var transitional = config.transitional;

      if (transitional !== undefined) {
        validator.assertOptions(transitional, {
          silentJSONParsing: validators.transitional(validators.boolean),
          forcedJSONParsing: validators.transitional(validators.boolean),
          clarifyTimeoutError: validators.transitional(validators.boolean)
        }, false);
      }

      // filter out skipped interceptors
      var requestInterceptorChain = [];
      var synchronousRequestInterceptors = true;
      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
          return;
        }

        synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

        requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      var responseInterceptorChain = [];
      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
      });

      var promise;

      if (!synchronousRequestInterceptors) {
        var chain = [dispatchRequest, undefined];

        Array.prototype.unshift.apply(chain, requestInterceptorChain);
        chain = chain.concat(responseInterceptorChain);

        promise = Promise.resolve(config);
        while (chain.length) {
          promise = promise.then(chain.shift(), chain.shift());
        }

        return promise;
      }


      var newConfig = config;
      while (requestInterceptorChain.length) {
        var onFulfilled = requestInterceptorChain.shift();
        var onRejected = requestInterceptorChain.shift();
        try {
          newConfig = onFulfilled(newConfig);
        } catch (error) {
          onRejected(error);
          break;
        }
      }

      try {
        promise = dispatchRequest(newConfig);
      } catch (error) {
        return Promise.reject(error);
      }

      while (responseInterceptorChain.length) {
        promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      var fullPath = buildFullPath(config.baseURL, config.url);
      return buildURL(fullPath, config.params, config.paramsSerializer);
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: (config || {}).data
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/

      function generateHTTPMethod(isForm) {
        return function httpMethod(url, data, config) {
          return this.request(mergeConfig(config || {}, {
            method: method,
            headers: isForm ? {
              'Content-Type': 'multipart/form-data'
            } : {},
            url: url,
            data: data
          }));
        };
      }

      Axios.prototype[method] = generateHTTPMethod();

      Axios.prototype[method + 'Form'] = generateHTTPMethod(true);
    });

    var Axios_1 = Axios;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;

      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;

      // eslint-disable-next-line func-names
      this.promise.then(function(cancel) {
        if (!token._listeners) return;

        var i;
        var l = token._listeners.length;

        for (i = 0; i < l; i++) {
          token._listeners[i](cancel);
        }
        token._listeners = null;
      });

      // eslint-disable-next-line func-names
      this.promise.then = function(onfulfilled) {
        var _resolve;
        // eslint-disable-next-line func-names
        var promise = new Promise(function(resolve) {
          token.subscribe(resolve);
          _resolve = resolve;
        }).then(onfulfilled);

        promise.cancel = function reject() {
          token.unsubscribe(_resolve);
        };

        return promise;
      };

      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new CanceledError_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `CanceledError` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Subscribe to the cancel signal
     */

    CancelToken.prototype.subscribe = function subscribe(listener) {
      if (this.reason) {
        listener(this.reason);
        return;
      }

      if (this._listeners) {
        this._listeners.push(listener);
      } else {
        this._listeners = [listener];
      }
    };

    /**
     * Unsubscribe from the cancel signal
     */

    CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
      if (!this._listeners) {
        return;
      }
      var index = this._listeners.indexOf(listener);
      if (index !== -1) {
        this._listeners.splice(index, 1);
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    var isAxiosError = function isAxiosError(payload) {
      return utils.isObject(payload) && (payload.isAxiosError === true);
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      // Factory for creating new instances
      instance.create = function create(instanceConfig) {
        return createInstance(mergeConfig(defaultConfig, instanceConfig));
      };

      return instance;
    }

    // Create the default instance to be exported
    var axios$1 = createInstance(defaults_1);

    // Expose Axios class to allow class inheritance
    axios$1.Axios = Axios_1;

    // Expose Cancel & CancelToken
    axios$1.CanceledError = CanceledError_1;
    axios$1.CancelToken = CancelToken_1;
    axios$1.isCancel = isCancel;
    axios$1.VERSION = data.version;
    axios$1.toFormData = toFormData_1;

    // Expose AxiosError class
    axios$1.AxiosError = AxiosError_1;

    // alias for CanceledError for backward compatibility
    axios$1.Cancel = axios$1.CanceledError;

    // Expose all/spread
    axios$1.all = function all(promises) {
      return Promise.all(promises);
    };
    axios$1.spread = spread;

    // Expose isAxiosError
    axios$1.isAxiosError = isAxiosError;

    var axios_1 = axios$1;

    // Allow use of default import syntax in TypeScript
    var _default = axios$1;
    axios_1.default = _default;

    var axios = axios_1;

    /* ..\admin-dashboard\src\components\RoomTypeList.svelte generated by Svelte v3.49.0 */

    const { console: console_1$e } = globals;
    const file$r = "..\\admin-dashboard\\src\\components\\RoomTypeList.svelte";

    function get_each_context$d(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (51:8) {#each roomtypes as roomtype (roomtype.id)}
    function create_each_block$d(key_1, ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*roomtype*/ ctx[3].id + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*roomtype*/ ctx[3].room_type + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*roomtype*/ ctx[3].description + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*roomtype*/ ctx[3].cost + "";
    	let t6;
    	let t7;
    	let td4;
    	let div;
    	let button0;
    	let t9;
    	let button1;
    	let t11;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[2](/*roomtype*/ ctx[3]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			td4 = element("td");
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "Edit";
    			t9 = space();
    			button1 = element("button");
    			button1.textContent = "Delete";
    			t11 = space();
    			attr_dev(td0, "class", "svelte-16h66w7");
    			add_location(td0, file$r, 52, 16, 1373);
    			attr_dev(td1, "class", "svelte-16h66w7");
    			add_location(td1, file$r, 53, 16, 1413);
    			attr_dev(td2, "class", "svelte-16h66w7");
    			add_location(td2, file$r, 54, 16, 1460);
    			attr_dev(td3, "class", "svelte-16h66w7");
    			add_location(td3, file$r, 55, 16, 1509);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "btn btn-primary svelte-16h66w7");
    			add_location(button0, file$r, 58, 24, 1666);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn btn-primary-red svelte-16h66w7");
    			add_location(button1, file$r, 59, 24, 1752);
    			attr_dev(div, "class", "btn-group");
    			attr_dev(div, "role", "group");
    			attr_dev(div, "aria-label", "Basic example");
    			add_location(div, file$r, 57, 20, 1577);
    			attr_dev(td4, "class", "svelte-16h66w7");
    			add_location(td4, file$r, 56, 16, 1551);
    			add_location(tr, file$r, 51, 12, 1351);
    			this.first = tr;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, t6);
    			append_dev(tr, t7);
    			append_dev(tr, td4);
    			append_dev(td4, div);
    			append_dev(div, button0);
    			append_dev(div, t9);
    			append_dev(div, button1);
    			append_dev(tr, t11);

    			if (!mounted) {
    				dispose = listen_dev(button1, "click", prevent_default(click_handler), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*roomtypes*/ 1 && t0_value !== (t0_value = /*roomtype*/ ctx[3].id + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*roomtypes*/ 1 && t2_value !== (t2_value = /*roomtype*/ ctx[3].room_type + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*roomtypes*/ 1 && t4_value !== (t4_value = /*roomtype*/ ctx[3].description + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*roomtypes*/ 1 && t6_value !== (t6_value = /*roomtype*/ ctx[3].cost + "")) set_data_dev(t6, t6_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$d.name,
    		type: "each",
    		source: "(51:8) {#each roomtypes as roomtype (roomtype.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$t(ctx) {
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let tbody;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*roomtypes*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*roomtype*/ ctx[3].id;
    	validate_each_keys(ctx, each_value, get_each_context$d, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$d(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$d(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "id";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Room Type";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Description";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Cost";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Actions";
    			t9 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(th0, "class", "svelte-16h66w7");
    			add_location(th0, file$r, 42, 12, 1108);
    			attr_dev(th1, "class", "svelte-16h66w7");
    			add_location(th1, file$r, 43, 12, 1133);
    			attr_dev(th2, "class", "svelte-16h66w7");
    			add_location(th2, file$r, 44, 12, 1165);
    			attr_dev(th3, "class", "svelte-16h66w7");
    			add_location(th3, file$r, 45, 12, 1199);
    			attr_dev(th4, "class", "svelte-16h66w7");
    			add_location(th4, file$r, 46, 12, 1226);
    			add_location(tr, file$r, 41, 8, 1090);
    			add_location(thead, file$r, 40, 4, 1073);
    			add_location(tbody, file$r, 49, 4, 1277);
    			attr_dev(table, "class", "svelte-16h66w7");
    			add_location(table, file$r, 39, 0, 1060);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(tr, t5);
    			append_dev(tr, th3);
    			append_dev(tr, t7);
    			append_dev(tr, th4);
    			append_dev(table, t9);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*deleteRoom, roomtypes*/ 3) {
    				each_value = /*roomtypes*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$d, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, tbody, destroy_block, create_each_block$d, null, get_each_context$d);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$t.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$t($$self, $$props, $$invalidate) {
    	let roomtypes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RoomTypeList', slots, []);

    	onMount(async () => {
    		const res = await fetch('http://localhost:8000/room-type/');
    		$$invalidate(0, roomtypes = await res.json());
    		console.log(roomtypes);
    	});

    	const deleteRoom = async id => {
    		await fetch(`http://localhost:8000/room-type/${id}/`, {
    			method: 'DELETE',
    			headers: { "Content-type": "application/json" }
    		});

    		$$invalidate(0, roomtypes = roomtypes.filter(room => room.id !== id));
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$e.warn(`<RoomTypeList> was created with unknown prop '${key}'`);
    	});

    	const click_handler = roomtype => deleteRoom(roomtype.id);
    	$$self.$capture_state = () => ({ onMount, axios: axios.axios, deleteRoom, roomtypes });

    	$$self.$inject_state = $$props => {
    		if ('roomtypes' in $$props) $$invalidate(0, roomtypes = $$props.roomtypes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(0, roomtypes = []);
    	return [roomtypes, deleteRoom, click_handler];
    }

    class RoomTypeList$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$t, create_fragment$t, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RoomTypeList",
    			options,
    			id: create_fragment$t.name
    		});
    	}
    }

    /* ..\admin-dashboard\src\components\RoomType.svelte generated by Svelte v3.49.0 */
    const file$q = "..\\admin-dashboard\\src\\components\\RoomType.svelte";

    function create_fragment$s(ctx) {
    	let main;
    	let div;
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let br0;
    	let t4;
    	let br1;
    	let t5;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*activeTab*/ ctx[0];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "Add Type";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "View";
    			t3 = space();
    			br0 = element("br");
    			t4 = space();
    			br1 = element("br");
    			t5 = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			add_location(button0, file$q, 14, 8, 394);
    			add_location(button1, file$q, 15, 8, 473);
    			attr_dev(div, "class", "butttons svelte-uaz3l8");
    			add_location(div, file$q, 13, 4, 362);
    			add_location(br0, file$q, 17, 4, 556);
    			add_location(br1, file$q, 18, 4, 566);
    			add_location(main, file$q, 12, 0, 350);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, button0);
    			append_dev(div, t1);
    			append_dev(div, button1);
    			append_dev(main, t3);
    			append_dev(main, br0);
    			append_dev(main, t4);
    			append_dev(main, br1);
    			append_dev(main, t5);

    			if (switch_instance) {
    				mount_component(switch_instance, main, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[1], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (switch_value !== (switch_value = /*activeTab*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, main, null);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (switch_instance) destroy_component(switch_instance);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RoomType', slots, []);
    	let activeTab = RoomTypeList$1;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<RoomType> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, activeTab = RoomTypeForm$1);
    	const click_handler_1 = () => $$invalidate(0, activeTab = RoomTypeList$1);

    	$$self.$capture_state = () => ({
    		onMount,
    		fade,
    		RoomTypeForm: RoomTypeForm$1,
    		RoomTypeList: RoomTypeList$1,
    		Button,
    		Card,
    		activeTab
    	});

    	$$self.$inject_state = $$props => {
    		if ('activeTab' in $$props) $$invalidate(0, activeTab = $$props.activeTab);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [activeTab, click_handler, click_handler_1];
    }

    class RoomType$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$s, create_fragment$s, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RoomType",
    			options,
    			id: create_fragment$s.name
    		});
    	}
    }

    /* src\components\shared\MiniCard.svelte generated by Svelte v3.49.0 */

    const file$p = "src\\components\\shared\\MiniCard.svelte";

    function create_fragment$r(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "card svelte-1g9su6");
    			add_location(div, file$p, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$r($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MiniCard', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MiniCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class MiniCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MiniCard",
    			options,
    			id: create_fragment$r.name
    		});
    	}
    }

    /* src\components\Rooms.svelte generated by Svelte v3.49.0 */

    const { console: console_1$d } = globals;
    const file$o = "src\\components\\Rooms.svelte";

    function get_each_context$c(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (56:16) <Button inverse on:click={formHandler(roomType.id, roomType.room_type.cost)}>
    function create_default_slot$b(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Select");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$b.name,
    		type: "slot",
    		source: "(56:16) <Button inverse on:click={formHandler(roomType.id, roomType.room_type.cost)}>",
    		ctx
    	});

    	return block;
    }

    // (49:12) {#each roomTypes as roomType (roomType.id)}
    function create_each_block$c(key_1, ctx) {
    	let div;
    	let h3;
    	let t0_value = /*roomType*/ ctx[5].room_type.room_type + "";
    	let t0;
    	let t1;
    	let p0;
    	let t3;
    	let h5;
    	let t4;
    	let t5_value = /*roomType*/ ctx[5].room_name + "";
    	let t5;
    	let t6;
    	let p1;
    	let t7_value = /*roomType*/ ctx[5].description + "";
    	let t7;
    	let t8;
    	let p2;
    	let b;
    	let t9;
    	let t10_value = /*roomType*/ ctx[5].room_type.cost + "";
    	let t10;
    	let t11;
    	let t12;
    	let button;
    	let t13;
    	let current;

    	button = new Button$1({
    			props: {
    				inverse: true,
    				$$slots: { default: [create_default_slot$b] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", function () {
    		if (is_function(/*formHandler*/ ctx[1](/*roomType*/ ctx[5].id, /*roomType*/ ctx[5].room_type.cost))) /*formHandler*/ ctx[1](/*roomType*/ ctx[5].id, /*roomType*/ ctx[5].room_type.cost).apply(this, arguments);
    	});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Room Type";
    			t3 = space();
    			h5 = element("h5");
    			t4 = text("Room ");
    			t5 = text(t5_value);
    			t6 = space();
    			p1 = element("p");
    			t7 = text(t7_value);
    			t8 = space();
    			p2 = element("p");
    			b = element("b");
    			t9 = text("₦");
    			t10 = text(t10_value);
    			t11 = text("/day");
    			t12 = space();
    			create_component(button.$$.fragment);
    			t13 = space();
    			add_location(h3, file$o, 50, 16, 1423);
    			add_location(p0, file$o, 51, 16, 1480);
    			add_location(h5, file$o, 52, 16, 1514);
    			add_location(p1, file$o, 53, 16, 1566);
    			add_location(b, file$o, 54, 19, 1616);
    			add_location(p2, file$o, 54, 16, 1613);
    			attr_dev(div, "class", "col");
    			add_location(div, file$o, 49, 12, 1388);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t0);
    			append_dev(div, t1);
    			append_dev(div, p0);
    			append_dev(div, t3);
    			append_dev(div, h5);
    			append_dev(h5, t4);
    			append_dev(h5, t5);
    			append_dev(div, t6);
    			append_dev(div, p1);
    			append_dev(p1, t7);
    			append_dev(div, t8);
    			append_dev(div, p2);
    			append_dev(p2, b);
    			append_dev(b, t9);
    			append_dev(b, t10);
    			append_dev(b, t11);
    			append_dev(div, t12);
    			mount_component(button, div, null);
    			append_dev(div, t13);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*roomTypes*/ 1) && t0_value !== (t0_value = /*roomType*/ ctx[5].room_type.room_type + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*roomTypes*/ 1) && t5_value !== (t5_value = /*roomType*/ ctx[5].room_name + "")) set_data_dev(t5, t5_value);
    			if ((!current || dirty & /*roomTypes*/ 1) && t7_value !== (t7_value = /*roomType*/ ctx[5].description + "")) set_data_dev(t7, t7_value);
    			if ((!current || dirty & /*roomTypes*/ 1) && t10_value !== (t10_value = /*roomType*/ ctx[5].room_type.cost + "")) set_data_dev(t10, t10_value);
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$c.name,
    		type: "each",
    		source: "(49:12) {#each roomTypes as roomType (roomType.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$q(ctx) {
    	let main;
    	let div1;
    	let div0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*roomTypes*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*roomType*/ ctx[5].id;
    	validate_each_keys(ctx, each_value, get_each_context$c, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$c(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$c(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "row row-cols-3");
    			add_location(div0, file$o, 47, 8, 1289);
    			attr_dev(div1, "class", "container text-center");
    			add_location(div1, file$o, 46, 4, 1244);
    			add_location(main, file$o, 45, 0, 1232);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*formHandler, roomTypes*/ 3) {
    				each_value = /*roomTypes*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$c, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div0, outro_and_destroy_block, create_each_block$c, null, get_each_context$c);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$q($$self, $$props, $$invalidate) {
    	let roomTypes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Rooms', slots, []);
    	const dispatch = createEventDispatcher();
    	let errMsg = '';

    	onMount(async () => {
    		const res = await fetch('http://localhost:8000/room/');
    		$$invalidate(0, roomTypes = await res.json());
    		console.log(roomTypes);
    	});

    	let roomInfo = { id: '', price: '' };

    	const formHandler = (id, price) => {
    		roomInfo.id = id;
    		roomInfo.price = price;
    		console.log(roomInfo);
    		dispatch('add', roomInfo);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$d.warn(`<Rooms> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		axios: axios$2,
    		onMount,
    		RoomType: RoomType$1,
    		MiniCard,
    		Button: Button$1,
    		createEventDispatcher,
    		dispatch,
    		errMsg,
    		roomInfo,
    		formHandler,
    		roomTypes
    	});

    	$$self.$inject_state = $$props => {
    		if ('errMsg' in $$props) errMsg = $$props.errMsg;
    		if ('roomInfo' in $$props) roomInfo = $$props.roomInfo;
    		if ('roomTypes' in $$props) $$invalidate(0, roomTypes = $$props.roomTypes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(0, roomTypes = '');
    	return [roomTypes, formHandler];
    }

    class Rooms extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Rooms",
    			options,
    			id: create_fragment$q.name
    		});
    	}
    }

    /* src\components\Booking.svelte generated by Svelte v3.49.0 */

    const { console: console_1$c } = globals;
    const file$n = "src\\components\\Booking.svelte";

    // (92:4) <Button>
    function create_default_slot$a(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Submit");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$a.name,
    		type: "slot",
    		source: "(92:4) <Button>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$p(ctx) {
    	let form;
    	let table;
    	let tr0;
    	let th0;
    	let t1;
    	let td0;
    	let input0;
    	let t2;
    	let div0;
    	let t3_value = /*err*/ ctx[1].chekin + "";
    	let t3;
    	let t4;
    	let tr1;
    	let th1;
    	let t6;
    	let td1;
    	let input1;
    	let t7;
    	let div1;
    	let t8_value = /*err*/ ctx[1].checkout + "";
    	let t8;
    	let t9;
    	let tr2;
    	let t10;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button$1({
    			props: {
    				$$slots: { default: [create_default_slot$a] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			form = element("form");
    			table = element("table");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Check-in Date";
    			t1 = space();
    			td0 = element("td");
    			input0 = element("input");
    			t2 = space();
    			div0 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			tr1 = element("tr");
    			th1 = element("th");
    			th1.textContent = "Check-out Date";
    			t6 = space();
    			td1 = element("td");
    			input1 = element("input");
    			t7 = space();
    			div1 = element("div");
    			t8 = text(t8_value);
    			t9 = space();
    			tr2 = element("tr");
    			t10 = space();
    			create_component(button.$$.fragment);
    			add_location(th0, file$n, 77, 12, 1899);
    			attr_dev(input0, "type", "date");
    			attr_dev(input0, "name", "checkin date");
    			attr_dev(input0, "min", formatDate(new Date()));
    			attr_dev(input0, "class", "form-control");
    			add_location(input0, file$n, 78, 16, 1939);
    			add_location(td0, file$n, 78, 12, 1935);
    			attr_dev(div0, "class", "errors");
    			add_location(div0, file$n, 79, 12, 2079);
    			add_location(tr0, file$n, 76, 8, 1881);
    			add_location(th1, file$n, 82, 12, 2160);
    			attr_dev(input1, "type", "date");
    			attr_dev(input1, "name", "checkout date");
    			attr_dev(input1, "min", formatDate(new Date()));
    			attr_dev(input1, "class", "form-control");
    			add_location(input1, file$n, 83, 16, 2201);
    			add_location(td1, file$n, 83, 12, 2197);
    			attr_dev(div1, "class", "errors");
    			add_location(div1, file$n, 84, 12, 2343);
    			add_location(tr1, file$n, 81, 8, 2142);
    			add_location(tr2, file$n, 86, 8, 2408);
    			attr_dev(table, "class", "table table=bordered");
    			add_location(table, file$n, 75, 4, 1835);
    			add_location(form, file$n, 74, 0, 1784);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, table);
    			append_dev(table, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, td0);
    			append_dev(td0, input0);
    			set_input_value(input0, /*fields*/ ctx[0].chekin_date);
    			append_dev(tr0, t2);
    			append_dev(tr0, div0);
    			append_dev(div0, t3);
    			append_dev(table, t4);
    			append_dev(table, tr1);
    			append_dev(tr1, th1);
    			append_dev(tr1, t6);
    			append_dev(tr1, td1);
    			append_dev(td1, input1);
    			set_input_value(input1, /*fields*/ ctx[0].chekout_date);
    			append_dev(tr1, t7);
    			append_dev(tr1, div1);
    			append_dev(div1, t8);
    			append_dev(table, t9);
    			append_dev(table, tr2);
    			append_dev(form, t10);
    			mount_component(button, form, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[3]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[4]),
    					listen_dev(form, "submit", prevent_default(/*formHandler*/ ctx[2]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fields*/ 1) {
    				set_input_value(input0, /*fields*/ ctx[0].chekin_date);
    			}

    			if ((!current || dirty & /*err*/ 2) && t3_value !== (t3_value = /*err*/ ctx[1].chekin + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*fields*/ 1) {
    				set_input_value(input1, /*fields*/ ctx[0].chekout_date);
    			}

    			if ((!current || dirty & /*err*/ 2) && t8_value !== (t8_value = /*err*/ ctx[1].checkout + "")) set_data_dev(t8, t8_value);
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			destroy_component(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function formatDate(date) {
    	var d = new Date(date),
    		month = '' + (d.getMonth() + 1),
    		day = '' + d.getDate(),
    		year = d.getFullYear();

    	if (month.length < 2) month = '0' + month;
    	if (day.length < 2) day = '0' + day;
    	return [year, month, day].join('-');
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Booking', slots, []);
    	let dispatch = createEventDispatcher();

    	let fields = {
    		chekin_date: '',
    		chekout_date: '',
    		room_id: '',
    		price: '',
    		total_price: '',
    		guest_id: '',
    		total_days: ''
    	};

    	let err = { chekin: '', checkout: '' };
    	let valid = false;

    	const formHandler = () => {
    		valid = true;

    		//validate booking
    		let current_date = new Date(formatDate(new Date()));

    		let chekin = new Date(fields.chekin_date);
    		let checkout = new Date(fields.chekout_date);
    		let difference = Math.abs(chekin - current_date);
    		let days = difference / (1000 * 3600 * 24);
    		let totalDays = Math.abs(checkout - chekin) / (1000 * 3600 * 24);
    		$$invalidate(0, fields.total_days = totalDays, fields);

    		if (fields.chekin_date === '') {
    			valid = false;
    			$$invalidate(1, err.chekin = 'Check-in date cannot be empty', err);
    		} else {
    			$$invalidate(1, err.chekin = '', err);
    		}

    		if (fields.chekout_date === '') {
    			valid = false;
    			$$invalidate(1, err.checkout = 'Check-out date cannot be empty', err);
    		} else {
    			$$invalidate(1, err.checkout = '', err);
    		}

    		if (days > 3) {
    			valid = false;
    			$$invalidate(1, err.chekin = "You cannot book more than 3 ahead", err);
    		} else {
    			$$invalidate(1, err.chekin = '', err);
    		}

    		if (valid) {
    			let bookinginfo = { ...fields };
    			dispatch('add', bookinginfo);
    			console.log(bookinginfo);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$c.warn(`<Booking> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		fields.chekin_date = this.value;
    		$$invalidate(0, fields);
    	}

    	function input1_input_handler() {
    		fields.chekout_date = this.value;
    		$$invalidate(0, fields);
    	}

    	$$self.$capture_state = () => ({
    		Button: Button$1,
    		onMount,
    		createEventDispatcher,
    		dispatch,
    		fields,
    		err,
    		valid,
    		formHandler,
    		formatDate
    	});

    	$$self.$inject_state = $$props => {
    		if ('dispatch' in $$props) dispatch = $$props.dispatch;
    		if ('fields' in $$props) $$invalidate(0, fields = $$props.fields);
    		if ('err' in $$props) $$invalidate(1, err = $$props.err);
    		if ('valid' in $$props) valid = $$props.valid;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fields, err, formHandler, input0_input_handler, input1_input_handler];
    }

    class Booking extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Booking",
    			options,
    			id: create_fragment$p.name
    		});
    	}
    }

    /* src\components\Summary.svelte generated by Svelte v3.49.0 */

    const file$m = "src\\components\\Summary.svelte";

    function create_fragment$o(ctx) {
    	let table;
    	let tr0;
    	let th0;
    	let t1;
    	let td0;
    	let t2;
    	let tr1;
    	let th1;
    	let t3;
    	let td1;
    	let t4;
    	let tr2;

    	const block = {
    		c: function create() {
    			table = element("table");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Name";
    			t1 = space();
    			td0 = element("td");
    			t2 = space();
    			tr1 = element("tr");
    			th1 = element("th");
    			t3 = space();
    			td1 = element("td");
    			t4 = space();
    			tr2 = element("tr");
    			add_location(th0, file$m, 6, 8, 81);
    			add_location(td0, file$m, 7, 8, 104);
    			add_location(tr0, file$m, 5, 4, 67);
    			add_location(th1, file$m, 10, 8, 144);
    			add_location(td1, file$m, 11, 8, 163);
    			add_location(tr1, file$m, 9, 4, 130);
    			add_location(tr2, file$m, 13, 4, 189);
    			attr_dev(table, "class", "table table=bordered");
    			add_location(table, file$m, 4, 0, 25);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, td0);
    			append_dev(table, t2);
    			append_dev(table, tr1);
    			append_dev(tr1, th1);
    			append_dev(tr1, t3);
    			append_dev(tr1, td1);
    			append_dev(table, t4);
    			append_dev(table, tr2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Summary', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Summary> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Summary extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Summary",
    			options,
    			id: create_fragment$o.name
    		});
    	}
    }

    /* src\components\RoomBooking.svelte generated by Svelte v3.49.0 */

    const { console: console_1$b } = globals;
    const file$l = "src\\components\\RoomBooking.svelte";

    // (102:35) 
    function create_if_block_3$1(ctx) {
    	let form;
    	let table;
    	let tr0;
    	let th0;
    	let t1;
    	let td0;
    	let t2_value = /*guestArray*/ ctx[2].name + "";
    	let t2;
    	let t3;
    	let tr1;
    	let th1;
    	let t5;
    	let td1;
    	let t6_value = /*bookinginfo*/ ctx[1].chekin_date + "";
    	let t6;
    	let t7;
    	let tr2;
    	let th2;
    	let t9;
    	let td2;
    	let t10_value = /*bookinginfo*/ ctx[1].chekout_date + "";
    	let t10;
    	let t11;
    	let tr3;
    	let th3;
    	let t13;
    	let td3;
    	let t14_value = /*bookinginfo*/ ctx[1].total_price + "";
    	let t14;
    	let t15;
    	let tr4;
    	let th4;
    	let t17;
    	let td4;
    	let t19;
    	let div;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button$1({
    			props: {
    				$$slots: { default: [create_default_slot$9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			form = element("form");
    			table = element("table");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Name";
    			t1 = space();
    			td0 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			tr1 = element("tr");
    			th1 = element("th");
    			th1.textContent = "Check In";
    			t5 = space();
    			td1 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			tr2 = element("tr");
    			th2 = element("th");
    			th2.textContent = "Check Out";
    			t9 = space();
    			td2 = element("td");
    			t10 = text(t10_value);
    			t11 = space();
    			tr3 = element("tr");
    			th3 = element("th");
    			th3.textContent = "Total Amount";
    			t13 = space();
    			td3 = element("td");
    			t14 = text(t14_value);
    			t15 = space();
    			tr4 = element("tr");
    			th4 = element("th");
    			th4.textContent = "Payment Status";
    			t17 = space();
    			td4 = element("td");
    			td4.textContent = "Unpaid";
    			t19 = space();
    			div = element("div");
    			create_component(button.$$.fragment);
    			add_location(th0, file$l, 105, 12, 2899);
    			add_location(td0, file$l, 106, 12, 2926);
    			add_location(tr0, file$l, 104, 8, 2881);
    			add_location(th1, file$l, 109, 12, 2995);
    			add_location(td1, file$l, 110, 12, 3026);
    			add_location(tr1, file$l, 108, 8, 2977);
    			add_location(th2, file$l, 113, 12, 3103);
    			add_location(td2, file$l, 114, 12, 3135);
    			add_location(tr2, file$l, 112, 8, 3085);
    			add_location(th3, file$l, 117, 12, 3213);
    			add_location(td3, file$l, 118, 12, 3248);
    			add_location(tr3, file$l, 116, 8, 3195);
    			add_location(th4, file$l, 121, 12, 3325);
    			add_location(td4, file$l, 122, 12, 3362);
    			add_location(tr4, file$l, 120, 8, 3307);
    			attr_dev(table, "class", "table table=bordered");
    			add_location(table, file$l, 103, 4, 2835);
    			add_location(div, file$l, 126, 4, 3422);
    			add_location(form, file$l, 102, 0, 2784);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, table);
    			append_dev(table, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, td0);
    			append_dev(td0, t2);
    			append_dev(table, t3);
    			append_dev(table, tr1);
    			append_dev(tr1, th1);
    			append_dev(tr1, t5);
    			append_dev(tr1, td1);
    			append_dev(td1, t6);
    			append_dev(table, t7);
    			append_dev(table, tr2);
    			append_dev(tr2, th2);
    			append_dev(tr2, t9);
    			append_dev(tr2, td2);
    			append_dev(td2, t10);
    			append_dev(table, t11);
    			append_dev(table, tr3);
    			append_dev(tr3, th3);
    			append_dev(tr3, t13);
    			append_dev(tr3, td3);
    			append_dev(td3, t14);
    			append_dev(table, t15);
    			append_dev(table, tr4);
    			append_dev(tr4, th4);
    			append_dev(tr4, t17);
    			append_dev(tr4, td4);
    			append_dev(form, t19);
    			append_dev(form, div);
    			mount_component(button, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(form, "submit", prevent_default(/*formHandler*/ ctx[7]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*guestArray*/ 4) && t2_value !== (t2_value = /*guestArray*/ ctx[2].name + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*bookinginfo*/ 2) && t6_value !== (t6_value = /*bookinginfo*/ ctx[1].chekin_date + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty & /*bookinginfo*/ 2) && t10_value !== (t10_value = /*bookinginfo*/ ctx[1].chekout_date + "")) set_data_dev(t10, t10_value);
    			if ((!current || dirty & /*bookinginfo*/ 2) && t14_value !== (t14_value = /*bookinginfo*/ ctx[1].total_price + "")) set_data_dev(t14, t14_value);
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 2048) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			destroy_component(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(102:35) ",
    		ctx
    	});

    	return block;
    }

    // (100:44) 
    function create_if_block_2$1(ctx) {
    	let customer;
    	let current;
    	customer = new Customer({ $$inline: true });
    	customer.$on("add", /*getguests*/ ctx[6]);

    	const block = {
    		c: function create() {
    			create_component(customer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(customer, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(customer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(customer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(customer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(100:44) ",
    		ctx
    	});

    	return block;
    }

    // (98:37) 
    function create_if_block_1$2(ctx) {
    	let rooms;
    	let current;
    	rooms = new Rooms({ $$inline: true });
    	rooms.$on("add", /*getRoomType*/ ctx[5]);

    	const block = {
    		c: function create() {
    			create_component(rooms.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(rooms, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(rooms.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(rooms.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(rooms, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(98:37) ",
    		ctx
    	});

    	return block;
    }

    // (96:0) {#if activeItem === 'Booking Details'}
    function create_if_block$4(ctx) {
    	let booking;
    	let current;
    	booking = new Booking({ $$inline: true });
    	booking.$on("add", /*handleAdd*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(booking.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(booking, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(booking.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(booking.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(booking, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(96:0) {#if activeItem === 'Booking Details'}",
    		ctx
    	});

    	return block;
    }

    // (128:8) <Button>
    function create_default_slot$9(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Submit");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$9.name,
    		type: "slot",
    		source: "(128:8) <Button>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let tabs;
    	let t;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	tabs = new Tabs({
    			props: {
    				items: /*items*/ ctx[3],
    				activeItem: /*activeItem*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const if_block_creators = [create_if_block$4, create_if_block_1$2, create_if_block_2$1, create_if_block_3$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*activeItem*/ ctx[0] === 'Booking Details') return 0;
    		if (/*activeItem*/ ctx[0] === 'Room Type') return 1;
    		if (/*activeItem*/ ctx[0] === 'Personal Details') return 2;
    		if (/*activeItem*/ ctx[0] === 'Summary') return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			create_component(tabs.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tabs, target, anchor);
    			insert_dev(target, t, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tabs_changes = {};
    			if (dirty & /*activeItem*/ 1) tabs_changes.activeItem = /*activeItem*/ ctx[0];
    			tabs.$set(tabs_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabs.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabs.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tabs, detaching);
    			if (detaching) detach_dev(t);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let guests;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RoomBooking', slots, []);

    	onMount(async () => {
    		const res = await fetch('http://localhost:8000/guest/');
    		guests = await res.json();
    	});

    	let items = ['Personal Details', 'Booking Details', 'Room Type', 'Summary'];
    	let activeItem = 'Personal Details';
    	let bookinginfo;

    	const handleAdd = e => {
    		$$invalidate(1, bookinginfo = e.detail);
    		$$invalidate(0, activeItem = 'Room Type');
    		console.log(bookinginfo);
    	};

    	const getRoomType = e => {
    		let id = e.detail.id;
    		let price = e.detail.price;
    		$$invalidate(1, bookinginfo.room_id = id, bookinginfo);
    		$$invalidate(1, bookinginfo.price = price, bookinginfo);
    		$$invalidate(1, bookinginfo.total_price = bookinginfo.price * bookinginfo.total_days, bookinginfo);

    		for (let i = 0; i < guests.length; i++) {
    			if (guests[i].phone_no === guestArray.phone_no) {
    				$$invalidate(1, bookinginfo.guest_id = guests[i].id, bookinginfo);
    			}
    		}

    		$$invalidate(0, activeItem = 'Summary');
    	};

    	let guestArray;

    	const getguests = e => {
    		$$invalidate(2, guestArray = e.detail);
    		console.log(guestArray);
    		$$invalidate(0, activeItem = 'Booking Details');
    	};

    	let postData = {
    		checkin_date: '',
    		checkout_date: '',
    		guest_id: '',
    		room_id: '',
    		total_price: '',
    		payment_status: ''
    	};

    	let result;

    	const formHandler = async () => {
    		postData.checkin_date = bookinginfo.chekin_date;
    		postData.checkout_date = bookinginfo.chekout_date;
    		postData.guest_id = bookinginfo.guest_id;
    		postData.room_id = bookinginfo.room_id;
    		postData.total_price = bookinginfo.total_price;
    		postData.payment_status = false;

    		const res = await fetch('http://localhost:8000/reservations/', {
    			method: 'POST',
    			headers: { "content-type": "application/json" },
    			body: JSON.stringify(postData)
    		});

    		const json = await res.json();
    		result = JSON.stringify(json);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$b.warn(`<RoomBooking> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Tabs,
    		Customer,
    		Button: Button$1,
    		Modal,
    		Rooms,
    		Booking,
    		Summary,
    		createEventDispatcher,
    		onMount,
    		items,
    		activeItem,
    		bookinginfo,
    		handleAdd,
    		getRoomType,
    		guestArray,
    		getguests,
    		postData,
    		result,
    		formHandler,
    		guests
    	});

    	$$self.$inject_state = $$props => {
    		if ('items' in $$props) $$invalidate(3, items = $$props.items);
    		if ('activeItem' in $$props) $$invalidate(0, activeItem = $$props.activeItem);
    		if ('bookinginfo' in $$props) $$invalidate(1, bookinginfo = $$props.bookinginfo);
    		if ('guestArray' in $$props) $$invalidate(2, guestArray = $$props.guestArray);
    		if ('postData' in $$props) postData = $$props.postData;
    		if ('result' in $$props) result = $$props.result;
    		if ('guests' in $$props) guests = $$props.guests;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	guests = '';

    	return [
    		activeItem,
    		bookinginfo,
    		guestArray,
    		items,
    		handleAdd,
    		getRoomType,
    		getguests,
    		formHandler
    	];
    }

    class RoomBooking extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RoomBooking",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    /* src\components\Hall.svelte generated by Svelte v3.49.0 */

    const { console: console_1$a } = globals;
    const file$k = "src\\components\\Hall.svelte";

    function get_each_context$b(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (47:24) {#each halls as hall (hall.id)}
    function create_each_block$b(key_1, ctx) {
    	let option;
    	let t0_value = /*hall*/ ctx[9].hall_name + "";
    	let t0;
    	let t1;
    	let t2_value = /*hall*/ ctx[9].seats + "";
    	let t2;
    	let t3;
    	let option_value_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = text(" ---- ");
    			t2 = text(t2_value);
    			t3 = text(" Seats");
    			option.__value = option_value_value = /*hall*/ ctx[9].id;
    			option.value = option.__value;
    			add_location(option, file$k, 47, 28, 1261);
    			this.first = option;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    			append_dev(option, t2);
    			append_dev(option, t3);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*halls*/ 2 && t0_value !== (t0_value = /*hall*/ ctx[9].hall_name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*halls*/ 2 && t2_value !== (t2_value = /*hall*/ ctx[9].seats + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*halls*/ 2 && option_value_value !== (option_value_value = /*hall*/ ctx[9].id)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$b.name,
    		type: "each",
    		source: "(47:24) {#each halls as hall (hall.id)}",
    		ctx
    	});

    	return block;
    }

    // (66:8) <Button>
    function create_default_slot$8(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Submit");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$8.name,
    		type: "slot",
    		source: "(66:8) <Button>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let form;
    	let table;
    	let tr0;
    	let th0;
    	let t1;
    	let td0;
    	let select;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t2;
    	let tr1;
    	let th1;
    	let t4;
    	let td1;
    	let input0;
    	let t5;
    	let tr2;
    	let th2;
    	let t7;
    	let td2;
    	let input1;
    	let t8;
    	let tr3;
    	let t9;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*halls*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*hall*/ ctx[9].id;
    	validate_each_keys(ctx, each_value, get_each_context$b, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$b(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$b(key, child_ctx));
    	}

    	button = new Button$1({
    			props: {
    				$$slots: { default: [create_default_slot$8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			form = element("form");
    			table = element("table");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Hall Name";
    			t1 = space();
    			td0 = element("td");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			tr1 = element("tr");
    			th1 = element("th");
    			th1.textContent = "Check-in Date";
    			t4 = space();
    			td1 = element("td");
    			input0 = element("input");
    			t5 = space();
    			tr2 = element("tr");
    			th2 = element("th");
    			th2.textContent = "Check-out Date";
    			t7 = space();
    			td2 = element("td");
    			input1 = element("input");
    			t8 = space();
    			tr3 = element("tr");
    			t9 = space();
    			create_component(button.$$.fragment);
    			add_location(th0, file$k, 43, 16, 1104);
    			add_location(select, file$k, 45, 20, 1166);
    			add_location(td0, file$k, 44, 16, 1140);
    			add_location(tr0, file$k, 42, 12, 1082);
    			add_location(th1, file$k, 53, 16, 1476);
    			attr_dev(input0, "type", "date");
    			attr_dev(input0, "name", "checkin date");
    			attr_dev(input0, "min", /*disabledDates*/ ctx[2]());
    			attr_dev(input0, "class", "form-control");
    			add_location(input0, file$k, 54, 20, 1520);
    			add_location(td1, file$k, 54, 16, 1516);
    			add_location(tr1, file$k, 52, 12, 1454);
    			add_location(th2, file$k, 57, 16, 1694);
    			attr_dev(input1, "type", "date");
    			attr_dev(input1, "name", "checkout date");
    			attr_dev(input1, "class", "form-control");
    			add_location(input1, file$k, 58, 20, 1739);
    			add_location(td2, file$k, 58, 16, 1735);
    			add_location(tr2, file$k, 56, 12, 1672);
    			add_location(tr3, file$k, 60, 12, 1871);
    			attr_dev(table, "class", "table table=bordered");
    			add_location(table, file$k, 41, 8, 1032);
    			add_location(form, file$k, 40, 4, 977);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, table);
    			append_dev(table, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, td0);
    			append_dev(td0, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			append_dev(table, t2);
    			append_dev(table, tr1);
    			append_dev(tr1, th1);
    			append_dev(tr1, t4);
    			append_dev(tr1, td1);
    			append_dev(td1, input0);
    			set_input_value(input0, /*fields*/ ctx[0].chekin_date);
    			append_dev(table, t5);
    			append_dev(table, tr2);
    			append_dev(tr2, th2);
    			append_dev(tr2, t7);
    			append_dev(tr2, td2);
    			append_dev(td2, input1);
    			set_input_value(input1, /*fields*/ ctx[0].chekout_date);
    			append_dev(table, t8);
    			append_dev(table, tr3);
    			append_dev(form, t9);
    			mount_component(button, form, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen_dev(form, "submit", prevent_default(/*formHandler*/ ctx[3]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*halls*/ 2) {
    				each_value = /*halls*/ ctx[1];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$b, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, select, destroy_block, create_each_block$b, null, get_each_context$b);
    			}

    			if (dirty & /*fields*/ 1) {
    				set_input_value(input0, /*fields*/ ctx[0].chekin_date);
    			}

    			if (dirty & /*fields*/ 1) {
    				set_input_value(input1, /*fields*/ ctx[0].chekout_date);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			destroy_component(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let halls;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Hall', slots, []);
    	let dispatch = createEventDispatcher();

    	const disabledDates = () => {
    		var today;
    		today = new Date();
    		today.getDate() + 1;
    		today.getMonth() + 1;
    		today.getFullYear();
    	};

    	onMount(async () => {
    		const res = await fetch('http://localhost:8000/hall');
    		$$invalidate(1, halls = await res.json());
    		console.log(halls);
    	});

    	let fields = {
    		chekin_date: '',
    		chekout_date: '',
    		roomType: ''
    	};

    	let err = { chekin: '', checkout: '' };
    	let valid = false;

    	const formHandler = () => {
    		valid = true;

    		if (valid) {
    			let bookinginfo = { ...fields };
    			dispatch('add', bookinginfo);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$a.warn(`<Hall> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		fields.chekin_date = this.value;
    		$$invalidate(0, fields);
    	}

    	function input1_input_handler() {
    		fields.chekout_date = this.value;
    		$$invalidate(0, fields);
    	}

    	$$self.$capture_state = () => ({
    		Button: Button$1,
    		onMount,
    		createEventDispatcher,
    		dispatch,
    		disabledDates,
    		fields,
    		err,
    		valid,
    		formHandler,
    		halls
    	});

    	$$self.$inject_state = $$props => {
    		if ('dispatch' in $$props) dispatch = $$props.dispatch;
    		if ('fields' in $$props) $$invalidate(0, fields = $$props.fields);
    		if ('err' in $$props) err = $$props.err;
    		if ('valid' in $$props) valid = $$props.valid;
    		if ('halls' in $$props) $$invalidate(1, halls = $$props.halls);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(1, halls = '');

    	return [
    		fields,
    		halls,
    		disabledDates,
    		formHandler,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class Hall extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hall",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    /* src\components\HallBooking.svelte generated by Svelte v3.49.0 */

    // (38:48) 
    function create_if_block_1$1(ctx) {
    	let customer;
    	let current;
    	customer = new Customer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(customer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(customer, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(customer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(customer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(customer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(38:48) ",
    		ctx
    	});

    	return block;
    }

    // (35:4) {#if activeItem === 'Booking Details'}
    function create_if_block$3(ctx) {
    	let hall;
    	let current;
    	hall = new Hall({ $$inline: true });
    	hall.$on("add", /*handleAdd*/ ctx[2]);

    	const block = {
    		c: function create() {
    			create_component(hall.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(hall, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hall.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hall.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(hall, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(35:4) {#if activeItem === 'Booking Details'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let tabs;
    	let t;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	tabs = new Tabs({
    			props: {
    				items: /*items*/ ctx[1],
    				activeItem: /*activeItem*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const if_block_creators = [create_if_block$3, create_if_block_1$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*activeItem*/ ctx[0] === 'Booking Details') return 0;
    		if (/*activeItem*/ ctx[0] === 'Personal Details') return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			create_component(tabs.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tabs, target, anchor);
    			insert_dev(target, t, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tabs_changes = {};
    			if (dirty & /*activeItem*/ 1) tabs_changes.activeItem = /*activeItem*/ ctx[0];
    			tabs.$set(tabs_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabs.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabs.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tabs, detaching);
    			if (detaching) detach_dev(t);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HallBooking', slots, []);
    	const dispatch = createEventDispatcher();

    	const formHandler = () => {
    		
    	};

    	let items = ['Booking Details', 'Personal Details'];
    	let activeItem = 'Booking Details';
    	let bookinginfo;

    	const handleAdd = e => {
    		bookinginfo = e.detail;
    		$$invalidate(0, activeItem = 'Personal Details');
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HallBooking> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Tabs,
    		Customer,
    		Button: Button$1,
    		Modal,
    		Rooms,
    		Booking,
    		Hall,
    		createEventDispatcher,
    		dispatch,
    		formHandler,
    		items,
    		activeItem,
    		bookinginfo,
    		handleAdd
    	});

    	$$self.$inject_state = $$props => {
    		if ('items' in $$props) $$invalidate(1, items = $$props.items);
    		if ('activeItem' in $$props) $$invalidate(0, activeItem = $$props.activeItem);
    		if ('bookinginfo' in $$props) bookinginfo = $$props.bookinginfo;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [activeItem, items, handleAdd];
    }

    class HallBooking extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HallBooking",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /* src\components\PoolBooking.svelte generated by Svelte v3.49.0 */

    function create_fragment$k(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PoolBooking', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PoolBooking> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class PoolBooking extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PoolBooking",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* src\components\Login.svelte generated by Svelte v3.49.0 */
    const file$j = "src\\components\\Login.svelte";

    // (18:4) <Button>
    function create_default_slot$7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Login");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(18:4) <Button>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let form;
    	let input0;
    	let t0;
    	let input1;
    	let t1;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button$1({
    			props: {
    				$$slots: { default: [create_default_slot$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			form = element("form");
    			input0 = element("input");
    			t0 = space();
    			input1 = element("input");
    			t1 = space();
    			create_component(button.$$.fragment);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Username");
    			add_location(input0, file$j, 15, 4, 212);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "Password");
    			add_location(input1, file$j, 16, 4, 293);
    			add_location(form, file$j, 14, 0, 176);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, input0);
    			set_input_value(input0, /*postData*/ ctx[0].username);
    			append_dev(form, t0);
    			append_dev(form, input1);
    			set_input_value(input1, /*postData*/ ctx[0].password);
    			append_dev(form, t1);
    			mount_component(button, form, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[2]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[3]),
    					listen_dev(form, "submit", /*formHandler*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*postData*/ 1 && input0.value !== /*postData*/ ctx[0].username) {
    				set_input_value(input0, /*postData*/ ctx[0].username);
    			}

    			if (dirty & /*postData*/ 1 && input1.value !== /*postData*/ ctx[0].password) {
    				set_input_value(input1, /*postData*/ ctx[0].password);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			destroy_component(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Login', slots, []);
    	const postData = [];

    	const formHandler = () => {
    		axios$2.post;
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		postData.username = this.value;
    		$$invalidate(0, postData);
    	}

    	function input1_input_handler() {
    		postData.password = this.value;
    		$$invalidate(0, postData);
    	}

    	$$self.$capture_state = () => ({ Button: Button$1, axios: axios$2, postData, formHandler });
    	return [postData, formHandler, input0_input_handler, input1_input_handler];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src\components\AddRoom.svelte generated by Svelte v3.49.0 */

    const { console: console_1$9 } = globals;
    const file$i = "src\\components\\AddRoom.svelte";

    function get_each_context$a(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (55:28) {#each roomTypes as roomType (roomType.id)}
    function create_each_block$a(key_1, ctx) {
    	let option;
    	let t_value = /*roomType*/ ctx[8].room_type + "";
    	let t;
    	let option_value_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*roomType*/ ctx[8].id;
    			option.value = option.__value;
    			add_location(option, file$i, 55, 32, 1589);
    			this.first = option;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*roomTypes*/ 2 && t_value !== (t_value = /*roomType*/ ctx[8].room_type + "")) set_data_dev(t, t_value);

    			if (dirty & /*roomTypes*/ 2 && option_value_value !== (option_value_value = /*roomType*/ ctx[8].id)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$a.name,
    		type: "each",
    		source: "(55:28) {#each roomTypes as roomType (roomType.id)}",
    		ctx
    	});

    	return block;
    }

    // (63:12) <Button>
    function create_default_slot$6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Add");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(63:12) <Button>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let div;
    	let form;
    	let table;
    	let tr0;
    	let th0;
    	let t1;
    	let td0;
    	let input;
    	let t2;
    	let tr1;
    	let th1;
    	let t4;
    	let td1;
    	let select;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t5;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*roomTypes*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*roomType*/ ctx[8].id;
    	validate_each_keys(ctx, each_value, get_each_context$a, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$a(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$a(key, child_ctx));
    	}

    	button = new Button$1({
    			props: {
    				$$slots: { default: [create_default_slot$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			form = element("form");
    			table = element("table");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Room Name";
    			t1 = space();
    			td0 = element("td");
    			input = element("input");
    			t2 = space();
    			tr1 = element("tr");
    			th1 = element("th");
    			th1.textContent = "Room Type";
    			t4 = space();
    			td1 = element("td");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			create_component(button.$$.fragment);
    			add_location(th0, file$i, 47, 20, 1142);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "name", "roomname");
    			attr_dev(input, "placeholder", "Room Name");
    			attr_dev(input, "class", "form-control svelte-1wkvzan");
    			add_location(input, file$i, 48, 24, 1186);
    			add_location(td0, file$i, 48, 20, 1182);
    			add_location(tr0, file$i, 46, 16, 1116);
    			add_location(th1, file$i, 51, 20, 1370);
    			if (/*postData*/ ctx[0].room_typeid === void 0) add_render_callback(() => /*select_change_handler*/ ctx[4].call(select));
    			add_location(select, file$i, 53, 24, 1440);
    			add_location(td1, file$i, 52, 20, 1410);
    			add_location(tr1, file$i, 50, 16, 1344);
    			attr_dev(table, "class", "table table=bordered");
    			add_location(table, file$i, 45, 12, 1062);
    			add_location(form, file$i, 44, 8, 1003);
    			attr_dev(div, "class", "table-responsive");
    			add_location(div, file$i, 43, 4, 963);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, form);
    			append_dev(form, table);
    			append_dev(table, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, td0);
    			append_dev(td0, input);
    			set_input_value(input, /*postData*/ ctx[0].room_name);
    			append_dev(table, t2);
    			append_dev(table, tr1);
    			append_dev(tr1, th1);
    			append_dev(tr1, t4);
    			append_dev(tr1, td1);
    			append_dev(td1, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*postData*/ ctx[0].room_typeid);
    			append_dev(form, t5);
    			mount_component(button, form, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[3]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[4]),
    					listen_dev(form, "submit", prevent_default(/*formHandler*/ ctx[2]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*postData, roomTypes*/ 3 && input.value !== /*postData*/ ctx[0].room_name) {
    				set_input_value(input, /*postData*/ ctx[0].room_name);
    			}

    			if (dirty & /*roomTypes*/ 2) {
    				each_value = /*roomTypes*/ ctx[1];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$a, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, select, destroy_block, create_each_block$a, null, get_each_context$a);
    			}

    			if (dirty & /*postData, roomTypes*/ 3) {
    				select_option(select, /*postData*/ ctx[0].room_typeid);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 2048) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			destroy_component(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AddRoom', slots, []);

    	let postData = {
    		room_name: '',
    		room_typeid: '',
    		available: 1
    	};

    	let valid = false;
    	let errors = { room_name: '', room_type: '' };
    	let result = null;
    	let roomTypes = [];

    	onMount(async () => {
    		const res = await fetch('http://localhost:8000/room-type/');
    		$$invalidate(1, roomTypes = await res.json());
    		console.log(roomTypes);
    	});

    	const formHandler = async () => {
    		const res = await fetch('http://localhost:8000/room/', {
    			method: 'POST',
    			headers: { "content-type": "application/json" },
    			body: JSON.stringify(postData)
    		});

    		const json = await res.json();
    		result = JSON.stringify(json);
    		console.log(postData);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$9.warn(`<AddRoom> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		postData.room_name = this.value;
    		$$invalidate(0, postData);
    		$$invalidate(1, roomTypes);
    	}

    	function select_change_handler() {
    		postData.room_typeid = select_value(this);
    		$$invalidate(0, postData);
    		$$invalidate(1, roomTypes);
    	}

    	$$self.$capture_state = () => ({
    		Button: Button$1,
    		onMount,
    		postData,
    		valid,
    		errors,
    		result,
    		roomTypes,
    		formHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ('postData' in $$props) $$invalidate(0, postData = $$props.postData);
    		if ('valid' in $$props) valid = $$props.valid;
    		if ('errors' in $$props) errors = $$props.errors;
    		if ('result' in $$props) result = $$props.result;
    		if ('roomTypes' in $$props) $$invalidate(1, roomTypes = $$props.roomTypes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [postData, roomTypes, formHandler, input_input_handler, select_change_handler];
    }

    class AddRoom extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddRoom",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src\components\AddBookings.svelte generated by Svelte v3.49.0 */

    const { console: console_1$8 } = globals;
    const file$h = "src\\components\\AddBookings.svelte";

    function get_each_context$9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (39:20) {#each guests as guest (guest.id)}
    function create_each_block$9(key_1, ctx) {
    	let option;
    	let t_value = /*guest*/ ctx[4].name + "";
    	let t;
    	let option_value_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*guest*/ ctx[4].id;
    			option.value = option.__value;
    			add_location(option, file$h, 39, 24, 1056);
    			this.first = option;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*guests*/ 2 && t_value !== (t_value = /*guest*/ ctx[4].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*guests*/ 2 && option_value_value !== (option_value_value = /*guest*/ ctx[4].id)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$9.name,
    		type: "each",
    		source: "(39:20) {#each guests as guest (guest.id)}",
    		ctx
    	});

    	return block;
    }

    // (59:4) <Button>
    function create_default_slot$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Add");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(59:4) <Button>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let form;
    	let table;
    	let tr0;
    	let th0;
    	let t1;
    	let td0;
    	let select;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t2;
    	let tr1;
    	let th1;
    	let t4;
    	let td1;
    	let input0;
    	let t5;
    	let tr2;
    	let th2;
    	let t7;
    	let td2;
    	let input1;
    	let t8;
    	let tr3;
    	let th3;
    	let t10;
    	let td3;
    	let input2;
    	let t11;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*guests*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*guest*/ ctx[4].id;
    	validate_each_keys(ctx, each_value, get_each_context$9, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$9(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$9(key, child_ctx));
    	}

    	button = new Button$1({
    			props: {
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			form = element("form");
    			table = element("table");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Select Customer";
    			t1 = space();
    			td0 = element("td");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			tr1 = element("tr");
    			th1 = element("th");
    			th1.textContent = "Check-in Date";
    			t4 = space();
    			td1 = element("td");
    			input0 = element("input");
    			t5 = space();
    			tr2 = element("tr");
    			th2 = element("th");
    			th2.textContent = "Check-out Date";
    			t7 = space();
    			td2 = element("td");
    			input1 = element("input");
    			t8 = space();
    			tr3 = element("tr");
    			th3 = element("th");
    			th3.textContent = "Booking Date";
    			t10 = space();
    			td3 = element("td");
    			input2 = element("input");
    			t11 = space();
    			create_component(button.$$.fragment);
    			add_location(th0, file$h, 35, 12, 875);
    			if (/*postData*/ ctx[0].guest_id === void 0) add_render_callback(() => /*select_change_handler*/ ctx[3].call(select));
    			add_location(select, file$h, 37, 16, 935);
    			add_location(td0, file$h, 36, 12, 913);
    			add_location(tr0, file$h, 34, 8, 857);
    			add_location(th1, file$h, 45, 12, 1220);
    			attr_dev(input0, "type", "datetime-local");
    			attr_dev(input0, "name", "checkin date");
    			attr_dev(input0, "class", "form-control");
    			add_location(input0, file$h, 46, 16, 1260);
    			add_location(td1, file$h, 46, 12, 1256);
    			add_location(tr1, file$h, 44, 8, 1202);
    			add_location(th2, file$h, 49, 12, 1379);
    			attr_dev(input1, "type", "datetime-local");
    			attr_dev(input1, "name", "checkout date");
    			attr_dev(input1, "class", "form-control");
    			add_location(input1, file$h, 50, 16, 1420);
    			add_location(td2, file$h, 50, 12, 1416);
    			add_location(tr2, file$h, 48, 8, 1361);
    			add_location(th3, file$h, 53, 12, 1540);
    			attr_dev(input2, "type", "date");
    			attr_dev(input2, "name", "checkin date");
    			attr_dev(input2, "class", "form-control");
    			add_location(input2, file$h, 54, 16, 1579);
    			add_location(td3, file$h, 54, 12, 1575);
    			add_location(tr3, file$h, 52, 8, 1522);
    			attr_dev(table, "class", "table table=bordered");
    			add_location(table, file$h, 33, 4, 811);
    			add_location(form, file$h, 32, 0, 760);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, table);
    			append_dev(table, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, td0);
    			append_dev(td0, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*postData*/ ctx[0].guest_id);
    			append_dev(table, t2);
    			append_dev(table, tr1);
    			append_dev(tr1, th1);
    			append_dev(tr1, t4);
    			append_dev(tr1, td1);
    			append_dev(td1, input0);
    			append_dev(table, t5);
    			append_dev(table, tr2);
    			append_dev(tr2, th2);
    			append_dev(tr2, t7);
    			append_dev(tr2, td2);
    			append_dev(td2, input1);
    			append_dev(table, t8);
    			append_dev(table, tr3);
    			append_dev(tr3, th3);
    			append_dev(tr3, t10);
    			append_dev(tr3, td3);
    			append_dev(td3, input2);
    			append_dev(form, t11);
    			mount_component(button, form, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[3]),
    					listen_dev(form, "submit", prevent_default(/*formHandler*/ ctx[2]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*guests*/ 2) {
    				each_value = /*guests*/ ctx[1];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$9, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, select, destroy_block, create_each_block$9, null, get_each_context$9);
    			}

    			if (dirty & /*postData, guests*/ 3) {
    				select_option(select, /*postData*/ ctx[0].guest_id);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			destroy_component(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AddBookings', slots, []);

    	let postData = {
    		booking_date: '',
    		checkin_date: '',
    		checkout_date: ''
    	};

    	const formHandler = async () => {
    		const res = await fetch('http://localhost:8000/reservations/', {
    			method: 'POST',
    			headers: { "content-type": "application/json" },
    			body: JSON.stringify(postData)
    		});

    		const json = await res.json();
    		result = JSON.stringify(json);
    		console.log(postData);
    	};

    	let guests = [];

    	onMount(async () => {
    		const res = await fetch('http://localhost:8000/guest/');
    		$$invalidate(1, guests = await res.json());
    		console.log(guests);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$8.warn(`<AddBookings> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		postData.guest_id = select_value(this);
    		$$invalidate(0, postData);
    		$$invalidate(1, guests);
    	}

    	$$self.$capture_state = () => ({
    		Button: Button$1,
    		onMount,
    		postData,
    		formHandler,
    		guests
    	});

    	$$self.$inject_state = $$props => {
    		if ('postData' in $$props) $$invalidate(0, postData = $$props.postData);
    		if ('guests' in $$props) $$invalidate(1, guests = $$props.guests);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [postData, guests, formHandler, select_change_handler];
    }

    class AddBookings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddBookings",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src\components\BookingsList.svelte generated by Svelte v3.49.0 */

    const { console: console_1$7 } = globals;
    const file$g = "src\\components\\BookingsList.svelte";

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (26:16) {#each bookings as booking (booking.id)}
    function create_each_block$8(key_1, ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*booking*/ ctx[1].id + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*booking*/ ctx[1].booking_date + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*booking*/ ctx[1].checkin_date + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*booking*/ ctx[1].checkout_date + "";
    	let t6;
    	let t7;
    	let td4;
    	let t8_value = /*booking*/ ctx[1].checkout_time + "";
    	let t8;
    	let t9;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			td4 = element("td");
    			t8 = text(t8_value);
    			t9 = space();
    			attr_dev(td0, "class", "svelte-1r9fjkf");
    			add_location(td0, file$g, 27, 24, 731);
    			attr_dev(td1, "class", "svelte-1r9fjkf");
    			add_location(td1, file$g, 28, 24, 778);
    			attr_dev(td2, "class", "svelte-1r9fjkf");
    			add_location(td2, file$g, 29, 24, 835);
    			attr_dev(td3, "class", "svelte-1r9fjkf");
    			add_location(td3, file$g, 30, 24, 892);
    			attr_dev(td4, "class", "svelte-1r9fjkf");
    			add_location(td4, file$g, 31, 24, 950);
    			add_location(tr, file$g, 26, 20, 701);
    			this.first = tr;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, t6);
    			append_dev(tr, t7);
    			append_dev(tr, td4);
    			append_dev(td4, t8);
    			append_dev(tr, t9);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*bookings*/ 1 && t0_value !== (t0_value = /*booking*/ ctx[1].id + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*bookings*/ 1 && t2_value !== (t2_value = /*booking*/ ctx[1].booking_date + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*bookings*/ 1 && t4_value !== (t4_value = /*booking*/ ctx[1].checkin_date + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*bookings*/ 1 && t6_value !== (t6_value = /*booking*/ ctx[1].checkout_date + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*bookings*/ 1 && t8_value !== (t8_value = /*booking*/ ctx[1].checkout_time + "")) set_data_dev(t8, t8_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$8.name,
    		type: "each",
    		source: "(26:16) {#each bookings as booking (booking.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let main;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let tbody;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t8;
    	let hr0;
    	let t9;
    	let hr1;
    	let each_value = /*bookings*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*booking*/ ctx[1].id;
    	validate_each_keys(ctx, each_value, get_each_context$8, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$8(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$8(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "id";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Booking Date";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Check-in Date";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Check-out date";
    			t7 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t8 = space();
    			hr0 = element("hr");
    			t9 = space();
    			hr1 = element("hr");
    			attr_dev(th0, "class", "svelte-1r9fjkf");
    			add_location(th0, file$g, 18, 20, 412);
    			attr_dev(th1, "class", "svelte-1r9fjkf");
    			add_location(th1, file$g, 19, 20, 445);
    			attr_dev(th2, "class", "svelte-1r9fjkf");
    			add_location(th2, file$g, 20, 20, 488);
    			attr_dev(th3, "class", "svelte-1r9fjkf");
    			add_location(th3, file$g, 21, 20, 532);
    			add_location(tr, file$g, 17, 16, 386);
    			add_location(thead, file$g, 16, 12, 361);
    			add_location(tbody, file$g, 24, 12, 614);
    			attr_dev(table, "class", "svelte-1r9fjkf");
    			add_location(table, file$g, 15, 8, 340);
    			add_location(hr0, file$g, 36, 8, 1084);
    			add_location(hr1, file$g, 37, 8, 1100);
    			add_location(main, file$g, 14, 4, 324);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(tr, t5);
    			append_dev(tr, th3);
    			append_dev(table, t7);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(main, t8);
    			append_dev(main, hr0);
    			append_dev(main, t9);
    			append_dev(main, hr1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*bookings*/ 1) {
    				each_value = /*bookings*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$8, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, tbody, destroy_block, create_each_block$8, null, get_each_context$8);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BookingsList', slots, []);
    	let bookings = [];

    	onMount(async () => {
    		const res = await fetch('http://localhost:8000/reservations/');
    		$$invalidate(0, bookings = await res.json());
    		console.log(bookings);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$7.warn(`<BookingsList> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, bookings });

    	$$self.$inject_state = $$props => {
    		if ('bookings' in $$props) $$invalidate(0, bookings = $$props.bookings);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [bookings];
    }

    class BookingsList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BookingsList",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src\components\Bookings.svelte generated by Svelte v3.49.0 */
    const file$f = "src\\components\\Bookings.svelte";

    // (14:12) <Button>
    function create_default_slot_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("View All");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(14:12) <Button>",
    		ctx
    	});

    	return block;
    }

    // (21:12) <Button>
    function create_default_slot$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Add Booking");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(21:12) <Button>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let main;
    	let div0;
    	let button0;
    	let t0;
    	let br0;
    	let t1;
    	let br1;
    	let t2;
    	let switch_instance;
    	let t3;
    	let br2;
    	let t4;
    	let div1;
    	let button1;
    	let current;
    	let mounted;
    	let dispose;

    	button0 = new Button$1({
    			props: {
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	var switch_value = /*activeTab*/ ctx[0];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	button1 = new Button$1({
    			props: {
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			create_component(button0.$$.fragment);
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			br1 = element("br");
    			t2 = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t3 = space();
    			br2 = element("br");
    			t4 = space();
    			div1 = element("div");
    			create_component(button1.$$.fragment);
    			attr_dev(div0, "class", "butttons svelte-uc0fzg");
    			add_location(div0, file$f, 12, 8, 250);
    			add_location(br0, file$f, 15, 8, 381);
    			add_location(br1, file$f, 16, 8, 395);
    			add_location(br2, file$f, 18, 8, 457);
    			add_location(div1, file$f, 19, 8, 471);
    			add_location(main, file$f, 11, 4, 234);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			mount_component(button0, div0, null);
    			append_dev(main, t0);
    			append_dev(main, br0);
    			append_dev(main, t1);
    			append_dev(main, br1);
    			append_dev(main, t2);

    			if (switch_instance) {
    				mount_component(switch_instance, main, null);
    			}

    			append_dev(main, t3);
    			append_dev(main, br2);
    			append_dev(main, t4);
    			append_dev(main, div1);
    			mount_component(button1, div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[1], false, false, false),
    					listen_dev(div1, "click", /*click_handler_1*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);

    			if (switch_value !== (switch_value = /*activeTab*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, main, t3);
    				} else {
    					switch_instance = null;
    				}
    			}

    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(button0);
    			if (switch_instance) destroy_component(switch_instance);
    			destroy_component(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Bookings', slots, []);
    	let activeTab = BookingsList;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Bookings> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, activeTab = BookingsList);
    	const click_handler_1 = () => $$invalidate(0, activeTab = AddBookings);

    	$$self.$capture_state = () => ({
    		AddBookings,
    		BookingsList,
    		Button: Button$1,
    		activeTab
    	});

    	$$self.$inject_state = $$props => {
    		if ('activeTab' in $$props) $$invalidate(0, activeTab = $$props.activeTab);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [activeTab, click_handler, click_handler_1];
    }

    class Bookings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bookings",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src\components\CreateRoom.svelte generated by Svelte v3.49.0 */

    const file$e = "src\\components\\CreateRoom.svelte";

    function create_fragment$e(ctx) {
    	let form;
    	let div0;
    	let label;
    	let t1;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let t5;
    	let div1;
    	let input;

    	const block = {
    		c: function create() {
    			form = element("form");
    			div0 = element("div");
    			label = element("label");
    			label.textContent = "Room Type";
    			t1 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Deluxe";
    			option1 = element("option");
    			option1.textContent = "Standard";
    			option2 = element("option");
    			option2.textContent = "Suite";
    			t5 = space();
    			div1 = element("div");
    			input = element("input");
    			attr_dev(label, "for", "roomtype");
    			add_location(label, file$e, 6, 8, 71);
    			option0.__value = "deluxe";
    			option0.value = option0.__value;
    			add_location(option0, file$e, 8, 12, 158);
    			option1.__value = "standard";
    			option1.value = option1.__value;
    			add_location(option1, file$e, 9, 12, 210);
    			option2.__value = "suite";
    			option2.value = option2.__value;
    			add_location(option2, file$e, 10, 12, 266);
    			attr_dev(select, "name", "roomtype");
    			add_location(select, file$e, 7, 8, 120);
    			attr_dev(div0, "class", "form-field");
    			add_location(div0, file$e, 5, 4, 37);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Room Name");
    			add_location(input, file$e, 14, 8, 373);
    			attr_dev(div1, "class", "form-field");
    			add_location(div1, file$e, 13, 4, 339);
    			add_location(form, file$e, 4, 0, 25);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div0);
    			append_dev(div0, label);
    			append_dev(div0, t1);
    			append_dev(div0, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(form, t5);
    			append_dev(form, div1);
    			append_dev(div1, input);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CreateRoom', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CreateRoom> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class CreateRoom extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CreateRoom",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src\components\Guests.svelte generated by Svelte v3.49.0 */

    const { console: console_1$6 } = globals;
    const file$d = "src\\components\\Guests.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (30:16) {#each persons as person (person.id)}
    function create_each_block$7(key_1, ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*person*/ ctx[1].id + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*person*/ ctx[1].name + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*person*/ ctx[1].address + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*person*/ ctx[1].phone_no + "";
    	let t6;
    	let t7;
    	let td4;
    	let t8;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			td4 = element("td");
    			t8 = space();
    			attr_dev(td0, "class", "svelte-1mpehju");
    			add_location(td0, file$d, 31, 24, 765);
    			attr_dev(td1, "class", "svelte-1mpehju");
    			add_location(td1, file$d, 32, 24, 811);
    			attr_dev(td2, "class", "svelte-1mpehju");
    			add_location(td2, file$d, 33, 24, 859);
    			attr_dev(td3, "class", "svelte-1mpehju");
    			add_location(td3, file$d, 34, 24, 910);
    			attr_dev(td4, "class", "svelte-1mpehju");
    			add_location(td4, file$d, 35, 24, 962);
    			add_location(tr, file$d, 30, 20, 735);
    			this.first = tr;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, t6);
    			append_dev(tr, t7);
    			append_dev(tr, td4);
    			append_dev(tr, t8);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*persons*/ 1 && t0_value !== (t0_value = /*person*/ ctx[1].id + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*persons*/ 1 && t2_value !== (t2_value = /*person*/ ctx[1].name + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*persons*/ 1 && t4_value !== (t4_value = /*person*/ ctx[1].address + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*persons*/ 1 && t6_value !== (t6_value = /*person*/ ctx[1].phone_no + "")) set_data_dev(t6, t6_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(30:16) {#each persons as person (person.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let main;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let tbody;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*persons*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*person*/ ctx[1].id;
    	validate_each_keys(ctx, each_value, get_each_context$7, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$7(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$7(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "id";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Name";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Address";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Phone Number";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Room";
    			t9 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(th0, "class", "svelte-1mpehju");
    			add_location(th0, file$d, 21, 20, 430);
    			attr_dev(th1, "class", "svelte-1mpehju");
    			add_location(th1, file$d, 22, 20, 463);
    			attr_dev(th2, "class", "svelte-1mpehju");
    			add_location(th2, file$d, 23, 20, 498);
    			attr_dev(th3, "class", "svelte-1mpehju");
    			add_location(th3, file$d, 24, 20, 536);
    			attr_dev(th4, "class", "svelte-1mpehju");
    			add_location(th4, file$d, 25, 20, 579);
    			add_location(tr, file$d, 20, 16, 404);
    			add_location(thead, file$d, 19, 12, 379);
    			add_location(tbody, file$d, 28, 12, 651);
    			attr_dev(table, "class", "svelte-1mpehju");
    			add_location(table, file$d, 18, 8, 358);
    			add_location(main, file$d, 17, 4, 342);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(tr, t5);
    			append_dev(tr, th3);
    			append_dev(tr, t7);
    			append_dev(tr, th4);
    			append_dev(table, t9);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*persons*/ 1) {
    				each_value = /*persons*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$7, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, tbody, destroy_block, create_each_block$7, null, get_each_context$7);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Guests', slots, []);
    	let persons;

    	onMount(async () => {
    		const res = await fetch('http://localhost:8000/guest/');
    		$$invalidate(0, persons = await res.json());
    		console.log(persons);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$6.warn(`<Guests> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, Button: Button$1, persons });

    	$$self.$inject_state = $$props => {
    		if ('persons' in $$props) $$invalidate(0, persons = $$props.persons);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(0, persons = []);
    	return [persons];
    }

    class Guests extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Guests",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src\components\RoomTypeForm.svelte generated by Svelte v3.49.0 */

    const { console: console_1$5 } = globals;
    const file$c = "src\\components\\RoomTypeForm.svelte";

    // (72:8) <Button>
    function create_default_slot$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Add");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(72:8) <Button>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div;
    	let form;
    	let table;
    	let tr0;
    	let th0;
    	let t1;
    	let td0;
    	let input0;
    	let t2;
    	let tr1;
    	let th1;
    	let t4;
    	let td1;
    	let textarea;
    	let t5;
    	let tr2;
    	let th2;
    	let t7;
    	let td2;
    	let input1;
    	let t8;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button$1({
    			props: {
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			form = element("form");
    			table = element("table");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Title";
    			t1 = space();
    			td0 = element("td");
    			input0 = element("input");
    			t2 = space();
    			tr1 = element("tr");
    			th1 = element("th");
    			th1.textContent = "Description";
    			t4 = space();
    			td1 = element("td");
    			textarea = element("textarea");
    			t5 = space();
    			tr2 = element("tr");
    			th2 = element("th");
    			th2.textContent = "Cost";
    			t7 = space();
    			td2 = element("td");
    			input1 = element("input");
    			t8 = space();
    			create_component(button.$$.fragment);
    			add_location(th0, file$c, 58, 16, 1310);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "title");
    			attr_dev(input0, "placeholder", "Title");
    			attr_dev(input0, "class", "form-control svelte-1myn5kf");
    			add_location(input0, file$c, 59, 20, 1346);
    			add_location(td0, file$c, 59, 16, 1342);
    			add_location(tr0, file$c, 57, 12, 1288);
    			add_location(th1, file$c, 62, 16, 1511);
    			attr_dev(textarea, "cols", "50");
    			attr_dev(textarea, "rows", "5");
    			attr_dev(textarea, "name", "description");
    			attr_dev(textarea, "class", "form-control svelte-1myn5kf");
    			attr_dev(textarea, "placeholder", "Description");
    			add_location(textarea, file$c, 63, 20, 1553);
    			add_location(td1, file$c, 63, 16, 1549);
    			add_location(tr1, file$c, 61, 12, 1489);
    			add_location(th2, file$c, 66, 16, 1753);
    			attr_dev(input1, "name", "cost");
    			attr_dev(input1, "class", "form-control svelte-1myn5kf");
    			attr_dev(input1, "placeholder", "Cost");
    			add_location(input1, file$c, 67, 20, 1788);
    			add_location(td2, file$c, 67, 16, 1784);
    			add_location(tr2, file$c, 65, 12, 1731);
    			attr_dev(table, "class", "table table=bordered");
    			add_location(table, file$c, 56, 8, 1238);
    			add_location(form, file$c, 55, 4, 1183);
    			attr_dev(div, "class", "table-responsive");
    			add_location(div, file$c, 54, 0, 1147);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, form);
    			append_dev(form, table);
    			append_dev(table, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, td0);
    			append_dev(td0, input0);
    			set_input_value(input0, /*postData*/ ctx[0].room_type);
    			append_dev(table, t2);
    			append_dev(table, tr1);
    			append_dev(tr1, th1);
    			append_dev(tr1, t4);
    			append_dev(tr1, td1);
    			append_dev(td1, textarea);
    			set_input_value(textarea, /*postData*/ ctx[0].description);
    			append_dev(table, t5);
    			append_dev(table, tr2);
    			append_dev(tr2, th2);
    			append_dev(tr2, t7);
    			append_dev(tr2, td2);
    			append_dev(td2, input1);
    			set_input_value(input1, /*postData*/ ctx[0].cost);
    			append_dev(form, t8);
    			mount_component(button, form, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[2]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[3]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[4]),
    					listen_dev(form, "submit", prevent_default(/*formHandler*/ ctx[1]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*postData*/ 1 && input0.value !== /*postData*/ ctx[0].room_type) {
    				set_input_value(input0, /*postData*/ ctx[0].room_type);
    			}

    			if (dirty & /*postData*/ 1) {
    				set_input_value(textarea, /*postData*/ ctx[0].description);
    			}

    			if (dirty & /*postData*/ 1 && input1.value !== /*postData*/ ctx[0].cost) {
    				set_input_value(input1, /*postData*/ ctx[0].cost);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RoomTypeForm', slots, []);
    	let postData = { room_type: '', description: '', cost: '' };
    	let valid = false;
    	let errors = { room_type: '', cost: '' };
    	let result = null;

    	const formHandler = async () => {
    		if (postData.room_type.trim().length < 1) {
    			valid = false;
    			errors.room_type = 'Room Type Cannot Be Empty';
    		} else {
    			errors.room_type = '';
    		}

    		if (postData.cost.trim().length < 1) {
    			valid = false;
    			errors.cost = 'Cost Cannot Be Empty';
    		} else if (typeof postData === 'number' && !Number.isNaN(postData)) {
    			valid = false;
    			errors.cost = 'Cost must be a Number';
    		} else {
    			errors.cost = '';
    		}

    		const res = await fetch('http://localhost:8000/room-type/', {
    			method: 'POST',
    			headers: { "content-type": "application/json" },
    			body: JSON.stringify(postData)
    		});

    		const json = await res.json();
    		result = JSON.stringify(json);
    		console.log(postData);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$5.warn(`<RoomTypeForm> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		postData.room_type = this.value;
    		$$invalidate(0, postData);
    	}

    	function textarea_input_handler() {
    		postData.description = this.value;
    		$$invalidate(0, postData);
    	}

    	function input1_input_handler() {
    		postData.cost = this.value;
    		$$invalidate(0, postData);
    	}

    	$$self.$capture_state = () => ({
    		Button: Button$1,
    		Card: Card$1,
    		postData,
    		valid,
    		errors,
    		result,
    		formHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ('postData' in $$props) $$invalidate(0, postData = $$props.postData);
    		if ('valid' in $$props) valid = $$props.valid;
    		if ('errors' in $$props) errors = $$props.errors;
    		if ('result' in $$props) result = $$props.result;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		postData,
    		formHandler,
    		input0_input_handler,
    		textarea_input_handler,
    		input1_input_handler
    	];
    }

    class RoomTypeForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RoomTypeForm",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\components\RoomTypeList.svelte generated by Svelte v3.49.0 */

    const { console: console_1$4 } = globals;
    const file$b = "src\\components\\RoomTypeList.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (51:8) {#each roomtypes as roomtype (roomtype.id)}
    function create_each_block$6(key_1, ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*roomtype*/ ctx[3].id + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*roomtype*/ ctx[3].room_type + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*roomtype*/ ctx[3].description + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*roomtype*/ ctx[3].cost + "";
    	let t6;
    	let t7;
    	let td4;
    	let div;
    	let button0;
    	let t9;
    	let button1;
    	let t11;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[2](/*roomtype*/ ctx[3]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			td4 = element("td");
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "Edit";
    			t9 = space();
    			button1 = element("button");
    			button1.textContent = "Delete";
    			t11 = space();
    			attr_dev(td0, "class", "svelte-16h66w7");
    			add_location(td0, file$b, 52, 16, 1373);
    			attr_dev(td1, "class", "svelte-16h66w7");
    			add_location(td1, file$b, 53, 16, 1413);
    			attr_dev(td2, "class", "svelte-16h66w7");
    			add_location(td2, file$b, 54, 16, 1460);
    			attr_dev(td3, "class", "svelte-16h66w7");
    			add_location(td3, file$b, 55, 16, 1509);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "btn btn-primary svelte-16h66w7");
    			add_location(button0, file$b, 58, 24, 1666);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn btn-primary-red svelte-16h66w7");
    			add_location(button1, file$b, 59, 24, 1752);
    			attr_dev(div, "class", "btn-group");
    			attr_dev(div, "role", "group");
    			attr_dev(div, "aria-label", "Basic example");
    			add_location(div, file$b, 57, 20, 1577);
    			attr_dev(td4, "class", "svelte-16h66w7");
    			add_location(td4, file$b, 56, 16, 1551);
    			add_location(tr, file$b, 51, 12, 1351);
    			this.first = tr;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, t6);
    			append_dev(tr, t7);
    			append_dev(tr, td4);
    			append_dev(td4, div);
    			append_dev(div, button0);
    			append_dev(div, t9);
    			append_dev(div, button1);
    			append_dev(tr, t11);

    			if (!mounted) {
    				dispose = listen_dev(button1, "click", prevent_default(click_handler), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*roomtypes*/ 1 && t0_value !== (t0_value = /*roomtype*/ ctx[3].id + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*roomtypes*/ 1 && t2_value !== (t2_value = /*roomtype*/ ctx[3].room_type + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*roomtypes*/ 1 && t4_value !== (t4_value = /*roomtype*/ ctx[3].description + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*roomtypes*/ 1 && t6_value !== (t6_value = /*roomtype*/ ctx[3].cost + "")) set_data_dev(t6, t6_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(51:8) {#each roomtypes as roomtype (roomtype.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let tbody;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*roomtypes*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*roomtype*/ ctx[3].id;
    	validate_each_keys(ctx, each_value, get_each_context$6, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$6(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$6(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "id";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Room Type";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Description";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Cost";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Actions";
    			t9 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(th0, "class", "svelte-16h66w7");
    			add_location(th0, file$b, 42, 12, 1108);
    			attr_dev(th1, "class", "svelte-16h66w7");
    			add_location(th1, file$b, 43, 12, 1133);
    			attr_dev(th2, "class", "svelte-16h66w7");
    			add_location(th2, file$b, 44, 12, 1165);
    			attr_dev(th3, "class", "svelte-16h66w7");
    			add_location(th3, file$b, 45, 12, 1199);
    			attr_dev(th4, "class", "svelte-16h66w7");
    			add_location(th4, file$b, 46, 12, 1226);
    			add_location(tr, file$b, 41, 8, 1090);
    			add_location(thead, file$b, 40, 4, 1073);
    			add_location(tbody, file$b, 49, 4, 1277);
    			attr_dev(table, "class", "svelte-16h66w7");
    			add_location(table, file$b, 39, 0, 1060);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(tr, t5);
    			append_dev(tr, th3);
    			append_dev(tr, t7);
    			append_dev(tr, th4);
    			append_dev(table, t9);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*deleteRoom, roomtypes*/ 3) {
    				each_value = /*roomtypes*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$6, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, tbody, destroy_block, create_each_block$6, null, get_each_context$6);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let roomtypes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RoomTypeList', slots, []);

    	onMount(async () => {
    		const res = await fetch('http://localhost:8000/room-type/');
    		$$invalidate(0, roomtypes = await res.json());
    		console.log(roomtypes);
    	});

    	const deleteRoom = async id => {
    		await fetch(`http://localhost:8000/room-type/${id}/`, {
    			method: 'DELETE',
    			headers: { "Content-type": "application/json" }
    		});

    		$$invalidate(0, roomtypes = roomtypes.filter(room => room.id !== id));
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$4.warn(`<RoomTypeList> was created with unknown prop '${key}'`);
    	});

    	const click_handler = roomtype => deleteRoom(roomtype.id);
    	$$self.$capture_state = () => ({ onMount, axios: axios$2.axios, deleteRoom, roomtypes });

    	$$self.$inject_state = $$props => {
    		if ('roomtypes' in $$props) $$invalidate(0, roomtypes = $$props.roomtypes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(0, roomtypes = []);
    	return [roomtypes, deleteRoom, click_handler];
    }

    class RoomTypeList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RoomTypeList",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\components\RoomType.svelte generated by Svelte v3.49.0 */
    const file$a = "src\\components\\RoomType.svelte";

    function create_fragment$a(ctx) {
    	let main;
    	let div;
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let br0;
    	let t4;
    	let br1;
    	let t5;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*activeTab*/ ctx[0];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "Add Type";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "View";
    			t3 = space();
    			br0 = element("br");
    			t4 = space();
    			br1 = element("br");
    			t5 = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			add_location(button0, file$a, 14, 8, 394);
    			add_location(button1, file$a, 15, 8, 473);
    			attr_dev(div, "class", "butttons svelte-uaz3l8");
    			add_location(div, file$a, 13, 4, 362);
    			add_location(br0, file$a, 17, 4, 556);
    			add_location(br1, file$a, 18, 4, 566);
    			add_location(main, file$a, 12, 0, 350);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, button0);
    			append_dev(div, t1);
    			append_dev(div, button1);
    			append_dev(main, t3);
    			append_dev(main, br0);
    			append_dev(main, t4);
    			append_dev(main, br1);
    			append_dev(main, t5);

    			if (switch_instance) {
    				mount_component(switch_instance, main, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[1], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (switch_value !== (switch_value = /*activeTab*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, main, null);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (switch_instance) destroy_component(switch_instance);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RoomType', slots, []);
    	let activeTab = RoomTypeList;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<RoomType> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, activeTab = RoomTypeForm);
    	const click_handler_1 = () => $$invalidate(0, activeTab = RoomTypeList);

    	$$self.$capture_state = () => ({
    		onMount,
    		fade,
    		RoomTypeForm,
    		RoomTypeList,
    		Button: Button$1,
    		Card: Card$1,
    		activeTab
    	});

    	$$self.$inject_state = $$props => {
    		if ('activeTab' in $$props) $$invalidate(0, activeTab = $$props.activeTab);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [activeTab, click_handler, click_handler_1];
    }

    class RoomType extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RoomType",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\components\shared\Home.svelte generated by Svelte v3.49.0 */
    const file$9 = "src\\components\\shared\\Home.svelte";

    // (10:8) <MiniCard>
    function create_default_slot_2(ctx) {
    	let h1;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "1";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Active Room";
    			add_location(h1, file$9, 10, 12, 135);
    			add_location(p, file$9, 11, 12, 159);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(10:8) <MiniCard>",
    		ctx
    	});

    	return block;
    }

    // (16:8) <MiniCard>
    function create_default_slot_1(ctx) {
    	let h1;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "1";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Active Room";
    			add_location(h1, file$9, 16, 12, 255);
    			add_location(p, file$9, 17, 12, 279);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(16:8) <MiniCard>",
    		ctx
    	});

    	return block;
    }

    // (22:8) <MiniCard>
    function create_default_slot$2(ctx) {
    	let h1;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "1";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Active Room";
    			add_location(h1, file$9, 22, 12, 375);
    			add_location(p, file$9, 23, 12, 399);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(22:8) <MiniCard>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div3;
    	let div0;
    	let minicard0;
    	let t0;
    	let div1;
    	let minicard1;
    	let t1;
    	let div2;
    	let minicard2;
    	let current;

    	minicard0 = new MiniCard({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	minicard1 = new MiniCard({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	minicard2 = new MiniCard({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			create_component(minicard0.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(minicard1.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			create_component(minicard2.$$.fragment);
    			add_location(div0, file$9, 8, 4, 96);
    			add_location(div1, file$9, 14, 4, 216);
    			add_location(div2, file$9, 20, 4, 336);
    			attr_dev(div3, "class", "main svelte-77rytz");
    			add_location(div3, file$9, 7, 0, 72);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			mount_component(minicard0, div0, null);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			mount_component(minicard1, div1, null);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			mount_component(minicard2, div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const minicard0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				minicard0_changes.$$scope = { dirty, ctx };
    			}

    			minicard0.$set(minicard0_changes);
    			const minicard1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				minicard1_changes.$$scope = { dirty, ctx };
    			}

    			minicard1.$set(minicard1_changes);
    			const minicard2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				minicard2_changes.$$scope = { dirty, ctx };
    			}

    			minicard2.$set(minicard2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(minicard0.$$.fragment, local);
    			transition_in(minicard1.$$.fragment, local);
    			transition_in(minicard2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(minicard0.$$.fragment, local);
    			transition_out(minicard1.$$.fragment, local);
    			transition_out(minicard2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(minicard0);
    			destroy_component(minicard1);
    			destroy_component(minicard2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ MiniCard });
    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\components\BookedRooms.svelte generated by Svelte v3.49.0 */

    const { console: console_1$3 } = globals;
    const file$8 = "src\\components\\BookedRooms.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (37:12) {#if room.available == 1}
    function create_if_block$2(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*room*/ ctx[3].id + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*room*/ ctx[3].room_name + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*room*/ ctx[3].room_type.room_type + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6;
    	let td4;
    	let div;
    	let button;
    	let t8;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[2](/*room*/ ctx[3]);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = space();
    			td4 = element("td");
    			div = element("div");
    			button = element("button");
    			button.textContent = "Checkout";
    			t8 = space();
    			attr_dev(td0, "class", "svelte-18cwia8");
    			add_location(td0, file$8, 38, 20, 821);
    			attr_dev(td1, "class", "svelte-18cwia8");
    			add_location(td1, file$8, 39, 20, 861);
    			attr_dev(td2, "class", "svelte-18cwia8");
    			add_location(td2, file$8, 40, 20, 908);
    			attr_dev(td3, "class", "svelte-18cwia8");
    			add_location(td3, file$8, 41, 20, 965);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary-red svelte-18cwia8");
    			add_location(button, file$8, 44, 28, 1119);
    			attr_dev(div, "class", "btn-group");
    			attr_dev(div, "role", "group");
    			attr_dev(div, "aria-label", "Basic example");
    			add_location(div, file$8, 43, 24, 1026);
    			attr_dev(td4, "class", "svelte-18cwia8");
    			add_location(td4, file$8, 42, 20, 996);
    			add_location(tr, file$8, 37, 16, 795);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(tr, t6);
    			append_dev(tr, td4);
    			append_dev(td4, div);
    			append_dev(div, button);
    			append_dev(tr, t8);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(click_handler), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*rooms*/ 1 && t0_value !== (t0_value = /*room*/ ctx[3].id + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*rooms*/ 1 && t2_value !== (t2_value = /*room*/ ctx[3].room_name + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*rooms*/ 1 && t4_value !== (t4_value = /*room*/ ctx[3].room_type.room_type + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(37:12) {#if room.available == 1}",
    		ctx
    	});

    	return block;
    }

    // (36:12) {#each rooms as room}
    function create_each_block$5(ctx) {
    	let if_block_anchor;
    	let if_block = /*room*/ ctx[3].available == 1 && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*room*/ ctx[3].available == 1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(36:12) {#each rooms as room}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let main;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let tbody;
    	let each_value = /*rooms*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "id";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Room Name";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Room Type";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Status";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Actions";
    			t9 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(th0, "class", "svelte-18cwia8");
    			add_location(th0, file$8, 27, 16, 499);
    			attr_dev(th1, "class", "svelte-18cwia8");
    			add_location(th1, file$8, 28, 16, 528);
    			attr_dev(th2, "class", "svelte-18cwia8");
    			add_location(th2, file$8, 29, 16, 564);
    			attr_dev(th3, "class", "svelte-18cwia8");
    			add_location(th3, file$8, 30, 16, 600);
    			attr_dev(th4, "class", "svelte-18cwia8");
    			add_location(th4, file$8, 31, 16, 633);
    			add_location(tr, file$8, 26, 12, 477);
    			add_location(thead, file$8, 25, 8, 456);
    			add_location(tbody, file$8, 34, 8, 696);
    			attr_dev(table, "class", "svelte-18cwia8");
    			add_location(table, file$8, 24, 4, 439);
    			add_location(main, file$8, 23, 0, 427);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(tr, t5);
    			append_dev(tr, th3);
    			append_dev(tr, t7);
    			append_dev(tr, th4);
    			append_dev(table, t9);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*checkOutRoom, rooms*/ 3) {
    				each_value = /*rooms*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BookedRooms', slots, []);
    	let rooms = [];

    	onMount(async () => {
    		const res = await fetch('http://localhost:8000/room/');
    		$$invalidate(0, rooms = await res.json());
    		console.log(rooms);
    	});

    	const checkOutRoom = async id => {
    		try {
    			await axios$2.patch('http://localhost:8000/room/', { available: 0 });
    		} catch(e) {
    			console.log(e);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<BookedRooms> was created with unknown prop '${key}'`);
    	});

    	const click_handler = room => checkOutRoom(room.id);
    	$$self.$capture_state = () => ({ axios: axios$2, onMount, rooms, checkOutRoom });

    	$$self.$inject_state = $$props => {
    		if ('rooms' in $$props) $$invalidate(0, rooms = $$props.rooms);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [rooms, checkOutRoom, click_handler];
    }

    class BookedRooms extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BookedRooms",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    const durationUnitRegex = /[a-zA-Z]/;
    const range = (size, startAt = 0) => [...Array(size).keys()].map(i => i + startAt);
    // export const characterRange = (startChar, endChar) =>
    //   String.fromCharCode(
    //     ...range(
    //       endChar.charCodeAt(0) - startChar.charCodeAt(0),
    //       startChar.charCodeAt(0)
    //     )
    //   );
    // export const zip = (arr, ...arrs) =>
    //   arr.map((val, i) => arrs.reduce((list, curr) => [...list, curr[i]], [val]));

    /* node_modules\svelte-loading-spinners\dist\SyncLoader.svelte generated by Svelte v3.49.0 */
    const file$7 = "node_modules\\svelte-loading-spinners\\dist\\SyncLoader.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (61:2) {#each range(3, 1) as i}
    function create_each_block$4(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "dot svelte-14w6xk7");
    			set_style(div, "--dotSize", +/*size*/ ctx[3] * 0.25 + /*unit*/ ctx[1]);
    			set_style(div, "--color", /*color*/ ctx[0]);
    			set_style(div, "animation-delay", /*i*/ ctx[6] * (+/*durationNum*/ ctx[5] / 10) + /*durationUnit*/ ctx[4]);
    			add_location(div, file$7, 61, 4, 1491);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*size, unit*/ 10) {
    				set_style(div, "--dotSize", +/*size*/ ctx[3] * 0.25 + /*unit*/ ctx[1]);
    			}

    			if (dirty & /*color*/ 1) {
    				set_style(div, "--color", /*color*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(61:2) {#each range(3, 1) as i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div;
    	let each_value = range(3, 1);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "wrapper svelte-14w6xk7");
    			set_style(div, "--size", /*size*/ ctx[3] + /*unit*/ ctx[1]);
    			set_style(div, "--duration", /*duration*/ ctx[2]);
    			add_location(div, file$7, 59, 0, 1383);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*size, unit, color, range, durationNum, durationUnit*/ 59) {
    				each_value = range(3, 1);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*size, unit*/ 10) {
    				set_style(div, "--size", /*size*/ ctx[3] + /*unit*/ ctx[1]);
    			}

    			if (dirty & /*duration*/ 4) {
    				set_style(div, "--duration", /*duration*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SyncLoader', slots, []);
    	let { color = "#FF3E00" } = $$props;
    	let { unit = "px" } = $$props;
    	let { duration = "0.6s" } = $$props;
    	let { size = "60" } = $$props;
    	let durationUnit = duration.match(durationUnitRegex)[0];
    	let durationNum = duration.replace(durationUnitRegex, "");
    	const writable_props = ['color', 'unit', 'duration', 'size'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SyncLoader> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('unit' in $$props) $$invalidate(1, unit = $$props.unit);
    		if ('duration' in $$props) $$invalidate(2, duration = $$props.duration);
    		if ('size' in $$props) $$invalidate(3, size = $$props.size);
    	};

    	$$self.$capture_state = () => ({
    		range,
    		durationUnitRegex,
    		color,
    		unit,
    		duration,
    		size,
    		durationUnit,
    		durationNum
    	});

    	$$self.$inject_state = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('unit' in $$props) $$invalidate(1, unit = $$props.unit);
    		if ('duration' in $$props) $$invalidate(2, duration = $$props.duration);
    		if ('size' in $$props) $$invalidate(3, size = $$props.size);
    		if ('durationUnit' in $$props) $$invalidate(4, durationUnit = $$props.durationUnit);
    		if ('durationNum' in $$props) $$invalidate(5, durationNum = $$props.durationNum);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color, unit, duration, size, durationUnit, durationNum];
    }

    class SyncLoader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { color: 0, unit: 1, duration: 2, size: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SyncLoader",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get color() {
    		throw new Error("<SyncLoader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<SyncLoader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get unit() {
    		throw new Error("<SyncLoader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set unit(value) {
    		throw new Error("<SyncLoader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<SyncLoader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<SyncLoader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<SyncLoader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<SyncLoader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\RoomList.svelte generated by Svelte v3.49.0 */

    const { console: console_1$2 } = globals;
    const file$6 = "src\\components\\RoomList.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (52:20) {:else}
    function create_else_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Booked";
    			add_location(p, file$6, 52, 20, 1298);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(52:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (50:20) {#if room.available === true}
    function create_if_block$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Available";
    			add_location(p, file$6, 50, 20, 1231);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(50:20) {#if room.available === true}",
    		ctx
    	});

    	return block;
    }

    // (44:8) {#each rooms as room (room.id)}
    function create_each_block$3(key_1, ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*room*/ ctx[4].id + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*room*/ ctx[4].room_name + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*room*/ ctx[4].room_type.room_type + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6;
    	let td4;
    	let div;
    	let button;
    	let t8;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*room*/ ctx[4].available === true) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	function click_handler() {
    		return /*click_handler*/ ctx[2](/*room*/ ctx[4]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			if_block.c();
    			t6 = space();
    			td4 = element("td");
    			div = element("div");
    			button = element("button");
    			button.textContent = "Delete";
    			t8 = space();
    			attr_dev(td0, "class", "svelte-cp7ok0");
    			add_location(td0, file$6, 45, 16, 1022);
    			attr_dev(td1, "class", "svelte-cp7ok0");
    			add_location(td1, file$6, 46, 16, 1058);
    			attr_dev(td2, "class", "svelte-cp7ok0");
    			add_location(td2, file$6, 47, 16, 1101);
    			attr_dev(td3, "class", "svelte-cp7ok0");
    			add_location(td3, file$6, 48, 16, 1154);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary-red svelte-cp7ok0");
    			add_location(button, file$6, 57, 24, 1494);
    			attr_dev(div, "class", "btn-group");
    			attr_dev(div, "role", "group");
    			attr_dev(div, "aria-label", "Basic example");
    			add_location(div, file$6, 56, 20, 1405);
    			attr_dev(td4, "class", "svelte-cp7ok0");
    			add_location(td4, file$6, 55, 16, 1379);
    			add_location(tr, file$6, 44, 12, 1000);
    			this.first = tr;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			if_block.m(td3, null);
    			append_dev(tr, t6);
    			append_dev(tr, td4);
    			append_dev(td4, div);
    			append_dev(div, button);
    			append_dev(tr, t8);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(click_handler), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*rooms*/ 1 && t0_value !== (t0_value = /*room*/ ctx[4].id + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*rooms*/ 1 && t2_value !== (t2_value = /*room*/ ctx[4].room_name + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*rooms*/ 1 && t4_value !== (t4_value = /*room*/ ctx[4].room_type.room_type + "")) set_data_dev(t4, t4_value);

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(td3, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(44:8) {#each rooms as room (room.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let main;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let tbody;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*rooms*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*room*/ ctx[4].id;
    	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "id";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Room Name";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Room Type";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Status";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Actions";
    			t9 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(th0, "class", "svelte-cp7ok0");
    			add_location(th0, file$6, 35, 12, 769);
    			attr_dev(th1, "class", "svelte-cp7ok0");
    			add_location(th1, file$6, 36, 12, 794);
    			attr_dev(th2, "class", "svelte-cp7ok0");
    			add_location(th2, file$6, 37, 12, 826);
    			attr_dev(th3, "class", "svelte-cp7ok0");
    			add_location(th3, file$6, 38, 12, 858);
    			attr_dev(th4, "class", "svelte-cp7ok0");
    			add_location(th4, file$6, 39, 12, 887);
    			add_location(tr, file$6, 34, 8, 751);
    			add_location(thead, file$6, 33, 4, 734);
    			add_location(tbody, file$6, 42, 4, 938);
    			attr_dev(table, "class", "svelte-cp7ok0");
    			add_location(table, file$6, 32, 0, 721);
    			add_location(main, file$6, 31, 0, 713);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(tr, t5);
    			append_dev(tr, th3);
    			append_dev(tr, t7);
    			append_dev(tr, th4);
    			append_dev(table, t9);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*deleteRoom, rooms*/ 3) {
    				each_value = /*rooms*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, tbody, destroy_block, create_each_block$3, null, get_each_context$3);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RoomList', slots, []);
    	let rooms = [];
    	let errMsg = '';

    	onMount(async () => {
    		const res = await fetch('http://localhost:8000/room/');
    		$$invalidate(0, rooms = await res.json());
    		console.log(rooms);
    	});

    	const deleteRoom = async id => {
    		try {
    			await axios$2.delete(`http://localhost:8000/room/${id}/`);
    			$$invalidate(0, rooms = rooms.filter(room => room.id !== id));
    		} catch(e) {
    			errMsg = e;
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<RoomList> was created with unknown prop '${key}'`);
    	});

    	const click_handler = room => deleteRoom(room.id);

    	$$self.$capture_state = () => ({
    		onMount,
    		axios: axios$2,
    		AddRoom,
    		RoomList: RoomList_1,
    		Button: Button$1,
    		SyncLoader,
    		rooms,
    		errMsg,
    		deleteRoom
    	});

    	$$self.$inject_state = $$props => {
    		if ('rooms' in $$props) $$invalidate(0, rooms = $$props.rooms);
    		if ('errMsg' in $$props) errMsg = $$props.errMsg;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [rooms, deleteRoom, click_handler];
    }

    class RoomList_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RoomList_1",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\components\RoomsTab.svelte generated by Svelte v3.49.0 */
    const file$5 = "src\\components\\RoomsTab.svelte";

    function create_fragment$5(ctx) {
    	let main;
    	let div;
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let br0;
    	let t4;
    	let br1;
    	let t5;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*activeTab*/ ctx[0];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "Add Room";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "View";
    			t3 = space();
    			br0 = element("br");
    			t4 = space();
    			br1 = element("br");
    			t5 = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			add_location(button0, file$5, 11, 8, 183);
    			add_location(button1, file$5, 12, 8, 257);
    			attr_dev(div, "class", "butttons svelte-uaz3l8");
    			add_location(div, file$5, 10, 4, 151);
    			add_location(br0, file$5, 14, 4, 336);
    			add_location(br1, file$5, 15, 4, 346);
    			add_location(main, file$5, 9, 0, 139);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, button0);
    			append_dev(div, t1);
    			append_dev(div, button1);
    			append_dev(main, t3);
    			append_dev(main, br0);
    			append_dev(main, t4);
    			append_dev(main, br1);
    			append_dev(main, t5);

    			if (switch_instance) {
    				mount_component(switch_instance, main, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[1], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (switch_value !== (switch_value = /*activeTab*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, main, null);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (switch_instance) destroy_component(switch_instance);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RoomsTab', slots, []);
    	let activeTab = RoomList_1;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<RoomsTab> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, activeTab = AddRoom);
    	const click_handler_1 = () => $$invalidate(0, activeTab = RoomList_1);
    	$$self.$capture_state = () => ({ AddRoom, RoomList: RoomList_1, activeTab });

    	$$self.$inject_state = $$props => {
    		if ('activeTab' in $$props) $$invalidate(0, activeTab = $$props.activeTab);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [activeTab, click_handler, click_handler_1];
    }

    class RoomsTab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RoomsTab",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\components\AddHall.svelte generated by Svelte v3.49.0 */

    const { console: console_1$1 } = globals;
    const file$4 = "src\\components\\AddHall.svelte";

    // (45:8) <Button>
    function create_default_slot$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Add");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(45:8) <Button>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let form;
    	let table;
    	let tr0;
    	let th0;
    	let t1;
    	let td0;
    	let input0;
    	let t2;
    	let tr1;
    	let th1;
    	let t4;
    	let td1;
    	let input1;
    	let t5;
    	let tr2;
    	let th2;
    	let t7;
    	let td2;
    	let input2;
    	let t8;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button$1({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			form = element("form");
    			table = element("table");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Title";
    			t1 = space();
    			td0 = element("td");
    			input0 = element("input");
    			t2 = space();
    			tr1 = element("tr");
    			th1 = element("th");
    			th1.textContent = "Seats";
    			t4 = space();
    			td1 = element("td");
    			input1 = element("input");
    			t5 = space();
    			tr2 = element("tr");
    			th2 = element("th");
    			th2.textContent = "Cost";
    			t7 = space();
    			td2 = element("td");
    			input2 = element("input");
    			t8 = space();
    			create_component(button.$$.fragment);
    			add_location(th0, file$4, 31, 16, 821);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "title");
    			attr_dev(input0, "placeholder", "Title");
    			attr_dev(input0, "class", "form-control svelte-1myn5kf");
    			add_location(input0, file$4, 32, 20, 857);
    			add_location(td0, file$4, 32, 16, 853);
    			add_location(tr0, file$4, 30, 12, 799);
    			add_location(th1, file$4, 35, 16, 1022);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "name", "seats");
    			attr_dev(input1, "class", "form-control svelte-1myn5kf");
    			attr_dev(input1, "placeholder", "Number Of Seats");
    			add_location(input1, file$4, 36, 20, 1058);
    			add_location(td1, file$4, 36, 16, 1054);
    			add_location(tr1, file$4, 34, 12, 1000);
    			add_location(th2, file$4, 39, 16, 1231);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "name", "cost");
    			attr_dev(input2, "class", "form-control svelte-1myn5kf");
    			attr_dev(input2, "placeholder", "Cost");
    			add_location(input2, file$4, 40, 20, 1266);
    			add_location(td2, file$4, 40, 16, 1262);
    			add_location(tr2, file$4, 38, 12, 1209);
    			attr_dev(table, "class", "table table=bordered");
    			add_location(table, file$4, 29, 8, 749);
    			add_location(form, file$4, 28, 4, 694);
    			attr_dev(div, "class", "table-responsive");
    			add_location(div, file$4, 27, 0, 658);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, form);
    			append_dev(form, table);
    			append_dev(table, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, td0);
    			append_dev(td0, input0);
    			set_input_value(input0, /*postData*/ ctx[0].hall_name);
    			append_dev(table, t2);
    			append_dev(table, tr1);
    			append_dev(tr1, th1);
    			append_dev(tr1, t4);
    			append_dev(tr1, td1);
    			append_dev(td1, input1);
    			set_input_value(input1, /*postData*/ ctx[0].seats);
    			append_dev(table, t5);
    			append_dev(table, tr2);
    			append_dev(tr2, th2);
    			append_dev(tr2, t7);
    			append_dev(tr2, td2);
    			append_dev(td2, input2);
    			set_input_value(input2, /*postData*/ ctx[0].cost);
    			append_dev(form, t8);
    			mount_component(button, form, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[2]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[3]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[4]),
    					listen_dev(form, "submit", prevent_default(/*formHandler*/ ctx[1]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*postData*/ 1 && input0.value !== /*postData*/ ctx[0].hall_name) {
    				set_input_value(input0, /*postData*/ ctx[0].hall_name);
    			}

    			if (dirty & /*postData*/ 1 && to_number(input1.value) !== /*postData*/ ctx[0].seats) {
    				set_input_value(input1, /*postData*/ ctx[0].seats);
    			}

    			if (dirty & /*postData*/ 1 && to_number(input2.value) !== /*postData*/ ctx[0].cost) {
    				set_input_value(input2, /*postData*/ ctx[0].cost);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AddHall', slots, []);
    	let postData = { hall_name: '', seats: '', cost: '' };
    	let valid = false;
    	let errors = { room_type: '', cost: '' };
    	let result = null;

    	const formHandler = async () => {
    		const res = await fetch('http://localhost:8000/hall/', {
    			method: 'POST',
    			headers: { "content-type": "application/json" },
    			body: JSON.stringify(postData)
    		});

    		const json = await res.json();
    		result = JSON.stringify(json);
    		console.log(postData);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<AddHall> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		postData.hall_name = this.value;
    		$$invalidate(0, postData);
    	}

    	function input1_input_handler() {
    		postData.seats = to_number(this.value);
    		$$invalidate(0, postData);
    	}

    	function input2_input_handler() {
    		postData.cost = to_number(this.value);
    		$$invalidate(0, postData);
    	}

    	$$self.$capture_state = () => ({
    		Button: Button$1,
    		postData,
    		valid,
    		errors,
    		result,
    		formHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ('postData' in $$props) $$invalidate(0, postData = $$props.postData);
    		if ('valid' in $$props) valid = $$props.valid;
    		if ('errors' in $$props) errors = $$props.errors;
    		if ('result' in $$props) result = $$props.result;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		postData,
    		formHandler,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler
    	];
    }

    class AddHall extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddHall",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\components\HallList.svelte generated by Svelte v3.49.0 */

    const { console: console_1 } = globals;
    const file$3 = "src\\components\\HallList.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (42:12) {#each halls as hall (hall.id)}
    function create_each_block$2(key_1, ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*hall*/ ctx[4].id + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*hall*/ ctx[4].hall_name + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*hall*/ ctx[4].seats + "";
    	let t4;
    	let t5;
    	let td3;
    	let div;
    	let button;
    	let t7;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[2](/*hall*/ ctx[4]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			div = element("div");
    			button = element("button");
    			button.textContent = "Delete";
    			t7 = space();
    			attr_dev(td0, "class", "svelte-18cwia8");
    			add_location(td0, file$3, 43, 20, 1067);
    			attr_dev(td1, "class", "svelte-18cwia8");
    			add_location(td1, file$3, 44, 20, 1107);
    			attr_dev(td2, "class", "svelte-18cwia8");
    			add_location(td2, file$3, 45, 20, 1154);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary-red svelte-18cwia8");
    			add_location(button, file$3, 48, 28, 1320);
    			attr_dev(div, "class", "btn-group");
    			attr_dev(div, "role", "group");
    			attr_dev(div, "aria-label", "Basic example");
    			add_location(div, file$3, 47, 24, 1227);
    			attr_dev(td3, "class", "svelte-18cwia8");
    			add_location(td3, file$3, 46, 20, 1197);
    			add_location(tr, file$3, 42, 16, 1041);
    			this.first = tr;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, div);
    			append_dev(div, button);
    			append_dev(tr, t7);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*halls*/ 1 && t0_value !== (t0_value = /*hall*/ ctx[4].id + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*halls*/ 1 && t2_value !== (t2_value = /*hall*/ ctx[4].hall_name + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*halls*/ 1 && t4_value !== (t4_value = /*hall*/ ctx[4].seats + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(42:12) {#each halls as hall (hall.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let main;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let tbody;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*halls*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*hall*/ ctx[4].id;
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "id";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Hall Name";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Seats";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Actions";
    			t7 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(th0, "class", "svelte-18cwia8");
    			add_location(th0, file$3, 34, 16, 811);
    			attr_dev(th1, "class", "svelte-18cwia8");
    			add_location(th1, file$3, 35, 16, 840);
    			attr_dev(th2, "class", "svelte-18cwia8");
    			add_location(th2, file$3, 36, 16, 876);
    			attr_dev(th3, "class", "svelte-18cwia8");
    			add_location(th3, file$3, 37, 16, 908);
    			add_location(tr, file$3, 33, 12, 789);
    			add_location(thead, file$3, 32, 8, 768);
    			add_location(tbody, file$3, 40, 8, 971);
    			attr_dev(table, "class", "svelte-18cwia8");
    			add_location(table, file$3, 31, 4, 751);
    			add_location(main, file$3, 30, 4, 739);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(tr, t5);
    			append_dev(tr, th3);
    			append_dev(table, t7);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*deleteHall, halls*/ 3) {
    				each_value = /*halls*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, tbody, destroy_block, create_each_block$2, null, get_each_context$2);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
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
    	validate_slots('HallList', slots, []);
    	let halls = [];
    	let errMsg = '';

    	onMount(async () => {
    		const res = await fetch('http://localhost:8000/hall/');
    		$$invalidate(0, halls = await res.json());
    		console.log(halls);
    	});

    	const deleteHall = async id => {
    		try {
    			await axios$2.delete(`http://localhost:8000/hall/${id}/`);
    			$$invalidate(0, halls = halls.filter(hall => hall.id !== id));
    		} catch(e) {
    			errMsg = e;
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<HallList> was created with unknown prop '${key}'`);
    	});

    	const click_handler = hall => deleteHall(hall.id);

    	$$self.$capture_state = () => ({
    		onMount,
    		axios: axios$2,
    		AddRoom,
    		RoomList: RoomList_1,
    		Button: Button$1,
    		halls,
    		errMsg,
    		deleteHall
    	});

    	$$self.$inject_state = $$props => {
    		if ('halls' in $$props) $$invalidate(0, halls = $$props.halls);
    		if ('errMsg' in $$props) errMsg = $$props.errMsg;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [halls, deleteHall, click_handler];
    }

    class HallList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HallList",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\HallTab.svelte generated by Svelte v3.49.0 */
    const file$2 = "src\\components\\HallTab.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let br0;
    	let t4;
    	let br1;
    	let t5;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*activeTab*/ ctx[0];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "Add Hall";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "View";
    			t3 = space();
    			br0 = element("br");
    			t4 = space();
    			br1 = element("br");
    			t5 = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    			add_location(button0, file$2, 9, 4, 174);
    			add_location(button1, file$2, 10, 4, 244);
    			attr_dev(div, "class", "butttons");
    			add_location(div, file$2, 8, 0, 146);
    			add_location(br0, file$2, 12, 0, 315);
    			add_location(br1, file$2, 13, 0, 321);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(div, t1);
    			append_dev(div, button1);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t5, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[1], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (switch_value !== (switch_value = /*activeTab*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots('HallTab', slots, []);
    	let activeTab = HallList;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HallTab> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, activeTab = AddHall);
    	const click_handler_1 = () => $$invalidate(0, activeTab = HallList);
    	$$self.$capture_state = () => ({ AddHall, HallList, activeTab });

    	$$self.$inject_state = $$props => {
    		if ('activeTab' in $$props) $$invalidate(0, activeTab = $$props.activeTab);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [activeTab, click_handler, click_handler_1];
    }

    class HallTab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HallTab",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\shared\SideTab.svelte generated by Svelte v3.49.0 */
    const file$1 = "src\\components\\shared\\SideTab.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (12:8) {#each items as item}
    function create_each_block$1(ctx) {
    	let li;
    	let div;
    	let t0_value = /*item*/ ctx[4] + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*item*/ ctx[4]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", "svelte-168xl6t");
    			toggle_class(div, "active", /*item*/ ctx[4] === /*activeItem*/ ctx[1]);
    			add_location(div, file$1, 13, 16, 318);
    			attr_dev(li, "class", "svelte-168xl6t");
    			add_location(li, file$1, 12, 12, 251);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div);
    			append_dev(div, t0);
    			append_dev(li, t1);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*items*/ 1 && t0_value !== (t0_value = /*item*/ ctx[4] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*items, activeItem*/ 3) {
    				toggle_class(div, "active", /*item*/ ctx[4] === /*activeItem*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(12:8) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let ul;
    	let each_value = /*items*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-168xl6t");
    			add_location(ul, file$1, 10, 4, 202);
    			attr_dev(div, "class", "tabs svelte-168xl6t");
    			add_location(div, file$1, 9, 0, 178);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dispatch, items, activeItem*/ 7) {
    				each_value = /*items*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
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
    	validate_slots('SideTab', slots, []);
    	const dispatch = createEventDispatcher();
    	let { items } = $$props;
    	let { activeItem } = $$props;
    	const writable_props = ['items', 'activeItem'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SideTab> was created with unknown prop '${key}'`);
    	});

    	const click_handler = item => dispatch('tabChange', item);

    	$$self.$$set = $$props => {
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    		if ('activeItem' in $$props) $$invalidate(1, activeItem = $$props.activeItem);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		items,
    		activeItem
    	});

    	$$self.$inject_state = $$props => {
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    		if ('activeItem' in $$props) $$invalidate(1, activeItem = $$props.activeItem);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [items, activeItem, dispatch, click_handler];
    }

    class SideTab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { items: 0, activeItem: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SideTab",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*items*/ ctx[0] === undefined && !('items' in props)) {
    			console.warn("<SideTab> was created without expected prop 'items'");
    		}

    		if (/*activeItem*/ ctx[1] === undefined && !('activeItem' in props)) {
    			console.warn("<SideTab> was created without expected prop 'activeItem'");
    		}
    	}

    	get items() {
    		throw new Error("<SideTab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<SideTab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeItem() {
    		throw new Error("<SideTab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeItem(value) {
    		throw new Error("<SideTab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.49.0 */
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (50:0) {#if activeItem === 'Admin'}
    function create_if_block_9(ctx) {
    	let sidetab;
    	let current;

    	sidetab = new SideTab({
    			props: {
    				items: /*tabs*/ ctx[4],
    				activeItem: /*activeTab*/ ctx[1]
    			},
    			$$inline: true
    		});

    	sidetab.$on("tabChange", /*tabChange*/ ctx[6]);

    	const block = {
    		c: function create() {
    			create_component(sidetab.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(sidetab, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const sidetab_changes = {};
    			if (dirty & /*activeTab*/ 2) sidetab_changes.activeItem = /*activeTab*/ ctx[1];
    			sidetab.$set(sidetab_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sidetab.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sidetab.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sidetab, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(50:0) {#if activeItem === 'Admin'}",
    		ctx
    	});

    	return block;
    }

    // (63:34) 
    function create_if_block_1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	const if_block_creators = [
    		create_if_block_2,
    		create_if_block_3,
    		create_if_block_4,
    		create_if_block_5,
    		create_if_block_6,
    		create_if_block_7,
    		create_if_block_8
    	];

    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*activeTab*/ ctx[1] === 'Home') return 0;
    		if (/*activeTab*/ ctx[1] === 'Bookings') return 1;
    		if (/*activeTab*/ ctx[1] === 'Booked Rooms') return 2;
    		if (/*activeTab*/ ctx[1] === 'Guests') return 3;
    		if (/*activeTab*/ ctx[1] === 'Room Types') return 4;
    		if (/*activeTab*/ ctx[1] === 'Rooms') return 5;
    		if (/*activeTab*/ ctx[1] === 'Hall') return 6;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(63:34) ",
    		ctx
    	});

    	return block;
    }

    // (55:1) {#if activeItem === 'Home'}
    function create_if_block(ctx) {
    	let select;
    	let t0;
    	let br;
    	let t1;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*options*/ ctx[7];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	var switch_value = /*selected*/ ctx[2].component;

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			br = element("br");
    			t1 = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    			if (/*selected*/ ctx[2] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[8].call(select));
    			add_location(select, file, 55, 2, 1845);
    			add_location(br, file, 60, 2, 1984);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*selected*/ ctx[2]);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t1, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[8]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*options*/ 128) {
    				each_value = /*options*/ ctx[7];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*selected, options*/ 132) {
    				select_option(select, /*selected*/ ctx[2]);
    			}

    			if (switch_value !== (switch_value = /*selected*/ ctx[2].component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(55:1) {#if activeItem === 'Home'}",
    		ctx
    	});

    	return block;
    }

    // (76:33) 
    function create_if_block_8(ctx) {
    	let halltab;
    	let current;
    	halltab = new HallTab({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(halltab.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(halltab, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(halltab.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(halltab.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(halltab, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(76:33) ",
    		ctx
    	});

    	return block;
    }

    // (74:34) 
    function create_if_block_7(ctx) {
    	let roomstab;
    	let current;
    	roomstab = new RoomsTab({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(roomstab.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(roomstab, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(roomstab.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(roomstab.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(roomstab, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(74:34) ",
    		ctx
    	});

    	return block;
    }

    // (72:39) 
    function create_if_block_6(ctx) {
    	let roomtype;
    	let current;
    	roomtype = new RoomType({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(roomtype.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(roomtype, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(roomtype.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(roomtype.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(roomtype, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(72:39) ",
    		ctx
    	});

    	return block;
    }

    // (70:35) 
    function create_if_block_5(ctx) {
    	let guests;
    	let current;
    	guests = new Guests({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(guests.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(guests, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(guests.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(guests.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(guests, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(70:35) ",
    		ctx
    	});

    	return block;
    }

    // (68:41) 
    function create_if_block_4(ctx) {
    	let bookedrooms;
    	let current;
    	bookedrooms = new BookedRooms({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(bookedrooms.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(bookedrooms, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bookedrooms.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bookedrooms.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(bookedrooms, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(68:41) ",
    		ctx
    	});

    	return block;
    }

    // (66:37) 
    function create_if_block_3(ctx) {
    	let bookings;
    	let current;
    	bookings = new Bookings({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(bookings.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(bookings, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bookings.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bookings.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(bookings, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(66:37) ",
    		ctx
    	});

    	return block;
    }

    // (64:2) {#if activeTab === 'Home'}
    function create_if_block_2(ctx) {
    	let home;
    	let current;
    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(64:2) {#if activeTab === 'Home'}",
    		ctx
    	});

    	return block;
    }

    // (57:3) {#each options as option}
    function create_each_block(ctx) {
    	let option;
    	let t_value = /*option*/ ctx[9].tab + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*option*/ ctx[9];
    			option.value = option.__value;
    			add_location(option, file, 57, 4, 1911);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(57:3) {#each options as option}",
    		ctx
    	});

    	return block;
    }

    // (54:1) <Card>
    function create_default_slot(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_if_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*activeItem*/ ctx[0] === 'Home') return 0;
    		if (/*activeItem*/ ctx[0] === 'Admin') return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(54:1) <Card>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let tabs_1;
    	let t0;
    	let t1;
    	let main;
    	let card;
    	let t2;
    	let footer;
    	let current;

    	tabs_1 = new Tabs({
    			props: {
    				items: /*items*/ ctx[3],
    				activeItem: /*activeItem*/ ctx[0]
    			},
    			$$inline: true
    		});

    	tabs_1.$on("tabChange", /*itemChange*/ ctx[5]);
    	let if_block = /*activeItem*/ ctx[0] === 'Admin' && create_if_block_9(ctx);

    	card = new Card$1({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(tabs_1.$$.fragment);
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			main = element("main");
    			create_component(card.$$.fragment);
    			t2 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(main, "class", "svelte-njitg3");
    			add_location(main, file, 52, 0, 1796);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tabs_1, target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(card, main, null);
    			insert_dev(target, t2, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tabs_1_changes = {};
    			if (dirty & /*activeItem*/ 1) tabs_1_changes.activeItem = /*activeItem*/ ctx[0];
    			tabs_1.$set(tabs_1_changes);

    			if (/*activeItem*/ ctx[0] === 'Admin') {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*activeItem*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_9(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t1.parentNode, t1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const card_changes = {};

    			if (dirty & /*$$scope, selected, activeItem, activeTab*/ 4103) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabs_1.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(card.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabs_1.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(card.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tabs_1, detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(main);
    			destroy_component(card);
    			if (detaching) detach_dev(t2);
    			destroy_component(footer, detaching);
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
    	validate_slots('App', slots, []);
    	let items = ['Home', 'About', 'Register', 'Admin'];
    	let activeItem = 'Admin';
    	let tabs = ['Home', 'Bookings', 'Booked Rooms', 'Guests', 'Room Types', 'Rooms', 'Hall'];
    	let activeTab = 'Home';

    	const itemChange = e => {
    		$$invalidate(0, activeItem = e.detail);
    	};

    	const tabChange = e => {
    		$$invalidate(1, activeTab = e.detail);
    	};

    	const options = [
    		{ tab: 'Room', component: RoomBooking },
    		{ tab: 'Hall', component: HallBooking }
    	];

    	let selected = options[1];
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		selected = select_value(this);
    		$$invalidate(2, selected);
    		$$invalidate(7, options);
    	}

    	$$self.$capture_state = () => ({
    		Footer,
    		Header,
    		Card: Card$1,
    		Tabs,
    		RoomBooking,
    		HallBooking,
    		PoolBooking,
    		Modal,
    		Login,
    		AddRoom,
    		Bookings,
    		CreateRoom,
    		Guests,
    		Rooms,
    		RoomType,
    		Hall,
    		Home,
    		BookedRooms,
    		RoomsTab,
    		HallTab,
    		SideTab,
    		items,
    		activeItem,
    		tabs,
    		activeTab,
    		itemChange,
    		tabChange,
    		options,
    		selected
    	});

    	$$self.$inject_state = $$props => {
    		if ('items' in $$props) $$invalidate(3, items = $$props.items);
    		if ('activeItem' in $$props) $$invalidate(0, activeItem = $$props.activeItem);
    		if ('tabs' in $$props) $$invalidate(4, tabs = $$props.tabs);
    		if ('activeTab' in $$props) $$invalidate(1, activeTab = $$props.activeTab);
    		if ('selected' in $$props) $$invalidate(2, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		activeItem,
    		activeTab,
    		selected,
    		items,
    		tabs,
    		itemChange,
    		tabChange,
    		options,
    		select_change_handler
    	];
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
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
