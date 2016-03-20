console.log("loaded");

// google mpas api
// google search api
// mapbox api

var grand = {
  userLong: "",
  userLat: "",
  fsQueryLimit: 20,
  fsQueryDesc: "food",
  fsCandidateToNYC: "",
  // fsEndPoint: ,
  fsAction: function (fsResponse) {
    console.log("fs action worked!");
    console.log("fs response: " + fsResponse);
    fsCandidateToNYC = fsResponse.response.venues[1].name;
    console.log("This is our candidate responese: " + fsCandidateToNYC);
    var fsRestaurantEndPoint = 'http://data.cityofnewyork.us/resource/xx67-kt59.json?'+ '&dba=' + fsCandidateToNYC.replace(" ", "+");
    console.log("This is our beauriful NYC endPoint that has foursquare restaurant :" + fsRestaurantEndPoint);
    grand.AjaxModel(grand.checkRestaurantRating, fsRestaurantEndPoint);
  },
  checkRestaurantRating: function(dataTEST){
    console.log("checking FS resto in the NYC Data");
    console.log("Candidate: " + fsCandidateToNYC);
    console.log("data to mine if restaurant is rated A or Not: " + dataTEST);
    // console.log(dataTEST[0].dba);
    // console.log(dataTEST[0].grade);
    // console.log(dataTEST[0].critical_flag);
    // if ( (dataTEST[0].grade === "A") && (dataTEST[0].critical_flag === "Not Critical")  ) {
    //     console.log("Restaurant good! Eat at " + dataTEST[0].dba);
    // }
  },
  geoLocateUser: function(){
    navigator.geolocation.getCurrentPosition(function(position) {
      console.log("user latitude" + position.coords.latitude);
      console.log("user longitude" + position.coords.longitude);
      grand.userLat = position.coords.latitude;
      grand.userLong = position.coords.longitude;
      var fsEndPoint = 'https://api.foursquare.com/v2/venues/search?oauth_token=' + ajaxInfo.fsKey + '&limit=' + grand.fsQueryLimit + '&query=' + grand.fsQueryDesc + '&ll=' + grand.userLat + ',' + grand.userLong;
      grand.AjaxModel(grand.fsAction, fsEndPoint);
    });
  },
  restaurantEndPoint: "",
  restaurantAction: function(restaurantResponse){
    console.log("resto action worked!");
    var context = {};
    context.resto = restaurantResponse;
    console.log(context);
    guiObj.handlebars(context, 'nycHealthHandlebars', 'display');
  },
  AjaxModel: function(functionToCall, endPoint) {
     $.ajax({
      url: endPoint,
      success: function(response) {
        functionToCall(response);
        console.log(response);
      },
    });
  },
  submit: document.getElementById('submit'),
  submitEvent: submit.addEventListener('click', function(){
    restaurantEndPoint = 'http://data.cityofnewyork.us/resource/xx67-kt59.json?';
    var yearSelected = document.getElementById('year-dropdown');
    var monthSelected = document.getElementById('month-dropdown');
    var daySelected = document.getElementById('day-dropdown');
    if ((yearSelected.value.length > 0) && (monthSelected.value.length > 0) && (daySelected.value.length > 0) ) {
      restaurantEndPoint += '$where=(inspection_date>=%27' + yearSelected.value + '-' + monthSelected.value + '-' + daySelected.value +'%27)';
    }
    var boroSelected = document.getElementById('boro-dropdown');
    if (boroSelected.value.length > 0 ){ //We could force the user to choose a borough later
      restaurantEndPoint += '&boro=' + boroSelected.value.replace(" ", "+");
    }
    if (building.value.length > 0) {
      restaurantEndPoint += '&building=' + building.value.replace(" ", "+");
    }
    if (Name.value.length > 0) {
      restaurantEndPoint += '&dba=' + Name.value.replace(" ", "+");
    }
    if (street.value.length > 0) {
      restaurantEndPoint += '&street=' + street.value.replace(" ", "+");
    }
    if (zip.value.length > 0) {
      restaurantEndPoint += '&zipcode=' + zip.value.replace(" ", "+");
    }
    var cuisineSelected = document.getElementById('cuisine-dropdown');
    if (cuisineSelected.value.length > 0) {
      restaurantEndPoint += '&cuisine_description=' + cuisineSelected.value.replace(" ", "+") + "+";
    }
    console.log(restaurantEndPoint);
    grand.AjaxModel( grand.restaurantAction , restaurantEndPoint );
  }),
};

grand.geoLocateUser();

