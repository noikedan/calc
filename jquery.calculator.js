(function($) { 

	var pluginName = 'calculator';

	var layoutStandard = ['  BSCECA', '_1_2_3_+@X', '_4_5_6_-@U', '_7_8_9_*@E', '_0_._=_/'];

	var digit = 'd';
	var binary = 'b';
	var unary = 'u';
	var control = 'c';
	var space = 's';
	function calc () {
		$('.button').click(function(){
        var pushed = $(this).text();
        var inputLabel = $('#boxinputLabel');

        var h1Text = inputLabel.text();
        h1Text = h1Text.replace("×", "*");
        h1Text = h1Text.replace("÷", "/");
        if (pushed == '=') {
            // 計算
            inputLabel.text(eval(h1Text));
        } else if (pushed == 'AC') {
            // 全てクリア
            inputLabel.text('0');
        } else {
            console.log(inputLabel.text());
            if (inputLabel.text() == '0') {
                inputLabel.text(pushed);
            } else {
                inputLabel.text(inputLabel.text() + pushed);
            }
        }
    });
  }


	$.JQPlugin.createPlugin({

		name: pluginName,

		defaultOptions: {
			showOn: 'focus',
			buttonImage: '',
			buttonImageOnly: false,
			isOperator: null,
			showAnim: 'show',
			showOptions: {},
			duration: 'normal',
			appendText: '',
			useThemeRoller: false,
			calculatorClass: '',
			showFormula: false,
			prompt: '',
			layout: layoutStandard,
			value: 0,
			base: 10,
			precision: 10,
			memoryAsCookie: false,
			cookieName: 'calculatorMemory',
			cookieExpires: 24 * 60 * 60,
			cookiePath: '',
			useDegrees: false,
			constrainInput: true,
			onOpen: null,
			onButton: null,
			onClose: null
		},

		regionalOptions: { // Available regional settings, indexed by language/country code
			'': { // Default regional settings - English/US
				decimalChar: '.',
				buttonText: '...',
				buttonStatus: 'Open the calculator',
				closeText: 'Close',
				closeStatus: 'Close the calculator',
				useText: 'Use',
				useStatus: 'Use the current value',
				eraseText: 'Erase',
				eraseStatus: 'Erase the value from the field',
				backspaceText: 'BS',
				backspaceStatus: 'Erase the last digit',
				clearErrorText: 'CE',
				clearErrorStatus: 'Erase the last number',
				clearText: 'CA',
				clearStatus: 'Reset the calculator',
				memClearText: 'MC',
				memClearStatus: 'Clear the memory',
				memRecallText: 'MR',
				memRecallStatus: 'Recall the value from memory',
				memStoreText: 'MS',
				memStoreStatus: 'Store the value in memory',
				memAddText: 'M+',
				memAddStatus: 'Add to memory',
				memSubtractText: 'M-',
				memSubtractStatus: 'Subtract from memory',
				base2Text: 'Bin',
				base2Status: 'Switch to binary',
				base8Text: 'Oct',
				base8Status: 'Switch to octal',
				base10Text: 'Dec',
				base10Status: 'Switch to decimal',
				base16Text: 'Hex',
				base16Status: 'Switch to hexadecimal',
				degreesText: 'Deg',
				degreesStatus: 'Switch to degrees',
				radiansText: 'Rad',
				radiansStatus: 'Switch to radians',
				isRTL: false
			}
		},

		_getters: ['isDisabled'],

		_curInst: null, // The current instance in use
		_disabledFields: [], // List of calculator inputs that have been disabled
		_showingCalculator: false, // True if the popup panel is showing , false if not
		_showingKeystrokes: false, // True if showing keystrokes for calculator buttons

		_keyDefs: {},

		digit: digit,
		binary: binary,
		unary: unary,
		control: control,
		space: space,

		_mainDivClass: pluginName + '-popup', // The name of the main calculator division marker class
		_inlineClass: pluginName + '-inline', // The name of the inline marker class
		_appendClass: pluginName + '-append', // The name of the appended text marker class
		_triggerClass: pluginName + '-trigger', // The name of the trigger marker class
		_disableClass: pluginName + '-disabled', // The name of the disabled covering marker class
		_inlineEntryClass: pluginName + '-keyentry', // The name of the inline entry marker class
		_promptClass: pluginName + '-prompt', // The name of the prompt marker class
		_formulaClass: pluginName + '-formula', // The name of the formula marker class
		_resultClass: pluginName + '-result', // The name of the calculator result marker class
		_focussedClass: pluginName + '-focussed', // The name of the focussed marker class
		_keystrokeClass: pluginName + '-keystroke', // The name of the keystroke marker class
		_rtlClass: pluginName + '-rtl', // The name of the right-to-left marker class
		_rowClass: pluginName + '-row', // The name of the row marker class
		_ctrlClass: pluginName + '-ctrl', // The name of the control key marker class
		_baseActiveClass: pluginName + '-base-active', // The name of the active base marker class
		_angleActiveClass: pluginName + '-angle-active', // The name of the active angle marker class
		_digitClass: pluginName + '-digit', // The name of the digit key marker class
		_operatorClass: pluginName + '-oper', // The name of the operator key marker class
		_memEmptyClass: pluginName + '-mem-empty', // The name of the memory empty marker class
		_keyNameClass: pluginName + '-keyname', // The name of the key name marker class
		_keyDownClass: pluginName + '-key-down', // The name of the key down marker class
		_keyStrokeClass: pluginName + '-keystroke', // The name of the key stroke marker class

		/** The standard calculator layout with simple operations. */
		standardLayout: layoutStandard,
		/** The extended calculator layout with common scientific operations. */
		scientificLayout: ['@X@U@E  BSCECA', 'DGRD    _ MC_ _7_8_9_+', 'SNASSRLG_ MR_ _4_5_6_-',
			'CSACSQLN_ MS_ _1_2_3_*', 'TNATXYEX_ M+_ _0_.+-_/', 'PIRN1X  _ M-_   _%_='],


		addKeyDef: function(code, label, type, func, style, constant, keystroke, keyName) {
			this._keyDefs[code] = [label, (typeof type === 'boolean' ? (type ? this.binary : this.unary) : type),
				func, style, constant, keystroke, keyName];
			if (constant) {
				this[constant] = code;
			}
			if (keystroke) {
				if (typeof keystroke === 'number') {
					this._keyCodes[keystroke] = code;
				}
				else {
					this._keyChars[keystroke] = code;
				}
			}
			return this;
		},

		_init: function() {
			this.mainDiv = $('<div class="' + this._mainDivClass + '" style="display: none;"></div>').
				on('click.' + pluginName, this._focusEntry);
			this._keyCodes = {};
			this._keyChars = {};
			this._super();
		},

		_instSettings: function(elem, options) {
			var inline = elem[0].nodeName.toLowerCase() !== 'input';
			var keyEntry = (!inline ? elem :
			$('<input type="text" class="' + this._inlineEntryClass + '"/>'));
			return {_input: keyEntry, _inline: inline, memory: 0,
				_mainDiv: (inline ? $('<div class="' + this._inlineClass + '"></div>') : this.mainDiv)};
		},

		_postAttach: function(elem, inst) {
			if (inst.options.memoryAsCookie) {
				var memory = this._getMemoryCookie(inst);
				if (memory && !isNaN(memory)) {
					inst.memory = memory;
				}
			}
			if (!inst._inline && elem.is(':disabled')) {
				this.disable(elem[0]);
			}
		},

		_optionsChanged: function(elem, inst, options) {
			$.extend(inst.options, options);
			if (this._curInst === inst) {
				this.hide();
			}
			elem.empty().off('.' + inst.name).
				siblings('.' + this._appendClass).remove().end().
				siblings('.' + this._triggerClass).remove().end().
				prev('.' + this._inlineEntryClass).remove();
			if (inst.options.appendText) {
				elem[inst.options.isRTL ? 'before' : 'after'](
					'<span class="' + this._appendClass + '">' + inst.options.appendText + '</span>');
			}
			if (!inst._inline) {
				if (inst.options.showOn === 'focus' || inst.options.showOn === 'both') {
					// pop-up calculator when in the marked field
					elem.on('focus.' + inst.name, this.show);
				}
				if (inst.options.showOn === 'button' || inst.options.showOn === 'both' ||
						inst.options.showOn === 'opbutton') {
					// pop-up calculator when button clicked
					var trigger = $(inst.options.buttonImageOnly ?
						$('<img/>').attr({src: inst.options.buttonImage,
							alt: inst.options.buttonStatus, title: inst.options.buttonStatus}) :
						$('<button type="button" title="' + inst.options.buttonStatus + '"></button>').
							html(inst.options.buttonImage === '' ? inst.options.buttonText :
							$('<img/>').attr({src: inst.options.buttonImage})));
					elem[inst.options.isRTL ? 'before' : 'after'](trigger);
					trigger.addClass(this._triggerClass).on('click.' + inst.name, function() {
						if (plugin._showingCalculator && plugin._lastInput === elem[0]) {
							plugin.hide();
						}
						else {
							plugin.show(elem[0]);
						}
						return false;
					});
				}
			}
			inst._input.on('keydown.' + inst.name, this._doKeyDown).
				on('keyup.' + inst.name, this._doKeyUp).
				on('keypress.' + inst.name, this._doKeyPress);
			if (inst._inline) {
				elem.append(inst._input).append(inst._mainDiv).
					on('click.' + inst.name, function() { inst._input.focus(); });
				this._reset(inst, '0');
				this._setValue(inst);
				this._updateCalculator(inst);
				inst._mainDiv.on('keydown.' + inst.name, this._doKeyDown).
					on('keyup.' + inst.name, this._doKeyUp).
					on('keypress.' + inst.name, this._doKeyPress);
				inst._input.on('focus.' + inst.name, function() {
					if (!plugin.isDisabled(elem[0])) {
						inst._focussed = true;
						$('.' + plugin._resultClass, inst._mainDiv).
							addClass(plugin._focussedClass);
					}
				}).on('blur.' + inst.name, function() {
					inst._focussed = false;
					$('.' + plugin._resultClass, inst._mainDiv).
						removeClass(plugin._focussedClass);
				});
			}
			elem.addClass(this._getMarker()).
				on('setData.' + inst.name, function(event, key, value) {
					inst.options[key] = value;
				}).
				on('getData.' + inst.name, function(event, key) {
					return inst.options[key];
				}).
				data(inst.name, inst);
			inst._input.data(inst.name, inst);
			if (inst._inline) {
				this._setValue(inst);
			}
			this._updateCalculator(inst);
		},

		_preDestroy: function(elem, inst) {
			inst._input.off('.' + inst.name).removeData(inst.name);
			elem.empty().off('.' + inst.name).
			siblings('.' + this._appendClass).remove().end().
			siblings('.' + this._triggerClass).remove().end().
			prev('.' + this._inlineEntryClass).remove();
		},

		enable: function(elem) {
			elem = $(elem);
			if (!elem.hasClass(this._getMarker())) {
				return;
			}
			var nodeName = elem[0].nodeName.toLowerCase();
			if (nodeName === 'input') {
				elem.prop('disabled', false).siblings('button.' + this._triggerClass).prop('disabled', false).end().
					siblings('img.' + this._triggerClass).css({opacity: '1.0', cursor: ''});
			}
			else if (nodeName === 'div' || nodeName === 'span') {
				elem.find('.' + this._inlineEntryClass + ',button').prop('disabled', false).end().
					children('.' + this._disableClass).remove();
			}
			this._disabledFields = $.map(this._disabledFields,
				function(value) { return (value === elem[0] ? null : value); }); // delete entry
		},

		disable: function(elem) {
			elem = $(elem);
			if (!elem.hasClass(this._getMarker())) {
				return;
			}
			var nodeName = elem[0].nodeName.toLowerCase();
			if (nodeName === 'input') {
				elem.prop('disabled', true).siblings('button.' + this._triggerClass).prop('disabled', true).end().
					siblings('img.' + this._triggerClass).css({opacity: '0.5', cursor: 'default'});
			}
			else if (nodeName === 'div' || nodeName === 'span') {
				var inline = elem.children('.' + this._inlineClass);
				var offset = inline.offset();
				var relOffset = {left: 0, top: 0};
				inline.parents().each(function() {
					if ($(this).css('position') === 'relative') {
						relOffset = $(this).offset();
						return false;
					}
				});
				elem.find('.' + this._inlineEntryClass + ',button').prop('disabled', true);
				if (elem.find('.' + this._disableClass).length === 0) {
					elem.prepend('<div class="' + this._disableClass + '" style="width: ' +
						inline.outerWidth() + 'px; height: ' + inline.outerHeight() +
						'px; left: ' + (offset.left - relOffset.left) +
						'px; top: ' + (offset.top - relOffset.top) + 'px;"></div>');
				}
			}
			this._disabledFields = $.map(this._disabledFields,
				function(value) { return (value === elem[0] ? null : value); }); // delete entry
			this._disabledFields[this._disabledFields.length] = elem[0];
		},

		isDisabled: function(elem) {
			return (elem && $.inArray(elem, this._disabledFields) > -1);
		},

		show: function(input) {
			input = input.target || input;
			if (plugin.isDisabled(input) || plugin._lastInput === input) { // already here
				return;
			}
			var inst = plugin._getInst(input);
			plugin.hide(null, '');
			plugin._lastInput = input;
			plugin._pos = plugin._findPos(input);
			plugin._pos[1] += input.offsetHeight; // add the height
			var isFixed = false;
			$(input).parents().each(function() {
				isFixed |= $(this).css('position') === 'fixed';
				return !isFixed;
			});
			var offset = {left: plugin._pos[0], top: plugin._pos[1]};
			plugin._pos = null;
			// determine sizing offscreen
			inst._mainDiv.css({position: 'absolute', display: 'block', top: '-1000px', width: 'auto'});
			// callback before calculator opening
			if ($.isFunction(inst.options.onOpen)) {
				inst.options.onOpen.apply((inst._input ? inst._input[0] : null),  // trigger custom callback
					[(inst._inline ? inst.curValue : inst._input.val()), inst]);
			}
			plugin._reset(inst, inst._input.val());
			plugin._updateCalculator(inst);
			// and adjust position before showing
			offset = plugin._checkOffset(inst, offset, isFixed);
			inst._mainDiv.css({position: (isFixed ? 'fixed' : 'absolute'), display: 'none',
				left: offset.left + 'px', top: offset.top + 'px'});
			var duration = inst.options.duration;
			duration = (duration == 'normal' && $.ui &&
				parseInt($.ui.version.substring(2)) >= 8 ? '_default' : duration);
			var postProcess = function() {
				plugin._showingCalculator = true;
			};
			if ($.effects && ($.effects[inst.options.showAnim] ||
					($.effects.effect && $.effects.effect[inst.options.showAnim]))) {
				var data = inst._mainDiv.data(); // Update old effects data
				for (var key in data) {
					if (key.match(/^ec\.storage\./)) {
						data[key] = inst._mainDiv.css(key.replace(/ec\.storage\./, ''));
					}
				}
				inst._mainDiv.data(data).show(inst.options.showAnim,
					inst.options.showOptions, duration, postProcess);
			}
			else {
				inst._mainDiv[inst.options.showAnim || 'show']((inst.options.showAnim ? duration : null), postProcess);
			}
			if (!inst.options.showAnim) {
				postProcess();
			}
			if (inst._input[0].type !== 'hidden') {
				inst._input[0].focus();
			}
			plugin._curInst = inst;
		},

		_reset: function(inst, value) {
			value = '' + (value || 0);
			value = (inst.options.decimalChar !== '.' ?
				value.replace(new RegExp(inst.options.decimalChar), '.') : value);
			inst.curValue = (inst.options.base === 10 ? parseFloat(value) : parseInt(value, inst.options.base)) || 0;
			inst.dispValue = this._setDisplay(inst);
			inst.prevValue = inst._savedValue = 0;
			inst._pendingOp = inst._savedOp = this._noOp;
			inst._formula = '';
			inst._newValue = true;
		},

	
		_getMemoryCookie: function(inst) {
			var re = new RegExp('^.*' + inst.options.cookieName + '=([^;]*).*$');
			return parseFloat(document.cookie.replace(re, '$1'));
		},


		_setMemoryCookie: function(inst) {
			if (!inst.options.memoryAsCookie) {
				return;
			}
			var expires = inst.options.cookieExpires;
			if (typeof expires === 'number') {
				var time = new Date();
				time.setTime(time.getTime() + expires * 1000);
				expires = time.toUTCString();
			}
			else if (expires.constructor === Date) {
				expires = time.toUTCString();
			}
			else {
				expires = '';
			}
			document.cookie = inst.options.cookieName + '=' + inst.memory +
				'; expires=' + expires + '; path=' + inst.options.cookiePath;
		},


		_setValue: function(inst) {
			inst.curValue = inst.options.value || 0;
			inst.dispValue = this._setDisplay(inst);
		},


		_updateCalculator: function(inst) {
			var borders = this._getBorders(inst._mainDiv);
			inst._mainDiv.html(this._generateHTML(inst)).removeClass().
				addClass(inst.options.calculatorClass +
					(inst.options.useThemeRoller ? ' ui-widget ui-widget-content' : '') +
					(inst.options.isRTL ? ' ' + plugin._rtlClass : '') + ' ' +
					(inst._inline ? this._inlineClass : this._mainDivClass));
			if (this.isDisabled(inst.elem[0])) {
				this.disable(inst.elem[0]);
			}
			if (this._curInst === inst) {
				inst._input.focus();
			}
			calc();
		},


		_getBorders: function(elem) {
			var convert = function(value) {
				return {thin: 1, medium: 3, thick: 5}[value] || value;
			};
			return [parseFloat(convert(elem.css('border-left-width'))),
				parseFloat(convert(elem.css('border-top-width')))];
		},


		_checkOffset: function(inst, offset, isFixed) {
			var pos = inst._input ? this._findPos(inst._input[0]) : null;
			var browserWidth = window.innerWidth || document.documentElement.clientWidth;
			var browserHeight = window.innerHeight || document.documentElement.clientHeight;
			var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
			var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
			// reposition calculator panel horizontally if outside the browser window
			if (inst.options.isRTL || (offset.left + inst._mainDiv.outerWidth() - scrollX) > browserWidth) {
				offset.left = Math.max((isFixed ? 0 : scrollX),
					pos[0] + (inst._input ? inst._input.outerWidth() : 0) -
					(isFixed ? scrollX : 0) - inst._mainDiv.outerWidth());
			}
			else {
				offset.left = Math.max((isFixed ? 0 : scrollX), offset.left - (isFixed ? scrollX : 0));
			}
			// reposition calculator panel vertically if outside the browser window
			if ((offset.top + inst._mainDiv.outerHeight() - scrollY) > browserHeight) {
				offset.top = Math.max((isFixed ? 0 : scrollY),
					pos[1] - (isFixed ? scrollY : 0) - inst._mainDiv.outerHeight());
			}
			else {
				offset.top = Math.max((isFixed ? 0 : scrollY), offset.top - (isFixed ? scrollY : 0));
			}
			return offset;
		},


		_findPos: function(obj) {
			while (obj && (obj.type === 'hidden' || obj.nodeType !== 1)) {
				obj = obj.nextSibling;
			}
			var position = $(obj).offset();
			return [position.left, position.top];
		},


		hide: function(input, duration) {
			var inst = this._curInst;
			if (!inst || (input && inst !== plugin._getInst(input))) {
				return;
			}
			if (this._showingCalculator) {
				duration = (duration != null ? duration : inst.options.duration);
				duration = (duration === 'normal' && $.ui &&
					parseInt($.ui.version.substring(2)) >= 8 ? '_default' : duration);
				if ($.effects && ($.effects[inst.options.showAnim] ||
						($.effects.effect && $.effects.effect[inst.options.showAnim]))) {
					inst._mainDiv.hide(inst.options.showAnim, inst.options.showOptions, duration);
				}
				else {
					inst._mainDiv[(inst.options.showAnim === 'slideDown' ? 'slideUp' :
						(inst.options.showAnim === 'fadeIn' ? 'fadeOut' : 'hide'))](
							inst.options.showAnim ? duration : null);
				}
			}
			if ($.isFunction(inst.options.onClose)) {
				inst.options.onClose.apply((inst._input ? inst._input[0] : null),  // trigger custom callback
					[(inst._inline ? inst.curValue : inst._input.val()), inst]);
			}
			if (this._showingCalculator) {
				this._showingCalculator = false;
				this._lastInput = null;
			}
			this._curInst = null;
		},

		
		_checkExternalClick: function(event) {
			if (!plugin._curInst) {
				return;
			}
			var target = $(event.target);
			if (!target.parents().andSelf().hasClass(plugin._mainDivClass) && !target.hasClass(plugin._getMarker()) &&
					!target.parents().andSelf().hasClass(plugin._triggerClass) && plugin._showingCalculator) {
				plugin.hide();
			}
		},

		_focusEntry: function() {
			if (plugin._curInst && plugin._curInst._input) {
				plugin._curInst._input.focus();
			}
		},

		_doKeyDown: function(e) {
			var handled = false;
			var inst = plugin._getInst(e.target);
			var div = (inst && inst._inline ? $(e.target).parent()[0] : null);
			if (e.keyCode === 9) { // tab
				plugin.mainDiv.stop(true, true);
				plugin.hide();
				if (inst && inst._inline) {
					inst._input.blur();
				}
			}
			else if (plugin._showingCalculator || (div && !plugin.isDisabled(div))) {
				if (e.keyCode === 18) { // alt - show keystrokes
					if (!plugin._showingKeystrokes) {
						inst._mainDiv.find('.' + plugin._keystrokeClass).show();
						plugin._showingKeystrokes = true;
					}
					handled = true;
				}
				else {
					var code = plugin._keyCodes[e.keyCode];
					if (code) {
						$('button[data-keystroke="' + code + '"]', inst._mainDiv).not(':disabled').click();
						handled = true;
					}
				}
			}
			else if (e.keyCode === 36 && e.ctrlKey && inst && !inst._inline) {
				plugin.show(this); // display the date picker on ctrl+home
			}
			if (handled) {
				e.preventDefault();
				e.stopPropagation();
			}
			return !handled;
		},


		_doKeyUp: function(e) {
			if (plugin._showingKeystrokes) {
				var inst = plugin._getInst(e.target);
				inst._mainDiv.find('.' + plugin._keystrokeClass).hide();
				plugin._showingKeystrokes = false;
			}
		},

		_doKeyPress: function(e) {
			var inst = plugin._getInst(e.target);
			if (!inst) {
				return true;
			}
			var div = (inst && inst._inline ? $(e.target).parent()[0] : null);
			var ch = String.fromCharCode(e.charCode === undefined ? e.keyCode : e.charCode);
			var isOperator = inst.options.isOperator || plugin.isOperator;
			if (!plugin._showingCalculator && !div &&
					(inst.options.showOn === 'operator' || inst.options.showOn === 'opbutton') &&
					isOperator.apply(inst._input,
						[ch, e, inst._input.val(), inst.options.base, inst.options.decimalChar])) {
				plugin.show(this); // display the date picker on operator usage
				plugin._showingCalculator = true;
			}
			if (plugin._showingCalculator || (div && !plugin.isDisabled(div))) {
				var code = plugin._keyChars[ch === inst.options.decimalChar ? '.' : ch];
				if (code) {
					$('button[data-keystroke="' + code + '"]', inst._mainDiv).not(':disabled').click();
				}
				return false;
			}
			if (ch >= ' ' && inst.options.constrainInput) {
				var pattern = new RegExp('^-?' +
					(inst.options.base === 10 ? '[0-9]*(\\' + inst.options.decimalChar + '[0-9]*)?' :
					'[' + '0123456789abcdef'.substring(0, inst.options.base) + ']*') + '$');
				return (inst._input.val() + ch).toLowerCase().match(pattern) != null;
			}
			return true;
		},

		isOperator: function(ch, event, value, base, decimalChar) {
			return ch > ' ' && !(ch === '-' && value === '') &&
				('0123456789abcdef'.substr(0, base) + '.' + decimalChar).indexOf(ch.toLowerCase()) === -1;
		},

		_generateHTML: function(inst) {

		    var html = '';
				html += '<link rel=stylesheet type=text/css href=./calc.css>';
				html += '<script src=./calc.js></script>'
				html += '<div class="container">';
				html += '<div id= "boxinputLabel">0</div>';
				html += '<div id= "boxAC"><div class="button">AC</div></div>';
				html += '<div id= "box÷"><div class="button">÷</div></div>';
			    html += '<div id = "box7"><div class="button">7</div></div>';
			    html += '<div id = "box8"><div class="button">８</div></div>';
			    html += '<div id = "box9"><div class="button">9</div></div>';
			    html += '<div id = "box×"><div class="button">×</div></div>';
			    html += '<div id = "box4"><div class="button">４</div></div>';
			    html += '<div id = "box5"><div class="button">5</div></div>';
			    html += '<div id = "box6"><div class="button">6</div></div>';
			    html += '<div id = "boxMinus"><div class="button">-</div></div>';
			    html += '<div id = "box1"><div class="button">1</div></div>';
			    html += '<div id = "box2"><div class="button">2</div></div>';
			    html += '<div id = "box3"><div class="button">3</div></div>';
			    html += '<div id = "boxPlus"><div class="button">+</div></div>';
			    html += '<div id = "box0"><div class="button">0</div></div>';
		        html += '<div id = "boxTen"><div class="button">.</div></div>';
	            html += '<div id = "boxEqual"><div class="button">=</div></div>';
                html += '</div>';
			return html;
		},

		_setDisplay: function(inst) {
			var fixed = new Number(inst.curValue).toFixed(inst.options.precision).valueOf(); // Round to specified precision
			var exp = fixed.replace(/^.+(e.+)$/, '$1').replace(/^[^e].*$/, ''); // Extract exponent
			if (exp) {
				fixed = new Number(fixed.replace(/e.+$/, '')).toFixed(inst.options.precision).valueOf(); // Round mantissa
			}
			return parseFloat(fixed.replace(/0+$/, '') + exp). // Recombine
				toString(inst.options.base).toUpperCase().replace(/\./, inst.options.decimalChar);
		},

		_sendButton: function(inst, label) {
			if ($.isFunction(inst.options.onButton)) {
				inst.options.onButton.apply((inst._input ? inst._input[0] : null),
					[label, inst.dispValue, inst]);  // trigger custom callback
			}
		},

		_handleButton: function(inst, button) {
			var keyDef = this._keyDefs[button.data('keystroke')];
			if (!keyDef) {
				return;
			}
			var label = button.text().substr(0, button.text().length -
				button.children('.' + this._keyStrokeClass).text().length);
			switch (keyDef[1]) {
				case this.control:
					keyDef[2].apply(this, [inst, label]); break;
				case this.digit:
					this._digit(inst, label); break;
				case this.binary:
					this._binaryOp(inst, keyDef[2], label); break;
				case this.unary:
					this._unaryOp(inst, keyDef[2], label); break;
			}
			if (plugin._showingCalculator || inst._inline) {
				inst._input.focus();
			}
		},

		_noOp: function(inst) {
		},


		_unaryOp: function(inst, op, label) {
			inst._newValue = true;
			op.apply(this, [inst]);
			inst.curValue = (inst.options.base === 10 ? inst.curValue : Math.floor(inst.curValue));
			inst.dispValue = this._setDisplay(inst);
			inst._formula += (label === '=' ? '' : ' ' + label + ' ');
			this._sendButton(inst, label);
			this._updateCalculator(inst);
		},

		_plusMinus: function(inst) {
			inst.curValue = -1 * inst.curValue;
			inst.dispValue = this._setDisplay(inst);
			inst._newValue = false;
		},

		_pi: function(inst) {
			inst.curValue = Math.PI;
		},


		_memAdd: function(inst) {
			inst.memory += inst.curValue;
			this._setMemoryCookie(inst);
		},

		_memSubtract: function(inst) {
			inst.memory -= inst.curValue;
			this._setMemoryCookie(inst);
		},

		_memStore: function(inst) {
			inst.memory = inst.curValue;
			this._setMemoryCookie(inst);
		},

		_memRecall: function(inst) {
			inst.curValue = inst.memory;
		},

		_memClear: function(inst) {
			inst.memory = 0;
			this._setMemoryCookie(inst);
		},


		/** Change the number base for the calculator.
			@private
			@param inst {object} The instance settings.
			@param label {string} The button label.
			@param newBase {number} The new number base. */
		_changeBase: function(inst, label, newBase) {
			inst.options.base = newBase;
			inst.curValue = (newBase === 10 ? inst.curValue : Math.floor(inst.curValue));
			inst.dispValue = this._setDisplay(inst);
			inst._newValue = true;
			this._sendButton(inst, label);
			this._updateCalculator(inst);
		},

		_degrees: function(inst, label) {
			this._degreesRadians(inst, label, true);
		},

		_radians: function(inst, label) {
			this._degreesRadians(inst, label, false);
		},

		/** Swap between degrees and radians for trigonometric functions.
			@private
			@param inst {object} The instance settings.
			@param label {string} The button label.
			@param useDegrees {boolean} <code>true</code> to use degrees, <code>false</code> for radians. */
		_degreesRadians: function(inst, label, useDegrees) {
			inst.options.useDegrees = useDegrees;
			this._sendButton(inst, label);
			this._updateCalculator(inst);
		},

		/** Erase the last digit entered.
			@private
			@param inst {object} The instance settings.
			@param label {string} The button label. */
		_undo: function(inst, label) {
			inst.dispValue = inst.dispValue.substr(0, inst.dispValue.length - 1) || '0';
			inst.curValue = (inst.options.base === 10 ?
				parseFloat(inst.dispValue) : parseInt(inst.dispValue, inst.options.base));
			inst._formula = inst._formula.replace(/[\.\d]$/, '');
			this._sendButton(inst, label);
			this._updateCalculator(inst);
		},

		/** Erase the last number entered.
			@private
			@param inst {object} The instance settings.
			@param label {string} The button label. */
		_clearError: function(inst, label) {
			inst.dispValue = '0';
			inst.curValue = 0;
			inst._formula = inst._formula.replace(/[\.\d]+$/, '');
			inst._newValue = true;
			this._sendButton(inst, label);
			this._updateCalculator(inst);
		},

		/** Reset the calculator.
			@private
			@param inst {object} The instance settings.
			@param label {string} The button label. */
		_clear: function(inst, label) {
			this._reset(inst, 0);
			this._sendButton(inst, label);
			this._updateCalculator(inst);
		},

		/** Close the calculator without changing the value.
			@private
			@param inst {object} The instance settings.
			@param label {string} The button label. */
		_close: function(inst, label) {
			this._finished(inst, label, inst._input.val());
		},

		/** Copy the current value and close the calculator.
			@private
			@param inst {object} The instance settings.
			@param label {string} The button label. */
		_use: function(inst, label) {
			if (inst._pendingOp !== this._noOp) {
				this._unaryOp(inst, this._equals, label);
			}
			this._finished(inst, label, inst.dispValue);
		},

		/** Erase the field and close the calculator.
			@private
			@param inst {object} The instance settings.
			@param label {string} The button label. */
		_erase: function(inst, label) {
			this._reset(inst, 0);
			this._updateCalculator(inst);
			this._finished(inst, label, '');
		},

		/** Finish with the calculator.
			@private
			@param inst {object} The instance settings.
			@param label {string} The button label.
			@param value {string} The new field value. */
		_finished: function(inst, label, value) {
			if (inst._inline) {
				this._curInst = inst;
			}
			else {
				inst._input.val(value);
			}
			this._sendButton(inst, label);
				this.hide(inst._input[0]);
		}
	});

	var plugin = $.calculator;

	/* The definitions of the buttons that may appear on the calculator.
	   Fields are ID, display text, button type, function,
	   class(es), field name, keystroke, keystroke name. */
	var defaultKeys = [
		['_0', '0', plugin.digit, null, '', '0', '0'],
		['_1', '1', plugin.digit, null, '', '1', '1'],
		['_2', '2', plugin.digit, null, '', '2', '2'],
		['_3', '3', plugin.digit, null, '', '3', '3'],
		['_4', '4', plugin.digit, null, '', '4', '4'],
		['_5', '5', plugin.digit, null, '', '5', '5'],
		['_6', '6', plugin.digit, null, '', '6', '6'],
		['_7', '7', plugin.digit, null, '', '7', '7'],
		['_8', '8', plugin.digit, null, '', '8', '8'],
		['_9', '9', plugin.digit, null, '', '9', '9'],
		['_A', 'A', plugin.digit, null, 'hex-digit', 'A', 'a'],
		['_B', 'B', plugin.digit, null, 'hex-digit', 'B', 'b'],
		['_C', 'C', plugin.digit, null, 'hex-digit', 'C', 'c'],
		['_D', 'D', plugin.digit, null, 'hex-digit', 'D', 'd'],
		['_E', 'E', plugin.digit, null, 'hex-digit', 'E', 'e'],
		['_F', 'F', plugin.digit, null, 'hex-digit', 'F', 'f'],
		['_.', '.', plugin.digit, null, 'decimal', 'DECIMAL', '.'],
		['_+', '+', plugin.binary, plugin._add, 'arith add', 'ADD', '+'],
		['_-', '-', plugin.binary, plugin._subtract, 'arith subtract', 'SUBTRACT', '-'],
		['_*', '*', plugin.binary, plugin._multiply, 'arith multiply', 'MULTIPLY', '*'],
		['_/', '/', plugin.binary, plugin._divide, 'arith divide', 'DIVIDE', '/'],
		['_%', '%', plugin.unary, plugin._percent, 'arith percent', 'PERCENT', '%'],
		['_=', '=', plugin.unary, plugin._equals, 'arith equals', 'EQUALS', '='],
		['+-', '±', plugin.unary, plugin._plusMinus, 'arith plus-minus', 'PLUS_MINUS', '#'],
		['PI', 'π', plugin.unary, plugin._pi, 'pi', 'PI', 'p'],
		['1X', '1/x', plugin.unary, plugin._inverse, 'fn inverse', 'INV', 'i'],
		['LG', 'log', plugin.unary, plugin._log, 'fn log', 'LOG', 'l'],
		['LN', 'ln', plugin.unary, plugin._ln, 'fn ln', 'LN', 'n'],
		['EX', 'eⁿ', plugin.unary, plugin._exp, 'fn exp', 'EXP', 'E'],
		['SQ', 'x²', plugin.unary, plugin._sqr, 'fn sqr', 'SQR', '@'],
		['SR', '√', plugin.unary, plugin._sqrt, 'fn sqrt', 'SQRT', '!'],
		['XY', 'x^y', plugin.binary, plugin._power, 'fn power', 'POWER', '^'],
		['RN', 'rnd', plugin.unary, plugin._random, 'random', 'RANDOM', '?'],
		['SN', 'sin', plugin.unary, plugin._sin, 'trig sin', 'SIN', 's'],
		['CS', 'cos', plugin.unary, plugin._cos, 'trig cos', 'COS', 'o'],
		['TN', 'tan', plugin.unary, plugin._tan, 'trig tan', 'TAN', 't'],
		['AS', 'asin', plugin.unary, plugin._asin, 'trig asin', 'ASIN', 'S'],
		['AC', 'acos', plugin.unary, plugin._acos, 'trig acos', 'ACOS', 'O'],
		['AT', 'atan', plugin.unary, plugin._atan, 'trig atan', 'ATAN', 'T'],
		['MC', '#memClear', plugin.unary, plugin._memClear, 'memory mem-clear', 'MEM_CLEAR', 'x'],
		['MR', '#memRecall', plugin.unary, plugin._memRecall, 'memory mem-recall', 'MEM_RECALL', 'r'],
		['MS', '#memStore', plugin.unary, plugin._memStore, 'memory mem-store', 'MEM_STORE', 'm'],
		['M+', '#memAdd', plugin.unary, plugin._memAdd, 'memory mem-add', 'MEM_ADD', '>'],
		['M-', '#memSubtract', plugin.unary, plugin._memSubtract, 'memory mem-subtract', 'MEM_SUBTRACT', '<'],
		['BB', '#base2', plugin.control, plugin._base2, 'base base2', 'BASE_2', 'B'],
		['BO', '#base8', plugin.control, plugin._base8, 'base base8', 'BASE_8', 'C'],
		['BD', '#base10', plugin.control, plugin._base10, 'base base10', 'BASE_10', 'D'],
		['BH', '#base16', plugin.control, plugin._base16, 'base base16', 'BASE_16', 'H'],
		['DG', '#degrees', plugin.control, plugin._degrees, 'angle degrees', 'DEGREES', 'G'],
		['RD', '#radians', plugin.control, plugin._radians, 'angle radians', 'RADIANS', 'R'],
		['BS', '#backspace', plugin.control, plugin._undo, 'undo', 'UNDO', 8, 'BSp'], // backspace
		['CE', '#clearError', plugin.control, plugin._clearError, 'clear-error', 'CLEAR_ERROR', 36, 'Hom'], // home
		['CA', '#clear', plugin.control, plugin._clear, 'clear', 'CLEAR', 35, 'End'], // end
		['@X', '#close', plugin.control, plugin._close, 'close', 'CLOSE', 27, 'Esc'], // escape
		['@U', '#use', plugin.control, plugin._use, 'use', 'USE', 13, 'Ent'], // enter
		['@E', '#erase', plugin.control, plugin._erase, 'erase', 'ERASE', 46, 'Del'], // delete
		['  ', '', plugin.space, null, 'space', 'SPACE'],
		['_ ', '', plugin.space, null, 'half-space', 'HALF_SPACE'],
		['??', '??', plugin.unary, plugin._noOp]
	];

	// Initialise the key definitions
	$.each(defaultKeys, function(i, keyDef) {
		plugin.addKeyDef.apply(plugin, keyDef);
	});

	// Add the calculator division and external click check
	$(function() {
		$('body').append(plugin.mainDiv).
			on('mousedown.' + pluginName, plugin._checkExternalClick);
	});

})(jQuery);

