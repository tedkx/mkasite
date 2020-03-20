
$(document).ready(function () {
    // Configuration
    var PROJECTS_TRANSITION_OUT_DURATION = 500,
        PROJECTS_TRANSITION_OUT_DELAY = 50;

    var thumbs = Array.from(Array(9)).map((_, i) => ({
        id: i === 0 ? 'v1' : (i + 1) + '',
        img: `img/thumbnails/${i + 1}.png`
    }));

    var projects = window.sitedata.projects;
    
    if(!window.history)
        window.history = { pushState: function() {} };
    
    var isotopeOpts = { 
        percentPosition: true, 
        masonry: { 
            columnWidth: '.projects-sizer', 
            gutter: 8 
        } 
    };
    
    var $content = $('#content'),   
        $list = $('#projects-list'),
        $project = $('#project'),
        selectedProject = null;

    function resizeContent() { $content.css('min-height', $(window).height()); }

    function onProjectsImagesLoaded() {
        $list.isotope('layout');
        setTimeout(function() { $list.addClass('visible'); }, 350);
    }

    function onProjectSelect(e) {
        e.stopPropagation();

        // hide projects list
        $list.addClass('transition-out');
        setTimeout(function() {
            $list.addClass('dormant').removeClass('visible').removeClass('transition-out');

            
        }, PROJECTS_TRANSITION_OUT_DURATION + PROJECTS_TRANSITION_OUT_DELAY * thumbs.length);

        setTimeout(function() {
            // Set project properties
            selectedProject = projects[$(e.currentTarget).data('id')];
            console.log('project', $(e.currentTarget).data('id'), 'of', projects, '->', selectedProject);
            if(selectedProject) {
                console.log('selectedProject', selectedProject);
                $content.css('background-color', selectedProject.color);
            } else {
                selectedProject = {};
            }

            setTimeout(function() { $project.addClass('visible'); }, 100);
        }, PROJECTS_TRANSITION_OUT_DURATION)
    }

    $list.html(`<div class="projects-sizer"></div>
            ${thumbs.map(function(p) { return `
                <div class="project" data-id=${p.id}>
                    <div class="overlay">
                        <span>Project #${p.id}</span>
                    </div>
                    <img src="${p.img}" />
                </div>
            `}).join('')}`);

    $list.on('click', '.project', onProjectSelect);

    $list.isotope(isotopeOpts);
    $list.imagesLoaded().always(onProjectsImagesLoaded);

    resizeContent();
    $(window).on('click', function(e) {
        console.log('click', selectedProject);
        if(selectedProject) {
            $project.removeClass('visible');
            $content.css('background-color', '#FFF');
            $list.removeClass('dormant')
            setTimeout(function() { $list.addClass('visible'); });
        }
    }).on('resize',resizeContent);
})