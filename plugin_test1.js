/** 
* @description MeshCentral PluginTest 1
* @author Martin Mädler
* @copyright 
* @license Apache-2.0
* @version v0.0.2
*/

"use strict";

module.exports.plugin_test1 = function (parent) {
    var obj = {};
    obj.parent = parent;

    obj.hook_setupHttpHandlers = function(obj, parent) {
        for (var i in parent.config.domains) {
            // This is a subdomain with a DNS name, no added HTTP bindings needed.
            if ((parent.config.domains[i].dns != null) || (parent.config.domains[i].share != null)) { continue; }
            var domain = parent.config.domains[i];
            var url = domain.url;
            // Add custom endpoints here.
            obj.app.get(url + 'api/agentdownload', function (req, res) {
                var url = 'wss://localhost/control.ashx';
                var u = url.replace('wss://', 'https://').replace('/control.ashx', '/meshagents');
                if (u.indexOf('?') > 0) { u += '&'; } else { u += '?'; }
                var type = 4; // x64
                var id = 'NQTcCpzMvtZ5Mnfi0HRYke2mNfHZcZF@B@w2POWZcW9yTFOXPkVDgk5SJclCaFSx';
                u += 'id=' + type + '&meshid=' + id;
                res.set({ 'Content-Type': 'application/json' });
                res.status(200);
                res.send(JSON.stringify({
                    value: u
                }));
            });
        }
    }

    return obj;
}
