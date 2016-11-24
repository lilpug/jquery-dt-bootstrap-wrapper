# Jquery Datatables Bootstrap Wrapper

Jquery Datatables Bootstrap Wrapper is a plugin that automates the creation of a bootstrap formatted Datatable. The plugin also extends the original option set to give more functionality with very little effort required.

## Required Libraries
### Bootstrap 3
This plugin requires any version of bootstrap version 3.

### Datatables
This plugin is a wrapper for the datatables plugin which can be found here https://datatables.net/.

**Note: The bootstrap extension which comes with datatables is also required for this plugin to work.**

### Moment.js

To use any of the datetime functionality in this plugin you will require moment.js which can be found here http://momentjs.com/

## Getting Started
Download the required libraries and reference them

Download the plugin and reference the minified JS file in the dist folder


##Initialising The Plugin
**Basic functionality**

```javascript
<script>
	//Note: the settings object is the same you would be passing into datatables
	
	//Creates a datatable with the settings supplied
	$('TABLE ELEMENT HERE').datatablesWrapper("init", settings);
	
	//Gets an already existing datatable table variable passed back
	var table = $('TABLE ELEMENT HERE').datatablesWrapper("get");
	
	//Destroys an already existing datatable table
	$('TABLE ELEMENT HERE').datatablesWrapper("destroy");
</script>
```

**If you are using the state saving functionality in datatables you can clear it on first load of a table**
```javascript
<script>
	//First load to clear the state
    var table = $('TABLE ELEMENT HERE').datatablesWrapper("init", settings);
    table.state.clear();

    //Reload the main table again with the options
    $('TABLE ELEMENT HERE').datatablesWrapper("init", settings);
</script>
```

## Additional Options

Here is a list of the additional options which can be supplied along with the tradional options:-

```javascript
<script>	
	var settings = {
		//Actives the column searches
		"allowSearchColumns": true,

		
		//Tells datatables which are date columns and what format they are in "needed for sorting capability" 
		"datecolumnsformat": "YYYY DD MM HH:mm:ss",//A moment.js format string that represents the format of the date columns
		"datecolumns": [1],//Tells the plugin which columns are date formatted
		
		
		//Tells datables to show the date range searcher and what the date format is "for the searcher" as well as what column it will be searching on
		"datesearcher": true, //Activates the date range searcher
		"datesearchoncolumn": 1,//Tells the plugin which column we are using to search for using the date range
		"datesearchformat": "DD/MM/YYYY HH:mm:ss",//A moment.js format string that represents the format that the search inputs will be using
		
		
		//This creates the tick all or untick all functionality
		"tickboxes": false,

		
		//If its not any of the option it takes it literally just like datatabnles would so you can still use your own layouts if required
		//dom options:
		"dom": "defaultDateTick",//Shows the date range search and tick all and untick all in the layout
		"dom": "defaultDate",//Shows the date range search in the layout
		"dom": "defaultTick",//Shows the tick all and untick all in the layout
		"dom": "default",//Shows the generic table structure with a clear all button	
	};
</script>
```

## Example Usages

### Default Layout Usages

This is an example using state saving and column searching:-
```javascript
<script>	
	//Sets up the settings
	var settings = {
		"allowSearchColumns": true,
		"hiddencolumns": [5, 6, 7],
		"emptyTable": "No users have been found.",
		"stateSave": true,
		"dom": "default",
		"order": [[0, "asc"]]
	};

	$(document).ready(function ()
	{   
		//First load to clear the state
		var table = $('#userTable').datatablesWrapper("init", settings);
		table.state.clear();

		//Reload the main table again with the options
		$('#userTable').datatablesWrapper("init", settings);
	});
</script>
```


This is an example using column searching and a date column:-
```javascript
<script>	
	//Sets up the settings
	var settings = {
		/* Tells datatables which are date columns and what format they are in "needed for sorting capability" */
		"datecolumnsformat": "DD/MM/YYYY HH:mm:ss",
		"datecolumns": [1],

		"allowSearchColumns": true,
		"emptyTable": "No users have been found.",
		"dom": "default",
		"order": [[0, "asc"]]
	};

	$(document).ready(function ()
	{   
		$('#userTable').datatablesWrapper("init", settings);
	});
</script>
```

### Default Date Layout Usages

This is an example using column searching, a date column and a date range search facility:-
```javascript
<script>	
	//Sets up the settings
	var settings = {
		/* Tells datatables which are date columns and what format they are in "needed for sorting capability" */
		"datecolumnsformat": "DD/MM/YYYY HH:mm:ss",
		"datecolumns": [1],

		/* Tells datables to show the date range searcher and what the date format is "for the searcher" as well as what column it will be searching on */
		"datesearchformat": "DD/MM/YYYY HH:mm:ss",
		"datesearcher": true,
		"datesearchoncolumn": 1,

		"allowSearchColumns": true,
		"emptyTable": "No users have been found.",
		"dom": "defaultDate",
		"order": [[0, "asc"]]
	};

	$(document).ready(function ()
	{   
		$('#userTable').datatablesWrapper("init", settings);
	});
</script>
```

## Copyright and License
Copyright &copy; David Whitehead

You do not have to do anything special by using the MIT license and you don't have to notify anyone that your using this license. You are free to use, modify and distribute this software in normal and commercial usage as long as the copyright header is left intact (specifically the comment block which starts with /*!)