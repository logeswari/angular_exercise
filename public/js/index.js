/**
 * http://usejsdoc.org/
 */

  

var hostUrl = "http://"+window.location.hostname+":"+window.location.port;



var app = angular.module('app', ["ngRoute",'ngTouch', 'ui.grid', 'ui.grid.pagination','ngTagsInput']);
app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "customers.html",
        controller : "listController"
    })
     .when("/home", {
        templateUrl : "home.html"
    })
    
});
app.controller('listController', function($scope, $http,filterFilter) {
	
	
  

//		  $scope.gridOptions = {
//		    paginationPageSizes: [10,25,50,100],
//		    paginationPageSize: 10,
//		    columnDefs: [
//		      { name: 'UserName' , 
//		    	  field: 'userName',
//		    	  cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
//		    		  var fieldNames = _.pluck(row.entity.tag, "field");
//		    		  var indexValue = _.indexOf(fieldNames, "userName");
//		    		 if(indexValue != -1){
//		    			 return "red";
//		    		 }
//		    	  },
//		    	  //cellTemplate: 'descriptionTemplate.html'
//		    	  cellTemplate: '<div class="ui-grid-cell-contents" title={{row.entity.description}}> {{grid.getCellValue(row, col)}}</div>'
//		      },
//		      { name: 'Type' , 
//		    	  field: 'type',
//		    	  visible: false,
//		    	  //cellTemplate: 'descriptionTemplate.html'
//		    	  cellTemplate: '<div class="ui-grid-cell-contents"  title={{row.entity.description}}> {{grid.getCellValue(row, col)}}</div>'
//		      },
//		      { name: 'Name' , field: 'name', 
//		    	  cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
//		    		  var fieldNames = _.pluck(row.entity.tag, "field");
//		    		  var indexValue = _.indexOf(fieldNames, "name");
//		    		  if(indexValue != -1){
//		    			 return "red";
//		    		 }
//		    	  },
//		    	  cellTemplate: '<div class="ui-grid-cell-contents" title={{row.entity.description}}> {{grid.getCellValue(row, col)}}</div>'
//		      },
//		      { name: 'Age' , field: 'age' ,width:60, cellClass:'age'},
//		      { name: 'PhoneNumber',field: 'phoneNumber', enableSorting: false ,
//		    	  cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
//		    		  var fieldNames = _.pluck(row.entity.tag, "field");
//		    		  var indexValue = _.indexOf(fieldNames, "phoneNumber");
//		    		  if(indexValue != -1){
//		    			 return "red";
//		    		 }
//		    	  },
//		    	  cellTemplate: '<div class="ui-grid-cell-contents" title={{row.entity.description}}> {{grid.getCellValue(row, col)}}</div>'
//		      },
//		      { name: 'Email',field: 'email', enableSorting: false,
//		    	  cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
//		    		  var fieldNames = _.pluck(row.entity.tag, "field");
//		    		  var indexValue = _.indexOf(fieldNames, "email");
//		    		  if(indexValue != -1){
//		    			 return "red";
//		    		 }
//		    	  },
//		    	  cellTemplate: '<div class="ui-grid-cell-contents" title={{row.entity.description}}> {{grid.getCellValue(row, col)}}</div>'
//		      },
//		      { name: 'City',field: 'city', enableSorting: false },
//		      { name: 'Country',field: 'country', enableSorting: false },
//		      { name: 'PostalCode',field: 'postalCode', enableSorting: false },
//		      { name: 'Latitude',field: 'latitude',width:90, enableSorting: false },
//		      { name: 'Longitude',field: 'longitude',width:90, enableSorting: false },
//		      { name: 'CreatedTime',field: 'createdTime' }
//		    ]
//		  };
		  
	// To get loaded customers list	
	$scope.applyClass = function(obj,field) {
		 var fieldNames = _.pluck(obj.tag, "field");
		  var indexValue = _.indexOf(fieldNames, field);
		  if(indexValue != -1){
			 return "red";
		 }
	}
	
    $scope.tags = [];
    
    $scope.search = {};
	$scope.userInput = {};
	
	$scope.currentPage = 0;
    $scope.pageSize = 10;
   
    
	$scope.loadData = function(from){
		
	   
		var data = {
			//	filters : $scope.tags
		}
		
		console.log(data)
	    $http.get(hostUrl+"/getLoadedCustomers",{
	        params: data
	    })
	   
	    .then(function (response) {    	
	    	 $scope.customers = response.data.customers;
	    	 $scope.numberOfPages= function(){
	    	        return Math.ceil(response.data.customers.length/$scope.pageSize);                
	    	    }
	    	 
	    	 if(from && from == 'fromUpload'){
	    		 $('#myModal').modal('hide')
	    	 }
	    });
	 };
	 
	$scope.loadData();
	
	// Read random JSON data
	$scope.readData = function(){	
		 $http.get(hostUrl+"/getRandomJsonData")
		   
		   .then(function (response) { 
			    var resDta = response.data;
			    
		    	$scope.generateData = JSON.stringify(resDta.customers, null, 2);
		    	$('#myModal').modal('show')
		    });
	}
	
	// Upload Random JSON to db
	$scope.uploadData= function(){
		var data = $scope.generateData
		
		 $http.post(hostUrl+"/postData",data)
		   
		   .then(function (response) {  			    
			   $scope.loadData('fromUpload');
			   
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
	$scope.searchedData = [];
	// On filter choosen
	$scope.filterChoosen = function(tag,type){
		if(tag && tag.text){
			console.log(tag.text)
			if(type == "add"){
				$scope[tag.text] = tag.text
			}else if(type == "remove"){
				$scope[tag.text] = null;
			}
		
			if($scope.New || $scope.Old || $scope.Missed || $scope.Error){
					$scope.search = function(product){
						if($scope.Error){
							return product.type == $scope.New || product.type == $scope.Old || product.type == $scope.Missed || product.tag != 0;
						}else{
							return product.type == $scope.New || product.type == $scope.Old || product.type == $scope.Missed
						}																	
					}
		    	}else{
		    		$scope.search = {};
		    	}
			    
			}; 
	}
	
//	$scope.$watch('search', function (newVal, oldVal) {		
//		$scope.filtered = filterFilter($scope.generateData, newVal);
//		$scope.totalItems = $scope.filtered.length;
//		$scope.numberOfPages = Math.ceil($scope.totalItems / $scope.pageSize);
//		$scope.currentPage = 0;
//	}, true);

});

app.controller('homeController',function($scope){
	
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

app.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
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