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
    var elContainer = document.getElementById(containerId);
    var computedHTML = template(data);
    elContainer.innerHTML = computedHTML;
  },
};


var grand = {
  map :"",
  userPosition: "",
  restaurantPosition: "",
  providedAddress: false,
  markerArray: [],
  pointOnMap: function(position, title, colorHex){
    var pinColor = colorHex;
    var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
        new google.maps.Size(21, 34),
        new google.maps.Point(0,0),
        new google.maps.Point(10, 34));
    var marker = new google.maps.Marker({
      position: position,
      map: grand.map,
      title: title,
      icon: pinImage
    });
    grand.markerArray.push(marker);
  },

  geoLocateUser: function(){
    navigator.geolocation.getCurrentPosition(function(position) {
      grand.userPosition = { lat: position.coords.latitude, lng: position.coords.longitude };
      grand.pointOnMap( grand.userPosition, "You are here!", "fe7569" )

    //   var fsEndPoint = 'https://api.foursquare.com/v2/venues/search?oauth_token=' + ajaxInfo.fsKey + '&limit=' + grand.fsQueryLimit  + '&ll=' + grand.userLat + ',' + grand.userLong + '&query=' + grand.fsQueryDesc;

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
            grand.pointOnMap(grand.restaurantPosition, 'Restaurant', "69f2fe")
            }
          })
        }

      grand.pointOnMap(grand.restaurantPosition, 'Restaurant')
      var context = {};
      context.resto = data;
        if ( data[0].grade == "A") {
          guiObj.handlebars(context, 'nycHealthHandlebarsA', 'display');
        } else if ( data[0].grade == "B") {
          guiObj.handlebars(context, 'nycHealthHandlebarsB', 'display');
        }else if ( data[0].grade == "C" ) {
          guiObj.handlebars(context, 'nycHealthHandlebarsC', 'display');
        } else {
          guiObj.handlebars(context, 'nycHealthHandlebarsP', 'display');
        }
      }
    })
  }
};

  grand.geoLocateUser();



  var initMap = function () {
    // Create a map object and specify the DOM element for display.

    grand.map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: (grand.userLat|| 40.730610), lng: (grand.userLong || -74)},
      scrollwheel: false,
      zoom: 12
    });
  }
// }
