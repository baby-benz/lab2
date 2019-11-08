/*
 * @author			Emanuel Vitzthum
 * @copyright		© 2012 jQuery SDK v1.4
 * @info			http://www.jquerysdk.com
 *
 * @license			Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) and GPL (http://www.gnu.org/licenses/gpl.html)
 *
 * @based			json_encode by Kevin van Zonneveld (http://phpjs.org) license (http://phpjs.org/pages/license/#MIT and http://phpjs.org/licenses/GPL-LICENSE.txt)
 *
 * @plugin			jQuery.json.fix
 */

(function ($) {

	$.toJSON = function( mixed_val ){
		var retVal,
			
			value = mixed_val,

			quote = function( string ){
				var escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
					meta = {    // table of character substitutions
					"\b": "\\b",
					"\t": "\\t",
					"\n": "\\n",
					"\f": "\\f",
					"\r": "\\r",
					'"' : '\\"',
					"\\": "\\\\"
				};

				escapable.lastIndex = 0;

				return	escapable.test(string) ?
					'"' + string.replace(escapable, function (a) {
						var c = meta[a];
						return typeof c === "string" ? c :
						"\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
					}) + '"'  :
					'"' + string + '"';
			},

			str = function (key, holder) {
				var i = 0,          // The loop counter.
					k = "",          // The member key.
					v = "",          // The member value.
					length = 0,
					partial = [],
					value = holder[key];

				// If the value has a toJSON method, call it to obtain a replacement value.
				if( value && typeof value === "object" && $.isFunction(value.toJSON) ){
					value = value.toJSON(key);
				}

				// What happens next depends on the value's type.
				switch (typeof value) {
					case "string":
						return quote(value);

					case "number":
						// JSON numbers must be finite. Encode non-finite numbers as null.
						return isFinite(value) ? String(value) : "null";

					case "boolean":
					case "null":
						// If the value is a boolean or null, convert it to a string. Note:
						// typeof null does not produce 'null'. The case is included here in
						// the remote chance that this gets fixed someday.

						return String(value);

					case "object":
						// If the type is 'object', we might be dealing with an object or an array or
						// null.
						// Due to a specification blunder in ECMAScript, typeof null is 'object',
						// so watch out for that case.
						if (!value) {
							return "null";
						}

						// Make an array to hold the partial results of stringifying this object value.
						partial = [];

						// Is the value an array?
						if( $.isArray(value) ){
							// The value is an array. Stringify every element. Use null as a placeholder
							// for non-JSON values.

							length = value.length;
							for (i = 0; i < length; i += 1) {
								partial[i] = str(i, value) || "null";
							}

							// Join all of the elements together, separated with commas, and wrap them in
							// brackets.
							v = partial.length === 0 ? "[]" : "[" + partial.join(",") + "]";
							return v;
						}

						// Iterate through all of the keys in the object.
						for( k in value ){
							if( Object.hasOwnProperty.call(value, k) ){
								v = str(k, value);
								if (v) {
									partial.push(quote(k) + ":" + v);
								}
							}
						}

						// Join all of the member texts together, separated with commas,
						// and wrap them in braces.
						v = partial.length === 0 ? "{}" : "{" + partial.join(",") + "}";

						return v;

					case "undefined": // Fall-through
					case "function": // Fall-through
					default:
						// throw new SyntaxError('json_encode');
					break;
				}
			};

		// Make a fake root object containing our value under the key of ''.
		// Return the result of stringifying the value.
		return str( "", {"":value} );
	};

})(jQuery);