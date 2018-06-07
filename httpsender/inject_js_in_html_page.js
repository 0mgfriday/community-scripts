/*
 * Inject Javascript code into a webpage.
 *
 *   - Code will be added inside <script></script> tags in the Response body's
 *   <head></head> before sending it to the client.
 *   - Code to be added is read from the file which path is `FILE` (this need to
 *   be an absolute path, /tmp/test.js in our case).
 */

FILE = '/tmp/test.js'

function loadScriptFromFile(file) {
    Files = Java.type('java.nio.file.Files');
    Paths = Java.type('java.nio.file.Paths');
    String = Java.type('java.lang.String');

    filePath = Paths.get(file);
    return new String(Files.readAllBytes(filePath), 'UTF-8');
}

function sendingRequest(msg, initiator, helper) {}

function responseReceived(msg, initiator, helper) {
    body = msg.getResponseBody();
    bodyAsStr = body.toString();
    header = msg.getResponseHeader();

    xRequestedWith = msg.getRequestHeader().getHeader('X-Requested-With');
    contentType = header.getHeader('Content-Type');

    contentTypeRegex = new RegExp(/text\/html;/g);

    if (!contentTypeRegex.test(contentType)
        || xRequestedWith == 'XMLHttpRequest') {
        return true;
    }

    SCRIPT = '<script>' + loadScriptFromFile(FILE) + '</script>';

    indexOfHead = bodyAsStr.indexOf('<head>');

    if (indexOfHead == -1) {
      index = bodyAsStr.indexOf('<html>') + '<html>'.length();
      SCRIPT = '<head>' + SCRIPT + '<head>';
    } else {
      index = indexOfHead + '<head>'.length();
    }

    newBody = bodyAsStr.slice(0, index) + SCRIPT + bodyAsStr.slice(index);

    msg.setResponseBody(newBody);
    header.setContentLength(msg.getResponseBody().length());
}
