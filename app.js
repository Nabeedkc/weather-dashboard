var urlParam = window.location;
var urlTemp = String(urlParam);
var urlCount = urlTemp.length;
var city = 'Rocklin';
var state = 'CA';
var typedCity = '';
var charCount = 0;
var resultsList = [];



function locationGet(){
  setTimeout(requestData, 1000);
  setInterval(requestData, 600000)

  //TODO: PARSE QS AND THEN TEST IF PARAMETER IS PRESENT
  if (urlCount > 38){

    var cityParam = new RegExp("=(.*)%2C");
    var tempCity = cityParam.exec(urlParam);
    city = tempCity ? tempCity[1].replace('\+', '\_') : city;

    var stateParam = new RegExp("%2C\s?(.*)#?");
    var tempState = stateParam.exec(urlParam);
    state = tempState ? tempState[1].replace('\+', ' ') : state;
  }
  else{
        //Detect the users location and parse the city and state
        $.get("http://ipinfo.io", function (response) {
          city = response.city;
          state = response.region;
        }, "jsonp");
      }
  }
        

function requestData () {
        // This jQuery method loads JSON-encoded data from the WunderGround using a GET HTTP request.

  $.getJSON('http://api.wunderground.com/api/360e40e9b7ee6a94/conditions/q/' + state + '/' + city + '.json', function(data) {
    //Error Handling
    if(data.response.error !== undefined){
      //response.error.description
      $(".local_heading").text(data.response.error.description );
    }

    //TODO: Needs error handling for ambiguous city names, like Houston, CA.

    else{
      //swaps the rasterized .GIF to a vectorized .SVG
      var str = data.current_observation.icon_url;
      var res = str.replace('\/i\/c\/k', '\/i\/c\/v1');
      var image = res.replace('\.gif', '\.svg');
      var windString = data.current_observation.wind_string;
      var cleanWind = windString.replace('From', 'Winds from');
      var obsString = data.current_observation.observation_time;
      var cleanObs = obsString.replace('Last Updated', ' ');
      var cleanTemp = Math.round(data.current_observation.temp_f);


      //$(document).ready(function () {
        //Updates the Elements on load
      $(".local_heading").text(data.current_observation.display_location.full );
      //Temp
      $(".temp").html( '<p class="tempNum">' + cleanTemp + '°</p><p class="description">' + data.current_observation.weather +'</p><img class="pic" src="' +image + '">');
      //wind
      $(".wind").text( cleanWind + ', ' + cleanObs );
      //humidity
      $(".humid").html('<p class="humidPercent">' + data.current_observation.relative_humidity + '</p><p class="vis"> Relative Humidity</p>');
      //pressure
      $(".presTrend").text( data.current_observation.pressure_trend );
      //dewpoint
      $(".dew").text(data.current_observation.dewpoint_f + '°F Dewpoint');
      //visibility
      $(".visability").html('<p class="visNum">' + data.current_observation.visibility_mi + '</p>' + '<p class="vis">Miles Visibility</p>');

      //});

      $.getJSON('http://api.wunderground.com/api/360e40e9b7ee6a94/astronomy/q/' + state + '/' + city + '.json', function(data) {
        var hoursDay = data.moon_phase.sunset.hour - data.moon_phase.sunrise.hour;
        var minDay = (data.moon_phase.sunset.minute - data.moon_phase.sunrise.minute)/60;
        minDay = +minDay.toFixed(2);
        var totalDay = hoursDay + minDay;
        $(".rise").text(data.moon_phase.sunrise.hour + ':' + data.moon_phase.sunrise.minute + ' Sunrise');
        $(".set").text('Sunset ' + data.moon_phase.sunset.hour + ':' + data.moon_phase.sunset.minute);
        $(".day").text(totalDay + 'h');
      });
    }
  });
}

locationGet ();

//handles the search input
//TODO: Determine if this is the best way to be doing this
$('.form-control').each(function() {
  var elem = $(this);
  // Save current value of element
  elem.data('oldVal', elem.val());
  // Look for changes in the value
  elem.bind("propertychange change click keyup input paste", function(event){
    // If value has changed...
    if (elem.data('oldVal') != elem.val()) {
      // Updated stored value
      elem.data('oldVal', elem.val());

      //call the autocompleAPI function
      typedCity = String(elem.val());
      charCount = typedCity.length;

      if (charCount > 2){

        //TODO: Conver this to a native JS xhr call that inclues the setting the allow origin headers flag
        $.getJSON('ttp://autocomplete.wunderground.com/aq?query=' + typedCity + '&c=US' , function(data) {
          for (var i = 0; i < data["RESULTS"].length; i++){
            resultsList[i] = data["RESULTS"][i]["name"];
          }
          
          $('.form-control' ).autocomplete({
            source: resultsList
          });

          $( ".ui-autocomplete" ).click(function() {
            //needs a way to submit the form when the desired entry is clicked
            
            //A submit button for the form needs to be triggered here

          });
        });
      }
    }
  });
});
