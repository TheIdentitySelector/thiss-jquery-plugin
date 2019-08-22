Using thiss-ds
==============

Overview
--------

The package contains (at present) a single jQuery plugin that does several things:

1. display an identity selector based on a search-box and type-ahead. Should be combined with a search-capable MDQ server.
2. display information about a relying party based on MDQ lookup (eg title, icon etc)

Combined these capabilities form the basis upon which an identity UX can be built. Note that this plugin does not enforce any markup/layout - such things must be provided by the calling application.

There is a simple demo application in index.html/demo.js/demo.css also provided as a standalone application in the `thiss-examples <https://github.com/TheIdentitySelector/thiss-examples>_` repository. Initializing the plugin is pretty straight-formward. This example illustrates the minimal set of required attributes:

.. code-block:: js

  
   $(selector).discovery_client({
     persistence: 'https://use.this.io/ps',
     search: 'https://md.thiss.io/entities/',
     mdq: 'https://md.thiss.io/entities/',
     render: function (item) { ... },
     search_result_selector: '#ds-search-list',
     saved_choices_selector: '#ds-saved-choices',
     input_field_selector: 'input',
     entity_selector: '.identityprovider'
   });

Typically this is done inside a standard jQuery ``$(document).ready { ... }`` wrapper.

This would initialize an identity selector on ``selector`` which is assumed to be a ``div`` or similar. Search results are rendered using the render function (must return DOM nodes matching the ``entity_selector`` selector) in the ``search_result_selector`` element. If present any saved choices from the persistence service are show in ``saved_choices_selector``. The other attributes should be pretty-self-explanatory.

The element indentified by ``input_field_selector`` (by default any input-field) is used to create the search field. Typical markup might look something like this:

.. code-block:: html

  <ul class="list-unstyled" id="ds-saved-choices"></ul>
  <div id="ds">
     <form>
        <div class="form-content">
           <input autocomplete="off" type="search" placeholder="Search for an identity provider..." autofocus>
        </div>
     </form>
     <ul class="list-unstyled" id="ds-search-list"></ul>
  </div>
