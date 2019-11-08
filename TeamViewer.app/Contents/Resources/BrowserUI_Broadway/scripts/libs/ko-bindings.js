ko.bindingHandlers.simpleList = {
    init: function(element, valueAccessor) {
        var value = ko.unwrap(valueAccessor());
        var text = "";
        if (value.length) {
        	for (var i = 0; i < value.length; i++) {
        		if (i > 0) {
        			text += ", "
        		}
        		text += value[i];
        	}
        }
        element.innerHTML = text;
    },
    update: function(element, valueAccessor, allBindings) {
        var value = ko.unwrap(valueAccessor());
        var text = "";
        if (value.length) {
        	for (var i = 0; i < value.length; i++) {
        		if (i > 0) {
        			text += ", "
        		}
        		text += value[i];
        	}
        }
        // prevent unnecessary updates
        if (text !== element.innerHTML) {
        	element.innerHTML = text;
        }
    }
};
