/** 
* @description MeshCentral PluginTest 1
* @author Martin Mädler
* @copyright 
* @license Apache-2.0
* @version v0.0.5
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
                // Example: api/agentdownload?id=4&meshid=NQTcCpzMvtZ5Mnfi0HRYke2mNfHZcZF@B@w2POWZcW9yTFOXPkVDgk5SJclCaFSx
                // First, determine operating system, architecture and mesh id (device group)
                const type = req.query.type;
                const meshid = req.query.meshid;
                if (type !== 4 && type !== 3) {
                    // We only support Windows!
                    sendBadRequest(res, 'api/agentdownload');
                    return;
                }
                // Second, download meshagent to a temp directory
                let downloadUrl = `https://localhost/meshagents/?id=${type}&meshid=${meshid}&installflags=2`

                const options = { rejectUnauthorized: false, checkServerIdentity: onVerifyServer }
                const fs = require('fs');
                const https = require('https');
                const downloadReq = https.request(downloadUrl, options, function (downloadRes) {
                    if (downloadRes.statusCode != 200) {
                        sendInternalServerError(res, 'api/agentdownload');
                    } else {
                        // Agent filename
                        var agentFileName = 'supercool';
                        // Check if this file already exists
                        if (fs.existsSync(agentFileName)) {
                            // File already exists
                            sendInternalServerError(res, 'api/agentdownload');
                        }
                        // Open the file for writing
                        let fileDescriptor = fs.openSync(agentFileName, 'w');
                        downloadRes.on('data', function (chunck) {
                            // Save to file
                            fs.writeSync(fileDescriptor, chunck);
                        });
                        downloadRes.on('end', function () {
                            // Close file
                            fs.closeSync(fileDescriptor);
                            // Third, call setup script
                            const arch = type === 4 ? 'x64' : 'x86';
                            // TODO
                        });
                    }
                })
                downloadReq.on('error', (error) => {
                    sendInternalServerError(res, 'api/agentdownload', error);
                    return;
                });
                downloadReq.end();

                // Prepare response
                res.set({ 'Content-Type': 'application/json' });
                res.status(200);
                res.send(JSON.stringify({
                    value: downloadUrl
                }));
            });
        }
    }

    function sendBadRequest(res, path, err) {
        res.status(400);
        sendJson(res, {
            timestamp: new Date().toISOString(),
            status: 400,
            error: 'Bad Request',
            message: err?.message,
            path
        });
    }

    function sendInternalServerError(res, path, err) {
        res.status(500);
        sendJson(res, {
            timestamp: new Date().toISOString(),
            status: 500,
            error: 'Internal Server Error',
            message: err?.message,
            path
        });
    }

    return obj;
}

function onVerifyServer(clientName, certs) { return null; }
