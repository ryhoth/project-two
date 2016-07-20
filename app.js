console.log("loaded");

var date_input=$('input[name="date"]'); //our date input has the name "date"
var container=$('.bootstrap-iso form').length>0 ? $('.bootstrap-iso form').parent() : "body";
var options={
  format: 'mm/dd/yyyy',
  container: container,
  todayHighlight: true,
  autoclose: true,
};
date_input.datepicker(options);

var show = function (){
  console.log($("#date")[0].value);
  return $("#date")[0].value
}


var guiObj = {
  handlebars: function(data, handleBarId, containerId) {
    var source = document.getElementById(handleBarId).innerHTML;
    var template = Handlebars.compile(source);
    var computedHTML = template(data);
    var elContainer = document.getElementById(containerId);
    elContainer.innerHTML = computedHTML;
  },
  inputContainerBoroCuisine: document.getElementById('inputContainerBoroCuisine'),
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
  }
};


var grand = {
  map :"",
  userPosition: "",
  restaurantPosition: "",
  geocodeURL: "",
  fsQueryLimit: 20,
  fsQueryDesc: "food",
  fsCandidateToNYC: "",
  bothRestaurantEndPoint: "",
  k: 0,
  providedAddress: false,
  markerArray: [],
  pointOnMap: function(position, title){
    var marker = new google.maps.Marker({
      position: grand.userPosition,
      map: grand.map,
      title: 'You are here!'
    });
    grand.markerArray.push(marker);
  },

  geoLocateUser: function(){
    navigator.geolocation.getCurrentPosition(function(position) {
      grand.userPosition = { lat: position.coords.latitude, lng: position.coords.longitude };
      grand.pointOnMap( grand.userPosition, "You are here!" )

    //   var fsEndPoint = 'https://api.foursquare.com/v2/venues/search?oauth_token=' + ajaxInfo.fsKey + '&limit=' + grand.fsQueryLimit  + '&ll=' + grand.userLat + ',' + grand.userLong + '&query=' + grand.fsQueryDesc;
    //   grand.AjaxModel(grand.fsAction, fsEndPoint);
    });
  },

  submitEvent: document.getElementById('submit').addEventListener('click', function(){
    var NYCrestaurantEndPoint = 'http://data.cityofnewyork.us/resource/xx67-kt59.json?';
    var date = $("#date")[0].value.replace("/", "-");
    var address = $("#address")[0].value
    var name = $("#name")[0].value

      if (!name) {
        alert("Please provide a restaurant name.")
      } else {
        if ( address ) {
          grand.providedAddress = true;
           $.ajax({
            url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + escape(address) + '&key=' + ajaxInfo.googKey,
            success: function(response) {

              if (name) {
                NYCrestaurantEndPoint += '&dba=' + escape(name);
              }

              if ( date ) {
                NYCrestaurantEndPoint += '$where=(inspection_date%3E=%27' + date +'%27)';
              }

              var addressComponents = response.results[0].address_components

              console.log("Response from geocode: ", response);
                NYCrestaurantEndPoint += '&building=' + escape(addressComponents[0].long_name) +'&street=' + escape(addressComponents[1].long_name) + '&zipcode=' + escape(addressComponents[8].long_name);
                grand.restaurantPosition = {lat: response.results[0].geometry.location.lat, lng: response.results[0].geometry.location.lng};

                grand.pointOnMap(grand.restaurantPosition, 'Restaurant')

                grand.getNYCdata(NYCrestaurantEndPoint)
            }
          })

      } else {
        if (name) {
          NYCrestaurantEndPoint += '&dba=' + escape(name);
        }

        if ( date ) {
          NYCrestaurantEndPoint += '$where=(inspection_date%3E=%27' + date +'%27)';
        }

        grand.getNYCdata(NYCrestaurantEndPoint)
      }
    }

  }),

  //   grand.AjaxModel( grand.geoLocate , NYCrestaurantEndPoint );

  getNYCdata: function(NYCdb){
    $.ajax({
     url: NYCdb,
     success: function(data) {
       console.log("response from NY DB: ", data);

       if (!grand.providedAddress){
         var address = data[0].building + '&' + data[0].street + '&' + data[0].zipcode
         $.ajax({
          url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + escape(address) + '&key=' + ajaxInfo.googKey,
          success: function(response) {
            grand.restaurantPosition = {lat: response.results[0].geometry.location.lat, lng: response.results[0].geometry.location.lng};
            grand.pointOnMap(grand.restaurantPosition, 'Restaurant')
            }
          })
        }
      var context = {};
      context.resto = data;
      guiObj.handlebars(context, 'nycHealthHandlebars', 'display');
      }
    })
  },

  checkRestaurantRating: function(dataTEST){
    if ( (dataTEST[0].grade === "A") && (dataTEST[0].critical_flag === "Not Critical")  ) {
        console.log("Restaurant good! Eat at " + dataTEST[0].dba);
    } else {
      console.log("Critical");
      grand.k +=1;
      grand.fsAction();
    }
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


};

// $(document).ready(function() {
  grand.geoLocateUser();



  var initMap = function () {
    // Create a map object and specify the DOM element for display.

    grand.map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: (grand.userLat|| 40.730610), lng: (grand.userLong || -74)},
      scrollwheel: false,
      zoom: 10
    });
  }
// }
