window.mka = {
	baseUrl: (window.location.href + '').split('#')[0],
	currentPaneId: '#home-pane',
	firstLoad: true,
	mapCenter: { lat: 37.943497, lng: 23.6521346 },
	paneTransitionDur: 0.6,
	projectCache: { },
	projectIds: ['#projects','#private','#constructions','#subprojects'],
	projectTransitionDur: 0.5,
	projectsInitialized: false,
	map: null,
	mapStyles: [
		{
			featureType:"road",
			stylers:[{visibility:"simplified"},{saturation:-27},{gamma:1.8}]
		},
		{
			featureType:"landscape.natural",
			stylers:[{hue:"#ffbb00"},{saturation:54}]
		},
		{
			featureType:"road.local",
			stylers:[{hue:"#ff5e00"},{saturation:-24},{visibility:"simplified"},{lightness:28}]
		},
		{
			featureType:"road.highway",elementType:"geometry",
			stylers:[{hue:"#ff8800"},{saturation:-79},{lightness:-16},{visibility:"simplified"}]
		},
		{
			featureType:"road.arterial",
			elementType:"labels",
			stylers:[{saturation:-79},{visibility:"off"}]
		},
		{
			featureType:"water",
			stylers:[{visibility:"on"},{saturation:-85}]
		},
		{
			featureType:"road.highway",
			elementType:"labels",
			stylers:[{saturation:-67},{hue:"#ff9900"},{lightness:6},{visibility:"off"}]
		},
		{
			featureType:"road.arterial",
			elementType:"geometry",
			stylers:[{hue:"#ff6600"},{saturation:-75},{lightness:-21}]
		},
		{
			featureType:"poi",
			elementType:"labels",
			stylers:[{saturation:-84},{lightness:6},{visibility:"off"}]
		},
		{
			featureType:"transit.station",
			stylers:[{visibility:"off"}]
		},
		{
			featureType:"transit.line",
			stylers:[{visibility:"simplified"},{saturation:-27}]
		},
		{
			featureType:"poi.park",
			stylers:[{visibility:"on"},{saturation:-60},{gamma:1.91}]
		},
		{
			featureType:"poi.park",
			elementType:"labels",
			stylers:[{visibility:"off"}]
		},
		{
			featureType:"road.local",
			elementType:"labels",
			stylers:[{visibility:"on"}]
		},
		{
			featureType:"poi.attraction",
			stylers:[{saturation:-55}]
		}
	]
};

(function($) {
	
}(jQuery));

