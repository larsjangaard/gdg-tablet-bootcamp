// An example Backbone application contributed by
// [Jérôme Gravel-Niquet](http://jgn.me/).
//
// 2012-01-10: mckoss Modified to use App Engine back end

namespace.module('gdg.math', function (exports, requires) {
    $(document).ready(init);

    var isTouchDevice;
    var overflowing;
    var touch;
    var minDistance2 = 4 * 4;
    var targetNumber;
    var totalScore = 0;
    var previousCorrect = true;
    var currentStreak = 1;
    var currentTryNumber = 1;
    var timerCounter = 0;
    var multiplierArray = [];
    var popContent = document.createElement('table');
    var popOverContent = '<table id="scorePopover"><tbody>';
    var popOverContentEnd = '</tbody></table>';
    
    
    var multiplierModifiers = {};
	    multiplierModifiers['multi'] = 0.10;
    	multiplierModifiers['divis'] = 0.10;
	    multiplierModifiers['multiDivis'] = 0.25;
    	multiplierModifiers['allFour'] = 0.50;
	    multiplierModifiers['noAdvanced'] = -0.25;
    	multiplierModifiers['inVar'] = -0.25;
	    multiplierModifiers['outVar'] = 0.25;
    
    //var timerId = setInterval(guessTimer(timerCounter),1000);

    function init() {

    
        // check if touch device (from Modernizr)
        isTouchDevice = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
		
        upEventStr = isTouchDevice ? 'touchend' : 'mouseup';
		
        if (isTouchDevice) {
            $(document).on('touchstart', function (e) {
                if (e.target == $('body')[0]) {
                    e.preventDefault();
                }
            });
            $('body').addClass('mobile');
            $('body').css('padding-top','20px');
        }
            
        if($(window).height() < 550) {
            //$('body').addClass('mobile');
        }  
        
        calculateTotalScore(0);      
        
        var windowHeight = $(window).height();
        var windowWidth = $(window).width();
        //alert(windowWidth + " " + windowHeight);
		
		$('body').addClass('default');		
		
		$('#evaluate').click(onEval);
		newProblem();
		
		$('.keyboard td:not(.disabled)').on(upEventStr, onKeyboard);
        $(window).on('resize', onResize);
    }
    
    function onKeyboard(evt) {
    	var key = $(evt.target).text();
    	
    	if(key == 'CLR') { 
  			$('#formula').val(''); 
  			
  			removeAllAlertsBut('default');
  			return;		
    	}
    	
    	if(key == 'GO') {
    		onEval();
    		return;
    	}
    	
  		var formula = $('#formula').val() + $(evt.target).text(); 
  		$('#formula').val(formula); 	
    }
	
	function newProblem() {
		multiplierArray = [];
		targetNumber = 20 + Math.floor(Math.random()*180);
		$('#targetNumber').text(targetNumber);
		$('#formula').val('');		
	}
	
	function calculateTotalScore(isCorrect, operators, variance) {
		//var totalAdj = operators + variance;
		var adjustment = 0;
		var mltplr = 1;
		var baseMltplr = 100;
		$('[rel="clickover"]').clickover();
		console.log('Cor: ' + isCorrect + ' ' + 'OPER: ' + operators + ' ' + variance);
		//console.log('TotalAdj: ' + totalAdj);
		
		popOverContent = popOverContent + '<tr><td>Streak</td><td>' + currentStreak + '</td></tr>';
		console.log(popContent);
		
		for(var i = 0; i < multiplierArray.length ; i++) {
			console.log(multiplierModifiers[multiplierArray[i].multiplier] + ' ' + multiplierArray[i].multiplier);
			var appendPO = '<tr><td>' + multiplierArray[i].multiplier + '</td><td>' + multiplierModifiers[multiplierArray[i].multiplier] + '</td></tr>';
			popOverContent = popOverContent + appendPO;
			aTabElem(multiplierArray[i].multiplier, multiplierModifiers[multiplierArray[i].multiplier]);
			mltplr = mltplr + parseFloat(multiplierModifiers[multiplierArray[i].multiplier]);
		}
		console.log(popContent);
		popOverContent = popOverContent + popOverContentEnd;
		console.log(popOverContent);
		mltplr = roundMultiplier(mltplr, 2);
		//console.log('MLTPLR: ' + mltplr);
		
		
		if(isCorrect == -1) {
			totalScore = totalScore - baseMltplr;
			currentStreak = 1;
		} else if(isCorrect == 0) {
			totalScore = totalScore;
			popcontent = document.createElement('table');
			popOverContent = '<table id="scorePopover"><tbody>';			
		} else {
		
			var scr = (baseMltplr*mltplr)*currentStreak;
			console.log('STREAK: ' + currentStreak + ' MLTPLR: ' + mltplr + ' TOTAL: ' + scr);
			if(scr >= 0) {
				$('#pointsScored').text('+' + (scr+currentStreak));
				$('#pointsScored').clickover({
					//id: 'scoreBreakdown',
					title: 'Multiplier: ' + mltplr*currentStreak,
					//trigger: 'hover',
					placement: 'left',
					onShown: function() {
						$('body').removeClass('multi');
					},
					html: 'true',
					auto_close: 2000,
					content: popOverContent
				});
				
				var coObject = $('#pointsScored').data('clickover');
				coObject.options.content = popContent;
				console.log(coObject);
				popOverContent = '<table id="scorePopover"><tbody>';
				aTabElem(0,0);
			} else {
				$('#pointsScored').text('-' + scr);
			}
			
			totalScore = totalScore + scr;
		}
		
		$('.calculatedScore').text(totalScore);
	}
	
	function onEval() {
		var formula = $('#formula').val();
		var answer = evaluateFunction(formula);
		var re = new RegExp(targetNumber);
		var m = re.exec(formula);
		var message;
		
		if(m != null) {
			message = 'Do not use the number!';
			
			previousCorrect = false;
			currentTryNumber = 0;
			// remove and add class
			calculateTotalScore(-1); 
			removeAllAlertsBut('sameNumber');			
			$('#sameNumber').text(message);	
			newProblem();			
		} else if(answer != targetNumber) {
			message = answer;
			
			previousCorrect = false;
			currentTryNumber++;
			
			// remove and add class
			removeAllAlertsBut('incorrect');
	        calculateTotalScore(0); 			
			
			$('#guess').text(message);
		} else {			
			removeAllAlertsBut('correct');
			calculateTotalScore(1, calcUses(formula), withinPercent(formula));
			//console.log(previousCorrect + ' ' + currentTryNumber);
			
			if(previousCorrect == true && currentTryNumber == 1) {
				currentStreak = currentStreak + 1;
				//console.log(currentStreak);
			}
			// generate new number
			previousCorrect = true;
			currentTryNumber = 1;
			newProblem();
		}
	}
	
	function evaluateFunction(functToEval) {
		//console.log(functToEval);
		functToEval = functToEval.replace(/✕/g,'*');
		functToEval = functToEval.replace(/÷/g,'/');
		functToEval = functToEval.replace(/−/g,'-');
		//console.log(functToEval);		
		var evalAnswer = eval(functToEval);
		return evalAnswer;
	}
	
	function calcUses(functToEval) {
		var multi = new RegExp('✕');
		var divis = new RegExp('÷');
		var aplus = new RegExp('\\+');
		var minus = new RegExp('−');
		
		var usesMulti = multi.test(functToEval);
		var usesDivis = divis.test(functToEval);
		var usesPlus = aplus.test(functToEval);
		var usesMinus = minus.test(functToEval);
		console.log('--: ' + usesMinus + ' ' + '++: ' + usesPlus);
		
		if(usesMulti == true && usesDivis == true) {
			var anObject = new multiArray('multiDivis');
			multiplierArray.push(anObject);
			
			anObject = new multiArray('multi');
			multiplierArray.push(anObject);
						
			anObject = new multiArray('divis');
			multiplierArray.push(anObject);
			
			console.log('multiDivis');
			console.log(multiplierArray);		
			return 1;
		} else if(usesMulti == true) {
			var anObject = new multiArray('multi');
			multiplierArray.push(anObject);		
			return 0;
		} else if(usesDivis == true) {
			var anObject = new multiArray('divis');
			multiplierArray.push(anObject);				
			return 0;
		} else {
			var anObject = new multiArray('noAdvanced');
			multiplierArray.push(anObject);		
			return -1;
		}
	}
	
	function withinPercent(functToEval) {
		var firstNumber = new RegExp("[0-9]+", "g");
		var outsideVar = false;
		var VARIANCE = 0.20;
		var numArray = functToEval.match(firstNumber);
		
		for(var i = 0; i < numArray.length; i++) {
			if(numArray[i] < (targetNumber*(1-VARIANCE)) || numArray[i] > (targetNumber*(1+VARIANCE))) {

				outsideVar = true;
			} else {
				var anObject = new multiArray('inVar');
				multiplierArray.push(anObject);	
				console.log('inVar added');			
				console.log(multiplierArray);			
				return false;
			}
		}
		
		if(outsideVar == true) {
			var anObject = new multiArray('outVar');
			multiplierArray.push(anObject);
			console.log('outVar added');
			console.log(multiplierArray);		
		}
		
		console.log('FIRST NUMBER: ' + numArray + ' ' + outsideVar);
		return outsideVar;
	}
	
	function removeAllAlertsBut(classToAdd) {
		var alertArray = new Array('default','correct','incorrect','sameNumber');
		
		for(var i = 0; i < alertArray.length; i++) {
			if(alertArray[i] == classToAdd) {
				$('body').addClass(classToAdd);
			} else {
				$('body').removeClass(alertArray[i]);
			}
		}
	}
	
	function multiArray(multiplier) {
		this.multiplier = multiplier;
	}
	
	function roundMultiplier(aMulti, dec) {
		var rounded = Math.round(aMulti*Math.pow(10,dec))/Math.pow(10,dec);
		return rounded;	
	}
	
	function aTabElem(cellName, multi) {
		if(cellName == 0 && multi == 0) {
			popContent = document.createElement('table');
			return;
		}

		var mName = {};
			mName['multi'] = '✕';
			mName['divis'] = '÷';
	    	mName['multiDivis'] = '✕ & ÷';
	    	mName['allFour'] = '✕ & ÷ & + & -';
		    mName['noAdvanced'] = 'No ✕ & ÷';
    		mName['inVar'] = 'Within Var';
		    mName['outVar'] = 'Outside Var';
		    mName['Streak'] = 'Streak';
		    
		console.log(cellName);
		var row = popContent.insertRow(0);
		var name = row.insertCell(0);
		var mult = row.insertCell(1);
		name.innerHTML = mName[cellName];
		mult.innerHTML = multi;
		popContent.className = 'scorePopover';
	}
});