var guiObj = {
  createGui: function(){
    guiObj.createBoroInput();
    guiObj.createCuisineDropdown();
    guiObj.createSpecsInput();
    guiObj.createDayDropdown();
    guiObj.createMonthDropdown();
    guiObj.createYearDropdown();
  },
  handlebars: function(data, handleBarId, containerId) {
    var source = document.getElementById(handleBarId).innerHTML;
    var template = Handlebars.compile(source);
    var computedHTML = template(data);
    var elContainer = document.getElementById(containerId);
    elContainer.innerHTML = computedHTML;
  },
  inputContainerBoroCuisine: document.getElementById('inputContainerBoroCuisine'),
  inputContainerNameAddress: document.getElementById('inputContainerNameAddress'),
  inputContainerDate: document.getElementById('inputContainerDate'),
  createInputBox: function(valuePurpose){
    var el = document.createElement('input');
    el.type = "text";
    // el.value = "what?";
    el.placeholder = valuePurpose;
    el.setAttribute('id', valuePurpose);
    el.setAttribute('class', 'inputs boxes');
    valuePurpose = document.getElementById(valuePurpose);
    guiObj.inputContainerNameAddress.appendChild(el);
  },
  createSpecsInput: function(){
    for (var spec of guiObj.userSpecs) {
        guiObj.createInputBox(spec);
      }
  },
  createBoroInput: function(){
    selectVar = document.createElement('select');
    selectVar.setAttribute('id', 'boro-dropdown');
    var optionChoose = document.createElement('option');
    optionChoose.value = "";
    optionChoose.setAttribute('selected', 'disabled');
    optionChoose.innerText = "Borough";
    selectVar.appendChild(optionChoose);
    for (borough of guiObj.boros){
      var optionBoro = document.createElement('option');
      optionBoro.value = borough;
      optionBoro.innerText = borough;
      selectVar.appendChild(optionBoro);
    }
  guiObj.inputContainerBoroCuisine.appendChild(selectVar);
  },
  createCuisineDropdown: function(){
    selectVar = document.createElement('select');
    selectVar.setAttribute('id', 'cuisine-dropdown');
    var optionChoose = document.createElement('option');
    optionChoose.value = "";
    optionChoose.setAttribute('selected', 'disabled');
    optionChoose.innerText = "Cuisine";
    selectVar.appendChild(optionChoose);
    for (cuisine of guiObj.cuisines){
      var optionCuisine = document.createElement('option');
      optionCuisine.value = cuisine;
      optionCuisine.innerText = cuisine;
      selectVar.appendChild(optionCuisine);
    }
  guiObj.inputContainerBoroCuisine.appendChild(selectVar);
  },
  createMonthDropdown: function(){
    selectVar = document.createElement('select');
    selectVar.setAttribute('id', 'month-dropdown');
    var optionChoose = document.createElement('option');
    optionChoose.value = "";
    optionChoose.setAttribute('selected', 'disabled');
    optionChoose.innerText = "MM";
    selectVar.appendChild(optionChoose);
    for (var i=1; i <=12; i++){
      var option = document.createElement('option');
      if (i < 10) {
        option.value = "0"+i;
        option.innerText = "0"+i;
      } else {
      option.value = i;
      option.innerText = i;
      }
      selectVar.appendChild(option);
    }
  guiObj.inputContainerDate.appendChild(selectVar);
  },
  createDayDropdown: function(){
    selectVar = document.createElement('select');
    selectVar.setAttribute('id', 'day-dropdown');
    var optionChoose = document.createElement('option');
    optionChoose.value = "";
    optionChoose.setAttribute('selected', 'disabled');
    optionChoose.innerText = "DD";
    selectVar.appendChild(optionChoose);
    for (var i=1; i <=31; i++){
      var option = document.createElement('option');
      if (i < 10) {
        option.value = "0"+i;
        option.innerText = "0"+i;
      } else {
        option.value = i;
        option.innerText = i;
      }
      selectVar.appendChild(option);
    }
  guiObj.inputContainerDate.appendChild(selectVar);
  },
  createDropdown: function( valueInner, textInner, iInitial, iFinal , displayContainer){
    selectVar = document.createElement('select');
    selectVar.setAttribute('id', 'year-dropdown');
    var optionChoose = document.createElement('option');
    optionChoose.value = valueInner;
    optionChoose.setAttribute('selected', 'disabled');
    optionChoose.innerText = textInner;
    selectVar.appendChild(optionChoose);
    for (var i= iInitial; i <= iFinal; i++){
      var option = document.createElement('option');
      option.value = i;
      option.innerText = i;
      selectVar.appendChild(option);
    }
    displayContainer.appendChild(selectVar);
  },
  createYearDropdown: function(){
      guiObj.createDropdown("", "YYYY", 2014, 2016, guiObj.inputContainerDate);
    },
  userSpecs :["Name", "building", "street", "zip"],
  boros: ["Brooklyn", "Manhattan", "Bronx", "Queens", 'Staten Island'],
  cuisines: ["American", "Bakery", "Hamburgers",
   "Jewish/Kosher", "Delicatessen", "Irish", "Ice Cream, Gelato, Yogurt, Ices",
  "Hotdogs", "Chicken", "Chinese",
   "Sandwiches/Salads/Mixed Buffet", "Caribbean",
   "Donuts", "Bagels/Pretzels", "Continental",
  "Pizza", "Soul Food", "Italian", "Steak", "Polish",
   "Latin (Cuban, Dominican, Puerto Rican, South & Central American)",
   "German", "French", "Pizza/Italian", "Mexican",
    "Spanish", "Café/Coffee/Tea"],
};

guiObj.createGui();