$(document).ready(function() {
	var urlparts = (window.location + '').split('/#'),
		html = '',
		menuButton = $('.navbar-toggle'),
		homeLink = $('ul.nav.nav-sidebar li a[href=#]'),
		projects = $('#projects'),
		scw = $('#prj-showcase-wrap'),
		sc = scw.find('#prj-showcase'),
		prjpane = $('#projects-pane'),
		margin = parseInt(sc.css('margin-top').replace('px','')) + parseInt(sc.css('margin-bottom').replace('px','')) + parseInt($('#prj-showcase-separator').height()),
		sc_content = $('#prj-showcase-content'),
		sc_footer = $('#prj-showcase-footer'),
		sc_carousel = sc.find('#prj-showcase-carousel'),
		sublist = $('.subnav ul'),
		subdiv = sublist.parent(),
		mapdiv = $('#address-map'),
		map = null;
	$.each(window.sitedata.projects, function(index,item) {
		var className = item.category == 1 ? 'construction' : item.category == 2 ? 'subproject' : 'private';
			linesClass = (item.title.length > 33) ? ' three-lines' : (item.title.length > 20) ? ' two-lines' : '';
		html += '<div class="project-wrap ' + className + '" id="project-' + index + '" title="' + item.title +'" data-category="' + item.category + '"><div class="overlay"></div><img src="img/thumbs/' + item.thumb + '" alt="' + item.title + '" /><div class="caption-wrap' + linesClass + '"><div class="caption">' + item.title + '</div></div></div>';
	});
	projects.html(html);

	var loadImage = function(src) { var img = new Image();img.src = src; }
	var preloadImgs = function() {
		$.each(window.sitedata.projects, function(index, item) {
			$.each(item.images, function(imgIndex, img) { loadImage(window.mka.baseUrl + '/img/photos/' + img); });
			loadImage(window.mka.baseUrl + '/img/thumbs/' + item.thumb);
		});
	};
	
	//transition functions
	var homeLogoAnimationFn = function(showHide) { 
		var logo = $('#logo');
		if(showHide === 'hide' && logo.height() > 0) {
			TweenLite.to(logo[0], window.mka.paneTransitionDur, { height: 0, ease: Power3.easeIn });
		} else if(showHide === 'show' && logo.height() == 0) { 
			TweenLite.to(logo[0], window.mka.paneTransitionDur, { height: '90px', ease: Power3.easeOut });
		}
	};

	var transitionCallbackFn = function($fromPane, $toPane, filter) {
		if(!window.mka.firstLoad) $fromPane.hide();
		if($fromPane.attr('id') === 'projects-pane') { $('#prj-showcase-close').click(); }
		var toId = $toPane.attr('id');
		if(toId === 'projects-pane') {
			$toPane.scrollTop(0);
			projects.isotope({ layoutMode: 'fitRows', filter: filter, transitionDuration: '0.6s' });
		} else if (toId === 'contact-pane' && window.mka.map == null) {
	        window.mka.map = new google.maps.Map(mapdiv[0], {
				center: window.mka.mapCenter,
				zoom: 17,
				styles: window.mka.mapStyles
	        });
	        var marker = new google.maps.Marker({
				position: window.mka.mapCenter,
				map: window.mka.map,
				title: 'MKA Architects'
			});
		}
		TweenLite.to('#' + $toPane.attr('id'), window.mka.firstLoad ? 1 : window.mka.paneTransitionDur, { paddingTop: 0, opacity:1, ease: Power3.easeInOut });
	};

	//submenu expand-collapse
	var toggleSubList = function(showHide) {
		if(showHide == 'show' && !subdiv.hasClass('expanded')) {
			TweenLite.to(subdiv[0], 0.4, { height: (sublist.height() + 4) + 'px', ease: Power3.easeOut, onComplete: function() {
				subdiv.addClass('expanded');
			} });
		} else if(showHide == 'hide' && subdiv.hasClass('expanded')) {
			TweenLite.to(subdiv[0], 0.4, { height: 0, ease: Power3.easeOut, onComplete: function() {
				subdiv.removeClass('expanded');
			} });
		}
	};

	//action when menu items clicked
	var switchPane = function($elem) {
		document.title = $elem.text() + " | MKA";
		if(menuButton.attr('aria-expanded') == 'true') menuButton.click();
		var href = $elem.attr('href'),
			isProjects = window.mka.projectIds.indexOf(href) >= 0,
			targetPaneId = isProjects ? '#projects-pane' : (href == '#' ? '#home' : href) + '-pane',
			filter = href == '#private' ? '.private' : href == '#constructions' ? '.construction' : href == '#subprojects' ? '.subproject' : '',
			fromPane = $(window.mka.currentPaneId),
			toPane = $(targetPaneId);
		toggleSubList(isProjects ? 'show' : 'hide');

		if(window.mka.currentPaneId == targetPaneId && !window.mka.firstLoad) {
			if(isProjects) {
				projects.isotope({ filter: filter });
				if(scw.hasClass('showcasing')) $('#prj-showcase-close').click();
			}
			return false;
		}
		window.mka.currentPaneId = targetPaneId;
	
		toPane.show();
		if(window.mka.firstLoad) {
			transitionCallbackFn(fromPane,toPane, filter);
			window.mka.firstLoad = false;
		} else {
			dataLayer.push({ event: 'pageView', virtualUrl: '/' + (href == '#' ? 'index' : href) + '.html' });
			TweenLite.to('#' + fromPane.attr('id'), 0.5, { paddingTop: "50px", opacity:0, ease: Power3.easeInOut, onComplete: function() {
				transitionCallbackFn(fromPane,toPane, filter);
			}  });
		}
		homeLogoAnimationFn(targetPaneId === '#home-pane' ? 'hide' : 'show');
	};

	//menu item click transition
	$('.sidebar#menubar').find('ul.nav-sidebar').on('click', 'li a', function(evt) { switchPane($(this)); });
	$('a.navbar-brand').click(function(evt) { switchPane(homeLink); })

	//item height setters before project showcase transition
	var setShowcaseAutoHeight = function() { return scw.height('auto'); };
	var setShowcaseHeight = function() { return scw.height(sc.height() + margin); }

	//close button transition
	$('#prj-showcase-close').on('click',function() { 
		TweenLite.to(scw[0], window.mka.projectTransitionDur, { height:0, opacity:0, ease: Power3.easeOut, onComplete: function() {
			scw.removeClass('showcasing');
		} });
	});	

	var parseFooterData = function(arg) {
		var data = arg.split('|');
		return data.length > 1 ? data : [data[0],''];
	}

	//load project to showcase ui
	var showcaseProject = function(id) {
		var html = '',
			prj = window.sitedata.projects[id];
		if(window.mka.projectCache[id]) {
			html = window.mka.projectCache[id];
		} else {	
			if(Modernizr.backgroundsize === true) {
				$.each(prj.images, function(idx, src) { html += '<div class="img" style="background-image:url(\'img/photos/' + src + '\');"></div>'; });
			} else {
				$.each(prj.images, function(imgIndex, imgsrc) { html += '<div><img src="img/photos/' + imgsrc + '" /></div>'; });
			}
			window.mka.projectCache[id] = html;
		}
		dataLayer.push({ event: 'projectView', projectTitle: prj.title });
		sc_content.html('<div id="prj-showcase-title">' + prj.title + '</div>' + prj.content);
		var period = parseFooterData(prj.period),
			persons = parseFooterData(prj.overseer);
		sc_footer.find('#prj-showcase-footer-research').text(period[0]);
		sc_footer.find('#prj-showcase-footer-construction').text(period[1]);
		sc_footer.find('#prj-showcase-footer-researcher').text(persons[0]);
		sc_footer.find('#prj-showcase-footer-overseer').text(persons[1]);
		if(sc_carousel.hasClass('slick-initialized')) sc_carousel.slick('unslick');
		sc_carousel.html(html).slick({ dots:true, slidesToShow:1, variableWidth:true, adaptiveHeight: true });
	};

	//event listener on project thumbs
	projects.on('click','.project-wrap',function() {
		var id = $(this).attr('id').replace('project-',''),
			scrollable = prjpane.css('position') == 'fixed' ? '#projects-pane' : 'body';
 		TweenLite.to(scrollable, window.mka.projectTransitionDur, { scrollTop: 0, ease: Power3.easeOut });
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

	$(window).resize(function() {
		if(window.mka.currentPaneId == '#contact-pane') window.mka.map.setCenter(window.mka.mapCenter);
	})

	//initial pane
	var initial = $('ul.nav.nav-sidebar li a[href=#' + (urlparts.length > 1 ? urlparts[1] : '') + ']');
	if(initial.length == 0) initial = homeLink;
	initial.click();

	preloadImgs();
});