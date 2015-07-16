window.mka = {
	baseurl: "http://localhost/",
	currentPaneId: '#home-pane',
	firstLoad: true,
	paneTransitionDur: 0.6,
	projectTransitionDur: 0.4,
	projectsInitialized: false,
	supportsCssTransitions: typeof((document.body || document.documentElement).style.transition) === 'string',

	homeLogoAnimationFn_: function(showHide) { 
		console.log('js showhide',showHide);
		var logo = $('#logo');
		if(showHide === 'hide' && logo.height() > 0) {
			TweenLite.to(logo[0], window.mka.paneTransitionDur, { height: 0, ease: Power3.easeIn });
		} else if(showHide === 'show' && logo.height() == 0) { 
			TweenLite.to(logo[0], window.mka.paneTransitionDur, { height: '90px', ease: Power3.easeOut });
		}
	},
	jsTransitionCallbackFn: function($fromPane, $toPane) {
		if(!window.mka.firstLoad) $fromPane.hide();
		if($fromPane.attr('id') === 'projects-pane') { $('#prj-showcase-close').click(); }
		if($toPane.attr('id') === 'projects-pane') {
			$toPane.scrollTop(0);
			if(!window.mka.projectsInitialized) {
				$('#projects').isotope({ layoutMode: 'fitRows' });
				window.mka.projectsInitialized = true;
			}
		} 
		TweenLite.to('#' + $toPane.attr('id'), 0.5, { paddingTop: 0, opacity:1, ease: Power3.easeInOut });
	},
	switchPane: function(targetPaneId) {
		var currentPane = $(window.mka.currentPaneId),
			targetPane = $(targetPaneId);
		if(window.mka.currentPaneId == targetPaneId && !window.mka.firstLoad) return false;
		window.mka.currentPaneId = targetPaneId;
		window.mka.transitionFn_(currentPane, targetPane);
	},
	transitionFn_: function($fromPane,$toPane) {
		$toPane.show();
		if(window.mka.firstLoad) {
			console.log('first load',window.mka.firstLoad);
			window.mka.jsTransitionCallbackFn($fromPane,$toPane);
			window.mka.firstLoad = false;
		} else {
			TweenLite.to('#' + $fromPane.attr('id'), 0.5, { paddingTop: "50px", opacity:0, ease: Power3.easeInOut, onComplete: function() {
				window.mka.jsTransitionCallbackFn($fromPane,$toPane);
			}  });
		}
		window.mka.homeLogoAnimationFn_($toPane.attr('id') === 'home-pane' ? 'hide' : 'show');
	}
};

(function($) {
	
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
		html += '<div class="project-wrap" id="project-' + index + '" title="' + item.title +'" data-category="' + item.category + '"><div class="overlay"></div><img src="' + window.mka.baseurl + "assets/" + item.thumb + '" alt="' + item.title + '" /><div class="caption-wrap"><div class="caption">' + item.title + '</div></div></div>';
	});
	projects.html(html);

	$('.pane').addClass(window.mka.supportsCssTransitions ? 'pane-transition' : 'pane-js');

	//menu item click transition
	$('.sidebar#menubar').find('ul.nav-sidebar').on('click', 'li a', function(evt) {
		var href = $(this).attr('href')
		return window.mka.switchPane((href == '#' ? '#home' : href) + '-pane');
	});
	$('a.navbar-brand').click(function(evt) { window.mka.switchPane('#home-pane'); })

	//item height setters before project showcase transition
	var setShowcaseAutoHeight = function() { return scw.height('auto'); };
	var setShowcaseHeight = function() { return scw.height(sc.height() + margin); }

	//close button transition
	$('#prj-showcase-close').on('click',function() { 
		//setShowcaseHeight();
		TweenLite.to(scw[0], window.mka.projectTransitionDur, { height:0, opacity:0, ease: Power3.easeOut, onComplete: function() {
			scw.removeClass('showcasing');
		} });
	});	

	//load project to showcase ui
	var showcaseProject = function(id) {
		var html = '',
			prj = window.sitedata.projects[id];
		for(var i = 0; i < prj.images.length; i++) { html += '<div><img src="' + window.mka.baseurl + 'assets/' + prj.images[i] + '" /></div>'; }
		sc_title.html(prj.title);
		sc_content.html(prj.content);
		if(sc_carousel.hasClass('slick-initialized')) sc_carousel.slick('unslick');
		sc_carousel.html(html).slick({ dots:true, slidesToShow:1, variableWidth:true, adaptiveHeight: true });
	};

	//event listener on project thumbs
	projects.on('click','.project-wrap',function() {
		var id = $(this).attr('id').replace('project-','');
		TweenLite.to('#projects-pane', window.mka.projectTransitionDur, { scrollTop: 0, ease: Power3.easeOut });
		if(!scw.hasClass('showcasing')) {
			showcaseProject(id);
			scw.addClass('showcasing');
			TweenLite.to(scw[0], window.mka.projectTransitionDur, { opacity:1, height: (sc.height() + margin) + 'px', ease: Power3.easeOut, onComplete: function() {
				setShowcaseAutoHeight();	
			} });			
		} else {
			TweenLite.to(scw[0], window.mka.projectTransitionDur, { opacity:0, ease: Power0.easeNone, onComplete: function() {
				showcaseProject(id);
				scw.height(sc.height() + margin);
				TweenLite.to(scw[0], window.mka.projectTransitionDur, { opacity:1, ease: Power0.easeNone, onComplete: function() {
					setShowcaseAutoHeight();
				} });
			} });	
			
		}
		return false;
	});

	//initial pane
	var initial = $('ul.nav.nav-sidebar li a[href=#' + (urlparts.length > 1 ? urlparts[1] : '') + ']');
	if(initial.length == 0) initial = $('ul.nav.nav-sidebar li a[href=#]');
	initial.click();
});