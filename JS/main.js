/**
 * Created by Calis on 6/18/2015.
 */
var app = angular.module('treeWalker', []);

app.controller('treeController', ['$scope', function($scope)
{
    //Root object
    $scope.tree =  {
        name : "Root",
        depth: 0,
        children : [],
        newChild: "newChild"
    };

    //Temp data filler.
    $scope.fillData = function()
    {
        $scope.tree.name = "Experience with languages";
        // Add the children
        $scope.tree.children.push({name: "Languages learned at school", depth: 1, children: [], newChild: "Add child"});
        $scope.tree.children[0].children.push({name: "Good knowledge", depth: 2, children: [], newChild: "Add child"});
        $scope.tree.children[0].children.push({name: "Messed around", depth: 2, children: [], newChild: "Add child"});
        $scope.tree.children[0].children[0].children.push({name: "C++", depth: 3, children: [], newChild: "Add child"});
        $scope.tree.children[0].children[0].children.push({name: "SQL", depth: 3, children: [], newChild: "Add child"});
        $scope.tree.children[0].children[1].children.push({name: "JS", depth: 3, children: [], newChild: "Add child"});
        $scope.tree.children[0].children[1].children.push({name: "PHP", depth: 3, children: [], newChild: "Add child"});
        $scope.tree.children[0].children[1].children.push({name: "HTML/CSS", depth: 3, children: [], newChild: "Add child"});

        $scope.tree.children.push({name: "Languages learned for hobby projects", depth: 1, children: [], newChild: "Add child"});
        $scope.tree.children[1].children.push({name: "Good knowledge", depth: 2, children: [], newChild: "Add child"});
        $scope.tree.children[1].children.push({name: "Messed around", depth: 2, children: [], newChild: "Add child"});
        $scope.tree.children[1].children[0].children.push({name: "C#", depth: 3, children: [], newChild: "Add child"});
        $scope.tree.children[1].children[0].children.push({name: "C++", depth: 3, children: [], newChild: "Add child"});
        $scope.tree.children[1].children[1].children.push({name: "Python", depth: 3, children: [], newChild: "Add child"});
        $scope.tree.children[1].children[1].children.push({name: "Ruby", depth: 3, children: [], newChild: "Add child"});

        $scope.tree.children.push({name: "Languages learned at work", depth: 1, children: [], newChild: "Add child"});
        $scope.tree.children[2].children.push({name: "Good knowledge", depth: 2, children: [], newChild: "Add child"});
        $scope.tree.children[2].children.push({name: "Messed around", depth: 2, children: [], newChild: "Add child"});
        $scope.tree.children[2].children[0].children.push({name: "VBA", depth: 3, children: [], newChild: "Add child"});
        $scope.tree.children[2].children[0].children.push({name: "PL/SQL", depth: 3, children: [], newChild: "Add child"});

    };

    //Simple save function. Stringifies array data, to be able to store as text
    $scope.saveState = function()
    {
        window.localStorage.setItem('treeData', JSON.stringify($scope.tree));
    };

    //Simple load function just gets and parses text back to array
    $scope.loadState = function()
    {
        $scope.tree = JSON.parse(localStorage.getItem('treeData'));
    };
}]);

app.directive('recursiveTree', function ($compile) {

    return {
        restrict: 'E',
        terminal: true,
        //parentdata - array containing node
        scope: { node: '=', parentData:'=' },

        link: function (scope, element, attrs) {

            //Print name, input field
            var template = '<span ng-click="edit()" ng-bind="node.name"></span><input ng-model="node.name"></input>';
            //Add delete buttons to non-root elems
            if(scope.node.depth>0) template+= '<button ng-click="deleteMe()" ng-show="node.name">Delete</button>';

            //Check children to print.
            var printChildren = angular.isArray(scope.node.children);
            //If there are children to print, loop and print them in ul
            if (printChildren)
            {
                template += '<ul class="indent"><li ng-repeat="item in node.children"><recursive-tree node="item" parent-data="node.children"></recursive-tree></li>';
            }
            //Add "add child" field to elements of desired depth (< 3)
            if (scope.node.depth<3)
            {
                template += '<li ><input type="text" ng-model="node.newChild"><button ng-click="addChild()" class="button">Add</button></li>';
            }
            //Moved at the end so that input field would align correctly.
            if (printChildren)
            {
                template += '</ul>';
            }

            //Deletion of a child
            scope.deleteMe = function(index) {
                if(scope.parentData) {
                    var itemIndex = scope.parentData.indexOf(scope.node);
                    //Splice it to keep array integrity
                    scope.parentData.splice(itemIndex,1);
                }
                scope.node = {};
            };

            //Adding a child
            scope.addChild = function()
            {
                scope.node.children.push({name: scope.node.newChild, depth: scope.node.depth +1, children: [], newChild: "Add child"});
            };

            //compile and render created item template.
            var newElement = angular.element(template);
            $compile(newElement)(scope);
            element.replaceWith(newElement);
        }
    }
});

app.directive('iterativeTree', function ($compile) {

    return {
        restrict: 'E',
        terminal: true,
        scope: {root: '='},

        link: function (scope, element, attrs)
        {
            //Watch root object for the directive to update upon changes
            scope.$watchCollection('root.children', function()
            {
                var template = '';
                var nodeList = [{node:scope.root, visited:false, parent:null}];

                //Walk the tree iteratively adding necessary DOM elements by template+=
                while (nodeList.length>0)
                {
                    var tempNode = nodeList[0];

                    //DOESNT WORK
                    //How can I keep the data-model binding with single scope and multiple nodes?
                    //No idea :l
                    template+='<li><span ng-click="edit()" ng-bind="tempNode.node.name"></span><input ng-model="tempNode.node.name"></input>';
                    if(tempNode.visited==false)
                    {
                        if(angular.isArray(tempNode.node.children))
                        {
                            template += "<ul>";
                            for (var child in tempNode.node.children) {
                                nodeList.unshift({node: child, visited: false, parent: tempNode.node})
                            }
                            tempNode.visited = true;
                            continue;
                        }
                        tempNode.visited = true;
                    }

                    //Add closing tags and pop node upon finishing traversing it
                    if (tempNode.visited==true)
                    {
                        if (tempNode.node.children>0) template+="</ul>";
                        template+="</li>";
                        nodeList.splice(0, 1);
                    }
                }

                var newElement = angular.element(template);
                $compile(newElement)(scope);
                element.replaceWith(newElement);
            });
        }
    };
});