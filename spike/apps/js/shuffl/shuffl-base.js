/**
 * @fileoverview
 *  Shuffl application common code.
 *  
 * @author Graham Klyne
 * @version $Id: shuffl-base.js 820 2010-06-07 12:26:38Z gk-google@ninebynine.org $
 * 
 * Coypyright (C) 2009, University of Oxford
 *
 * Licensed under the MIT License.  You may obtain a copy of the License at:
 *
 *     http://www.opensource.org/licenses/mit-license.php
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If errors are seen, run Eclipse "(right-click project) > Validate" option

// Meanwhile, this suppresses many distracting errors:
jQuery = jQuery;

// ----------------------------------------------------------------
// Globals and data
// ----------------------------------------------------------------

/**
 *  Add logging functions to global namespace, for convenience
 */
if (typeof log == "undefined")
{
    log = {};
    log.debug = MochiKit.Logging.logDebug   ;
    log.info  = MochiKit.Logging.log    ;
    log.warn  = MochiKit.Logging.logWarning ;
    log.error = MochiKit.Logging.logError   ;
};

/**
 * Abbreviated access for Mochikit functions
 */
mk = {};
mk.partial = MochiKit.Base.partial;
mk.map     = MochiKit.Base.map;

// Mochikit logging hack as default is no limit and default firebug off:
//MochiKit.Logging.logger.useNativeConsole = false;
//MochiKit.Logging.logger.maxSize = 2000;

/**
 * Ensure shuffl namespace is defined
 */
if (typeof shuffl == "undefined") { shuffl = {}; };

// ----------------------------------------------------------------
// Error class
// ----------------------------------------------------------------

/**
 * Error class for Shuffl
 */
shuffl.Error = function(msg, val) 
{
    this.msg = this.message = msg;
    this.val = val;
};

shuffl.Error.prototype = new Error("(shuffl)");

shuffl.Error.prototype.toString = function () 
{
    var s = "shuffl error: "+this.msg;
    if (this.val) {
        s += " ("+this.val.toString()+")";
    }
    return s;
};

// ----------------------------------------------------------------
// Status display
// ----------------------------------------------------------------

/**
 * Display workspace location in status bar.
 * 
 * @param uri       is the location URI or string to be displayed.
 *                  If not supplied, the current base uri is used.
 */
shuffl.showLocation = function (uri)
{
    uri = uri || jQuery.uri();
    jQuery('#workspace_status').text(uri.toString()).removeClass('shuffl-error');
};

/**
 * Display error message in status bar.
 * 
 * @param msg       is the error message to be displayed.
 */
shuffl.showError = function (msg)
{
    ////log.debug("- msg "+shuffl.objectString(msg));
    if (msg instanceof Error)
    {
        msg = msg.toString();
    };
    log.error(msg);
    jQuery('#workspace_status').text(msg).addClass('shuffl-error');
};

// ----------------------------------------------------------------
// Callback helpers
// ----------------------------------------------------------------

/**
 * Callback function taking one parameter that does nothing.
 */
shuffl.noop = function (val)
{
    return;
};

// ----------------------------------------------------------------
// Miscellaneous support functions
// ----------------------------------------------------------------

/**
 * Get string value representing a supplied element
 */
shuffl.elemString = function(elem) 
{
    var attrs = elem.attributes || [];
    var attrtext = "";
    for ( var i = 0 ; i < attrs.length ; i++ ) {
        // log.debug("  - @"+attrs[i].name+": "+attrs[i].value);
        attrtext += " "+attrs[i].name+"='"+attrs[i].value+"'";
    };
    var tagName = elem.tagName;
    // If faults about here, check that param passed is DOM element,
    // not jQuery object; e.g. jQuery(selector)[0].
    return "<"+tagName+attrtext+">"
        + mk.map(shuffl.nodeString, elem.childNodes).join("")
        + "</"+tagName+">";
};

/**
 * Get string value representing a supplied node
 */
shuffl.nodeString = function(node) 
{
    if (node.nodeType == 3) {
        return node.textContent ;
    }
    if (node.nodeType == 1) {
        return shuffl.elemString(node);
    }
    return shuffl.objectString(node);
    //1 ELEMENT_NODE
    //2 ATTRIBUTE_NODE
    //3 TEXT_NODE
    //4 CDATA_SECTION_NODE
    //5 ENTITY_REFERENCE_NODE
    //6 ENTITY_NODE
    //7 PROCESSING_INSTRUCTION_NODE
    //8 COMMENT_NODE
};

/**
 * Get string value for object attributes
 */
shuffl.objectString = function (obj) 
{
	if (typeof(obj) != "object")
	{
		return ""+obj;
	};
    var str = "";
    var pre = "";
    for ( var k in obj ) {
        if ( typeof obj[k] == "string" ) {
            str += pre + k + ': "' + obj[k] + '"';
            pre = ', ';
        } else if (obj[k] instanceof Array) {
            str += pre + k + ': [' + mk.map(shuffl.objectString, obj[k]).join() + ']';
        } else if ( typeof obj[k] != "function" ) {
            //log.debug("  - "+k+": "+obj[k]);
            str += pre + k + ': ' + obj[k];
            pre = ', ';
        }
    };
    return "{ "+str+" };";
};

/**
 * Function to test if one string starts with another
 */
shuffl.starts = function (pre, str)
{
    return (str != null) && (str.slice(0,pre.length) == pre);
};

/**
 * Function to test if one string ends with another
 */
