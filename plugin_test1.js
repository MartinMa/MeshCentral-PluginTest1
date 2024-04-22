/** 
* @description MeshCentral PluginTest 1
* @author Martin Mädler
* @copyright 
* @license Apache-2.0
* @version v0.0.3
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
                // For example:
                // https://localhost/meshagents?id=4&meshid=NQTcCpzMvtZ5Mnfi0HRYke2mNfHZcZF@B@w2POWZcW9yTFOXPkVDgk5SJclCaFSx
                // #########

                const options = { rejectUnauthorized: false, checkServerIdentity: onVerifyServer }
                const fs = require('fs');
                const https = require('https');
                var downloadSize = 0;
                const req = https.request(u, options, function (res) {
                    if (res.statusCode != 200) {
                        console.log('Download error, statusCode: ' + res.statusCode);
                        process.exit(1);
                    } else {
                        // Agent filename
                        var agentFileName = 'supercool';
                        // Check if this file already exists
                        if (fs.existsSync(agentFileName)) { console.log('File \"' + agentFileName + '\" already exists.'); process.exit(1); }
                        var fd = fs.openSync(agentFileName, 'w'); // Open the file for writing
                        res.on('data', function (d) {
                            downloadSize += d.length;
                            fs.writeSync(fd, d); // Save to file
                        });
                        res.on('end', function (d) {
                            fs.closeSync(fd); // Close file
                            console.log('Downloaded ' + downloadSize + ' byte(s) to \"' + agentFileName + '\"');
                            process.exit(1);
                        });
                    }
                })
                req.on('error', function (error) { console.error(error); process.exit(1); })
                req.end();

                // #########
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

function onVerifyServer(clientName, certs) { return null; }
