
import * as $ from 'jquery';
window.jQuery = $;

require('./ds-widget.js');
import {PersistenceService, parse_qs} from '@theidentityselector/thiss-ds';

import 'bootstrap/dist/css/bootstrap.min.css';
import './demo.css';

let ps = new PersistenceService('https://use.thiss.io/ps');

function start_demo() {
   let params = parse_qs(window.location.search.substr(1).split('&'));
   if (!params['entityID'] || !params['return']) {
      window.top.location.href = "/index.html?entityID=https://sp.swamid.se/shibboleth&return=#"
   }
}

$(document).ready(function() {
   start_demo();
   $('#ds').discovery_client({
      persistence: ps,
      search: 'https://md.thiss.io/entities/',
      mdq: 'https://md.thiss.io/entities/',
      render: function (item) {
         let template = `
<a class="identityprovider" data-href="${item.entity_id}">
   <li>
      <div class="border border-primary card">
         <h5 class="card-title">${item.title}</h5>
         <p class="card-text">${item.descr}</p>
      </div>
   </li>
</a>
`
         return $(template);
      }
   }).discovery_client("sp").then(entity => $(".sp_title").text(entity.title));
});
