function config($stateProvider, $urlRouterProvider, $ocLazyLoadProvider) {
    $urlRouterProvider.otherwise("/index/main");

    $ocLazyLoadProvider.config({
        // Set to true if you want to see what and when is dynamically loaded
        debug: false
    });

    $stateProvider

        .state('index', {
            abstract: true,
            url: "/index",
            templateUrl: "views/common/content.html"
        })
        .state('profile', {
            abstract: true,
            url: "/profile",
            templateUrl: "views/common/content.html"
        })
        .state('profile.user', {
            url: "/profile/user",
            templateUrl: "views/profile.html",
            data: { pageTitle: 'Profile Page' },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            name: 'datePicker',
                            files: ['css/plugins/datapicker/angular-datapicker.css','js/plugins/datapicker/datePicker.js']
                        },
                        {
                            files: ['js/plugins/jasny/jasny-bootstrap.min.js']
                        },
                        {
                            name: 'ui.tree',
                            files: ['css/plugins/uiTree/angular-ui-tree.min.css','js/plugins/uiTree/angular-ui-tree.min.js']
                        },
                        {
                            name: 'ngTagsInput',
                            files: ['css/plugins/ngTags/ng-tags-input.css','js/plugins/ngTags/ng-tags-input.js']
                        },
                        {
                            name: 'ui.select',
                            files: ['css/plugins/ui-select/select.css','js/plugins/ui-select/select.js']
                        }
                    ]);
                }
            }
        })
        .state('index.main', {
            url: "/main",
            templateUrl: "views/main.html",
            data: { pageTitle: 'Main Page' }
        })
        .state('index.post', {
            url: "/post",
            templateUrl: "views/post.html",
            data: { pageTitle: 'Post Something' }
        })
        .state('activity', {
            abstract: true,
            url: "/activity",
            templateUrl: "views/common/content.html"
        })
        .state('activity.groups', {
            url: "/inbox",
            templateUrl: "views/groups.html",
            data: { pageTitle: 'Current Groups' },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            name: 'datePicker',
                            files: ['css/plugins/datapicker/angular-datapicker.css','js/plugins/datapicker/datePicker.js']
                        },
                        {
                            files: ['js/plugins/jasny/jasny-bootstrap.min.js']
                        },
                        {
                            name: 'ui.tree',
                            files: ['css/plugins/uiTree/angular-ui-tree.min.css','js/plugins/uiTree/angular-ui-tree.min.js']
                        },
                        {
                            name: 'ngTagsInput',
                            files: ['css/plugins/ngTags/ng-tags-input.css','js/plugins/ngTags/ng-tags-input.js']
                        },
                        {
                            name: 'ui.select',
                            files: ['css/plugins/ui-select/select.css','js/plugins/ui-select/select.js']
                        }
                    ]);
                }
            }
        })
        .state('activity.events', {
            url: "/event_view",
            controller: 'EventCtrl',
            templateUrl: "views/event_view.html",
            data: { pageTitle: 'Events' }
        })
        .state('activity.polls', {
            url: "/view_poll/:pollToBeViewed",
            templateUrl: "views/poll.html",
            controller: 'PollCtrl',
            data: { pageTitle: 'View Poll'},
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            name: 'datePicker',
                            files: ['css/plugins/datapicker/angular-datapicker.css','js/plugins/datapicker/datePicker.js']
                        },
                        {
                            files: ['js/plugins/jasny/jasny-bootstrap.min.js']
                        },
                        {
                            name: 'ui.tree',
                            files: ['css/plugins/uiTree/angular-ui-tree.min.css','js/plugins/uiTree/angular-ui-tree.min.js']
                        },
                        {
                            name: 'ngTagsInput',
                            files: ['css/plugins/ngTags/ng-tags-input.css','js/plugins/ngTags/ng-tags-input.js']
                        },
                        {
                            name: 'ui.select',
                            files: ['css/plugins/ui-select/select.css','js/plugins/ui-select/select.js']
                        }
                    ]);
                }
            }
        })
        .state('activity.pollsv2', {
            url: "/view_polls",
            templateUrl: "views/polls.html",
            controller: 'CurrentPollsCtrl',
            data: { pageTitle: 'View Polls'},
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            name: 'datePicker',
                            files: ['css/plugins/datapicker/angular-datapicker.css','js/plugins/datapicker/datePicker.js']
                        },
                        {
                            files: ['js/plugins/jasny/jasny-bootstrap.min.js']
                        },
                        {
                            name: 'ui.tree',
                            files: ['css/plugins/uiTree/angular-ui-tree.min.css','js/plugins/uiTree/angular-ui-tree.min.js']
                        },
                        {
                            name: 'ngTagsInput',
                            files: ['css/plugins/ngTags/ng-tags-input.css','js/plugins/ngTags/ng-tags-input.js']
                        },
                        {
                            name: 'ui.select',
                            files: ['css/plugins/ui-select/select.css','js/plugins/ui-select/select.js']
                        }
                    ]);
                }
            }
        })
        .state('activity.events2', {
            url: "/view_events",
            templateUrl: "views/event_view_new.html",
            controller: 'EventCtrl',
            data: { pageTitle: 'View Events'},
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            name: 'datePicker',
                            files: ['css/plugins/datapicker/angular-datapicker.css','js/plugins/datapicker/datePicker.js']
                        },
                        {
                            files: ['js/plugins/jasny/jasny-bootstrap.min.js']
                        },
                        {
                            name: 'ui.tree',
                            files: ['css/plugins/uiTree/angular-ui-tree.min.css','js/plugins/uiTree/angular-ui-tree.min.js']
                        },
                        {
                            name: 'ngTagsInput',
                            files: ['css/plugins/ngTags/ng-tags-input.css','js/plugins/ngTags/ng-tags-input.js']
                        },
                        {
                            name: 'ui.select',
                            files: ['css/plugins/ui-select/select.css','js/plugins/ui-select/select.js']
                        }
                    ]);
                }
            }
        })
        .state('activity.instantaneous', {
            url: "/email_template",
            templateUrl: "views/main.html",
            data: { pageTitle: 'Mail compose' }
        })
        .state('owner', {
            abstract: true,
            url: "/activity",
            templateUrl: "views/common/content.html"
        })
        .state('owner.groups', {
            url: "/inbox",
            templateUrl: "views/main.html",
            data: { pageTitle: 'Mail Inbox' }
        })
        .state('owner.events', {
            url: "/email_view",
            templateUrl: "views/main.html",
            data: { pageTitle: 'Mail detail' }
        })
        .state('owner.polls', {
            url: "/email_compose",
            templateUrl: "views/main.html",
            data: { pageTitle: 'Mail compose' }
        })
        .state('owner.instantaneous', {
            url: "/email_template",
            templateUrl: "views/main.html",
            data: { pageTitle: 'Mail compose' }
        })
        .state('create', {
            abstract: true,
            url: "/create",
            templateUrl: "views/common/content.html"
        })
        .state('create.group', {
            url: "/inbox",
            templateUrl: "views/group.html",
            data: { pageTitle: 'Create Group' },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            name: 'datePicker',
                            files: ['css/plugins/datapicker/angular-datapicker.css','js/plugins/datapicker/datePicker.js']
                        },
                        {
                            files: ['js/plugins/jasny/jasny-bootstrap.min.js']
                        },
                        {
                            name: 'ngTagsInput',
                            files: ['css/plugins/ngTags/ng-tags-input.css','js/plugins/ngTags/ng-tags-input.js']
                        },
                        {
                            name: 'ui.tree',
                            files: ['css/plugins/uiTree/angular-ui-tree.min.css','js/plugins/uiTree/angular-ui-tree.min.js']
                        },
                        {
                            name: 'ngTagsInput',
                            files: ['css/plugins/ngTags/ng-tags-input.css','js/plugins/ngTags/ng-tags-input.js']
                        },
                        {
                            name: 'ui.select',
                            files: ['css/plugins/ui-select/select.css','js/plugins/ui-select/select.js']
                        }
                    ]);
                }
            }
        })
        .state('create.event', {
            url: "/create_event",
            templateUrl: "views/event.html",
            controller: 'EventCtrl',
            data: { pageTitle: 'Create Event' },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            name: 'datePicker',
                            files: ['css/plugins/datapicker/angular-datapicker.css','js/plugins/datapicker/datePicker.js']
                        },
                        {
                            files: ['js/plugins/jasny/jasny-bootstrap.min.js']
                        },
                        {
                            name: 'ui.tree',
                            files: ['css/plugins/uiTree/angular-ui-tree.min.css','js/plugins/uiTree/angular-ui-tree.min.js']
                        },
                        {
                            name: 'ngTagsInput',
                            files: ['css/plugins/ngTags/ng-tags-input.css','js/plugins/ngTags/ng-tags-input.js']
                        },
                        {
                            name: 'ui.select',
                            files: ['css/plugins/ui-select/select.css','js/plugins/ui-select/select.js']
                        }
                    ]);
                }
            }
        })
        .state('create.poll', {
            url: "/create_poll",
            templateUrl: "views/poll.html",
            controller: 'PollCtrl',
            data: { pageTitle: 'Create Poll' },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            name: 'datePicker',
                            files: ['css/plugins/datapicker/angular-datapicker.css','js/plugins/datapicker/datePicker.js']
                        },
                        {
                            files: ['js/plugins/jasny/jasny-bootstrap.min.js']
                        },
                        {
                            name: 'ui.tree',
                            files: ['css/plugins/uiTree/angular-ui-tree.min.css','js/plugins/uiTree/angular-ui-tree.min.js']
                        },
                        {
                            name: 'ngTagsInput',
                            files: ['css/plugins/ngTags/ng-tags-input.css','js/plugins/ngTags/ng-tags-input.js']
                        },
                        {
                            name: 'ui.select',
                            files: ['css/plugins/ui-select/select.css','js/plugins/ui-select/select.js']
                        }
                    ]);
                }
            }
        })
        .state('activity.group_add_content', {
            url: "/:groupId?typeId",
            templateUrl: "views/group_add_content.html",
            data: { pageTitle: 'Add to Group' },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            name: 'datePicker',
                            files: ['css/plugins/datapicker/angular-datapicker.css','js/plugins/datapicker/datePicker.js']
                        },
                        {
                            files: ['js/plugins/jasny/jasny-bootstrap.min.js']
                        },
                        {
                            name: 'ui.tree',
                            files: ['css/plugins/uiTree/angular-ui-tree.min.css','js/plugins/uiTree/angular-ui-tree.min.js']
                        },
                        {
                            name: 'ngTagsInput',
                            files: ['css/plugins/ngTags/ng-tags-input.css','js/plugins/ngTags/ng-tags-input.js']
                        },
                        {
                            name: 'ui.select',
                            files: ['css/plugins/ui-select/select.css','js/plugins/ui-select/select.js']
                        }
                    ]);
                }
            }
        })
        .state('activity.group_view_content', {
            url: "/:groupId?fieldId?contentId",
            templateUrl: "views/group_view_content.html",
            data: { pageTitle: 'View Content' },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            name: 'datePicker',
                            files: ['css/plugins/datapicker/angular-datapicker.css','js/plugins/datapicker/datePicker.js']
                        },
                        {
                            files: ['js/plugins/jasny/jasny-bootstrap.min.js']
                        },
                        {
                            name: 'ui.tree',
                            files: ['css/plugins/uiTree/angular-ui-tree.min.css','js/plugins/uiTree/angular-ui-tree.min.js']
                        },
                        {
                            name: 'ngTagsInput',
                            files: ['css/plugins/ngTags/ng-tags-input.css','js/plugins/ngTags/ng-tags-input.js']
                        },
                        {
                            name: 'ui.select',
                            files: ['css/plugins/ui-select/select.css','js/plugins/ui-select/select.js']
                        }
                    ]);
                }
            }
        })
        .state('index.picture_upload', {
            url: "/picture_upload",
            templateUrl: "views/picture_upload.html",
            data: { pageTitle: 'Picture upload' },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            name:'flow',
                            files: ['js/plugins/ngFlow/ng-flow-standalone.js']

                        },
                        {
                            name:'images-resizer',
                            files: ['js/plugins/imageresize/imageresize.js']
                        }
                    ]);
                }
            }
        })
		
		.state('index.search', {
            url: "/search",
            templateUrl: "views/search.html",
            data: { pageTitle: 'Search' },




            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            name:'flow',
                            files: ['js/plugins/ngFlow/ng-flow-standalone.js']
                        }
                    ]);
                }
            }
        })
}
angular
    .module('socioactive')
    .config(config)
    .run(function($rootScope, $state) {
        $rootScope.$state = $state;
    });
