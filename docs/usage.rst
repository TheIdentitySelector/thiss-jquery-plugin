Using thiss-jquery-plugin
=========================

Overview
--------

The package contains (at present) a single jQuery plugin that does several things:

1. display an identity selector based on a search-box and type-ahead. Should be combined with a search-capable MDQ server.
2. display information about a relying party based on MDQ lookup (eg title, icon etc)

Combined these capabilities form the basis upon which an identity UX can be built. Note that this plugin does not enforce any markup/layout - such things must be provided by the calling application.

Discovery Service
-----------------

There is a simple demo application in index.html/demo.js/demo.css also provided as a standalone application in the `thiss-examples <https://github.com/TheIdentitySelector/thiss-examples>`_ repository. Initializing the plugin is pretty straight-formward. This example illustrates the minimal set of required attributes:

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

Typically this is done inside a standard jQuery ``$(document).ready { ... }`` wrapper. The persistence is either an instance of the ``PersitenceService`` class from `thiss-ds-js <https://github.com/TheIdentitySelector/thiss-ds-js>`_ or the URL of a persistence service as in the example above. The search and mdq paramaters are either URLs or callable javascript functions which take a single string argument (entityID or search string) and return an entity or list of entities as apropriate. The format of the returned objects must observe the schema from `thiss-ds-js <https://github.com/TheIdentitySelector/thiss-ds-js>`_.

This call would initialize an identity selector on ``selector`` which is assumed to be a ``div`` or similar. Search results are rendered using the render function (must return DOM nodes matching the ``entity_selector`` selector) in the ``search_result_selector`` element. If present any saved choices from the persistence service are show in ``saved_choices_selector``. The other attributes should be pretty-self-explanatory.

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

SP Metadata
-----------

The plugin can also lookup and extract SP metadata based on the ``entityID`` parameter which is present in the query string of the URL if the application is beeing called as a SAML Identity Provider Discovery service. Here is how to call the plugin chained after the example call above:

.. code-block:: js

   $(selector).discovery_client({...}).discovery_client('sp').then(entity => $(some_div).text(entity.title)).

The call to ``discovery_client('sp')`` returns a promise resolving to an object that contains the display-string of the SP. Use a call to ``then`` to resolve the promise and pass to a function that can do something like populating a UI element with the information received. This can be called multiple times but each will result in a separate call to the underlying MDQ service which probably results in network traffic - caveat emptor.
