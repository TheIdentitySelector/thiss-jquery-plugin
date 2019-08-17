
$ = require("jquery");

import 'jquery-ui/ui/widget.js'
import {DiscoveryService, parse_qs, json_mdq_search} from "@theidentityselector/thiss-ds";
require("bootstrap-list-filter");

jQuery(function ($) {
    $.widget("thiss.discovery_client", {

        options: {
            discovery_service_persistence_url: undefined,
            discovery_service_search_url: undefined,
            discovery_service_context: undefined,
            before: undefined,
            after: undefined,
            render: undefined,
            render_search_result: undefined,
            render_saved_choice: undefined,
            fallback_icon: undefined,
            search_result_selector: '#ds-search-list',
            saved_choices_selector: '#ds-saved-choices',
            selection_selector: '.identityprovider',
            too_many_results: undefined,
            no_results: undefined
        },

        _create: function () {
            let obj = this;

	    if (!$.isFunction(obj.options['render'])) {
	        obj.options['render'] = $.noop;
            }

            if (!$.isFunction(obj.options['render_search_result'])) {
                obj.options['render_search_result'] = obj.options['render'];
            }
            if (!$.isFunction(obj.options['render_saved_choice'])) {
                obj.options['render_saved_choice'] = obj.options['render'];
            }
            if (!$.isFunction(obj.options['fallback_icon'])) {
                obj.options['fallback_icon'] = $.noop;
            }
            if (!$.isFunction(obj.options['after'])) {
                obj.options['after'] = $.noop;
            }
            if (!$.isFunction(obj.options['before'])) {
                obj.options['before'] = function(x) { return x; }
            }
            obj._update();
        },

        _setOption: function (key, value) {
            this.options[key] = value;
            this._update();
        },

        sp: function() {
            let obj = this;
            let params = parse_qs(window.location.search.substr(1).split('&'));
            let entity_id = params['entityID'];
            if (entity_id) {
                return obj._ds.mdq(entity_id).then(entity => {
                    return entity ? entity : Promise.resolve({'entity_id': entity_id, 'title': entity_id});
                });
            } else {
                console.log("Missing entityID parameter in discovery request");
                return {'title': 'Unknown'}
            }
        },

        _after: function (count) {
            let saved_choices_element = $(this.options['saved_choices_selector']);
            if (this.discovery_service_search_url) {
                let obj = this;
                let search_result_element = $(obj.options['search_result_selector']);
                let search_base, list_uri;
                let counter = 0;
                search_base = obj.element.attr('data-search');
                $(obj.input_field_selector).focus();
                search_result_element.btsListFilter(obj.input_field_selector, {
                    resetOnBlur: false,
                    casesensitive: false,
                    maxResults: 10,
                    itemEl: '.identityprovider',
                    emptyNode: obj.options['no_results'],
                    getValue: function(that) {
                        let v = that.val();
                        let i = v.indexOf('@');
                        return i > -1 ? v.substring(i+1,v.length) : v;
                    },
                    maxResultsNode: function(data) {
                        return obj.options['too_many_results'](data.length);
                    },
                    sourceData: function (text, callback) {
                        return json_mdq_search(text, search_base).then(callback);
                    },
                    sourceNode: function (data) {
                        counter += 1;
                        data.counter = counter;
                        data.saved = false;
                        return obj.options['render_search_result'](data);
                    },
                    cancelNode: function () { console.log("cancel"); },
                });
            }
            this.options['after'](count, saved_choices_element);
        },

        _update: function () {
            let obj = this;
            obj.discovery_service_persistence_url = obj.options['discovery_service_persistence_url'] || obj.element.attr('data-persistence');
            obj.discovery_service_search_url = obj.options['discovery_service_search_url'] || obj.element.attr('data-search');
            obj.mdq_url = obj.options['mdq_url'] || obj.element.attr('data-mdq');
            obj.input_field_selector = obj.options['input_field_selector'] || obj.element.attr('data-inputfieldselector') || 'input';
            obj.selection_selector = obj.options['selection_selector'];
            obj.dicovery_service_context = obj.options['discovery_service_context'] || obj.element.attr('data-context');
            obj._ds = new DiscoveryService(obj.mdq_url, obj.discovery_service_persistence_url, obj.discovery_service_context);
            obj._count = 0;
            let top_element = obj.element;

            $('img.pyff-idp-icon').bind('error', function () {
                $(this).unbind('error');
                obj.options['fallback_icon'](this);
            });

            $('body').on('mouseenter', obj.selection_selector, function (e) {
                $(this).addClass("active");
            });
            $('body').on('mouseleave', obj.selection_selector, function (e) {
                $(this).removeClass("active");
            });

            $('body').on('click', obj.selection_selector, function (e) {
                let entity_id = $(this).closest(obj.selection_selector).attr('data-href');
                console.log(entity_id);
                return obj._ds.saml_discovery_response(entity_id);
            });

            $('body').on('keyup', obj.selection_selector, function (e) {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    $(this).click();
                }
            });

            $(obj.input_field_selector).closest('form').submit(function(e) {
                e.preventDefault();
            });

            $('body').on('click', '.remove', function (e) {
                e.stopPropagation();
                let entity_element = $(this).closest(obj.selection_selector);
                obj._count = entity_element.siblings().length + 1;
                let entity_id = entity_element.attr('data-href');
                console.log("removing "+entity_id);
                console.log(entity_element);
                if (entity_id) {
                    obj._ds.remove(entity_id).then(function () {
                        entity_element.remove();
                    }).then(function() {
                        obj._count -= 1;
                        obj._after(obj._count)
                    });
                }
            });

            obj._ds.with_items(function (items) {
                console.log(items);
                items = obj.options['before'](items);
                let count = 0;
                let saved_choices_element = $(obj.options['saved_choices_selector']);
                console.log(items);
                if (items && items.length > 0) {
                    items.forEach(function (item) {
                        let entity = item.entity;
                        entity.saved = true;
                        let entity_element = obj.options['render_saved_choice'](entity);
                        saved_choices_element.prepend(entity_element);
                        count++;
                    });
                }
                obj._after(count);
                return items; // needed later by persistence
            });
        }
    })
});