shuffl.ends = function (suf, str)
{
    return (str != null) && (suf.length == 0 || str.slice(-suf.length) == suf);
};

/**
 * Function to assemble a textual value from a supplied template string and a 
 * dictionary of values.  The template uses a tiny subset of Python string 
 * formatting codes, namely %(name)s is replaced by the corresponding entry 
 * from the dictionary.
 */
shuffl.interpolate = function(template, dict) 
{
    //log.debug("shuffl.interpolate: "+template+", "+shuffl.objectString(dict));
    var str = template;
    for (k in dict) {
        //log.debug("shuffl.interpolate: key: "+k+", "+dict[k]);        
        str = str.replace(new RegExp("%\\("+k+"\\)s","g"), dict[k]);
    };
    //log.debug("shuffl.interpolate: return: "+str);
    return str;
};

/**
 * Helper function to return a string or array value from an object field, 
 * otherwise a supplied default.  This function processes incoming
 * JSON, so should be defensively implemented.
 * 
 * @param obj           the object value
 * @param key           the key of the member value to extract
 * @param def           the default value to use if there is any
 *                      problem with the object member value.
 */
shuffl.get = function (obj, key, def) 
{
    if (typeof obj == "object" && obj.hasOwnProperty(key)) {
        var val = obj[key];
        // Be very picky about what we let through...
        if (typeof val == "string") { return val; }
        if (typeof val == "number") { return val; }
        if (val instanceof Array)   { return val; }
        log.error("shuffl.get: unexpected value type "+val);
    };
    return def;
};

/**
 * Parse integer value from string, or return supplied default value
 * 
 * @param str       string to be parsed
 * @param rad       radix to parse
 * @param def       default value
 */
shuffl.parseInt = function (str, rad, def) 
{
    return parseInt(str, 10) || def;
};

/**
 *  Test to see is supplied URI is relative
 */
shuffl.isRelativeUri = function (uriref) 
{
    return shuffl.toAbsoluteUri("abs://nodomain/", uriref) != uriref;
};

/**
 *  Get absolute URI for specified base and URI reference
 */
shuffl.toAbsoluteUri = function (baseuri, uriref) 
{
    return jQuery.uri(baseuri).resolve(uriref);
};

/**
 * Function to extend a URI path.  Like relative URI resolution except
 * that even paths beginning with '/' are regarded as relative to the 
 * directory of the base URI.
 * 
 * Example:
 *   extendPath("http://example/atom/", "/feed") ==
 *   "http://example/atom/feed"
 * 
 * @param baseuri   a base URI to which the path extension is to be added
 * @param pathext   a URI path that extends the base URI.
 * @return          the extended URI.
 */
shuffl.extendUriPath = function (baseuri, pathext) 
{
    return jQuery.uri(baseuri).resolve(pathext.replace(/^\//,""));
};

/**
 * Format URI component:  if defined, the supplied prefix and suffix are added, 
 * otherwise returns an empty string.
 */
shuffl.uriComponent = function (pre, component, suf) 
{
    if (component != undefined) { return pre+component+suf; }
    return "";
};

/**
 * Function to return query including "?" from a URI, or an empty string.
 */
shuffl.uriQuery = function (uri) 
{
    return shuffl.uriComponent("?", jQuery.uri(uri).query, "");
};

/**
 *  Get URI without fragment
 */
shuffl.uriWithoutFragment = function (uri) 
{
    uri = jQuery.uri(uri);
    return shuffl.uriComponent("",   uri.scheme,    ":")+
           shuffl.uriComponent("//", uri.authority, "" )+
           shuffl.uriComponent("",   uri.path,      "" )+
           shuffl.uriComponent("?",  uri.query,     "" );           
};

/**
 * Resolve URI against current default
 * 
 * Resolve w.r.t. shuffl.uriBase("") is to work around what I beleive to be 
 * a bug in jQuery.uri, which uses filename part from the base path if none
 * is present in the relative path.
 */
shuffl.uriResolveDefault = function (uri) 
{
    return jQuery.uri(uri, shuffl.uriBase(""));
};

/**
 * Get URI component name (path following last '/')
 */
shuffl.uriName = function (uri) 
{
    return shuffl.uriResolveDefault(uri).path.replace(/.*\//, "");
};

/**
 * Get URI path excluding component name (path up to last '/')
 */
shuffl.uriPath = function (uri) 
{
    return jQuery.uri(uri).path.replace(/\/[^\/]*$/, "/");
};

/**
 * Get full base URI, excluding component name, query and fragment
 */
shuffl.uriBase = function (uri) 
{
    return jQuery.uri(shuffl.uriPath(uri), jQuery.uri(uri)).toString();
};

/**
 * Return a normalized URI - with a trailing '/' for collection URIs if 
 * not already present.  Any query and fregment values are discarded.
 * 
 * @param baseuri   URI to be normalized as a collection URI.
 * @param uriref    uri reference relative to the supplied base.
 * @param col       true if the returned value is to be a collection URI 
 *                  with a trailing '/'
 * @return          a jQuery.uri object with the required normalized URI.
 */
shuffl.normalizeUri = function (baseuri, uriref, col) {
    ////log.debug("shuffl.StorageCommon.collectionUri: "+uri);
    var uri  = jQuery.uri(baseuri, "error:///error").resolve(uriref);
    var path = uri.path.replace(/\/$/,"");
    return jQuery.uri(
           shuffl.uriComponent("",   uri.scheme,    ":")+
           shuffl.uriComponent("//", uri.authority, "" )+
           path+(col ? '/' : ''));
};

// End.
