/**
 * INSPINIA - Responsive Admin Theme
 * Copyright 2015 Webapplayers.com
 *
 */


/**
 * pageTitle - Directive for set Page title - mata title
 */
function pageTitle($rootScope, $timeout) {
    return {
        link: function (scope, element) {
            var listener = function (event, toState, toParams, fromState, fromParams) {
                // Default title - load on Dashboard 1
                var title = 'SocioActive';
                // Create your own title pattern
                if (toState.data && toState.data.pageTitle) title = 'SocioActive | ' + toState.data.pageTitle;
                $timeout(function () {
                    element.text(title);
                });
            };
            $rootScope.$on('$stateChangeStart', listener);
        }
    }
};

/**
 * sideNavigation - Directive for run metsiMenu on sidebar navigation
 */
function sideNavigation($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element) {
            // Call the metsiMenu plugin and plug it to sidebar navigation
            $timeout(function () {
                element.metisMenu();
            });
        }
    };
};

/**
 * iboxTools - Directive for iBox tools elements in right corner of ibox
 */
function iboxTools($timeout) {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'views/common/ibox_tools.html',
        controller: function ($scope, $element) {
            // Function for collapse ibox
            $scope.showhide = function () {
                var ibox = $element.closest('div.ibox');
                var icon = $element.find('i:first');
                var content = ibox.find('div.ibox-content');
                content.slideToggle(200);
                // Toggle icon from up to down
                icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                ibox.toggleClass('').toggleClass('border-bottom');
                $timeout(function () {
                    ibox.resize();
                    ibox.find('[id^=map-]').resize();
                }, 50);
            },
                // Function for close ibox
                $scope.closebox = function () {
                    var ibox = $element.closest('div.ibox');
                    ibox.remove();
                }
        }
    };
};

/**
 * minimalizaSidebar - Directive for minimalize sidebar
 */
function minimalizaSidebar($timeout) {
    return {
        restrict: 'A',
        template: '<a class="navbar-minimalize minimalize-styl-2 btn btn-primary " href="" ng-click="minimalize()"><i class="fa fa-bars"></i></a>',
        controller: function ($scope, $element) {
            $scope.minimalize = function () {
                $("body").toggleClass("mini-navbar");
                if (!$('body').hasClass('mini-navbar') || $('body').hasClass('body-small')) {
                    // Hide menu in order to smoothly turn on when maximize menu
                    $('#side-menu').hide();
                    // For smoothly turn on menu
                    setTimeout(
                        function () {
                            $('#side-menu').fadeIn(500);
                        }, 100);
                } else if ($('body').hasClass('fixed-sidebar')) {
                    $('#side-menu').hide();
                    setTimeout(
                        function () {
                            $('#side-menu').fadeIn(500);
                        }, 300);
                } else {
                    // Remove all inline style from jquery fadeIn function to reset menu state
                    $('#side-menu').removeAttr('style');
                }
            }
        }
    };
};

/**
 * dropZone - Directive for Drag and drop zone file upload plugin
 */
function dropZone() {
    return function (scope, element, attrs) {
        element.dropzone({
            url: "/upload",
            maxFilesize: 100,
            paramName: "uploadfile",
            maxThumbnailFilesize: 5,
            init: function () {
                this.on('success', function (file, json) {
                });
                this.on('addedfile', function (file) {
                    scope.$apply(function () {
                        scope.files.push(file);
                    });
                });
                this.on('drop', function (file) {
                });
            }
        });
    }
}
function fileDropzone() {
    return {
        restrict: 'A',
        scope: {
            file: '=',
            fileName: '='
        },
        link: function (scope, element, attrs) {
            var checkSize, isTypeValid, processDragOverOrEnter, validMimeTypes;
            processDragOverOrEnter = function (event) {
                if (event != null) {
                    event.preventDefault();
                }
                event.dataTransfer.effectAllowed = 'copy';
                return false;
            };
            validMimeTypes = attrs.fileDropzone;
            checkSize = function (size) {
                var _ref;
                if (((_ref = attrs.maxFileSize) === (void 0) || _ref === '') || (size / 1024) / 1024 < attrs.maxFileSize) {
                    return true;
                } else {
                    alert("File must be smaller than " + attrs.maxFileSize + " MB");
                    return false;
                }
            };
            isTypeValid = function (type) {
                if ((validMimeTypes === (void 0) || validMimeTypes === '') || validMimeTypes.indexOf(type) > -1) {
                    return true;
                } else {
                    alert("Invalid file type.  File must be one of following types " + validMimeTypes);
                    return false;
                }
            };
            element.bind('dragover', processDragOverOrEnter);
            element.bind('dragenter', processDragOverOrEnter);
            return element.bind('drop', function (event) {
                var file, name, reader, size, type;
                if (event != null) {
                    event.preventDefault();
                }
                reader = new FileReader();
                reader.onload = function (evt) {
                    if (checkSize(size) && isTypeValid(type)) {
                        return scope.$apply(function () {
                            scope.file = evt.target.result;
                            if (angular.isString(scope.fileName)) {
                                return scope.fileName = name;
                            }
                        });
                    }
                };
                file = event.dataTransfer.files[0];
                name = file.name;
                type = file.type;
                size = file.size;
                reader.readAsDataURL(file);
                return false;
            });
        }
    };
}

