/*
* Copyright (C) 2005-2013 TeamViewer GmbH. All rights reserved.
*
* This is unpublished proprietary source code of TeamViewer
* GmbH. The contents of this file may not be disclosed to third
* parties, copied or duplicated in any form, in whole or in part,
* without the prior written permission of TeamViewer GmbH.
* For further regulations see the file "license.txt".
*/


/*
 * Cutom KO binding handler that sets object properties( not attributes )
 */
ko.bindingHandlers['prop'] = {
	'update': function (element, valueAccessor, allBindings) {
		var value = ko.utils.unwrapObservable(valueAccessor()) || {};

		for (var attrName in value) {
			if (typeof attrName == "string") {
				var attrValue = ko.utils.unwrapObservable(value[attrName]);

				$(element).prop(attrName, attrValue.toString());			
			}
		}
	}
};

/**
*   Sets HTML text in a node using a fade out-fade in animation.
*/
ko.bindingHandlers.fadeHtml = {
    init: function (element, valueAccessor) {
        // Init not needed
    },
    update: function (element, valueAccessor) {
        // Whenever the value subsequently changes, slowly fade the element in or out
        var value = valueAccessor();
        var htmlText = ko.utils.unwrapObservable(value);

        $(element).fadeOut(function () {
            $(this).html(htmlText).fadeIn();
        });
    }
};