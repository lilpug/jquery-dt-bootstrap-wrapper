/*!
    Title: Jquery Datatables Bootstrap Wrapper
    URL: https://github.com/lilpug/jquery-dt-bootstrap-wrapper
    Version: 1.1
    Author: David Whitehead
    Copyright (c) David Whitehead
    Copyright license: MIT
    Description: This library sits on top of the jquery datatables plugin and allows us to build the generic structures quickly           
	NOTE: This does use the bootstrap extension in jquery datatables itself            
    Requires: jquery 1.7+,jquery datatables 10.12,  bootstrap 3
*/

/*
    Extra Parameter options available

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
*/

/* 
    Example of the options
        
    var options = {
         "hiddencolumns": [0, 2],

        //Actives the column searches
        "allowSearchColumns": true,

        //Date columns parameter example:-      

         //Tells datatables which are date columns and what format they are in "needed for sorting capability" 
        "datecolumnsformat": "YYYY DD MM HH:mm:ss",//http://momentjs.com/docs/#/parsing/string-format/
        "datecolumns": [1],

        //Date search parameter example:-  

        //Tells datables to show the date range searcher and what the date format is "for the searcher" as well as what column it will be searching on
        "datesearchformat": "DD/MM/YYYY HH:mm:ss",//http://momentjs.com/docs/#/parsing/string-format/
        "datesearcher": true,
        "datesearchoncolumn": 1,


        //TickBox parameter example
        //"tickboxes": false,

        //default is false
        "statesave": true,

        //this is default value of duration
        "stateduration": 60 * 20, 

        //dom options:
        //"dom": "defaultDateTick",
        //"dom": "defaultDate",
        //"dom": "defaultTick",
        //"dom": "default",

        "dom": "defaultDate",

        "emptyTable": "no logs have been found.",
        "order": [[2, "desc"]]
		"bSort" : false, //turns off sorting and ordering

        "lengthmenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],        
        "pagingtype": "full_numbers",
    };
*/