function addNodeInfo($compile, $templateCache) {
    return {
        restrict: 'E',
        scope: {
            nodeValue: '=',
            nodeType: '='
        },
        link: function (scope, element) {
            var nodeData = scope.nodeValue;
            var cached_element = $templateCache.get(nodeData.type.name.toLowerCase() + "_" + scope.nodeType + ".html");
            if (cached_element == null || cached_element == '') {
                cached_element = $templateCache.get(nodeData.type.name.toLowerCase() + ".html");
            }
            var compiled_cache = $compile(cached_element)(scope);
            angular.element(element).append(nodeData.name);
            angular.element(element).append(compiled_cache);
        },
        controller: NodeInfoCtrl
    }
}

function typeTemplate() {
    return {
        restrict: "E",
        scope: {
            typeParameter: '='
        },
        templateUrl: 'views/type_template.html'
    };
}
function itemPreview() {
    return {
        restrict: "E",
        scope: {
            previewedItem: '=',
            selectedItem: '=',
            selectedItemId: '=',
            arrayIterate: '=?',
            selectedItemType: '=?'
        },
        controller: ItemPreviewCtrl,
        templateUrl: 'views/item_preview_template.html'
    };
}

function freebaseTags() {
    return {
        restrict: "E",
        scope: {
            tagContext: '=',
            addManualTagCallback: '=',
            addTagCallback: '=',
            removeTagCallback: '=',
            isCreate: '='
        },
        templateUrl: 'views/tag_template.html'
    };
}

function commentTemplate() {
    return {
        restrict: "E",
        scope: {
            itemComment: '=',
            addCommentCallback: '='
        },
        link: function (scope, element, attrs) {
            var html, templateCtrl, templateScope;
            scope.$watch('itemComment', function (data) {
                if (!data) {

                    scope.itemComment = [];
                }

            }, true);
        },
        templateUrl: 'views/comment_template.html'
    };
}

function dynamicArea($compile, $http, $controller) {
    return {
        restrict: "E",
        scope: {
            ngModel: '=',
            areaType: '=',
            selectedItemId: '='
        },
        replace: true,
        link: function (scope, element, attrs) {
            var html, templateCtrl, templateScope;
            scope.$watch('selectedItemId', function (data) {
                if (data) {
                    var ctrl = capitalizeFirstLetter(scope.areaType) + "TemplateCtrl";
                    var templateUrl = "views/" + scope.areaType + "_view_template.html";
                    var html = '<div ng-controller="' + ctrl + '" ng-include="\'' + templateUrl + '\'"></div>';
                    element.empty();
                    element.append(html);
                    $compile(element.contents())(scope);
                }

            }, true);
        }
    };
}
/**
 *
 * Pass all functions into module
 */
angular
    .module('socioactive')
    .directive('pageTitle', pageTitle)
    .directive('sideNavigation', sideNavigation)
    .directive('iboxTools', iboxTools)
    .directive('minimalizaSidebar', minimalizaSidebar)
    .directive('fileDropzone', fileDropzone)
    .directive('addNodeInfo', addNodeInfo)
    .directive('typeTemplate', typeTemplate)
    .directive('freebaseTags', freebaseTags)
    .directive('commentTemplate', commentTemplate)
    .directive('itemPreview', itemPreview)
    .directive('dynamicArea', dynamicArea);