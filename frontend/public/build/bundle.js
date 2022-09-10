
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
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
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

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
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

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
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
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
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
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    function getAllContexts() {
        return get_current_component().$$.context;
    }
    function hasContext(key) {
        return get_current_component().$$.context.has(key);
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
    function tick() {
        schedule_update();
        return resolved_promise;
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
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
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
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
    /**
     * Base class to create strongly typed Svelte components.
     * This only exists for typing purposes and should be used in `.d.ts` files.
     *
     * ### Example:
     *
     * You have component library on npm called `component-library`, from which
     * you export a component called `MyComponent`. For Svelte+TypeScript users,
     * you want to provide typings. Therefore you create a `index.d.ts`:
     * ```ts
     * import { SvelteComponentTyped } from "svelte";
     * export class MyComponent extends SvelteComponentTyped<{foo: string}> {}
     * ```
     * Typing this makes it possible for IDEs like VS Code with the Svelte extension
     * to provide intellisense and to use the component like this in a Svelte file
     * with TypeScript:
     * ```svelte
     * <script lang="ts">
     * 	import { MyComponent } from "component-library";
     * </script>
     * <MyComponent foo={'bar'} />
     * ```
     *
     * #### Why not make this part of `SvelteComponent(Dev)`?
     * Because
     * ```ts
     * class ASubclassOfSvelteComponent extends SvelteComponent<{foo: string}> {}
     * const component: typeof SvelteComponent = ASubclassOfSvelteComponent;
     * ```
     * will throw a type error, so we need to separate the more strictly typed class.
     */
    class SvelteComponentTyped extends SvelteComponentDev {
        constructor(options) {
            super(options);
        }
    }

    /* src\components\Footer.svelte generated by Svelte v3.49.0 */

    const file$x = "src\\components\\Footer.svelte";

    function create_fragment$x(ctx) {
    	let footer;
    	let div;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div = element("div");
    			div.textContent = "Copyright 2022";
    			attr_dev(div, "class", "copyright svelte-rqxxpk");
    			add_location(div, file$x, 1, 4, 14);
    			attr_dev(footer, "class", "svelte-rqxxpk");
    			add_location(footer, file$x, 0, 0, 0);
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
    		id: create_fragment$x.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$x($$self, $$props) {
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
    		init(this, options, instance$x, create_fragment$x, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$x.name
    		});
    	}
    }

    /* src\components\shared\Card.svelte generated by Svelte v3.49.0 */

    const file$w = "src\\components\\shared\\Card.svelte";

    function create_fragment$w(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "card svelte-lny2t5");
    			add_location(div, file$w, 0, 0, 0);
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
    		id: create_fragment$w.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$w($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$w, create_fragment$w, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$w.name
    		});
    	}
    }

    var svelte = /*#__PURE__*/Object.freeze({
        __proto__: null,
        SvelteComponent: SvelteComponentDev,
        SvelteComponentTyped: SvelteComponentTyped,
        afterUpdate: afterUpdate,
        beforeUpdate: beforeUpdate,
        createEventDispatcher: createEventDispatcher,
        getAllContexts: getAllContexts,
        getContext: getContext,
        hasContext: hasContext,
        onDestroy: onDestroy,
        onMount: onMount,
        setContext: setContext,
        tick: tick
    });

    /* src\components\shared\Tabs.svelte generated by Svelte v3.49.0 */
    const file$v = "src\\components\\shared\\Tabs.svelte";

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
    			add_location(div, file$v, 13, 16, 318);
    			attr_dev(li, "class", "svelte-1r5azkr");
    			add_location(li, file$v, 12, 12, 251);
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

    function create_fragment$v(ctx) {
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
    			add_location(ul, file$v, 10, 4, 202);
    			attr_dev(div, "class", "tabs svelte-1r5azkr");
    			add_location(div, file$v, 9, 0, 178);
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
    		id: create_fragment$v.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$v($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$v, create_fragment$v, safe_not_equal, { items: 0, activeItem: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs",
    			options,
    			id: create_fragment$v.name
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
      var instance = bind$1(Axios_1.prototype.request, context);

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

    /* src\components\shared\Button.svelte generated by Svelte v3.49.0 */

    const file$u = "src\\components\\shared\\Button.svelte";

    function create_fragment$u(ctx) {
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
    		id: create_fragment$u.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$u($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$u, create_fragment$u, safe_not_equal, { type: 0, flat: 1, inverse: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$u.name
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
    const file$t = "src\\components\\Customer.svelte";

    // (94:4) <Button>
    function create_default_slot$e(ctx) {
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
    		id: create_default_slot$e.name,
    		type: "slot",
    		source: "(94:4) <Button>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$t(ctx) {
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
    	let t3;
    	let td1;
    	let div0;
    	let t4_value = /*errs*/ ctx[1].name + "";
    	let t4;
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
    	let tr4;
    	let th4;
    	let t12;
    	let td4;
    	let div1;
    	let t13_value = /*errs*/ ctx[1].phone_no + "";
    	let t13;
    	let t14;
    	let tr5;
    	let th5;
    	let t16;
    	let td5;
    	let input3;
    	let t17;
    	let tr6;
    	let th6;
    	let t18;
    	let td6;
    	let div2;
    	let t19_value = /*errs*/ ctx[1].email + "";
    	let t19;
    	let t20;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot$e] },
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
    			t3 = space();
    			td1 = element("td");
    			div0 = element("div");
    			t4 = text(t4_value);
    			t5 = space();
    			tr2 = element("tr");
    			th2 = element("th");
    			th2.textContent = "Address";
    			t7 = space();
    			td2 = element("td");
    			input1 = element("input");
    			t8 = space();
    			tr3 = element("tr");
    			th3 = element("th");
    			th3.textContent = "Phone Number";
    			t10 = space();
    			td3 = element("td");
    			input2 = element("input");
    			t11 = space();
    			tr4 = element("tr");
    			th4 = element("th");
    			t12 = space();
    			td4 = element("td");
    			div1 = element("div");
    			t13 = text(t13_value);
    			t14 = space();
    			tr5 = element("tr");
    			th5 = element("th");
    			th5.textContent = "Email";
    			t16 = space();
    			td5 = element("td");
    			input3 = element("input");
    			t17 = space();
    			tr6 = element("tr");
    			th6 = element("th");
    			t18 = space();
    			td6 = element("td");
    			div2 = element("div");
    			t19 = text(t19_value);
    			t20 = space();
    			create_component(button.$$.fragment);
    			add_location(th0, file$t, 63, 12, 1495);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "name");
    			attr_dev(input0, "placeholder", "Name");
    			attr_dev(input0, "class", "form-control");
    			add_location(input0, file$t, 64, 16, 1526);
    			add_location(td0, file$t, 64, 12, 1522);
    			add_location(tr0, file$t, 62, 8, 1477);
    			add_location(th1, file$t, 67, 12, 1672);
    			attr_dev(div0, "class", "errors");
    			add_location(div0, file$t, 68, 16, 1699);
    			add_location(td1, file$t, 68, 12, 1695);
    			add_location(tr1, file$t, 66, 8, 1654);
    			add_location(th2, file$t, 71, 12, 1784);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "name", "address");
    			attr_dev(input1, "placeholder", "Address");
    			attr_dev(input1, "class", "form-control");
    			add_location(input1, file$t, 72, 16, 1818);
    			add_location(td2, file$t, 72, 12, 1814);
    			add_location(tr2, file$t, 70, 8, 1766);
    			add_location(th3, file$t, 75, 12, 1974);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "name", "phone");
    			attr_dev(input2, "placeholder", "Phone Number");
    			attr_dev(input2, "class", "form-control");
    			add_location(input2, file$t, 76, 16, 2013);
    			add_location(td3, file$t, 76, 12, 2009);
    			add_location(tr3, file$t, 74, 8, 1956);
    			add_location(th4, file$t, 79, 12, 2173);
    			attr_dev(div1, "class", "errors");
    			add_location(div1, file$t, 80, 16, 2200);
    			add_location(td4, file$t, 80, 12, 2196);
    			add_location(tr4, file$t, 78, 8, 2155);
    			add_location(th5, file$t, 83, 12, 2289);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "name", "email");
    			attr_dev(input3, "placeholder", "Email Address");
    			attr_dev(input3, "class", "form-control");
    			add_location(input3, file$t, 84, 16, 2321);
    			add_location(td5, file$t, 84, 12, 2317);
    			add_location(tr5, file$t, 82, 8, 2271);
    			add_location(th6, file$t, 87, 12, 2478);
    			attr_dev(div2, "class", "errors");
    			add_location(div2, file$t, 88, 16, 2505);
    			add_location(td6, file$t, 88, 12, 2501);
    			add_location(tr6, file$t, 86, 8, 2460);
    			attr_dev(table, "class", "table table=bordered");
    			add_location(table, file$t, 61, 4, 1431);
    			add_location(form, file$t, 60, 0, 1380);
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
    			append_dev(tr1, t3);
    			append_dev(tr1, td1);
    			append_dev(td1, div0);
    			append_dev(div0, t4);
    			append_dev(table, t5);
    			append_dev(table, tr2);
    			append_dev(tr2, th2);
    			append_dev(tr2, t7);
    			append_dev(tr2, td2);
    			append_dev(td2, input1);
    			set_input_value(input1, /*postData*/ ctx[0].address);
    			append_dev(table, t8);
    			append_dev(table, tr3);
    			append_dev(tr3, th3);
    			append_dev(tr3, t10);
    			append_dev(tr3, td3);
    			append_dev(td3, input2);
    			set_input_value(input2, /*postData*/ ctx[0].phone_no);
    			append_dev(table, t11);
    			append_dev(table, tr4);
    			append_dev(tr4, th4);
    			append_dev(tr4, t12);
    			append_dev(tr4, td4);
    			append_dev(td4, div1);
    			append_dev(div1, t13);
    			append_dev(table, t14);
    			append_dev(table, tr5);
    			append_dev(tr5, th5);
    			append_dev(tr5, t16);
    			append_dev(tr5, td5);
    			append_dev(td5, input3);
    			set_input_value(input3, /*postData*/ ctx[0].email);
    			append_dev(table, t17);
    			append_dev(table, tr6);
    			append_dev(tr6, th6);
    			append_dev(tr6, t18);
    			append_dev(tr6, td6);
    			append_dev(td6, div2);
    			append_dev(div2, t19);
    			append_dev(form, t20);
    			mount_component(button, form, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[3]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[4]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[5]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[6]),
    					listen_dev(form, "submit", prevent_default(/*formHandler*/ ctx[2]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*postData*/ 1 && input0.value !== /*postData*/ ctx[0].name) {
    				set_input_value(input0, /*postData*/ ctx[0].name);
    			}

    			if ((!current || dirty & /*errs*/ 2) && t4_value !== (t4_value = /*errs*/ ctx[1].name + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*postData*/ 1 && input1.value !== /*postData*/ ctx[0].address) {
    				set_input_value(input1, /*postData*/ ctx[0].address);
    			}

    			if (dirty & /*postData*/ 1 && input2.value !== /*postData*/ ctx[0].phone_no) {
    				set_input_value(input2, /*postData*/ ctx[0].phone_no);
    			}

    			if ((!current || dirty & /*errs*/ 2) && t13_value !== (t13_value = /*errs*/ ctx[1].phone_no + "")) set_data_dev(t13, t13_value);

    			if (dirty & /*postData*/ 1 && input3.value !== /*postData*/ ctx[0].email) {
    				set_input_value(input3, /*postData*/ ctx[0].email);
    			}

    			if ((!current || dirty & /*errs*/ 2) && t19_value !== (t19_value = /*errs*/ ctx[1].email + "")) set_data_dev(t19, t19_value);
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
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
    		id: create_fragment$t.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$t($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Customer', slots, []);
    	let dispatch = createEventDispatcher();

    	const postData = {
    		name: '',
    		address: '',
    		phone_no: '',
    		email: ''
    	};

    	let errs = {
    		name: '',
    		address: '',
    		phone_no: '',
    		email: ''
    	};

    	let result;
    	let valid = false;

    	const formHandler = async () => {
    		valid = true;

    		if (postData.name.trim().length < 5) {
    			valid = false;
    			$$invalidate(1, errs.name = 'Name not valid', errs);
    		} else {
    			$$invalidate(1, errs.name = '', errs);
    		}

    		if (postData.phone_no.trim().length < 9) {
    			valid = false;
    			$$invalidate(1, errs.phone_no = 'Phone not valid', errs);
    		} else {
    			$$invalidate(1, errs.phone_no = '', errs);
    		}

    		if (postData.email.trim().length < 10) {
    			valid = false;
    			$$invalidate(1, errs.email = 'Email not valid', errs);
    		} else {
    			$$invalidate(1, errs.email = '', errs);
    		}

    		if (valid) {
    			const res = await fetch('https://ghwtjp.deta.dev/guest/', {
    				method: 'POST',
    				headers: { "content-type": "application/json" },
    				body: JSON.stringify(postData)
    			});

    			const json = await res.json();
    			result = JSON.stringify(json);
    			let guest = JSON.parse(result);
    			dispatch('add', guest);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Customer> was created with unknown prop '${key}'`);
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
    		axios,
    		Button,
    		createEventDispatcher,
    		dispatch,
    		postData,
    		errs,
    		result,
    		valid,
    		formHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ('dispatch' in $$props) dispatch = $$props.dispatch;
    		if ('errs' in $$props) $$invalidate(1, errs = $$props.errs);
    		if ('result' in $$props) result = $$props.result;
    		if ('valid' in $$props) valid = $$props.valid;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		postData,
    		errs,
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
    		init(this, options, instance$t, create_fragment$t, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Customer",
    			options,
    			id: create_fragment$t.name
    		});
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

    /* src\components\RoomTypeForm.svelte generated by Svelte v3.49.0 */

    const { console: console_1$g } = globals;
    const file$s = "src\\components\\RoomTypeForm.svelte";

    // (72:8) <Button>
    function create_default_slot$d(ctx) {
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
    		id: create_default_slot$d.name,
    		type: "slot",
    		source: "(72:8) <Button>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$s(ctx) {
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
    				$$slots: { default: [create_default_slot$d] },
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
    			add_location(th0, file$s, 58, 16, 1312);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "title");
    			attr_dev(input0, "placeholder", "Title");
    			attr_dev(input0, "class", "form-control svelte-1myn5kf");
    			add_location(input0, file$s, 59, 20, 1348);
    			add_location(td0, file$s, 59, 16, 1344);
    			add_location(tr0, file$s, 57, 12, 1290);
    			add_location(th1, file$s, 62, 16, 1513);
    			attr_dev(textarea, "cols", "50");
    			attr_dev(textarea, "rows", "5");
    			attr_dev(textarea, "name", "description");
    			attr_dev(textarea, "class", "form-control svelte-1myn5kf");
    			attr_dev(textarea, "placeholder", "Description");
    			add_location(textarea, file$s, 63, 20, 1555);
    			add_location(td1, file$s, 63, 16, 1551);
    			add_location(tr1, file$s, 61, 12, 1491);
    			add_location(th2, file$s, 66, 16, 1755);
    			attr_dev(input1, "name", "cost");
    			attr_dev(input1, "class", "form-control svelte-1myn5kf");
    			attr_dev(input1, "placeholder", "Cost");
    			add_location(input1, file$s, 67, 20, 1790);
    			add_location(td2, file$s, 67, 16, 1786);
    			add_location(tr2, file$s, 65, 12, 1733);
    			attr_dev(table, "class", "table table=bordered");
    			add_location(table, file$s, 56, 8, 1240);
    			add_location(form, file$s, 55, 4, 1185);
    			attr_dev(div, "class", "table-responsive");
    			add_location(div, file$s, 54, 0, 1149);
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
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$s($$self, $$props, $$invalidate) {
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

    		const res = await fetch('https://ghwtjp.deta.dev/room-type/', {
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$g.warn(`<RoomTypeForm> was created with unknown prop '${key}'`);
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

    class RoomTypeForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$s, create_fragment$s, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RoomTypeForm",
    			options,
    			id: create_fragment$s.name
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* node_modules\svelte-simple-modal\src\Modal.svelte generated by Svelte v3.49.0 */

    const { Object: Object_1, window: window_1 } = globals;
    const file$r = "node_modules\\svelte-simple-modal\\src\\Modal.svelte";

    // (423:0) {#if Component}
    function create_if_block$9(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let t;
    	let div0;
    	let switch_instance;
    	let div0_class_value;
    	let div1_class_value;
    	let div1_aria_label_value;
    	let div1_aria_labelledby_value;
    	let div1_transition;
    	let div2_class_value;
    	let div3_class_value;
    	let div3_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*state*/ ctx[1].closeButton && create_if_block_1$5(ctx);
    	var switch_value = /*Component*/ ctx[2];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			div0 = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty(/*state*/ ctx[1].classContent) + " svelte-g4wg3a"));
    			attr_dev(div0, "style", /*cssContent*/ ctx[9]);
    			toggle_class(div0, "content", !/*unstyled*/ ctx[0]);
    			add_location(div0, file$r, 467, 8, 11882);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(/*state*/ ctx[1].classWindow) + " svelte-g4wg3a"));
    			attr_dev(div1, "role", "dialog");
    			attr_dev(div1, "aria-modal", "true");

    			attr_dev(div1, "aria-label", div1_aria_label_value = /*state*/ ctx[1].ariaLabelledBy
    			? null
    			: /*state*/ ctx[1].ariaLabel || null);

    			attr_dev(div1, "aria-labelledby", div1_aria_labelledby_value = /*state*/ ctx[1].ariaLabelledBy || null);
    			attr_dev(div1, "style", /*cssWindow*/ ctx[8]);
    			toggle_class(div1, "window", !/*unstyled*/ ctx[0]);
    			add_location(div1, file$r, 438, 6, 10907);
    			attr_dev(div2, "class", div2_class_value = "" + (null_to_empty(/*state*/ ctx[1].classWindowWrap) + " svelte-g4wg3a"));
    			attr_dev(div2, "style", /*cssWindowWrap*/ ctx[7]);
    			toggle_class(div2, "wrap", !/*unstyled*/ ctx[0]);
    			add_location(div2, file$r, 432, 4, 10774);
    			attr_dev(div3, "class", div3_class_value = "" + (null_to_empty(/*state*/ ctx[1].classBg) + " svelte-g4wg3a"));
    			attr_dev(div3, "style", /*cssBg*/ ctx[6]);
    			toggle_class(div3, "bg", !/*unstyled*/ ctx[0]);
    			add_location(div3, file$r, 423, 2, 10528);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);

    			if (switch_instance) {
    				mount_component(switch_instance, div0, null);
    			}

    			/*div1_binding*/ ctx[49](div1);
    			/*div2_binding*/ ctx[50](div2);
    			/*div3_binding*/ ctx[51](div3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						div1,
    						"introstart",
    						function () {
    							if (is_function(/*onOpen*/ ctx[13])) /*onOpen*/ ctx[13].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div1,
    						"outrostart",
    						function () {
    							if (is_function(/*onClose*/ ctx[14])) /*onClose*/ ctx[14].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div1,
    						"introend",
    						function () {
    							if (is_function(/*onOpened*/ ctx[15])) /*onOpened*/ ctx[15].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div1,
    						"outroend",
    						function () {
    							if (is_function(/*onClosed*/ ctx[16])) /*onClosed*/ ctx[16].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(div3, "mousedown", /*handleOuterMousedown*/ ctx[20], false, false, false),
    					listen_dev(div3, "mouseup", /*handleOuterMouseup*/ ctx[21], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*state*/ ctx[1].closeButton) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*state*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (switch_value !== (switch_value = /*Component*/ ctx[2])) {
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
    					mount_component(switch_instance, div0, null);
    				} else {
    					switch_instance = null;
    				}
    			}

    			if (!current || dirty[0] & /*state*/ 2 && div0_class_value !== (div0_class_value = "" + (null_to_empty(/*state*/ ctx[1].classContent) + " svelte-g4wg3a"))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (!current || dirty[0] & /*cssContent*/ 512) {
    				attr_dev(div0, "style", /*cssContent*/ ctx[9]);
    			}

    			if (dirty[0] & /*state, unstyled*/ 3) {
    				toggle_class(div0, "content", !/*unstyled*/ ctx[0]);
    			}

    			if (!current || dirty[0] & /*state*/ 2 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*state*/ ctx[1].classWindow) + " svelte-g4wg3a"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (!current || dirty[0] & /*state*/ 2 && div1_aria_label_value !== (div1_aria_label_value = /*state*/ ctx[1].ariaLabelledBy
    			? null
    			: /*state*/ ctx[1].ariaLabel || null)) {
    				attr_dev(div1, "aria-label", div1_aria_label_value);
    			}

    			if (!current || dirty[0] & /*state*/ 2 && div1_aria_labelledby_value !== (div1_aria_labelledby_value = /*state*/ ctx[1].ariaLabelledBy || null)) {
    				attr_dev(div1, "aria-labelledby", div1_aria_labelledby_value);
    			}

    			if (!current || dirty[0] & /*cssWindow*/ 256) {
    				attr_dev(div1, "style", /*cssWindow*/ ctx[8]);
    			}

    			if (dirty[0] & /*state, unstyled*/ 3) {
    				toggle_class(div1, "window", !/*unstyled*/ ctx[0]);
    			}

    			if (!current || dirty[0] & /*state*/ 2 && div2_class_value !== (div2_class_value = "" + (null_to_empty(/*state*/ ctx[1].classWindowWrap) + " svelte-g4wg3a"))) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (!current || dirty[0] & /*cssWindowWrap*/ 128) {
    				attr_dev(div2, "style", /*cssWindowWrap*/ ctx[7]);
    			}

    			if (dirty[0] & /*state, unstyled*/ 3) {
    				toggle_class(div2, "wrap", !/*unstyled*/ ctx[0]);
    			}

    			if (!current || dirty[0] & /*state*/ 2 && div3_class_value !== (div3_class_value = "" + (null_to_empty(/*state*/ ctx[1].classBg) + " svelte-g4wg3a"))) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			if (!current || dirty[0] & /*cssBg*/ 64) {
    				attr_dev(div3, "style", /*cssBg*/ ctx[6]);
    			}

    			if (dirty[0] & /*state, unstyled*/ 3) {
    				toggle_class(div3, "bg", !/*unstyled*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*currentTransitionWindow*/ ctx[12], /*state*/ ctx[1].transitionWindowProps, true);
    				div1_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, /*currentTransitionBg*/ ctx[11], /*state*/ ctx[1].transitionBgProps, true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*currentTransitionWindow*/ ctx[12], /*state*/ ctx[1].transitionWindowProps, false);
    			div1_transition.run(0);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, /*currentTransitionBg*/ ctx[11], /*state*/ ctx[1].transitionBgProps, false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block) if_block.d();
    			if (switch_instance) destroy_component(switch_instance);
    			/*div1_binding*/ ctx[49](null);
    			if (detaching && div1_transition) div1_transition.end();
    			/*div2_binding*/ ctx[50](null);
    			/*div3_binding*/ ctx[51](null);
    			if (detaching && div3_transition) div3_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(423:0) {#if Component}",
    		ctx
    	});

    	return block;
    }

    // (454:8) {#if state.closeButton}
    function create_if_block_1$5(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2$4, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty[0] & /*state*/ 2) show_if = null;
    		if (show_if == null) show_if = !!/*isFunction*/ ctx[17](/*state*/ ctx[1].closeButton);
    		if (show_if) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx, [-1, -1, -1]);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(454:8) {#if state.closeButton}",
    		ctx
    	});

    	return block;
    }

    // (457:10) {:else}
    function create_else_block$3(ctx) {
    	let button;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*state*/ ctx[1].classCloseButton) + " svelte-g4wg3a"));
    			attr_dev(button, "aria-label", "Close modal");
    			attr_dev(button, "style", /*cssCloseButton*/ ctx[10]);
    			attr_dev(button, "type", "button");
    			toggle_class(button, "close", !/*unstyled*/ ctx[0]);
    			add_location(button, file$r, 457, 12, 11603);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*close*/ ctx[18], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*state*/ 2 && button_class_value !== (button_class_value = "" + (null_to_empty(/*state*/ ctx[1].classCloseButton) + " svelte-g4wg3a"))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty[0] & /*cssCloseButton*/ 1024) {
    				attr_dev(button, "style", /*cssCloseButton*/ ctx[10]);
    			}

    			if (dirty[0] & /*state, unstyled*/ 3) {
    				toggle_class(button, "close", !/*unstyled*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(457:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (455:10) {#if isFunction(state.closeButton)}
    function create_if_block_2$4(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*state*/ ctx[1].closeButton;

    	function switch_props(ctx) {
    		return {
    			props: { onClose: /*close*/ ctx[18] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*state*/ ctx[1].closeButton)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
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
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(455:10) {#if isFunction(state.closeButton)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$r(ctx) {
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*Component*/ ctx[2] && create_if_block$9(ctx);
    	const default_slot_template = /*#slots*/ ctx[48].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[47], null);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window_1, "keydown", /*handleKeydown*/ ctx[19], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*Component*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*Component*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$9(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 65536)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[47],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[47])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[47], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
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

    function bind(Component, props = {}) {
    	return function ModalComponent(options) {
    		return new Component({
    				...options,
    				props: { ...props, ...options.props }
    			});
    	};
    }

    function instance$r($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modal', slots, ['default']);
    	const dispatch = createEventDispatcher();
    	const baseSetContext = setContext;

    	/**
     * A basic function that checks if a node is tabbale
     */
    	const baseIsTabbable = node => node.tabIndex >= 0 && !node.hidden && !node.disabled && node.style.display !== 'none' && node.type !== 'hidden' && Boolean(node.offsetWidth || node.offsetHeight || node.getClientRects().length);

    	let { isTabbable = baseIsTabbable } = $$props;
    	let { show = null } = $$props;
    	let { key = 'simple-modal' } = $$props;
    	let { ariaLabel = null } = $$props;
    	let { ariaLabelledBy = null } = $$props;
    	let { closeButton = true } = $$props;
    	let { closeOnEsc = true } = $$props;
    	let { closeOnOuterClick = true } = $$props;
    	let { styleBg = {} } = $$props;
    	let { styleWindowWrap = {} } = $$props;
    	let { styleWindow = {} } = $$props;
    	let { styleContent = {} } = $$props;
    	let { styleCloseButton = {} } = $$props;
    	let { classBg = null } = $$props;
    	let { classWindowWrap = null } = $$props;
    	let { classWindow = null } = $$props;
    	let { classContent = null } = $$props;
    	let { classCloseButton = null } = $$props;
    	let { unstyled = false } = $$props;
    	let { setContext: setContext$1 = baseSetContext } = $$props;
    	let { transitionBg = fade } = $$props;
    	let { transitionBgProps = { duration: 250 } } = $$props;
    	let { transitionWindow = transitionBg } = $$props;
    	let { transitionWindowProps = transitionBgProps } = $$props;
    	let { disableFocusTrap = false } = $$props;

    	const defaultState = {
    		ariaLabel,
    		ariaLabelledBy,
    		closeButton,
    		closeOnEsc,
    		closeOnOuterClick,
    		styleBg,
    		styleWindowWrap,
    		styleWindow,
    		styleContent,
    		styleCloseButton,
    		classBg,
    		classWindowWrap,
    		classWindow,
    		classContent,
    		classCloseButton,
    		transitionBg,
    		transitionBgProps,
    		transitionWindow,
    		transitionWindowProps,
    		disableFocusTrap,
    		isTabbable,
    		unstyled
    	};

    	let state = { ...defaultState };
    	let Component = null;
    	let background;
    	let wrap;
    	let modalWindow;
    	let scrollY;
    	let cssBg;
    	let cssWindowWrap;
    	let cssWindow;
    	let cssContent;
    	let cssCloseButton;
    	let currentTransitionBg;
    	let currentTransitionWindow;
    	let prevBodyPosition;
    	let prevBodyOverflow;
    	let prevBodyWidth;
    	let outerClickTarget;
    	const camelCaseToDash = str => str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();

    	const toCssString = props => props
    	? Object.keys(props).reduce((str, key) => `${str}; ${camelCaseToDash(key)}: ${props[key]}`, '')
    	: '';

    	const isFunction = f => !!(f && f.constructor && f.call && f.apply);

    	const updateStyleTransition = () => {
    		$$invalidate(6, cssBg = toCssString(Object.assign(
    			{},
    			{
    				width: window.innerWidth,
    				height: window.innerHeight
    			},
    			state.styleBg
    		)));

    		$$invalidate(7, cssWindowWrap = toCssString(state.styleWindowWrap));
    		$$invalidate(8, cssWindow = toCssString(state.styleWindow));
    		$$invalidate(9, cssContent = toCssString(state.styleContent));
    		$$invalidate(10, cssCloseButton = toCssString(state.styleCloseButton));
    		$$invalidate(11, currentTransitionBg = state.transitionBg);
    		$$invalidate(12, currentTransitionWindow = state.transitionWindow);
    	};

    	const toVoid = () => {
    		
    	};

    	let onOpen = toVoid;
    	let onClose = toVoid;
    	let onOpened = toVoid;
    	let onClosed = toVoid;

    	const open = (NewComponent, newProps = {}, options = {}, callback = {}) => {
    		$$invalidate(2, Component = bind(NewComponent, newProps));
    		$$invalidate(1, state = { ...defaultState, ...options });
    		updateStyleTransition();
    		disableScroll();

    		$$invalidate(13, onOpen = event => {
    			if (callback.onOpen) callback.onOpen(event);

    			/**
     * The open event is fired right before the modal opens
     * @event {void} open
     */
    			dispatch('open');

    			/**
     * The opening event is fired right before the modal opens
     * @event {void} opening
     * @deprecated Listen to the `open` event instead
     */
    			dispatch('opening'); // Deprecated. Do not use!
    		});

    		$$invalidate(14, onClose = event => {
    			if (callback.onClose) callback.onClose(event);

    			/**
     * The close event is fired right before the modal closes
     * @event {void} close
     */
    			dispatch('close');

    			/**
     * The closing event is fired right before the modal closes
     * @event {void} closing
     * @deprecated Listen to the `close` event instead
     */
    			dispatch('closing'); // Deprecated. Do not use!
    		});

    		$$invalidate(15, onOpened = event => {
    			if (callback.onOpened) callback.onOpened(event);

    			/**
     * The opened event is fired after the modal's opening transition
     * @event {void} opened
     */
    			dispatch('opened');
    		});

    		$$invalidate(16, onClosed = event => {
    			if (callback.onClosed) callback.onClosed(event);

    			/**
     * The closed event is fired after the modal's closing transition
     * @event {void} closed
     */
    			dispatch('closed');
    		});
    	};

    	const close = (callback = {}) => {
    		if (!Component) return;
    		$$invalidate(14, onClose = callback.onClose || onClose);
    		$$invalidate(16, onClosed = callback.onClosed || onClosed);
    		$$invalidate(2, Component = null);
    		enableScroll();
    	};

    	const handleKeydown = event => {
    		if (state.closeOnEsc && Component && event.key === 'Escape') {
    			event.preventDefault();
    			close();
    		}

    		if (Component && event.key === 'Tab' && !state.disableFocusTrap) {
    			// trap focus
    			const nodes = modalWindow.querySelectorAll('*');

    			const tabbable = Array.from(nodes).filter(state.isTabbable).sort((a, b) => a.tabIndex - b.tabIndex);
    			let index = tabbable.indexOf(document.activeElement);
    			if (index === -1 && event.shiftKey) index = 0;
    			index += tabbable.length + (event.shiftKey ? -1 : 1);
    			index %= tabbable.length;
    			tabbable[index].focus();
    			event.preventDefault();
    		}
    	};

    	const handleOuterMousedown = event => {
    		if (state.closeOnOuterClick && (event.target === background || event.target === wrap)) outerClickTarget = event.target;
    	};

    	const handleOuterMouseup = event => {
    		if (state.closeOnOuterClick && event.target === outerClickTarget) {
    			event.preventDefault();
    			close();
    		}
    	};

    	const disableScroll = () => {
    		scrollY = window.scrollY;
    		prevBodyPosition = document.body.style.position;
    		prevBodyOverflow = document.body.style.overflow;
    		prevBodyWidth = document.body.style.width;
    		document.body.style.position = 'fixed';
    		document.body.style.top = `-${scrollY}px`;
    		document.body.style.overflow = 'hidden';
    		document.body.style.width = '100%';
    	};

    	const enableScroll = () => {
    		document.body.style.position = prevBodyPosition || '';
    		document.body.style.top = '';
    		document.body.style.overflow = prevBodyOverflow || '';
    		document.body.style.width = prevBodyWidth || '';
    		window.scrollTo(0, scrollY);
    	};

    	setContext$1(key, { open, close });
    	let isMounted = false;

    	onDestroy(() => {
    		if (isMounted) close();
    	});

    	onMount(() => {
    		$$invalidate(46, isMounted = true);
    	});

    	const writable_props = [
    		'isTabbable',
    		'show',
    		'key',
    		'ariaLabel',
    		'ariaLabelledBy',
    		'closeButton',
    		'closeOnEsc',
    		'closeOnOuterClick',
    		'styleBg',
    		'styleWindowWrap',
    		'styleWindow',
    		'styleContent',
    		'styleCloseButton',
    		'classBg',
    		'classWindowWrap',
    		'classWindow',
    		'classContent',
    		'classCloseButton',
    		'unstyled',
    		'setContext',
    		'transitionBg',
    		'transitionBgProps',
    		'transitionWindow',
    		'transitionWindowProps',
    		'disableFocusTrap'
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			modalWindow = $$value;
    			$$invalidate(5, modalWindow);
    		});
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			wrap = $$value;
    			$$invalidate(4, wrap);
    		});
    	}

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			background = $$value;
    			$$invalidate(3, background);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('isTabbable' in $$props) $$invalidate(22, isTabbable = $$props.isTabbable);
    		if ('show' in $$props) $$invalidate(23, show = $$props.show);
    		if ('key' in $$props) $$invalidate(24, key = $$props.key);
    		if ('ariaLabel' in $$props) $$invalidate(25, ariaLabel = $$props.ariaLabel);
    		if ('ariaLabelledBy' in $$props) $$invalidate(26, ariaLabelledBy = $$props.ariaLabelledBy);
    		if ('closeButton' in $$props) $$invalidate(27, closeButton = $$props.closeButton);
    		if ('closeOnEsc' in $$props) $$invalidate(28, closeOnEsc = $$props.closeOnEsc);
    		if ('closeOnOuterClick' in $$props) $$invalidate(29, closeOnOuterClick = $$props.closeOnOuterClick);
    		if ('styleBg' in $$props) $$invalidate(30, styleBg = $$props.styleBg);
    		if ('styleWindowWrap' in $$props) $$invalidate(31, styleWindowWrap = $$props.styleWindowWrap);
    		if ('styleWindow' in $$props) $$invalidate(32, styleWindow = $$props.styleWindow);
    		if ('styleContent' in $$props) $$invalidate(33, styleContent = $$props.styleContent);
    		if ('styleCloseButton' in $$props) $$invalidate(34, styleCloseButton = $$props.styleCloseButton);
    		if ('classBg' in $$props) $$invalidate(35, classBg = $$props.classBg);
    		if ('classWindowWrap' in $$props) $$invalidate(36, classWindowWrap = $$props.classWindowWrap);
    		if ('classWindow' in $$props) $$invalidate(37, classWindow = $$props.classWindow);
    		if ('classContent' in $$props) $$invalidate(38, classContent = $$props.classContent);
    		if ('classCloseButton' in $$props) $$invalidate(39, classCloseButton = $$props.classCloseButton);
    		if ('unstyled' in $$props) $$invalidate(0, unstyled = $$props.unstyled);
    		if ('setContext' in $$props) $$invalidate(40, setContext$1 = $$props.setContext);
    		if ('transitionBg' in $$props) $$invalidate(41, transitionBg = $$props.transitionBg);
    		if ('transitionBgProps' in $$props) $$invalidate(42, transitionBgProps = $$props.transitionBgProps);
    		if ('transitionWindow' in $$props) $$invalidate(43, transitionWindow = $$props.transitionWindow);
    		if ('transitionWindowProps' in $$props) $$invalidate(44, transitionWindowProps = $$props.transitionWindowProps);
    		if ('disableFocusTrap' in $$props) $$invalidate(45, disableFocusTrap = $$props.disableFocusTrap);
    		if ('$$scope' in $$props) $$invalidate(47, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		bind,
    		svelte,
    		fade,
    		createEventDispatcher,
    		dispatch,
    		baseSetContext,
    		baseIsTabbable,
    		isTabbable,
    		show,
    		key,
    		ariaLabel,
    		ariaLabelledBy,
    		closeButton,
    		closeOnEsc,
    		closeOnOuterClick,
    		styleBg,
    		styleWindowWrap,
    		styleWindow,
    		styleContent,
    		styleCloseButton,
    		classBg,
    		classWindowWrap,
    		classWindow,
    		classContent,
    		classCloseButton,
    		unstyled,
    		setContext: setContext$1,
    		transitionBg,
    		transitionBgProps,
    		transitionWindow,
    		transitionWindowProps,
    		disableFocusTrap,
    		defaultState,
    		state,
    		Component,
    		background,
    		wrap,
    		modalWindow,
    		scrollY,
    		cssBg,
    		cssWindowWrap,
    		cssWindow,
    		cssContent,
    		cssCloseButton,
    		currentTransitionBg,
    		currentTransitionWindow,
    		prevBodyPosition,
    		prevBodyOverflow,
    		prevBodyWidth,
    		outerClickTarget,
    		camelCaseToDash,
    		toCssString,
    		isFunction,
    		updateStyleTransition,
    		toVoid,
    		onOpen,
    		onClose,
    		onOpened,
    		onClosed,
    		open,
    		close,
    		handleKeydown,
    		handleOuterMousedown,
    		handleOuterMouseup,
    		disableScroll,
    		enableScroll,
    		isMounted
    	});

    	$$self.$inject_state = $$props => {
    		if ('isTabbable' in $$props) $$invalidate(22, isTabbable = $$props.isTabbable);
    		if ('show' in $$props) $$invalidate(23, show = $$props.show);
    		if ('key' in $$props) $$invalidate(24, key = $$props.key);
    		if ('ariaLabel' in $$props) $$invalidate(25, ariaLabel = $$props.ariaLabel);
    		if ('ariaLabelledBy' in $$props) $$invalidate(26, ariaLabelledBy = $$props.ariaLabelledBy);
    		if ('closeButton' in $$props) $$invalidate(27, closeButton = $$props.closeButton);
    		if ('closeOnEsc' in $$props) $$invalidate(28, closeOnEsc = $$props.closeOnEsc);
    		if ('closeOnOuterClick' in $$props) $$invalidate(29, closeOnOuterClick = $$props.closeOnOuterClick);
    		if ('styleBg' in $$props) $$invalidate(30, styleBg = $$props.styleBg);
    		if ('styleWindowWrap' in $$props) $$invalidate(31, styleWindowWrap = $$props.styleWindowWrap);
    		if ('styleWindow' in $$props) $$invalidate(32, styleWindow = $$props.styleWindow);
    		if ('styleContent' in $$props) $$invalidate(33, styleContent = $$props.styleContent);
    		if ('styleCloseButton' in $$props) $$invalidate(34, styleCloseButton = $$props.styleCloseButton);
    		if ('classBg' in $$props) $$invalidate(35, classBg = $$props.classBg);
    		if ('classWindowWrap' in $$props) $$invalidate(36, classWindowWrap = $$props.classWindowWrap);
    		if ('classWindow' in $$props) $$invalidate(37, classWindow = $$props.classWindow);
    		if ('classContent' in $$props) $$invalidate(38, classContent = $$props.classContent);
    		if ('classCloseButton' in $$props) $$invalidate(39, classCloseButton = $$props.classCloseButton);
    		if ('unstyled' in $$props) $$invalidate(0, unstyled = $$props.unstyled);
    		if ('setContext' in $$props) $$invalidate(40, setContext$1 = $$props.setContext);
    		if ('transitionBg' in $$props) $$invalidate(41, transitionBg = $$props.transitionBg);
    		if ('transitionBgProps' in $$props) $$invalidate(42, transitionBgProps = $$props.transitionBgProps);
    		if ('transitionWindow' in $$props) $$invalidate(43, transitionWindow = $$props.transitionWindow);
    		if ('transitionWindowProps' in $$props) $$invalidate(44, transitionWindowProps = $$props.transitionWindowProps);
    		if ('disableFocusTrap' in $$props) $$invalidate(45, disableFocusTrap = $$props.disableFocusTrap);
    		if ('state' in $$props) $$invalidate(1, state = $$props.state);
    		if ('Component' in $$props) $$invalidate(2, Component = $$props.Component);
    		if ('background' in $$props) $$invalidate(3, background = $$props.background);
    		if ('wrap' in $$props) $$invalidate(4, wrap = $$props.wrap);
    		if ('modalWindow' in $$props) $$invalidate(5, modalWindow = $$props.modalWindow);
    		if ('scrollY' in $$props) scrollY = $$props.scrollY;
    		if ('cssBg' in $$props) $$invalidate(6, cssBg = $$props.cssBg);
    		if ('cssWindowWrap' in $$props) $$invalidate(7, cssWindowWrap = $$props.cssWindowWrap);
    		if ('cssWindow' in $$props) $$invalidate(8, cssWindow = $$props.cssWindow);
    		if ('cssContent' in $$props) $$invalidate(9, cssContent = $$props.cssContent);
    		if ('cssCloseButton' in $$props) $$invalidate(10, cssCloseButton = $$props.cssCloseButton);
    		if ('currentTransitionBg' in $$props) $$invalidate(11, currentTransitionBg = $$props.currentTransitionBg);
    		if ('currentTransitionWindow' in $$props) $$invalidate(12, currentTransitionWindow = $$props.currentTransitionWindow);
    		if ('prevBodyPosition' in $$props) prevBodyPosition = $$props.prevBodyPosition;
    		if ('prevBodyOverflow' in $$props) prevBodyOverflow = $$props.prevBodyOverflow;
    		if ('prevBodyWidth' in $$props) prevBodyWidth = $$props.prevBodyWidth;
    		if ('outerClickTarget' in $$props) outerClickTarget = $$props.outerClickTarget;
    		if ('onOpen' in $$props) $$invalidate(13, onOpen = $$props.onOpen);
    		if ('onClose' in $$props) $$invalidate(14, onClose = $$props.onClose);
    		if ('onOpened' in $$props) $$invalidate(15, onOpened = $$props.onOpened);
    		if ('onClosed' in $$props) $$invalidate(16, onClosed = $$props.onClosed);
    		if ('isMounted' in $$props) $$invalidate(46, isMounted = $$props.isMounted);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*show*/ 8388608 | $$self.$$.dirty[1] & /*isMounted*/ 32768) {
    			{
    				if (isMounted) {
    					if (isFunction(show)) {
    						open(show);
    					} else {
    						close();
    					}
    				}
    			}
    		}
    	};

    	return [
    		unstyled,
    		state,
    		Component,
    		background,
    		wrap,
    		modalWindow,
    		cssBg,
    		cssWindowWrap,
    		cssWindow,
    		cssContent,
    		cssCloseButton,
    		currentTransitionBg,
    		currentTransitionWindow,
    		onOpen,
    		onClose,
    		onOpened,
    		onClosed,
    		isFunction,
    		close,
    		handleKeydown,
    		handleOuterMousedown,
    		handleOuterMouseup,
    		isTabbable,
    		show,
    		key,
    		ariaLabel,
    		ariaLabelledBy,
    		closeButton,
    		closeOnEsc,
    		closeOnOuterClick,
    		styleBg,
    		styleWindowWrap,
    		styleWindow,
    		styleContent,
    		styleCloseButton,
    		classBg,
    		classWindowWrap,
    		classWindow,
    		classContent,
    		classCloseButton,
    		setContext$1,
    		transitionBg,
    		transitionBgProps,
    		transitionWindow,
    		transitionWindowProps,
    		disableFocusTrap,
    		isMounted,
    		$$scope,
    		slots,
    		div1_binding,
    		div2_binding,
    		div3_binding
    	];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$r,
    			create_fragment$r,
    			safe_not_equal,
    			{
    				isTabbable: 22,
    				show: 23,
    				key: 24,
    				ariaLabel: 25,
    				ariaLabelledBy: 26,
    				closeButton: 27,
    				closeOnEsc: 28,
    				closeOnOuterClick: 29,
    				styleBg: 30,
    				styleWindowWrap: 31,
    				styleWindow: 32,
    				styleContent: 33,
    				styleCloseButton: 34,
    				classBg: 35,
    				classWindowWrap: 36,
    				classWindow: 37,
    				classContent: 38,
    				classCloseButton: 39,
    				unstyled: 0,
    				setContext: 40,
    				transitionBg: 41,
    				transitionBgProps: 42,
    				transitionWindow: 43,
    				transitionWindowProps: 44,
    				disableFocusTrap: 45
    			},
    			null,
    			[-1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$r.name
    		});
    	}

    	get isTabbable() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isTabbable(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get show() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set show(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get key() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ariaLabel() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ariaLabel(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ariaLabelledBy() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ariaLabelledBy(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeButton() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeButton(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeOnEsc() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeOnEsc(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeOnOuterClick() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeOnOuterClick(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleBg() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleBg(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleWindowWrap() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleWindowWrap(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleWindow() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleWindow(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleContent() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleContent(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleCloseButton() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleCloseButton(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classBg() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classBg(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classWindowWrap() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classWindowWrap(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classWindow() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classWindow(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classContent() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classContent(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classCloseButton() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classCloseButton(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get unstyled() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set unstyled(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setContext() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set setContext(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionBg() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionBg(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionBgProps() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionBgProps(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionWindow() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionWindow(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionWindowProps() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionWindowProps(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disableFocusTrap() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disableFocusTrap(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Popup.svelte generated by Svelte v3.49.0 */

    const { console: console_1$f } = globals;
    const file$q = "src\\components\\Popup.svelte";

    // (23:8) <Button>
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
    		source: "(23:8) <Button>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$q(ctx) {
    	let p;
    	let t0;
    	let t1;
    	let form;
    	let table;
    	let tr0;
    	let th0;
    	let t3;
    	let td0;
    	let textarea;
    	let t4;
    	let tr1;
    	let th1;
    	let t6;
    	let td1;
    	let input;
    	let t7;
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
    			p = element("p");
    			t0 = text(/*roomId*/ ctx[0]);
    			t1 = space();
    			form = element("form");
    			table = element("table");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Description";
    			t3 = space();
    			td0 = element("td");
    			textarea = element("textarea");
    			t4 = space();
    			tr1 = element("tr");
    			th1 = element("th");
    			th1.textContent = "Cost";
    			t6 = space();
    			td1 = element("td");
    			input = element("input");
    			t7 = space();
    			create_component(button.$$.fragment);
    			add_location(p, file$q, 9, 0, 163);
    			add_location(th0, file$q, 13, 16, 311);
    			attr_dev(textarea, "cols", "50");
    			attr_dev(textarea, "rows", "5");
    			attr_dev(textarea, "name", "description");
    			attr_dev(textarea, "class", "form-control");
    			attr_dev(textarea, "placeholder", "Description");
    			add_location(textarea, file$q, 14, 20, 353);
    			add_location(td0, file$q, 14, 16, 349);
    			add_location(tr0, file$q, 12, 12, 289);
    			add_location(th1, file$q, 17, 16, 554);
    			attr_dev(input, "name", "cost");
    			attr_dev(input, "class", "form-control");
    			attr_dev(input, "placeholder", "Cost");
    			add_location(input, file$q, 18, 20, 589);
    			add_location(td1, file$q, 18, 16, 585);
    			add_location(tr1, file$q, 16, 12, 532);
    			attr_dev(table, "class", "table table=bordered");
    			add_location(table, file$q, 11, 8, 239);
    			add_location(form, file$q, 10, 4, 184);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, table);
    			append_dev(table, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t3);
    			append_dev(tr0, td0);
    			append_dev(td0, textarea);
    			set_input_value(textarea, /*postData*/ ctx[1].description);
    			append_dev(table, t4);
    			append_dev(table, tr1);
    			append_dev(tr1, th1);
    			append_dev(tr1, t6);
    			append_dev(tr1, td1);
    			append_dev(td1, input);
    			set_input_value(input, /*postData*/ ctx[1].cost);
    			append_dev(form, t7);
    			mount_component(button, form, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[3]),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[4]),
    					listen_dev(form, "submit", prevent_default(/*formHandler*/ ctx[2]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*roomId*/ 1) set_data_dev(t0, /*roomId*/ ctx[0]);

    			if (dirty & /*postData*/ 2) {
    				set_input_value(textarea, /*postData*/ ctx[1].description);
    			}

    			if (dirty & /*postData*/ 2 && input.value !== /*postData*/ ctx[1].cost) {
    				set_input_value(input, /*postData*/ ctx[1].cost);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 32) {
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
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(form);
    			destroy_component(button);
    			mounted = false;
    			run_all(dispose);
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
    	let postData;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Popup', slots, []);
    	let { roomId } = $$props;

    	const formHandler = () => {
    		console.log(roomId);
    	};

    	const writable_props = ['roomId'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$f.warn(`<Popup> was created with unknown prop '${key}'`);
    	});

    	function textarea_input_handler() {
    		postData.description = this.value;
    		$$invalidate(1, postData);
    	}

    	function input_input_handler() {
    		postData.cost = this.value;
    		$$invalidate(1, postData);
    	}

    	$$self.$$set = $$props => {
    		if ('roomId' in $$props) $$invalidate(0, roomId = $$props.roomId);
    	};

    	$$self.$capture_state = () => ({ Button, roomId, formHandler, postData });

    	$$self.$inject_state = $$props => {
    		if ('roomId' in $$props) $$invalidate(0, roomId = $$props.roomId);
    		if ('postData' in $$props) $$invalidate(1, postData = $$props.postData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(1, postData = {});
    	return [roomId, postData, formHandler, textarea_input_handler, input_input_handler];
    }

    class Popup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, { roomId: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Popup",
    			options,
    			id: create_fragment$q.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*roomId*/ ctx[0] === undefined && !('roomId' in props)) {
    			console_1$f.warn("<Popup> was created without expected prop 'roomId'");
    		}
    	}

    	get roomId() {
    		throw new Error("<Popup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set roomId(value) {
    		throw new Error("<Popup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\RoomTypeList.svelte generated by Svelte v3.49.0 */

    const { console: console_1$e } = globals;
    const file$p = "src\\components\\RoomTypeList.svelte";

    function get_each_context$d(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (64:8) {#each roomtypes as roomtype (roomtype.id)}
    function create_each_block$d(key_1, ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*roomtype*/ ctx[7].id + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*roomtype*/ ctx[7].room_type + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*roomtype*/ ctx[7].description + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*roomtype*/ ctx[7].cost + "";
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
    		return /*click_handler*/ ctx[5](/*roomtype*/ ctx[7]);
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
    			add_location(td0, file$p, 65, 16, 1665);
    			attr_dev(td1, "class", "svelte-16h66w7");
    			add_location(td1, file$p, 66, 16, 1705);
    			attr_dev(td2, "class", "svelte-16h66w7");
    			add_location(td2, file$p, 67, 16, 1752);
    			attr_dev(td3, "class", "svelte-16h66w7");
    			add_location(td3, file$p, 68, 16, 1801);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "btn btn-primary svelte-16h66w7");
    			add_location(button0, file$p, 71, 24, 1958);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn btn-primary-red svelte-16h66w7");
    			add_location(button1, file$p, 72, 24, 2078);
    			attr_dev(div, "class", "btn-group");
    			attr_dev(div, "role", "group");
    			attr_dev(div, "aria-label", "Basic example");
    			add_location(div, file$p, 70, 20, 1869);
    			attr_dev(td4, "class", "svelte-16h66w7");
    			add_location(td4, file$p, 69, 16, 1843);
    			add_location(tr, file$p, 64, 12, 1643);
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
    				dispose = [
    					listen_dev(
    						button0,
    						"click",
    						function () {
    							if (is_function(/*showModal*/ ctx[3](/*roomtype*/ ctx[7].id))) /*showModal*/ ctx[3](/*roomtype*/ ctx[7].id).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(button1, "click", prevent_default(click_handler), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*roomtypes*/ 1 && t0_value !== (t0_value = /*roomtype*/ ctx[7].id + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*roomtypes*/ 1 && t2_value !== (t2_value = /*roomtype*/ ctx[7].room_type + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*roomtypes*/ 1 && t4_value !== (t4_value = /*roomtype*/ ctx[7].description + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*roomtypes*/ 1 && t6_value !== (t6_value = /*roomtype*/ ctx[7].cost + "")) set_data_dev(t6, t6_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$d.name,
    		type: "each",
    		source: "(64:8) {#each roomtypes as roomtype (roomtype.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$p(ctx) {
    	let modal_1;
    	let t0;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t2;
    	let th1;
    	let t4;
    	let th2;
    	let t6;
    	let th3;
    	let t8;
    	let th4;
    	let t10;
    	let tbody;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;

    	modal_1 = new Modal({
    			props: { show: /*$modal*/ ctx[1] },
    			$$inline: true
    		});

    	let each_value = /*roomtypes*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*roomtype*/ ctx[7].id;
    	validate_each_keys(ctx, each_value, get_each_context$d, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$d(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$d(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			create_component(modal_1.$$.fragment);
    			t0 = space();
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "id";
    			t2 = space();
    			th1 = element("th");
    			th1.textContent = "Room Type";
    			t4 = space();
    			th2 = element("th");
    			th2.textContent = "Description";
    			t6 = space();
    			th3 = element("th");
    			th3.textContent = "Cost";
    			t8 = space();
    			th4 = element("th");
    			th4.textContent = "Actions";
    			t10 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(th0, "class", "svelte-16h66w7");
    			add_location(th0, file$p, 55, 12, 1400);
    			attr_dev(th1, "class", "svelte-16h66w7");
    			add_location(th1, file$p, 56, 12, 1425);
    			attr_dev(th2, "class", "svelte-16h66w7");
    			add_location(th2, file$p, 57, 12, 1457);
    			attr_dev(th3, "class", "svelte-16h66w7");
    			add_location(th3, file$p, 58, 12, 1491);
    			attr_dev(th4, "class", "svelte-16h66w7");
    			add_location(th4, file$p, 59, 12, 1518);
    			add_location(tr, file$p, 54, 8, 1382);
    			add_location(thead, file$p, 53, 4, 1365);
    			add_location(tbody, file$p, 62, 4, 1569);
    			attr_dev(table, "class", "svelte-16h66w7");
    			add_location(table, file$p, 52, 0, 1352);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal_1, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t2);
    			append_dev(tr, th1);
    			append_dev(tr, t4);
    			append_dev(tr, th2);
    			append_dev(tr, t6);
    			append_dev(tr, th3);
    			append_dev(tr, t8);
    			append_dev(tr, th4);
    			append_dev(table, t10);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal_1_changes = {};
    			if (dirty & /*$modal*/ 2) modal_1_changes.show = /*$modal*/ ctx[1];
    			modal_1.$set(modal_1_changes);

    			if (dirty & /*deleteRoom, roomtypes, showModal*/ 25) {
    				each_value = /*roomtypes*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$d, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, tbody, destroy_block, create_each_block$d, null, get_each_context$d);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal_1, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(table);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
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

    function instance$p($$self, $$props, $$invalidate) {
    	let roomtypes;
    	let $modal;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RoomTypeList', slots, []);
    	const modal = writable(null);
    	validate_store(modal, 'modal');
    	component_subscribe($$self, modal, value => $$invalidate(1, $modal = value));
    	let getId;

    	const showModal = id => {
    		getId = id;
    		console.log(getId);
    		modal.set(Popup);
    	};

    	onMount(async () => {
    		const res = await fetch('https://ghwtjp.deta.dev/room-type/');
    		$$invalidate(0, roomtypes = await res.json());
    		console.log(roomtypes);
    	});

    	const deleteRoom = async id => {
    		await fetch(`https://ghwtjp.deta.dev/room-type/${id}/`, {
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

    	$$self.$capture_state = () => ({
    		onMount,
    		writable,
    		Modal,
    		Popup,
    		modal,
    		getId,
    		showModal,
    		deleteRoom,
    		roomtypes,
    		$modal
    	});

    	$$self.$inject_state = $$props => {
    		if ('getId' in $$props) getId = $$props.getId;
    		if ('roomtypes' in $$props) $$invalidate(0, roomtypes = $$props.roomtypes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(0, roomtypes = []);
    	return [roomtypes, $modal, modal, showModal, deleteRoom, click_handler];
    }

    class RoomTypeList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RoomTypeList",
    			options,
    			id: create_fragment$p.name
    		});
    	}
    }

    /* src\components\RoomType.svelte generated by Svelte v3.49.0 */
    const file$o = "src\\components\\RoomType.svelte";

    function create_fragment$o(ctx) {
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
    			add_location(button0, file$o, 14, 8, 401);
    			add_location(button1, file$o, 15, 8, 480);
    			attr_dev(div, "class", "butttons svelte-uaz3l8");
    			add_location(div, file$o, 13, 4, 369);
    			add_location(br0, file$o, 17, 4, 563);
    			add_location(br1, file$o, 18, 4, 573);
    			add_location(main, file$o, 12, 0, 357);
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
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RoomType', slots, []);
    	let { activeTab = RoomTypeList } = $$props;
    	const writable_props = ['activeTab'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<RoomType> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, activeTab = RoomTypeForm);
    	const click_handler_1 = () => $$invalidate(0, activeTab = RoomTypeList);

    	$$self.$$set = $$props => {
    		if ('activeTab' in $$props) $$invalidate(0, activeTab = $$props.activeTab);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		fade,
    		RoomTypeForm,
    		RoomTypeList,
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

    class RoomType extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, { activeTab: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RoomType",
    			options,
    			id: create_fragment$o.name
    		});
    	}

    	get activeTab() {
    		throw new Error("<RoomType>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeTab(value) {
    		throw new Error("<RoomType>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\shared\MiniCard.svelte generated by Svelte v3.49.0 */

    const file$n = "src\\components\\shared\\MiniCard.svelte";

    function create_fragment$n(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "card svelte-tgtrh9");
    			add_location(div, file$n, 0, 0, 0);
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
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MiniCard",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    /* src\components\Rooms.svelte generated by Svelte v3.49.0 */

    const { console: console_1$d } = globals;
    const file$m = "src\\components\\Rooms.svelte";

    function get_each_context$c(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (60:12) {#each roomTypes as roomType (roomType.id)}
    function create_each_block_1(key_1, ctx) {
    	let option;
    	let t_value = /*roomType*/ ctx[11].room_type + "";
    	let t;
    	let option_value_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*roomType*/ ctx[11].id;
    			option.value = option.__value;
    			add_location(option, file$m, 60, 16, 1684);
    			this.first = option;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*roomTypes*/ 2 && t_value !== (t_value = /*roomType*/ ctx[11].room_type + "")) set_data_dev(t, t_value);

    			if (dirty & /*roomTypes*/ 2 && option_value_value !== (option_value_value = /*roomType*/ ctx[11].id)) {
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
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(60:12) {#each roomTypes as roomType (roomType.id)}",
    		ctx
    	});

    	return block;
    }

    // (67:12) {#if room.available}
    function create_if_block$8(ctx) {
    	let if_block_anchor;
    	let if_block = /*room*/ ctx[8].room_typeid == /*room_select*/ ctx[2] && create_if_block_1$4(ctx);

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
    			if (/*room*/ ctx[8].room_typeid == /*room_select*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$4(ctx);
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
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(67:12) {#if room.available}",
    		ctx
    	});

    	return block;
    }

    // (68:12) {#if room.room_typeid == room_select}
    function create_if_block_1$4(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div2;
    	let div1;
    	let h5;
    	let t1;
    	let t2_value = /*room*/ ctx[8].room_name + "";
    	let t2;
    	let t3;
    	let p0;
    	let t4_value = /*room*/ ctx[8].room_type.description + "";
    	let t4;
    	let t5;
    	let p1;
    	let b;
    	let t6;
    	let t7_value = /*room*/ ctx[8].room_type.cost + "";
    	let t7;
    	let t8;
    	let t9;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			h5 = element("h5");
    			t1 = text("Room ");
    			t2 = text(t2_value);
    			t3 = space();
    			p0 = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			p1 = element("p");
    			b = element("b");
    			t6 = text("₦");
    			t7 = text(t7_value);
    			t8 = text("/day");
    			t9 = space();
    			if (!src_url_equal(img.src, img_src_value = "...")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "img-fluid rounded-start");
    			attr_dev(img, "alt", "...");
    			add_location(img, file$m, 71, 20, 2151);
    			attr_dev(div0, "class", "col-md-4");
    			add_location(div0, file$m, 70, 16, 2107);
    			attr_dev(h5, "class", "card-title");
    			add_location(h5, file$m, 75, 20, 2339);
    			attr_dev(p0, "class", "card-text");
    			add_location(p0, file$m, 76, 20, 2410);
    			add_location(b, file$m, 77, 41, 2506);
    			attr_dev(p1, "class", "card-text");
    			add_location(p1, file$m, 77, 20, 2485);
    			attr_dev(div1, "class", "card-body");
    			add_location(div1, file$m, 74, 20, 2294);
    			attr_dev(div2, "class", "col-md-8");
    			add_location(div2, file$m, 73, 16, 2250);
    			attr_dev(div3, "class", "row g-0");
    			add_location(div3, file$m, 69, 16, 2068);
    			attr_dev(div4, "class", "card mb-3");
    			set_style(div4, "max-width", "540px");
    			add_location(div4, file$m, 68, 12, 1947);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, img);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h5);
    			append_dev(h5, t1);
    			append_dev(h5, t2);
    			append_dev(div1, t3);
    			append_dev(div1, p0);
    			append_dev(p0, t4);
    			append_dev(div1, t5);
    			append_dev(div1, p1);
    			append_dev(p1, b);
    			append_dev(b, t6);
    			append_dev(b, t7);
    			append_dev(b, t8);
    			append_dev(div4, t9);

    			if (!mounted) {
    				dispose = listen_dev(
    					div4,
    					"click",
    					function () {
    						if (is_function(/*formHandler*/ ctx[3](/*room*/ ctx[8].id, /*room*/ ctx[8].room_type.cost))) /*formHandler*/ ctx[3](/*room*/ ctx[8].id, /*room*/ ctx[8].room_type.cost).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*rooms*/ 1 && t2_value !== (t2_value = /*room*/ ctx[8].room_name + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*rooms*/ 1 && t4_value !== (t4_value = /*room*/ ctx[8].room_type.description + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*rooms*/ 1 && t7_value !== (t7_value = /*room*/ ctx[8].room_type.cost + "")) set_data_dev(t7, t7_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(68:12) {#if room.room_typeid == room_select}",
    		ctx
    	});

    	return block;
    }

    // (66:8) {#each rooms as room (room.id)}
    function create_each_block$c(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let if_block = /*room*/ ctx[8].available && create_if_block$8(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*room*/ ctx[8].available) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$c.name,
    		type: "each",
    		source: "(66:8) {#each rooms as room (room.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let main;
    	let div;
    	let select;
    	let option;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let t1;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let mounted;
    	let dispose;
    	let each_value_1 = /*roomTypes*/ ctx[1];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*roomType*/ ctx[11].id;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
    	}

    	let each_value = /*rooms*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key_1 = ctx => /*room*/ ctx[8].id;
    	validate_each_keys(ctx, each_value, get_each_context$c, get_key_1);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$c(ctx, each_value, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block$c(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			select = element("select");
    			option = element("option");
    			option.textContent = "--- Select Room Type ---";

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = "--- Select Room Type ---";
    			option.value = option.__value;
    			add_location(option, file$m, 58, 12, 1568);
    			if (/*room_select*/ ctx[2] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[4].call(select));
    			add_location(select, file$m, 57, 8, 1521);
    			attr_dev(div, "class", "container text-center");
    			add_location(div, file$m, 56, 4, 1476);
    			add_location(main, file$m, 55, 0, 1464);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, select);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select, null);
    			}

    			select_option(select, /*room_select*/ ctx[2]);
    			append_dev(main, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(main, null);
    			}

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*roomTypes*/ 2) {
    				each_value_1 = /*roomTypes*/ ctx[1];
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, select, destroy_block, create_each_block_1, null, get_each_context_1);
    			}

    			if (dirty & /*room_select, roomTypes*/ 6) {
    				select_option(select, /*room_select*/ ctx[2]);
    			}

    			if (dirty & /*formHandler, rooms, room_select*/ 13) {
    				each_value = /*rooms*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$c, get_key_1);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, main, destroy_block, create_each_block$c, null, get_each_context$c);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			dispose();
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
    	let roomTypes;
    	let rooms;
    	let room_select;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Rooms', slots, []);
    	const dispatch = createEventDispatcher();
    	let errMsg = '';

    	onMount(async () => {
    		const res = await fetch('https://ghwtjp.deta.dev/room-type/');
    		$$invalidate(1, roomTypes = await res.json());
    		console.log(roomTypes);
    	});

    	onMount(async () => {
    		const res = await fetch('https://ghwtjp.deta.dev/room/');
    		$$invalidate(0, rooms = await res.json());
    		console.log(rooms);
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

    	function select_change_handler() {
    		room_select = select_value(this);
    		$$invalidate(2, room_select);
    		$$invalidate(1, roomTypes);
    	}

    	$$self.$capture_state = () => ({
    		axios,
    		onMount,
    		RoomType,
    		MiniCard,
    		Button,
    		createEventDispatcher,
    		get: get_store_value,
    		dispatch,
    		errMsg,
    		roomInfo,
    		formHandler,
    		rooms,
    		roomTypes,
    		room_select
    	});

    	$$self.$inject_state = $$props => {
    		if ('errMsg' in $$props) errMsg = $$props.errMsg;
    		if ('roomInfo' in $$props) roomInfo = $$props.roomInfo;
    		if ('rooms' in $$props) $$invalidate(0, rooms = $$props.rooms);
    		if ('roomTypes' in $$props) $$invalidate(1, roomTypes = $$props.roomTypes);
    		if ('room_select' in $$props) $$invalidate(2, room_select = $$props.room_select);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(1, roomTypes = '');
    	$$invalidate(0, rooms = '');
    	$$invalidate(2, room_select = '');
    	return [rooms, roomTypes, room_select, formHandler, select_change_handler];
    }

    class Rooms extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Rooms",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    /* src\components\Booking.svelte generated by Svelte v3.49.0 */

    const { console: console_1$c } = globals;
    const file$l = "src\\components\\Booking.svelte";

    // (95:4) <Button>
    function create_default_slot$b(ctx) {
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
    		id: create_default_slot$b.name,
    		type: "slot",
    		source: "(95:4) <Button>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
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
    	let t3;
    	let td1;
    	let div0;
    	let t4_value = /*err*/ ctx[1].chekin + "";
    	let t4;
    	let t5;
    	let tr2;
    	let th2;
    	let t7;
    	let td2;
    	let input1;
    	let t8;
    	let tr3;
    	let th3;
    	let t9;
    	let td3;
    	let div1;
    	let t10_value = /*err*/ ctx[1].checkout + "";
    	let t10;
    	let t11;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot$b] },
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
    			tr1 = element("tr");
    			th1 = element("th");
    			t3 = space();
    			td1 = element("td");
    			div0 = element("div");
    			t4 = text(t4_value);
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
    			t9 = space();
    			td3 = element("td");
    			div1 = element("div");
    			t10 = text(t10_value);
    			t11 = space();
    			create_component(button.$$.fragment);
    			add_location(th0, file$l, 77, 12, 1899);
    			attr_dev(input0, "type", "date");
    			attr_dev(input0, "name", "checkin date");
    			attr_dev(input0, "min", formatDate$1(new Date()));
    			attr_dev(input0, "class", "form-control");
    			add_location(input0, file$l, 78, 16, 1939);
    			add_location(td0, file$l, 78, 12, 1935);
    			add_location(tr0, file$l, 76, 8, 1881);
    			add_location(th1, file$l, 81, 12, 2108);
    			attr_dev(div0, "class", "errors");
    			add_location(div0, file$l, 82, 16, 2135);
    			add_location(td1, file$l, 82, 12, 2131);
    			add_location(tr1, file$l, 80, 8, 2090);
    			add_location(th2, file$l, 85, 12, 2221);
    			attr_dev(input1, "type", "date");
    			attr_dev(input1, "name", "checkout date");
    			attr_dev(input1, "min", formatDate$1(new Date()));
    			attr_dev(input1, "class", "form-control");
    			add_location(input1, file$l, 86, 16, 2262);
    			add_location(td2, file$l, 86, 12, 2258);
    			add_location(tr2, file$l, 84, 8, 2203);
    			add_location(th3, file$l, 89, 12, 2433);
    			attr_dev(div1, "class", "errors");
    			add_location(div1, file$l, 90, 16, 2460);
    			add_location(td3, file$l, 90, 12, 2456);
    			add_location(tr3, file$l, 88, 8, 2415);
    			attr_dev(table, "class", "table table=bordered");
    			add_location(table, file$l, 75, 4, 1835);
    			add_location(form, file$l, 74, 0, 1784);
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
    			append_dev(table, t2);
    			append_dev(table, tr1);
    			append_dev(tr1, th1);
    			append_dev(tr1, t3);
    			append_dev(tr1, td1);
    			append_dev(td1, div0);
    			append_dev(div0, t4);
    			append_dev(table, t5);
    			append_dev(table, tr2);
    			append_dev(tr2, th2);
    			append_dev(tr2, t7);
    			append_dev(tr2, td2);
    			append_dev(td2, input1);
    			set_input_value(input1, /*fields*/ ctx[0].chekout_date);
    			append_dev(table, t8);
    			append_dev(table, tr3);
    			append_dev(tr3, th3);
    			append_dev(tr3, t9);
    			append_dev(tr3, td3);
    			append_dev(td3, div1);
    			append_dev(div1, t10);
    			append_dev(form, t11);
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

    			if ((!current || dirty & /*err*/ 2) && t4_value !== (t4_value = /*err*/ ctx[1].chekin + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*fields*/ 1) {
    				set_input_value(input1, /*fields*/ ctx[0].chekout_date);
    			}

    			if ((!current || dirty & /*err*/ 2) && t10_value !== (t10_value = /*err*/ ctx[1].checkout + "")) set_data_dev(t10, t10_value);
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
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function formatDate$1(date) {
    	var d = new Date(date),
    		month = '' + (d.getMonth() + 1),
    		day = '' + d.getDate(),
    		year = d.getFullYear();

    	if (month.length < 2) month = '0' + month;
    	if (day.length < 2) day = '0' + day;
    	return [year, month, day].join('-');
    }

    function instance$l($$self, $$props, $$invalidate) {
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
    		let current_date = new Date(formatDate$1(new Date()));

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
    		Button,
    		onMount,
    		createEventDispatcher,
    		dispatch,
    		fields,
    		err,
    		valid,
    		formHandler,
    		formatDate: formatDate$1
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
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Booking",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /* src\components\RoomBooking.svelte generated by Svelte v3.49.0 */

    const { console: console_1$b } = globals;
    const file$k = "src\\components\\RoomBooking.svelte";

    // (108:35) 
    function create_if_block_3$2(ctx) {
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

    	button = new Button({
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
    			add_location(th0, file$k, 111, 12, 3030);
    			add_location(td0, file$k, 112, 12, 3057);
    			add_location(tr0, file$k, 110, 8, 3012);
    			add_location(th1, file$k, 115, 12, 3126);
    			add_location(td1, file$k, 116, 12, 3157);
    			add_location(tr1, file$k, 114, 8, 3108);
    			add_location(th2, file$k, 119, 12, 3234);
    			add_location(td2, file$k, 120, 12, 3266);
    			add_location(tr2, file$k, 118, 8, 3216);
    			add_location(th3, file$k, 123, 12, 3344);
    			add_location(td3, file$k, 124, 12, 3379);
    			add_location(tr3, file$k, 122, 8, 3326);
    			add_location(th4, file$k, 127, 12, 3456);
    			add_location(td4, file$k, 128, 12, 3493);
    			add_location(tr4, file$k, 126, 8, 3438);
    			attr_dev(table, "class", "table table=bordered");
    			add_location(table, file$k, 109, 4, 2966);
    			add_location(div, file$k, 132, 4, 3553);
    			add_location(form, file$k, 108, 0, 2915);
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
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(108:35) ",
    		ctx
    	});

    	return block;
    }

    // (106:44) 
    function create_if_block_2$3(ctx) {
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
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(106:44) ",
    		ctx
    	});

    	return block;
    }

    // (104:37) 
    function create_if_block_1$3(ctx) {
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
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(104:37) ",
    		ctx
    	});

    	return block;
    }

    // (102:0) {#if activeItem === 'Booking Details'}
    function create_if_block$7(ctx) {
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
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(102:0) {#if activeItem === 'Booking Details'}",
    		ctx
    	});

    	return block;
    }

    // (134:8) <Button>
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
    		source: "(134:8) <Button>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
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

    	const if_block_creators = [create_if_block$7, create_if_block_1$3, create_if_block_2$3, create_if_block_3$2];
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
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
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

    		const res = await fetch('https://ghwtjp.deta.dev/reservations/', {
    			method: 'POST',
    			headers: { "content-type": "application/json" },
    			body: JSON.stringify(postData)
    		});

    		const json = await res.json();
    		result = JSON.stringify(json);
    		console.log(postData);

    		try {
    			axios.patch(`https://ghwtjp.deta.dev/room/${postData.room_id}`, { available: false, checked: false });
    		} catch(e) {
    			console.log(e);
    		}

    		$$invalidate(0, activeItem = 'Personal Details');
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$b.warn(`<RoomBooking> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Tabs,
    		Customer,
    		Button,
    		Rooms,
    		Booking,
    		onMount,
    		axios,
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
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RoomBooking",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* src\components\Hall.svelte generated by Svelte v3.49.0 */
    const file$j = "src\\components\\Hall.svelte";

    // (91:8) <Button>
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
    		source: "(91:8) <Button>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
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
    	let t3;
    	let td1;
    	let div0;
    	let t4_value = /*err*/ ctx[1].chekin + "";
    	let t4;
    	let t5;
    	let tr2;
    	let th2;
    	let t7;
    	let td2;
    	let input1;
    	let t8;
    	let tr3;
    	let th3;
    	let t9;
    	let td3;
    	let div1;
    	let t10_value = /*err*/ ctx[1].checkout + "";
    	let t10;
    	let t11;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
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
    			th0.textContent = "Check-in Date";
    			t1 = space();
    			td0 = element("td");
    			input0 = element("input");
    			t2 = space();
    			tr1 = element("tr");
    			th1 = element("th");
    			t3 = space();
    			td1 = element("td");
    			div0 = element("div");
    			t4 = text(t4_value);
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
    			t9 = space();
    			td3 = element("td");
    			div1 = element("div");
    			t10 = text(t10_value);
    			t11 = space();
    			create_component(button.$$.fragment);
    			add_location(th0, file$j, 73, 16, 2019);
    			attr_dev(input0, "type", "date");
    			attr_dev(input0, "name", "checkin date");
    			attr_dev(input0, "min", /*disabledDates*/ ctx[2]());
    			attr_dev(input0, "class", "form-control");
    			add_location(input0, file$j, 74, 20, 2063);
    			add_location(td0, file$j, 74, 16, 2059);
    			add_location(tr0, file$j, 72, 12, 1997);
    			add_location(th1, file$j, 77, 16, 2237);
    			attr_dev(div0, "class", "errors");
    			add_location(div0, file$j, 78, 20, 2268);
    			add_location(td1, file$j, 78, 16, 2264);
    			add_location(tr1, file$j, 76, 12, 2215);
    			add_location(th2, file$j, 81, 16, 2366);
    			attr_dev(input1, "type", "date");
    			attr_dev(input1, "name", "checkout date");
    			attr_dev(input1, "class", "form-control");
    			add_location(input1, file$j, 82, 20, 2411);
    			add_location(td2, file$j, 82, 16, 2407);
    			add_location(tr2, file$j, 80, 12, 2344);
    			add_location(th3, file$j, 85, 16, 2565);
    			attr_dev(div1, "class", "errors");
    			add_location(div1, file$j, 86, 20, 2596);
    			add_location(td3, file$j, 86, 16, 2592);
    			add_location(tr3, file$j, 84, 12, 2543);
    			attr_dev(table, "class", "table table=bordered");
    			add_location(table, file$j, 71, 8, 1947);
    			add_location(form, file$j, 70, 4, 1892);
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
    			append_dev(table, t2);
    			append_dev(table, tr1);
    			append_dev(tr1, th1);
    			append_dev(tr1, t3);
    			append_dev(tr1, td1);
    			append_dev(td1, div0);
    			append_dev(div0, t4);
    			append_dev(table, t5);
    			append_dev(table, tr2);
    			append_dev(tr2, th2);
    			append_dev(tr2, t7);
    			append_dev(tr2, td2);
    			append_dev(td2, input1);
    			set_input_value(input1, /*fields*/ ctx[0].chekout_date);
    			append_dev(table, t8);
    			append_dev(table, tr3);
    			append_dev(tr3, th3);
    			append_dev(tr3, t9);
    			append_dev(tr3, td3);
    			append_dev(td3, div1);
    			append_dev(div1, t10);
    			append_dev(form, t11);
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
    			if (dirty & /*fields*/ 1) {
    				set_input_value(input0, /*fields*/ ctx[0].chekin_date);
    			}

    			if ((!current || dirty & /*err*/ 2) && t4_value !== (t4_value = /*err*/ ctx[1].chekin + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*fields*/ 1) {
    				set_input_value(input1, /*fields*/ ctx[0].chekout_date);
    			}

    			if ((!current || dirty & /*err*/ 2) && t10_value !== (t10_value = /*err*/ ctx[1].checkout + "")) set_data_dev(t10, t10_value);
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
    		id: create_fragment$j.name,
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

    function instance$j($$self, $$props, $$invalidate) {
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

    	let fields = {
    		chekin_date: '',
    		chekout_date: '',
    		hall_id: '',
    		price: '',
    		total_days: '',
    		total_price: ''
    	};

    	let err = { chekin: '', checkout: '' };
    	let valid = false;

    	const formHandler = () => {
    		valid = true;

    		//validate booking
    		new Date(formatDate(new Date()));

    		let chekin = new Date(fields.chekin_date);
    		let checkout = new Date(fields.chekout_date);
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

    		if (valid) {
    			let bookinginfo = { ...fields };
    			dispatch('add', bookinginfo);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Hall> was created with unknown prop '${key}'`);
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
    		Button,
    		onMount,
    		createEventDispatcher,
    		dispatch,
    		disabledDates,
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

    	return [
    		fields,
    		err,
    		disabledDates,
    		formHandler,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class Hall extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hall",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src\components\HallSelect.svelte generated by Svelte v3.49.0 */
    const file$i = "src\\components\\HallSelect.svelte";

    function get_each_context$b(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (32:12) {#if !hall.booked}
    function create_if_block$6(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div2;
    	let div1;
    	let h5;
    	let t1_value = /*hall*/ ctx[4].hall_name + "";
    	let t1;
    	let t2;
    	let p0;
    	let t3_value = /*hall*/ ctx[4].seats + "";
    	let t3;
    	let t4;
    	let t5;
    	let p1;
    	let b;
    	let t6;
    	let t7_value = /*hall*/ ctx[4].cost + "";
    	let t7;
    	let t8;
    	let t9;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			h5 = element("h5");
    			t1 = text(t1_value);
    			t2 = space();
    			p0 = element("p");
    			t3 = text(t3_value);
    			t4 = text(" Seats");
    			t5 = space();
    			p1 = element("p");
    			b = element("b");
    			t6 = text("₦");
    			t7 = text(t7_value);
    			t8 = text("/day");
    			t9 = space();
    			if (!src_url_equal(img.src, img_src_value = "...")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "img-fluid rounded-start");
    			attr_dev(img, "alt", "...");
    			add_location(img, file$i, 35, 20, 972);
    			attr_dev(div0, "class", "col-md-4");
    			add_location(div0, file$i, 34, 16, 928);
    			attr_dev(h5, "class", "card-title");
    			add_location(h5, file$i, 39, 20, 1160);
    			attr_dev(p0, "class", "card-text");
    			add_location(p0, file$i, 40, 20, 1226);
    			add_location(b, file$i, 41, 41, 1312);
    			attr_dev(p1, "class", "card-text");
    			add_location(p1, file$i, 41, 20, 1291);
    			attr_dev(div1, "class", "card-body");
    			add_location(div1, file$i, 38, 20, 1115);
    			attr_dev(div2, "class", "col-md-8");
    			add_location(div2, file$i, 37, 16, 1071);
    			attr_dev(div3, "class", "row g-0");
    			add_location(div3, file$i, 33, 16, 889);
    			attr_dev(div4, "class", "card mb-3");
    			set_style(div4, "max-width", "540px");
    			add_location(div4, file$i, 32, 12, 778);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, img);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h5);
    			append_dev(h5, t1);
    			append_dev(div1, t2);
    			append_dev(div1, p0);
    			append_dev(p0, t3);
    			append_dev(p0, t4);
    			append_dev(div1, t5);
    			append_dev(div1, p1);
    			append_dev(p1, b);
    			append_dev(b, t6);
    			append_dev(b, t7);
    			append_dev(b, t8);
    			append_dev(div4, t9);

    			if (!mounted) {
    				dispose = listen_dev(
    					div4,
    					"click",
    					function () {
    						if (is_function(/*formHandler*/ ctx[1](/*hall*/ ctx[4].id, /*hall*/ ctx[4].cost))) /*formHandler*/ ctx[1](/*hall*/ ctx[4].id, /*hall*/ ctx[4].cost).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*halls*/ 1 && t1_value !== (t1_value = /*hall*/ ctx[4].hall_name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*halls*/ 1 && t3_value !== (t3_value = /*hall*/ ctx[4].seats + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*halls*/ 1 && t7_value !== (t7_value = /*hall*/ ctx[4].cost + "")) set_data_dev(t7, t7_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(32:12) {#if !hall.booked}",
    		ctx
    	});

    	return block;
    }

    // (31:8) {#each halls as hall (hall.id)}
    function create_each_block$b(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let if_block = !/*hall*/ ctx[4].booked && create_if_block$6(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (!/*hall*/ ctx[4].booked) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$b.name,
    		type: "each",
    		source: "(31:8) {#each halls as hall (hall.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let main;
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*halls*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*hall*/ ctx[4].id;
    	validate_each_keys(ctx, each_value, get_each_context$b, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$b(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$b(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "container text-center");
    			add_location(div, file$i, 29, 4, 656);
    			add_location(main, file$i, 28, 0, 644);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*formHandler, halls*/ 3) {
    				each_value = /*halls*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$b, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block$b, null, get_each_context$b);
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
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let halls;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HallSelect', slots, []);
    	const dispatch = createEventDispatcher();

    	onMount(async () => {
    		const res = await fetch('https://ghwtjp.deta.dev/hall/');
    		$$invalidate(0, halls = await res.json());
    	});

    	let hallInfo = { id: '', price: '' };

    	const formHandler = (id, price) => {
    		hallInfo.id = id;
    		hallInfo.price = price;
    		dispatch('add', hallInfo);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HallSelect> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		axios,
    		onMount,
    		Button,
    		createEventDispatcher,
    		get: get_store_value,
    		dispatch,
    		hallInfo,
    		formHandler,
    		halls
    	});

    	$$self.$inject_state = $$props => {
    		if ('hallInfo' in $$props) hallInfo = $$props.hallInfo;
    		if ('halls' in $$props) $$invalidate(0, halls = $$props.halls);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(0, halls = '');
    	return [halls, formHandler];
    }

    class HallSelect extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HallSelect",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src\components\HallBooking.svelte generated by Svelte v3.49.0 */

    const { console: console_1$a } = globals;
    const file$h = "src\\components\\HallBooking.svelte";

    // (97:39) 
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

    	button = new Button({
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
    			add_location(th0, file$h, 100, 16, 2796);
    			add_location(td0, file$h, 101, 16, 2827);
    			add_location(tr0, file$h, 99, 12, 2774);
    			add_location(th1, file$h, 104, 16, 2908);
    			add_location(td1, file$h, 105, 16, 2943);
    			add_location(tr1, file$h, 103, 12, 2886);
    			add_location(th2, file$h, 108, 16, 3032);
    			add_location(td2, file$h, 109, 16, 3068);
    			add_location(tr2, file$h, 107, 12, 3010);
    			add_location(th3, file$h, 112, 16, 3158);
    			add_location(td3, file$h, 113, 16, 3197);
    			add_location(tr3, file$h, 111, 12, 3136);
    			add_location(th4, file$h, 116, 16, 3286);
    			add_location(td4, file$h, 117, 16, 3327);
    			add_location(tr4, file$h, 115, 12, 3264);
    			attr_dev(table, "class", "table table=bordered");
    			add_location(table, file$h, 98, 8, 2724);
    			add_location(div, file$h, 121, 8, 3403);
    			add_location(form, file$h, 97, 4, 2669);
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
    				dispose = listen_dev(form, "submit", prevent_default(/*formHandler*/ ctx[3]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*guestArray*/ 4) && t2_value !== (t2_value = /*guestArray*/ ctx[2].name + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*bookinginfo*/ 2) && t6_value !== (t6_value = /*bookinginfo*/ ctx[1].chekin_date + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty & /*bookinginfo*/ 2) && t10_value !== (t10_value = /*bookinginfo*/ ctx[1].chekout_date + "")) set_data_dev(t10, t10_value);
    			if ((!current || dirty & /*bookinginfo*/ 2) && t14_value !== (t14_value = /*bookinginfo*/ ctx[1].total_price + "")) set_data_dev(t14, t14_value);
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
    			destroy_component(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(97:39) ",
    		ctx
    	});

    	return block;
    }

    // (95:48) 
    function create_if_block_2$2(ctx) {
    	let customer;
    	let current;
    	customer = new Customer({ $$inline: true });
    	customer.$on("add", /*getguests*/ ctx[7]);

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
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(95:48) ",
    		ctx
    	});

    	return block;
    }

    // (93:37) 
    function create_if_block_1$2(ctx) {
    	let hallselect;
    	let current;
    	hallselect = new HallSelect({ $$inline: true });
    	hallselect.$on("add", /*getHallInfo*/ ctx[6]);

    	const block = {
    		c: function create() {
    			create_component(hallselect.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(hallselect, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hallselect.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hallselect.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(hallselect, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(93:37) ",
    		ctx
    	});

    	return block;
    }

    // (91:4) {#if activeItem === 'Booking'}
    function create_if_block$5(ctx) {
    	let hall;
    	let current;
    	hall = new Hall({ $$inline: true });
    	hall.$on("add", /*handleAdd*/ ctx[5]);

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
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(91:4) {#if activeItem === 'Booking'}",
    		ctx
    	});

    	return block;
    }

    // (123:12) <Button>
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
    		source: "(123:12) <Button>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let tabs;
    	let t;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	tabs = new Tabs({
    			props: {
    				items: /*items*/ ctx[4],
    				activeItem: /*activeItem*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const if_block_creators = [create_if_block$5, create_if_block_1$2, create_if_block_2$2, create_if_block_3$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*activeItem*/ ctx[0] === 'Booking') return 0;
    		if (/*activeItem*/ ctx[0] === 'Halls') return 1;
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
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let guests;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HallBooking', slots, []);

    	onMount(async () => {
    		const res = await fetch('http://localhost:8000/guest/');
    		guests = await res.json();
    	});

    	let postData = {
    		checkin_date: '',
    		checkout_date: '',
    		guest_id: '',
    		hall_id: '',
    		total_price: '',
    		payment_status: ''
    	};

    	let result;
    	let errMsg;

    	const formHandler = () => {
    		postData.checkin_date = bookinginfo.chekin_date;
    		postData.checkout_date = bookinginfo.chekout_date;
    		postData.guest_id = bookinginfo.guest_id;
    		postData.hall_id = bookinginfo.hall_id;
    		postData.total_price = bookinginfo.total_price;
    		postData.payment_status = false;

    		try {
    			axios.post('https://ghwtjp.deta.dev/reservations-hall/', postData);
    			console.log(postData);
    		} catch(e) {
    			errMsg = e;
    			console.log(errMsg);
    		}
    	};

    	let items = ['Personal Details', 'Booking', 'Halls', 'Summary'];
    	let activeItem = 'Personal Details';
    	let bookinginfo;

    	const handleAdd = e => {
    		$$invalidate(1, bookinginfo = e.detail);
    		$$invalidate(0, activeItem = 'Halls');
    	};

    	const getHallInfo = e => {
    		$$invalidate(1, bookinginfo.hall_id = e.detail.id, bookinginfo);
    		$$invalidate(1, bookinginfo.price = e.detail.price, bookinginfo);
    		$$invalidate(1, bookinginfo.total_price = bookinginfo.price * bookinginfo.total_days, bookinginfo);

    		for (let i = 0; i < guests.length; i++) {
    			if (guests[i].phone_no === guestArray.phone_no) {
    				$$invalidate(1, bookinginfo.guest_id = guests[i].id, bookinginfo);
    			}
    		}

    		console.log(bookinginfo);
    		$$invalidate(0, activeItem = 'Summary');
    	};

    	let guestArray;

    	const getguests = e => {
    		$$invalidate(2, guestArray = e.detail);
    		console.log(guestArray);
    		$$invalidate(0, activeItem = 'Booking');
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$a.warn(`<HallBooking> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		axios,
    		Tabs,
    		Customer,
    		Button,
    		Hall,
    		HallSelect,
    		postData,
    		result,
    		errMsg,
    		formHandler,
    		items,
    		activeItem,
    		bookinginfo,
    		handleAdd,
    		getHallInfo,
    		guestArray,
    		getguests,
    		guests
    	});

    	$$self.$inject_state = $$props => {
    		if ('postData' in $$props) postData = $$props.postData;
    		if ('result' in $$props) result = $$props.result;
    		if ('errMsg' in $$props) errMsg = $$props.errMsg;
    		if ('items' in $$props) $$invalidate(4, items = $$props.items);
    		if ('activeItem' in $$props) $$invalidate(0, activeItem = $$props.activeItem);
    		if ('bookinginfo' in $$props) $$invalidate(1, bookinginfo = $$props.bookinginfo);
    		if ('guestArray' in $$props) $$invalidate(2, guestArray = $$props.guestArray);
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
    		formHandler,
    		items,
    		handleAdd,
    		getHallInfo,
    		getguests
    	];
    }

    class HallBooking extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HallBooking",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src\components\Login.svelte generated by Svelte v3.49.0 */

    const { console: console_1$9 } = globals;
    const file$g = "src\\components\\Login.svelte";

    // (42:0) {#if activeItem === 'Login'}
    function create_if_block$4(ctx) {
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
    	let div;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot$7] },
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
    			th0.textContent = "Username";
    			t1 = space();
    			td0 = element("td");
    			input0 = element("input");
    			t2 = space();
    			tr1 = element("tr");
    			th1 = element("th");
    			th1.textContent = "Password";
    			t4 = space();
    			td1 = element("td");
    			input1 = element("input");
    			t5 = space();
    			div = element("div");
    			create_component(button.$$.fragment);
    			add_location(th0, file$g, 45, 12, 1306);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Username");
    			add_location(input0, file$g, 46, 16, 1341);
    			add_location(td0, file$g, 46, 12, 1337);
    			add_location(tr0, file$g, 44, 8, 1288);
    			add_location(th1, file$g, 49, 12, 1455);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "Password");
    			add_location(input1, file$g, 50, 16, 1490);
    			add_location(td1, file$g, 50, 12, 1486);
    			add_location(tr1, file$g, 48, 8, 1437);
    			attr_dev(table, "class", "table table=bordered");
    			add_location(table, file$g, 43, 4, 1242);
    			add_location(div, file$g, 54, 4, 1626);
    			add_location(form, file$g, 42, 0, 1191);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, table);
    			append_dev(table, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, td0);
    			append_dev(td0, input0);
    			set_input_value(input0, /*username*/ ctx[0]);
    			append_dev(table, t2);
    			append_dev(table, tr1);
    			append_dev(tr1, th1);
    			append_dev(tr1, t4);
    			append_dev(tr1, td1);
    			append_dev(td1, input1);
    			set_input_value(input1, /*password*/ ctx[1]);
    			append_dev(form, t5);
    			append_dev(form, div);
    			mount_component(button, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[7]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[8]),
    					listen_dev(
    						form,
    						"submit",
    						prevent_default(function () {
    							if (is_function(/*formHandler*/ ctx[3])) /*formHandler*/ ctx[3].apply(this, arguments);
    						}),
    						false,
    						true,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*username*/ 1 && input0.value !== /*username*/ ctx[0]) {
    				set_input_value(input0, /*username*/ ctx[0]);
    			}

    			if (dirty & /*password*/ 2 && input1.value !== /*password*/ ctx[1]) {
    				set_input_value(input1, /*password*/ ctx[1]);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 512) {
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
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(42:0) {#if activeItem === 'Login'}",
    		ctx
    	});

    	return block;
    }

    // (56:8) <Button>
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
    		source: "(56:8) <Button>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let tabs;
    	let t;
    	let if_block_anchor;
    	let current;

    	tabs = new Tabs({
    			props: {
    				items: /*items*/ ctx[4],
    				activeItem: /*activeItem*/ ctx[2]
    			},
    			$$inline: true
    		});

    	tabs.$on("tabChange", /*changeTab*/ ctx[5]);
    	let if_block = /*activeItem*/ ctx[2] === 'Login' && create_if_block$4(ctx);

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
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tabs_changes = {};
    			if (dirty & /*activeItem*/ 4) tabs_changes.activeItem = /*activeItem*/ ctx[2];
    			tabs.$set(tabs_changes);

    			if (/*activeItem*/ ctx[2] === 'Login') {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*activeItem*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
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
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	let formHandler;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Login', slots, []);
    	let items = ['Login', 'Register'];
    	let activeItem = 'Register';
    	let username = '', password = '';

    	const changeTab = e => {
    		$$invalidate(2, activeItem = e.detail);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$9.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		username = this.value;
    		$$invalidate(0, username);
    	}

    	function input1_input_handler() {
    		password = this.value;
    		$$invalidate(1, password);
    	}

    	$$self.$capture_state = () => ({
    		Button,
    		axios,
    		Tabs,
    		items,
    		activeItem,
    		username,
    		password,
    		changeTab,
    		formHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ('items' in $$props) $$invalidate(4, items = $$props.items);
    		if ('activeItem' in $$props) $$invalidate(2, activeItem = $$props.activeItem);
    		if ('username' in $$props) $$invalidate(0, username = $$props.username);
    		if ('password' in $$props) $$invalidate(1, password = $$props.password);
    		if ('formHandler' in $$props) $$invalidate(3, formHandler = $$props.formHandler);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*axios, username, password*/ 67) {
    			$$invalidate(3, formHandler = async () => {
    				const response = axios.post('http://localhost:8000/login/', { username, password }, { withCredentials: true });

    				if (response === 200) {
    					$$invalidate(6, axios.defaults.headers['Authorization'] = `Bearer ${response.data.token}`, axios);
    				}

    				/*const res = await fetch('http://localhost:8000/login/', {
        method: 'POST',
        headers : { 'Content-Type' : 'application/json'},
        body: JSON.stringify({username, password})
        
    })
    const json = await res.json()
    const result = JSON.stringify(json)
    console.log(result) */
    				console.log(username);

    				console.log(password);
    			});
    		}
    	};

    	return [
    		username,
    		password,
    		activeItem,
    		formHandler,
    		items,
    		changeTab,
    		axios,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src\components\AddBookings.svelte generated by Svelte v3.49.0 */

    const { console: console_1$8 } = globals;
    const file$f = "src\\components\\AddBookings.svelte";

    function get_each_context$a(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (39:20) {#each guests as guest (guest.id)}
    function create_each_block$a(key_1, ctx) {
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
    			add_location(option, file$f, 39, 24, 1060);
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
    		id: create_each_block$a.name,
    		type: "each",
    		source: "(39:20) {#each guests as guest (guest.id)}",
    		ctx
    	});

    	return block;
    }

    // (59:4) <Button>
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
    		source: "(59:4) <Button>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
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
    	validate_each_keys(ctx, each_value, get_each_context$a, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$a(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$a(key, child_ctx));
    	}

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot$6] },
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
    			add_location(th0, file$f, 35, 12, 879);
    			if (/*postData*/ ctx[0].guest_id === void 0) add_render_callback(() => /*select_change_handler*/ ctx[3].call(select));
    			add_location(select, file$f, 37, 16, 939);
    			add_location(td0, file$f, 36, 12, 917);
    			add_location(tr0, file$f, 34, 8, 861);
    			add_location(th1, file$f, 45, 12, 1224);
    			attr_dev(input0, "type", "date");
    			attr_dev(input0, "name", "checkin date");
    			attr_dev(input0, "class", "form-control");
    			add_location(input0, file$f, 46, 16, 1264);
    			add_location(td1, file$f, 46, 12, 1260);
    			add_location(tr1, file$f, 44, 8, 1206);
    			add_location(th2, file$f, 49, 12, 1373);
    			attr_dev(input1, "type", "date");
    			attr_dev(input1, "name", "checkout date");
    			attr_dev(input1, "class", "form-control");
    			add_location(input1, file$f, 50, 16, 1414);
    			add_location(td2, file$f, 50, 12, 1410);
    			add_location(tr2, file$f, 48, 8, 1355);
    			add_location(th3, file$f, 53, 12, 1524);
    			attr_dev(input2, "type", "date");
    			attr_dev(input2, "name", "checkin date");
    			attr_dev(input2, "class", "form-control");
    			add_location(input2, file$f, 54, 16, 1563);
    			add_location(td3, file$f, 54, 12, 1559);
    			add_location(tr3, file$f, 52, 8, 1506);
    			attr_dev(table, "class", "table table=bordered");
    			add_location(table, file$f, 33, 4, 815);
    			add_location(form, file$f, 32, 0, 764);
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
    				validate_each_keys(ctx, each_value, get_each_context$a, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, select, destroy_block, create_each_block$a, null, get_each_context$a);
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
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AddBookings', slots, []);

    	let postData = {
    		booking_date: '',
    		checkin_date: '',
    		checkout_date: ''
    	};

    	const formHandler = async () => {
    		const res = await fetch('https://ghwtjp.deta.dev/reservations/', {
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
    		const res = await fetch('https://ghwtjp.deta.dev/guest/');
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
    		Button,
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
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddBookings",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src\components\BookingsList.svelte generated by Svelte v3.49.0 */

    const { console: console_1$7 } = globals;
    const file$e = "src\\components\\BookingsList.svelte";

    function get_each_context$9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (41:28) {:else}
    function create_else_block$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Unpaid");
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
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(41:28) {:else}",
    		ctx
    	});

    	return block;
    }

    // (38:28) {#if booking.payment_status}
    function create_if_block$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Paid");
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
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(38:28) {#if booking.payment_status}",
    		ctx
    	});

    	return block;
    }

    // (29:16) {#each bookings as booking (booking.id)}
    function create_each_block$9(key_1, ctx) {
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
    	let t8_value = /*booking*/ ctx[1].guest.name + "";
    	let t8;
    	let t9;
    	let td5;
    	let t10_value = /*booking*/ ctx[1].total_price + "";
    	let t10;
    	let t11;
    	let td6;
    	let t12;

    	function select_block_type(ctx, dirty) {
    		if (/*booking*/ ctx[1].payment_status) return create_if_block$3;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

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
    			td5 = element("td");
    			t10 = text(t10_value);
    			t11 = space();
    			td6 = element("td");
    			if_block.c();
    			t12 = space();
    			attr_dev(td0, "class", "svelte-1r9fjkf");
    			add_location(td0, file$e, 30, 24, 861);
    			attr_dev(td1, "class", "svelte-1r9fjkf");
    			add_location(td1, file$e, 31, 24, 908);
    			attr_dev(td2, "class", "svelte-1r9fjkf");
    			add_location(td2, file$e, 32, 24, 965);
    			attr_dev(td3, "class", "svelte-1r9fjkf");
    			add_location(td3, file$e, 33, 24, 1022);
    			attr_dev(td4, "class", "svelte-1r9fjkf");
    			add_location(td4, file$e, 34, 24, 1080);
    			attr_dev(td5, "class", "svelte-1r9fjkf");
    			add_location(td5, file$e, 35, 24, 1135);
    			attr_dev(td6, "class", "svelte-1r9fjkf");
    			add_location(td6, file$e, 36, 24, 1191);
    			add_location(tr, file$e, 29, 20, 831);
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
    			append_dev(tr, td5);
    			append_dev(td5, t10);
    			append_dev(tr, t11);
    			append_dev(tr, td6);
    			if_block.m(td6, null);
    			append_dev(tr, t12);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*bookings*/ 1 && t0_value !== (t0_value = /*booking*/ ctx[1].id + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*bookings*/ 1 && t2_value !== (t2_value = /*booking*/ ctx[1].booking_date + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*bookings*/ 1 && t4_value !== (t4_value = /*booking*/ ctx[1].checkin_date + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*bookings*/ 1 && t6_value !== (t6_value = /*booking*/ ctx[1].checkout_date + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*bookings*/ 1 && t8_value !== (t8_value = /*booking*/ ctx[1].guest.name + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*bookings*/ 1 && t10_value !== (t10_value = /*booking*/ ctx[1].total_price + "")) set_data_dev(t10, t10_value);

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(td6, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$9.name,
    		type: "each",
    		source: "(29:16) {#each bookings as booking (booking.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
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
    	let th5;
    	let t11;
    	let th6;
    	let t13;
    	let tbody;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t14;
    	let br;
    	let each_value = /*bookings*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*booking*/ ctx[1].id;
    	validate_each_keys(ctx, each_value, get_each_context$9, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$9(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$9(key, child_ctx));
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
    			th4 = element("th");
    			th4.textContent = "Guest Name";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Total Price";
    			t11 = space();
    			th6 = element("th");
    			th6.textContent = "Payment Status";
    			t13 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t14 = space();
    			br = element("br");
    			attr_dev(th0, "class", "svelte-1r9fjkf");
    			add_location(th0, file$e, 18, 20, 414);
    			attr_dev(th1, "class", "svelte-1r9fjkf");
    			add_location(th1, file$e, 19, 20, 447);
    			attr_dev(th2, "class", "svelte-1r9fjkf");
    			add_location(th2, file$e, 20, 20, 490);
    			attr_dev(th3, "class", "svelte-1r9fjkf");
    			add_location(th3, file$e, 21, 20, 534);
    			attr_dev(th4, "class", "svelte-1r9fjkf");
    			add_location(th4, file$e, 22, 20, 579);
    			attr_dev(th5, "class", "svelte-1r9fjkf");
    			add_location(th5, file$e, 23, 20, 620);
    			attr_dev(th6, "class", "svelte-1r9fjkf");
    			add_location(th6, file$e, 24, 20, 662);
    			add_location(tr, file$e, 17, 16, 388);
    			add_location(thead, file$e, 16, 12, 363);
    			add_location(tbody, file$e, 27, 12, 744);
    			attr_dev(table, "class", "svelte-1r9fjkf");
    			add_location(table, file$e, 15, 8, 342);
    			add_location(br, file$e, 48, 8, 1538);
    			add_location(main, file$e, 14, 4, 326);
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
    			append_dev(tr, t9);
    			append_dev(tr, th5);
    			append_dev(tr, t11);
    			append_dev(tr, th6);
    			append_dev(table, t13);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(main, t14);
    			append_dev(main, br);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*bookings*/ 1) {
    				each_value = /*bookings*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$9, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, tbody, destroy_block, create_each_block$9, null, get_each_context$9);
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
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BookingsList', slots, []);
    	let bookings = [];

    	onMount(async () => {
    		const res = await fetch('https://ghwtjp.deta.dev/reservations/');
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
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BookingsList",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src\components\Bookings.svelte generated by Svelte v3.49.0 */
    const file$d = "src\\components\\Bookings.svelte";

    // (14:12) <Button>
    function create_default_slot$5(ctx) {
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
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(14:12) <Button>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let main;
    	let div0;
    	let button;
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
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot$5] },
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

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			create_component(button.$$.fragment);
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
    			attr_dev(div0, "class", "butttons svelte-uc0fzg");
    			add_location(div0, file$d, 12, 8, 250);
    			add_location(br0, file$d, 15, 8, 381);
    			add_location(br1, file$d, 16, 8, 395);
    			add_location(br2, file$d, 18, 8, 457);
    			add_location(div1, file$d, 19, 8, 471);
    			add_location(main, file$d, 11, 4, 234);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			mount_component(button, div0, null);
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
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

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
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(button);
    			if (switch_instance) destroy_component(switch_instance);
    			mounted = false;
    			run_all(dispose);
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
    		Button,
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
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bookings",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src\components\Guests.svelte generated by Svelte v3.49.0 */

    const { console: console_1$6 } = globals;
    const file$c = "src\\components\\Guests.svelte";

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (30:16) {#each persons as person (person.id)}
    function create_each_block$8(key_1, ctx) {
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
    			add_location(td0, file$c, 31, 24, 767);
    			attr_dev(td1, "class", "svelte-1mpehju");
    			add_location(td1, file$c, 32, 24, 813);
    			attr_dev(td2, "class", "svelte-1mpehju");
    			add_location(td2, file$c, 33, 24, 861);
    			attr_dev(td3, "class", "svelte-1mpehju");
    			add_location(td3, file$c, 34, 24, 912);
    			attr_dev(td4, "class", "svelte-1mpehju");
    			add_location(td4, file$c, 35, 24, 964);
    			add_location(tr, file$c, 30, 20, 737);
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
    		id: create_each_block$8.name,
    		type: "each",
    		source: "(30:16) {#each persons as person (person.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
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
    			add_location(th0, file$c, 21, 20, 432);
    			attr_dev(th1, "class", "svelte-1mpehju");
    			add_location(th1, file$c, 22, 20, 465);
    			attr_dev(th2, "class", "svelte-1mpehju");
    			add_location(th2, file$c, 23, 20, 500);
    			attr_dev(th3, "class", "svelte-1mpehju");
    			add_location(th3, file$c, 24, 20, 538);
    			attr_dev(th4, "class", "svelte-1mpehju");
    			add_location(th4, file$c, 25, 20, 581);
    			add_location(tr, file$c, 20, 16, 406);
    			add_location(thead, file$c, 19, 12, 381);
    			add_location(tbody, file$c, 28, 12, 653);
    			attr_dev(table, "class", "svelte-1mpehju");
    			add_location(table, file$c, 18, 8, 360);
    			add_location(main, file$c, 17, 4, 344);
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
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Guests', slots, []);
    	let persons;

    	onMount(async () => {
    		const res = await fetch('https://ghwtjp.deta.dev/guest/');
    		$$invalidate(0, persons = await res.json());
    		console.log(persons);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$6.warn(`<Guests> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, Button, persons });

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
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Guests",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\components\Home.svelte generated by Svelte v3.49.0 */

    const { console: console_1$5 } = globals;
    const file$b = "src\\components\\Home.svelte";

    // (30:8) <MiniCard>
    function create_default_slot_2(ctx) {
    	let h1;
    	let t0_value = /*rooms*/ ctx[0].length + "";
    	let t0;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			p.textContent = "Active Rooms";
    			add_location(h1, file$b, 30, 12, 654);
    			add_location(p, file$b, 31, 12, 691);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rooms*/ 1 && t0_value !== (t0_value = /*rooms*/ ctx[0].length + "")) set_data_dev(t0, t0_value);
    		},
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
    		source: "(30:8) <MiniCard>",
    		ctx
    	});

    	return block;
    }

    // (36:8) <MiniCard>
    function create_default_slot_1$1(ctx) {
    	let h1;
    	let t0_value = /*bookedrooms*/ ctx[1].length + "";
    	let t0;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			p.textContent = "Booked Rooms";
    			add_location(h1, file$b, 36, 12, 788);
    			add_location(p, file$b, 37, 12, 831);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*bookedrooms*/ 2 && t0_value !== (t0_value = /*bookedrooms*/ ctx[1].length + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(36:8) <MiniCard>",
    		ctx
    	});

    	return block;
    }

    // (42:8) <MiniCard>
    function create_default_slot$4(ctx) {
    	let h1;
    	let t0_value = /*freerooms*/ ctx[2].length + "";
    	let t0;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			p.textContent = "Available Rooms";
    			add_location(h1, file$b, 42, 12, 928);
    			add_location(p, file$b, 43, 12, 969);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*freerooms*/ 4 && t0_value !== (t0_value = /*freerooms*/ ctx[2].length + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(42:8) <MiniCard>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
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
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	minicard2 = new MiniCard({
    			props: {
    				$$slots: { default: [create_default_slot$4] },
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
    			add_location(div0, file$b, 28, 4, 615);
    			add_location(div1, file$b, 34, 4, 749);
    			add_location(div2, file$b, 40, 4, 889);
    			attr_dev(div3, "class", "main svelte-77rytz");
    			add_location(div3, file$b, 27, 0, 591);
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

    			if (dirty & /*$$scope, rooms*/ 9) {
    				minicard0_changes.$$scope = { dirty, ctx };
    			}

    			minicard0.$set(minicard0_changes);
    			const minicard1_changes = {};

    			if (dirty & /*$$scope, bookedrooms*/ 10) {
    				minicard1_changes.$$scope = { dirty, ctx };
    			}

    			minicard1.$set(minicard1_changes);
    			const minicard2_changes = {};

    			if (dirty & /*$$scope, freerooms*/ 12) {
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
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	let rooms = [];
    	let bookedrooms = [];
    	let freerooms = [];

    	onMount(async () => {
    		const res = await fetch('https://ghwtjp.deta.dev/room/');
    		$$invalidate(0, rooms = await res.json());
    		console.log(rooms);

    		for (let i = 0; i < rooms.length; i++) {
    			if (rooms[i].available == false) {
    				$$invalidate(1, bookedrooms = [...bookedrooms, rooms[i]]);
    			} else {
    				$$invalidate(2, freerooms = [...freerooms, rooms[i]]);
    			}
    		}

    		console.log(bookedrooms);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$5.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		MiniCard,
    		onMount,
    		rooms,
    		bookedrooms,
    		freerooms
    	});

    	$$self.$inject_state = $$props => {
    		if ('rooms' in $$props) $$invalidate(0, rooms = $$props.rooms);
    		if ('bookedrooms' in $$props) $$invalidate(1, bookedrooms = $$props.bookedrooms);
    		if ('freerooms' in $$props) $$invalidate(2, freerooms = $$props.freerooms);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [rooms, bookedrooms, freerooms];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$b.name
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

    /* node_modules\svelte-loading-spinners\dist\DoubleBounce.svelte generated by Svelte v3.49.0 */
    const file$a = "node_modules\\svelte-loading-spinners\\dist\\DoubleBounce.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (41:2) {#each range(2, 1) as version}
    function create_each_block$7(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "circle svelte-h1a2xs");

    			set_style(div, "animation", /*duration*/ ctx[2] + " " + (/*version*/ ctx[6] === 1
    			? `${(/*durationNum*/ ctx[5] - 0.1) / 2}${/*durationUnit*/ ctx[4]}`
    			: `0s`) + " infinite ease-in-out");

    			add_location(div, file$a, 41, 4, 936);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*duration*/ 4) {
    				set_style(div, "animation", /*duration*/ ctx[2] + " " + (/*version*/ ctx[6] === 1
    				? `${(/*durationNum*/ ctx[5] - 0.1) / 2}${/*durationUnit*/ ctx[4]}`
    				: `0s`) + " infinite ease-in-out");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(41:2) {#each range(2, 1) as version}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div;
    	let each_value = range(2, 1);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "wrapper svelte-h1a2xs");
    			set_style(div, "--size", /*size*/ ctx[3] + /*unit*/ ctx[1]);
    			set_style(div, "--color", /*color*/ ctx[0]);
    			add_location(div, file$a, 39, 0, 828);
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
    			if (dirty & /*duration, range, durationNum, durationUnit*/ 52) {
    				each_value = range(2, 1);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
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

    			if (dirty & /*color*/ 1) {
    				set_style(div, "--color", /*color*/ ctx[0]);
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
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DoubleBounce', slots, []);
    	let { color = "#FF3E00" } = $$props;
    	let { unit = "px" } = $$props;
    	let { duration = "2.1s" } = $$props;
    	let { size = "60" } = $$props;
    	let durationUnit = duration.match(durationUnitRegex)[0];
    	let durationNum = duration.replace(durationUnitRegex, "");
    	const writable_props = ['color', 'unit', 'duration', 'size'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DoubleBounce> was created with unknown prop '${key}'`);
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

    class DoubleBounce extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { color: 0, unit: 1, duration: 2, size: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DoubleBounce",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get color() {
    		throw new Error("<DoubleBounce>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<DoubleBounce>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get unit() {
    		throw new Error("<DoubleBounce>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set unit(value) {
    		throw new Error("<DoubleBounce>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<DoubleBounce>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<DoubleBounce>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<DoubleBounce>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<DoubleBounce>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-loading-spinners\dist\SyncLoader.svelte generated by Svelte v3.49.0 */
    const file$9 = "node_modules\\svelte-loading-spinners\\dist\\SyncLoader.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (61:2) {#each range(3, 1) as i}
    function create_each_block$6(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "dot svelte-14w6xk7");
    			set_style(div, "--dotSize", +/*size*/ ctx[3] * 0.25 + /*unit*/ ctx[1]);
    			set_style(div, "--color", /*color*/ ctx[0]);
    			set_style(div, "animation-delay", /*i*/ ctx[6] * (+/*durationNum*/ ctx[5] / 10) + /*durationUnit*/ ctx[4]);
    			add_location(div, file$9, 61, 4, 1491);
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
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(61:2) {#each range(3, 1) as i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;
    	let each_value = range(3, 1);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
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
    			add_location(div, file$9, 59, 0, 1383);
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
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
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
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { color: 0, unit: 1, duration: 2, size: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SyncLoader",
    			options,
    			id: create_fragment$9.name
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

    /* src\components\BookedRooms.svelte generated by Svelte v3.49.0 */

    const { console: console_1$4 } = globals;
    const file$8 = "src\\components\\BookedRooms.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (1:0) <script>  import axios from 'axios';  import { onMount }
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>  import axios from 'axios';  import { onMount }",
    		ctx
    	});

    	return block;
    }

    // (38:4) {:then rooms}
    function create_then_block(ctx) {
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
    	let th5;
    	let t11;
    	let tbody;
    	let current;
    	let each_value = /*rooms*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
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
    			th4.textContent = "Check-in";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Check-Out";
    			t11 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(th0, "class", "svelte-18cwia8");
    			add_location(th0, file$8, 41, 16, 936);
    			attr_dev(th1, "class", "svelte-18cwia8");
    			add_location(th1, file$8, 42, 16, 965);
    			attr_dev(th2, "class", "svelte-18cwia8");
    			add_location(th2, file$8, 43, 16, 1001);
    			attr_dev(th3, "class", "svelte-18cwia8");
    			add_location(th3, file$8, 44, 16, 1037);
    			attr_dev(th4, "class", "svelte-18cwia8");
    			add_location(th4, file$8, 45, 16, 1070);
    			attr_dev(th5, "class", "svelte-18cwia8");
    			add_location(th5, file$8, 46, 16, 1105);
    			add_location(tr, file$8, 40, 12, 914);
    			add_location(thead, file$8, 39, 8, 893);
    			add_location(tbody, file$8, 49, 8, 1170);
    			attr_dev(table, "class", "svelte-18cwia8");
    			add_location(table, file$8, 38, 4, 876);
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
    			append_dev(tr, t9);
    			append_dev(tr, th5);
    			append_dev(table, t11);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*checkOutRoom, rooms*/ 3) {
    				each_value = /*rooms*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tbody, null);
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

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(38:4) {:then rooms}",
    		ctx
    	});

    	return block;
    }

    // (61:24) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				inverse: true,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div, "class", "btn-group");
    			attr_dev(div, "role", "group");
    			attr_dev(div, "aria-label", "Basic example");
    			add_location(div, file$8, 61, 24, 1692);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button, div, null);
    			current = true;
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
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(61:24) {:else}",
    		ctx
    	});

    	return block;
    }

    // (57:24) {#if !room.available}
    function create_if_block_2$1(ctx) {
    	let div;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				inverse: true,
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div, "class", "btn-group");
    			attr_dev(div, "role", "group");
    			attr_dev(div, "aria-label", "Basic example");
    			add_location(div, file$8, 57, 24, 1477);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button, div, null);
    			current = true;
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
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(57:24) {#if !room.available}",
    		ctx
    	});

    	return block;
    }

    // (63:28) <Button inverse>
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Available");
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
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(63:28) <Button inverse>",
    		ctx
    	});

    	return block;
    }

    // (59:28) <Button inverse>
    function create_default_slot$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Booked");
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
    		source: "(59:28) <Button inverse>",
    		ctx
    	});

    	return block;
    }

    // (68:24) {#if !room.available && !room.checked}
    function create_if_block_1$1(ctx) {
    	let div;
    	let button;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[2](/*room*/ ctx[5]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Check-in";
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary-red svelte-18cwia8");
    			add_location(button, file$8, 69, 28, 2118);
    			attr_dev(div, "class", "btn-group");
    			attr_dev(div, "role", "group");
    			attr_dev(div, "aria-label", "Basic example");
    			add_location(div, file$8, 68, 24, 2025);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(click_handler), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(68:24) {#if !room.available && !room.checked}",
    		ctx
    	});

    	return block;
    }

    // (75:24) {#if room.checked}
    function create_if_block$2(ctx) {
    	let div;
    	let button;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[3](/*room*/ ctx[5]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Checkout";
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary-red svelte-18cwia8");
    			add_location(button, file$8, 76, 28, 2518);
    			attr_dev(div, "class", "btn-group");
    			attr_dev(div, "role", "group");
    			attr_dev(div, "aria-label", "Basic example");
    			add_location(div, file$8, 75, 24, 2425);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(click_handler_1), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(75:24) {#if room.checked}",
    		ctx
    	});

    	return block;
    }

    // (51:12) {#each rooms as room}
    function create_each_block$5(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*room*/ ctx[5].id + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*room*/ ctx[5].room_name + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*room*/ ctx[5].room_type.room_type + "";
    	let t4;
    	let t5;
    	let td3;
    	let current_block_type_index;
    	let if_block0;
    	let t6;
    	let td4;
    	let t7;
    	let td5;
    	let t8;
    	let current;
    	const if_block_creators = [create_if_block_2$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*room*/ ctx[5].available) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = !/*room*/ ctx[5].available && !/*room*/ ctx[5].checked && create_if_block_1$1(ctx);
    	let if_block2 = /*room*/ ctx[5].checked && create_if_block$2(ctx);

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
    			if_block0.c();
    			t6 = space();
    			td4 = element("td");
    			if (if_block1) if_block1.c();
    			t7 = space();
    			td5 = element("td");
    			if (if_block2) if_block2.c();
    			t8 = space();
    			attr_dev(td0, "class", "svelte-18cwia8");
    			add_location(td0, file$8, 52, 20, 1256);
    			attr_dev(td1, "class", "svelte-18cwia8");
    			add_location(td1, file$8, 53, 20, 1296);
    			attr_dev(td2, "class", "svelte-18cwia8");
    			add_location(td2, file$8, 54, 20, 1343);
    			attr_dev(td3, "class", "svelte-18cwia8");
    			add_location(td3, file$8, 55, 20, 1400);
    			attr_dev(td4, "class", "svelte-18cwia8");
    			add_location(td4, file$8, 66, 20, 1931);
    			attr_dev(td5, "class", "svelte-18cwia8");
    			add_location(td5, file$8, 73, 20, 2351);
    			add_location(tr, file$8, 51, 16, 1230);
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
    			if_blocks[current_block_type_index].m(td3, null);
    			append_dev(tr, t6);
    			append_dev(tr, td4);
    			if (if_block1) if_block1.m(td4, null);
    			append_dev(tr, t7);
    			append_dev(tr, td5);
    			if (if_block2) if_block2.m(td5, null);
    			append_dev(tr, t8);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*rooms*/ 1) && t0_value !== (t0_value = /*room*/ ctx[5].id + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*rooms*/ 1) && t2_value !== (t2_value = /*room*/ ctx[5].room_name + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*rooms*/ 1) && t4_value !== (t4_value = /*room*/ ctx[5].room_type.room_type + "")) set_data_dev(t4, t4_value);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(td3, null);
    			}

    			if (!/*room*/ ctx[5].available && !/*room*/ ctx[5].checked) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					if_block1.m(td4, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*room*/ ctx[5].checked) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$2(ctx);
    					if_block2.c();
    					if_block2.m(td5, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if_blocks[current_block_type_index].d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(51:12) {#each rooms as room}",
    		ctx
    	});

    	return block;
    }

    // (36:18)       <DoubleBounce size="60" color="#FF3E00" unit="px" duration="1s"></DoubleBounce>      {:then rooms}
    function create_pending_block(ctx) {
    	let doublebounce;
    	let current;

    	doublebounce = new DoubleBounce({
    			props: {
    				size: "60",
    				color: "#FF3E00",
    				unit: "px",
    				duration: "1s"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(doublebounce.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(doublebounce, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(doublebounce.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(doublebounce.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(doublebounce, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(36:18)       <DoubleBounce size=\\\"60\\\" color=\\\"#FF3E00\\\" unit=\\\"px\\\" duration=\\\"1s\\\"></DoubleBounce>      {:then rooms}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let main;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 0,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*rooms*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			main = element("main");
    			info.block.c();
    			add_location(main, file$8, 34, 0, 740);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = null;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*rooms*/ 1 && promise !== (promise = /*rooms*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
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
    		const res = await fetch('https://ghwtjp.deta.dev/room/');
    		$$invalidate(0, rooms = await res.json());
    		console.log(rooms);
    	});

    	const checkOutRoom = async id => {
    		try {
    			await axios.patch('https://ghwtjp.deta.dev/room/', { available: 0 });
    		} catch(e) {
    			console.log(e);
    		}
    	};

    	const checkInRoom = async id => {
    		try {
    			await axios.patch('https://ghwtjp.deta.dev/room/', { available: 1 });
    			await axios.patch;
    		} catch(e) {
    			console.log(e);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$4.warn(`<BookedRooms> was created with unknown prop '${key}'`);
    	});

    	const click_handler = room => checkOutRoom(room.id);
    	const click_handler_1 = room => checkOutRoom(room.id);

    	$$self.$capture_state = () => ({
    		axios,
    		onMount,
    		DoubleBounce,
    		Button,
    		rooms,
    		checkOutRoom,
    		checkInRoom
    	});

    	$$self.$inject_state = $$props => {
    		if ('rooms' in $$props) $$invalidate(0, rooms = $$props.rooms);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [rooms, checkOutRoom, click_handler, click_handler_1];
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

    /* src\components\AddRoom.svelte generated by Svelte v3.49.0 */

    const { console: console_1$3 } = globals;
    const file$7 = "src\\components\\AddRoom.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (55:28) {#each roomTypes as roomType (roomType.id)}
    function create_each_block$4(key_1, ctx) {
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
    			add_location(option, file$7, 55, 32, 1593);
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
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(55:28) {#each roomTypes as roomType (roomType.id)}",
    		ctx
    	});

    	return block;
    }

    // (63:12) <Button>
    function create_default_slot$2(ctx) {
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
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(63:12) <Button>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
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
    	validate_each_keys(ctx, each_value, get_each_context$4, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$4(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$4(key, child_ctx));
    	}

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
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
    			add_location(th0, file$7, 47, 20, 1146);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "name", "roomname");
    			attr_dev(input, "placeholder", "Room Name");
    			attr_dev(input, "class", "form-control svelte-1wkvzan");
    			add_location(input, file$7, 48, 24, 1190);
    			add_location(td0, file$7, 48, 20, 1186);
    			add_location(tr0, file$7, 46, 16, 1120);
    			add_location(th1, file$7, 51, 20, 1374);
    			if (/*postData*/ ctx[0].room_typeid === void 0) add_render_callback(() => /*select_change_handler*/ ctx[4].call(select));
    			add_location(select, file$7, 53, 24, 1444);
    			add_location(td1, file$7, 52, 20, 1414);
    			add_location(tr1, file$7, 50, 16, 1348);
    			attr_dev(table, "class", "table table=bordered");
    			add_location(table, file$7, 45, 12, 1066);
    			add_location(form, file$7, 44, 8, 1007);
    			attr_dev(div, "class", "table-responsive");
    			add_location(div, file$7, 43, 4, 967);
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
    				validate_each_keys(ctx, each_value, get_each_context$4, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, select, destroy_block, create_each_block$4, null, get_each_context$4);
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
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
    		const res = await fetch('https://ghwtjp.deta.dev/room-type/');
    		$$invalidate(1, roomTypes = await res.json());
    		console.log(roomTypes);
    	});

    	const formHandler = async () => {
    		const res = await fetch('https://ghwtjp.deta.dev/room/', {
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<AddRoom> was created with unknown prop '${key}'`);
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
    		Button,
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
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddRoom",
    			options,
    			id: create_fragment$7.name
    		});
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
    			add_location(p, file$6, 52, 20, 1302);
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
    			add_location(p, file$6, 50, 20, 1235);
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
    			add_location(td0, file$6, 45, 16, 1026);
    			attr_dev(td1, "class", "svelte-cp7ok0");
    			add_location(td1, file$6, 46, 16, 1062);
    			attr_dev(td2, "class", "svelte-cp7ok0");
    			add_location(td2, file$6, 47, 16, 1105);
    			attr_dev(td3, "class", "svelte-cp7ok0");
    			add_location(td3, file$6, 48, 16, 1158);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary-red svelte-cp7ok0");
    			add_location(button, file$6, 57, 24, 1498);
    			attr_dev(div, "class", "btn-group");
    			attr_dev(div, "role", "group");
    			attr_dev(div, "aria-label", "Basic example");
    			add_location(div, file$6, 56, 20, 1409);
    			attr_dev(td4, "class", "svelte-cp7ok0");
    			add_location(td4, file$6, 55, 16, 1383);
    			add_location(tr, file$6, 44, 12, 1004);
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
    			add_location(th0, file$6, 35, 12, 773);
    			attr_dev(th1, "class", "svelte-cp7ok0");
    			add_location(th1, file$6, 36, 12, 798);
    			attr_dev(th2, "class", "svelte-cp7ok0");
    			add_location(th2, file$6, 37, 12, 830);
    			attr_dev(th3, "class", "svelte-cp7ok0");
    			add_location(th3, file$6, 38, 12, 862);
    			attr_dev(th4, "class", "svelte-cp7ok0");
    			add_location(th4, file$6, 39, 12, 891);
    			add_location(tr, file$6, 34, 8, 755);
    			add_location(thead, file$6, 33, 4, 738);
    			add_location(tbody, file$6, 42, 4, 942);
    			attr_dev(table, "class", "svelte-cp7ok0");
    			add_location(table, file$6, 32, 0, 725);
    			add_location(main, file$6, 31, 0, 717);
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
    		const res = await fetch('https://ghwtjp.deta.dev/room/');
    		$$invalidate(0, rooms = await res.json());
    		console.log(rooms);
    	});

    	const deleteRoom = async id => {
    		try {
    			await axios.delete(`https://ghwtjp.deta.dev/room/${id}/`);
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
    		axios,
    		AddRoom,
    		RoomList: RoomList_1,
    		Button,
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

    // (46:8) <Button>
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
    		source: "(46:8) <Button>",
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

    	button = new Button({
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
    			add_location(th0, file$4, 32, 16, 847);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "title");
    			attr_dev(input0, "placeholder", "Title");
    			attr_dev(input0, "class", "form-control svelte-1myn5kf");
    			add_location(input0, file$4, 33, 20, 883);
    			add_location(td0, file$4, 33, 16, 879);
    			add_location(tr0, file$4, 31, 12, 825);
    			add_location(th1, file$4, 36, 16, 1048);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "name", "seats");
    			attr_dev(input1, "class", "form-control svelte-1myn5kf");
    			attr_dev(input1, "placeholder", "Number Of Seats");
    			add_location(input1, file$4, 37, 20, 1084);
    			add_location(td1, file$4, 37, 16, 1080);
    			add_location(tr1, file$4, 35, 12, 1026);
    			add_location(th2, file$4, 40, 16, 1257);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "name", "cost");
    			attr_dev(input2, "class", "form-control svelte-1myn5kf");
    			attr_dev(input2, "placeholder", "Cost");
    			add_location(input2, file$4, 41, 20, 1292);
    			add_location(td2, file$4, 41, 16, 1288);
    			add_location(tr2, file$4, 39, 12, 1235);
    			attr_dev(table, "class", "table table=bordered");
    			add_location(table, file$4, 30, 8, 775);
    			add_location(form, file$4, 29, 4, 720);
    			attr_dev(div, "class", "table-responsive");
    			add_location(div, file$4, 28, 0, 684);
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

    	let postData = {
    		hall_name: '',
    		seats: '',
    		cost: '',
    		booked: false
    	};

    	let valid = false;
    	let errors = { room_type: '', cost: '' };
    	let result = null;

    	const formHandler = async () => {
    		const res = await fetch('https://ghwtjp.deta.dev/hall/', {
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
    		Button,
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
    			add_location(td0, file$3, 43, 20, 1071);
    			attr_dev(td1, "class", "svelte-18cwia8");
    			add_location(td1, file$3, 44, 20, 1111);
    			attr_dev(td2, "class", "svelte-18cwia8");
    			add_location(td2, file$3, 45, 20, 1158);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary-red svelte-18cwia8");
    			add_location(button, file$3, 48, 28, 1324);
    			attr_dev(div, "class", "btn-group");
    			attr_dev(div, "role", "group");
    			attr_dev(div, "aria-label", "Basic example");
    			add_location(div, file$3, 47, 24, 1231);
    			attr_dev(td3, "class", "svelte-18cwia8");
    			add_location(td3, file$3, 46, 20, 1201);
    			add_location(tr, file$3, 42, 16, 1045);
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
    			add_location(th0, file$3, 34, 16, 815);
    			attr_dev(th1, "class", "svelte-18cwia8");
    			add_location(th1, file$3, 35, 16, 844);
    			attr_dev(th2, "class", "svelte-18cwia8");
    			add_location(th2, file$3, 36, 16, 880);
    			attr_dev(th3, "class", "svelte-18cwia8");
    			add_location(th3, file$3, 37, 16, 912);
    			add_location(tr, file$3, 33, 12, 793);
    			add_location(thead, file$3, 32, 8, 772);
    			add_location(tbody, file$3, 40, 8, 975);
    			attr_dev(table, "class", "svelte-18cwia8");
    			add_location(table, file$3, 31, 4, 755);
    			add_location(main, file$3, 30, 4, 743);
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
    		const res = await fetch('https://ghwtjp.deta.dev/hall/');
    		$$invalidate(0, halls = await res.json());
    		console.log(halls);
    	});

    	const deleteHall = async id => {
    		try {
    			await axios.delete(`https://ghwtjp.deta.dev/hall/${id}/`);
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
    		axios,
    		AddRoom,
    		RoomList: RoomList_1,
    		Button,
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

    // (43:0) {#if activeItem === 'Admin'}
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
    		source: "(43:0) {#if activeItem === 'Admin'}",
    		ctx
    	});

    	return block;
    }

    // (56:34) 
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
    		source: "(56:34) ",
    		ctx
    	});

    	return block;
    }

    // (48:1) {#if activeItem === 'Home'}
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
    			add_location(select, file, 48, 2, 1458);
    			add_location(br, file, 53, 2, 1597);
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
    		source: "(48:1) {#if activeItem === 'Home'}",
    		ctx
    	});

    	return block;
    }

    // (69:33) 
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
    		source: "(69:33) ",
    		ctx
    	});

    	return block;
    }

    // (67:34) 
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
    		source: "(67:34) ",
    		ctx
    	});

    	return block;
    }

    // (65:39) 
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
    		source: "(65:39) ",
    		ctx
    	});

    	return block;
    }

    // (63:35) 
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
    		source: "(63:35) ",
    		ctx
    	});

    	return block;
    }

    // (61:41) 
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
    		source: "(61:41) ",
    		ctx
    	});

    	return block;
    }

    // (59:37) 
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
    		source: "(59:37) ",
    		ctx
    	});

    	return block;
    }

    // (57:2) {#if activeTab === 'Home'}
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
    		source: "(57:2) {#if activeTab === 'Home'}",
    		ctx
    	});

    	return block;
    }

    // (50:3) {#each options as option}
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
    			add_location(option, file, 50, 4, 1524);
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
    		source: "(50:3) {#each options as option}",
    		ctx
    	});

    	return block;
    }

    // (47:1) <Card>
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
    		source: "(47:1) <Card>",
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

    	card = new Card({
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
    			add_location(main, file, 45, 0, 1409);
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
    	let items = ['Home', 'About', 'Admin'];
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

    	let selected = options[0];
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
    		Card,
    		Tabs,
    		RoomBooking,
    		HallBooking,
    		Login,
    		Bookings,
    		Guests,
    		RoomType,
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
