function noop() {}

$(document).ready(function () {
    // Configuration
    var COLORIZED_SELECTOR = '#project .hero,#project-spacer,#project-template>*:not(.parallax-container)',
        PROJECTS_TRANSITION_OUT_DURATION = 500,
        PROJECTS_TRANSITION_OUT_DELAY = 50,
        TITLE_SUFFIX = ' | MKA';

    var projects = window.sitedata.projects;
    var templateData = window.sitedata.templates;
    delete window.sitedata;

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
        $projectTemplate = $project.find('#project-template'),
        $previousProject = $project.find('#previous-project'),
        $projectsToList = $project.find('#project-tolist'),
        $nextProject = $project.find('#next-project'),
        $previousProjectTitle = $project.find('#previous-project-title'),
        $nextProjectTitle = $project.find('#next-project-title'),
        $projectTitle = $project.find('#title'),
        $projectSections = $project.find('.section'),
        selectedProject = null;

    function resizeContent() { 
        $content.css('min-height', $(window).height());
        //var parallaxHeight = Math.max($(window).height() * 0.9, 200) | 0;
        //$('.parallax-container').height(parallaxHeight);
    }

    function preventor(e) {
        if(e && e.preventDefault) e.preventDefault();
        return false;
    }

    function getImageUrl(url, project) {
        return '/img/projects/' + project.id + '/' + url;
    }

    function scrollToTop(e) {
        if(e && e.preventDefault) e.preventDefault();
        if($content[0].scrollIntoView)
            $content[0].scrollIntoView({ block: 'start', behavior: 'smooth' });
        return false;
    }

    /* Event Handlers */
    function onRouteChange(e) {
        try {
            if(e.state === 'home')
                switchToProjectsList();
            else
                var projectId = e.state.replace('project_');
        } catch(ex) {
            console.log('route change exception', ex);
        }
    }
    
    function cleanupProject() {
        if(!selectedProject) return;
        $(COLORIZED_SELECTOR).css('background-color', '#FFF').css('color', '#000');
        $project.removeClass(selectedProject.template);
        var callbacks = templateCallbacks[selectedProject.template];
        if(callbacks && callbacks.cleanup) callbacks.cleanup(selectedProject);
    }

    function onProjectSelect(e) {
        e.stopPropagation();
        switchToProject($(e.currentTarget).data('id'));
    }
    function onPrevNext(e) {
        e.stopPropagation();
        switchToProject($(e.currentTarget).data('id'));
    }
    
    /* Section Switchers */
    function switchToProject(id) {
        $project.removeClass('visible');
        scrollToTop();
        setTimeout(cleanupProject, 500);

        var switchDelay = !!selectedProject ? 500 : 100;

        // hide projects list if a project is not already selected
        if(!selectedProject) {
            $list.addClass('transition-out');
            setTimeout(function () {
                $list.addClass('dormant').removeClass('visible').removeClass('transition-out');
            }, PROJECTS_TRANSITION_OUT_DURATION + PROJECTS_TRANSITION_OUT_DELAY * projects.length);
        }

        // show project data
        setTimeout(function() {
            for(var i = 0; i < projects.length; i++) {
                if(projects[i].id == id) {
                    selectedProject = projects[i];
                    var previousProject = projects[i === 0 ? projects.length - 1 : i - 1];
                    $previousProjectTitle.html(previousProject.shortTitle);
                    $previousProject.data('id', previousProject.id);

                    var nextProject = projects[i >= projects.length - 1 ? 0 : i + 1];
                    $nextProjectTitle.html(nextProject.shortTitle);
                    $nextProject.data('id', nextProject.id);
                }
            }
            selectedProject = projects.find(p => p.id == id) || { color: '#FFF', id: id, title: 'Πρότζεχτ' };
            window.history.pushState('project_' + id, selectedProject.title + TITLE_SUFFIX, '/projects/' + id);

            //console.log('switching to project', id, selectedProject);

            var initializer = templateCallbacks[selectedProject.template] || templateCallbacks.default;
            initializer.init(selectedProject, templateData[selectedProject.template]);

            $(COLORIZED_SELECTOR).css('background-color', selectedProject.backColor).css('color', selectedProject.foreColor);
            $project.addClass(selectedProject.template);

            setTimeout(function () { $project.removeClass('dormant').addClass('visible'); }, 100);
        }, !selectedProject ? PROJECTS_TRANSITION_OUT_DURATION : 500);
    }

    function switchToProjectsList(ev) {
        cleanupProject();
        $project.addClass('dormant');
        if(selectedProject) {
            history.pushState('home', 'Αρχική' + TITLE_SUFFIX, '/');
            $project.removeClass('visible');
            $(COLORIZED_SELECTOR).css('background-color', '#FFF').css('color', '#000');
            $list.removeClass('dormant');
        }
        selectedProject = null;
        $list.isotope('layout');
        setTimeout(function () { $list.addClass('visible'); }, ev && ev.isComplete === true ? 350 : 1);
    }

     /* Per template callbacks */
     var templateCallbacks = {
         'default': {
            init: function() {
                $projectTemplate.html('')
            }
         },
        'image-sections1': {
            init: function(project, template) {
                var str = (project.sections.map(function(section) {
                    var sectionTemplate = section.caption
                        ? template['section-template']
                        : template['section-no-caption-template'];
                    return sectionTemplate
                        .replace('{image}', section.image)
                        .replace('{position}', section.captionPosition)
                        .replace('{caption}', section.caption);
                }).join(''));

                $projectTemplate.html(template.hero.replace('{title}', project.title) + 
                    '<div class="description">' + 
                    project.content[0] + '</div>' + str);

                window.waypoints = [];
                setTimeout(function() {
                    $projectTemplate.find('.caption').each(function(_, elem) {
                        window.waypoints.push(new Waypoint({
                            element: elem,
                            handler: function(direction) {
                                $(elem).addClass('reached');
                            },
                            offset: '80%'
                        }))
                    })
                }, 500);                
            },
            cleanup: function(project) {
                Waypoint.destroyAll();
            },
        },
        'image-sections2': {
            init: function(project, template) {
                $project.addClass('image-sections2');
                var str = (project.sections.map(function(section) {
                    return section.image
                        ? template['image-section'].replace('{image}', section.image)
                        : template['caption-section'].replace('{caption}', section.caption);
                }).join(''));

                $projectTemplate.html(template.hero.replace('{title}', project.title) + str);
            },
            cleanup: function(project) { }
        },
        'money-shot1': {
            init: function(project, template) {
                $projectTitle.html(project.title);
                var getImageElem = function(imageObj) {
                    return '<div class="block image-block">' +
                        template.imageContainer
                        .replace('{image}', getImageUrl(imageObj.img, project))
                        .replace('{thumbnail}', getImageUrl(imageObj.thumb, project)) +
                        '</div>';
                }
                
                $projectTemplate.html(template.hero
                        .replace('{heroImage}', getImageUrl(project.heroImage, project)) +
                    '<div class="block" style="margin: 25px 0">' + 
                        '<div class="row">' +
                            '<div class="block">' +
                                '<div class="row">' + project.images.slice(0, 2).map(getImageElem).join('') + '</div>' +
                                '<div class="row">' + project.images.slice(2, 4).map(getImageElem).join('') + '</div>' +
                            '</div>' +
                            '<div class="block description">' + (project.description || '') + '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="row">' + project.images.slice(4, 6).map(getImageElem).join('') + '</div>'
                );

                $projectTemplate.find('.block .row .image-block').addClass('small');

                setTimeout(function() {
                    $project.lightGallery({
                        selector: '.image-link'
                    });
                }, 500);
            },
            cleanup: function(project) { }
        },
        'parallax1': {
            init: function(project, template) {
                $projectTitle.html(project.title);

                var $parallaxContainers = $('.parallax-container');
                
                for(var i = 0; i < project.images.length; i++)
                    $parallaxContainers.eq(i).html(`<img src="${project.images[i]}" />`);
                    //$parallaxContainers.eq(i).parallax({ mirrorContainer: $project, imageSrc: project.images[i] });

                for(var i = 0; i < project.content.length; i++)
                    $projectSections.eq(i).html(project.content[i]);
                setTimeout(function() { $(window).trigger('resize'); }, 150);
            },
            cleanup: function(project) { }
        }
    }

    /* Initialization */

    $list.html(`<div class="projects-sizer"></div>
            ${projects.map(function(p) {
        return `
                <div class="project" data-id=${p.id}>
                    <div class="overlay">
                        <span>${p.shortTitle}</span>
                    </div>
                    <img src="/img/thumbnails/${p.thumbnail}" />
                </div>
            `}).join('')}`);

    $list.on('click', '.project', onProjectSelect);
    $previousProject.on('click', onPrevNext);
    $nextProject.on('click', onPrevNext);
    $projectsToList.on('click', switchToProjectsList);

    $list.isotope(isotopeOpts);

    var urlMatch = window.location.href.match(/\/projects\/(.+)/);
    if(urlMatch)
        $list.imagesLoaded().always(() => switchToProject(urlMatch[1]));
    else
        $list.imagesLoaded().always(switchToProjectsList);

    resizeContent();
    // .on('click', function (e) {
    //     if (selectedProject) 
    //         switchToProjectsList();
    $(window).on('resize', resizeContent);
})