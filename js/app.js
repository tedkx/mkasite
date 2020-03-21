function noop() {}

$(document).ready(function () {
    // Configuration
    var PROJECTS_TRANSITION_OUT_DURATION = 500,
        PROJECTS_TRANSITION_OUT_DELAY = 50,
        TITLE_SUFFIX = ' | MKA';

    var thumbs = Array.from(Array(9)).map((_, i) => ({
        id: i === 0 ? 'v1' : (i + 1) + '',
        img: `/img/thumbnails/${i + 1}.png`
    }));

    var projects = window.sitedata.projects;

    var isotopeOpts = {
        percentPosition: true,
        masonry: {
            columnWidth: '.projects-sizer',
            gutter: 8
        }
    };

    // "Polyfill" history api and handle changes
    if (!window.history)
        window.history = { back: noop, pushState: noop };
    else
        window.onpopstate = onRouteChange;

    var $content = $('#content'),
        $list = $('#projects-list'),
        $project = $('#project'),
        $colorized = $('#project>*:not(.parallax-container)'),
        $projectTitle = $project.find('#title'),
        $projectSections = $project.find('.section'),
        selectedProject = null;

    function resizeContent() { 
        $content.css('min-height', $(window).height());
        var parallaxHeight = Math.max($(window).height() * 0.9, 200) | 0;
        $('.parallax-container').height(parallaxHeight);
    }

    /* Event Handlers */
    function onRouteChange(e) {
        console.log('history state changed', e.state, typeof e.state, (e.state + ''));
        if(e.state === 'home') {
            console.log('going to home');
            switchToProjectsList();
        } else {
            var projectId = e.state.replace('project_');
            console.log('switching to project', projectId);
        }
    }

    function onProjectSelect(e) {
        e.stopPropagation();
        switchToProject($(e.currentTarget).data('id'));
    }
    
    /* Section Switchers */
    function switchToProject(id) {
        // hide projects list if a project is not already selected
        if(!selectedProject) {
            $list.addClass('transition-out');
            setTimeout(function () {
                $list.addClass('dormant').removeClass('visible').removeClass('transition-out');
            }, PROJECTS_TRANSITION_OUT_DURATION + PROJECTS_TRANSITION_OUT_DELAY * thumbs.length);
        }

        // show project data
        setTimeout(function() {
            selectedProject = projects[id] || { color: '#FFF', id: id, title: 'Πρότζεχτ' };

            window.history.pushState('project_' + id, selectedProject.title + TITLE_SUFFIX, '/projects/' + id);

            $colorized.css('background-color', selectedProject.backColor).css('color', selectedProject.foreColor);

            if(callbacks[id])
                callbacks[id](selectedProject);

            $project.addClass(selectedProject.template);

            setTimeout(function () { $project.addClass('visible'); }, 100);
        }, !selectedProject ? PROJECTS_TRANSITION_OUT_DURATION : 0);
    }

    function switchToProjectsList(ev) {
        if(selectedProject) {
            history.pushState('home', 'Αρχική' + TITLE_SUFFIX, '/');
            $project.removeClass('visible');
            $colorized.css('background-color', '#FFF');
            $list.removeClass('dormant');
        }
        selectedProject = null;
        $list.isotope('layout');
        setTimeout(function () { $list.addClass('visible'); }, ev && ev.isComplete === true ? 350 : 1);
    }

     /* Per project callbacks */
     var callbacks = {
        v1: function(project) {
            $projectTitle.html(project.title);

            var $parallaxContainers = $('.parallax-container');
            for(var i = 0; i < project.images.length; i++)
                $parallaxContainers.eq(i).parallax({ mirrorContainer: $project, imageSrc: project.images[i] });

            for(var i = 0; i < project.content.length; i++)
                $projectSections.eq(i).html(project.content[i]);
            setTimeout(function() { $(window).trigger('resize'); }, 150);
        }
    }

    /* Initialization */

    $list.html(`<div class="projects-sizer"></div>
            ${thumbs.map(function (p) {
        return `
                <div class="project" data-id=${p.id}>
                    <div class="overlay">
                        <span>Project #${p.id}</span>
                    </div>
                    <img src="${p.img}" />
                </div>
            `}).join('')}`);

    $list.on('click', '.project', onProjectSelect);

    $list.isotope(isotopeOpts);

    $list.imagesLoaded().always(switchToProjectsList);
    //$list.imagesLoaded().always(() => switchToProject('v1'));

    resizeContent();
    $(window).on('click', function (e) {
        if (selectedProject) 
            switchToProjectsList();
    }).on('resize', resizeContent);
})