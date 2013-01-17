namespace.module('gdg.main', function (exports, requires) {
    $(document).ready(init);

    var isTouchDevice;
    var overflowing;
    var touch;
    var minDistance2 = 4 * 4;
    var targetNumber;
    var totalScore = 0;
    var previousCorrect = false;
    var currentStreak = 1;
    var currentTryNumber = 1;
    var timerCounter = 0;
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
        }
            
        if($(window).height() < 550) {
            $('body').addClass('mobile');
        }  
        
        calculateTotalScore();      
        
        var windowHeight = $(window).height();
        var windowWidth = $(window).width();
        //alert(windowWidth + " " + windowHeight);
		
		$('body').addClass('default');		
		
		$('#evaluate').click(onEval);
		newProblem();
		//guessTimer(timerCounter);
		//while(timerCounter < 10) {
			//timerId;
		//}
		//timerId;
		
		$('.keyboard td:not(.disabled)').on(upEventStr, onKeyboard);
			
        $(window).on('resize', onResize);
    }
});