(function ($) {

    /*---------------------------------------*/
    /* Initilisation variables and functions */
    /*---------------------------------------*/
    
    //Holds the base wrapper element name
    var baseWrapperElement = "theDatatablesBaseWrapperElement";

    //Holds the default datatables settings
    var defaults = {
        "hiddencolumns": [],
        "emptytable": "no data has been found.",
        "lengthmenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
        "pagingtype": "full_numbers",
        "order": [[0, "asc"]],
		"bSort": true,
        "statesave": false,
        "stateduration": 60 * 20,
        "dom": "default",
    };

    //The main function which gets called for the plugin
    $.fn.datatablesWrapper = function (action, options)
    {
        if (action == "get")
        {
            return GetCurrentTable(this.selector);
        }
        else if (action == "destroy")
        {
            return DestroyCurrentTable(this.selector);
        }
        else if (action == "init") {
            return CoreProcessing(this.selector, options);
        }
    };

    //This function is what starts the processing off
    function CoreProcessing(selector, options) {
        //Gets the element id of the element that its being used on
        var elementID = selector;

        //Ensures a valid element has been passed
        if (elementID != null && elementID != undefined)
        {
            //Checks if the element already exists otherwise it creates it for the first instance and creates the element
            if ($.data($(document).get(0), elementID) == undefined || $.data($(document).get(0), elementID) == null) {
                $.data($(document).get(0), elementID, {
                    index: GetIndex(),
                    castelement: elementID
                });
            }

            //Puts the element into an alias variable due to its size
            var storeElement = $.data($(document).get(0), elementID);
        
            //Gets the table ID
            var tableElement = storeElement.castelement;

            //Processes through the extra options and adds any extra data attributes required to the store element
            ExtraPluginSettings(storeElement, options, tableElement);

            //Processes the settings
            var settings = CoreSettingsProcessing(options, storeElement.index);

            //inits the datatable with all the information we have
            return DataTablesCoreInit(storeElement, tableElement, settings);
        }
    }
    

    /*--------------------*/
    /* The Core functions */
    /*--------------------*/


    //This function is the main initialised for the datatables on the specified element
    function DataTablesCoreInit(storeElement, tableElement, settings) {
        if (storeElement != undefined && $(tableElement).length > 0)
        {
            //Checks if its already initialised and if so destroys it so it can be re-initialised
            if (($.fn.DataTable.fnIsDataTable(tableElement) && DestroyCurrentTable(tableElement)) ||
                !$.fn.DataTable.fnIsDataTable(tableElement)) {
                //Just in case we have hidden the element so it does not flicker before loading
                $(tableElement).show();

                //creates the the table element with the datatable plugin
                var dt = $(tableElement).DataTable(settings);

                //Adds the extra elements
                ExtraPlugins(storeElement, tableElement, dt, settings);

                //Stores the init datatable object
                storeElement.datatable = dt;

                return dt;
            }
        }
        else {
            return null;
        }
    }
    
    //This function loads the extra plugin features on top of the datatables functionality
    function ExtraPlugins(storeElement, tableElement, datatables, settings) {
        //Adds the search each columns feature
        SearchColumns(storeElement, tableElement, datatables, settings);

        //Adds the clear all search boxes button
        ClearAllSearchButton(storeElement, datatables, settings);

        //Checks if the tickboxes have been enabled
        if (storeElement.tickboxes && storeElement.tickboxes == true) {
            //Adds the check all and uncheck all functionality to the datatables
            ClearAllCheckBoxs(storeElement, datatables);
            CheckAllCheckBoxs(storeElement, datatables);
        }

        //Checks if the date search has been enabled
        if (storeElement.datesearcher && storeElement.datesearcher == true) {
            //Adds the date search
            SearchDateRange(storeElement, datatables, settings);
        }
    }

    //* Column Search Addition */

    function SearchColumns(storeElement, tableElement, datatables, settings) {
        //Loops over the settings and grabs all the columns excluded for searching on
        var ignoreColumns = [];
        $.each(settings["columnDefs"], function (key, value) {
            ignoreColumns.push(value["targets"][0]);
        });

        //Sets up the search ID names
        var inputID = "columnSearch-" + storeElement.index;
        var counter = 0;

        //Deletes the search columns if they already exist so we can reload them
        if ($(tableElement + " .searchColumnTextDT").length > 0) {
            $(tableElement + " .searchColumnTextDT").remove();
        }

        // Setup - add a text input to each header cell
        $(tableElement + ' thead tr.search th').each(function () {
            if ($.inArray(counter, ignoreColumns) == -1) {
                //Pulls the title for the column
                var title = $(tableElement + ' thead tr.headings th').eq($(this).index()).text();

                //Ensures it pulls the value if there is one stored in the state
                var value = "";
                if (datatables.state() != undefined && datatables.state() != null && datatables.state().columns != undefined && datatables.state().columns != null) {
                    value = datatables.state().columns[counter].search.search;
                }

                //Adds an input type box to the column above
                //Note: "datatables.state().columns[counter].search.search" pulls the state saved value for that specific column search if none it will be blank
                $(this).html('<input class="form-control searchColumnTextDT" type="text"  style="width:100%;" placeholder="' + title + '" id="' + inputID + counter + '" value="' + value + '"/>');
                $(this).attr("style", "padding-left:4px; padding-right:4px;");
            }
            counter++;
        });

        //Adds the listening events to the new input search boxes
        datatables.columns().eq(0).each(function (colIdx) {
            //Ensures they are not in the ignore list
            if ($.inArray(colIdx, ignoreColumns) == -1) {
                //If an instance already exists from a refresh remove it and then add it again
                $(document).off('keyup', "#" + inputID + colIdx);

                //Add event listener to the new search column
                $(document).on('keyup', "#" + inputID + colIdx, function () {
                    datatables.column(colIdx)
					.search(this.value)
					.draw();
                });
            }
        });
    }

    /* Search all clear button Addition */
    /* Note: This feature assumes the individual search columns are within the table element */
    function ClearAllSearchButton(storeElement, datatables, settings) {
        var elementID = "clearAllButton-" + storeElement.index;

        //Adds the html for the clear all search button
        $("#clearSearch-" + storeElement.index).html("<input id='" + elementID + "' class='btn btn-primary' type='button' value='Clear All Filtering' style='float:left; margin-bottom:20px;' />");

        //Adds the clicking triggers for the clear all search button
        $(document).off("click", "#" + elementID);
        $(document).on("click", "#" + elementID, function () {
            //Wipes all the search columns
            $("#dtwrapper-" + storeElement.index + " input[type=text]").val("");

            //Sets the ordering of the columns back to the default value
            datatables.order(settings["order"]);

            //Wipes the main search column and resets the filters
            datatables
				.search('')
				.columns().search('')
				.draw();

            if (storeElement.datesearchone) {
                //If using date search it clears also			
                storeElement.datesearchone = "";
                storeElement.datesearchtwo = "";
            }
        });
    }


    //tickboxes false / true  

    function ClearAllCheckBoxs(storeElement, datatables) {
        var elementID = "clearAllCheckboxButton-" + storeElement.index;

        //Adds the html for the clear all search button
        $("#clearcheckboxes-" + storeElement.index).html("<input id='" + elementID + "' class='btn btn-primary' type='button' value='Clear All Checkboxes' style='float:left; margin-bottom:20px;' />");

        //Adds the clicking triggers for the clear all search button
        $(document).off("click", "#" + elementID);
        $(document).on("click", "#" + elementID, function () {
            datatables.$('input[type="checkbox"]').prop("checked", false);
        });
    }
    function CheckAllCheckBoxs(storeElement, datatables) {
        var elementID = "CheckAllCheckboxButton-" + storeElement.index;

        //Adds the html for the clear all search button
        $("#tickcheckboxes-" + storeElement.index).html("<input id='" + elementID + "' class='btn btn-primary' type='button' value='Tick All Checkboxes' style='float:left; margin-bottom:20px; margin-left:10px;' />");

        //Adds the clicking triggers for the clear all search button
        $(document).off("click", "#" + elementID);
        $(document).on("click", "#" + elementID, function () {
            datatables.$('input[type="checkbox"]').prop("checked", true);
        });
    }

    //datesearcher - false / true
    //datesearchone - cache value
    //datesearchtwo - cache value
    //datesearchcreate - false / true
    //datesearchoncolumn - number
    //datesearchformat - string 'moment date format string'
    //datecolumnsformat - string 'moment date format string'

    /* Search range Addition */
    /* Note: This feature works on the principle that the search range are numbers */
    function SearchDateRange(storeElement, datatables, settings)
    {
        var elementID = "searchDateRange-" + storeElement.index;

        //Sets the html up for the two date searching values
        var first = "<div class='dataTables_filter'><label>First Date: <input id='" + elementID + "One' class='form-control input-sm' type='text' value='" + storeElement.datesearchone + "' style='margin-bottom:5px;' /></label></div>";
        var second = "<div class='dataTables_filter'><label>End Date: <input id='" + elementID + "Two' class='form-control input-sm' type='text' value='" + storeElement.datesearchtwo + "' style='margin-bottom:5px;' /></label></div>";

        //Adds the html for the clear all search button
        $("#dateSearch-" + storeElement.index).html(first + second);

        //We only want this loading once as its pushing a search facility into the datatables core.
        //If we constantly reinitialize for any ajax reasons it will keep adding multiple of the same search to lookup		
        if (!storeElement.datesearchcreate || storeElement.datesearchcreate == false)
        {
            //Pushes the date range search into the datatables functions to check results for each column row for the chosen date searcher
            $.fn.dataTable.ext.search.push(function (settings, data, dataIndex)
            {               
                //This checks we can pull data out the search columns and that its in the correct format supplied 
                try
                {   
                    var dateMin = null;
                    if ($("#" + elementID + "One").val() != null && $("#" + elementID + "One").val().trim())
                    {
                        dateMin = parseInt(moment($("#" + elementID + "One").val(), storeElement.datesearchformat).format("YYYYMMDDHHmm"))
                    }

                    var dateMax = null;
                    if ($("#" + elementID + "Two").val() != null && $("#" + elementID + "Two").val().trim()) {
                        dateMax = parseInt(moment($("#" + elementID + "Two").val(), storeElement.datesearchformat).format("YYYYMMDDHHmm"));
                    }
                }
                catch(err)
                {
                    console.error("DataTables Wrapper Date Error: the search column date formats has either not been specified or does not match the actual columns.");
                }
               
                //Used to store the pulled out value we are comparing againsts
                var theSearchCol;

                //This is used to check if its in a p tag or not
                try
                {
                    //If its not in a p tag this will error and will be catched else go inside and pull the data
                    if ($(data[storeElement.datesearchoncolumn]).text())//If its wrapped in a p tag
                    {
                        theSearchCol = $(data[storeElement.datesearchoncolumn]).text();
                    }
                }
                catch(err)
                {
                    //if we are here there is no p tag only the pure data so just pull it out directly
                    theSearchCol = data[storeElement.datesearchoncolumn];
                }               

                //Checks if its possible to extract the correct values from the data supplied in the table using the specified date format provided for it
                try
                {   
                    var date = parseInt(moment(theSearchCol, storeElement.datecolumnsformat).format("YYYYMMDDHHmm"));

                    if (
                        (dateMin == null && dateMax == null) ||
					    (dateMin == null && date <= dateMax) ||
                        (dateMin <= date && dateMax == null) ||
					    (dateMin <= date && date <= dateMax)
                       )
                    {
                        return true;
                    }
                }
                catch(err)
                {
                    console.error("DataTables Wrapper Error Date: the column date format parameter has not been specified or does not match the actual column.");
                }
                
                return false;
            });

            //Marks the datesearch elements as already created
            storeElement.datesearchcreate = true;
        }

        //If the search criteria is not empty from the previous initialization then redraw with the criteria
        if (storeElement.datesearchone != "" || storeElement.datesearchtwo != "") {
            datatables.draw();//Triggers the search facility
        }

        //Triggers a datatable redraw on key changes which causes the search to be done again
        $(document).off("input change paste keyup focusout", '#' + elementID + 'One');
        $(document).on("input change paste keyup focusout", '#' + elementID + 'One', function () {
            delay(function () {
                //If state saving is on, then we cache the value
                if (settings["stateSave"]) {
                    storeElement.datesearchone = $("#" + elementID + "One").val();
                }
                datatables.draw();
            }, 1);
        });

        $(document).off("input change paste keyup focusout", '#' + elementID + 'Two');
        $(document).on("input change paste keyup focusout", '#' + elementID + 'Two', function () {
            delay(function () {
                //If state saving is on, then we cache the value
                if (settings["stateSave"]) {
                    storeElement.datesearchtwo = $("#" + elementID + "Two").val();
                }
                datatables.draw();
            }, 1);
        });
    }

    //These two function overload the standard save and load state methods for jquery datatables
    //They do the generic function but they change the storage name of the localData to something more appropriate
    function overloadStateSave(oSettings, oData) {
        localStorage.setItem('DataTables_' + window.location.pathname, JSON.stringify(oData));
    }
    function overloadStateLoad(oSettings, oData) {
        var data = localStorage.getItem('DataTables_' + window.location.pathname);
        return JSON.parse(data);
    }


    



    /*-------------------------*/
    /* Settings core functions */
    /*-------------------------*/
    
    function CoreSettingsProcessing(options, index) {
        //fills in any options that have not been supplied by default
        var settings = $.extend({}, defaults, options);

        //processing variables
        var columnDef = [];
        var emptyTable = "";
        var state = false;
        var duration = 0;
        var order;
        var lengthMenu;
        var pagingType;
        var dom;
		var bsort = false;

        //Loops over the supplied options and processes them
        $.each(settings, function (key, value) {
            key = key.toLowerCase();
            //Processes the none searchable fields
            if (key == "hiddencolumns") {
                $.each(value, function (key2, value2) {
                    columnDef.push({
                        "targets": [value2],
                        "visible": true,
                        'bSortable': false,
                        "searchable": false
                    });
                });
            }
                //Processes the searchable date fields
            else if (key == "datecolumns")
            {
                $.each(value, function (key2, value2)
                {
                    if (settings["datecolumnsformat"] != undefined)
                    {
                        columnDef.push({
                            "targets": [value2],
                            "visible": true,
                            //Note: this type is extended in the ExtraPluginSettings on oSort
                            "type": "date-search-" + settings["datecolumnsformat"].replace(/\s+/g, '-'),
                            "searchable": true
                        });
                    }
                    else
                    {
                        console.error("DataTables Wrapper Error Date Columns: You have specified date columns but not specified the 'datecolumnsformat' option.");
                    }

                });
            }
            else if (key == "statesave") {
                state = value;
            }
            else if (key == "stateduration") {
                duration = value;
            }
            else if (key == "order") {
                order = value;
            }
            else if (key == "lengthmenu") {
                lengthMenu = value;
            }
            else if (key == "pagingtype") {
                pagingType = value;
            }
            else if (key == "emptytable") {
                emptyTable = value;
            }
            else if (key == "dom") {
                dom = value;
            }
			else if (key == "bsort"){
				bsort = value;
			}
        });

        //Processes through all the setting creation
        settings = BasicSettingsCreate(columnDef, pagingType, emptyTable, lengthMenu, order, bsort);
        settings = StateSettingsMerge(settings, state, duration);
        settings = DomSettingsMerge(settings, index, dom);

        return settings;
    }

    //This function processes the extra plugin settings
    function ExtraPluginSettings(storeElement, options, tableElement)
    {
        if (options != undefined && options != null)
        {
            //Checks if the allow search column flag is active
            if (options["allowSearchColumns"] != null && options["allowSearchColumns"] == true)
            {   
                //Adds the heading class if it does not already exist
                if (!$(tableElement + ' thead tr').hasClass("headings")) {
                    $(tableElement + ' thead tr').attr("class", "headings");
                }

                //Adds the search tr if it does not exist
                if ($(tableElement + ' thead tr.search').length == 0) {
                    $(tableElement + ' thead').append('<tr class="search"></tr>');
                    $(tableElement + ' thead tr.headings th').each(function (key, value) {
                        //Copies the th and removes its content
                        //Note: this means all classes etc get copied
                        $(tableElement + ' thead tr.search').append($(value).clone().html(""));
                    });
                }                
            }

            //Checks if the tickboxes have been enabled
            if (options["tickboxes"] != undefined && options["tickboxes"] == true)
            {
                //Creates the attribute
                storeElement.tickboxes = true;
            }

            //Checks if date columns and their format have been passed
            if (options["datecolumns"] != null && options["datecolumnsformat"] != null)
            {
                //Gets the moment format variable and stores it
                storeElement.datecolumnsformat = options["datecolumnsformat"];

                //This section adds the sort extension methods to the date columns to ensure it correctly sorts givent he format
                if ($.fn.dataTable != null && $.fn.dataTable.ext != null && $.fn.dataTable.ext.oSort && storeElement.datecolumnsformat != null)
                {
                    //Defines the sorting function names for that particular moment format thats been passed
                    var functionNamePre = "date-search-" + storeElement.datecolumnsformat.replace(/\s+/g, '-') + "-pre";
                    var functionNameAsc = "date-search-" + storeElement.datecolumnsformat.replace(/\s+/g, '-') + "-asc";
                    var functionNameDesc = "date-search-" + storeElement.datecolumnsformat.replace(/\s+/g, '-') + "-desc";

                    //Used to hold the extension methods
                    var attri = {};

                    //Checks if the name already exists in the sorting, as we do not want to add duplicates
                    if (!$.fn.dataTable.ext.oSort.hasOwnProperty(functionNamePre))
                    {
                        attri[functionNamePre] = function (a) {

                            //Used to store the columns date format
                            var dateColumnFormat = storeElement.datecolumnsformat;

                            //Used to store the pulled out value we are comparing againsts
                            var theSearchCol;

                            //This is used to check if its in a p tag or not
                            var check = false;
                            try {
                                //Note: this could fail and fall into the catch when its not in any tag with no spaces
                                if ($(a).text())//If its wrapped in a p tag
                                {
                                    theSearchCol = $(a).text();
                                    check = true;
                                }
                            }
                            catch (err) {
                            }

                            //If check is not true then we know its not wrapped in any tags and to take it literally
                            if (!check) {
                                theSearchCol = a;
                            }

                            return parseInt(moment(theSearchCol, dateColumnFormat).format("YYYYMMDDHHmm"));
                        };
                    }

                    //Checks if the name already exists in the sorting, as we do not want to add duplicates
                    if (!$.fn.dataTable.ext.oSort.hasOwnProperty(functionNameAsc)) {
                        attri[functionNameAsc] = function (a, b) {
                            return ((a < b) ? -1 : ((a > b) ? 1 : 0));
                        };
                    }

                    //Checks if the name already exists in the sorting, as we do not want to add duplicates
                    if (!$.fn.dataTable.ext.oSort.hasOwnProperty(functionNameDesc)) {
                        attri[functionNameDesc] = function (a, b) {
                            return ((a < b) ? 1 : ((a > b) ? -1 : 0));
                        }
                    }

                    //Only adds the extension if we any of the three have been added as they do not currently exist
                    if (!$.fn.dataTable.ext.oSort.hasOwnProperty(functionNamePre) || !$.fn.dataTable.ext.oSort.hasOwnProperty(functionNameAsc) || !$.fn.dataTable.ext.oSort.hasOwnProperty(functionNameDesc)) {
                        $.extend($.fn.dataTable.ext.oSort, attri);
                    }
                }
            }

            //Checks if the date searcher parameters have been passed
            if (options["datesearcher"] != undefined && options["datesearchoncolumn"] != undefined && options["datecolumnsformat"] != undefined && options["datesearchformat"] != undefined && options["datesearcher"] == true)
            {
                storeElement.datesearcher = true;
                storeElement.datesearchoncolumn = options["datesearchoncolumn"];
                storeElement.datesearchformat = options["datesearchformat"];

                //If the data attribute does not exist then create it otherwise leave it alone
                if (!storeElement.datesearchcreate)
                {
                    storeElement.datesearchcreate = false;
                }

                //If there is no value yet or the state is not on we refresh
                if (!storeElement.datesearchone || ( options["statesave"] != undefined && options["statesave"] == false) )
                {
                    storeElement.datesearchone = "";
                }
                if (!storeElement.datesearchtwo || (options["statesave"] != undefined && options["statesave"] == false)) {
                    storeElement.datesearchtwo = "";
                }                
            }
        }
    }

    //This function creates the basic settings
    function BasicSettingsCreate(columnDef, pagingType, emptyTable, lengthMenu, order, sorting) {
        var settings =
        {
            /* Tells it to use the top most thead tr for the sorting arrows on the columns */
            "orderCellsTop": true,

            /*Disables the columns we do not want to use for ordering or searching but still shows them*/
            "columnDefs": columnDef,

            /*This sets the method of pagination for the plugin*/
            "pagingType": pagingType,

            /* This tells it not to use any set width as bootstrap will deal with it */
            "bAutoWidth": false,

            /*The text that is used throughout the plugin*/
            "language":
            {
                "emptyTable": emptyTable,
                "info": "Showing _START_ to _END_ of _TOTAL_ entries",
                "infoEmpty": "Showing 0 to 0 of 0 entries",
                "infoFiltered": "(filtered from _MAX_ total entries)",
                "infoPostFix": "",
                "thousands": ",",
                "lengthMenu": "Show _MENU_ entries",
                "loadingRecords": "Loading...",
                "processing": "Processing...",
                "search": "Search:",
                "zeroRecords": "No matching records found",
                "paginate":
                {
                    "first": "First",
                    "last": "Last",
                    "next": "Next",
                    "previous": "Previous"
                },
                "aria":
                {
                    "sortAscending": ": activate to sort column ascending",
                    "sortDescending": ": activate to sort column descending"
                }
            },

            /*Sets the viewable lengths*/
            "lengthMenu": lengthMenu,

            /*Sets the default order on load*/
            "order": order,
			
			/*Sets whether or not columns can be ordered and sorted*/
			"bsort": sorting,
        };
        return settings;
    }

    //This function merges the State Settings
    function StateSettingsMerge(settings, state, duration)
    {
        //Merges the state decision into the options        
        if (state)
        {
            var temp =
            {
                "stateSave": state,
                "stateDuration": duration,
                "stateSaveCallback": overloadStateSave,
                "stateLoadCallback": overloadStateLoad,
            }
            settings = $.extend({}, temp, settings);
        }
        else
        {
            var temp =
            {
                "stateSave": state,
            }
            settings = $.extend({}, temp, settings);
        }
        return settings;
    }

    //This function merges the Dom Settings
    function DomSettingsMerge(settings, index, dom)
    {
        //Note: in the template structures the index is used to ensure buttons that are created and have click events added to them etc are singular    
        if (dom == "default")//default template
        {
            var temp = {
                "dom": '<"#dtwrapper-' + index + '"<"row"<"col-sm-6"<"#clearSearch-' + index + '">><"col-sm-6"f>><"row"<"col-sm-3"l><"col-sm-9"p>>rt<"bottom"<"row"<"col-sm-12"p>>><"clear">>'
            };
            settings = $.extend({}, temp, settings);
        }
        else if (dom == "defaultBlank")
        {
            var temp = {
                "dom": '<"#dtwrapper-' + index + '"<"row"<"col-sm-3"l><"col-sm-9"p>>rt<"bottom"<"row"<"col-sm-12"p>>><"clear">>'
            };
            settings = $.extend({}, temp, settings);
        }
        else if (dom == "defaultDateTick") {
            var temp = {
                "dom": '<"#dtwrapper-' + index + '"<"row"<"col-sm-6"<"#clearSearch-' + index + '">><"col-sm-6 "<"#dateSearch-' + index + '">>><"row"<"col-sm-12"<"#clearcheckboxes-' + index + '"><"#tickcheckboxes-' + index + '">>><"row"<"col-sm-3"l><"col-sm-9"p>>rt<"bottom"<"row"<"col-sm-12"p>>><"clear">>'
            };
            settings = $.extend({}, temp, settings);
        }
        else if (dom == "defaultDate") {
            var temp = {
                "dom": '<"#dtwrapper-' + index + '"<"row"<"col-sm-6"<"#clearSearch-' + index + '">><"col-sm-6"<"#dateSearch-' + index + '">>><"row"<"col-sm-3"l><"col-sm-9"p>>rt<"bottom"<"row"<"col-sm-12"p>>><"clear">>'
            };
            settings = $.extend({}, temp, settings);
        }
        else if (dom == "defaultTick") {
            var temp = {
                "dom": '<"#dtwrapper-' + index + '"<"row"<"col-sm-6"<"#clearSearch-' + index + '">><"col-sm-6 searchbox"f>><"row"<"col-sm-12"<"#clearcheckboxes-' + index + '"><"#tickcheckboxes-' + index + '">>><"row"<"col-sm-3"l><"col-sm-9"p>>rt<"bottom"<"row"<"col-sm-12"p>>><"clear">>'
            };
            settings = $.extend({}, temp, settings);
        }
        else if (dom == "defaultTickBlank") {
            var temp = {
                "dom": '<"#dtwrapper-' + index + '"<"row"<"col-sm-12"<"#clearcheckboxes-' + index + '"><"#tickcheckboxes-' + index + '">>><"row"<"col-sm-3"l><"col-sm-9"p>>rt<"bottom"<"row"<"col-sm-12"p>>><"clear">>'
            };
            settings = $.extend({}, temp, settings);
        }
        else {
            //As this is a personalised template, we use the @s in the template to allow us to put the indexer in for the user
            var temp =
			{
			    "dom": dom.replace("@", index)
			};
            settings = $.extend({}, temp, settings);
        }
        return settings;
    }





    /*----------------------*/
    /* Basic core functions */
    /*----------------------*/

    //This functions adds a delay on a function
    var delay = (function () {
        var timer = 0;
        return function (callback, ms) {
            clearTimeout(timer);
            timer = setTimeout(callback, ms);
        };
    })();

    //This function checks if the datatable already exists and destroys it if so
    function DestroyCurrentTable(tableElement) {
        //Checks if its already initialised and if so destroys it so it can be reinitialised
        if ($.fn.DataTable.fnIsDataTable(tableElement) && $.data($(document).get(0), tableElement) != undefined) {
            var table = $.data($(document).get(0), tableElement).datatable;
            table.destroy();
            return true;
        }
        else {
            return false;
        }
    }

    //This function checks if the datatable already exists and if it does it returns it
    function GetCurrentTable(tableElement) {
        //Checks if its already initialised and if so returns it
        if ($.fn.DataTable.fnIsDataTable(tableElement) && $.data($(document).get(0), tableElement) != undefined) {
            return $.data($(document).get(0), tableElement).datatable;
        }
        else {
            return null;
        }
    }
    
    //This function gets the highest index of the stored cache elements
    function GetIndex()
    {
        var max = null;

        $.each($.data($(document).get(0)), function (key, value)
        {
            if ((max === null) || (value.index > max)) { max = value.index; }
        });

        //If there is no elements yet then return start value of zero
        if (isNaN(max) || max == null)
        {
            return 0;
        }

        return max + 1;
    }


}(jQuery));