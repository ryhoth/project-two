console.log("loaded");


var grand = {
  map :"",
  userLong: "",
  userLat: "",
  geocodeURL: "",
  fsQueryLimit: 20,
  fsQueryDesc: "food",
  fsCandidateToNYC: "",
  bothRestaurantEndPoint: "",
  k: 0,
  building:"",
  street: "",
  pointOnMap:function(longitude, latitude, color){
    L.mapbox.featureLayer({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [
          latitude,
          longitude
        ]
      },
      properties: {
        title: 'Restaurant',
        'marker-size': 'large',
        'marker-color': color,
        'marker-symbol': 'restaurant'
      }
    }).addTo(grand.map)
  },
  fsAction: function (fsResponse) {
    console.log("fs action worked!");
    console.log("fs response: " + fsResponse);
      /* first call to NYC with foursquare venue */
      console.log(fsResponse);

      for (var i = 0; i < 5; i++) {
        grand.pointOnMap(fsResponse.response.venues[i].location.lat, fsResponse.response.venues[i].location.lng, '#0000FF');
      }

      grand.fsCandidateToNYC = escape( fsResponse.response.venues[0].name ); //k
      console.log("This is our candidate responese: " + grand.fsCandidateToNYC);
      grand.bothRestaurantEndPoint = 'http://data.cityofnewyork.us/resource/xx67-kt59.json?'+ '&dba=' + grand.fsCandidateToNYC.replace(" ", "+");
      console.log("C: This is our beauriful NYC endPoint that has foursquare restaurant :" + grand.bothRestaurantEndPoint);
      // grand.AjaxModel(grand.checkRestaurantRating, bothRestaurantEndPoint);
      $.ajax({
        url: grand.bothRestaurantEndPoint,
        success: function(response){
          console.log("checking FS resto in the NYC Data");
          console.log("Candidate: " + grand.fsCandidateToNYC);
          console.log("data to mine if restaurant is rated A or Not: " + response);
          console.log(response[0].dba);
          console.log(response[0].grade);

          //checking if restaurant rating is non-critical + rated A
          // if ( (response[grand.k].grade === "A") && (response[grand.k].critical_flag === "Not Critical")  ) {
          //     console.log("Restaurant good! Eat at " + response[grand.k].dba);
          // } else {
          //   console.log("Critical");
          //   grand.k +=1;
          //   grand.fsAction();
          // }
        }
      });
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
  checkRestaurantRating: function(dataTEST){
    console.log("checking FS resto in the NYC Data");
    console.log("Candidate: " + fsCandidateToNYC);
    console.log("data to mine if restaurant is rated A or Not: " + dataTEST);
    console.log(dataTEST[0].dba);
    console.log(dataTEST[0].grade);
    console.log(dataTEST[0].critical_flag);
    if ( (dataTEST[0].grade === "A") && (dataTEST[0].critical_flag === "Not Critical")  ) {
        console.log("Restaurant good! Eat at " + dataTEST[0].dba);
    } else {
      console.log("Critical");
      grand.k +=1;
      grand.fsAction();
    }
  },
  geoLocateUser: function(){
    navigator.geolocation.getCurrentPosition(function(position) {
      console.log("user latitude" + position.coords.latitude);
      console.log("user longitude" + position.coords.longitude);
      grand.userLat = position.coords.latitude;
      grand.userLong = position.coords.longitude;

      L.mapbox.accessToken = ajaxInfo.mbKey;
      grand.map = L.mapbox.map('map', 'mapbox.streets').setView([grand.userLat, grand.userLong], 16);

      var geocoder = L.mapbox.geocoder('mapbox.places')

      L.mapbox.featureLayer({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [
          grand.userLong,
          grand.userLat
        ]
      },
      properties: {
        title: 'You are here',
        // description: '1718 14th St NW, Washington, DC',
        // one can customize markers by adding simplestyle properties
        // https://www.mapbox.com/guides/an-open-platform/#simplestyle
        'marker-size': 'large',
        'marker-color': '#f86767',
        'marker-symbol': 'pitch'
      }
    }).addTo(grand.map);
      var fsEndPoint = 'https://api.foursquare.com/v2/venues/search?oauth_token=' + ajaxInfo.fsKey + '&limit=' + grand.fsQueryLimit  + '&ll=' + grand.userLat + ',' + grand.userLong + '&query=' + grand.fsQueryDesc;
      grand.AjaxModel(grand.fsAction, fsEndPoint);
      console.log("B:" +fsEndPoint);
    });
  },
  NYCrestaurantEndPoint: "",
  restaurantAction: function(restaurantResponse){
    grand.geocodeURL = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + grand.building + '+' + grand.street +',+New+York,+NY&key=' + ajaxInfo.googKey;
    $.ajax({
      url: grand.geocodeURL,
      success: function(longLatFromAddresss){
        console.log("YO google geocoder"+longLatFromAddresss);
        console.log(longLatFromAddresss);
        console.log("the resto lat"+longLatFromAddresss.results[0].geometry.location.lat);
        console.log("the resto lng"+longLatFromAddresss.results[0].geometry.location.lng);
        grand.pointOnMap(longLatFromAddresss.results[0].geometry.location.lat , longLatFromAddresss.results[0].geometry.location.lng, '#9CBA7F' ); //,
        //   L.mapbox.featureLayer({
        //   type: 'Feature',
        //   geometry: {
        //     type: 'Point',
        //     coordinates: [
        //       -73.99446653627794,
        //       40.75992261131457
        //     ]
        //   },
        //   properties: {
        //     title: 'Restaurant',
        //     'marker-size': 'large',
        //     'marker-color': '#9CBA7F',
        //     'marker-symbol': 'restaurant'
        //   }
        // }).addTo(grand.map);
      }
    });
    console.log(grand.geocodeURL);

    console.log("resto action worked!");
    var context = {};
    context.resto = restaurantResponse;
    console.log(context);
    guiObj.handlebars(context, 'nycHealthHandlebars', 'display');
  },
  submit: document.getElementById('submit'),
  submitEvent: submit.addEventListener('click', function(){
    NYCrestaurantEndPoint = 'http://data.cityofnewyork.us/resource/xx67-kt59.json?';
    var yearSelected = document.getElementById('year-dropdown');
    var monthSelected = document.getElementById('month-dropdown');
    var daySelected = document.getElementById('day-dropdown');
    if ((yearSelected.value.length > 0) && (monthSelected.value.length > 0) && (daySelected.value.length > 0) ) {
      NYCrestaurantEndPoint += '$where=(inspection_date>=%27' + yearSelected.value + '-' + monthSelected.value + '-' + daySelected.value +'%27)';
    }
    var boroSelected = document.getElementById('boro-dropdown');
    if (boroSelected.value.length > 0 ){ //We could force the user to choose a borough later
      NYCrestaurantEndPoint += '&boro=' + boroSelected.value.replace(" ", "+");
    }
    if (building.value.length > 0) {
      NYCrestaurantEndPoint += '&building=' + building.value.replace(" ", "+");
      grand.building = building.value.replace(" ", "+");
    }
    if (street.value.length > 0) {
      NYCrestaurantEndPoint += '&street=' + street.value.replace(" ", "+");
      grand.street = street.value.replace(" ", "+");
    }
    if (Name.value.length > 0) {
      NYCrestaurantEndPoint += '&dba=' + escape(Name.value.replace(" ", "+"));
    }
    if (zip.value.length > 0) {
      NYCrestaurantEndPoint += '&zipcode=' + zip.value.replace(" ", "+");
    }
    var cuisineSelected = document.getElementById('cuisine-dropdown');
    if (cuisineSelected.value.length > 0) {
      NYCrestaurantEndPoint += '&cuisine_description=' + cuisineSelected.value.replace(" ", "+") + "+";
    }
    console.log("A: " + NYCrestaurantEndPoint);
    grand.AjaxModel( grand.restaurantAction , NYCrestaurantEndPoint );
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
