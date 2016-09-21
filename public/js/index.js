/**
 * http://usejsdoc.org/
 */
var hostUrl = "http://"+window.location.hostname+":"+window.location.port;
var app = angular.module('myApp', ['ngTouch', 'ui.grid', 'ui.grid.pagination','ngTagsInput']);
app.controller('listController', function($scope, $http) {

		  $scope.gridOptions = {
		    paginationPageSizes: [10,25,50,100],
		    paginationPageSize: 10,
		    columnDefs: [
		      { name: 'UserName' , 
		    	  field: 'userName',
		    	  cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
		    		  var fieldNames = _.pluck(row.entity.tag, "field");
		    		  var indexValue = _.indexOf(fieldNames, "userName");
		    		 if(indexValue != -1){
		    			 return "red";
		    		 }
		    	  },
		    	  //cellTemplate: 'descriptionTemplate.html'
		    	  cellTemplate: '<div class="ui-grid-cell-contents" title={{row.entity.description}}> {{grid.getCellValue(row, col)}}</div>'
		      },
		      { name: 'Name' , field: 'name', 
		    	  cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
		    		  var fieldNames = _.pluck(row.entity.tag, "field");
		    		  var indexValue = _.indexOf(fieldNames, "name");
		    		  if(indexValue != -1){
		    			 return "red";
		    		 }
		    	  },
		    	  cellTemplate: '<div class="ui-grid-cell-contents" title={{row.entity.description}}> {{grid.getCellValue(row, col)}}</div>'
		      },
		      { name: 'Age' , field: 'age' ,width:60, cellClass:'age'},
		      { name: 'PhoneNumber',field: 'phoneNumber', enableSorting: false ,
		    	  cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
		    		  var fieldNames = _.pluck(row.entity.tag, "field");
		    		  var indexValue = _.indexOf(fieldNames, "phoneNumber");
		    		  if(indexValue != -1){
		    			 return "red";
		    		 }
		    	  },
		    	  cellTemplate: '<div class="ui-grid-cell-contents" title={{row.entity.description}}> {{grid.getCellValue(row, col)}}</div>'
		      },
		      { name: 'Email',field: 'email', enableSorting: false,
		    	  cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
		    		  var fieldNames = _.pluck(row.entity.tag, "field");
		    		  var indexValue = _.indexOf(fieldNames, "email");
		    		  if(indexValue != -1){
		    			 return "red";
		    		 }
		    	  },
		    	  cellTemplate: '<div class="ui-grid-cell-contents" title={{row.entity.description}}> {{grid.getCellValue(row, col)}}</div>'
		      },
		      { name: 'City',field: 'city', enableSorting: false },
		      { name: 'Country',field: 'country', enableSorting: false },
		      { name: 'PostalCode',field: 'postalCode', enableSorting: false },
		      { name: 'Latitude',field: 'latitude',width:90, enableSorting: false },
		      { name: 'Longitude',field: 'longitude',width:90, enableSorting: false },
		      { name: 'CreatedTime',field: 'createdTime' }
		    ]
		  };
		  
	// To get loaded customers list	  
    $scope.tags = [];
	$scope.loadData = function(){
		var data = {
				filters : $scope.tags
		}
		
		console.log(data)
	    $http.get(hostUrl+"/getLoadedCustomers",{
	        params: data
	    })
	   
	    .then(function (response) {    	
	    	 $scope.gridOptions.data = response.data.customers;
	    });
	 };
	 
	$scope.loadData();
	
	// Read random JSON data
	$scope.readData = function(){	
		 $http.get(hostUrl+"/getRandomJsonData")
		   
		   .then(function (response) { 
			    var resDta = response.data;
			    
		    	$scope.generateData = JSON.stringify(resDta.customers, null, 2);
		    	$('#myModal').show();
		    });
	}
	
	// Upload Random JSON to db
	$scope.uploadData= function(){
		var data = $scope.generateData
		
		 $http.post(hostUrl+"/postData",data)
		   
		   .then(function (response) {  			    
			   $scope.loadData();
		    });
	}
	
	// List filters
	$scope.loadFilers = function(){
		return [
                'New',
                'Old',
                'Missed',
                'Error'
              ];
	}
	
	// On filter choosen
	$scope.filterChoosen = function(tag,type){
		if(tag && tag.text){
			console.log(tag.text)
			if(type == "add"){
				$scope.tags.push(tag.text)
			}else if(type == "remove"){
				$scope.tags.remove(tag.text)
			}
			
			$scope.loadData();
		}
	}
});

// Common function to check for http request and show loading
app.directive('pageLoading',   ['$http' ,function ($http){
    return {
        restrict: 'A',
        link: function (scope, elm, attrs)
        {
            scope.isLoading = function () {
                return $http.pendingRequests.length > 0;
            };

            scope.$watch(scope.isLoading, function (v)
            {
                if(v){
                	NProgress.start();
                }else{
                	NProgress.done();
                }
            }
            );
        }
    };

}]);

// To capitalize the first letter in a word
app.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});

// Remove value from array
Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};