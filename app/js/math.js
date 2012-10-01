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

    function init() {
        // check if touch device (from Modernizr)
        isTouchDevice = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;

        if (isTouchDevice) {
            $(document).on('touchstart', function (e) {
                if (e.target == $('body')[0]) {
                    e.preventDefault();
                }
            });
        }
		
		$('#evaluate').click(onEval);
		newProblem();	
		
		$('.keyboard td:not(.disabled)').on('mousedown', onKeyboard);
			
        $(window).on('resize', onResize);
    }
    
    function onKeyboard(evt) {
    	var key = $(evt.target).text();
    	
    	if(key == 'CLR') { 
  			$('#formula').val(''); 
			$('body').removeClass('correct');
			$('body').removeClass('incorrect');				  			  
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
		targetNumber = 20 + Math.floor(Math.random()*180);
		$('#targetNumber').text(targetNumber);
	}
	
	function onEval() {
		var formula = $('#formula').val();
		var answer = eval(formula);
		
		if(answer != targetNumber) {
			$('body').removeClass('correct');		
			$('body').addClass('incorrect');
			$('#guess').text(answer);
		} else {
			$('body').addClass('correct');		
			$('body').removeClass('incorrect');
		}
	}
	
    function onTodoTouchstart(event) {
        if (event.target.classList == 'todo-text') {
            event = exposeTouchEvent(event);
            touch = [event.pageX, event.pageY];
        }
    }

    function onTodoTouchmove(event) {
        if (touch.length != 2) {
            return;
        }
        event = exposeTouchEvent(event);
        touch = [event.pageX, event.pageY];
    }

    function onTodoTouchend(event) {
        if (touch.length != 2) {
            return;
        }
        console.log('here');
        var $target = $(event.target).closest('li');
        event = exposeTouchEvent(event);
        var point = [event.pageX, event.pageY];

        console.log(distance2(touch, point));
        if (distance2(touch, point) < minDistance2) {
            console.log('hi');
            $target.addClass('editing');
            $target.find('input.todo-input').focus();
        }
    }

    function distance2(p1, p2) {
        console.log(p1[0], p1[1], p2[0], p2[1]);
        return Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2);
    }

    function onResize() {

    }

    function isOverflowing() {
        var bodyHeight = $('body').css('height');
        return parseInt(bodyHeight, 10) > window.innerHeight;
    }

    function getOrientation() {
        if (window.matchMedia) {
            var mql = window.matchMedia("(orientation: portrait)");
            if (mql.matches) {
                return 'portrait';
            } else {
                return 'landscape';
            }
            return;
        }
        if (window.innerWidth > window.innerHeight) {
            return 'landscape';
        } else {
            return 'portrait';
        }
    }

    // if is a touch event, expose the real touch event (to get at pageX/Y)
    function exposeTouchEvent(e) {
        if (e.originalEvent && e.originalEvent.touches && e.originalEvent.touches.length > 0) {
            return e.originalEvent.touches[0];
        }
        return e; // is not a touch event
    }
});
