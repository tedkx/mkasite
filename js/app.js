window.mka = {
	baseurl: "http://localhost/",
	currentPaneId: '#home-pane',
	firstLoad: true,
	paneTransitionDur: 600,
	projectsInitialized: false,
	supportsCssTransitions: typeof((document.body || document.documentElement).style.transition) === 'string',

	homeLogoAnimationFn_: function(showHide) { console.error('No home logo hiding function set'); },
	transitionFn_: function($fromPane, $toPane) { console.error('No transition function set'); },
};

(function($) {
	var jsTransitionCallbackFn = function($fromPane, $toPane) {
		$fromPane.hide();
		$toPane.stop().show();
		if($fromPane.attr('id') === 'projects-pane') { $('#prj-showcase-close').click(); }
		if($toPane.attr('id') === 'projects-pane') {
			if(!window.mka.projectsInitialized) {
				$('#projects').isotope({ layoutMode: 'fitRows' });
				window.mka.projectsInitialized = true;
			}
		} 
		window.mka.homeLogoAnimationFn_($toPane.attr('id') === 'home-pane' ? 'hide' : 'show');
		$toPane.animate({ paddingTop: 0, opacity: 1},  window.mka.paneTransitionDur, 'easeOutQuart');
	};

	//wire up transition functions based on css3 transition existence
	//TODO: Uncomment when css transitions ready
	/*
	window.mka.transitionFn_ = window.mka.supportsCssTransitions
		? function($fromPane, $toPane) {
			alert('Animations not supported');
		}
		: function($fromPane, $toPane) {
			if(!$fromPane || $fromPane.length == 0) {
				window.mka.transitionCallbackFn_($fromPane, $toPane);
			} else {
				$fromPane.stop();
				$fromPane.animate({ paddingTop: '50px', opacity: 0 }, window.mka.paneTransitionDur, 'easeInQuart', function() {
					window.mka.transitionCallbackFn_($fromPane, $toPane);
				});
			}
		};
	*/
	window.mka.transitionFn_ = function($fromPane, $toPane) {
		if(!$fromPane || $fromPane.length == 0) {
			jsTransitionCallbackFn($fromPane, $toPane);
		} else {
			$fromPane.stop();
			$fromPane.animate({ paddingTop: '50px', opacity: 0 }, window.mka.paneTransitionDur, 'easeInQuart', function() {
				jsTransitionCallbackFn($fromPane, $toPane);
			});
		}
	};
	window.mka.homeLogoAnimationFn_ = window.mka.supportsCssTransitions
		? function(showHide) { console.log('css showhide',showHide);$('#logo').attr('class', showHide === 'hide' ? '' : 'expanded'); }
		: function(showHide) { 
			console.log('js showhide',showHide);
			var logo = $('#logo');
			if(showHide === 'hide' && logo.height() > 0) {
				logo.animate({ height: '0'}, window.mka.paneTransitionDur, 'easeInQuart');
			} else if(showHide === 'show' && logo.height() == 0) { 
				logo.animate({ height: '90px'}, window.mka.paneTransitionDur, 'easeOutQuart'); 
			}
		};
}(jQuery));

$(document).ready(function() {
	var urlparts = (window.location + '').split('/#'),
		html = '',
		projects = $('#projects'),
		scw = $('#prj-showcase-wrap'),
		sc = scw.find('#prj-showcase'),
		margin = parseInt(sc.css('margin-top').replace('px','')) + parseInt(sc.css('margin-bottom').replace('px','')) + parseInt($('#prj-showcase-separator').height()),
		sc_title = $('#prj-showcase-title'),
		sc_content = $('#prj-showcase-content'),
		sc_carousel = sc.find('#prj-showcase-carousel');
	$.each(window.sitedata.projects, function(index,item) {
		html += '<div class="project-wrap" title="' + item.title +'" data-category="' + item.category + '"><div class="overlay"></div><img src="' + window.mka.baseurl + "assets/" + item.thumb + '" alt="' + item.title + '" /><div class="caption-wrap"><div class="caption">' + item.title + '</div></div></div>';
	});
	projects.html(html);

	//menu item click transition
	$('.sidebar#menubar').find('ul.nav-sidebar').on('click', 'li a', function(evt) {
		var href = $(this).attr('href'),
			currentPane = $(window.mka.currentPaneId),
			targetPaneId = (href == '#' ? '#home' : href) + '-pane',
			targetPane = $(targetPaneId);
		if(window.mka.currentPaneId == targetPaneId && !window.mka.firstLoad) return;
		window.mka.firstLoad = false;
		window.mka.currentPaneId = targetPaneId;
		window.mka.transitionFn_(currentPane, targetPane);
	});

	//item height setters before project showcase transition
	var setShowcaseAutoHeight = function() { return scw.height('auto'); };
	var setShowcaseHeight = function() { return scw.height(sc.height() + margin); }

	//close button transition
	$('#prj-showcase-close').on('click',function() { 
		setShowcaseHeight().height(0);
		setTimeout(function() { scw.removeClass('showcasing'); }, 400);
	});	

	//load project to showcase ui
	var showcaseProject = function(title) {
		for(var i = 0;i < window.sitedata.projects.length; i++) { 
			if(window.sitedata.projects[i].title == title) {
				var html = '',
					prj = window.sitedata.projects[i];
				for(var i = 0; i < prj.images.length; i++) { html += '<div><img src="' + window.mka.baseurl + 'assets/' + prj.images[i] + '" /></div>'; }
				sc_title.html(prj.title);
				sc_content.html(prj.content);
				if(sc_carousel.hasClass('slick-initialized')) sc_carousel.slick('unslick');
				sc_carousel.html(html).slick({ dots:true, slidesToShow:1, variableWidth:true, adaptiveHeight: true });
				break;
			}
		}
	};

	//event listener on project thumbs
	projects.on('click','.project-wrap',function() {
		var title = $(this).attr('title');
		$('#projects-pane').animate({ scrollTop: 0 }, 1000, 'easeOutQuart', function() { console.log("animated")});
		if(!scw.hasClass('showcasing')) {
			showcaseProject(title);
			setShowcaseHeight().addClass('showcasing');
			setTimeout(setShowcaseAutoHeight, 500);
		} else {
			scw.addClass('transitioning');
			setTimeout(function() { 
				showcaseProject(title);
				setShowcaseHeight().removeClass('transitioning');
				setTimeout(setShowcaseAutoHeight, 500);
			},400);
		}
		return false;
	});

	//initial pane
	var initial = $('ul.nav.nav-sidebar li a[href=#' + (urlparts.length > 1 ? urlparts[1] : '') + ']');
	if(initial.length == 0) initial = $('ul.nav.nav-sidebar li a[href=#]');
	initial.click();
});