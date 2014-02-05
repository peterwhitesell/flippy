var Flippy = (function(){
	var player = (function(){
		var top,
			velocity,
			acceleration;
		var elem = $('#player');

		return {
			setVelocity: function(v){
				velocity = v;
			},
			update: function(){
				top += velocity;
				velocity += acceleration;
			},
			draw: function(){
				 elem.css('top', top + '%');
			},
			setTop: function(t){
				top = t;
			},
			flap: function(){
				velocity = -1.68;
			},
			reset: function(){
				top = 20;
				velocity = -.48;
				acceleration = .118;
			},
			stop: function(){
				velocity = 0;
			}
		}
	})();
	var poles = (function(){
		var repositionInterval = null;
		var repositionTurn;

		var nextReposition = function(){
			var range = 50
			var gapSize = 25;
			var playHeight = 100 * (window.innerHeight - $('#ground').height()) / window.innerHeight;
			var middle = playHeight / 2;
			var zoneTop = middle + range / 2;

			var gapCenter = zoneTop - Math.random() * range;

			$('#poleBottom' + repositionTurn).css({
				top: gapCenter + gapSize/2 + '%'
			});
			$('#poleTop' + repositionTurn).css({
				bottom: (100 - gapCenter + gapSize/2) + '%'
			});
			repositionTurn %= 3;
			repositionTurn += 1;
		}
		return {
			reset: function(){
				repositionTurn = 1;
				$('.pole').css({
					top: '',
					bottom: '',
					right: ''
				});
				$('.pole').addClass('poleAnimated');
				repositionInterval = setInterval(nextReposition, turnLength * 1000);
			},
			stop: function(){
				clearInterval(repositionInterval);
				$('.pole').each(function(){
					$(this).css(
						'right',
						$(this).css('right')
					).removeClass('poleAnimated');
				});
			}
		}
	})();
	var score = (function(){
		var value = 0;
		var interval = null;
		var timeout = null;
		var start = function(){
			interval = setInterval(function(){
				inc();
				draw();
			}, turnLength * 1000);
		};
		var inc = function(){
			value += 1;
		};
		var draw = function(){
			$('#score').html(value);
		};
		return {
			reset: function(){
				value = 0;
				draw();
				timeout = setTimeout(start, turnLength * 1000 * 1.75);
			},
			stop: function(){
				clearInterval(interval);
				clearTimeout(timeout);
			}
		}
	})();

	var active = false;
	var playing = false;
	var turnLength = 1.25;
	var drawInterval = null;
	var updateInterval = null;

	var draw = function(){
		player.draw();
	};
	var stopProgress = function(){
		active = false;
		score.stop();
		poles.stop();
		player.stop();
	};
	var endGame = function(){
		playing = false;
		clearInterval(drawInterval);
		clearInterval(updateInterval);
	};
	var update = function(){
		player.update();
		if( overlaps($('#player'), $('#ground')) ){
			if( active ){
				stopProgress();
			}
			endGame();
		}
		$('.pole').each(function(){
			if( overlaps($('#player'), $(this)) && active ){
				stopProgress();
			}
		});
	};

	return {
		start: function(){
			endGame();
			active = true;
			playing = true;
			drawInterval = setInterval(function(){
				draw();
			}, 20);
			updateInterval = setInterval(function(){
				update();
			}, 20);
			poles.reset();
			player.reset();
			score.reset();
		},
		move: function(){
			player.flap();
		},
		active: function(){
			return active;
		},
		playing: function(){
			return playing;
		}
	};
})();

$(document).ready(function(){
	Flippy.start();
	$('#gameZone').mousedown(function(e){
		if( Flippy.active() ){
			Flippy.move();
		}
		if( !Flippy.playing() ){
			Flippy.start();
		}
	});
});

$(document).bind('pageinit', function(){
	var gameZone = $('#gameZone');
	gameZone.bind('vmousedown', function(){
		$('#player').css('background-color', 'black');
	});
});
